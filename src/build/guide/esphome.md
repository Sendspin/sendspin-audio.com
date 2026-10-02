---
title: "Fast lane: ESPHome"
nav_title: ESPHome
description: The fastest route to a finished Sendspin firmware on ESP32; what the ESPHome sendspin component ships, how onboarding through Home Assistant removes the pairing step, an example configuration, and when to use sendspin-cpp directly instead.
section: Building a client
order: 22
---

If your device is an ESP32, you can have a Sendspin player on the bench in an afternoon without writing C++. [ESPHome](https://esphome.io) ships a `sendspin` component that wraps [sendspin-cpp](https://github.com/Sendspin/sendspin-cpp) and plugs it into the rest of the ESPHome audio stack. You describe the hardware in YAML, ESPHome builds the firmware, and Home Assistant takes care of onboarding, updates and pairing.

## What ships

The component is a hub plus a set of platforms:

- `sendspin:` is the hub. It takes optional `manufacturer`, `model` and `firmware_version` for the `device_info` in `client/hello`, and `task_stack_in_psram` for boards where internal RAM is tight. It turns on ESPHome's high-performance networking automatically.
- A `media_source` platform `sendspin` that is the player role. It feeds a `speaker_source` media player, which drives any ESPHome speaker pipeline: I2S DAC, internal DAC, a speaker with its own resampler and mixer. Its `initial_static_delay` and `static_delay_adjustable` options are the [output delay](/build/guide/client/#7-set-the-static-output-delay) and whether the user may change it.
- A `media_player` platform `sendspin` that is the controller role: it exposes the group the device is in as a Home Assistant media player, with play, pause, next and volume.
- A `text_sensor` platform with a `type` of `title`, `artist`, `album` or `album_artist`, and a `sensor` platform with `track_progress`, `track_duration`, `year` or `track`.
- An `image` platform for artwork, in the `format` and `resize` dimensions your display wants, from the album or the artist channel.
- `switch` entities that start and stop the Sendspin client, and allow guest access, which is the Home Assistant name for [unpaired access](/build/guide/client/pairing/#unpaired-access-is-your-default-to-choose).

Underneath is sendspin-cpp unchanged. The library is designed to be consumed by ESPHome but has no ESPHome dependencies, so what you learn about it here carries over if you ever leave ESPHome. The minimum ESPHome version is 2026.3. An ESP32-S3 with PSRAM is the comfortable target. A plain ESP32 works for the player role with care over RAM, which is what `task_stack_in_psram` and the choice of a single sample rate in the speaker pipeline are for.

The [ESPHome documentation](https://esphome.io/components/sendspin/) has the full option list for every platform.

## Onboarding through Home Assistant

The experience for the user is the normal ESPHome one. They power the device, add it to Home Assistant through Improv or by adopting it in the ESPHome dashboard, and from then on they get OTA updates and a device page with its entities.

The Sendspin part comes for free. Home Assistant hands the device's pairing PSK to Music Assistant, so the device shows up in Music Assistant already paired, with no code to type and no QR to scan. The manual pairing methods stay available for other servers in the home: a phone app or a second music server still pairs the way the [pairing chapter](/build/guide/client/pairing/) describes.

The guest-mode switch controls unpaired access from Home Assistant, so the user decides from the dashboard whether a server that is not paired may play on the device. For products that need an EN 18031 compliant default, an action lets your firmware enable Sendspin only once a per-device key has been set, so a device never listens with a shared or empty secret.

<div class="callout callout--example">
<p class="callout__title">Music Assistant does it like this</p>

Music Assistant receives the device's pairing PSK from Home Assistant and completes the pairing PSK flow the first time it connects. The result is an ordinary pairing record on both sides, no different from one the user created by typing a code. Nothing about the device is special-cased: any other server pairs with it through the methods it advertises.

</div>

## An example configuration

This is an example to adapt, not a reference design. Pins, board, sample rate and names depend on your hardware; the entity names are what the user sees in Home Assistant.

```yaml
# Example: an ESP32-S3 driving an external I2S DAC. Adapt to your board.
esphome:
  name: shelf-speaker
  friendly_name: Shelf Speaker

esp32:
  board: esp32-s3-devkitc-1
  framework:
    type: esp-idf

psram:
  mode: octal
  speed: 80MHz

wifi:
  ssid: !secret wifi_ssid
  password: !secret wifi_password

api:
ota:
  - platform: esphome
improv_serial:

i2s_audio:
  - id: i2s_out
    i2s_lrclk_pin: GPIO45
    i2s_bclk_pin: GPIO46

speaker:
  - platform: i2s_audio
    id: dac_speaker
    i2s_audio_id: i2s_out
    i2s_dout_pin: GPIO47
    dac_type: external
    sample_rate: 48000
    bits_per_sample: 32bit
    channel: stereo

sendspin:
  manufacturer: Example Audio
  model: Shelf Speaker
  firmware_version: "1.0.0"

# The player role: Sendspin audio into the speaker pipeline.
media_source:
  - platform: sendspin
    id: sendspin_source
    initial_static_delay: 0ms      # delay of the DAC and amplifier behind the port
    static_delay_adjustable: true  # let the user fine-tune it from Home Assistant

media_player:
  - platform: speaker_source
    id: speaker_player
    name: Speaker
    media_pipeline:
      speaker: dac_speaker
      sources:
        - sendspin_source
  # The controller role: the group this device is in, as a media player entity.
  - platform: sendspin
    name: Sendspin group

text_sensor:
  - platform: sendspin
    type: title
    name: Title
  - platform: sendspin
    type: artist
    name: Artist

switch:
  # Starts and stops the Sendspin client. The guest access switch is
  # configured the same way; see the ESPHome documentation.
  - platform: sendspin
    name: Sendspin
```

Flash it, adopt the device in Home Assistant, and it appears in Music Assistant as a player. Measure the delay of the DAC and amplifier behind the port and put it in `initial_static_delay`, then compare the device against [sendspin-cpp-cli](https://github.com/Sendspin/sendspin-cpp-cli) on a Pi before you call the timing done.

## Why this is the fast lane

- **OTA and configuration are solved.** ESPHome's update mechanism and YAML configuration replace a build system, an updater and a settings store you would otherwise write.
- **Home Assistant integration for free.** Entities, device pages, automations and the pairing hand-off to Music Assistant all come with the ESPHome native API.
- **A path to certification.** A device built this way can qualify for [Made for ESPHome](https://esphome.io/guides/made_for_esphome) and go through [Sendspin testing and certification](/build/guide/testing/) with the SDK the conformance suite is developed against.
- **The protocol work is done.** Noise, the time filter, decoding and sync corrections are sendspin-cpp's, maintained by the project.

## When to use sendspin-cpp directly

Go to sendspin-cpp without ESPHome when:

- your silicon is not an ESP32, or you run a custom RTOS or Linux build;
- you already have an update system and a configuration store and do not want a second one;
- you need control over threading, memory placement or the audio path that the component does not expose.

You keep the same library, the same hooks and the same behavior on the wire. The [client step by step](/build/guide/client/) chapter is written for that path.

## Hardware that already runs it

The [Home Assistant Voice Preview Edition](https://www.home-assistant.io/voice-pe/) ships Sendspin through this component, so there is a production device to compare against. Community boards such as [SendspinZero](https://github.com/RealDeco/SendspinZero) show what a minimal design looks like. Both are useful references for pin maps, PSRAM configuration and speaker pipelines before you lay out your own board.
