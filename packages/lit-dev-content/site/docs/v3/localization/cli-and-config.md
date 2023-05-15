---
title: Localization CLI and config
eleventyNavigation:
  key: CLI and config
  parent: Localization
  order: 4
versionLinks:
  v2: localization/cli-and-config/
---

## CLI

```sh
lit-localize command [--flags]
```

### Commands

<br>

| Command   | Description                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `extract` | Extract `msg` calls from all input files and create or update XLIFF (`.xlf`) files.                                                                                                                                                                                                                                                                               |
| `build`   | Incorporate translations back into your app using the configured [mode](/docs/v3/localization/overview/#output-modes). |

### Flags

<br>

| Flag       | Description                                                                 |
| ---------- | --------------------------------------------------------------------------- |
| `--help`   | Display help about usage.                                                   |
| `--config` | Path to JSON [config file](#config-file). Defaults to `./lit-localize.json` |

## Config file

### General settings

<div class="alert alert-info">

All file paths are relative to the location of the config file.

</div>

<dl class="params">
  <dt class="paramName">sourceLocale</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Required</em></p>
    <p>Locale code that templates in the source code are written in.</p>
  </dd>

  <dt class="paramName">targetLocales</dt>
  <dd class="paramDetails">
    <code class="paramType">string[]</code>
    <p><em>Required (can be empty)</em></p>
    <p>Locale codes that templates will be localized to.</p>
  </dd>

  <dt class="paramName">inputFiles</dt>
  <dd class="paramDetails">
    <code class="paramType">string[]</code>
    <p><em>Required unless <code>tsConfig</code> is specified</em></p>
    <p>Array of filenames or
    <a href="https://github.com/mrmlnc/fast-glob#pattern-syntax" target="_blank" rel="noopener">
    glob</a> patterns matching the JavaScript or TypeScript files to extract messages from.</p>
    <p>If both <code>tsConfig</code> and <code>inputFiles</code> are specified, then
    <code>inputFiles</code> takes precedence.</p>
  </dd>

  <dt class="paramName">tsConfig</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Required unless <code>inputFiles</code> is specified</em></p>
    <p>Path to a <code>tsconfig.json</code> or <code>jsconfig.json</code> file
    that describes the JavaScript or TypeScript files from which messages will
    be extracted, and also the compiler options that will be used when building for
    transform mode.</p>
    <p>If both <code>tsConfig</code> and <code>inputFiles</code> are specified, then
    <code>inputFiles</code> takes precedence.</p>
  </dd>

  <dt class="paramName">output.mode</dt>
  <dd class="paramDetails">
    <code class="paramType">"transform" | "runtime"</code>
    <p><em>Required</em></p>
    <p>What kind of output should be produced. See
    <a href="/docs/localization/overview/#output-modes">modes</a>.</p>
  </dd>

  <dt class="paramName">output.localeCodesModule</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Optional</em></p>
    <p>Filepath for a generated JavaScript or TypeScript module that exports
       <code>sourceLocale</code>, <code>targetLocales</code>, and
       <code>allLocales</code> using the locale codes from your config file.
      Use to keep your config file and client config in sync.</p>
    <p>This path should end with either <code>".js"</code> or
       <code>".ts"</code>. If it ends with <code>".js"</code> it will be
       emitted as a JavaScript module. If it ends with <code>".ts"</code> it
       will be emitted as a TypeScript module.</p>
  </dd>

  <dt class="paramName">interchange.format</dt>
  <dd class="paramDetails">
    <code class="paramType">"xliff" | "xlb"</code>
    <p><em>Required</em></p>
    <p>Data format to be consumed by your localization process. Options:
      <ul>
        <li><code>"xliff"</code>:
          <a href="https://docs.oasis-open.org/xliff/v1.2/os/xliff-core.html"
            target="_blank" rel="noopener">XLIFF 1.2</a> XML format</li>
        <li><code>"xlb"</code>: Google-internal XML format</li>
      </ul>
    </p>
  </dd>
</dl>

### Runtime mode settings

<dl class="params">
  <dt class="paramName">output.outputDir</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Required</em></p>
    <p>Output directory for generated modules. A
       <code>&lt;locale&gt;.[js|ts]</code> file is generated for each
       <code>targetLocale</code>. Each file is a module that exports the
       translations for that locale, keyed by message ID.</p>
  </dd>

  <dt class="paramName">output.language</dt>
  <dd class="paramDetails">
    <code class="paramType">"js" | "ts"</code>
    <p><em>Defaults to <code>"js"</code>, or <code>"ts"</code> if
    <code>tsConfig</code> was specified.</em></p>
    <p>Language to generate modules in.</p>
  </dd>

</dl>

### Transform mode settings

<dl class="params">
  <dt class="paramName">output.outputDir</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Required unless <code>tsConfig</code> is specified, in which case it
    defaults to that file's <code>outDir</code>. If both are specified, this
    field takes precedence.</em></p>
    <p>Output directory for generated modules. A subdirectory is created for
    each locale within this directory, each containing a full build of the
    project for that locale.</p>
  </dd>

</dl>

### XLIFF mode settings

<dl class="params">
  <dt class="paramName">interchange.xliffDir</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Required with <code>"mode": "xliff"</code></em></p>
    <p>Directory on disk to read/write <code>.xlf</code> XML files. For each target
    locale, the path <code>&lt;xliffDir>/&lt;locale>.xlf</code> will be used.</p>
  </dd>

  <dt class="paramName">interchange.placeholderStyle</dt>
  <dd class="paramDetails">
    <code class="paramType">"x" | "ph"</code>
    <p><em>Defaults to <code>"x"</code></em></p>
    <p>How to represent placeholders containing HTML markup and dynamic expressions.
    Different localization tools and services have varying support for placeholder
    syntax.</p>
  </dd>
</dl>

### XLB mode settings

<dl class="params">
  <dt class="paramName">interchange.outputFile</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Required with <code>"mode": "xlb"</code></em></p>
    <p>Output path for XLB XML file that will be created containing all messages
       extracted from the source.
       E.g. <code>"data/localization/en.xlb".</code></p>
  </dd>

  <dt class="paramName">interchange.translationsGlob</dt>
  <dd class="paramDetails">
    <code class="paramType">string</code>
    <p><em>Required with <code>"mode": "xlb"</code></em></p>
    <p><a href="https://github.com/mrmlnc/fast-glob#pattern-syntax"
          target="_blank" rel="noopener">Glob</a> pattern of XLB XML files to
       read from disk containing translated messages. E.g.
       <code>"data/localization/*.xlb"</code>.</p>
  </dd>
</dl>
