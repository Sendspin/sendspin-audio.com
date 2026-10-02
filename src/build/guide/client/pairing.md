---
title: Pairing on the device
nav_title: Pairing
description: How a client offers pairing; choosing the method for your hardware, speaking or showing the code, unpaired access defaults, pairing records, rounds and cooldowns, the pairing window, and what to build so a test lab is satisfied.
order: 21
---

Pairing is the one-time step that turns an unpaired connection into one where both sides know exactly who the other is. It is optional for playback: a speaker can admit [unpaired access](#unpaired-access-is-your-default-to-choose) and play music for any server the operator approves. It is required before a server will activate the source role on an unauthenticated device, and it is what lets a server trust your device after the setup phase. This chapter covers the client side; the [trust model](/build/guide/pairing-and-encryption/) explains why it is built this way, and the [server UX chapter](/build/guide/server/ux/) covers what the operator sees.

## Choose the method for your hardware

Every client implements the pairing PSK method. On top of that you offer exactly one code-based method, chosen by what the device can show or say.

| Your device has | Offer |
|---|---|
| A display | Dynamic pairing code, as digits and as a QR code |
| A speaker but no display | Dynamic pairing code, spoken |
| Neither, but a button | Static pairing code on a label, behind a pairing window |
| Neither and no button | Pairing token on a label as a QR code |
| A vendor app | Pairing token shown in the app, also for devices that gained Sendspin in a firmware update after shipping |

Never list both code methods. The server would have to ask the operator which one to use, and the operator has no way to know.

Spec: [Methods](/build/spec/#methods), [pair-method descriptor](/build/spec/#client--server-clienthello-pair-method-descriptor).

## Showing and speaking the code

A dynamic code is six digits, presented as `123-456`. A static code is eight, presented as `1234-5678`. The hyphen is presentation only. A QR code carries the pairing token as plain text, with no URI scheme, so a scan and a paste give the server identical input.

A speaking device bundles its own digit audio. The project does not ship or host voice packs today, though it may host packs if there is demand. Pick the language from the `languages` hint in `server/hello` using RFC 4647 lookup, and fall back to your own default when nothing matches. Leave a short gap between digits and a longer one between the two groups of three. The code does not change between rounds, so speak it again at the start of every round; the operator may have missed it the first time.

Spec: [Pairing Code Presentation](/build/spec/#pairing-code-presentation), [Pairing Token](/build/spec/#pairing-token), [Dynamic Pairing Code Flow](/build/spec/#dynamic-pairing-code-flow).

## Unpaired access is your default to choose

Whether the device ships with unpaired access on is the manufacturer's call. Speakers usually ship with it on, because the user expects to pick the device in an app and hear music. Microphones and other privacy-sensitive inputs ship with it off. The source role always needs explicit server-side approval, regardless of your setting. Changing the setting is a local action on the device or in your app, never something a server can do. After the user enables it, send `client/goodbye` with reason `restart` on any existing unpaired connection so the next `client/hello` advertises the new value.

Spec: [Unpaired Access](/build/spec/#unpaired-access).

## Pairing records

Store at least five records, each a long-term PSK with the server's `server_id`. When the sixth pairing arrives, evict the least recently used record that is not backing an open connection. Nothing needs to be told: the evicted server's next handshake references a PSK you no longer hold, lands in the Sentinel fallback, and the server can offer its operator to pair again.

Spec: [Pairing Records](/build/spec/#pairing-records), [Sentinel Fallback](/build/spec/#sentinel-fallback).

## Pairing runs alongside playback

A pairing `server/activate` does not touch your roles, streams or group. Suspend only the out-channel: mute the speaker while you speak the code, or take over the display while you show it. The stream keeps running and its timeline is untouched, so discard the audio scheduled during the attempt and resume in sync when it ends. Bound every attempt with a timeout of about two minutes from its first message and abort with `attempt_timeout` when it expires.

Spec: [Entering and leaving pairing](/build/spec/#entering-and-leaving-pairing).

## Rounds, cooldown and the operator action

In the dynamic flow an attempt runs rounds against the same code until the server's key confirmation verifies. After 20 consecutive failed rounds you must stop retrying and hold attempts back until a deliberate operator action on the device, which also resets the count. You may hold attempts back earlier, with a cooldown, and you should.

<div class="callout callout--warn">
<p class="callout__title">The too lean cooldown</p>

A product ships permissive: playback is open to any approved server and pairing is a convenience. Two years later a firmware update adds a role with higher security needs, say a microphone, and gates it behind pairing. By then an attacker who brute-forced a code has a pairing record that is indistinguishable from a legitimate one, and only a factory reset restores security. If the only thing between an attacker and the next 20 rounds is an action they can induce, brute-forcing a six-digit code takes about a day. With a cooldown that grows after a few failures it takes decades. Build the cooldown in from the start.

</div>

The operator action must be deliberate for that product. A power cycle counts on a hardwired, stationary device nobody unplugs by accident. It does not count on a device on a switched outlet or a portable, battery-powered one, because those get power-cycled all the time and a smart plug can do it remotely. Use a power-cycle pattern, a long press or the device UI instead. While an attempt is held back, say so in `client/pair-pending` with a short human message, in a language from the server's hint, so the server can tell the operator what to do.

Spec: [Rounds](/build/spec/#rounds), [`client/pair-pending`](/build/spec/#client--server-clientpair-pending).

## Static code and the pairing window

A static code is a random eight-digit value per device, never a shared default, printed on a label. Every attempt waits for a pairing window, opened by a deliberate gesture: a button, a pinhole, a button combination or a power-cycle pattern. The window lasts about five minutes and closes early after five failed attempts or a completed pairing. Signal `client/pair-pending` while you wait for the gesture and `client/pair-init` once the window is open.

Do not light a permanent "locked" LED when the window closes on failures. Make the lockout quiet and recoverable: the next gesture opens a new window.

Spec: [Static Pairing Code Flow](/build/spec/#static-pairing-code-flow), [Pairing Window](/build/spec/#pairing-window).

## When an attempt ends

A server may abort at any point with `pair/abort` reason `user_cancelled` before it leaves pairing. Show the user why the attempt ended, whether they cancelled it on the server, the code was wrong or it timed out, and return the out-channel to normal use. A cancelled attempt does not count against the pairing window and counts toward the round limit only when the code was already being emitted.

Spec: [`pair/abort`](/build/spec/#client--server-pairabort).

## Security and regulatory notes

Unpaired and static-code sessions are exposed to a man in the middle during setup only. Once pairing completes, every later connection is authenticated by the long-term PSK and the Noise handshake. The round limit and the gesture gating give a test lab a specification section to point at for ETSI EN 303 645 provision 5.1-5 and EN 18031-1 AUM-6; cite [Rounds](/build/spec/#rounds) and [Pairing Window](/build/spec/#pairing-window) in your compliance file.

Spec: [Unpaired Access](/build/spec/#unpaired-access), [Encryption](/build/spec/#encryption).

<div class="callout callout--example">
<p class="callout__title">sendspin-cpp does it like this</p>

You declare `pairing_code_out_channels` and `pairing_code_formats`, and implement `on_display_pairing_code` and `on_clear_pairing_code` to drive your display or speaker. For the static flow you set `static_pairing_code` and `pairing_window_supported`, receive `on_open_pairing_window` when the server asks, and call `confirm_pairing_window` when the user makes the gesture. A factory-provisioned PSK goes in `pairing_psk`, and the library produces the `SP:` pairing token for your label or app. The round counter and cooldown state go through your persistence provider.

</div>
