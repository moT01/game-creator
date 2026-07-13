import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import type { RemoteInfo } from './types.js';

function run(dir: string, args: string): string | null {
  try {
    return execSync(`git -C "${dir}" ${args}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    }).trim();
  } catch {
    return null;
  }
}

function shortUrl(url: string): string {
  const match = url.match(/github\.com[/:](.+?)(?:\.git)?$/);
  return match ? match[1] : url;
}

function trackingRef(dir: string, remote: string): string | null {
  for (const branch of ['main', 'master']) {
    const ref = `refs/remotes/${remote}/${branch}`;
    if (run(dir, `rev-parse --verify ${ref}`) !== null) return ref;
  }
  return null;
}

export function isOwnRepo(dir: string): boolean {
  return existsSync(join(dir, '.git'));
}

export function getLocalHash(dir: string): string | null {
  return run(dir, 'rev-parse --short=7 HEAD');
}

export function getLocalDate(dir: string): string | null {
  return run(dir, 'log -1 --format=%cr HEAD');
}

export function getRemoteNames(dir: string): string[] {
  const raw = run(dir, 'remote');
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

function hasRemote(dir: string, remote: string): boolean {
  return run(dir, 'remote')?.split('\n').includes(remote) ?? false;
}

function fetchRemote(dir: string, remote: string): boolean {
  return run(dir, `fetch ${remote}`) !== null;
}

export function getRemoteInfo(dir: string, remote: string): RemoteInfo | null {
  if (!hasRemote(dir, remote)) return null;

  const fetched = fetchRemote(dir, remote);
  const ref = trackingRef(dir, remote);
  const url = run(dir, `remote get-url ${remote}`);

  const hash = ref ? run(dir, `rev-parse --short=7 ${ref}`) : null;
  const date = ref ? run(dir, `log -1 --format=%cr ${ref}`) : null;
  const ahead = ref ? parseInt(run(dir, `rev-list --count ${ref}..HEAD`) ?? '0') : 0;
  const behind = ref ? parseInt(run(dir, `rev-list --count HEAD..${ref}`) ?? '0') : 0;

  return {
    hash,
    shortUrl: url ? shortUrl(url) : null,
    stale: !fetched,
    date,
    ahead,
    behind,
  };
}
