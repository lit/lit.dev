/**
 * @license
 * Copyright 2022 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import {TutorialCategory} from './types';

const pathExists = (p: string): boolean => {
  try {
    fs.accessSync(p);
  } catch (err) {
    return false;
  }
  return true;
};

export const getJson = <T = unknown>(packageJsonPath: string): T | null => {
  if (pathExists(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    return packageJson;
  } else {
    return null;
  }
};

export const addTutorialTo11tyData = (
  dirname: string,
  category: TutorialCategory,
  filepath: string
) => {
  const lines = fs.readFileSync(filepath, 'utf8').split('\n');
  let arrayStartLine = -1;
  let arrayEndLine = -1;
  let categoryLines: {cat: TutorialCategory; line: number}[] = [];

  for (const [i, line] of lines.entries()) {
    if (line.includes(`const tutorials = await Promise.all([`)) {
      arrayStartLine = i;
    } else if (line.includes(`  ]);`)) {
      arrayEndLine = i;
      break;
    } else if (
      line.includes('// ') &&
      arrayStartLine !== -1 &&
      i > arrayStartLine &&
      arrayEndLine === -1
    ) {
      const cat = line.split('// ')[1].trim() as TutorialCategory;
      categoryLines.push({cat, line: i});
    }
  }

  if (arrayStartLine === -1 || arrayEndLine === -1) {
    vscode.window.showErrorMessage('Malformed tutorials.11tydata.js');
    return;
  }

  let line = -1;
  let categoryIndex = -1;

  for (const [i, {cat, line: lineNum}] of categoryLines.entries()) {
    if (cat === category) {
      line = lineNum;
      categoryIndex = i;
      break;
    }
  }

  if (line === -1) {
    vscode.window.showErrorMessage(
      'Cannot find category ${category} in tutorials.11tydata.js'
    );
    return;
  }

  let insertionLine = -1;
  const isLastCategory = categoryIndex === categoryLines.length - 1;

  if (isLastCategory) {
    insertionLine = arrayEndLine;
  } else {
    insertionLine = categoryLines[categoryIndex + 1].line - 1;
  }

  const newLine = `    loadTutorialData('${dirname}'),`;

  lines.splice(insertionLine, 0, newLine);

  fs.writeFileSync(filepath, lines.join('\n'));
};

export const removeTutorialFrom11tyData = (
  dirname: string,
  filepath: string
) => {
  const lines = fs.readFileSync(filepath, 'utf8').split('\n');
  const index = lines.findIndex((line) =>
    line.includes(`loadTutorialData('${dirname}')`)
  );
  lines.splice(index, 1);
  if (index === -1) {
    return;
  }
  fs.writeFileSync(filepath, lines.join('\n'));
};
