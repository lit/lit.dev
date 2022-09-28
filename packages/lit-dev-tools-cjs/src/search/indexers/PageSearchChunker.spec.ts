/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {test} from 'uvu';
import * as assert from 'uvu/assert';
import {PageSearchChunker} from './PageSearchChunker.js';

const PAGE_TITLE = 'What is Lit? – Lit';

const h2 = (text: string, fragment: string) => `<div class="heading h2">
<h2 id="${fragment}">${text}</h2>
<a class="anchor" href="#${fragment}"><span>#</span></a>
</div>`;

const INLINE_TOC = `<nav id="inlineToc"></nav>`;

const ARTICLE_HEADER = `<h1>What is Lit?</h1>
<header class="articleHeader">
  <div class="date">some time</div>
  <div class="tags"><a href="asdf">Some tag</a></div>
  <div class="authors"><figure>A figure of an author</figure></div>
  ${INLINE_TOC}
</header>`;

const ARTICLE_CONTENTS = `${ARTICLE_HEADER}
<p>
  <img src="/images/logo.svg" alt="Lit Logo" class="logo" width="425" height="200">
</p>
<p>
  Lit is a simple library for building fast, lightweight web components.
</p>
<p>
  At Lit's core is a boilerplate-killing component base class that...
</p>
<p>
  Naïve test.
</p>
${h2('What can I build with Lit?', 'what-can-i-build-with-lit')}
`;

const DOC_CONTENTS = `<h1>What is Lit?</h1>
  ${INLINE_TOC}
<p>
  <img src="/images/logo.svg" alt="Lit Logo" class="logo" width="425" height="200">
</p>
<p>
  Lit is a simple library for building fast, lightweight web components.
</p>
<p>
  At Lit's core is a boilerplate-killing component base class that...
</p>
<p>
  Naïve test.
</p>
${h2('What can I build with Lit?', 'what-can-i-build-with-lit')}
`;

