import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { DeployInfo } from './types.js';

function relativeTime(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? '1 month ago' : `${months} months ago`;
}

function getSiteUrl(dir: string): string | null {
  try {
    const content = readFileSync(join(dir, 'platform.yaml'), 'utf8');
    const match = content.match(/^site:\s*(.+)$/m);
    return match ? `https://${match[1].trim()}.freecode.camp` : null;
  } catch {
    return null;
  }
}

export function getDeployedInfo(dir: string): DeployInfo | null {
  try {
    const raw = execSync('universe static ls --json', {
      cwd: dir,
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const data = JSON.parse(raw);
    if (!data.success) return null;

    const production = data.deploys?.find((d: { state: string }) => d.state === 'production');
    if (!production) return null;

    return {
      hash: production.sha,
      date: relativeTime(production.timestamp),
      siteUrl: getSiteUrl(dir),
    };
  } catch {
    return null;
  }
}
