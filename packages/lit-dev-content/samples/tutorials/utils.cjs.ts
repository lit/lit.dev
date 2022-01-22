import fs from 'fs/promises';
import path from 'path';

export type CardSize = 'tiny'|'small'|'medium'|'large';
export type TutorialDifficulty = 'Beginner'|'Intermediate'|'Advanced';
export type Category = 'Learn'|'Build';

/**
 * Tutorial Data used for card and 11ty generating cards and links.
 *
 * header: Header / title text of the card
 *
 * size: height of the card:
 *     tiny: 1 cell - only a title
 *     small: 2 cells - title + image || title + short description
 *     medium: 3 cells - title + long desc || title + med desc + image
 *     large: 4 cells - write a dictionary in here with images
 *
 * difficulty: percieved difficulty for the user
 *
 * duration: duration of the tutorial in minutes e.g. (2hrs 10mins == 130)
 *
 * description: description text for the card
 *
 * imgSrc: src (relative to app root) of the image. e.g. images/icon.svg
 *
 * imgAlt: alt text for the image
 *
 * hideDescription: For when you need to hide the description because there is
 * no description e.g. size: 'small' + header + image + hideDescription:true
 *
 * category: Which category the tutorial card should appear in in the catalog
 *
 * location: slug / directory name of the tutorial. e.g. `intro-to-lit` or
 * `templating/advanced` `templating/intermediate`.
 */
export interface TutorialData {
  header: string;
  size: CardSize;
  difficulty: TutorialDifficulty;
  duration: number;
  description?: string;
  imgSrc?: string;
  imgAlt?: string;
  hideDescription?: boolean;
  category: Category;
}

/**
 * Tutorial step metadata.
 *
 * title: title to be displayed in the tutorial description step
 */
export interface Step {
  title: string;
}

/**
 * Manifest format the actual tutorial page uses to render the tutorial.
 */
export interface TutorialManifest {
  steps: Step[];
}

/**
 * Generates a manifest.json file in the output js directory. This is fetched by
 * the tutorial as 11ty won't allow us to directly import them from this
 * directory.
 *
 * @param manifest Manifest JSON object to be generated
 * @param tutorialName Slug / tutorial directory name for the manifest
 */
export const generateManifest = async(manifest: TutorialManifest, tutorialName: string) => {
  const manifestFilepath = path.join(__dirname, tutorialName, 'manifest.json');
  await fs.writeFile(manifestFilepath, JSON.stringify(manifest), {encoding: 'utf8'});
}