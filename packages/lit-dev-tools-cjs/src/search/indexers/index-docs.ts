import path from 'path';
import {docIndexer, UrlToFile, walkDir} from './utils';

/**
 * Plugin that scans and indexes the lit.dev /docs directory into a search index
 * that can be used to search the website. The search index is written to
 * `/searchIndex.json`. This is accessible by the client via:
 * `https://lit.dev/searchIndex.json`.
 */
export const indexDocs = async (outputDir: string, idOffset = 0) => {
  // Path to root documentation path, configurable so we can search _dev or _site.
  const DOCS_PATH = path.resolve(
    __dirname,
    `../../../../lit-dev-content/${outputDir}/docs`
  );

  const skipFiles = (filepath: string) => {
    // These pages are tag feeds and are not structured in a way the
    // search indexer can understand.
    const badPathParts = [
      ['docs', 'internal'],
      ['docs', 'v1'],
      ['docs', 'api'],
    ];
    if (
      badPathParts.some((badPathpart) => {
        const badPath = path.join(...badPathpart);
        return filepath.includes(badPath);
      })
    ) {
      return true;
    }

    return false;
  };

  const relativeLinksToHTMLFile: UrlToFile = await walkDir(
    DOCS_PATH,
    new Map(),
    outputDir,
    skipFiles
  );

  return await docIndexer(
    relativeLinksToHTMLFile,
    {tag: 'docs', type: 'Docs'},
    idOffset
  );
};