const API_CONTENTS = `<h1>Decorators</h1>
${INLINE_TOC}
${h2('customElement', 'customElement')}
<p>
  Class decorator factory that defines the decorated class as a custom element.
</p>
<h3>Import</h3>
<div class="import"><figure class="CodeMirror cm-s-default"><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;"><span class="cm-keyword">import</span> { <span class="cm-def">customElement</span> } <span class="cm-keyword">from</span> <span class="cm-string">'lit/decorators.js'</span>;</span></pre></figure><copy-button text="import { customElement } from 'lit/decorators.js';"></copy-button></div>
<h3>Signature</h3>
<p class="signature"><code><span class="functionName">customElement</span>(<span class="paramName">tagName</span>): <span class="type"><span class="type"><span class="type">(<span class="paramName">classOrDescriptor: <span class="type"><span class="type">Constructor&lt;<span class="type"><a href="https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement" target="_blank" rel="noopener"><svg class="mdnIcon" role="img" width="16" height="16"><title>MDN</title><use xlink:href="/images/logos/mdn.svg#logo"></use></svg> HTMLElement</a></span>&gt;</span> | <span class="type">ClassDescriptor</span></span></span>) =&gt; <span class="type">any</span></span></span></span></code></p>
<h3>Parameters</h3>
<dl class="params"><dt class="paramName">tagName</dt><dd class="paramDetails"><code class="paramType"><span class="type">string</span></code><p>The name of the custom element to define.</p></dd></dl>
<h3>Details</h3>
<pre><code><figure class="CodeMirror cm-s-default"><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">@customElement('my-element')</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">class MyElement {</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">  render() {</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">    return html\`\`;</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">  }</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">}</span></pre></figure></code></pre>

${h2('queryAssignedNodes', 'queryAssignedNodes')}
<p>A property decorator that converts a class property into a getter that returns the <code>assignedNodes</code> of the given named <code>slot</code>. Note, the type of this property should be annotated as <code>NodeListOf&lt;HTMLElement&gt;</code>.</p>
<h3>Import</h3>
<div class="import"><figure class="CodeMirror cm-s-default"><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;"><span class="cm-keyword">import</span> { <span class="cm-def">queryAssignedNodes</span> } <span class="cm-keyword">from</span> <span class="cm-string">'lit/decorators.js'</span>;</span></pre></figure><copy-button text="import { queryAssignedNodes } from 'lit/decorators.js';"></copy-button></div>
<h3>Signature</h3>
<p class="signature"><code><span class="functionName">queryAssignedNodes</span>(<span class="paramName">slotName?</span>, <span class="paramName">flatten?</span>, <span class="paramName">selector?</span>): <span class="type"><span class="type"><span class="type">(<span class="paramName">protoOrDescriptor: <span class="type"><span class="type"><a href="/docs/api/ReactiveElement#ReactiveElement">ReactiveElement</a></span> | <span class="type">ClassElement</span></span></span>, <span class="paramName">name?: <span class="type">string</span></span>) =&gt; <span class="type">any</span></span></span></span></code></p>
<h3>Parameters</h3>
<dl class="params"><dt class="paramName">slotName?</dt><dd class="paramDetails"><code class="paramType"><span class="type">string</span></code><p>A string name of the slot.</p></dd><dt class="paramName">flatten?</dt><dd class="paramDetails"><code class="paramType"><span class="type">boolean</span></code><p>A boolean which when true flattens the assigned nodes, meaning any assigned nodes that are slot elements are replaced with their assigned nodes.</p></dd><dt class="paramName">selector?</dt><dd class="paramDetails"><code class="paramType"><span class="type">string</span></code><p>A string which filters the results to elements that match the given css selector.</p><ul><li>@example</li></ul><pre><code class="language-ts"><figure class="CodeMirror cm-s-default"><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;"><span class="cm-keyword">class</span> <span class="cm-def cm-type">MyElement</span> {</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">  @<span class="cm-variable cm-callee">queryAssignedNodes</span>(<span class="cm-string">'list'</span>, <span class="cm-atom">true</span>, <span class="cm-string">'.item'</span>)</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">  <span class="cm-def cm-property">listItems</span>;</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;"><span cm-text="">
</span></span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">  <span class="cm-def cm-property">render</span>() {</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">    <span class="cm-keyword">return</span> <span class="cm-variable">html</span><span class="cm-string-2">\`</span></span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">      <span class="cm-tag">&lt;slot</span> <span class="cm-attribute">name</span>=<span class="cm-string">"list"</span><span class="cm-tag">&gt;&lt;/slot&gt;</span></span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">    <span class="cm-string-2">\`</span>;</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">  }</span></pre><pre class="CodeMirror-line" role="presentation"><span role="presentation" style="padding-right: 0.1px;">}</span></pre></figure></code></pre></dd></dl>
`;

const INVALID_H2_CONTENTS = `<h1>Invalid headings</h1>
<p>Test</p>
<div class="heading h2">
  <h2>Not Fragment Heading</h2>
  <a href="https://lit.dev">#</a>
</div>
<div class="heading h2">
  <h2>No anchor tag</h2>
</div>
<div class="heading h2">
  <h2>Strange nesting</h2>
  <div>
    <a href="#strange-nesting">#</a>
  </div>
</div>
`;

