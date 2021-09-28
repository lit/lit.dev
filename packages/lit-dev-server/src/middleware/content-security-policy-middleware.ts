/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import type Koa from 'koa';

/**
 * Options for contentSecurityPolicyMiddleware.
 */
export interface ContentSecurityPolicyMiddlewareOptions {
  /**
   * Enables some additional directives that are only required when running in
   * local dev mode.
   */
  devMode?: boolean;

  /**
   * If true, CSP violations will be reported to the Google CSP Collector.
   */
  reportViolations?: boolean;

  /**
   * An array of "<hash-algorithm>-<base64-value>" CSP sources that will be
   * allowlisted to run as inline scripts.
   */
  inlineScriptHashes?: string[];

  /**
   * Origin for Playground preview iframes.
   */
  playgroundPreviewOrigin: string;
}

/**
 * Creates a Koa middleware that sets the lit.dev Content Security Policy (CSP)
 * headers.
 *
 * Some good resources about CSP:
 * https://web.dev/strict-csp/
 * https://www.w3.org/TR/CSP3/
 * https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
 * https://speakerdeck.com/lweichselbaum/csp-a-successful-mess-between-hardening-and-mitigation
 */
export const contentSecurityPolicyMiddleware = (
  opts: ContentSecurityPolicyMiddlewareOptions
): Koa.Middleware => {
  const cspHeaderValue = [
    // TODO(aomarks) We should also enable trusted types, but that will require
    // a policy in playground-elements for creating the worker, and a policy
    // es-module-lexer for doing an eval (see next comment for more on that).

    // TODO(aomarks) unsafe-eval is needed for an eval that is made by
    // es-module-lexer to perform JavaScript string unescaping
    // (https://github.com/guybedford/es-module-lexer/blob/91964da6b086dc5029091eeef481180a814ce24a/src/lexer.js#L32).
    // There are a number of ways we could make this stricter: [1] use the
    // asm.js build which doesn't use eval (but it's significantly slower), [2]
    // use a separate CSP for the worker (except Chrome doesn't support that
    // yet, though we could simulate it with an iframe), [3] get trusted types
    // into the WASM build, [4] modify or fork the WASM build to implement
    // string unescaping without eval (needs benchmarking).
    //
    // In dev mode, data: scripts are required because @web/dev-server uses them
    // for automatic reloads.
    `script-src 'self' 'unsafe-eval' ${
      opts.inlineScriptHashes?.map((hash) => `'${hash}'`).join(' ') ?? ''
    } https://www.googletagmanager.com/gtag/js ${opts.devMode ? ` data:` : ''}`,

    // unpkg.com is needed to allow the Playground worker to fetch dependencies.
    // TODO(aomarks) After https://crbug.com/1253267 is fixed we can serve a
    // separate CSP policy just for the worker script (Firefox and Safari
    // already support this).
    //
    // In dev mode, ws: connections are required because @web/dev-server uses
    // them for automatic reloads.
    `connect-src 'self' https://unpkg.com/${opts.devMode ? ` ws:` : ''}`,

    // Playground previews and embedded YouTube videos.
    `frame-src ${opts.playgroundPreviewOrigin} https://www.youtube-nocookie.com/`,

    // We need 'unsafe-inline' because CodeMirror uses inline styles See
    // https://discuss.codemirror.net/t/inline-styles-and-content-security-policy/1311/2
    // TODO(aomarks) Is it possible to know all of the possible inline styles
    // CodeMirror will use, and provide them here using 'unsafe-hashes'? They
    // look quite dynamic though.
    `style-src 'self' 'unsafe-inline'`,

    // TODO(aomarks) We need fonts.gstatic.com for fetching Open Sans (Manrope
    // is already hosted locally). We should probably just host Open Sans
    // ourselves, because there is no cross-origin caching benefit (see
    // https://developers.google.com/web/updates/2020/10/http-cache-partitioning),
    // and it would be one fewer connection to make.
    `font-src 'self' https://fonts.gstatic.com/`,

    // TODO(aomarks) We use some data: URLs for SVGs in docs.css. There's
    // probably a simpler way.
    // The ytimg.com domain is needed for embedded YouTube videos.
    `img-src 'self' data: https://i.ytimg.com/`,

    // TODO(aomarks) This could be 'none' if we didn't use <svg><use> elements,
    // because Firefox does not follow the img-src directive for them, so there
    // is no other directive to use. See
    // https://bugzilla.mozilla.org/show_bug.cgi?id=1303364#c4 and
    // https://github.com/w3c/webappsec-csp/issues/199.
    `default-src 'self'`,

    ...(opts.reportViolations
      ? [`report-uri https://csp.withgoogle.com/csp/lit-dev`]
      : []),
  ].join('; ');

  return async (ctx, next) => {
    await next();
    if (ctx.response.type === 'text/html') {
      // TODO(aomarks) Remove -Report-Only suffix when we are confident the
      // policy is working.
      ctx.set('Content-Security-Policy-Report-Only', cspHeaderValue);
    }
  };
};
