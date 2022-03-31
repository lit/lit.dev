import * as fs from 'fs/promises';
import * as fss from 'fs';
import * as path from 'path';
import {TutorialJson} from '../types.js';

const findTestBinRoot = () => {
  const root = path.join(__dirname, '..', '..');
  return path.join(root, '.test-bin');
};

export const createEmptyLitDevRepo = async () => {
  const testBinPath = findTestBinRoot();
  const litDevPath = path.join(testBinPath, 'lit.dev');
  const litDevContentPath = path.join(
    litDevPath,
    'packages',
    'lit-dev-content'
  );
  const litDevSampleTutorialPath = path.join(
    litDevContentPath,
    'samples',
    'tutorials'
  );
  const litDevSiteTutorialPath = path.join(
    litDevContentPath,
    'site',
    'tutorials'
  );
  const litDevSiteTutorialContentPath = path.join(
    litDevSiteTutorialPath,
    'content'
  );

  await Promise.all([
    fs.mkdir(litDevSampleTutorialPath, {recursive: true}),
    fs.mkdir(litDevSiteTutorialContentPath, {recursive: true}),
  ]);

  const litDevPackageJson = {
    name: 'lit.dev',
  };

  const litDevContentPackageJson = {
    name: 'lit-dev-content',
  };

  const baseJson = {
    files: {
      'package.json': {
        content: '',
        hidden: true,
      },
    },
  };

  const tutorials11tyData = `
  const tutorials = await Promise.all([
    // Learn

    // Build

    // Draft
   ]);
`;

  await Promise.all([
    fs.writeFile(
      path.join(litDevPath, 'package.json'),
      JSON.stringify(litDevPackageJson, null, 2)
    ),
    fs.writeFile(
      path.join(litDevContentPath, 'package.json'),
      JSON.stringify(litDevContentPackageJson, null, 2)
    ),
    fs.writeFile(
      path.join(litDevSampleTutorialPath, 'base.json'),
      JSON.stringify(baseJson, null, 2)
    ),
    fs.writeFile(
      path.join(litDevSiteTutorialPath, 'tutorials.11tydata.js'),
      tutorials11tyData
    ),
  ]);

  return {litDevPath, litDevContentPath};
};

export const deleteLitDevRepo = async () => {
  const testBinPath = findTestBinRoot();
  const litDevPath = path.join(testBinPath, 'lit.dev');

  if (fss.existsSync(litDevPath)) {
    await fs.rm(litDevPath, {recursive: true});
  }
};

