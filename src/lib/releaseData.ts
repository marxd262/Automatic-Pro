import rawFamilies from '../data/releases.json';

export type DownloadEntry = {
  label: string;
  dose: string;
  variant: string;
  file: string;
  temperatureC: number;
  notes: string;
};

export type Build = {
  buildVersion: string;
  releaseDate: string;
  isLatest: boolean;
  notes: string;
  downloads: DownloadEntry[];
};

export type Family = {
  id: string;
  slug: string;
  displayName: string;
  futureDisplayName: string;
  status: 'stable' | 'testing';
  summary: string;
  imageHint?: string;
  builds: Build[];
};

export type CurrentDownload = DownloadEntry & {
  buildVersion: string;
  releaseDate: string;
};

export const releaseFamilies = rawFamilies as Family[];

function toNumberTuple(buildVersion: string): number[] {
  const matchedBuild = buildVersion.match(/v(?:it3|v?3|v?2)?_?([0-9_]+)/i);

  if (matchedBuild?.[1]) {
    return matchedBuild[1].split('_').map((chunk) => Number.parseInt(chunk, 10));
  }

  const digits = buildVersion.match(/\d+/g);
  return digits ? digits.map((chunk) => Number.parseInt(chunk, 10)) : [];
}

function compareNumberTuplesDesc(left: number[], right: number[]): number {
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const a = left[index] ?? -1;
    const b = right[index] ?? -1;

    if (a !== b) {
      return b - a;
    }
  }

  return 0;
}

export function compareBuildsDesc(left: Build, right: Build): number {
  const versionDiff = compareNumberTuplesDesc(toNumberTuple(left.buildVersion), toNumberTuple(right.buildVersion));

  if (versionDiff !== 0) {
    return versionDiff;
  }

  const dateDiff = new Date(right.releaseDate).getTime() - new Date(left.releaseDate).getTime();

  if (dateDiff !== 0) {
    return dateDiff;
  }

  if (left.isLatest !== right.isLatest) {
    return left.isLatest ? -1 : 1;
  }

  return 0;
}

export function sortBuilds(builds: Build[]): Build[] {
  return [...builds].sort(compareBuildsDesc);
}

export function getFamilyBySlug(slug: string): Family {
  const family = releaseFamilies.find((entry) => entry.slug === slug);

  if (!family) {
    throw new Error(`Unknown release family: ${slug}`);
  }

  return family;
}

export function getLatestBuild(family: Family): Build {
  return family.builds.find((build) => build.isLatest) ?? sortBuilds(family.builds)[0];
}

export function getCurrentDownloads(family: Family): CurrentDownload[] {
  const seen = new Set<string>();
  const result: CurrentDownload[] = [];

  for (const build of sortBuilds(family.builds)) {
    for (const download of build.downloads) {
      const key = `${download.label}::${download.variant}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      result.push({
        ...download,
        buildVersion: build.buildVersion,
        releaseDate: build.releaseDate,
      });
    }
  }

  return result.sort((left, right) => {
    const leftDose = Number.parseInt(left.dose, 10);
    const rightDose = Number.parseInt(right.dose, 10);
    const leftStandard = left.variant.toLowerCase().includes('standard') ? 0 : 1;
    const rightStandard = right.variant.toLowerCase().includes('standard') ? 0 : 1;

    if (leftDose !== rightDose) {
      return leftDose - rightDose;
    }

    if (leftStandard !== rightStandard) {
      return leftStandard - rightStandard;
    }

    return `${left.label} ${left.variant}`.localeCompare(`${right.label} ${right.variant}`);
  });
}

export function getHistoryBuilds(family: Family): Build[] {
  const latestBuild = getLatestBuild(family);
  return sortBuilds(family.builds).filter((build) => build.buildVersion !== latestBuild.buildVersion);
}

export function getDownloadPath(familySlug: string, buildVersion: string, fileName: string): string {
  return `downloads/${familySlug}/${buildVersion}/${encodeURIComponent(fileName)}`;
}
