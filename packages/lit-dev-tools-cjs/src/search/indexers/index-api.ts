import {docIndexer, UrlToFile, walkDir} from './utils';
import path from 'path';

export const indexApi = async (outputDir: string, idOffset = 0) => {
  // Path to root documentation path, configurable so we can search _dev or _site.
  const API_PATH = path.resolve(
    __dirname,
    // Load the article content itself not the tags pages.
    `../../../../lit-dev-content/${outputDir}/docs/api`
  );

  const relativeLinksToHTMLFile: UrlToFile = await walkDir(
    API_PATH,
    new Map(),
    outputDir
  );

  return await docIndexer(
    relativeLinksToHTMLFile,
    {tag: 'api', type: 'API'},
    idOffset
  );
};
