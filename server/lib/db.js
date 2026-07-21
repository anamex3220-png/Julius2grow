import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', 'data');
const DB_FILE = join(DATA_DIR, 'db.json');

function load() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  if (!existsSync(DB_FILE)) {
    const initial = { campaigns: [], attempts: [] };
    writeFileSync(DB_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(readFileSync(DB_FILE, 'utf-8'));
}

function save(data) {
  writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

let state = load();

export const db = {
  getCampaigns: () => state.campaigns,
  getCampaign: (id) => state.campaigns.find((c) => c.id === id),
  addCampaign: (campaign) => {
    state.campaigns.push(campaign);
    save(state);
    return campaign;
  },
  getAttempt: (id) => state.attempts.find((a) => a.id === id),
  getAttemptsForCampaign: (campaignId) =>
    state.attempts.filter((a) => a.campaignId === campaignId),
  addAttempt: (attempt) => {
    state.attempts.push(attempt);
    save(state);
    return attempt;
  },
  updateAttempt: (id, patch) => {
    const attempt = state.attempts.find((a) => a.id === id);
    if (!attempt) return null;
    Object.assign(attempt, patch);
    save(state);
    return attempt;
  },
};
