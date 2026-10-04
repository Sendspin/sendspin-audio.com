---
title: Building a server step by step
nav_title: Server step by step
description: The work of building a Sendspin server in the order you will meet it; discovery, identity, activation, encoding, timing, metadata, controller semantics, sources, availability, reconnection and multi-server etiquette.
order: 30
---

A server is where the complexity of Sendspin lives. It discovers every client, encodes a stream per client, keeps them on one timeline, and owns pairing, groups and volume. This chapter walks through that work in order, a few sentences per step with a link to the rule behind it. The user interface is in [what users expect from a server](/build/guide/server/ux/); the reasoning behind pairing is in [the trust model](/build/guide/pairing-and-encryption/).

## 1. Choose your base

If you work in Python, start from [aiosendspin](https://github.com/Sendspin/aiosendspin), the Apache 2.0 server that runs inside Music Assistant. It handles the handshake, the per-client encoders, send-ahead and pairing, and leaves you a queue, a user interface and a policy for groups. A C++ server is on the roadmap. In any other language, implement from the [specification](/build/spec/) and run the [conformance suite](/build/guide/testing/) from the first day. Whatever you build, keep a Music Assistant instance next to it as the reference to compare behavior with.

## 2. Discovery

Browse for `_sendspin._tcp` and connect to every client you find. That is the server-initiated mode, the one with defined behavior when there is more than one server. Also advertise `_sendspin-server._tcp` yourself, on port 8927 with the `path` TXT record, so client-initiated devices, scripts and test tools can reach you. Servers support both; it is clients that pick one.

The TXT `name` is a discovery-time hint, so you do not need a connection just to read a name. Connecting is fine anyway: the hello exchange completes before the client decides whether to admit you, and a connection with empty activities does not disturb a client that is playing from another server.

Spec: [Server Initiated Connections](/build/spec/#server-initiated-connections), [Client Initiated Connections](/build/spec/#client-initiated-connections).

## 3. Identity

Generate the server keypair once, from a CSPRNG. The public key is your `server_id`: it is how every client recognizes you and the name its pairing records are filed under. A new key is a new server. No paired device will recognize it, and the operator has to pair everything again. Put the private key in the backup and restore set, and carry it along when the server moves to new hardware.

Spec: [Identities](/build/spec/#identities).

## 4. Hello and activation

After the handshake, send `server/hello` with your name and the operator's `languages`. Devices use that list to pick the language in which they speak or display a pairing code, so send what the operator actually set. Read `client/hello`: roles, formats, `device_info`, whether the device admits unpaired access, and the pairing methods it offers. When a client lists a role or version you do not implement, count it. It means the client speaks a newer revision than you do and your server needs an update.

Then declare your purpose with `server/activate`: `playback` only when you will actually play on this client, `pairing` while a pairing attempt runs, and nothing otherwise. Drop an activity as soon as its purpose ends. Clients arbitrate between servers on the highest activity declared, so a `playback` that lingers after the music stopped blocks the next server from using that device.

Spec: [`server/hello`](/build/spec/#server--client-serverhello), [`client/hello`](/build/spec/#client--server-clienthello), [`server/activate`](/build/spec/#server--client-serveractivate), [Detecting Outdated Servers](/build/spec/#detecting-outdated-servers).

## 5. Formats and encoding

You must be able to serve FLAC and PCM. Opus is optional and covered by third-party patents; a commercial device that ships it owes the patent pool a per-device fee, so decide that with your licensing people. Encode separately for every client; a group may mix a microcontroller that wants 16-bit FLAC at 44.1 kHz with a desktop that takes 24-bit at 96 kHz. A client that lists a single sample rate cannot switch without a gap; resample for it. When a client changes its `format` preference while a stream is active, re-derive the stream and send a new `stream/start` if it changed.

Treat the whole queue as one continuous stream per client. Track changes do not end the stream, which is what makes gapless playback and crossfades possible. A seek or a jump to another track is a `stream/clear`, never a `stream/end`.

Spec: [player support object](/build/spec/#client--server-clienthello-playerv1-support-object), [`stream/start`](/build/spec/#server--client-streamstart), [`stream/clear`](/build/spec/#server--client-streamclear), [`stream/end`](/build/spec/#server--client-streamend).

## 6. Timing and buffers

Every chunk carries the server time at which it plays. After a `stream/start` from empty or a `stream/clear`, schedule the first chunk at least `min_buffer_ms + output_delay_ms` ahead, and extend the lead toward `required_lead_time_ms` only when that adds no latency: for a library track, yes; for a turntable, no. Chunks are 15 to 150 ms. In a group the send-ahead is the maximum over its members; recompute it on every join, leave or timing update, and when it drops, decide between lower latency (reduce) and no glitches (keep).

For buffered content, fill each player toward its `buffer_capacity`; the accounting counts header plus payload of every chunk until its completion time has passed. Debounce the timing updates clients send so one noisy device does not reschedule the group every few seconds. A late joiner gets future timestamps only, so it buffers and comes in on the beat. Take `server_transmitted` and `send_ahead` as late as you can, right before encryption; a timestamp taken when the chunk was queued poisons the client's delay measurements.

Spec: [Server Audio Send Constraints](/build/spec/#server-audio-send-constraints), [Player Buffer Accounting](/build/spec/#player-buffer-accounting), [Transmit timestamps](/build/spec/#transmit-timestamps).

## 7. Metadata, artwork and color

The moment you activate `metadata`, `controller` or `color`, send the current state. The moment an artwork stream starts, send the current image on every channel; a display that joins mid-track must not stay blank until the next song. Updates for the next track carry a future timestamp and go out no more than 20 seconds ahead.

Artwork travels in parts of at most 65519 bytes. Pace them: a large image sent back to back sits in front of the audio chunks on the same connection, and the player hears it as jitter. Palettes come with contrast rules, 4.5:1 between each background and the text that goes on it, so check before you send.

<div class="callout callout--example">
<p class="callout__title">Music Assistant does it like this</p>

Music Assistant sends the next track's metadata, artwork and colors when it queues that track into the stream, a few seconds before the audible change. That stays inside the 20-second rule and gives displays time to receive the artwork before it is due.

</div>

Spec: [`server/state`](/build/spec/#server--client-serverstate), [Scheduled metadata updates](/build/spec/#scheduled-metadata-updates), [Server rules for scheduled artwork](/build/spec/#server-rules-for-scheduled-artwork), [Scheduled color updates](/build/spec/#scheduled-color-updates).

## 8. Controller semantics

A `play` with nothing queued resumes what the group last played, and that history survives a restart of your server; a single button on a wall panel depends on it. Group volume is not "set everyone to 40": compute the delta from the current average, apply it to every player that supports volume, clamp, redistribute what clamping lost among the rest, and only then send one command per player. A player that reports a volume but does not list the `volume` command has a knob; show its level read-only. `switch` cycles the client through playing multi-client groups, then players playing alone, then its own solo group, with its previous group first if it was parked there.

Spec: [Command behaviour](/build/spec/#command-behaviour), [Switch command cycle](/build/spec/#switch-command-cycle), [controller state object](/build/spec/#server--client-serverstate-controller-object).

## 9. Sources

A source timestamps each capture in your time domain, using its time filter in reverse. Do not cut the audio at those timestamps. Estimate the source's effective sample rate from the samples that arrive, use the timestamps to anchor the stream and detect gaps, and absorb the rate deviation with asynchronous sample-rate conversion. After a network stall the timestamps may jump; the samples are what stays continuous.

Nothing streams until you send `start`, and you send `start` only once the operator has explicitly approved this device as a source. Pressing play on a speaker is implied approval for playback; it is never approval for an input. Then decide an auto-switch policy: a source with line sensing reports `signal`, and you may start the room when the needle drops.

<div class="callout callout--example">
<p class="callout__title">Music Assistant does it like this</p>

Music Assistant starts the room when an approved input reports signal and stops it when the signal goes away, and lets the user turn that off per source. The off switch matters: an input with hum on it reports signal all day, and a device that is source and player at once can start its own room every time the TV is switched on.

</div>

Spec: [Source messages](/build/spec/#source-messages), [source audio chunks](/build/spec/#client--server-source-audio-chunks-binary).

## 10. Availability and groups

When a client reports `available: false` or sends `client/leave`, remember its group as the previous group, move it to a stopped solo group of its own, end its streams and tell it with `group/update`. When it comes back, leave it there: it rejoins only through an explicit `switch` or an action in your interface. Messages cross on the way: the client keeps processing your stream messages while unavailable, so send the `stream/end` and let state settle.

Spec: [External Source Handling](/build/spec/#external-source-handling).

## 11. Reconnection

Follow the goodbye reasons. Reconnect on `restart`, and after a silent drop of a connection whose activities were empty or included `playback`, since that most likely was a restart too. Do not reconnect on `another_server`, `user_request`, `shutdown`, `unpaired` or `pairing_required`; retry later on `concurrent_attempt`. Back off exponentially when the Noise handshake fails repeatedly. A client that left for another server is not an error: show it as available and leave the reconnect to the operator or the next play command.

Spec: [`client/goodbye`](/build/spec/#client--server-clientgoodbye), [Failure Handling](/build/spec/#failure-handling).

## 12. Multi-server etiquette

Several servers in one home is the normal case. You will lose clients to the others and get them back. Never fight over one: when a client says `another_server`, stop; when it says `concurrent_attempt`, wait. Keep your activities empty while you have nothing to do, so the server that does have something to do wins the device. A client remembers which server last played on it and prefers that one among idle connections.

Spec: [Multiple servers](/build/spec/#multiple-servers-server-initiated).

## 13. Before you ship

- The identity key is in the backup and restore set, and a restore on new hardware keeps every pairing.
- Both discovery modes work: you connect to advertised clients, and client-initiated devices find you.
- The [conformance suite](/build/guide/testing/) passes.
- The states and flows in [What users expect from a server](/build/guide/server/ux/) exist in your interface.
- You have played, paired and unpaired against sendspin-cpp-cli, an [ESPHome device](/build/guide/esphome/) and [sendspin-js](https://github.com/Sendspin/sendspin-js) in a browser.
