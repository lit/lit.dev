/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {TutorialStep} from './tutorial-step';
import {LitDevTutorialTreeProvider} from '../tree-provider';
import {getJson} from '../fs-helpers';
import {TutorialJson} from '../types';
import {GenericFile} from './generic-file';
import {PlaygroundFile} from './playground-file';

export class BeforeAfterDir extends vscode.TreeItem {
  get path() {
    return path.join(this.tutorialStep.path, this.name);
  }

  constructor(
    public provider: LitDevTutorialTreeProvider,
    public tutorialStep: TutorialStep,
    public readonly name: 'before' | 'after'
  ) {
    super(
      vscode.Uri.file(path.join(tutorialStep.path, name)),
      vscode.TreeItemCollapsibleState.Collapsed
    );

    this.contextValue = `${name}Dir`;
  }

  delete() {
    if (this.name === 'before') {
      return;
    }

    fs.rmdirSync(this.path, {recursive: true});

    this.tutorialStep.hasAfter = false;

    const tutorialJsonPath = path.join(
      this.tutorialStep.tutorial.path,
      'tutorial.json'
    );
    const tutorialJson = getJson<TutorialJson>(tutorialJsonPath);

    if (tutorialJson) {
      const steps = tutorialJson.steps;
      const step = steps[this.tutorialStep.step];

      if (step) {
        if (this.name === 'after') {
          delete step.hasAfter;
        }
      }

      fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));
      this.provider.refresh();
    }
  }

  static create(tutorialStep: TutorialStep, name: 'before' | 'after') {
    const provider = tutorialStep.provider;
    const newDir = new BeforeAfterDir(provider, tutorialStep, name);
    newDir.contextValue = `${name}Dir`;
    fs.mkdirSync(newDir.path);

    if (name === 'after') {
      const tutorialJsonPath = path.join(
        tutorialStep.tutorial.path,
        'tutorial.json'
      );

      const tutorialJson = getJson<TutorialJson>(tutorialJsonPath);

      if (tutorialJson) {
        tutorialJson.steps[tutorialStep.step].hasAfter = true;
      }

      tutorialStep.hasAfter = true;

      fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));
    }

    const projectJson = {
      extends: '/samples/base.json',
      files: {},
    };
    GenericFile.create(
      provider,
      path.join(newDir.path, 'project.json'),
      {},
      JSON.stringify(projectJson, null, 2)
    );
    PlaygroundFile.create(
      newDir,
      'index.html',
      {},
      `<!DOCTYPE html>
<html>
  <head>
    <script type="module" src=""></script>
  </head>
  <body>
  </body>
</html>`
    );

    provider.refresh();

    return newDir;
  }
}
