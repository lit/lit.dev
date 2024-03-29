/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const fs = require('fs').promises;
const path = require('path');
const matter = require('gray-matter');
const {existsSync} = require('fs');

const rootSiteDir = path.resolve(__dirname, '..');

// Note: YouTube thumbnail images can be obtained with
// https://i.ytimg.com/vi/<video id>/maxresdefault.jpg It should then be checked
// into the GitHub repository at the native size 1280px by 720px, under the name
// `images/videos/<video id>_2x.jpg`. Then also check-in a halved resolution
// 640px by 360px image under the name `images/videos/<video id>.jpg`.
//
// Use https://squoosh.app/ to create the halved resolution image.
const loadVideoData = () =>
  [
    {
      title: 'Declarative Reactive Web Components with Justin Fagnani',
      summary: `Justin covers what Web Components are and how LitElement and lit-html add value on top of the native APIs. This talk covers the fundamentals of how and why Lit is architected the way it is.`,
      youtubeId: '9FB0GSOAESo',
      date: 'Jun 22 2019',
      duration: '50',
    },
    {
      title: 'Chat with Lit #1 – Westbrook Johnson (Adobe)',
      summary: `Listen in on this live-recorded Twitter Space episode, hosted by Rody Davis (@rodydavis) and Elliott Marquez (@techytacos), with guest Westbrook Johnson (@WestbrookJ) from Adobe.`,
      youtubeId: 'it-NXhxkOJo',
      date: 'Jul 23 2021',
      duration: '24',
    },
    {
      title: 'Lit 2.0 Release Livestream',
      summary: `Lit 2.0 has officially landed! Here we talk about Lit 2.0, what we've been doing, what it means to Google, and what's new. Stay tuned for a panel discussion with Lit users in the industry!`,
      youtubeId: 'nfb779XIhsU',
      date: 'Sep 21 2021',
      duration: '98',
    },
    {
      title: 'How to build your first Lit component',
      summary: `Learn how to build your first Lit component and use it with React, Vue, and in a markdown editor.`,
      youtubeId: 'QBa1_QQnRcs',
      date: 'Apr 25 2022',
      duration: '12',
    },
    {
      title: 'What are elements?',
      summary: `Software Engineer Elliott Marquez shares what elements are, how to make, and interact with them. Learn about the basic building block of the web in this video!`,
      youtubeId: 'x_mixcGEia4',
      date: 'Apr 27 2022',
      duration: '9',
    },
    {
      title: 'How to build a carousel in Lit',
      summary: `In this video, we build a simple-carousel using Lit, letting us explore passing children into your web component, and web component composition.`,
      youtubeId: '2RftvylEtrE',
      date: 'May 3 2022',
      duration: '15',
    },
    {
      title: 'Event communication between web components',
      summary: `Follow along as Lit Software Engineer Elliott Marquez shares the pros, cons, and use cases of communicating with events.`,
      youtubeId: 'T9mxtnoy9Qw',
      date: 'May 5 2022',
      duration: '10',
    },
    {
      title: 'How to style your Lit elements',
      summary: `We cover how the Shadow DOM works, illustrate the benefits of encapsulated CSS, and show you how to use CSS inheritance, custom properties and shadow parts to expose a flexible public styling API.`,
      youtubeId: 'Xt7blcyuw5s',
      date: 'Oct 3 2022',
      duration: '15',
    },
    {
      title: 'Introduction to Lit',
      summary: `Learn all about the Lit library in this beginner-friendly Lit University episode! We will cover all of the essentials, including custom elements, declarative templates, scoped styles, and reactive properties.`,
      youtubeId: 'uzFakwHaSmw',
      date: 'Nov 2 2022',
      duration: '13',
    },
    {
      title: 'Lit 3.0 Launch Event',
      summary: `Join the Lit team to hear all about the Lit 3.0 release and what's new in the Lit ecosystem!`,
      youtubeId: 'ri9FEl_hRTc',
      date: 'Oct 10 2023',
      duration: '90',
    },
    {
      title: 'Lit Labs: Task (graduated)',
      summary: `This video covers @lit-labs/task, a package under development in Lit Labs. Watch for an overview, demos, package status and more!`,
      youtubeId: 'niWKuGhyE0M',
      date: 'Jan 19 2023',
      duration: '9',
    },
    {
      title: 'Lit Labs: Context (graduated)',
      summary: `In this video, we cover @lit-labs/context, a package under development in Lit Labs. Watch for an overview, an explanation of the underlying Web Components Context Protocol, use cases, demos, package status and more!`,
      youtubeId: 'irHAr1yTE5Q',
      date: 'Jan 19 2023',
      duration: '15',
    },
    {
      title: 'Lit Labs: Observers',
      summary: `This video covers @lit-labs/observers, a package under development in Lit Labs. Watch for an overview, demos, package status and more!`,
      youtubeId: 'g_9PVegjQuw',
      date: 'Jan 19 2023',
      duration: '7',
    },
    {
      title: 'Lit Labs: SSR (server-side rendering)',
      summary: `This video covers @lit-labs/ssr, a server-side rendering package under development in Lit Labs. Watch for an overview, demos, project status and more!`,
      youtubeId: '_xcIEx2P8nk',
      date: 'Jan 19 2023',
      duration: '13',
    },
    {
      title: 'Lit Labs: Framework wrapper generators',
      summary: `This video covers framework wrapper generators, a feature of the Lit CLI under development in Lit Labs. Watch for an overview, benefits, use case, status and more!`,
      youtubeId: 'CL_3TLFkwNE',
      date: 'Jan 19 2023',
      duration: '13',
    },
    {
      title: 'Lit Labs: Motion',
      summary: `This video covers @lit-labs/motion, a package under development in Lit Labs. Watch for an overview, examples, quick tips, package status and more!`,
      youtubeId: '9jxjc-bxwfI',
      date: 'Jan 19 2023',
      duration: '17',
    },
    {
      title: 'Lit Labs: React (graduated)',
      summary: `This video covers @lit-labs/react, a package under development in Lit Labs. Watch for an overview, use cases, package status and more!`,
      youtubeId: 'agBn1LW6dbM',
      date: 'Jan 19 2023',
      duration: '8',
    },
    {
      title: 'Lit Labs: Virtualizer',
      summary: `This video covers @lit-labs/virtualizer, a package under development in Lit Labs. Watch for an overview, examples, features, package status and more!`,
      youtubeId: 'ay8ImAgO9ik',
      date: 'Jan 19 2023',
      duration: '16',
    },
  ].map((videoData) => ({
    kind: 'video',
    url: `https://www.youtube.com/watch?v=${videoData.youtubeId}`,
    ...videoData,
    date: new Date(videoData.date),
  }));

/**
 * 11ty data JS loader.
 *
 * @returns {Promise<{eleventyComputed: {tutorials: Object[]}}>} 11ty data
 *   To be consumed by the tutorials catalog (/tutorials/index.html).
 */
module.exports = async () => {
  return loadVideoData();
};
