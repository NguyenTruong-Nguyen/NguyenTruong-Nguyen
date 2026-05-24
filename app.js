// app.js - Main Application Logic (SPA Navigation, Pages, Role-based UI, i18n)

import { getCurrentUser, isLoggedIn, isHR, logout, initAuthCheck } from './auth.js';
import { escapeHtml, confirmAction, showToast } from './utils.js';



const LANG_KEY = 'hrm_lang';
let currentLang = localStorage.getItem(LANG_KEY) || 'en';

const i18n = {
  en: {
    appName: 'HRM',
    notifications: 'Notifications',
    profile: 'Profile',
    logout: 'Logout',
    dashboard: 'Dashboard',
    employees: 'Employees',
    attendance: 'Attendance',
    leave: 'Leave',
    requests: 'Requests',
    performance: 'Performance',
    payroll: 'Payroll',
    recruitment: 'Recruitment',
    reports: 'Reports',
    settings: 'Settings',
    recentRequests: 'Recent Requests',
    totalEmployees: 'Total Employees',
    pendingRequests: 'Pending Requests',
    leaveBalance: 'Leave Balance',
    attendanceRate: 'Attendance Rate',
    searchEmployees: 'Search employees...',
    filter: 'Filter',
    leaveManagement: 'Leave Management',
    approveLeaves: 'Approve Leaves',
    newLeaveRequest: 'New Leave Request',
    newRequest: 'New Request',
    openPositions: 'Open Positions',
    candidates: 'Candidates',
    departments: 'Departments',
    roles: 'Roles',
    role: 'Role',
    pageNotFound: 'Page Not Found',
    title: 'Title',
    employee: 'Employee',
    type: 'Type',
    status: 'Status',
    date: 'Date',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    gender: 'Gender',
    dob: 'DOB',
    address: 'Address',
    position: 'Position',
    salary: 'Salary',
    department: 'Department',
    avatar: 'Avatar',
    start: 'Start',
    end: 'End',
    timeIn: 'Time In',
    timeOut: 'Time Out',
    actions: 'Actions',
    view: 'View',
    delete: 'Delete',
    addEmployee: 'Add employee',
    addDepartment: 'Add department',
    addPosition: 'Add position',
    editEmployee: 'Edit employee',
    save: 'Save',
    cancel: 'Cancel',
    noData: 'No data available',
    paid: 'Paid',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    active: 'Active',
    onLeave: 'On Leave',
    present: 'Present',
    annual: 'Annual',
    sick: 'Sick',
    overallSatisfaction: 'Overall Satisfaction',
    averageRating: 'Average Rating',
    training: 'Training',
    equipment: 'Equipment',
    basicSalary: 'Basic Salary',
    bonus: 'Bonus',
    allowance: 'Allowance',
    deduction: 'Deduction',
    totalSalary: 'Total Salary',
    payDate: 'Pay Date',
    noData: 'No data available',
    totalDepartments: 'Departments',
    totalPositions: 'Positions',
    language: 'Language'
  },
  vi: {
    addDepartment: 'Thêm phòng ban',
    addPosition: 'Thêm chức vụ',
    appName: 'HRM',
    notifications: 'Thông báo',
    profile: 'Hồ sơ',
    logout: 'Đăng xuất',
    dashboard: 'Tổng quan',
    employees: 'Nhân viên',
    attendance: 'Chấm công',
    leave: 'Nghỉ phép',
    requests: 'Yêu cầu',
    performance: 'Hiệu suất',
    payroll: 'Lương',
    recruitment: 'Tuyển dụng',
    reports: 'Báo cáo',
    settings: 'Cài đặt',
    recentRequests: 'Yêu cầu gần đây',
    totalEmployees: 'Tổng nhân viên',
    pendingRequests: 'Yêu cầu chờ duyệt',
    leaveBalance: 'Số ngày nghỉ',
    attendanceRate: 'Tỷ lệ đi làm',
    searchEmployees: 'Tìm kiếm nhân viên...',
    filter: 'Lọc',
    leaveManagement: 'Quản lý nghỉ phép',
    approveLeaves: 'Duyệt nghỉ phép',
    newLeaveRequest: 'Tạo đơn nghỉ phép',
    newRequest: 'Tạo yêu cầu',
    openPositions: 'Vị trí đang tuyển',
    candidates: 'Ứng viên',
    departments: 'Phòng ban',
    roles: 'Vai trò',
    role: 'Vai trò',
    pageNotFound: 'Không tìm thấy trang',
    title: 'Tiêu đề',
    employee: 'Nhân viên',
    type: 'Loại',
    status: 'Trạng thái',
    date: 'Ngày',
    name: 'Tên',
    email: 'Email',
    phone: 'Số điện thoại',
    gender: 'Giới tính',
    dob: 'Ngày sinh',
    address: 'Địa chỉ',
    position: 'Chức vụ',
    salary: 'Lương',
    department: 'Phòng ban',
    avatar: 'Ảnh đại diện',
    start: 'Bắt đầu',
    end: 'Kết thúc',
    timeIn: 'Vào',
    timeOut: 'Ra',
    actions: 'Thao tác',
    view: 'Xem',
    delete: 'Xóa',
    addEmployee: 'Thêm nhân viên',
    editEmployee: 'Chỉnh sửa nhân viên',
    save: 'Lưu',
    cancel: 'Hủy',
    noData: 'Không có dữ liệu',
    paid: 'Đã trả',
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
    active: 'Đang làm việc',
    onLeave: 'Đang nghỉ',
    present: 'Có mặt',
    annual: 'Năm',
    sick: 'Ốm',
    overallSatisfaction: 'Mức độ hài lòng',
    averageRating: 'Điểm trung bình',
    training: 'Đào tạo',
    equipment: 'Thiết bị',
    basicSalary: 'Lương cơ bản',
    bonus: 'Thưởng',
    allowance: 'Phụ cấp',
    deduction: 'Khấu trừ',
    totalSalary: 'Tổng lương',
    payDate: 'Ngày trả',
    addDepartment: 'Thêm phòng ban',
    addPosition: 'Thêm chức vụ',
    totalDepartments: 'Số phòng ban',
    totalPositions: 'Số chức vụ',
    language: 'Ngôn ngữ'
  }
};

function t(key) {
  return i18n[currentLang][key] || key;
}

