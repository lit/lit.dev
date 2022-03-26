/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {Tutorial} from './tutorial';
import {LitDevTutorialTreeProvider} from '../tree-provider';
import {getJson} from '../fs-helpers';
import {TutorialJson, TutorialJsonStep} from '../types';
import {BeforeAfterDir} from './before-after-dir';

export class TutorialStep extends vscode.TreeItem {
  private _step = -1;
  private _hasAfter = false;
  checkable = false;

  get path() {
    return path.join(this.tutorial.path, this.dirName);
  }

  get step() {
    return this._step;
  }

  set step(value: number) {
    const oldPath = this.path;
    const previousStep = this._step;
    this._step = value;

    if (previousStep !== -1) {
      fs.renameSync(oldPath, this.path);
    }

    this.contextValue = this.generateContextValue();
    this.fetchMetadata();
  }

  get hasAfter() {
    return this._hasAfter;
  }

  set hasAfter(value: boolean) {
    this._hasAfter = value;
    this.contextValue = this.generateContextValue();
  }

  constructor(
    public provider: LitDevTutorialTreeProvider,
    public tutorial: Tutorial,
    step: string
  ) {
    super(
      vscode.Uri.file(
        path.join(tutorial.path, step)
      ),
      vscode.TreeItemCollapsibleState.Collapsed
    );

    this.tutorial.pushStep(this);
    this.step = Number(step);
    this.tooltip = this.dirName;
    this.fetchMetadata();
  }

  updateContextValue() {
    this.contextValue = this.generateContextValue();
  }

  private fetchMetadata() {
    if (this.step === -1 || this.step === -2) {
      return;
    }
    const tutorialJson = getJson<TutorialJson>(
      path.join(this.tutorial.path, 'tutorial.json')
    );

    if (tutorialJson) {
      this.label = tutorialJson.steps[this.step].title;
      this.description = `[${this.dirName}]`;
      this.hasAfter = !!tutorialJson.steps[this.step].hasAfter;
      this.checkable = !!tutorialJson.steps[this.step].checkable;
    } else {
      this.label = this.dirName;
    }
  }

  get dirName() {
    return `${this.step}`.padStart(2, '0');
  }

  private generateContextValue() {
    const first = this.step === 0 ? '' : '-up';
    const last = this.step === this.tutorial.steps.length - 1 ? '' : '-down';
    const afterVal = this.hasAfter ? '' : '-add';

    return `tutorial-step${first}${last}${afterVal}`;
  }

  deleteFiles() {
    const tutorialJsonPath = path.join(this.tutorial.path, 'tutorial.json');
    const tutorialJson = getJson<TutorialJson>(tutorialJsonPath);
    tutorialJson?.steps.splice(this.dirName as unknown as number, 1);

    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));

    fs.rmdirSync(this.path, {recursive: true});
    fs.rmSync(
      path.join(
        this.provider.siteTutorialsContentPath,
        this.tutorial.dirName,
        `${this.dirName}.md`
      )
    );
  }

  delete() {
    this.tutorial.removeStep(this);
  }

  moveUp() {
    this.tutorial.moveStepUp(this);
  }

  moveDown() {
    this.tutorial.moveStepDown(this);
  }

  static async create(tutorial: Tutorial) {
    const provider = tutorial.provider;
    const dirName = `${tutorial.steps.length}`.padStart(2, '0');

    const title = await vscode.window.showInputBox({
      prompt: 'Step title',
      placeHolder: 'Styling the component',
      validateInput: (value: string) => {
        if (value.length === 0) {
          return 'Title is required.';
        }
        return null;
      },
    });

    if (!title) {
      return;
    }

    const checkableRaw = await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: 'Is this step checkable?',
    });

    if (checkableRaw === undefined) {
      return;
    }

    const checkable = checkableRaw === 'Yes';

    fs.mkdirSync(path.join(tutorial.path, dirName));
    fs.writeFileSync(
      path.join(
        provider.siteTutorialsContentPath,
        tutorial.dirName,
        `${dirName}.md`
      ),
      ''
    );

    const tutorialJsonPath = path.join(tutorial.path, 'tutorial.json');
    const tutorialJson = getJson<TutorialJson>(tutorialJsonPath)!;
    const jsonStep: TutorialJsonStep = {
      title,
      hasAfter: true,
    };

    if (checkable) {
      jsonStep.checkable = true;
    }
    tutorialJson.steps.push(jsonStep);


    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));

    const step = new TutorialStep(provider, tutorial, dirName);
    tutorial.pushStep(step);

    BeforeAfterDir.create(step, 'before');
    BeforeAfterDir.create(step, 'after');

    provider.refresh();
    return step;
  }

  async rename() {
    let newName = await vscode.window.showInputBox({
      prompt: 'New step name',
      value: this.label as string,
      validateInput: (value: string) => {
        if (value.length === 0) {
          return 'Name is required.';
        }
        return null;
      }
    });

    if (!newName) {
      return;
    }

    const tutorialJsonPath = path.join(this.tutorial.path, 'tutorial.json');
    const tutorialJson = getJson<TutorialJson>(tutorialJsonPath)!;
    tutorialJson.steps[this.step].title = newName;

    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));
    this.label = newName;
    this.provider.refresh();
  }
}
