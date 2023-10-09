export interface NpmPackage {
  description: string;
  ['dist-tags']: {[tag: string]: string};
}

export const fetchPackageInfo = async (
  pkgName: string,
  signal: AbortSignal
): Promise<NpmPackage> => {
  // Artificial delay for demo purposes
  await new Promise((r) => setTimeout(r, 1000));
  const response = await fetch(`https://registry.npmjs.org/${pkgName}`, {
    signal,
  });
  if (response.status === 200) {
    return response.json();
  } else {
    throw response.text();
  }
};
