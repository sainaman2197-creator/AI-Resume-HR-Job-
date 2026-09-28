const API_BASE = '/api';

export async function checkHealth() {
  const res = await fetch(`${API_BASE}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/resumes/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.detail || 'Failed to upload and analyze resume');
  }
  return res.json();
}

export async function getResumes() {
  const res = await fetch(`${API_BASE}/resumes`);
  if (!res.ok) throw new Error('Failed to fetch resumes');
  return res.json();
}

export async function getResumeDetail(id) {
  const res = await fetch(`${API_BASE}/resumes/${id}`);
  if (!res.ok) throw new Error('Failed to fetch resume details');
  return res.json();
}

export async function deleteResume(id) {
  const res = await fetch(`${API_BASE}/resumes/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete resume');
  return res.json();
}

export async function getCandidates({ search = '', seniority = '', skill = '', page = 1, limit = 12 }) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (seniority && seniority !== 'all') params.append('seniority', seniority);
  if (skill) params.append('skill', skill);
  params.append('page', page);
  params.append('limit', limit);

  const res = await fetch(`${API_BASE}/candidates?${params.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch candidates');
  return res.json();
}

export async function getCandidateDetail(id) {
  const res = await fetch(`${API_BASE}/candidates/${id}`);
  if (!res.ok) throw new Error('Failed to fetch candidate details');
  return res.json();
}

export async function getJobs() {
  const res = await fetch(`${API_BASE}/jobs`);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return res.json();
}

export async function createJob(jobData) {
  const res = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(jobData),
  });
  if (!res.ok) throw new Error('Failed to create job');
  return res.json();
}

export async function matchJobToCandidates(jobId, limit = 10) {
  const res = await fetch(`${API_BASE}/match/job-to-candidates/${jobId}?limit=${limit}`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to match candidates to job');
  return res.json();
}

export async function getAnalytics() {
  const res = await fetch(`${API_BASE}/analytics`);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function getApiKeyStatus() {
  const res = await fetch(`${API_BASE}/settings/api-key`);
  if (!res.ok) throw new Error('Failed to get API key status');
  return res.json();
}

export async function updateApiKey(apiKey) {
  const res = await fetch(`${API_BASE}/settings/api-key`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error('Failed to update API key');
  return res.json();
}

export async function runHRMatchFunnel(funnelData) {
  const res = await fetch(`${API_BASE}/hr/match-funnel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(funnelData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to execute HR matching funnel');
  }
  return res.json();
}