export const prepopulateTutorial = async (
  litDevContentPath: string,
  options: {
    tutorials: (TutorialJson & {dirName: string})[];
  } = {tutorials: []}
) => {
  const litDevSampleTutorialPath = path.join(
    litDevContentPath,
    'samples',
    'tutorials'
  );
  const litDevSiteTutorialPath = path.join(
    litDevContentPath,
    'site',
    'tutorials'
  );
  const litDevSiteTutorialContentPath = path.join(
    litDevSiteTutorialPath,
    'content'
  );

  const promises: Promise<unknown>[] = [];
  const dataFile = await (
    await fs.readFile(
      path.join(litDevSiteTutorialPath, 'tutorials.11tydata.js')
    )
  ).toString();
  const dataFileLines = dataFile.split('\n');

  for (const tutorial of options.tutorials) {
    const tutorialPath = path.join(litDevSampleTutorialPath, tutorial.dirName);
    const tutorialContentPath = path.join(
      litDevSiteTutorialContentPath,
      tutorial.dirName
    );
    promises.push(
      fs.mkdir(tutorialPath, {recursive: true}).then(() => {
        return Promise.all([
          fs.writeFile(path.join(tutorialPath, 'description.md'), ''),
          fs.writeFile(
            path.join(tutorialPath, 'tutorial.json'),
            JSON.stringify(tutorial, null, 2)
          ),
        ]);
      })
    );

    for (const [index, step] of tutorial.steps.entries()) {
      const stepDirName = `${index}`.padStart(2, '0');
      const stepDirPath = path.join(tutorialPath, stepDirName);
      const stepBeforePath = path.join(stepDirPath, 'before');
      const stepAfterPath = path.join(stepDirPath, 'after');

      const projectJson = {
        extends: '/samples/base.json',
        files: {
          'index.html': {},
        },
      };

      promises.push(
        fs.mkdir(stepBeforePath, {recursive: true}).then(() => {
          return Promise.all([
            fs.writeFile(path.join(stepBeforePath, 'index.html'), ''),
            fs.writeFile(
              path.join(stepBeforePath, 'project.json'),
              JSON.stringify(projectJson, null, 2)
            ),
          ]);
        })
      );

      if (step.hasAfter) {
        promises.push(
          fs.mkdir(stepAfterPath, {recursive: true}).then(() => {
            return Promise.all([
              fs.writeFile(path.join(stepAfterPath, 'index.html'), ''),
              fs.writeFile(
                path.join(stepAfterPath, 'project.json'),
                JSON.stringify(projectJson, null, 2)
              ),
            ]);
          })
        );
      }

      promises.push(
        fs.mkdir(tutorialContentPath, {recursive: true}).then(() => {
          return fs.writeFile(
            path.join(tutorialContentPath, `${stepDirName}.md`),
            ''
          );
        })
      );
    }
  }

  for (let i = options.tutorials.length - 1; i >= 0; i--) {
    const tutorial = options.tutorials[i];
    const tutorialSection = tutorial.category;
    const tutorialIndex = dataFileLines.findIndex((line) =>
      line.includes(`// ${tutorialSection}`)
    );

    const tutorialLine = `    loadTutorialData('${tutorial.dirName}'),`;
    dataFileLines.splice(tutorialIndex + 1, 0, tutorialLine);
  }

  promises.push(
    fs.writeFile(
      path.join(litDevSiteTutorialPath, 'tutorials.11tydata.js'),
      dataFileLines.join('\n')
    )
  );
  await Promise.all(promises);
};

// (async () => {
//   const litdevPath = await creteEmptyLitDevRepo();
//   await prepopulateTutorial(litdevPath.litDevContentPath, {
//     tutorials: [{
//       dirName: 'learn-tutorial',
//       category: 'Learn',
//       difficulty: 'Beginner',
//       duration: 65,
//       header: 'Learn Tutorial',
//       size: 'small',
//       steps: [
//         {
//           title: 'Step 1',
//           hasAfter: false,
//         },
//         {
//           title: 'Step 2',
//           hasAfter: false,
//         },
//         {
//           title: 'Step 3',
//           hasAfter: true,
//         },
//       ],
//     },
//     {
//       dirName: 'learn-2-tutorial',
//       category: 'Learn',
//       difficulty: 'Beginner',
//       duration: 65,
//       header: 'Learn Tutorial 2',
//       size: 'medium',
//       steps: [
//         {
//           title: 'First',
//           hasAfter: false,
//         },
//         {
//           title: 'Second',
//           hasAfter: false,
//         },
//         {
//           title: 'Third',
//           hasAfter: true,
//         },
//       ],
//     },
//     {
//       dirName: 'build-tutorial',
//       category: 'Build',
//       difficulty: 'Beginner',
//       duration: 65,
//       header: 'Build Tutorial',
//       size: 'medium',
//       steps: [
//         {
//           title: 'b1',
//           hasAfter: false,
//         },
//         {
//           title: 'b2',
//           hasAfter: false,
//         },
//         {
//           title: 'b3',
//           hasAfter: true,
//         },
//       ],
//     },
//     {
//       dirName: 'draft-tutorial',
//       category: 'Draft',
//       difficulty: 'Beginner',
//       duration: 65,
//       header: 'Draft Tutorial',
//       size: 'medium',
//       steps: [
//         {
//           title: 'd1',
//           hasAfter: false,
//         },
//         {
//           title: 'd2',
//           hasAfter: false,
//         },
//         {
//           title: 'd3',
//           hasAfter: true,
//         },
//       ],
//     }],
//   });
// })();
