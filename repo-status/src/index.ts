import { readdirSync, statSync } from 'fs';
import { join } from 'path';
import { GAMES_DIR } from './config.js';
import { isOwnRepo, getLocalHash, getLocalDate, getRemoteNames, getRemoteInfo } from './git.js';
import { getDeployedInfo } from './deploy.js';
import { printTable } from './output.js';
import type { RepoRow } from './types.js';

const filter = process.argv[2];

const games = readdirSync(GAMES_DIR)
  .filter(name => statSync(join(GAMES_DIR, name)).isDirectory())
  .filter(name => !filter || name === filter)
  .sort();

const rows: RepoRow[] = games.map(name => {
  const dir = join(GAMES_DIR, name);

  if (!isOwnRepo(dir)) {
    return { name, isRepo: false };
  }

  const remoteNames = getRemoteNames(dir);
  const remotes = remoteNames
    .map(remoteName => {
      const info = getRemoteInfo(dir, remoteName);
      return info ? { name: remoteName, info } : null;
    })
    .filter(r => r !== null);

  return {
    name,
    isRepo: true,
    localHash: getLocalHash(dir),
    localDate: getLocalDate(dir),
    remotes,
    deployed: getDeployedInfo(dir),
  };
});

printTable(rows);
