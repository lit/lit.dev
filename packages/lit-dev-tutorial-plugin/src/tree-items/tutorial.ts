/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import {LitDevTutorialTreeProvider} from '../tree-provider';
import {
  TutorialCardSize,
  TutorialCategory,
  TutorialDifficulty,
  TutorialJson,
} from '../types';
import {TutorialStep} from './tutorial-step';
import {
  addTutorialTo11tyData,
  getJson,
  removeTutorialFrom11tyData,
} from '../fs-helpers';

export class Tutorial extends vscode.TreeItem {
  steps: TutorialStep[] = [];

  get path() {
    return path.join(this.provider.samplesTutorialsPath, this.dirName);
  }

  constructor(
    public provider: LitDevTutorialTreeProvider,
    readonly dirName: string
  ) {
    super(
      vscode.Uri.file(path.join(provider.samplesTutorialsPath, dirName)),
      vscode.TreeItemCollapsibleState.Collapsed
    );
    this.tooltip = dirName;
    this.init();
    this.contextValue = 'tutorial';
  }

  async init() {
    const tutorialJson = getJson<TutorialJson>(
      path.join(
        this.provider.samplesTutorialsPath,
        this.dirName,
        'tutorial.json'
      )
    );

    if (tutorialJson) {
      this.label = tutorialJson.header;
    } else {
      this.label = `tutorial.json not found for ${this.dirName}`;
    }
  }

  pushStep(step: TutorialStep) {
    this.steps.push(step);
    this.steps[this.steps.length - 2]?.updateContextValue();
  }

  static async create(provider: LitDevTutorialTreeProvider) {
    let dirName = await vscode.window.showInputBox({
      prompt: 'Directory name',
      placeHolder: 'my-tutorial',
      validateInput: (value) => {
        if (!value) {
          return 'Please enter a directory name';
        }

        const actualName = value.split(' ').join('-');

        if (
          fs.existsSync(path.join(provider.samplesTutorialsPath, actualName))
        ) {
          return 'Directory already exists';
        }

        return null;
      },
    });

    if (dirName === undefined) {
      return;
    }

    dirName = dirName.split(' ').join('-');

    const name = await vscode.window.showInputBox({
      prompt: 'Tutorial name',
      placeHolder: 'My Tutorial',
      validateInput: (value) => {
        if (!value) {
          return 'Please enter a tutorial name';
        }

        return null;
      },
    });

    if (name === undefined) {
      return;
    }

    const difficulty = (await vscode.window.showQuickPick(
      ['Beginner', 'Intermediate', 'Advanced', ''],
      {
        placeHolder: 'Difficulty',
      }
    )) as TutorialDifficulty|undefined;

    if (difficulty === undefined) {
      return;
    }

    const size = (await vscode.window.showQuickPick(
      ['tiny', 'small', 'medium', 'large'],
      {
        title: 'Card size',
      }
    )) as TutorialCardSize|undefined;

    if (size === undefined) {
      return;
    }

    const duration = (await vscode.window.showInputBox({
      prompt: 'Duration (mins)',
      value: '0',
      validateInput: (value) => {
        if (!value) {
          return 'Please enter a duration';
        }

        const duration = parseInt(value);

        if (isNaN(duration)) {
          return 'Please enter a valid duration';
        }

        return null;
      },
    })) as unknown as number|undefined;

    if (duration === undefined) {
      return;
    }

    const category = (await vscode.window.showQuickPick(
      ['Learn', 'Build', 'Draft'],
      {
        title: 'Catalog Category',
      }
    )) as TutorialCategory|undefined;

    if (category === undefined) {
      return;
    }

    const imgSrc = await vscode.window.showInputBox({
      prompt: 'Card Image source (optional)',
      placeHolder: '/images/tutorials/my-tutorial/card-image.png',
    });

    let imgAlt = '';

    if (imgSrc) {
      imgAlt = (await vscode.window.showInputBox({
        prompt: 'Image alt text',
        validateInput: (value) => {
          if (!value) {
            return 'Please enter an alt text';
          }

          return null;
        },
      })) as string;
    }

    const tutorialPath = path.join(provider.samplesTutorialsPath, dirName);

    const tutorialContentPath = path.join(
      provider.siteTutorialsContentPath,
      dirName
    );

    try {
      fs.mkdirSync(tutorialPath);
      fs.mkdirSync(tutorialContentPath);
    } catch (_e) {}

    const tutorialJson: TutorialJson = {
      header: name,
      difficulty: difficulty,
      size: size,
      duration: duration,
      category: category,
      imgSrc,
      imgAlt,
      steps: [],
    };

    fs.writeFileSync(
      path.join(tutorialPath, 'tutorial.json'),
      JSON.stringify(tutorialJson, null, 2)
    );

    fs.writeFileSync(path.join(tutorialPath, 'description.md'), '');

    await addTutorialTo11tyData(
      dirName,
      category,
      path.join(provider.siteTutorialsPath, 'tutorials.11tydata.js')
    );

    provider.refresh();

    return new Tutorial(provider, dirName);
  }

