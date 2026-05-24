// db.js - Simple localStorage database for HRM demo

const STORAGE_KEY = 'hrm_db_v1';

const seed = {
  employees: [
    { id: 1, name: 'John Doe', email: 'john@company.com', department: 'Engineering', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@company.com', department: 'HR', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@company.com', department: 'Marketing', status: 'On Leave' }
  ],
  leaves: [
    { id: 1, employee: 'John Doe', type: 'Annual', start: '2024-01-20', end: '2024-01-22', status: 'Pending' },
    { id: 2, employee: 'Bob Johnson', type: 'Sick', start: '2024-01-15', end: '2024-01-15', status: 'Approved' }
  ],
  requests: [
    { id: 1, employee: 'John Doe', type: 'Training', title: 'React Course', status: 'Approved', date: '2024-01-10' },
    { id: 2, employee: 'Jane Smith', type: 'Equipment', title: 'New Monitor', status: 'Pending', date: '2024-01-12' }
  ],
  attendance: [
    { date: '2024-01-15', employee: 'John Doe', status: 'Present', timeIn: '09:00', timeOut: '17:30' },
    { date: '2024-01-15', employee: 'Jane Smith', status: 'Present', timeIn: '08:45', timeOut: '17:00' }
  ]
};

function loadDB() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return JSON.parse(JSON.stringify(seed));
    }
    const parsed = JSON.parse(raw);
    return { ...seed, ...parsed };
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return JSON.parse(JSON.stringify(seed));
  }
}

function saveDB(db) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function nextId(list) {
  if (!Array.isArray(list) || list.length === 0) return 1;
  return Math.max(...list.map(x => Number(x.id) || 0)) + 1;
}

// Employees
export function listEmployees() {
  const db = loadDB();
  return db.employees;
}

export function addEmployee(data) {
  const db = loadDB();
  const employees = db.employees;
  const id = nextId(employees);
  const employee = { id, ...data };
  employees.unshift(employee);
  saveDB(db);
  return employee;
}

export function updateEmployee(id, data) {
  const db = loadDB();
  const employees = db.employees;
  const idx = employees.findIndex(e => String(e.id) === String(id));
  if (idx === -1) return null;
  employees[idx] = { ...employees[idx], ...data, id: employees[idx].id };
  saveDB(db);
  return employees[idx];
}

export function deleteEmployee(id) {
  const db = loadDB();
  const employees = db.employees;
  const idx = employees.findIndex(e => String(e.id) === String(id));
  if (idx === -1) return false;
  employees.splice(idx, 1);
  // Optional cleanup: remove related leaves/requests by employee name
  // (kept simple for demo)
  saveDB(db);
  return true;
}

// Leaves
export function listLeaves() {
  const db = loadDB();
  return db.leaves;
}

export function addLeave(data) {
  const db = loadDB();
  const leaves = db.leaves;
  const id = nextId(leaves);
  const leave = { id, ...data };
  leaves.unshift(leave);
  saveDB(db);
  return leave;
}

export function updateLeave(id, data) {
  const db = loadDB();
  const leaves = db.leaves;
  const idx = leaves.findIndex(l => String(l.id) === String(id));
  if (idx === -1) return null;
  leaves[idx] = { ...leaves[idx], ...data, id: leaves[idx].id };
  saveDB(db);
  return leaves[idx];
}

export function deleteLeave(id) {
  const db = loadDB();
  const leaves = db.leaves;
  const idx = leaves.findIndex(l => String(l.id) === String(id));
  if (idx === -1) return false;
  leaves.splice(idx, 1);
  saveDB(db);
  return true;
}

// Requests
export function listRequests() {
  const db = loadDB();
  return db.requests;
}

export function addRequest(data) {
  const db = loadDB();
  const requests = db.requests;
  const id = nextId(requests);
  const request = { id, ...data };
  requests.unshift(request);
  saveDB(db);
  return request;
}

export function updateRequest(id, data) {
  const db = loadDB();
  const requests = db.requests;
  const idx = requests.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return null;
  requests[idx] = { ...requests[idx], ...data, id: requests[idx].id };
  saveDB(db);
  return requests[idx];
}

export function deleteRequest(id) {
  const db = loadDB();
  const requests = db.requests;
  const idx = requests.findIndex(r => String(r.id) === String(id));
  if (idx === -1) return false;
  requests.splice(idx, 1);
  saveDB(db);
  return true;
}

// Attendance (read-only for now)
export function listAttendance() {
  const db = loadDB();
  return db.attendance;
}

