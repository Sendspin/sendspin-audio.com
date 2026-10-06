---
title: Testing and certification
nav_title: Testing & certification
description: How to test a Sendspin implementation against real peers, the conformance suite and a sync rig, which pairing and recovery drills to run before shipping, and where the certification program stands.
section: Ship it
order: 50
---

Test against real peers first, then run the automated conformance suite and measure synchronization.

## Test against real peers

Play music through your implementation alongside a reference implementation. Use the following peers to test every role.

- **[sendspin-cpp-cli](https://github.com/Sendspin/sendspin-cpp-cli)** is the reference player. It runs headless on Linux, a Raspberry Pi or an Apple-silicon Mac, has a guided installer, and starts with `sendspin-cli -n living-room`. Keep one running next to your device for the whole project; if the two drift apart, compare their timing to find the cause.
- **[sendspin-python-cli](https://github.com/Sendspin/sendspin-python-cli)** is a second, independent player (`pip install sendspin` or `uv tool install sendspin`). Reproducing a failure with both players helps narrow down the cause.
- **[Music Assistant](https://www.music-assistant.io)** is the reference server. If you are building a client, test against it first and treat its behavior as the expected one.
- **An ESPHome device**, such as the Home Assistant Voice Preview Edition, is a reference client in the field and what a server will meet in most homes.
- **A browser tab with [sendspin-js](https://github.com/Sendspin/sendspin-js)**, the client behind the Music Assistant web UI and the [live demo](/#live-demo) on this site, has coarse clocks and a user-gesture requirement, which exercises paths a native player never hits.
- **The client in [aiosendspin](https://github.com/Sendspin/aiosendspin)** is a scriptable test client. If you are building a server, drive it from a Python script to connect, pair, join groups and disconnect in loops, with every message visible.

<div class="callout callout--tip">
<p class="callout__title">Tip</p>

Test with more than one server on the network from the start. Music Assistant plus a second server exercises the multi-server rules that single-server setups never touch: hand-over with `another_server`, pairing that must not be interrupted, and the client remembering where it last played from.

</div>

## Run the conformance suite

The [conformance](https://github.com/Sendspin/conformance) repository runs every known implementation against every other one and publishes the result as a matrix at [sendspin.github.io/conformance](https://sendspin.github.io/conformance/). Each cell is one client against one server across a set of scenarios: connection initiation in both directions, the stream formats (PCM, FLAC, Opus and 24-bit), metadata, artwork, the controller role and a protocol baseline.

To add your implementation, write an adapter following [`adapters/README.md`](https://github.com/Sendspin/conformance/blob/main/adapters/README.md), which tells the harness how to start, stop and observe it. Then set up a workspace and run everything:

```sh
python scripts/setup_workspace.py --clone
. .venv/bin/activate
python scripts/run_all.py
```

While iterating you will usually want a single pair:

```sh
conformance run --from your-impl --to target-impl
```

Read the matrix by row and by column. If your implementation fails against every peer, investigate it first. If it fails against only one peer, compare both implementations with the specification and file an issue with the failing scenario.

Run the suite in your own CI; a single `conformance run` against sendspin-cpp-cli or aiosendspin takes a minute or two. Then open a pull request with your adapter so the public matrix includes you, and every change to any implementation is tested against yours as well.

## Measure synchronization

The specification sets an [accuracy floor](/build/spec/#sync-accuracy) of ±1 ms in steady state and a target of ±0.5 ms. Both are measured at the audio output, against what your own time filter predicts the local time should be, with the configured output delay subtracted. The floor is what the suite and the certification program hold you to; the target is what keeps two speakers in one room from sounding smeared.

[sync-test](https://github.com/Sendspin/sync-test) measures the actual offset between two clients: it plays a test signal through both, records them on the two channels of a USB sound card and reports the difference over time. Put sendspin-cpp-cli on one channel and your implementation on the other, then run:

- **An hour of playback.** Drift and filter stability only show over time. Log the offset for an hour and look at the trend, not only the average.
- **Wi-Fi and Ethernet.** Wi-Fi has larger and more variable round-trip times, which is where the time filter's burst strategy matters. The [time-filter](https://github.com/Sendspin/time-filter) reference does about eight exchanges back to back every ten seconds and feeds the sample with the lowest `max_error`; if your numbers are worse than sendspin-cpp-cli's on the same network, compare your strategy to that first.
- **A late joiner.** Start the reference player, let it run, then join with yours. It should become available only after its filter has converged and land in sync without an audible step.
- **A seek and a track change.** Both clear the buffer and continue the stream. The offset after the seek must equal the offset before it.

## Pairing and recovery drills

Run each drill with your device and a server. Check what the user sees as well as what the protocol does.

- **Factory reset while paired.** The server's next connection lands in the [Sentinel fallback](/build/spec/#sentinel-fallback). The server must not play, should tell its operator and offer re-pairing; the client comes back as a fresh, unpaired device with its manufactured identity and pairing PSK intact.
- **Evict records by pairing with six servers.** A client stores at least [five pairing records](/build/spec/#pairing-records) and never fails a pairing for lack of space. Confirm the sixth pairing succeeds and the evicted server gets a clean credential-mismatch signal rather than a hang.
- **Pull the network during pairing.** Power-cycle the access point between `client/pair-init` and the finalize step. Both sides should time out, abort cleanly and allow a new attempt, with no half-written record on either side.
- **Enter the wrong code five times.** A static pairing window closes on its [fifth failed attempt](/build/spec/#pairing-window); a dynamic code attempt stops at the round limit. Check that the device recovers through the operator action you documented, and that the server says why it stopped.
- **Restore the server from a backup.** The server identity key must survive, or every paired device treats the restored server as a stranger. Back up, wipe, restore, and confirm paired devices reconnect without re-pairing.
- **Two servers fighting.** Start playback from one server, then from the other. The losing server receives `another_server`, keeps showing the device as available and does not reconnect in a loop. Then start a pairing attempt from one and playback from the other: the pairing attempt is never interrupted.

## Interoperability checklist per role

Before you call a role done, confirm it against at least two peers.

| Role | Check against peers |
|---|---|
| `player` | Plays PCM and FLAC from Music Assistant; Opus if declared. Available only after convergence. Holds ±1 ms next to sendspin-cpp-cli. Volume, mute and output delay round-trip through `client/state`. Late chunks are dropped. |
| `source` | Music Assistant distributes the captured audio to a second player in sync. Timestamps include drift. Operator approval is required before anything is sent. |
| `controller` | Every command acts on the client's own group. `switch` cycles through playing groups. Group state arrives after joining and after each change. |
| `metadata` | Scheduled updates appear at the track boundary, not on arrival. Missing fields are tolerated. |
| `artwork` | Images arrive in the requested size and format on each channel. A track without artwork clears the display. |
| `visualizer` | Frames render at their timestamp. Peaks are always present; beat events may be absent. |
| `color` | Palettes change with the artwork and the contrast guarantees hold on your display. |

For a server the table applies in reverse: run each role against sendspin-cpp-cli, an ESPHome device and a browser client, and against aiosendspin's client for the paths you can only reach from a script.

## Certification

A Sendspin certification program is in preparation. Certification will involve testing and a nominal fee, and grants the right to use the certification mark and logo on the product and in its marketing, plus a listing on this website. The test plan is being built from the conformance suite, the sync measurements and the pairing drills above, so preparing for it means doing what this chapter describes and keeping the results.

Until the program opens, the trademark rules are the ones on the [licensing page](/licensing/): you may state factually that your product implements or is compatible with Sendspin, and using the name or logo on a product that is sold needs permission. If you want to be among the first products certified, or have a launch date that depends on it, email [sendspin@openhomefoundation.org](mailto:sendspin@openhomefoundation.org).