const simplePageLayout = (articleContents: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>${PAGE_TITLE}</title>
  </head>
  <body>
    <main>
      <div id="articleWrapper">
        <article id="content">
          ${articleContents}
        </article>
      </div>
    </main>
  </body>
</html>
`;

const noTitlePageLayout = (articleContents: string) => `<!DOCTYPE html>
<html lang="en">
  <head>
  </head>
  <body>
    <main>
      <div id="articleWrapper">
        <article id="content">
          ${articleContents}
        </article>
      </div>
    </main>
  </body>
</html>
`;
const ARTICLE_CHANGED_ID_PAGE = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>No Article</title>
  </head>
  <body>
    <main>
      <div id="articleWrapper">
        <article id="changedId">
          ${DOC_CONTENTS}
        </article>
      </div>
    </main>
  </body>
</html>
`;

test('chunk simple docs page', () => {
  const page = new PageSearchChunker(simplePageLayout(DOC_CONTENTS));
  assert.equal(page.pageSearchChunks(), [
    {
      title: 'What is Lit? – Lit',
      heading: 'What is Lit?',
      fragment: '',
      text: 'Lit is a simple library for building fast lightweight web components At Lits core is a boilerplatekilling component base class that Naïve test',
      isParent: true,
    },
    {
      title: 'What is Lit? – Lit',
      heading: 'What can I build with Lit?',
      fragment: '#what-can-i-build-with-lit',
      text: '',
      isParent: false,
    },
  ]);
});

test('chunk simple article page', () => {
  const page = new PageSearchChunker(simplePageLayout(ARTICLE_CONTENTS));
  assert.equal(page.pageSearchChunks(), [
    {
      title: 'What is Lit? – Lit',
      heading: 'What is Lit?',
      fragment: '',
      text: 'Lit is a simple library for building fast lightweight web components At Lits core is a boilerplatekilling component base class that Naïve test',
      isParent: true,
    },
    {
      title: 'What is Lit? – Lit',
      heading: 'What can I build with Lit?',
      fragment: '#what-can-i-build-with-lit',
      text: '',
      isParent: false,
    },
  ]);
});

test('chunk simple api page', () => {
  const page = new PageSearchChunker(simplePageLayout(API_CONTENTS));
  assert.equal(page.pageSearchChunks(), [
    {
      title: 'What is Lit? – Lit',
      heading: 'Decorators',
      fragment: '',
      text: '',
      isParent: true,
    },
    {
      title: 'What is Lit? – Lit',
      heading: 'customElement',
      fragment: '#customElement',
      text: 'Class decorator factory that defines the decorated class as a custom element Import import customElement from litdecoratorsjs Signature customElement tagName classOrDescriptor Constructor MDN HTMLElement ClassDescriptor any Parameters tagName string The name of the custom element to define Details customElementmyelement class MyElement render return html',
      isParent: false,
    },
    {
      title: 'What is Lit? – Lit',
      heading: 'queryAssignedNodes',
      fragment: '#queryAssignedNodes',
      text: 'A property decorator that converts a class property into a getter that returns the assignedNodes of the given named slot Note the type of this property should be annotated as NodeListOfHTMLElement Import import queryAssignedNodes from litdecoratorsjs Signature queryAssignedNodes slotName flatten selector protoOrDescriptor ReactiveElement ClassElement name string any Parameters slotName string A string name of the slot flatten boolean A boolean which when true flattens the assigned nodes meaning any assigned nodes that are slot elements are replaced with their assigned nodes selector string A string which filters the results to elements that match the given css selector example class MyElement queryAssignedNodes list true item listItems render return html slot name list slot',
      isParent: false,
    },
  ]);
});

test('gracefully chunk invalid h2 headings', () => {
  const page = new PageSearchChunker(simplePageLayout(INVALID_H2_CONTENTS));
  assert.equal(page.pageSearchChunks(), [
    {
      title: 'What is Lit? – Lit',
      heading: 'Invalid headings',
      fragment: '',
      text: 'Test Not Fragment Heading No anchor tag Strange nesting',
      isParent: true,
    },
  ]);
});

test('throw on empty page contents', () => {
  const page = new PageSearchChunker(simplePageLayout(``));
  assert.throws(() => page.pageSearchChunks(), /unable to chunk page/);
});

test('throw on no title', () => {
  const page = new PageSearchChunker(noTitlePageLayout(DOC_CONTENTS));
  assert.throws(() => page.pageSearchChunks(), /missing title/);
});

test('throw if no article content', () => {
  const page = new PageSearchChunker(ARTICLE_CHANGED_ID_PAGE);
  assert.throws(() => page.pageSearchChunks(), /article#content/);
});

test.run();
