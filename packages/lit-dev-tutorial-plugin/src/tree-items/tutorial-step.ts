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
  beforeDir!: BeforeAfterDir;
  afterDir: BeforeAfterDir|undefined = undefined;

  get dirName() {
    return `${this.step}`.padStart(2, '0');
  }

  get path() {
    return path.join(this.tutorial.path, this.dirName);
  }

  get step() {
    return this._step;
  }

  set step(value: number) {
    const oldPath = this.path;
    const oldInstructionsPath = path.join(
      this.provider.siteTutorialsContentPath,
      this.tutorial.dirName,
      `${this.dirName}.md`
    );
    const previousStep = this._step;

    this._step = value;
    const newInstructionsPath = path.join(
      this.provider.siteTutorialsContentPath,
      this.tutorial.dirName,
      `${this.dirName}.md`
    );

    if (previousStep !== -1) {
      fs.renameSync(oldPath, this.path);
      fs.renameSync(oldInstructionsPath, newInstructionsPath);
    }

    this.contextValue = this.generateContextValue();
    this.fetchMetadata();
  }

  get hasAfter() {
    return this._hasAfter;
  }

  set hasAfter(value: boolean) {
    if (this._hasAfter === value) {
      return;
    }

    this._hasAfter = value;

    const tutorialJsonPath = path.join(
      this.tutorial.path,
      'tutorial.json'
    );
    let tutorialJson = getJson<TutorialJson>(tutorialJsonPath)!;

    if (value) {
      this.solvable = true;
      tutorialJson = getJson<TutorialJson>(tutorialJsonPath)!;
      tutorialJson.steps[this.step].hasAfter = true;
    } else {
      if (this.afterDir) {
        this.afterDir.delete();
      }
      delete tutorialJson.steps[this.step].hasAfter;
    }

    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));
    this.updateContextValue();
  }

  private _solvable = false;

  set solvable(solvable: boolean) {
    if (this._solvable === solvable) {
      return;
    }

    this._solvable = solvable;
    const tutorialJsonPath = path.join(
      this.tutorial.path,
      'tutorial.json'
    );
    let tutorialJson = getJson<TutorialJson>(tutorialJsonPath)!;

    if (solvable) {
      delete tutorialJson.steps[this.step].noSolve;

    } else {
      this.hasAfter = false;
      tutorialJson = getJson<TutorialJson>(tutorialJsonPath)!;

      tutorialJson.steps[this.step].noSolve = true;
    }

    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));
    this.updateContextValue();
  }

  get solvable() {
    return this._solvable;
  }

  constructor(
    public provider: LitDevTutorialTreeProvider,
    public tutorial: Tutorial,
    step: string,
    solvable: boolean
  ) {
    super(
      vscode.Uri.file(path.join(tutorial.path, step)),
      vscode.TreeItemCollapsibleState.Collapsed
    );

    this._solvable = solvable;
    this.tutorial.pushStep(this);
    this.step = Number(step);
    this.tooltip = this.dirName;
    this.fetchMetadata();
    this.contextValue = this.generateContextValue();
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
      this.label = tutorialJson.steps[this.step]?.title;
      this.description = `[${this.dirName}]`;
      this.hasAfter = !!tutorialJson.steps[this.step]?.hasAfter;
      this.checkable = !!tutorialJson.steps[this.step]?.checkable;
    } else {
      this.label = this.dirName;
    }
  }

  private generateContextValue() {
    const first = this.step === 0 ? '' : '-up';
    const last = this.step === this.tutorial.steps.length - 1 ? '' : '-down';
    const afterVal = this.hasAfter ? '' : '-add';
    const solvable = this.solvable ? '-solvable' : '-unsolvable';

    return `tutorial-step${first}${last}${afterVal}${solvable}`;
  }

  deleteFiles() {
    const tutorialJsonPath = path.join(this.tutorial.path, 'tutorial.json');
    const tutorialJson = getJson<TutorialJson>(tutorialJsonPath);
    tutorialJson?.steps.splice(this.dirName as unknown as number, 1);

    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));

    fs.rmSync(this.path, {recursive: true});
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

    const isSolvableStr = await vscode.window.showQuickPick(['Yes', 'No'],{
      title: 'Should this step have a "solve" button?',
    });

    if (!isSolvableStr) {
      return;
    }

    const hideSolve = isSolvableStr !== 'Yes';
    let hasAfter = false;

    if (!hideSolve) {
      const hasAfterStr = await vscode.window.showQuickPick(['Yes', 'No'],{
        title: 'Is "after" step the "before" of the next step?',
      });

      if (!hasAfterStr) {
        return;
      }

      hasAfter = hasAfterStr === 'Yes';
    }

    const checkableRaw = await vscode.window.showQuickPick(['Yes', 'No'], {
      placeHolder: 'Is this step checkable?',
    });

    if (!checkableRaw) {
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

    if (hideSolve) {
      jsonStep.noSolve = true;
    }

    if (hasAfter) {
      jsonStep.hasAfter = true;
    }

    tutorialJson.steps.push(jsonStep);

    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));

    const step = new TutorialStep(provider, tutorial, dirName, hideSolve);
    tutorial.pushStep(step);

    const beforeStep = BeforeAfterDir.create(step, 'before');
    step.beforeDir = beforeStep;

    if (hasAfter && !hideSolve) {
      const afterStep = BeforeAfterDir.create(step, 'after');
      step.afterDir = afterStep;
    }

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
      },
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
