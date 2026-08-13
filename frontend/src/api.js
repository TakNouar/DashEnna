const API = '/api';

function getToken() {
  return localStorage.getItem('dashenna_token');
}

export async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data;
}

export async function login(username, password) {
  const data = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('dashenna_token', data.token);
  localStorage.setItem('dashenna_user', JSON.stringify(data.user));
  return data;
}

export function logout() {
  localStorage.removeItem('dashenna_token');
  localStorage.removeItem('dashenna_user');
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('dashenna_user') || 'null');
  } catch {
    return null;
  }
}
