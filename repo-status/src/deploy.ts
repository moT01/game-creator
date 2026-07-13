import { exec } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';
import { promisify } from 'util';
import type { DeployInfo } from './types.js';

const execAsync = promisify(exec);

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

export async function getDeployedInfo(dir: string): Promise<DeployInfo | null> {
  try {
    const { stdout } = await execAsync('universe static ls --json', { cwd: dir });
    const data = JSON.parse(stdout);
    if (!data.success) return null;

    const productionId = data.aliases?.production;
    const production = productionId
      ? data.deploys?.find((d: { deployId: string }) => d.deployId === productionId)
      : data.deploys?.find((d: { state: string }) => d.state?.includes('production'));
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
