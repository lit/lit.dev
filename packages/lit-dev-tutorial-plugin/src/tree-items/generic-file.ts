/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import {LitDevTutorialTreeProvider} from '../tree-provider';

interface GenericFileConfig {
  label?: string;
  tooltip?: string;
  deletable: boolean;
}

export class GenericFile extends vscode.TreeItem {
  deletable: boolean;

  constructor(
    public readonly provider: LitDevTutorialTreeProvider,
    public readonly path: string,
    config: Partial<GenericFileConfig> = {}
  ) {
    super(vscode.Uri.file(path));

    const {label, tooltip, deletable} = config;

    if (label) {
      this.label = label;
    }

    if (tooltip) {
      this.tooltip = tooltip;
    }

    this.deletable = !!deletable;

    this.command = {
      title: '',
      command: 'vscode.open',
      arguments: [this.resourceUri],
    };

    if (deletable) {
      this.contextValue = 'generic-file-deletable';
    } else {
      this.contextValue = 'generic-file-nodelete';
    }
  }

  delete() {
    if (!this.deletable) {
      return;
    }
    fs.rmSync(this.path);
    this.provider.refresh();
  }

  static create(
    provider: LitDevTutorialTreeProvider,
    path: string,
    config: Partial<GenericFileConfig> = {},
    contents = ''
  ) {
    const genericFile = new GenericFile(provider, path, config);
    fs.writeFileSync(path, contents);

    provider.refresh();
    return genericFile;
  }

  revealInSidebar() {
    vscode.commands.executeCommand('vscode.open', vscode.Uri.file(this.path));
    vscode.commands.executeCommand('workbench.files.action.showActiveFileInExplorer');
  }
}
