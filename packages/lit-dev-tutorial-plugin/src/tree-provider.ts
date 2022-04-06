/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {Tutorial} from './tree-items/tutorial';
import {GenericFile} from './tree-items/generic-file';
import {TutorialStep} from './tree-items/tutorial-step';
import {getJson} from './fs-helpers';
import {BeforeAfterDir} from './tree-items/before-after-dir';
import {PlaygroundFile} from './tree-items/playground-file';
import { TutorialJson } from './types';

interface PackageJson {
  name?: string;
}

export type TutorialTreeItem =
  | Tutorial
  | GenericFile
  | TutorialStep
  | BeforeAfterDir
  | PlaygroundFile;

export class LitDevTutorialTreeProvider
  implements vscode.TreeDataProvider<TutorialTreeItem>
{
  get workspaceRoot() {
    return vscode.workspace.workspaceFolders?.[0].uri.fsPath!;
  }

  private _contentPath = '';

  get contentPath() {
    return path.join(this.workspaceRoot, this._contentPath);
  }

  get samplesTutorialsPath() {
    return path.join(this.contentPath, 'samples', 'tutorials');
  }

  get siteTutorialsPath() {
    return path.join(this.contentPath, 'site', 'tutorials');
  }

  get siteTutorialsContentPath() {
    return path.join(this.contentPath, 'site', 'tutorials', 'content');
  }

  private _onDidChangeTreeData = new vscode.EventEmitter<
    TutorialTreeItem | undefined | null | void
  >();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  getTreeItem(element: TutorialTreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: TutorialTreeItem): TutorialTreeItem[] {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No dependency in empty workspace');
      return [];
    }

    if (element) {
      return this.onChild(element);
    } else {
      // initial load
      return this.onInitChildren();
    }
  }

  private onInitChildren() {
    let contentPath = '';
    const possContentPath = path.join(
      this.workspaceRoot,
      'packages',
      'lit-dev-content'
    );

    const rootPackageJsonPath = path.join(this.workspaceRoot, 'package.json');
    const contentPackageJsonPath = path.join(possContentPath, 'package.json');

    const [rootPackage, contentPackage] = [
      getJson<PackageJson>(rootPackageJsonPath),
      getJson<PackageJson>(contentPackageJsonPath),
    ];

    // determine whether we are in a lit.dev repo or the lit-dev-content
    // subpackage
    if (rootPackage?.name === 'lit-dev-content') {
      contentPath = '.';
    } else if (contentPackage?.name === 'lit-dev-content') {
      contentPath = path.relative(this.workspaceRoot, possContentPath);
    }

    this._contentPath = contentPath;

    let items: TutorialTreeItem[] = [];

    if (contentPath) {
      items = [...items, ...this.getInitialContent()];

      return items;
    } else {
      vscode.window.showInformationMessage('This is not a lit.dev workspace.');
      return [];
    }
  }

  private onChild(element: TutorialTreeItem): TutorialTreeItem[] {
    if (element instanceof Tutorial) {
      return this.onTutorial(element);
    } else if (element instanceof TutorialStep) {
      return this.onTutorialStep(element);
    } else if (element instanceof BeforeAfterDir) {
      return this.onBeforeAfterDir(element);
    }

    return [];
  }

  private onTutorial(element: Tutorial) {
    const tutorialPath = path.join(this.samplesTutorialsPath, element.dirName);
    const tutorialDirEntries = fs.readdirSync(tutorialPath, {
      withFileTypes: true,
    });
    const tutorialStepEntries = tutorialDirEntries.filter((file) =>
      file.isDirectory()
    );
    const tutorialFileEntries = tutorialDirEntries.filter((file) =>
      file.isFile()
    );

    const tutorialJson = getJson<TutorialJson>(path.join(element.path, 'tutorial.json'))!;
    const jsonSteps = tutorialJson.steps;

    const steps = tutorialStepEntries.map(
      (step, index) => {
        const jsonStep = jsonSteps[index];
        return new TutorialStep(this, element, step.name, !jsonStep.noSolve)
      }
    );
    const files = tutorialFileEntries.map(
      (file) => new GenericFile(this, path.join(tutorialPath, file.name))
    );
    return [...steps, ...files];
  }

  private onTutorialStep(element: TutorialStep) {
    const tutorialPath = element.path;
    const tutorialEntries = fs.readdirSync(tutorialPath, {withFileTypes: true});
    const tutorialDirEntries = tutorialEntries.filter(
      (file) =>
        (file.isDirectory() && file.name === 'before') || file.name === 'after'
    ).reverse();

    const beforeAfterDirs = tutorialDirEntries.map(
      (entry) => {
        const dir = new BeforeAfterDir(this, element, entry.name as 'before' | 'after')
        if (entry.name === 'before') {
          element.beforeDir = dir;
        } else if (entry.name === 'after') {
          element.afterDir = dir;
        }

        return dir;
      }
    );

    const stepInstructionsMdFile = new GenericFile(
      this,
      path.join(
        this.siteTutorialsContentPath,
        element.tutorial.dirName,
        `${element.dirName}.md`
      ),
      {
        label: 'Instructions',
        tooltip: `${element.dirName}.md`,
      }
    );

    return [...beforeAfterDirs, stepInstructionsMdFile];
  }

  private onBeforeAfterDir(element: BeforeAfterDir) {
    const tutorialPath = element.path;
    const tutorialEntries = fs.readdirSync(tutorialPath, {withFileTypes: true});
    const tutorialFileEntries = tutorialEntries.filter((file) => file.isFile());

    const files = tutorialFileEntries.map((file) => {
      if (file.name === 'project.json') {
        return new GenericFile(this, path.join(tutorialPath, file.name));
      } else {
        return new PlaygroundFile(this, element, file.name);
      }
    });

    const projectJsonFile = files.find((file) => file instanceof GenericFile)!;
    const playgroundFiles = files.filter((file) => !(file instanceof GenericFile));

    return [...playgroundFiles, projectJsonFile];
  }

  private getInitialContent() {
    const samplesDir = fs.readdirSync(this.samplesTutorialsPath, {
      withFileTypes: true,
    });

    const samplesPath = path.join(this.contentPath, 'samples');
    const configEntries = fs.readdirSync(samplesPath, {
      withFileTypes: true,
    });
    const tutorialDirs = samplesDir.filter((dir) => dir.isDirectory());
    const configs = configEntries.filter(
      (dir) =>
        dir.name.endsWith('.json') &&
        dir.isFile() &&
        dir.name !== 'tsconfig.json'
    );

    const tutorialDataFilePath = path.join(
      this.siteTutorialsPath,
      'tutorials.11tydata.js'
    );

    const tutorials: Tutorial[] = [];

    tutorialDirs.forEach((dir) => tutorials.push(new Tutorial(this, dir.name)));

    const configsFiles: GenericFile[] = [];

    configs.forEach((config) =>
      configsFiles.push(
        new GenericFile(this, path.join(samplesPath, config.name))
      )
    );

    return [
      ...tutorials,
      ...configsFiles,
      new GenericFile(this, tutorialDataFilePath),
    ];
  }

  refresh() {
    this._onDidChangeTreeData.fire();
  }

  createTutorial() {
    Tutorial.create(this);
  }
}
