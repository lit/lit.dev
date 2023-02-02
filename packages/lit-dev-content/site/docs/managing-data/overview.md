---
title: Managing Data
eleventyNavigation:
  key: Overview
  parent: Managing Data
  order: 1
---

<div class="alert alert-info">

These are rough notes!

</div>

Most components are data driven in some way - they don't just display hard-coded, static content: content, styling, and/or behavior is dependent on some kind of data.

The data that components rely on can come from many places: attributes, properties, children, events, global state, imported state and APIs, state management solutions, the network, and more...

Things to think about ragarding data:

- Reactivity: How to detect that data changes. When to update when it does
- Statefulness: Who can modify the data a component depends on. Inputs vs outputs.
- Interoperability: How data can be provided regardless of the framework, library, or lack of, providing it
- Data flow: where data comes from - usually from "above". How to do upward data flow with events.
- Synchronous vs asynchronous data: How to wait for data, what to render when data isn't available, etc.

## Top-down data flow

Properties and attributes

## HTML as data

Children

## Context

[Context](../context/)

## Asynchronous Tasks

[Task](../task/)

## State Management Libraries