function getFilteredAttendance() {
  if (isHR()) return attendanceCache;
  const user = getCurrentUser();
  return attendanceCache.filter(a => a.employee === user.name);
}

function getDashboardKpis() {
  const employees = employeesCache;
  const leaves = leavesCache;
  const requests = requestsCache;
  const attendance = attendanceCache;

  const pendingLeaves = leaves.filter(l => String(l.status).toLowerCase() === 'pending').length;
  const pendingRequests = requests.filter(r => String(r.status).toLowerCase() === 'pending').length;

  const attendancePresent = attendance.filter(a => String(a.status).toLowerCase() === 'present').length;
  const attendanceTotal = attendance.length || 1;
  const attendanceRate = Math.round((attendancePresent / attendanceTotal) * 100) + '%';

  return {
    totalEmployees: { value: employees.length, change: '+0' },
    pendingRequests: { value: pendingLeaves + pendingRequests, change: '' },
    leaveBalance: { value: '12 days', change: '' }, // demo
    attendanceRate: { value: attendanceRate, change: '' },
    totalDepartments: { value: departmentsCache.length, change: '' },
    totalPositions: { value: positionsCache.length, change: '' }
  };
}


const sidebarItems = document.querySelectorAll('.sidebar-item');
const mainContent = document.getElementById('mainContent');
const avatarDropdown = document.getElementById('avatarDropdown');
const dropdownMenu = document.getElementById('dropdownMenu');
const userAvatar = document.getElementById('userAvatar');

const leaveModal = document.getElementById('leaveModal');
const requestModal = document.getElementById('requestModal');

let employeesCache = [];
let leavesCache = [];
let requestsCache = [];
let attendanceCache = [];
let performanceCache = [];
let payrollCache = [];
let departmentsCache = [];
let positionsCache = [];

const API_BASE = '/api';

async function fetchJson(url, options = {}) {
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `${res.status} ${res.statusText}`);
  }
  return res.json();
}

async function listEmployees() {
  return fetchJson(`${API_BASE}/employees`);
}

