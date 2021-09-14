/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import '@material/mwc-button';
import '@material/mwc-snackbar';
import 'playground-elements/playground-ide.js';
import '../components/litdev-example-controls.js';
import '../components/litdev-playground-change-guard.js';
import {
  getCodeLanguagePreference,
  CODE_LANGUAGE_CHANGE,
} from '../code-language-preference.js';

import Tar from 'tarts';
import {Snackbar} from '@material/mwc-snackbar';

interface CompactProjectFile {
  name: string;
  content: string;
  hidden?: true;
}

// TODO(aomarks) This whole thing should probably be a custom element.
window.addEventListener('DOMContentLoaded', () => {
  /**
   * Encode the given string to base64url, with support for all UTF-16 code
   * points, and '=' padding omitted.
   *
   * Built-in btoa throws on non-latin code points (>0xFF), so this function
   * first converts the input to a binary UTF-8 string.
   *
   * Outputs base64url (https://tools.ietf.org/html/rfc4648#section-5), where
   * '+' and '/' are replaced with '-' and '_' respectively, so that '+' doesn't
   * need to be percent-encoded (since it would otherwise be mis-interpreted as
   * a space).
   *
   * TODO(aomarks) Make this a method on <playground-project>? It's likely to be
   * needed by other projects too.
   */
  const encodeSafeBase64 = (str: string) => {
    // Adapted from suggestions in https://stackoverflow.com/a/30106551
    //
    // Example:
    //
    //   [1] Given UTF-16 input: "😃" {D83D DE03}
    //   [2] Convert to UTF-8 escape sequences: "%F0%9F%98%83"
    //   [3] Extract UTF-8 code points, and re-interpret as UTF-16 code points,
    //       creating a string where all code points are <= 0xFF and hence safe
    //       to base64 encode: {F0 9F 98 83}
    const percentEscaped = encodeURIComponent(str);
    const utf8 = percentEscaped.replace(/%([0-9A-F]{2})/g, (_, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    );
    const base64 = btoa(utf8);
    const base64url = base64.replace(/\+/g, '-').replace(/\//g, '_');
    // Padding is confirmed optional on Chrome 88, Firefox 85, and Safari 14.
    const padIdx = base64url.indexOf('=');
    return padIdx >= 0 ? base64url.slice(0, padIdx) : base64url;
  };

  const decodeSafeBase64 = (base64url: string) => {
    const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
    const utf8 = atob(base64);
    const percentEscaped = utf8
      .split('')
      .map((char) => '%' + char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
    const str = decodeURIComponent(percentEscaped);
    return str;
  };

  const $ = document.body.querySelector.bind(document.body);
  const project = $('playground-project')!;

  const shareButton = $('#shareButton')!;
  const shareSnackbar = $('#shareSnackbar')! as Snackbar;

  const share = async () => {
    const files = [];
    for (const [name, {content, hidden}] of Object.entries(
      project.config?.files ?? {}
    )) {
      // We don't directly encode the Playground project's files data structure
      // because we want something more compact to reduce URL bloat. There's no
      // need to include contentType (will be inferred from filename) or labels
      // (unused), and hidden should be omitted instead of false.
      const compactFile: CompactProjectFile = {
        name,
        content: content ?? '',
      };
      if (hidden) {
        compactFile.hidden = true;
      }
      files.push(compactFile);
    }
    const base64 = encodeSafeBase64(JSON.stringify(files));
    window.location.hash = '#project=' + base64;
    await navigator.clipboard.writeText(window.location.toString());
    shareSnackbar.open = true;
  };

  shareButton.addEventListener('click', share);

  const downloadButton = $('#downloadButton')!;
  downloadButton.addEventListener('click', () => {
    const tarFiles = Object.entries(project.config?.files ?? {}).map(
      ([name, {content}]) => ({
        name,
        content: content ?? '',
      })
    );
    const tar = Tar(tarFiles);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([tar], {type: 'application/tar'}));
    a.download = 'lit-playground.tar';
    a.click();
  });

  const syncStateFromUrlHash = async () => {
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.slice(1));

    let urlFiles: Array<CompactProjectFile> | undefined;
    const base64 = params.get('project');
    if (base64) {
      try {
        const json = decodeSafeBase64(base64);
        try {
          urlFiles = JSON.parse(json);
        } catch {
          console.error('Invalid JSON in URL', JSON.stringify(json));
        }
      } catch {
        console.error('Invalid project base64 in URL');
      }
    }

    $('.exampleItem.active')?.classList.remove('active');

    if (urlFiles) {
      hideCodeLanguageSwitch();
      project.config = {
        extends: '/samples/base.json',
        files: Object.fromEntries(
          urlFiles.map(({name, content, hidden}) => [name, {content, hidden}])
        ),
      };
    } else {
      showCodeLanguageSwitch();
      let sample = 'examples/hello-world';
      const urlSample = params.get('sample');
      if (urlSample?.match(/^[a-zA-Z0-9_\-\/]+$/)) {
        sample = urlSample;
      }
      const samplesRoot =
        getCodeLanguagePreference() === 'ts' ? '/samples' : '/samples/js';
      project.projectSrc = `${samplesRoot}/${sample}/project.json`;

      const link = $(`.exampleItem[data-sample="${sample}"]`);
      if (link) {
        link.classList.add('active');
        // Wait for the drawer to upgrade and render before scrolling.
        await customElements.whenDefined('litdev-drawer');
        requestAnimationFrame(() => {
          scrollToCenter(link, document.querySelector('#exampleContent')!);
        });
      }
    }
  };

  syncStateFromUrlHash();
  window.addEventListener('hashchange', syncStateFromUrlHash);
  window.addEventListener(CODE_LANGUAGE_CHANGE, syncStateFromUrlHash);

  // Trigger URL sharing when Control-s or Command-s is pressed.
  let controlDown = false;
  let commandDown = false;
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Control') {
      controlDown = true;
    } else if (event.key === 'Meta') {
      commandDown = true;
    } else if (event.key === 's' && (controlDown || commandDown)) {
      share();
      event.preventDefault(); // Don't trigger "Save page as"
    }
  });
  window.addEventListener('keyup', (event) => {
    if (event.key === 'Control') {
      controlDown = false;
    } else if (event.key === 'Meta') {
      commandDown = false;
    }
  });
  window.addEventListener('blur', () => {
    controlDown = false;
    commandDown = false;
  });
});

const exampleControls = document.body.querySelector('litdev-example-controls');

/**
 * Set the opacity of the TypeScript/JavaScript language switch.
 *
 * When a Playground is comes from a base64-encoded project in the URL (i.e.
 * through the "Share" button), it's not possible to automatically translate
 * between JS and TS forms. Only pre-built TS samples have a generated JS
 * version available.
 */
const hideCodeLanguageSwitch = () => {
  if (exampleControls) {
    exampleControls.hideCodeLanguageSwitch = true;
  }
};

const showCodeLanguageSwitch = () => {
  if (exampleControls) {
    exampleControls.hideCodeLanguageSwitch = false;
  }
};

/**
 * Note we don't use scrollIntoView() because it also steals focus.
 */
const scrollToCenter = (target: Element, parent: Element) => {
  const parentRect = parent.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  if (
    targetRect.bottom > parentRect.bottom ||
    targetRect.top < parentRect.top
  ) {
    parent.scroll({
      top: targetRect.top - parentRect.top - parentRect.height / 2,
    });
  }
};
