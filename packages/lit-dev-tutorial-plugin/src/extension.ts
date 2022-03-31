/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as vscode from 'vscode';
import { BeforeAfterDir } from './tree-items/before-after-dir.js';
import { GenericFile } from './tree-items/generic-file.js';
import { PlaygroundFile } from './tree-items/playground-file.js';
import { TutorialStep } from './tree-items/tutorial-step.js';
import { Tutorial } from './tree-items/tutorial.js';
import {LitDevTutorialTreeProvider, TutorialTreeItem} from './tree-provider.js';

export async function activate() {
  const rootPath =
  vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
    ? vscode.workspace.workspaceFolders[0].uri.fsPath
    : undefined;

  if (!rootPath) {
    return;
  }

  const provider = new LitDevTutorialTreeProvider();
  vscode.window.createTreeView('litDevTutorial', {
    canSelectMany: true,
    showCollapseAll: true,
    treeDataProvider: provider,
  });

  vscode.window.registerTreeDataProvider('litDevTutorial', provider);
  vscode.commands.registerCommand('litDevTutorial.refreshEntry', () => {
    provider.refresh();
  });
  vscode.commands.registerCommand('litDevTutorial.createTutorial', () => {
    provider.createTutorial();
  });
  vscode.commands.registerCommand('litDevTutorial.addStep', (tutorial: Tutorial) => {
    TutorialStep.create(tutorial);
	});
  vscode.commands.registerCommand('litDevTutorial.moveStepUp', (step: TutorialStep) => {
    step.moveUp();
	});
  vscode.commands.registerCommand('litDevTutorial.moveStepDown', (step: TutorialStep) => {
    step.moveDown();
	});
  vscode.commands.registerCommand('litDevTutorial.addAfterStep', (step: TutorialStep) => {
    BeforeAfterDir.create(step, 'after');
	});
  vscode.commands.registerCommand('litDevTutorial.delete', (item: TutorialTreeItem) => {
    item.delete();
  });
  vscode.commands.registerCommand('litDevTutorial.createPlaygroundFile', (dir: BeforeAfterDir) => {
    PlaygroundFile.create(dir);
  });
  vscode.commands.registerCommand('litDevTutorial.revealInSidebar', (item: GenericFile | PlaygroundFile) => {
    item.revealInSidebar();
  });
  vscode.commands.registerCommand('litDevTutorial.renameStep', (item: TutorialStep) => {
    item.rename();
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
