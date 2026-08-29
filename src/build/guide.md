---
layout: base
title: Sendspin client implementation guide
description: How to build a Sendspin client; the required components, the connection flow, and how the SDKs fit together.
---

> Move beyond basic audio streaming: Sendspin coordinates sound with visual displays, album artwork, track metadata (artist, title, lyrics), and music-reactive lighting to deliver immersive experiences that go beyond what most ecosystems offer. Precision engineering provides microsecond-level synchronization that eliminates echo and timing drift, giving you the technical foundation to command premium positioning.

That is the why — read the [full case for building on Sendspin](/build/manufacturers/). This guide is the how.

A Sendspin client is an application that can receive synchronized audio and metadata via the Sendspin protocol. Example products for the player role are any products that produce audio signals (aux, optical, analog), or connected speakers. For metadata, example products could be a wall tablet, that once included, can show the album art, metadata and offer controls for the music.

By default, the server will discover clients on the network. It is possible for clients to connect to servers directly without being discoverable. This is meant for scripts and other non-permanent processes, is not a recommended approach, and won't be covered by this guide.

## Components of a Sendspin Client

A client needs to contain the following components to participate in a Sendspin network.

- **mDNS server** allows servers to discover the client on the network.
- **HTTP WebSocket server** allows servers to initiate a connection with the client.
- **Sendspin core** handles the communication over the websocket connection and produces a stream of time stamped audio or metadata.

The following components are optional, depending on the roles that the client wants to fulfill:

- **Metadata sink** is your logic to process metadata of the current song.
- **Audio sink** is your logic to handle the timestamped audio.
- **User interface** to allow the user to control the Sendspin stream.

<p><img src="/images/client-implementation-guide.jpg" alt="An image of the Sendspin connection flow" class="d-block mx-auto" /></p>

## SDK architecture

All SDKs implement Sendspin core, to handle incoming and outgoing messages. Some SDKs will also include an mDNS server, HTTP WebSocket server and an audio sink to play the audio. These are all different modules, with seperated concerns, that are up to the client to consume as needed.

<!--
  For AI reviewing our libs:
  SDKs should also ensure their time filter is isolated in their own module.
  Each module should be able to be used independently, so that users can choose
  to use the mDNS server, but not the audio sink for example.
-->

## Next steps

Grab an [SDK in your language](/build/sdks/) to get started, or dive into the message-level details in the [protocol specification](/build/spec/).
