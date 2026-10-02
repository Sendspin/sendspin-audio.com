---
title: What users expect from a server
nav_title: Server UX
description: The user journey a Sendspin server has to support; discovering devices, approving or pairing them, playing, and keeping them working, with the interface states to design.
order: 31
---

The protocol says what goes over the wire. Most of what a user notices is what the server shows around it: the device list, the approve button, the code entry, the warning when something is wrong. This chapter follows the user from the moment a new device appears to the day it is replaced, and names the rule behind each screen. The device side of the same flows is in [client pairing](/build/guide/client/pairing/); the reasoning behind them is in [the trust model](/build/guide/pairing-and-encryption/).

## Discover: the device list

Show every discovered client under the name from its `client/hello`, with the manufacturer and model from `device_info` next to it, so "Kitchen" is recognizably the speaker and not the wall tablet. Three states must look different: paired, approved for unpaired access, and unknown (neither). This is a rule, not a taste. A new client that claims a familiar name must never pass for the existing device. If a second "Kitchen" shows up among the unknown devices, the operator sees the difference; if the two look the same, an attacker wins by naming a laptop after a speaker.

A device that another server is playing on is a fourth state, not an error. Your connection to it ended with `another_server` or was refused with `concurrent_attempt`; show it as available, say where it went if you know, and let the next play command take it back.

