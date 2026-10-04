---
layout: base
title: SDKs & libraries
description: Official Sendspin SDKs, libraries, and code samples.
---

Official software development kits (SDK), reference implementations and test tools for building Sendspin into your projects. New to the protocol? Start with the [implementation guide](/build/guide/); the [client chapter](/build/guide/client/) says which SDK fits which platform.

Want to try Sendspin from the command line? [sendspin-cpp-cli](https://github.com/Sendspin/sendspin-cpp-cli) is the recommended CLI and reference player.

<!--
  Board item "Update website to promote sendspin-cpp-cli": done above — keep
  sendspin-cpp-cli as the recommended CLI/reference player wherever a CLI comes up.
-->

This page lists the implementations that are at specification 1.0. All of them are open source; the licensing pointer at the bottom explains what that means for your project.

## Client SDKs

| Language | Repository | Roles | Spec status | Used by |
|---|---|---|---|---|
| C++ | [sendspin-cpp](https://github.com/Sendspin/sendspin-cpp) | player, controller, metadata, artwork, visualizer, color | 1.0 | [ESPHome](https://esphome.io/), [sendspin-cpp-cli](https://github.com/Sendspin/sendspin-cpp-cli) |
| Python | [aiosendspin](https://github.com/Sendspin/aiosendspin) (client) | see repository | 1.0 | Test and reference client |
| JavaScript | [sendspin-js](https://github.com/Sendspin/sendspin-js) | player; see repository | being updated to 1.0 | [Music Assistant](https://www.music-assistant.io) web UI, the [live demo](/#live-demo) on this site |

**sendspin-cpp** is the library for devices. It runs on ESP32 through the ESP-IDF component registry (`sendspin/sendspin-cpp`) and on Linux and macOS hosts, decodes FLAC and PCM with Opus as an option, and has the Noise encryption built in. The repository's `integration-guide.md`, `internals.md` and `playback-sync.md` cover what the guide here does not. Apache 2.0.

**aiosendspin** is the async Python library. Its client side is complete and conformant, but it is best treated as a reference and test client: something to script against your server, or to read when the specification leaves you unsure. On PyPI as `aiosendspin`. Apache 2.0.

**sendspin-js** is the TypeScript client for browsers, with `SendspinPlayer` for a complete player and the lower-level `SendspinCore` for your own user interface. It handles the browser's user-gesture requirement and coarse clocks. It is being brought up to specification 1.0; check the repository for the current state before you depend on a specific feature. On npm as `@sendspin/sendspin-js`.

## Server implementations

| Language | Repository | Roles | Spec status | Used by |
|---|---|---|---|---|
| Python | [aiosendspin](https://github.com/Sendspin/aiosendspin) (server) | all | 1.0 | [Music Assistant](https://www.music-assistant.io) |
| C++ | planned | all | not started | |

**aiosendspin** is the server inside Music Assistant, which makes it the reference server: whatever it does is what clients in the field expect. If you are building a server in Python, build on it. A **C++ server** for embedded and desktop products is on the roadmap but has not been started; if you need one, say so on the Discord so the work can be planned with you.

## Reference players and tools

- **[sendspin-cpp-cli](https://github.com/Sendspin/sendspin-cpp-cli)**: the recommended CLI and reference player. Headless, for Linux, Raspberry Pi and Apple-silicon macOS, with a guided installer. Start it with `sendspin-cli -n living-room` and you have a known-good player to compare your own against.
- **[sendspin-python-cli](https://github.com/Sendspin/sendspin-python-cli)**: a Python player (`pip install sendspin` or `uv tool install sendspin`) with an interactive terminal client, a daemon mode and a party mode.
- **[time-filter](https://github.com/Sendspin/time-filter)**: the C++ reference implementation of the clock-synchronization Kalman filter the specification requires, including the known-good burst strategy. Use it as is or port it line by line.
- **[conformance](https://github.com/Sendspin/conformance)**: the harness that runs every implementation against every other and publishes the [results matrix](https://sendspin.github.io/conformance/). Add an adapter for yours; the [testing chapter](/build/guide/testing/) explains how.
- **[sync-test](https://github.com/Sendspin/sync-test)**: measures the synchronization accuracy between two clients with a USB sound card.
- **[ma-pairing-e2e](https://github.com/Sendspin/ma-pairing-e2e)**: Playwright end-to-end tests of the Music Assistant pairing flow, which also record the walkthrough videos used in the guide.

Further ports in other languages live in the [GitHub organization](https://github.com/Sendspin) and will be listed here as they reach specification 1.0.

## Contributing

Sendspin is open source and welcomes contributions. Visit [Sendspin on GitHub](https://github.com/Sendspin) and the <a href="https://discord.gg/kaVm8hGpne" target="_blank"
    >Music Assistant Discord</a> to get involved. The [contributing chapter](/build/guide/contributing/) of the guide explains how the project works.

Publishing your own Sendspin project? The protocol is free to implement; see [Licensing and trademarks](/licensing/) for the SDK licenses and how the Sendspin name may be used in your project's name.
