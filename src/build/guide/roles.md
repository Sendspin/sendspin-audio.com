---
title: Roles and the products they make
nav_title: Roles
description: The seven Sendspin roles, which products use them, what each one needs from the hardware, and how they combine.
order: 12
---

A role is a capability a client offers. The client lists the roles it supports in its hello message, the server activates the ones it wants, and from then on each role has its own messages and, where needed, its own binary stream. Servers implement every role, so your choice of roles is purely a product decision.

## The seven roles

| Role | What it does | What the device needs | Typical products |
|---|---|---|---|
| `player` | Receives timestamped audio and plays it in sync. Owns its volume, mute and output delay. | An audio output, a decoder for FLAC or PCM (Opus optional), a clock, a few hundred kilobytes of buffer. | Speakers, amplifiers, streamers, soundbars, set-top boxes, desktop and mobile apps. |
| `source` | Captures a local input and streams it to the server, which distributes it. | An audio input. The server does the resampling and mixing. | Turntable and AUX bridges, Bluetooth receivers, TVs and set-top boxes forwarding their audio, microphones. |
| `controller` | Sends play, pause, next, volume, mute, repeat, shuffle, seek and switch for its group, and receives the group's state. | A way for the user to act: buttons, a knob, a touchscreen, a voice assistant. | Remotes, wall panels, knobs, any player with buttons on it. |
| `metadata` | Receives title, artist, album, progress and the like, including updates scheduled for the next track. | Something to show text on. | Wall tablets, displays on speakers, car head units, companion apps. |
| `artwork` | Receives images in exactly the size and format it asks for, on up to four channels. | A screen and a JPEG or PNG decoder. | Displays, speakers with a screen, e-ink frames. |
| `visualizer` | Receives loudness, beat, spectrum and peak events timed to the audio. | Lights or a screen, and the time filter. | Light strips, LED matrices, lamps, visualizer screens. |
| `color` | Receives a small palette derived from the artwork or the music, with guaranteed contrast. | Anything that can show a colour. | Ambient lighting, UI theming on displays. |

Spec: [Role Versioning](/build/spec/#role-versioning), and one section per role from [Player messages](/build/spec/#player-messages) onwards.

## How they combine

Most real products use more than one role.

- **Speaker or amplifier:** `player` plus `controller`, so the buttons on the device act on the group it is in. Add `source` if it has a line input.
- **Streamer (output only):** `player` alone, or `player` plus `controller` when it has a remote or an app.
- **Display:** `metadata` plus `artwork` plus `controller`. Add `color` to theme the interface after the album art, and `player` if the display has a speaker.
- **Lighting:** `visualizer` for music-reactive effects, `color` for ambient colour, or both.
- **Dedicated controller:** `controller` alone. A knob, a button panel or a voice satellite that only needs to control the room it is in.
- **Input bridge:** `source` alone, for a turntable, a mixer or a Bluetooth receiver that feeds audio in.

<div class="callout callout--note">
<p class="callout__title">One client per audio output</p>

A device with several independent outputs, say a two-zone amplifier, should present itself as one client per output. Each client gets its own identity, group, volume and timing parameters, and the two time filters run off the same host clock, so the device can even sum two streams onto one physical output if it wants to.

</div>

## Things every role shares

Whatever roles you pick, the client needs the same foundation: a stable identity, the Noise handshake, the time filter, the hello and activate exchange, and the ability to report whether it is available. The [client chapter](/build/guide/client/) walks through that foundation once; the roles sit on top of it.

Roles are activated and deactivated by the server over the life of a connection. A client keeps per-role state only while the role is active and starts clean when it is activated again.

## Roles that do not exist yet

The specification deliberately leaves out things that are better done by the server or that are not ready. Announcements and chimes, lyrics, playlists and native source selection have all been discussed and may arrive as new roles. A new role never breaks existing clients, because clients only see the roles they asked for. If you need something now, prototype it as a `_vendorname_` role and bring the experience to the [spec repository](https://github.com/Sendspin/spec/issues); see [contributing](/build/guide/contributing/).
