/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import {createEmptyLitDevRepo, deleteLitDevRepo} from '../util.js';
import {beforeEach, afterEach, before} from 'mocha';
// import * as myExtension from '../../extension';

suite('Tutorial Extension', () => {
  vscode.window.showInformationMessage('Start all tests.');
  let litDevPath: string;
  let litDevContentPath!: string;
  before(async () => {
    await deleteLitDevRepo();
  });

  beforeEach(async () => {
    const paths = await createEmptyLitDevRepo();
    litDevPath = paths.litDevPath;
    litDevContentPath = paths.litDevContentPath;
  });

  suite('startup', () => {
    test('recognizes lit.dev repo', async () => {
      await vscode.commands.executeCommand('vscode.openFolder', vscode.Uri.file(litDevPath));
      console.log('opened!');
    });
  });

  afterEach(async () => {
    await deleteLitDevRepo();
  });
});
