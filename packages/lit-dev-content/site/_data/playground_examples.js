/**
 * @license
 * Copyright (c) 2021 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

const glob = require('fast-glob');
const fs = require('fs/promises');

const topSectionOrder = [
  'Basics',
  'Template concepts',
  'Directives',
];

const orderOf = (section) => {
  let order = topSectionOrder.indexOf(section);
  if (order < 0) {
    // Put non-top sections at bottom; these get compared by name
    order = Infinity;
  }
  return order;
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
  const jsons = await Promise.all(
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
      };
      let filesArr = sections.get(project.section);
      if (!filesArr) {
        filesArr = [];
        sections.set(project.section, filesArr);
      }
      filesArr.push(file);
    })
  );
  return [...sections.entries()]
    .map(([name, files]) => ({name, files, order: orderOf(name)}))
    .sort((a, b) => (a.order-b.order) || a.name.localeCompare(b.name));
};