async function addEmployee(payload) {
  return fetchJson(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function updateEmployee(id, payload) {
  return fetchJson(`${API_BASE}/employees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function updateLeaveStatus(id, status) {
  if (!isHR()) return;
  const ok = confirmAction(currentLang === 'vi' ? `Thay đổi trạng thái nghỉ phép này thành "${status}"?` : `Update leave status to "${status}"?`);
  if (!ok) return;
  try {
    await fetch(`${API_BASE}/leaves/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(currentLang === 'vi' ? 'Đã cập nhật!' : 'Updated!');
    await refreshCaches();
    renderCurrentPage();
  } catch (err) {
    showToast(err.message || (currentLang === 'vi' ? 'Cập nhật thất bại' : 'Update failed'), 'error');
  }
}

async function updateRequestStatus(id, status) {
  if (!isHR()) return;
  const ok = confirmAction(currentLang === 'vi' ? `Thay đổi trạng thái yêu cầu này thành "${status}"?` : `Update request status to "${status}"?`);
  if (!ok) return;
  try {
    await fetch(`${API_BASE}/requests/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(currentLang === 'vi' ? 'Đã cập nhật!' : 'Updated!');
    await refreshCaches();
    renderCurrentPage();
  } catch (err) {
    showToast(err.message || (currentLang === 'vi' ? 'Cập nhật thất bại' : 'Update failed'), 'error');
  }
}

async function deleteEmployee(id) {

  return fetchJson(`${API_BASE}/employees/${id}`, { method: 'DELETE' });
}

async function addLeave(payload) {
  return fetchJson(`${API_BASE}/leaves`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function addRequest(payload) {
  return fetchJson(`${API_BASE}/requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function listLeaves() {
  return fetchJson(`${API_BASE}/leaves`);
}

async function listRequests() {
  return fetchJson(`${API_BASE}/requests`);
}

async function listAttendance() {
  return fetchJson(`${API_BASE}/attendance`);
}

async function listDepartments() {
  return fetchJson(`${API_BASE}/departments`);
}

async function listPositions() {
  return fetchJson(`${API_BASE}/positions`);
}

async function addDepartment(payload) {
  return fetchJson(`${API_BASE}/departments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function deleteDepartment(id) {
  return fetchJson(`${API_BASE}/departments/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

async function addAttendance(payload) {
  return fetchJson(`${API_BASE}/attendance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function deletePosition(id) {
  return fetchJson(`${API_BASE}/positions/${encodeURIComponent(id)}`, {
    method: 'DELETE'
  });
}

async function listPerformance() {
  return fetchJson(`${API_BASE}/performance`);
}

async function listPayroll() {
  return fetchJson(`${API_BASE}/payroll`);
}

let currentPage = 'dashboard';

document.addEventListener('DOMContentLoaded', initApp);

async function initApp() {
  initAuthCheck();
  if (!isLoggedIn()) return;

  setupLanguageControl();
  applyStaticI18n();

  const user = getCurrentUser();
  updateUIForUser(user);

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => navigate(item.dataset.page));
  });

  avatarDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('show');
  });

  document.addEventListener('click', () => {
    if (dropdownMenu) dropdownMenu.classList.remove('show');
  });

  const logoutBtn = document.getElementById('logoutBtn');
  const profileBtn = document.getElementById('profileBtn');
  const cancelLeaveBtn = document.getElementById('cancelLeave');
  const cancelRequestBtn = document.getElementById('cancelRequest');
  const leaveFormEl = document.getElementById('leaveForm');
  const requestFormEl = document.getElementById('requestForm');
  const requestTypeEl = document.getElementById('requestType');
  const mainContentEl = document.getElementById('mainContent');

  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
  if (profileBtn) profileBtn.addEventListener('click', () => navigate('profile'));

  if (cancelLeaveBtn && leaveModal) cancelLeaveBtn.addEventListener('click', () => leaveModal.classList.remove('show'));
  if (cancelRequestBtn && requestModal) cancelRequestBtn.addEventListener('click', () => requestModal.classList.remove('show'));

  if (leaveFormEl) leaveFormEl.addEventListener('submit', handleLeaveSubmit);
  if (requestFormEl) requestFormEl.addEventListener('submit', handleRequestSubmit);

  if (requestTypeEl) requestTypeEl.addEventListener('change', toggleTrainingFields);

  // Employees (search, add)
  if (mainContentEl) {
    mainContentEl.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'addEmployeeBtn') {
      openEmployeeModal();
    }
    if (e.target && e.target.id === 'createLeaveBtn') {
      leaveModal.classList.add('show');
    }
    if (e.target && e.target.id === 'createRequestBtn') {
      requestModal.classList.add('show');
    }

    if (e.target && e.target.id === 'checkInOutBtn') {
      handleCheckInOut();
    }

    if (e.target && e.target.id === 'filterAttendanceBtn') {
      handleFilterAttendance();
    }

    if (e.target && e.target.dataset && e.target.dataset.action === 'viewRow') {
      const id = e.target.dataset.id;
      const page = e.target.dataset.page;
      if (page === 'employees') openEmployeeModal(id);
    }

    if (e.target && e.target.dataset && e.target.dataset.action === 'deleteRow') {
      const id = e.target.dataset.id;
      const page = e.target.dataset.page;
      if (page === 'employees') {
        handleDeleteEmployee(id);
      } else if (page === 'departments') {
        deleteDepartment(id).then(async () => {
          showToast(currentLang === 'vi' ? 'Đã xóa phòng ban' : 'Department deleted');
          await refreshCaches();
          renderCurrentPage();
        }).catch(err => showToast(err.message || 'Unable to delete', 'error'));
      } else if (page === 'positions') {
        deletePosition(id).then(async () => {
          showToast(currentLang === 'vi' ? 'Đã xóa chức vụ' : 'Position deleted');
          await refreshCaches();
          renderCurrentPage();
        }).catch(err => showToast(err.message || 'Unable to delete', 'error'));
      }
    }

    if (e.target && e.target.id === 'addDepartmentBtn') {
      const name = document.getElementById('newDepartmentName').value.trim();
      if (!name) return;
      addDepartment({ name }).then(async () => {
        document.getElementById('newDepartmentName').value = '';
        showToast(currentLang === 'vi' ? 'Đã thêm phòng ban' : 'Department added');
        await refreshCaches();
        renderCurrentPage();
      }).catch(err => showToast(err.message || 'Unable to add', 'error'));
    }

    if (e.target && e.target.id === 'addPositionBtn') {
      const name = document.getElementById('newPositionName').value.trim();
      if (!name) return;
      addPosition({ name }).then(async () => {
        document.getElementById('newPositionName').value = '';
        showToast(currentLang === 'vi' ? 'Đã thêm chức vụ' : 'Position added');
        await refreshCaches();
        renderCurrentPage();
      }).catch(err => showToast(err.message || 'Unable to add', 'error'));
    }

    if (e.target && e.target.dataset && e.target.dataset.action === 'approveRow') {
      const id = e.target.dataset.id;
      const page = e.target.dataset.page;
      if (page === 'leaves') updateLeaveStatus(id, 'Approved');
      if (page === 'requests') updateRequestStatus(id, 'Approved');
    }

    if (e.target && e.target.dataset && e.target.dataset.action === 'rejectRow') {
      const id = e.target.dataset.id;
      const page = e.target.dataset.page;
      if (page === 'leaves') updateLeaveStatus(id, 'Rejected');
      if (page === 'requests') updateRequestStatus(id, 'Rejected');
    }
  });
  }


  document.getElementById('mainContent').addEventListener('input', (e) => {
    if (e.target && e.target.id === 'employeeSearch') {
      handleEmployeeSearch(e.target.value);
    }
  });

  // Employee page default: profile
  const defaultPage = (window.location.pathname.endsWith('employee.html')) ? 'profile' : 'dashboard';
  await navigate(defaultPage);
}


function setupLanguageControl() {
  const topbarRight = document.querySelector('.header-right');
  if (!topbarRight) return;

  const language = document.createElement('label');
  language.className = 'lang-control';
  language.innerHTML = `
    <span class="lang-label">${t('language')}</span>
    <select id="langSelect" class="lang-select">
      <option value="en">EN</option>
      <option value="vi">VI</option>
    </select>
  `;
  topbarRight.prepend(language);

  const langSelect = document.getElementById('langSelect');
  if (!langSelect) return;

  langSelect.value = currentLang;
  langSelect.addEventListener('change', () => {
    currentLang = langSelect.value;
    localStorage.setItem(LANG_KEY, currentLang);
    applyStaticI18n();
    navigate(currentPage);
  });
}

function applyStaticI18n() {
  const setText = (selector, text) => {
    const el = document.querySelector(selector);
    if (el) el.textContent = text;
  };

  setText('.logo', t('appName'));
  setText('#profileBtn', t('profile'));
  setText('#logoutBtn', t('logout'));

  setText('[data-page="dashboard"]', t('dashboard'));
  setText('[data-page="employees"]', t('employees'));
  setText('[data-page="attendance"]', t('attendance'));
  setText('[data-page="leave"]', t('leave'));
  setText('[data-page="requests"]', t('requests'));
  setText('[data-page="performance"]', t('performance'));
  setText('[data-page="payroll"]', t('payroll'));
  setText('[data-page="departments"]', t('departments'));
  setText('[data-page="positions"]', t('roles'));
  setText('[data-page="recruitment"]', t('recruitment'));
  setText('[data-page="reports"]', t('reports'));
  setText('[data-page="settings"]', t('settings'));
  setText('.lang-label', t('language'));
}

function updateUIForUser(user) {
  if (user) {
    const initials = user.name.charAt(0) + (user.name.split(' ')[1]?.charAt(0) || '');
    userAvatar.textContent = initials;
    userAvatar.title = user.name;
    document.getElementById('userNameSpan').textContent = user.name;
  }

  document.querySelectorAll('.hr-only').forEach(el => {
    el.style.display = isHR() ? 'block' : 'none';
  });
}

async function navigate(page) {
  currentPage = page;
  sidebarItems.forEach(item => item.classList.remove('active'));
  document.querySelector(`[data-page="${page}"]`)?.classList.add('active');

  await refreshCaches();
  mainContent.innerHTML = getPageContent(page);

  if (page === 'dashboard') initDashboard();
}

function getPageContent(page) {
  const pages = {
    dashboard: `
      <div>
        <h1>${t('dashboard')}</h1>
        <div class="kpi-grid">
          ${Object.entries(getDashboardKpis()).map(([titleKey, kpi]) => `
            <div class="kpi-card card">
              <div class="kpi-number">${kpi.value}</div>
              <div>${t(titleKey)}</div>
              <div style="color: var(--text-secondary);">${kpi.change || ''}</div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <h2>${t('recentRequests')}</h2>
          ${getTable(requestsCache, ['title', 'employee', 'type', 'status', 'date'])}
        </div>

      </div>
    `,
    employees: `
      <div>
        <h1>${t('employees')}</h1>
        <div style="margin-bottom: var(--spacing-lg); display:flex; gap: var(--spacing-md); align-items:center; flex-wrap: wrap;">
          <input id="employeeSearch" type="text" class="input" placeholder="${t('searchEmployees')}" style="width: 320px;">
          <button id="addEmployeeBtn" class="btn btn-primary" style="width:auto;">${t('addEmployee')}</button>
        </div>
        ${getTable(employeesCache, ['avatar', 'name', 'email', 'phone', 'department', 'position', 'salary', 'status'], true, 'employees')}
      </div>
    `,

    attendance: (() => {
      const user = getCurrentUser();
      let buttonText = 'Check In';
      if (user) {
        const today = new Date().toISOString().split('T')[0];
        const todayAttendance = attendanceCache.find(a => a.employee === user.name && a.date === today);
        if (!todayAttendance || !todayAttendance.timeIn) buttonText = 'Check In';
        else if (!todayAttendance.timeOut) buttonText = 'Check Out';
        else buttonText = 'Checked Out';
      }
      return `
        <div>
          <h1>${t('attendance')}</h1>
          <div style="margin-bottom: var(--spacing-lg); display: flex; gap: var(--spacing-md); align-items: center;">
            <input type="date" class="input" id="attendanceDate" value="${new Date().toISOString().split('T')[0]}">
            <button class="btn btn-primary" id="filterAttendanceBtn">${t('filter')}</button>
            ${!isHR() ? `<button class="btn btn-success" id="checkInOutBtn">${buttonText}</button>` : ''}
          </div>
          ${getTable(getFilteredAttendance(), ['date', 'employee', 'status', 'timeIn', 'timeOut', 'lateMinutes', 'workingHours', 'overtimeHours'])}
        </div>
      `;
    })(),
    leave: `
      <div>
        <h1>${t('leaveManagement')}</h1>
        <div style="display:flex; justify-content: space-between; align-items:center; gap: var(--spacing-md); flex-wrap: wrap; margin-bottom: var(--spacing-lg);">
          <div>
            ${isHR() ? `<span style="color: var(--text-secondary);">${t('approveLeaves')}</span>` : ''}
          </div>
          <button id="createLeaveBtn" class="btn btn-primary">${t('newLeaveRequest')}</button>
        </div>
        ${getTable(leavesCache, ['employee', 'type', 'start', 'end', 'status'], true, 'leaves')}
      </div>
    `,
    requests: `
      <div>
        <h1>${t('requests')}</h1>
        <button id="createRequestBtn" class="btn btn-primary" style="margin-bottom: var(--spacing-lg);">${t('newRequest')}</button>
        ${getTable(requestsCache, ['title', 'employee', 'type', 'status', 'date'], false)}
      </div>
    `,
    performance: `
      <div>
        <h1>${t('performance')}</h1>
        <div class="card" style="margin-bottom: var(--spacing-lg);">
          <div style="display:flex; justify-content: space-between; flex-wrap: wrap; gap: var(--spacing-md); align-items:center;">
            <div>
              <h2>${t('performance')}</h2>
              <p style="margin: 0; color: var(--text-secondary);">Review history for employees</p>
            </div>
            <button class="btn btn-primary" style="min-width: 160px;">${currentLang === 'vi' ? 'Thêm đánh giá' : 'Add review'}</button>
          </div>
        </div>
        ${getTable(performanceCache, ['employee', 'kpi', 'review', 'score', 'date'], true)}
      </div>
    `,
    payroll: `
      <div>
        <h1>${t('payroll')}</h1>
        ${getTable(payrollCache, ['employee', 'basicSalary', 'bonus', 'allowance', 'deduction', 'totalSalary', 'payDate'], false)}
      </div>
    `,
    departments: `
      <div>
        <h1>${t('departments')}</h1>
        <div style="margin-bottom: var(--spacing-lg); display:flex; gap: var(--spacing-md); align-items:center; flex-wrap: wrap;">
          <input id="newDepartmentName" type="text" class="input" placeholder="${t('department')}" style="width: 320px;" />
          <button id="addDepartmentBtn" class="btn btn-primary" style="width:auto;">${t('addDepartment')}</button>
        </div>
        ${getTable(departmentsCache, ['name'], true, 'departments')}
      </div>
    `,
    positions: `
      <div>
        <h1>${t('roles')}</h1>
        <div style="margin-bottom: var(--spacing-lg); display:flex; gap: var(--spacing-md); align-items:center; flex-wrap: wrap;">
          <input id="newPositionName" type="text" class="input" placeholder="${t('position')}" style="width: 320px;" />
          <button id="addPositionBtn" class="btn btn-primary" style="width:auto;">${t('addPosition')}</button>
        </div>
        ${getTable(positionsCache, ['name'], true, 'positions')}
      </div>
    `,
    recruitment: `
      <div>
        <h1>${t('recruitment')}</h1>
        <div class="card">
          <h3>${t('openPositions')}</h3>
          <p>2 Software Engineers, 1 Designer</p>
        </div>
        <div class="card">
          <h3>${t('candidates')}</h3>
          <p>15 new applications this week</p>
        </div>
      </div>
    `,
    reports: `
      <div>
        <h1>${t('reports')}</h1>
        <div class="kpi-grid">
          <div class="kpi-card card">
            <div class="kpi-number">95%</div>
            <div>${t('overallSatisfaction')}</div>
          </div>
          <div class="kpi-card card">
            <div class="kpi-number">3.8</div>
            <div>${t('averageRating')}</div>
          </div>
        </div>
      </div>
    `,
    settings: `
      <div>
        <h1>${t('settings')}</h1>
        <div class="card">
          <h3>${t('departments')}</h3>
          <ul>
            <li>Engineering</li>
            <li>HR</li>
            <li>Marketing</li>
          </ul>
        </div>
        <div class="card">
          <h3>${t('roles')}</h3>
          <ul>
            <li>HR Admin</li>
            <li>Manager</li>
            <li>Employee</li>
          </ul>
        </div>
      </div>
    `,
    profile: `
      <div>
        <h1>${t('profile')}</h1>
        ${renderEmployeeProfile()}
      </div>
    `
  };

  return pages[page] || `<h1>${t('pageNotFound')}</h1>`;
}

function renderEmployeeProfile() {
  const user = getCurrentUser();
  const profile = {
    name: user.name || '',
    email: user.email || '',
    role: user.role || '',
    phone: user.phone || 'N/A',
    gender: user.gender || 'N/A',
    dob: user.dob || 'N/A',
    address: user.address || 'N/A',
    position: user.position || 'N/A',
    department: user.department || 'N/A',
    salary: user.salary || 'N/A',
    status: user.status || 'Active',
    avatar: user.avatar || ''
  };

  const html = `
    <div class="profile-hero card">
      <div class="profile-hero-left">
        ${profile.avatar ? `<img src="${profile.avatar}" alt="${escapeHtml(profile.name)}" class="profile-avatar-large" />` : `<div class="profile-avatar-large profile-avatar-placeholder">${escapeHtml(profile.name.charAt(0) || '')}</div>`}
        <div class="profile-intro">
          <h2>${escapeHtml(profile.name)}</h2>
          <p class="profile-position">${escapeHtml(profile.position)} • ${escapeHtml(profile.department)}</p>
          <p class="profile-tagline">Welcome back, ${escapeHtml(profile.name.split(' ')[0] || profile.name)} — quản lý hồ sơ và chấm công nhanh chóng.</p>
        </div>
      </div>
      <div class="profile-hero-right">
        <div class="profile-stats">
          <div class="profile-stat-item">
            <span class="stat-value">${escapeHtml(profile.status)}</span>
            <span class="stat-label">Status</span>
          </div>
          <div class="profile-stat-item">
            <span class="stat-value">${escapeHtml(profile.salary)}</span>
            <span class="stat-label">Salary</span>
          </div>
          <div class="profile-stat-item">
            <span class="stat-value">${escapeHtml(profile.role)}</span>
            <span class="stat-label">Role</span>
          </div>
        </div>
        <button id="editProfileBtn" class="btn btn-primary" style="width: 100%; margin-top: 12px;">✏️ Chỉnh sửa</button>
      </div>
    </div>

    <div id="profileViewMode">
      <div class="profile-details-grid">
        <div class="profile-details card">
          <h3>Thông tin cá nhân</h3>
          <div class="detail-row"><span>${t('email')}:</span> <strong>${escapeHtml(profile.email)}</strong></div>
          <div class="detail-row"><span>${t('phone')}:</span> <strong>${escapeHtml(profile.phone)}</strong></div>
          <div class="detail-row"><span>${t('gender')}:</span> <strong>${escapeHtml(profile.gender)}</strong></div>
          <div class="detail-row"><span>${t('dob')}:</span> <strong>${escapeHtml(profile.dob)}</strong></div>
        </div>
        <div class="profile-details card">
          <h3>Địa chỉ & công việc</h3>
          <div class="detail-row"><span>${t('address')}:</span> <strong>${escapeHtml(profile.address)}</strong></div>
          <div class="detail-row"><span>${t('position')}:</span> <strong>${escapeHtml(profile.position)}</strong></div>
          <div class="detail-row"><span>${t('department')}:</span> <strong>${escapeHtml(profile.department)}</strong></div>
          <div class="detail-row"><span>${t('salary')}:</span> <strong>${escapeHtml(profile.salary)} (HR phân bổ)</strong></div>
        </div>
      </div>
    </div>

    <div id="profileEditMode" style="display: none;">
      <div class="card\" style="max-width: 800px;\">
        <h3>Chỉnh sửa hồ sơ</h3>
        <form id="editProfileForm" class="profile-edit-form\">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--spacing-md);\">
            <div class="form-group\">
              <label class="label\">Tên</label>
              <input type="text\" id="editName\" class="input\" value="${escapeHtml(profile.name)}\" required />
            </div>
            <div class="form-group\">
              <label class="label\">Email</label>
              <input type="email\" id="editEmail\" class="input\" value="${escapeHtml(profile.email)}\" required />
            </div>
            <div class="form-group\">
              <label class="label\">Số điện thoại</label>
              <input type="tel\" id="editPhone\" class="input\" value="${escapeHtml(profile.phone === 'N/A' ? '' : profile.phone)}\" />
            </div>
            <div class="form-group\">
              <label class="label\">Giới tính</label>
              <select id="editGender\" class="select\">
                <option value=\"\">--</option>
                <option value=\"Male\" ${profile.gender === 'Male' ? 'selected' : ''}>Nam</option>
                <option value=\"Female\" ${profile.gender === 'Female' ? 'selected' : ''}>Nữ</option>
                <option value=\"Other\" ${profile.gender === 'Other' ? 'selected' : ''}>Khác</option>
              </select>
            </div>
            <div class="form-group\">
              <label class="label\">Ngày sinh</label>
              <input type="date\" id="editDob\" class="input\" value="${profile.dob === 'N/A' ? '' : profile.dob}\" />
            </div>
            <div class="form-group\">
              <label class="label\">Chức vụ</label>
              <input type="text\" id="editPosition\" class="input\" value="${escapeHtml(profile.position)}\" />
            </div>
          </div>
          <div class="form-group\">
            <label class="label\">Địa chỉ</label>
            <input type="text\" id="editAddress\" class="input\" value="${escapeHtml(profile.address === 'N/A' ? '' : profile.address)}\" />
          </div>
          <div class="form-group\">
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin: 12px 0 0 0;\">💼 <strong>Phòng ban & Lương</strong> được HR quản lý và cập nhật</p>
          </div>
          <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end; margin-top: var(--spacing-lg);\">
            <button type="button\" id="cancelEditBtn\" class="btn btn-secondary\">Hủy</button>
            <button type="submit\" class="btn btn-primary\">Lưu thay đổi</button>
          </div>
        </form>
      </div>
    </div>
  `;

  setTimeout(() => setupProfileEditListeners(), 100);
  return html;
}

function setupProfileEditListeners() {
  const editBtn = document.getElementById('editProfileBtn');
  const editForm = document.getElementById('editProfileForm');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const viewMode = document.getElementById('profileViewMode');
  const editMode = document.getElementById('profileEditMode');

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      viewMode.style.display = 'none';
      editMode.style.display = 'block';
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      viewMode.style.display = 'block';
      editMode.style.display = 'none';
    });
  }

  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const user = getCurrentUser();
      const newName = document.getElementById('editName').value.trim();
      const newEmail = document.getElementById('editEmail').value.trim();
      const newPhone = document.getElementById('editPhone').value.trim() || 'N/A';
      const newGender = document.getElementById('editGender').value || 'N/A';
      const newDob = document.getElementById('editDob').value || 'N/A';
      const newAddress = document.getElementById('editAddress').value.trim() || 'N/A';
      const newPosition = document.getElementById('editPosition').value.trim() || user.position;

      try {
        // Always persist profile changes into database (NhanVien)
        // Find employee ID by current email (fallback to name)
        const all = await listEmployees().catch(() => []);
        const match = all.find(e => String(e.email || '').toLowerCase() === String(user.email || '').toLowerCase())
          || all.find(e => String(e.name || '').toLowerCase() === String(user.name || '').toLowerCase());

        if (!match) {
          showToast(currentLang === 'vi' ? 'Không tìm thấy nhân viên trong hệ thống' : 'Employee not found in system', 'error');
          return;
        }

        const payload = {
          name: newName,
          email: newEmail,
          phone: newPhone,
          gender: newGender,
          dob: newDob === 'N/A' ? null : newDob,
          address: newAddress,
          department: user.department || match.department,
          position: newPosition,
          salary: match.salary ?? user.salary ?? 0,
          status: user.status || match.status || 'Active',
          avatar: user.avatar || match.avatar || null
        };

        const updatedFromDb = await updateEmployee(match.id, payload);
        // Update local cache for immediate UI
        const nextUser = {
          ...user,
          ...updatedFromDb,
          phone: updatedFromDb.phone ?? user.phone,
          position: updatedFromDb.position ?? user.position,
          department: updatedFromDb.department ?? user.department,
          salary: updatedFromDb.salary ?? user.salary,
          status: updatedFromDb.status ?? user.status,
          avatar: updatedFromDb.avatar ?? user.avatar
        };

        localStorage.setItem('hrm_user', JSON.stringify(nextUser));
        showToast(currentLang === 'vi' ? 'Đã lưu thay đổi vào database!' : 'Saved changes to database!');
        await refreshCaches();
        renderCurrentPage();
      } catch (err) {
        showToast(err.message || (currentLang === 'vi' ? 'Lưu thất bại' : 'Save failed'), 'error');
      }
    });
  }
}

function normalizeStatus(value) {
  const raw = String(value || '').toLowerCase();
  if (raw === 'approved') return t('approved');
  if (raw === 'pending') return t('pending');
  if (raw === 'rejected') return t('rejected');
  if (raw === 'active') return t('active');
  if (raw === 'on leave') return t('onLeave');
  if (raw === 'present') return t('present');
  return value;
}

function normalizeType(value) {
  const raw = String(value || '').toLowerCase();
  if (raw === 'training') return t('training');
  if (raw === 'equipment') return t('equipment');
  if (raw === 'annual') return t('annual');
  if (raw === 'sick') return t('sick');
  return value;
}

function getTable(data, keys, actions = false, page = '') {
  let html = `
    <table class="table">
      <thead>
        <tr>${keys.map(k => `<th>${t(k)}</th>`).join('')}${actions ? `<th>${t('actions')}</th>` : ''}</tr>
      </thead>
      <tbody>
  `;


  if (!data || data.length === 0) {
    html += `
      <tr>
        <td colspan="${keys.length + (actions ? 1 : 0)}" class="empty-table">${t('noData')}</td>
      </tr>
    `;
  }


  data.forEach(row => {
    html += '<tr>';
    keys.forEach(key => {
      let value = row[key];

      if (key === 'status') {
        const status = String(value || '').toLowerCase();
        const badgeClass = status === 'approved' ? 'badge-approved' :
          status === 'pending' ? 'badge-pending' : 'badge-rejected';
        value = `<span class="badge ${badgeClass}">${normalizeStatus(value)}</span>`;
      } else if (key === 'type') {
        value = normalizeType(value);
      } else if (key === 'avatar') {
        if (value) {
          const imgSrc = value.startsWith('http') ? value : `http://localhost:3000${value}`;
          value = `<img src="${imgSrc}" alt="Avatar" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />`;
        } else {
          value = '<div style="width: 40px; height: 40px; border-radius: 50%; background: #ccc; display: inline-block;"></div>';
        }
      }

      html += `<td>${value}</td>`;
    });

    if (actions) {
      html += `
        <td>
          <button class="btn btn-primary btn-sm" data-action="viewRow" data-page="${page}" data-id="${row.id}">${t('view')}</button>
          ${isHR() && (page === 'leaves' || page === 'requests') ? `
            <button class="btn btn-success btn-sm" style="margin-left: 6px;" data-action="approveRow" data-page="${page}" data-id="${row.id}">${t('approved')}</button>
            <button class="btn btn-danger btn-sm" style="margin-left: 6px;" data-action="rejectRow" data-page="${page}" data-id="${row.id}">${t('rejected')}</button>
          ` : ''}
          ${isHR() && page !== 'leaves' && page !== 'requests' ? `<button class="btn btn-danger btn-sm" data-action="deleteRow" data-page="${page}" data-id="${row.id}">${t('delete')}</button>` : ''}
        </td>
      `;
    }


    html += '</tr>';
  });

  html += '</tbody></table>';
  return html;
}

async function refreshCaches() {
  employeesCache = await listEmployees().catch(() => []);
  leavesCache = await listLeaves().catch(() => []);
  requestsCache = await listRequests().catch(() => []);
  attendanceCache = await listAttendance().catch(() => []);
  performanceCache = await listPerformance().catch(() => []);
  payrollCache = await listPayroll().catch(() => []);
  departmentsCache = await listDepartments().catch(() => []);
  positionsCache = await listPositions().catch(() => []);
}

function initDashboard() {
  // Dashboard uses refreshed cache data.
}

function getEmployeeRowActions(employee) {
  const canEdit = true;
  const canDelete = isHR();
  return `
    <td>
      ${canEdit ? `<button class="btn btn-primary btn-sm" data-action="editEmployee" data-id="${employee.id}">${t('view')}</button>` : ''}
      ${canDelete ? `<button class="btn btn-danger btn-sm" data-action="deleteEmployee" data-id="${employee.id}">${t('delete')}</button>` : ''}
    </td>
  `;
}

async function handleEmployeeSearch(query) {
  const q = String(query || '').toLowerCase().trim();
  if (!q) {
    await refreshCaches();
    renderCurrentPage();
    return;
  }

  const allEmployees = await listEmployees();
  employeesCache = allEmployees.filter(e => {
    return (
      String(e.name).toLowerCase().includes(q) ||
      String(e.email).toLowerCase().includes(q) ||
      String(e.department).toLowerCase().includes(q)
    );
  });
  renderCurrentPage();
}

function renderCurrentPage() {
  mainContent.innerHTML = getPageContent(currentPage);
  if (currentPage === 'dashboard') initDashboard();
}

function openEmployeeModal(id = null) {
  // Create modal lazily using same modal overlay style as others
  let overlay = document.getElementById('employeeModal');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'employeeModal';
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <h2 id="employeeModalTitle">${t('employee')}</h2>
        <form id="employeeForm">
          <div class="form-group">
            <label class="label" for="empName">${t('name')}</label>
            <input type="text" id="empName" class="input" required />
          </div>
          <div class="form-group">
            <label class="label" for="empEmail">${t('email')}</label>
            <input type="email" id="empEmail" class="input" required />
          </div>
          <div class="form-group">
            <label class="label" for="empPhone">${t('phone')}</label>
            <input type="text" id="empPhone" class="input" />
          </div>
          <div class="form-group">
            <label class="label" for="empGender">${t('gender')}</label>
            <select id="empGender" class="select">
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label" for="empDob">${t('dob')}</label>
            <input type="date" id="empDob" class="input" />
          </div>
          <div class="form-group">
            <label class="label" for="empAddress">${t('address')}</label>
            <textarea id="empAddress" class="textarea"></textarea>
          </div>
          <div class="form-group">
            <label class="label" for="empDepartment">${t('department')}</label>
            <input type="text" id="empDepartment" class="input" required />
          </div>
          <div class="form-group">
            <label class="label" for="empPosition">${t('position')}</label>
            <input type="text" id="empPosition" class="input" />
          </div>
          <div class="form-group">
            <label class="label" for="empSalary">${t('salary')}</label>
            <input type="number" id="empSalary" class="input" min="0" step="0.01" />
          </div>
          <div class="form-group">
            <label class="label" for="empStatus">${t('status')}</label>
            <select id="empStatus" class="select" required>
              <option value="Active">${t('active')}</option>
              <option value="On Leave">${t('onLeave')}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="label" for="empAvatar">${t('avatar')}</label>
            <input type="file" id="empAvatar" class="input" accept="image/*" />
            <div id="avatarPreview" style="margin-top: 10px;">
              <img id="avatarImg" src="" alt="Avatar" style="max-width: 100px; max-height: 100px; display: none;" />
            </div>
          </div>
          <div style="display:flex; gap: var(--spacing-md); justify-content:flex-end;">
            <button type="button" class="btn btn-secondary btn-sm" id="cancelEmployee">${t('cancel')}</button>
            <button type="submit" class="btn btn-primary btn-sm">${t('save')}</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('show');
    });

    overlay.querySelector('#cancelEmployee').addEventListener('click', () => overlay.classList.remove('show'));

    // Avatar preview
    overlay.querySelector('#empAvatar').addEventListener('change', (e) => {
      const file = e.target.files[0];
      const avatarImg = overlay.querySelector('#avatarImg');
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          avatarImg.src = e.target.result;
          avatarImg.style.display = 'block';
        };
        reader.readAsDataURL(file);
      } else {
        avatarImg.style.display = 'none';
      }
    });

    overlay.querySelector('#employeeForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = overlay.querySelector('#employeeForm');
      const formId = form.dataset.employeeId;
      const name = document.getElementById('empName').value;
      const email = document.getElementById('empEmail').value;
      const phone = document.getElementById('empPhone').value;
      const gender = document.getElementById('empGender').value;
      const dob = document.getElementById('empDob').value;
      const address = document.getElementById('empAddress').value;
      const department = document.getElementById('empDepartment').value;
      const position = document.getElementById('empPosition').value;
      const salary = parseFloat(document.getElementById('empSalary').value || 0);
      const status = document.getElementById('empStatus').value;

      try {
        let employeeId = formId;
        if (formId) {
          const updated = await updateEmployee(formId, { name, email, phone, gender, dob, address, department, position, salary, status });
          if (!updated) {
            showToast(currentLang === 'vi' ? 'Không tìm thấy nhân viên' : 'Employee not found', 'error');
            return;
          }
          showToast(currentLang === 'vi' ? 'Đã cập nhật nhân viên' : 'Employee updated');
        } else {
          const exists = employeesCache.some(emp => String(emp.email).toLowerCase() === String(email).toLowerCase());
          if (exists) {
            showToast(currentLang === 'vi' ? 'Email đã tồn tại' : 'Email already exists', 'error');
            return;
          }
          const newEmp = await addEmployee({ name, email, phone, gender, dob, address, department, position, salary, status });
          employeeId = newEmp.id;
          showToast(currentLang === 'vi' ? 'Đã thêm nhân viên' : 'Employee added');
        }

        // Upload avatar if selected
        const avatarFile = document.getElementById('empAvatar').files[0];
        if (avatarFile && employeeId) {
          const formData = new FormData();
          formData.append('avatar', avatarFile);
          try {
            const response = await fetch(`${API_BASE}/employees/${employeeId}/upload-avatar`, {
              method: 'POST',
              body: formData
            });
            if (!response.ok) {
              throw new Error('Upload failed');
            }
            showToast(currentLang === 'vi' ? 'Đã upload ảnh đại diện' : 'Avatar uploaded');
          } catch (uploadErr) {
            showToast((currentLang === 'vi' ? 'Upload ảnh thất bại: ' : 'Avatar upload failed: ') + uploadErr.message, 'error');
          }
        }
      } catch (err) {
        showToast(err.message || 'Unable to save employee', 'error');
      }

      overlay.classList.remove('show');
      await refreshCaches();
      renderCurrentPage();
    });
  }

  // Set title + fill form
  const titleEl = overlay.querySelector('#employeeModalTitle');
  const form = overlay.querySelector('#employeeForm');
  form.dataset.employeeId = id ? String(id) : '';

  if (id) {
    const emp = employeesCache.find(e => String(e.id) === String(id));
    titleEl.textContent = currentLang === 'vi' ? 'Chỉnh sửa nhân viên' : 'Edit employee';
    overlay.querySelector('#empName').value = emp?.name || '';
    overlay.querySelector('#empEmail').value = emp?.email || '';
    overlay.querySelector('#empPhone').value = emp?.phone || '';
    overlay.querySelector('#empGender').value = emp?.gender || 'Male';
    overlay.querySelector('#empDob').value = emp?.dob || '';
    overlay.querySelector('#empAddress').value = emp?.address || '';
    overlay.querySelector('#empDepartment').value = emp?.department || '';
    overlay.querySelector('#empPosition').value = emp?.position || '';
    overlay.querySelector('#empSalary').value = emp?.salary || '';
    overlay.querySelector('#empStatus').value = emp?.status || 'Active';
    // Set avatar
    const avatarImg = overlay.querySelector('#avatarImg');
    if (emp?.avatar) {
      avatarImg.src = emp.avatar.startsWith('http') ? emp.avatar : `http://localhost:3000${emp.avatar}`;
      avatarImg.style.display = 'block';
    } else {
      avatarImg.style.display = 'none';
    }
  } else {
    titleEl.textContent = currentLang === 'vi' ? 'Thêm nhân viên' : 'Add employee';
    overlay.querySelector('#empName').value = '';
    overlay.querySelector('#empEmail').value = '';
    overlay.querySelector('#empPhone').value = '';
    overlay.querySelector('#empGender').value = 'Male';
    overlay.querySelector('#empDob').value = '';
    overlay.querySelector('#empAddress').value = '';
    overlay.querySelector('#empDepartment').value = '';
    overlay.querySelector('#empPosition').value = '';
    overlay.querySelector('#empSalary').value = '';
    overlay.querySelector('#empStatus').value = 'Active';
    // Clear avatar
    overlay.querySelector('#avatarImg').style.display = 'none';
  }

  overlay.classList.add('show');
}

