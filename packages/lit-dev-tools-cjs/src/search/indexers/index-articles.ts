import {docIndexer, UrlToFile, walkDir} from './utils';
import path from 'path';

export const indexArticles = async (outputDir: string, idOffset = 0) => {
  // Path to root documentation path, configurable so we can search _dev or _site.
  const ARTICLES_PATH = path.resolve(
    __dirname,
    // Load the article content itself not the tags pages.
    `../../../../lit-dev-content/${outputDir}/articles`
  );

  const skipFiles = (filepath: string) => {
    // These pages are tag feeds and are not structured in a way the
    // search indexer can understand.
    const badPathParts = [
      ['articles', 'tags'],
      ['articles', 'index.html'],
      // Articles are hoisted to /article/article-name/index.html for url
      // readability. This file exists only for 11ty navigation plugin.
      ['articles', 'article'],
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
    ARTICLES_PATH,
    new Map(),
    outputDir,
    skipFiles
  );

  return await docIndexer(
    relativeLinksToHTMLFile,
    {tag: 'article', type: 'Article'},
    idOffset
  );
};
