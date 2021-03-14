---
title: Browser Support
eleventyNavigation:
  key: Browser Support
  parent: Introduction
  order: 4
---

Lit supports modern browsers natively and older browsers like IE11 via transpilers and polyfills. We run continual integration tests to ensure Lit works on the last two major versions of Chrome, Firefox, Edge, and Safari, as well as IE11 and "classic" Edge 15. Older versions of evergreen browsers will likely work just fine with proper transpilation and polyfills based on the features they support, although we do not test the full back catalog of these browsers.

Lit leverages modern browser features like ES2020 and web components. These features are supported natively on all major browsers and via transpiling and polyfills on older browsers. The following table shows what is required to support various browser versions.

| Support	                         | Chrome | Safari	| Firefox	| Edge | Edge "Classic" | Internet Explorer |
|:---------------------------------|:------:|:-------:|:-------:|:----:|:--------------:|:-----------------:|
| Native ES2020 and web components | >=80   | >=13	  | >=72    | >=80 |                |                   |
| Transpile JS                     | 67-79  | 10-12   | 63-71   | 79   |                |                   |
| Transpile JS and load polyfills  | <67    | <10     | <63	    |      | 15-18          | 11                |

See [Tools and Workflows](/guide/tools/overview) for information about setting up Lit to work in all browsers for testing, development, building, and publishing.