Spec: [Unpaired Access](/build/spec/#unpaired-access), [`client/goodbye`](/build/spec/#client--server-clientgoodbye).

## Approve or pair

### Approval for unpaired access

A device that admits unpaired access will play for any server its operator approves. Give approval a dedicated control, "Allow this device" or similar, on the device's row. For playback roles you may also take an action that clearly means "use this device", such as pressing play on it, as implied approval; pressing play on a speaker you just unboxed and hearing music is the experience people know from casting. Never imply approval for the source role: an input is approved only through the explicit control. Approval persists across restarts, the operator can revoke it, and it is discarded when the device pairs, because pairing supersedes it.

Spec: [Unpaired Access](/build/spec/#unpaired-access), [Source messages](/build/spec/#source-messages).

### Pairing as an action

Offer pairing as a clearly visible action for every unknown client, and keep it available as an upgrade for approved ones. The device's `client/hello` tells you which methods it offers and where its secret lives: printed on the device, on a leaflet in the box, or shown by the device's own app. Every device offers the pairing token; when it also offers a code method, let the operator choose between "enter the code the device shows" and "scan or paste the pairing token", because which one is convenient depends on where they are standing. A conformant device lists at most one code method; if you ever see both, prefer the dynamic code. Select the `qr_code` format only when your interface can actually scan a QR code. A desktop app without a camera asks for digits.

For the token, accept paste and scan alike and decode leniently: trim whitespace, uppercase, accept it with or without the `SP:` prefix, and read `9` as `2`, since the token alphabet substitutes one for the other. Before starting, check that the client key inside the token is the `client_id` of the connection. A token for a different device deserves a clear message, not a failed handshake.

Spec: [pair-method descriptor](/build/spec/#client--server-clienthello-pair-method-descriptor), [Pairing Token](/build/spec/#pairing-token), [Pairing PSK Flow](/build/spec/#pairing-psk-flow).

### Entering a code

Show one slot per digit, grouped the way the device groups them: `123-456` for a dynamic code, `1234-5678` for a static one. The grouping makes the expected length obvious; strip hyphens and spaces from whatever is typed or pasted. For a device that speaks its code, add a step before you start the attempt: "Press continue and the speaker will read out a six-digit code." The device speaks the code as soon as the first round begins, and an operator who was still looking at the phone has to ask for another round, of which the device allows at most twenty before it insists on a button press.

A wrong code is not the end. In the dynamic flow the device asks for another round and shows or speaks the same code again; in the static flow the attempt fails and you start a new one, within the five the device's pairing window allows. Say "that code did not match" and put the cursor back in the first slot. While the device holds an attempt back, it sends `client/pair-pending`, sometimes with a `message` such as "Press the pairing button on the back". Show that message verbatim, as plain text attributed to the device, never as markup or a link, because it comes from a peer you have not authenticated yet. Apply your own timeout while you wait; a device that never comes back must not leave a spinner forever. A cancel button sends `pair/abort` with reason `user_cancelled`, followed by an activation that leaves pairing, so the device can show why the attempt ended.

Spec: [Pairing Code Presentation](/build/spec/#pairing-code-presentation), [Rounds](/build/spec/#rounds), [Pairing Window](/build/spec/#pairing-window), [`client/pair-pending`](/build/spec/#client--server-clientpair-pending), [`pair/abort`](/build/spec/#client--server-pairabort), [Entering and leaving pairing](/build/spec/#entering-and-leaving-pairing).

<div class="callout callout--example">
<p class="callout__title">Music Assistant does it like this</p>

Pairing starts from the player picker: an unknown speaker shows a pair action next to its name, the operator picks the method the device offers, and the code entry opens with one slot per digit.

<figure>
<video controls preload="metadata" poster="/images/video-poster.svg" src="/videos/ma-pairing.mp4"></video>
<figcaption>Music Assistant: pairing a speaker with a pairing code. Recorded automatically from the end-to-end tests.</figcaption>
</figure>

The recording comes from the [Music Assistant end-to-end tests](https://github.com/Sendspin/ma-pairing-e2e) and is regenerated on every run, so it shows the current release rather than a screenshot from last year.

</div>

### After pairing

Once both sides have persisted the record, you re-handshake the live connection to the new key. Nothing closes and a running stream keeps running. Show the device as paired from then on. Offer unpair on the device's page: `server/unpair` makes both sides forget the record, the device says goodbye with reason `unpaired`, and it is an unknown device again until someone approves or pairs it.

Spec: [Re-handshake](/build/spec/#re-handshake), [`server/unpair`](/build/spec/#server--client-serverunpair).

### Credential mismatch

A device you paired may stop recognizing you: it was factory reset, it evicted your record to make room for another server, or a pairing was interrupted between the two finalize messages. The handshake then falls back to the Sentinel key and tells you, authenticated, that the device could not use your credential. Do not quietly continue as an unpaired session. The specification forbids playing on the device while your record exists, and a silent fallback is exactly what a man in the middle would want. Show a warning on the device, "This device no longer recognizes this server", name the likely causes, and offer re-pairing, which replaces the record.

Spec: [Sentinel Fallback](/build/spec/#sentinel-fallback), [Pairing Records](/build/spec/#pairing-records).

## Play

Renaming a device, moving it between groups and changing its volume must never interrupt playback. The temptation is to reconnect after a settings change; resist it. A reconnect resets the device's clock filter, and the device comes back late and out of sync for the seconds the filter takes to converge. Groups are a server-side concept, so a regroup is a `group/update` and a new stream, not a new connection.

Send the operator's languages in `server/hello`. A speaker that reads out a pairing code or a display that shows a pending message picks its language from that list, and an operator who set Catalan should not hear English digits.

Sources get their own flow: a separate, explicit approval, a clear way to start and stop streaming an input, and a visible indicator while it streams. Respect privacy inputs. A microphone device ships with unpaired access off, so it will not be approvable until paired, and your interface should say so rather than look broken.

Spec: [`server/hello`](/build/spec/#server--client-serverhello), [Source messages](/build/spec/#source-messages).

<div class="callout callout--example">
<p class="callout__title">Music Assistant does it like this</p>

On first run, Music Assistant lists the Sendspin devices it found, lets the user approve or pair each one, and plays on the first approved speaker straight away.

<figure>
<video controls preload="metadata" poster="/images/video-poster.svg" src="/videos/ma-onboarding.mp4"></video>
<figcaption>Music Assistant: first-run onboarding, from an empty device list to music playing. Recorded automatically from the end-to-end tests.</figcaption>
</figure>

Like the pairing recording, this one is produced by the [end-to-end tests](https://github.com/Sendspin/ma-pairing-e2e) on every run.

</div>

## Maintain

A device that reports itself unavailable, because the TV switched to HDMI or another protocol took the output, is parked in a stopped group of its own. Show that as "in use elsewhere" rather than offline, and do not pull it back into its group when it returns; the user does that with a switch command or in your interface. A device that went to another server is "playing from another server", also not offline. Offline is for a device you cannot reach at all.

Keep the paired, approved and unknown states visible in settings too, with unpair and revoke next to them, so an operator who sells a speaker can forget it in one place.

Spec: [External Source Handling](/build/spec/#external-source-handling).

## States to design

- Unknown device: discovered, neither paired nor approved, with approve and pair actions.
- Approved device: plays for you unpaired, with pair as an upgrade and revoke available.
- Paired device: with unpair available.
- Pairing in progress: code entry; waiting for the device; wrong code, try again; device holding back, with its message shown.
- Credential mismatch: warning and re-pair action.
- Playing from another server.
- In use elsewhere (unavailable), parked in its own group.
- Offline.
