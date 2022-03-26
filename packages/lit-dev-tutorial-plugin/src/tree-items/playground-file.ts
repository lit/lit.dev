/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {LitDevTutorialTreeProvider} from '../tree-provider';
import {BeforeAfterDir} from './before-after-dir';
import {PlaygroundProjectManifest} from '../types';
import {getJson} from '../fs-helpers';

export interface PlaygroundFileCreateConfig {
  hidden: boolean;
}

const defaultCreateConfig: PlaygroundFileCreateConfig = {
  hidden: false,
};

export class PlaygroundFile extends vscode.TreeItem {
  projectJsonPath;

  get path() {
    return path.join(this.dirItem.path, this.filename);
  }

  get isHidden() {
    const manifest = getJson<PlaygroundProjectManifest>(this.projectJsonPath);
    return !!manifest?.files?.[this.filename]?.hidden;
  }

  constructor(
    public readonly provider: LitDevTutorialTreeProvider,
    public readonly dirItem: BeforeAfterDir,
    public readonly filename: string
  ) {
    super(vscode.Uri.file(path.join(dirItem.path, filename)));

    this.command = {
      title: '',
      command: 'vscode.open',
      arguments: [this.resourceUri],
    };

    this.contextValue = 'playground-file';
    this.projectJsonPath = path.join(this.dirItem.path, 'project.json');
  }

  delete() {
    fs.rmSync(this.path);
    const manifest = getJson<PlaygroundProjectManifest>(this.projectJsonPath);
    if (manifest) {
      delete manifest.files?.[this.filename];
      fs.writeFileSync(this.projectJsonPath, JSON.stringify(manifest, null, 2));
    }

    this.provider.refresh();
  }

  static async create(
    dirItem: BeforeAfterDir,
    filename = '',
    config: Partial<PlaygroundFileCreateConfig> = {},
    contents = ''
  ) {
    if (!filename) {
      const filenameRaw = await vscode.window.showInputBox({
        prompt: 'Enter a filename',
        placeHolder: 'my-element.ts',
        validateInput: (input) => {
          if (!input) {
            return 'Filename is required';
          }
          if (fs.readdirSync(dirItem.path).includes(input)) {
            return 'Filename already exists';
          }
          if (input.includes(' ')) {
            return 'Filename cannot contain spaces';
          }
          if (input.includes('/')) {
            return 'Filename cannot contain slashes';
          }
          if (input.includes('\\')) {
            return 'Filename cannot contain backslashes';
          }
          return null;
        },
      });

      if (!filenameRaw) {
        return;
      }

      filename = filenameRaw;
    }
    const provider = dirItem.provider;
    const {hidden} = {...defaultCreateConfig, ...config};
    const newFile = new PlaygroundFile(provider, dirItem, filename);
    fs.writeFileSync(newFile.path, contents);

    const manifest = getJson<PlaygroundProjectManifest>(
      newFile.projectJsonPath
    );
    if (manifest) {
      if (!manifest.files) {
        manifest.files = {};
      }

      manifest.files[newFile.filename] = {};

      if (hidden) {
        manifest.files[newFile.filename].hidden = true;
      }

      fs.writeFileSync(
        newFile.projectJsonPath,
        JSON.stringify(manifest, null, 2)
      );

      provider.refresh();
      return newFile;
    }
  }

  revealInSidebar() {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(this.path));
    vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
  }
}
