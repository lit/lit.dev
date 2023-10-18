/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

const glob = require('fast-glob');
const fs = require('fs/promises');

const topSectionOrder = [
  'Basics',
  'Reactive properties',
  'Template concepts',
  'Directives',
  'Managing Data',
  '@lit/react',
  '@lit-labs/motion'
];

const orderOf = (section) => {
  let order = topSectionOrder.indexOf(section);
  // Put non-top sections at bottom; these get compared by name
  return order < 0 ? Infinity : order;
}

// Create a data source, accessible to templates by the name of this file, that
// describes the projects that are shown in the "Examples" drawer on the
// playground page.
//
// See https://www.11ty.dev/docs/data-global/
// and https://www.11ty.dev/docs/data-js/
module.exports = async () => {
  const paths = await glob('samples/examples/**/project.json');
  const sections = new Map();
  await Promise.all(
    paths.map(async (path) => {
      const json = await fs.readFile(path, {encoding: 'utf8'});
      const project = JSON.parse(json);
      if (project.hide) {
        return;
      }
      const shortPath = path.replace(
        /^samples\/(.+)\/project.json$/,
        '$1'
      );
      const file = {
        project: shortPath,
        title: project.title,
        description: project.description,
        order: project.order ?? Number.MAX_VALUE
      };
      let filesArr = sections.get(project.section);
      if (!filesArr) {
        filesArr = [];
        sections.set(project.section, filesArr);
      }
      filesArr.push(file);
    })
  );
  for (const examples of sections.values()) {
    examples.sort((a, b) => {
      if (a.order !== b.order) {
        return a.order - b.order;
      }
      return a.title.localeCompare(b.title);
    });
  }
  return [...sections.entries()]
    .map(([name, files]) => ({name, files, order: orderOf(name)}))
    .sort((a, b) => (a.order-b.order) || a.name.localeCompare(b.name));
};
