---
title: Contributing and governance
nav_title: Contributing
description: Who runs Sendspin, what Draft and Approved mean for an implementor, how the specification repository works, how to propose a change or a new role, and where to talk to the project.
section: Ship it
order: 51
---

Sendspin is developed in the open, and the people who implement it are the people expected to improve it. This chapter explains how the project is run, how a change gets into the specification, and what the release process means for the code you ship. The authoritative documents are in the [specification repository](https://github.com/Sendspin/spec); this chapter summarizes them and links to each.

## Who runs the project

Sendspin is a project of the [Open Home Foundation](https://www.openhomefoundation.org), a Swiss non-profit. Foundation staff maintain the specification together with volunteer contributors; there is no membership body and no fee to take part. The Community Specification License calls the project a "Working Group", and the Foundation acts for it where the license gives the Working Group a right or duty.

Three roles appear in [GOVERNANCE.md](https://github.com/Sendspin/spec/blob/main/GOVERNANCE.md):

- The **project lead**, currently Marcel van der Veldt, sets direction and has the final say on disputed changes.
- **Editors** are maintainers with write access who review and merge changes.
- **Contributors** are everyone whose contribution has been merged.

Changes to the governance, [scope](https://github.com/Sendspin/spec/blob/main/SCOPE.md) or licensing documents go through a pull request and need the project lead's approval. Everything else is reviewed and merged by the editors.

## Draft and Approved

The specification is developed on the `main` branch. Under the license, `main` and every pre-release, which today means the tag `1.0.0-rc1`, are the **Draft specification**. A version becomes the **Approved specification** when the editors publish it as a final release such as `1.0.0`. The difference matters for patents: contributors' licenses cover the Draft as it stands at the time of each contribution, and the Approved specification carries the full patent commitment for its scope.

A final release is announced at least 45 days ahead, either by publishing a release candidate or by opening a pull request that announces it. During that window a contributor may file an exclusion notice in [NOTICES.md](https://github.com/Sendspin/spec/blob/main/NOTICES.md). Only clarifications and corrections land between the last release candidate and the final release; a behavioral change starts a new release candidate and a new window.

<div class="callout callout--note">
<p class="callout__title">What RC1 means for you</p>

Release Candidate 1 is a frozen protocol. What you build against it today will work with 1.0, because the only changes still allowed are the kind that make the text clearer, not the wire different. Watch the repository for the final tag; it gives you and the partner program a fixed version to name in documentation and test reports.

</div>

Role versions evolve independently of releases. A release records which role versions exist at that time, and a new role version can appear on `main` without a new release of the specification as a whole.

## How the specification repository works

The published `README.md` is generated. The sources are `template.md` (the document head, the role versioning rules and the assembly order), `connection.md`, `messaging.md`, `pairing.md`, and one file per role version under `roles/<role>/v1.md`. Edit those and rebuild with `python3 tools/build-readme.py`; `--check` verifies the generated page is in sync, which is what CI runs on every pull request. Enable the pre-commit hook once per clone so you never commit an out-of-date `README.md`:

```sh
git config core.hooksPath .githooks
```

The pull request template has one checkbox: accepting the [Contributor License Agreement](https://github.com/Sendspin/spec/blob/main/CONTRIBUTOR-LICENSE-AGREEMENT.md) for the contribution. Pull requests without it are not merged. The agreement covers the specification license, the governance and the contribution process, and asks you to confirm that your employer, where relevant, has agreed too.

[CONTRIBUTING.md](https://github.com/Sendspin/spec/blob/main/CONTRIBUTING.md) lists the editorial rules reviewers apply. The ones that most often need a second round:

- **Each role file is self-contained.** Text that applies to more than one role appears in each of them; the duplication is on purpose, so that someone implementing one client role never has to read another role file.
- **Constant fields go in `client/hello`, changing fields in `client/state`.** The hello message is sent once per connection, so anything placed there can only be updated by reconnecting.
- **Every heading needs a unique anchor**, and the build fails on a link to an anchor that does not exist.
- **One canonical name per term**, taken from the Definitions section, in prose and matching the wire identifier it describes.
- **`**Note:**` blocks are non-normative.** A requirement goes in body text; a note must read as something the reader can skip.

## Proposing a change or a new role

The project accepts changes that have been tried. If you want a new message, field or role, prototype it first, typically in Music Assistant and one client, and bring the experience with you: what you built, what worked and what the specification would need to say. Proposals without an implementation behind them are discussed but rarely merged.

The protocol gives you a way to do this without stepping on anyone: [application-specific roles](/build/spec/#application-specific-roles) start with an underscore and carry an explicit version. Use `_wip_<role>@v1` for a draft meant to become part of the specification, and `_vendorname_<role>@v1` for something specific to your products. Servers ignore roles they do not implement, so a draft role can ship in a product and be refined in the open.

Keep in mind what belongs where. The specification says what goes on the wire; this guide says how to build well. A pull request to the specification that reads like a tutorial will be asked to move here, and a guide chapter that starts to define behavior will be asked to point at the specification instead.

Discussion happens in two places. The `#sendspin-protocol` channel on the [Music Assistant Discord](https://discord.gg/kaVm8hGpne) is for developers and implementors: questions, design conversations and anything that is not yet a concrete change. Issues and pull requests in the [spec repository](https://github.com/Sendspin/spec/issues) are for concrete changes, and the thread on a pull request is kept for developers discussing that change.

## Role versioning for implementors

Role versions are how the protocol gains features without breaking what already ships. The rules are in [Role Versioning](/build/spec/#role-versioning) and [Protocol evolution](/build/spec/#protocol-evolution); what they ask of you is small:

- **A client lists every version it supports**, most preferred first: `["player@v2", "player@v1"]`. The server activates the first one it implements and never a version the client did not list.
- **A server implements every version of every role** in the specification it claims, and tracks requests for roles or versions it does not know as a sign that it needs updating.
- **Unknown fields and messages are ignored.** A revision may add optional information as long as older receivers can ignore it without changing a message's meaning. Behavior only changes when both sides have agreed to it through role activation or a declared capability; a matching software version or the absence of an error does not count.

If you propose a change that breaks an existing role's contract, it becomes a new role version. If it changes connection-wide behavior, the proposal must say how both peers opt in and what happens when one of them does not.

## Contributing to the SDKs and this guide

The SDKs, reference players and test tools live in the [Sendspin GitHub organization](https://github.com/Sendspin), each with its own license and contribution notes. Bugs found while testing against a reference implementation are as welcome in that implementation's tracker as in your own, and a failing scenario in the [conformance suite](https://github.com/Sendspin/conformance) with a clear description is the most useful report there is.

This guide is part of the [website repository](https://github.com/Sendspin/sendspin-audio.com), in `src/build/guide/`, and fixes arrive the same way, by pull request. If a chapter left you with a question that the specification did answer, the chapter needs the fix, not you.

## Code of conduct and contacts

The project follows the Open Home Foundation's [code of conduct](https://github.com/Sendspin/spec/blob/main/CODE_OF_CONDUCT.md), which applies to the repositories, the Discord channel and every other place the project meets. Report concerns to [safety@openhomefoundation.org](mailto:safety@openhomefoundation.org).

For questions about trademarks, partnership and certification, email [sendspin@openhomefoundation.org](mailto:sendspin@openhomefoundation.org); the [licensing page](/licensing/) covers the common cases. For everything technical, the Discord channel and the spec repository are the fastest routes.
