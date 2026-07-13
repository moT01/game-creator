import { exec } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import type { RemoteInfo } from './types.js';

const execAsync = promisify(exec);

async function run(dir: string, args: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`git -C "${dir}" ${args}`);
    return stdout.trim();
  } catch {
    return null;
  }
}

function shortUrl(url: string): string {
  const match = url.match(/github\.com[/:](.+?)(?:\.git)?$/);
  return match ? match[1] : url;
}

async function trackingRef(dir: string, remote: string): Promise<string | null> {
  for (const branch of ['main', 'master']) {
    const ref = `refs/remotes/${remote}/${branch}`;
    if (await run(dir, `rev-parse --verify ${ref}`) !== null) return ref;
  }
  return null;
}

export function isOwnRepo(dir: string): boolean {
  return existsSync(join(dir, '.git'));
}

export async function getLocalHash(dir: string): Promise<string | null> {
  return run(dir, 'rev-parse --short=7 HEAD');
}

export async function getLocalDate(dir: string): Promise<string | null> {
  return run(dir, 'log -1 --format=%cr HEAD');
}

export async function getRemoteNames(dir: string): Promise<string[]> {
  const raw = await run(dir, 'remote');
  if (!raw) return [];
  const names = raw.split('\n').filter(Boolean);
  return names.sort((a, b) => {
    const order = ['origin', 'upstream'];
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });
}

export async function getRemoteInfo(dir: string, remote: string): Promise<RemoteInfo | null> {
  const fetched = await run(dir, `fetch ${remote}`) !== null;
  const ref = await trackingRef(dir, remote);
  const url = await run(dir, `remote get-url ${remote}`);

  const [hash, date, aheadRaw, behindRaw] = await Promise.all([
    ref ? run(dir, `rev-parse --short=7 ${ref}`) : null,
    ref ? run(dir, `log -1 --format=%cr ${ref}`) : null,
    ref ? run(dir, `rev-list --count ${ref}..HEAD`) : null,
    ref ? run(dir, `rev-list --count HEAD..${ref}`) : null,
  ]);

  return {
    hash,
    shortUrl: url ? shortUrl(url) : null,
    stale: !fetched,
    date,
    ahead: parseInt(aheadRaw ?? '0'),
    behind: parseInt(behindRaw ?? '0'),
  };
}
