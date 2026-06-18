import { execFileSync } from 'node:child_process';

/**
 * Persist a rotated secret so the *next* workflow run picks it up.
 * In CI: uses the `gh` CLI to update the repo secret (requires GH_PAT_FOR_SECRETS
 * with `actions:write` and the workflow's runner to have `gh` on PATH —
 * pre-installed on ubuntu-latest).
 * Locally: just logs to stderr.
 */
export async function setSecret(name: string, value: string): Promise<void> {
  if (process.env.CI !== 'true') {
    console.warn(`[secretRotator] would set ${name}=<redacted ${value.length}b> (skipped — not in CI)`);
    return;
  }
  const token = process.env.GH_PAT_FOR_SECRETS;
  const repo = process.env.GITHUB_REPOSITORY;
  if (!token || !repo) {
    console.warn(`[secretRotator] CI but missing GH_PAT_FOR_SECRETS or GITHUB_REPOSITORY — token rotation skipped`);
    return;
  }
  try {
    execFileSync('gh', ['secret', 'set', name, '--repo', repo, '--body', value], {
      env: { ...process.env, GH_TOKEN: token },
      stdio: 'inherit',
    });
    console.log(`[secretRotator] rotated ${name}`);
  } catch (e) {
    console.warn(`[secretRotator] failed to rotate ${name}:`, (e as Error).message);
  }
}
