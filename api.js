const API_BASE = '/api';

async function request(path, method = 'GET', body) {
  const init = {
    method,
    headers: {
      'Accept': 'application/json'
    }
  };

  if (body !== undefined) {
    init.headers['Content-Type'] = 'application/json';
    init.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${path}`, init);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const error = (data && data.error) || response.statusText || 'Request failed';
    throw new Error(error);
  }

  return data;
}

export function listEmployees() {
  return request('/employees');
}

export function addEmployee(payload) {
  return request('/employees', 'POST', payload);
}

export function updateEmployee(id, payload) {
  return request(`/employees/${encodeURIComponent(id)}`, 'PUT', payload);
}

export function deleteEmployee(id) {
  return request(`/employees/${encodeURIComponent(id)}`, 'DELETE');
}

export function listLeaves() {
  return request('/leaves');
}

export function addLeave(payload) {
  return request('/leaves', 'POST', payload);
}

export function updateLeave(id, payload) {
  return request(`/leaves/${encodeURIComponent(id)}`, 'PUT', payload);
}

export function deleteLeave(id) {
  return request(`/leaves/${encodeURIComponent(id)}`, 'DELETE');
}

export function listRequests() {
  return request('/requests');
}

export function addRequest(payload) {
  return request('/requests', 'POST', payload);
}

export function updateRequest(id, payload) {
  return request(`/requests/${encodeURIComponent(id)}`, 'PUT', payload);
}

export function deleteRequest(id) {
  return request(`/requests/${encodeURIComponent(id)}`, 'DELETE');
}

export function listAttendance() {
  return request('/attendance');
}

export function addAttendance(payload) {
  return request('/attendance', 'POST', payload);
}
