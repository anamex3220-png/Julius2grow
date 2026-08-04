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
  getSkills: () => request('/skills'),
  getQuestionBank: () => request('/question-bank'),
  createCampaign: (payload) =>
    request('/campaigns', { method: 'POST', body: JSON.stringify(payload) }),
  createCustomCampaign: (payload) =>
    request('/campaigns/custom', { method: 'POST', body: JSON.stringify(payload) }),
  getCampaigns: () => request('/campaigns'),
  getCampaign: (id) => request(`/campaigns/${id}`),
  getCampaignForEdit: (id) => request(`/campaigns/${id}/edit`),
  updateCampaign: (id, payload) => request(`/campaigns/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCampaign: (id) => request(`/campaigns/${id}`, { method: 'DELETE' }),
  getResults: (id) => request(`/campaigns/${id}/results`),
  startAttempt: (campaignId, payload) =>
    request(`/campaigns/${campaignId}/attempts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getAttempt: (id) => request(`/attempts/${id}`),
  sendScenarioReply: (attemptId, message) =>
    request(`/attempts/${attemptId}/scenario/reply`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    }),
  submitAttempt: (attemptId, answer, integrity) =>
    request(`/attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answer, integrity }),
    }),
  gradeQuestion: (attemptId, questionId, score, notes) =>
    request(`/attempts/${attemptId}/grade`, {
      method: 'POST',
      body: JSON.stringify({ questionId, score, notes }),
    }),
  deleteAttempt: (attemptId) => request(`/attempts/${attemptId}`, { method: 'DELETE' }),
};
