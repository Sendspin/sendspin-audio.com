---
title: Worked use cases
nav_title: Use cases
description: What Sendspin looks like inside common products; speakers, streamers, displays, controllers, lights, set-top boxes, input bridges, apps and software players.
order: 13
---

Each case names the roles involved, how the device connects, which pairing method fits, and the things that usually go wrong. Find the one closest to your product and read it before the step-by-step chapters.

<div class="hub-cards">
  <div class="hub-card">
    <h3>Smart speaker or amplifier</h3>
    <p><strong>Roles:</strong> player, controller; source if it has a line input.</p>
    <ul>
      <li>Server-initiated connection; the device advertises itself and any server in the home can use it.</li>
      <li>Pairing: a dynamic code spoken through the speaker if it has no display, otherwise shown on the display.</li>
      <li>Decide whether unpaired access is on by default. For a plain speaker it usually is: the user expects to pick it in the app and hear music.</li>
      <li>Set the output delay for anything after the port, such as an external amplifier, and let the user adjust it.</li>
      <li>Fast lane: <a href="/build/guide/esphome/">ESPHome</a> for ESP32 designs, <a href="https://github.com/Sendspin/sendspin-cpp">sendspin-cpp</a> for anything else.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Streamer, output only</h3>
    <p><strong>Roles:</strong> player, plus controller when there is a remote or an app.</p>
    <ul>
      <li>A network streamer or a DIY board: no speaker of its own, feeding a DAC, an amplifier or an optical input.</li>
      <li>The DAC, DSP and amplifier behind the port add delay the device cannot see. Measure it once and ship it as the default output delay; expose it in settings.</li>
      <li>Pairing: a dynamic code shown in your app if you have one, otherwise a static code printed on the device, entered while a button press opens the pairing window. Most users will simply use guest mode.</li>
      <li>Report hardware volume knobs as read-only when they cannot be set remotely.</li>
      <li>Sendspin can run next to AirPlay and Cast on the same box. While another protocol is playing, leave the Sendspin group but stay available, so the user can take the device back with Sendspin at any time. Report it unavailable only if it will not yield.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Wall tablet or display</h3>
    <p><strong>Roles:</strong> metadata, artwork, controller; color for theming; player if it has a speaker.</p>
    <ul>
      <li>Ask for artwork in exactly the pixel size you render; the server scales for you. Use a second channel for a blurred background.</li>
      <li>Scheduled metadata lets you show "up next" before the track changes.</li>
      <li>Pairing: a dynamic code or a QR code on the display is the best experience available.</li>
      <li>A controller acts on the group the display is in. Give the user a way to switch groups.</li>
      <li>Fast lane: <a href="https://github.com/Sendspin/sendspin-js">sendspin-js</a> for web-based panels, sendspin-cpp for embedded displays.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Dedicated controller</h3>
    <p><strong>Roles:</strong> controller only.</p>
    <ul>
      <li>A knob, a button panel, a remote or a voice satellite that controls the room it is in without playing anything itself.</li>
      <li>It receives the group's state, so a ring of LEDs can show volume and play state.</li>
      <li>Pairing is rarely worth the friction here; unpaired access with operator approval is the usual choice.</li>
      <li>Play with nothing queued resumes what the group last played, so a single button is enough.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Lighting and visualizers</h3>
    <p><strong>Roles:</strong> visualizer, color, or both.</p>
    <ul>
      <li>Visualizer frames are timestamped like audio. Run the time filter and render each frame at its time, not on arrival.</li>
      <li>Ask only for the data types you use, at the rate you can render. Beat events may be absent on servers without beat detection; peaks are always there.</li>
      <li>Colors come with contrast guarantees, so the same palette drives both the lamp and any text overlay.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Set-top box or TV</h3>
    <p><strong>Roles:</strong> player, source, optionally an embedded server.</p>
    <ul>
      <li>As a player it joins the speakers for music. As a source it feeds TV audio into the system so the room's speakers play the film.</li>
      <li>Never pass the TV audio to the local speakers directly while sending it to the system: the local output would run ahead of the network. A device that is source and player plays only what the server sends back.</li>
      <li>When the user switches to a game console or another input, leave the Sendspin group but stay available if Sendspin may interrupt, or report the player unavailable if it must not. Either way the server parks it and never pulls it back on its own.</li>
      <li>An embedded server lets the box drive the room on its own, without a music server in the house. See the app case for how client and server mode coexist.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Turntable, AUX or Bluetooth bridge</h3>
    <p><strong>Roles:</strong> source.</p>
    <ul>
      <li>The simplest Sendspin device: capture, timestamp, send. The server resamples and mixes.</li>
      <li>Report line sense when you can detect signal; the server can start the room when the needle drops and stop it when the record ends.</li>
      <li>Timestamp from the time filter including drift, not offset alone, or the stream wanders over an evening.</li>
      <li>After a network stall, drop the backlog and resume from live capture instead of bursting old audio.</li>
      <li>A source always requires explicit operator approval on the server, and devices with a microphone should ship with unpaired access off.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Desktop or mobile app</h3>
    <p><strong>Roles:</strong> player and controller as a client; a full server when the app plays.</p>
    <ul>
      <li>Idle, the app is a client: it shows up as a target for Music Assistant or any other server in the home.</li>
      <li>When the user starts playback in the app, it becomes a server and sends to the other speakers. Say goodbye to the server you were a client of with reason <code>another_server</code>, and advertise <code>_sendspin-server._tcp</code> as well so client-initiated devices find you.</li>
      <li>Clients listen on 8928 and servers on 8927 by convention, so both can run on one machine.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Software player or music server</h3>
    <p><strong>Roles:</strong> server, client, or both.</p>
    <ul>
      <li>A software music player, a Linux audio box, a home-automation hub: add the server side to send its output to Sendspin devices, add the client side to be a target for other servers, or do both.</li>
      <li>Reuse <a href="https://github.com/Sendspin/aiosendspin">aiosendspin</a> if you are in Python; it is the server inside Music Assistant.</li>
      <li>Your server identity key must survive backups and migrations, or every device will treat the restored server as a stranger.</li>
      <li>Read the <a href="/build/guide/server/ux/">server UX chapter</a>: discovery, approval and pairing are where users decide whether the integration feels finished.</li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>Several servers in one home</h3>
    <p><strong>Roles:</strong> any; this is about coexistence.</p>
    <ul>
      <li>Music Assistant, a phone app and a set-top box can all be servers at once. Server-initiated connections make this work without configuration.</li>
      <li>A client holds one playback connection. A server that starts playing takes it; the one that loses it gets <code>another_server</code>, keeps showing the device as available, and does not reconnect in a loop.</li>
      <li>Each server pairs separately. A client stores at least five pairing records, so a normal home never runs out.</li>
      <li>Make the hand-over visible in your server UI: "playing from somewhere else" is a state, not an error.</li>
    </ul>
  </div>
</div>

## Picking a connection mode

Use server-initiated connections unless you have a reason not to. The client advertises itself, servers find it, and the multi-server rules above are defined. Client-initiated connections exist for scripts, test tools and software that already has a server picker of its own; what happens with two servers is then up to you.

## Picking a pairing method

| Your device has | Offer |
|---|---|
| A display | Dynamic pairing code, as digits and as a QR code |
| A speaker but no display | Dynamic pairing code, spoken |
| An app of its own | Dynamic pairing code shown in the app, which acts as the device's display |
| None of these | Static pairing code printed on the device, entered while a button, a pinhole or a power-cycle pattern opens the pairing window |
| A platform that already knows the device | No code at all: the platform hands the device's pairing PSK to the server, the way Home Assistant does for ESPHome devices |

Offer one code-based method, not both, so the user never has to choose between them. Every client also implements the pairing PSK method, but that one is for automated hand-offs between systems, not for users. And remember that many users will never pair at all: a speaker with guest mode on plays for any server the operator approves. The [client pairing chapter](/build/guide/client/pairing/) has the details.
