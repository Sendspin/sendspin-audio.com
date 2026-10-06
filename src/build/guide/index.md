---
title: Sendspin implementation guide
nav_title: Welcome
description: The handbook for building Sendspin into a product or application; who it is for, what a client and a server are, and where to start.
order: 10
---

Sendspin is an open protocol for playing music in sync across the devices in a home: speakers, amplifiers, screens, lights and the apps that control them. The [protocol specification](/build/spec/) defines exactly what goes over the wire. This guide covers the components you need, the user experience, and the implementation choices the protocol leaves to you.

The guide is non-normative. Where it restates a rule, the specification is the authority and the text links to it. Where it gives advice, that advice comes from the people who wrote the specification and shipped the first implementations.

## Definitions

<div class="callout callout--note">

A **client** is an endpoint that receives audio from an existing Sendspin server. With the source role it can also hand its own audio to that server, which distributes it to other clients. Speakers, amplifiers, streamers, displays and lights are clients.

A **server** sends audio to clients and keeps them in sync. It can also reroute the audio of a source client to other clients. A server can be an app on a phone or desktop, or part of a music server such as [Music Assistant](https://www.music-assistant.io).

</div>

One device can be both. A set-top box plays music as a client and can at the same time be a server that sends TV audio to the speakers in the room. The [concepts chapter](/build/guide/concepts/) explains how the pieces fit together.

## Choose your implementation path

<div class="hub-cards">
  <div class="hub-card">
    <h3>You make devices</h3>
    <p>For speakers, amplifiers, streamers, displays and lighting, implement the client side with the C++ SDK or ESPHome.</p>
    <ul>
      <li><a href="/build/guide/use-cases/">Find your product among the use cases</a></li>
      <li><a href="/build/guide/client/">Build a client step by step</a></li>
      <li><a href="/build/guide/esphome/">Build with ESPHome</a></li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>You make software</h3>
    <p>A music player, desktop or mobile app, or streaming bridge can be a client, a server, or switch between the two depending on what the user is doing.</p>
    <ul>
      <li><a href="/build/guide/use-cases/">The app and software player use cases</a></li>
      <li><a href="/build/guide/client/">Client</a> and <a href="/build/guide/server/">server</a> step by step</li>
      <li><a href="/build/sdks/">SDKs for C++, Python and JavaScript</a></li>
    </ul>
  </div>
  <div class="hub-card">
    <h3>You run a platform</h3>
    <p>For a music server, home automation hub or multi-room system, implement the server side and the interface for pairing and groups.</p>
    <ul>
      <li><a href="/build/guide/server/">Build a server step by step</a></li>
      <li><a href="/build/guide/server/ux/">What users expect from a server</a></li>
      <li><a href="/build/guide/pairing-and-encryption/">The trust model</a></li>
    </ul>
  </div>
</div>

## Where the protocol stands

Sendspin 1.0 is at Release Candidate 1. The protocol is frozen: between now and the final release only clarifications and corrections land, and a behavioural change would start a new release candidate. What you build against RC1 today will work with 1.0. The [contributing chapter](/build/guide/contributing/) explains the release process, and the specification's own [governance document](https://github.com/Sendspin/spec/blob/main/GOVERNANCE.md) is the reference.

Implementing the protocol is free. There are no royalties and the specification comes with a patent license from every contributor. The Sendspin name and logo are trademarks, and using them on a product goes through the partner program. [Licensing and trademarks](/licensing/) has the details.

## How to read this guide

- The first chapters introduce the terminology and common product designs.
- **Building a client** and **Building a server** walk through the work in order, pointing at the specification and the SDK hooks as they go. Read the side you are building; skim the other to understand your counterpart.
- **Security** explains pairing and encryption in plain language, for the people who need to sign off on them.
- **Ship it** covers testing, certification and how to take part in the project.

[Read the whole guide on one page](/build/guide/all/) or save it as a PDF from there.

## Getting help

Ask implementation questions in the `#sendspin-protocol` channel on the [Music Assistant Discord](https://discord.gg/kaVm8hGpne). For partnership and certification questions, email [sendspin@openhomefoundation.org](mailto:sendspin@openhomefoundation.org). Issues with the specification itself go to the [spec repository](https://github.com/Sendspin/spec/issues).
