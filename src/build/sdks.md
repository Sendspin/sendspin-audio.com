---
layout: base
title: SDKs & libraries
description: Official Sendspin SDKs, libraries, and code samples in eight languages.
---

Official software development kits (SDK), libraries, and code samples to help you build Sendspin into your projects. New to the protocol? Start with the [implementation guide](/build/guide/).

Want to try Sendspin from the command line? [sendspin-cpp-cli](https://github.com/Sendspin/sendspin-cpp-cli) is the recommended CLI and reference player.

<!--
  Board item "Update website to promote sendspin-cpp-cli": done above — keep
  sendspin-cpp-cli as the recommended CLI/reference player wherever a CLI comes up.
  TODO (board): "Remove links on website to any SDK/app that is not matching
  spec 1.0" — do not delete SDK links below without checking with Paulus which
  ones are non-conformant.
-->

Each SDK shows the specification version it implements. **Spec RC1** matches the [current specification](/build/spec/). **Pre-RC1** implements an earlier draft and will still change.

- **C#/.NET** <span class="sdk-status sdk-status--pre">Pre-RC1</span> - [Sendspin.SDK](https://github.com/Sendspin/sendspin-dotnet) -
  [Nuget Package](https://www.nuget.org/packages/Sendspin.SDK)
  - Used by [Sendspin for Windows](https://github.com/chrisuthe/windowsSpin)

- **C++** <span class="sdk-status sdk-status--pre">Pre-RC1</span> - [sendspin-cpp](https://github.com/Sendspin/sendspin-cpp)
  - Used by [ESPHome](https://github.com/esphome/esphome/pull/14933), [sendspin-cpp-cli](https://github.com/Sendspin/sendspin-cpp-cli)

- **Go** <span class="sdk-status sdk-status--pre">Pre-RC1</span> - [sendspin-go](https://github.com/Sendspin/sendspin-go)

- **JavaScript** <span class="sdk-status sdk-status--pre">Pre-RC1</span> - [sendspin-js](https://github.com/Sendspin/sendspin-js)
  - Used by Music Assistant's web interface, [Google Cast receiver for Sendspin](https://github.com/Sendspin/cast), [sendspin-audio.com live demo](https://www.sendspin-audio.com/#live-demo)

- **Kotlin/JVM** <span class="sdk-status sdk-status--pre">Pre-RC1</span> - [sendspin-jvm](https://github.com/Sendspin/sendspin-jvm)

- **Python** <span class="sdk-status sdk-status--pre">Pre-RC1</span> - [aiosendspin](https://github.com/Sendspin/aiosendspin)
  - Used by [Music Assistant](https://www.music-assistant.io), [sendspin-cli](https://github.com/Sendspin/sendspin-cli)

- **Rust** <span class="sdk-status sdk-status--pre">Pre-RC1</span> - [sendspin-rs](https://github.com/Sendspin/sendspin-rs)
  - Used by [Music Assistant Desktop App](https://github.com/music-assistant/desktop-app)

- **Swift** <span class="sdk-status sdk-status--pre">Pre-RC1</span> - [SendspinKit](https://github.com/Sendspin/SendspinKit)

## Contributing

Sendspin is open source and welcomes contributions. Visit [Sendspin on GitHub](https://github.com/Sendspin) and the <a href="https://discord.gg/kaVm8hGpne" target="_blank"
    >Music Assistant Discord</a> to get involved.

Publishing your own Sendspin project? The protocol is free to implement; see [Licensing and trademarks](/licensing/) for the SDK licenses and how the Sendspin name may be used in your project's name.
