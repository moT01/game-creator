export interface RemoteInfo {
  hash: string | null;
  shortUrl: string | null;
  stale: boolean;
  date: string | null;
  ahead: number;
  behind: number;
}

export interface DeployInfo {
  hash: string;
  date: string;
  siteUrl: string | null;
}

export interface RepoRemote {
  name: string;
  info: RemoteInfo;
}

export interface RepoRow {
  name: string;
  isRepo: boolean;
  localHash?: string | null;
  localDate?: string | null;
  remotes?: RepoRemote[];
  deployed?: DeployInfo | null;
}
