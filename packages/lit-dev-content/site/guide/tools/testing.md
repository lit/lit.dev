---
title: Testing
eleventyNavigation:
  key: Testing
  parent: Tools
  order: 3
---

{% todo %}

- Write this section. The content below is from the existing lit-html guide.
- I think it should be refererring to @web/test-runner now.
- starter kit
- mention karma, jest?

{% endtodo %}


lit-html doesn't have many special testing requirements. If you already have a testing setup, it should work fine as long as it supports working with JavaScript modules (and node-style module specifiers, if you use them).

Web Component Tester (WCT) is an end-to-end testing environment that supports node-style module specifiers. works with the Mocha testing framework and (optionally) the Chai assertion library. There are two ways to add WCT to your project:

* [web-component-tester](https://www.npmjs.com/package/web-component-tester).  Installing the full WCT package gives you Mocha and Chai, as well as some other add-ons.
* [wct-mocha](https://www.npmjs.com/package/wct-mocha). Just the WCT client-side library. You'll need to install your own version of Mocha, and any other add-ons you want.

Alternately, you can also use the Karma test runner. The Open Web Components recommendations includes a [Karma setup](https://open-wc.org/testing/testing-karma.html#browser-testing) that resolves module dependencies by bundling with webpack before running tests.
