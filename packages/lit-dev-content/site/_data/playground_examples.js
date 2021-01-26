const glob = require('fast-glob');
const fs = require('fs/promises');

module.exports = async () => {
  const paths = await glob('site/_includes/projects/examples/**/project.json');
  const sections = new Map();
  const jsons = await Promise.all(
    paths.map(async (path) => {
      const json = await fs.readFile(path, {encoding: 'utf8'});
      const project = JSON.parse(json);
      const shortPath = path.replace(
        /^site\/_includes\/projects\/(.+)\/project.json$/,
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
    .map(([name, files]) => ({name, files}))
    .sort((a, b) => a.name.localeCompare(b.name));
};