async function handleDeleteEmployee(id) {
  if (!isHR()) return;
  const ok = confirmAction(currentLang === 'vi' ? 'Xóa nhân viên này?' : 'Delete this employee?');
  if (!ok) return;

  try {
    await deleteEmployee(id);
    showToast(currentLang === 'vi' ? 'Đã xóa nhân viên' : 'Employee deleted');
    await refreshCaches();
    renderCurrentPage();
  } catch (err) {
    showToast(err.message || (currentLang === 'vi' ? 'Không tìm thấy nhân viên' : 'Employee not found'), 'error');
  }
}

function handleLogout() {
  logout();
  window.location.href = 'login.html';
}


async function handleLeaveSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('leaveType').value;
  const start = document.getElementById('leaveStart').value;
  const end = document.getElementById('leaveEnd').value;
  const reason = document.getElementById('leaveReason').value;
  const employee = getCurrentUser()?.name || 'John Doe';

  try {
    await addLeave({ employee, type, start, end, status: 'Pending', reason });
    showToast(currentLang === 'vi' ? 'Đã gửi đơn nghỉ phép!' : 'Leave request submitted!');
    leaveModal.classList.remove('show');
    document.getElementById('leaveForm').reset();
    await refreshCaches();
    renderCurrentPage();
  } catch (err) {
    showToast(err.message || 'Unable to submit leave', 'error');
  }
}

