// auth.js - Authentication Logic

// Mock users database (in real app, from backend)
const mockUsers = {
  // Chỉ 1 tài khoản HR duy nhất (theo yêu cầu)
  'phancongthien19@gmail.com': {
    id: 1,
    name: 'HR Admin',
    email: 'phancongthien19@gmail.com',
    password: '123123', // plain for demo
    role: 'HR'
  },

  'employee@test.com': {
    id: 2,
    name: 'John Doe',
    email: 'employee@test.com',
    password: 'password123',
    role: 'Employee',
    phone: '090 123 4567',
    gender: 'Male',
    dob: '1990-06-15',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    position: 'Software Engineer',
    department: 'IT',
    salary: '18,000,000 VND',
    status: 'Active',
    avatar: ''
  }
};

// Get current user from localStorage
export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('hrm_user');
  return userStr ? JSON.parse(userStr) : null;
}

// Check if user is logged in
export function isLoggedIn() {
  return !!getCurrentUser();
}

// Check if user has HR role
export function isHR() {
  const user = getCurrentUser();
  return user && user.role === 'HR';
}

// Login function
export async function login(email, password) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const normalizedPassword = String(password || '');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { success: false, error: (data && data.error) || `Invalid credentials (status ${res.status})` };
    }


    // Normalize role for UI consistency (HR must be exactly 'HR')
    const normalizedRole = String(data.role || '').trim().toLowerCase();
    // DB có thể lưu HR dưới nhiều dạng (HR/hr/HR admin/...).
    const uiRole = normalizedRole === 'hr' ? 'HR' : 'Employee';
    // Normalize role and also update UI only.
    // IMPORTANT: do NOT treat HR by role returned on register; login returns role from DB.
    // Some DBs may store role as 'HR', 'hr', or other variants.
    // We'll treat any value that equals 'hr' (case-insensitive) as HR.
    console.log('[auth.login] role from backend:', data.role, 'normalized:', normalizedRole, 'uiRole:', uiRole);


    // Update profile fields from /api/employees for UI completeness (phone/gender/etc.)
    try {
      const list = await fetch('/api/employees').then(r => r.json()).catch(() => []);
      const match = (list || []).find(e => String(e.email || '').toLowerCase() === normalizedEmail);
      localStorage.setItem('hrm_user', JSON.stringify({
        id: data.employeeId,
        name: data.name || match?.name || '',
        email: data.email || normalizedEmail,
        role: uiRole,
        ...match,
      }));
    } catch {
      localStorage.setItem('hrm_user', JSON.stringify({
        id: data.employeeId,
        name: data.name,
        email: data.email || normalizedEmail,
        role: uiRole,
      }));
    }


    return { success: true, user: JSON.parse(localStorage.getItem('hrm_user') || 'null') };
  } catch (err) {
    return { success: false, error: err.message || 'Network error' };
  }
} 



// Register function (save to database)
export async function register(name, email, password, confirmPassword, role = 'Employee') {
  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' };
  }

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword, role })
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      return { success: false, error: (data && data.error) || 'Register failed' };
    }

    // Keep local profile for UI; HR-assigned fields can be refreshed after login/profile edit.
    const rawRole = data.role || role || 'Employee';
    const normalizedRole = String(rawRole).trim().toLowerCase();
    const uiRole = normalizedRole === 'hr' ? 'HR' : 'Employee';

    const newUser = {
      id: data.id,
      name: data.name,
      email: data.email,
      role: uiRole,
      // keep consistent with login() response
      employeeId: data.employeeId,
      phone: '',
      gender: '',
      dob: '',
      address: '',
      position: uiRole === 'HR' ? 'HR Admin' : 'Employee',
      department: uiRole === 'HR' ? 'Human Resources' : 'General',
      salary: uiRole === 'HR' ? 'N/A' : '0',
      status: 'Active',
      avatar: ''
    };

    // After register: keep local user in localStorage so user can access home immediately.
    // IMPORTANT: we must store the same shape as login() expects (including employeeId).
    localStorage.setItem('hrm_user', JSON.stringify(newUser));
    return { success: true, user: newUser };
  } catch (err) {
    return { success: false, error: err.message || 'Network error' };
  }
}



// Logout
export function logout() {
  localStorage.removeItem('hrm_user');
}

// Initialize auth check (redirect if not logged in, except on auth pages)
export function initAuthCheck() {
  const pathname = window.location.pathname || '';
  const page = pathname.split('/').pop();

  if (page === 'login.html' || page === 'register.html') {
    // On auth pages, ensure logged out user can access
    if (isLoggedIn()) {
      window.location.href = 'index.html';
    }
    return;
  }

  // On main app, check login
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

