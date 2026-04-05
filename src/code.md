---
layout: base
title: Code
description: SDKs, libraries, and code samples for Sendspin.
---

This page contains software development kits (SDK), libraries, and code samples to help you get started using Sendspin in your projects.

- **C#/.NET** - [Sendspin.SDK](https://github.com/Sendspin/sendspin-dotnet) -
  [Nuget Package](https://www.nuget.org/packages/Sendspin.SDK)
  - Used by [windowsSpin](https://github.com/chrisuthe/windowsSpin)

- **C++** - [sendspin-cpp](https://github.com/Sendspin/sendspin-cpp)
  - Used by [ESPHome](https://github.com/esphome/esphome/pull/14933)

- **Go** - [sendspin-go](https://github.com/Sendspin/sendspin-go)
- **JavaScript** - [sendspin-js](https://github.com/Sendspin/sendspin-js)
  - Used by Music Assistant's web interface, [Google Cast receiver for Sendspin](https://github.com/Sendspin/cast), [sendspin-audio.com](https://github.com/Sendspin/sendspin-audio.com), and the [live demo](/#live-demo)

- **Python** - [aiosendspin](https://github.com/Sendspin/aiosendspin)
  - Used by [Music Assistant](https://www.music-assistant.io), [sendspin-cli](https://github.com/Sendspin/sendspin-cli)

- **Rust** - [sendspin-rs](https://github.com/Sendspin/sendspin-rs)
  - Used by [Music Assistant Desktop App](https://github.com/music-assistant/desktop-app)

- **Swift** - [SendspinKit](https://github.com/Sendspin/SendspinKit)

## Sendspin client implementation guide

A Sendspin client is an application that can receive synchronized audio and metadata via the Sendspin protocol. Example products for the player role are any products that produce audio signals (aux, optical, analog), or connected speakers. For metadata, example products could be a wall tablet, that once included, can show the album art, metadata and offer controls for the music.

By default, the server will discover clients on the network. It is possible for clients to connect to servers directly without being discoverable. This is meant for scripts and other non-permanent processes, is not a recommended approach, and won't be covered by this guide.

### Components of a Sendspin Client

A client needs to contain the following components to participate in a Sendspin network.

- **mDNS server** allows servers to discover the client on the network.
- **HTTP WebSocket server** allows servers to initiate a connection with the client.
- **Sendspin library** handles the communication over the websocket connection and produces a stream of time stamped audio or metadata.

The following components are optional, depending on the roles that the client wants to fulfill:

- **Metadata sink** is your logic to process metadata of the current song.
- **Audio sink** is your logic to handle the timestamped audio.
- **User interface** to allow the user to control the Sendspin stream.

<p><img src="/images/client-implementation-guide.jpg" alt="An image of the Sendspin connection flow" class="d-block mx-auto" /></p>

## Contributing

Sendspin is open source and welcomes contributions. Visit [Sendspin on GitHub](https://github.com/Sendspin) and the <a href="https://discord.gg/kaVm8hGpne" target="_blank"
    >Music Assistant Discord</a> to get involved.