  delete() {
    fs.rmdirSync(this.path, {recursive: true});
    fs.rmdirSync(
      path.join(this.provider.siteTutorialsContentPath, this.dirName),
      {recursive: true}
    );
    removeTutorialFrom11tyData(
      this.dirName,
      path.join(this.provider.siteTutorialsPath, 'tutorials.11tydata.js')
    );
    this.provider.refresh();
  }

  removeStep(stepItem: TutorialStep) {
    this.steps = this.steps.sort((a, b) => a.step - b.step);
    stepItem.deleteFiles();

    this.steps.splice(stepItem.step, 1);

    for (let i = stepItem.step; i < this.steps.length; i++) {
      const step = this.steps[i];
      step.step -= 1;
    }

    this.provider.refresh();
  }

  moveStepUp(stepItem: TutorialStep) {
    this.steps = this.steps.sort((a, b) => a.step - b.step);

    if (stepItem.step === 0) {
      return;
    }

    const prevStepItem = this.steps[stepItem.step - 1];
    const index = stepItem.step;
    const previousIndex = prevStepItem.step;

    // prevent fs.renameSync from throwing an error
    stepItem.step = -2;
    prevStepItem.step = index;
    stepItem.step = previousIndex;

    this.steps[stepItem.step] = stepItem;
    this.steps[prevStepItem.step] = prevStepItem;

    const tutorialJsonPath = path.join(this.path, 'tutorial.json');
    const tutorialJson = getJson<TutorialJson>(tutorialJsonPath)!;
    const jsonStep = tutorialJson?.steps[index];
    const jsonPrevStep = tutorialJson?.steps[previousIndex];
    tutorialJson.steps[index] = jsonPrevStep;
    tutorialJson.steps[previousIndex] = jsonStep;
    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));

    this.provider.refresh();
  }

  moveStepDown(stepItem: TutorialStep) {
    this.steps = this.steps.sort((a, b) => a.step - b.step);

    if (stepItem.step === this.steps.length - 1) {
      return;
    }

    const nextStepItem = this.steps[stepItem.step + 1];
    const index = stepItem.step;
    const nextIndex = nextStepItem.step;

    stepItem.step = -2;
    nextStepItem.step = index;
    stepItem.step = nextIndex;

    this.steps[stepItem.step] = stepItem;
    this.steps[nextStepItem.step] = nextStepItem;

    const tutorialJsonPath = path.join(this.path, 'tutorial.json');
    const tutorialJson = getJson<TutorialJson>(tutorialJsonPath)!;
    const jsonStep = tutorialJson?.steps[index];
    const jsonNextStep = tutorialJson?.steps[nextIndex];
    tutorialJson.steps[index] = jsonNextStep;
    tutorialJson.steps[nextIndex] = jsonStep;

    fs.writeFileSync(tutorialJsonPath, JSON.stringify(tutorialJson, null, 2));

    this.provider.refresh();
  }
}
