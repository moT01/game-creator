import type { RepoRow, RemoteInfo } from './types.js';

const COL_LABEL = 12;
const COL_HASH = 11;
const COL_IND = 2;
const COL_AB = 10;
const COL_DATE = 16;
const COL_URL = 60;
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

function abStr(ahead: number, behind: number): string {
  if (ahead === 0 && behind === 0) return '+0 -0';
  const a = ahead > 0 ? `+${ahead}` : '+0';
  const b = behind > 0 ? `-${behind}` : '-0';
  return `${a} ${b}`;
}

function remoteInd(info: RemoteInfo, localHash: string | null): string {
  if (!info.hash) return ' '.repeat(COL_IND);
  if (info.hash === localHash) return `${GREEN}✓${RESET} `;
  if (info.behind > 0) return `${YELLOW}⚠${RESET} `;
  return `${RED}✗${RESET} `;
}

function deployedInd(deployedHash: string | null, localHash: string | null): string {
  if (!deployedHash) return ' '.repeat(COL_IND);
  if (deployedHash === localHash) return `${GREEN}✓${RESET} `;
  return `${RED}✗${RESET} `;
}

function blueUrl(url: string, width: number): string {
  return `${BLUE}${url}${RESET}${' '.repeat(Math.max(0, width - url.length))}`;
}

function remoteRow(label: string, info: RemoteInfo, localHash: string | null): string {
  const indicator = remoteInd(info, localHash);
  const hash = ((info.hash ?? '-') + (info.stale ? '?' : '')).padEnd(COL_HASH);
  const ab = (info.hash ? abStr(info.ahead, info.behind) : '-').padEnd(COL_AB);
  const date = (info.date ?? '-').padEnd(COL_DATE);
  const url = info.shortUrl
    ? blueUrl(`https://github.com/${info.shortUrl}`, COL_URL)
    : '-'.padEnd(COL_URL);
  return `  ${label.padEnd(COL_LABEL)}${indicator}${hash}${ab}${date}${url}`;
}

export function printTable(rows: RepoRow[]): void {
  const hr = '-'.repeat(COL_LABEL + COL_IND + COL_HASH + COL_AB + COL_DATE + COL_URL);
  const header =
    `  ${''.padEnd(COL_LABEL)}` +
    `${''.padEnd(COL_IND)}` +
    `${'HASH'.padEnd(COL_HASH)}` +
    `${'+/-'.padEnd(COL_AB)}` +
    `${'DATE'.padEnd(COL_DATE)}` +
    `URL`;

  console.log(header);
  console.log(hr);

  const total = rows.length;
  let gitCount = 0;
  let noRepoCount = 0;

  for (const row of rows) {
    console.log();

    if (!row.isRepo) {
      noRepoCount++;
      console.log(`${row.name}\n  -`);
      continue;
    }

    gitCount++;
    const localHash = row.localHash ?? null;
    const deployedHash = row.deployed?.hash ?? null;
    const remotes = row.remotes ?? [];

    const anyRemoteAhead = remotes.some(r => r.info.behind > 0);
    const localInd = !localHash
      ? ' '.repeat(COL_IND)
      : anyRemoteAhead
        ? `${YELLOW}⚠${RESET} `
        : `${GREEN}✓${RESET} `;

    const deployedUrl = row.deployed?.siteUrl
      ? blueUrl(row.deployed.siteUrl, COL_URL)
      : '-';

    console.log(row.name);
    console.log(`  ${'local'.padEnd(COL_LABEL)}${localInd}${(localHash ?? '-').padEnd(COL_HASH)}${' '.repeat(COL_AB)}${(row.localDate ?? '-').padEnd(COL_DATE)}`);
    for (const remote of remotes) {
      console.log(remoteRow(remote.name, remote.info, localHash));
    }
    console.log(`  ${'deployed'.padEnd(COL_LABEL)}${deployedInd(deployedHash, localHash)}${(deployedHash ?? '-').padEnd(COL_HASH)}${' '.repeat(COL_AB)}${(row.deployed?.date ?? '-').padEnd(COL_DATE)}${deployedUrl}`);
  }

  console.log();
  console.log(hr);
  console.log(`${total} repos  |  ${gitCount} git  |  ${noRepoCount} not a repo yet`);
  console.log();
}
