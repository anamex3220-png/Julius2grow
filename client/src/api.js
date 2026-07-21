const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  createCampaign: (payload) =>
    request('/campaigns', { method: 'POST', body: JSON.stringify(payload) }),
  getCampaign: (id) => request(`/campaigns/${id}`),
  getResults: (id) => request(`/campaigns/${id}/results`),
  startAttempt: (campaignId, payload) =>
    request(`/campaigns/${campaignId}/attempts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAttempt: (id) => request(`/attempts/${id}`),
  sendSupportReply: (attemptId, message) =>
    request(`/attempts/${attemptId}/support/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  submitAttempt: (attemptId, answer) =>
    request(`/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),
};
