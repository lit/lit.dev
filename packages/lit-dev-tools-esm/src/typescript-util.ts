/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import ts from 'typescript';
import pathlib from 'path';

/**
 * Options for invokeTypeScript.
 */
export interface InvokeTypeScriptOpts {
  /**
   * Path to the tsconfig.json for the project to compile.
   */
  tsConfigPath: string;

  /**
   * Function that returns a transformer config given a TypeScript program.
   */
  transformersFactory?: (program: ts.Program) => ts.CustomTransformers;

  /**
   * Function to transform JavaScript as a string before it is written.
   */
  transformJs?: (js: string, filepath: string) => string;
}

/**
 * Compile the given TypeScript project once and return whether it succeeded
 * without errors. Diagnostics are logged to stderr.
 */
export const compileTypeScriptOnce = (opts: InvokeTypeScriptOpts): boolean => {
  const rawConfig = ts.readConfigFile(opts.tsConfigPath, ts.sys.readFile);
  if (rawConfig.error !== undefined) {
    logDiagnostic(rawConfig.error);
    return false;
  }
  const config = ts.parseJsonConfigFileContent(
    rawConfig.config,
    ts.sys,
    pathlib.dirname(opts.tsConfigPath)
  );
  const program = ts.createProgram(config.fileNames, config.options);
  const emitResult = program.emit(
    undefined,
    wrapWriteFile(opts),
    undefined,
    undefined,
    opts.transformersFactory?.(program)
  );
  const diagnostics = [
    ...ts.getPreEmitDiagnostics(program),
    ...emitResult.diagnostics,
    ...program.getSemanticDiagnostics(),
  ];
  for (const diagnostic of diagnostics) {
    logDiagnostic(diagnostic);
  }
  return diagnostics.length === 0;
};

const formatHost: ts.FormatDiagnosticsHost = {
  getCanonicalFileName: (path) => path,
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getNewLine: () => ts.sys.newLine,
};

const logDiagnostic = (diagnostic: ts.Diagnostic) =>
  console.error(
    ts.formatDiagnosticsWithColorAndContext([diagnostic], formatHost)
  );

const wrapWriteFile =
  (opts: InvokeTypeScriptOpts): typeof ts.sys.writeFile =>
  (path, data, byteOrderMark) =>
    ts.sys.writeFile(
      path,
      opts.transformJs ? opts.transformJs(data, path) : data,
      byteOrderMark
    );