async function handleRequestSubmit(e) {
  e.preventDefault();
  const type = document.getElementById('requestType').value;
  const title = document.getElementById('requestTitle').value;
  const description = document.getElementById('requestDesc').value;
  const employee = getCurrentUser()?.name || 'John Doe';

  try {
    await addRequest({ employee, type, title, status: 'Pending', description });
    showToast(currentLang === 'vi' ? 'Đã gửi yêu cầu!' : 'Request submitted!');
    requestModal.classList.remove('show');
    document.getElementById('requestForm').reset();
    document.getElementById('trainingFields').style.display = 'none';
    await refreshCaches();
    renderCurrentPage();
  } catch (err) {
    showToast(err.message || 'Unable to submit request', 'error');
  }
}

async function handleCheckInOut() {
  const user = getCurrentUser();
  if (!user) return;
  const today = new Date().toISOString().split('T')[0];
  const now = new Date().toTimeString().split(' ')[0]; // HH:MM:SS
  const todayAttendance = attendanceCache.find(a => a.employee === user.name && a.date === today);

  try {
    if (!todayAttendance) {
      // Check In
      const result = await addAttendance({ employee: user.name, date: today, timeIn: now, status: 'Present' });
      showToast('Checked In successfully!');
    } else if (!todayAttendance.timeOut) {
      // Check Out
      await fetch(`${API_BASE}/attendance/${encodeURIComponent(user.name)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeOut: now, date: today })
      });
      showToast('Checked Out successfully!');
    } else {
      showToast('Already checked out for today', 'error');
      return;
    }
    await refreshCaches();
    renderCurrentPage();
  } catch (err) {
    showToast(err.message || 'Unable to check in/out', 'error');
  }
}

async function handleFilterAttendance() {
  const date = document.getElementById('attendanceDate').value;
  if (!date) return;
  try {
    attendanceCache = await listAttendance();
    // Filter by date if needed, but for now just refresh
    renderCurrentPage();
  } catch (err) {
    showToast(err.message || 'Unable to filter', 'error');
  }
}

function toggleTrainingFields() {
  const type = document.getElementById('requestType').value;
  document.getElementById('trainingFields').style.display = type === 'training' ? 'block' : 'none';
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'createLeaveBtn') leaveModal.classList.add('show');
  if (e.target.id === 'createRequestBtn') requestModal.classList.add('show');
});
