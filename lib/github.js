// lib/github.js
//
// Small wrapper around the GitHub Contents API for reading and writing
// JSON files in the site's own repo. Used by the admin API endpoints to
// persist edits — every save is a real git commit, so there's a full
// history and an easy rollback if something goes wrong.
//
// Required environment variables:
//   GITHUB_TOKEN  — a fine-grained Personal Access Token scoped to just
//                    this repo, with "Contents: Read and write" permission
//   GITHUB_REPO   — "owner/repo", e.g. "nazim/mesir-perfume-site"
//   GITHUB_BRANCH — the branch Vercel deploys from, e.g. "main"

const API_BASE = 'https://api.github.com';

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  const branch = process.env.GITHUB_BRANCH || 'main';

  if (!token || !repo) {
    throw new Error('GITHUB_TOKEN or GITHUB_REPO is not set');
  }
  return { token, repo, branch };
}

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
  };
}

// Reads a file's current content + sha (the sha is required by GitHub's
// API to update the file — it's how it detects conflicting edits).
async function readFile(path) {
  const { token, repo, branch } = getConfig();
  const url = `${API_BASE}/repos/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, { headers: headers(token) });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub read failed (${res.status}) for ${path}: ${body}`);
  }

  const data = await res.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return { content, sha: data.sha };
}

// Writes new content to a file, creating a commit. `sha` must be the
// current file's sha (from readFile) so GitHub can confirm we're not
// overwriting someone else's concurrent edit.
async function writeFile(path, content, sha, message) {
  const { token, repo, branch } = getConfig();
  const url = `${API_BASE}/repos/${repo}/contents/${path}`;

  const res = await fetch(url, {
    method: 'PUT',
    headers: headers(token),
    body: JSON.stringify({
      message,
      content: Buffer.from(content, 'utf-8').toString('base64'),
      sha,
      branch,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`GitHub write failed (${res.status}) for ${path}: ${body}`);
  }

  return res.json();
}

module.exports = { readFile, writeFile };
