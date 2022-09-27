import fs from 'fs/promises';
import path from 'path';
import {DocType, UserFacingPageData} from '../plugin';
import {PageSearchChunker} from './PageSearchChunker';

/**
 * Map associating relative site url to the file path of the index.html file.
 */
export type UrlToFile = Map<string, string>;

/**
 * Populate a results map with all lit.dev static index.html pages and their
 * relative url paths.
 *
 * @param dir Directory to recursively walk
 * @param results Map we're mutating with relative url and absolute path.
 * @param shouldSkip Function that takes an absolute OS filepath and returns whether or not it should be indexed.
 * @returns mapping between lit.dev relative url and index.html file paths.
 */
export const walkDir = async (
  dir: string,
  results: UrlToFile,
  projectDir: string,
  shouldSkip = (_path: string) => false
): Promise<UrlToFile> => {
  const dirContents = await fs.readdir(dir);
  for (const contents of dirContents) {
    if (shouldSkip(path.join(dir, contents))) {
      continue;
    }
    if (path.extname(contents) === '.html') {
      const basePath = path.resolve(
        __dirname,
        `../../../../lit-dev-content/${projectDir}`
      );
      const relPathBase = path.relative(basePath, dir);
      const relPath = path.join(relPathBase, contents);
      results.set(relPath, path.resolve(dir, contents));
    } else if (path.extname(contents) === '') {
      await walkDir(
        path.resolve(dir, contents),
        results,
        projectDir,
        shouldSkip
      );
    }
  }

  return results;
};

export const docIndexer = async (
  relativeLinksToHTMLFile: UrlToFile,
  docType:
    | DocType<'Docs', 'docs'>
    | DocType<'API', 'api'>
    | DocType<'Article', 'article'>,
  idOffset: number
) => {
  let id = idOffset;
  const searchIndex: UserFacingPageData[] = [];
  for (const [relUrl, filePath] of relativeLinksToHTMLFile.entries()) {
    const pageContent = await fs.readFile(filePath, {encoding: 'utf8'});
    try {
      const pageToChunk = new PageSearchChunker(pageContent);
      const sanitizedPageChunks = pageToChunk.pageSearchChunks();

      if (sanitizedPageChunks.length === 0) {
        console.warn(`No search chunks found for ${relUrl}`);
        continue;
      }
      const parents = sanitizedPageChunks.filter((chunk) => chunk.isParent);
      if (parents.length !== 1) {
        throw new Error(
          `Error finding parent page chunk for ${relUrl}. Potential parent chunks found: ${parents.length}`
        );
      }

      const parent = parents[0];
      const parentId = id + 1;

      if (parent !== sanitizedPageChunks[0]) {
        throw new Error(
          `Parent page chunk for ${relUrl} was not the first chunk.`
        );
      }

      for (const pageChunk of sanitizedPageChunks) {
        const {title, heading, fragment, text} = pageChunk;

        // Filter out "See also" heading that always shows up because it's full
        // of keywords and links.
        if (heading === 'See also') {
          continue;
        }

        const entry: UserFacingPageData = {
          id: ++id,
          objectID: `${id}`,
          title: title.replace(/ – Lit$/, ''),
          heading,
          relativeUrl:
            '/' + relUrl.replace(/index.html$/, '') + (fragment ?? ''),
          text: text,
          docType,
        };

        if (pageChunk !== parent) {
          entry.parentID = `${parentId}`;
        }

        // Populate the search index. This is the text we fuzzy search and user
        // facing data to display in the suggested results.
        searchIndex.push(entry);
      }
    } catch (e: unknown) {
      throw new Error(
        `Failure while creating search index for page ` +
          `'${relUrl}': ${(e as Error).message}`
      );
    }
  }

  return searchIndex;
};
