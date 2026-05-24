// server.js - Simple backend API for HRM (Express + SQL Server)
// Note: This replaces localStorage demo with a minimal backend.

import express from 'express';
import cors from 'cors';
import sql from 'mssql/msnodesqlv8.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConfig, appDbConfig } from './db-config.js';
import fs from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({ origin: true }));
app.use(express.json());

// Seed HR admin account (required by task)
async function ensureHrAdminSeed() {
  try {
    await sql.connect(appDbConfig);

    const hrEmail = 'phancongthien19@gmail.com';
    const hrPassword = '123123';
    const hrName = 'HR Admin';

    // If TaiKhoan exists, do nothing
    const exists = await sql.query`
      SELECT TOP 1 MaTaiKhoan
      FROM TaiKhoan
      WHERE TenDangNhap = ${hrEmail}
    `;

    if (exists.recordset.length > 0) return;

    // Create minimal NhanVien profile
    const insertEmp = await sql.query`
      INSERT INTO NhanVien (HoTen, Email, TrangThai)
      OUTPUT INSERTED.MaNV
      VALUES (${hrName}, ${hrEmail}, 'Active')
    `;

    const maNV = insertEmp.recordset[0]?.MaNV;
    if (!maNV) {
      console.warn('ensureHrAdminSeed: failed to create NhanVien');
      return;
    }

    // Create TaiKhoan with HR role
    await sql.query`
      INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, MaNV)
      VALUES (${hrEmail}, ${hrPassword}, 'HR', ${maNV})
    `;

    console.log('✓ Seeded HR admin account');
  } catch (err) {
    console.warn('ensureHrAdminSeed failed (continuing):', err.message);
  }
}

ensureHrAdminSeed();

// Configure multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Serve uploaded files
app.use('/uploads', express.static(uploadDir));

const hrmDataPath = path.join(__dirname, 'hrm_db.json');
function readHrmFile() {
  try {
    const raw = fs.readFileSync(hrmDataPath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { employees: [], leaves: [], requests: [], attendance: [] };
  }
}
function writeHrmFile(db) {
  fs.writeFileSync(hrmDataPath, JSON.stringify(db, null, 2), 'utf8');
}

function safeSendFallback(res, payload, status = 200) {
  res.status(status).json(payload);
}

async function trySql(handler) {
  try {
    return await handler();
  } catch (err) {
    console.warn('SQL failed, using hrm_db.json fallback:', err.message);
    return null;
  }
}

app.get('/api/db-status', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`SELECT GETDATE() AS now`; 
    res.json({ connected: true, serverTime: result.recordset[0].now });
  } catch (err) {
    console.error('Database status error:', err);
    res.status(500).json({ connected: false, error: err.message });
  }
});

// Employees
app.get('/api/employees', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query(`
      SELECT
        nv.MaNV as id,
        nv.HoTen as name,
        nv.Email as email,
        nv.SoDienThoai as phone,
        nv.GioiTinh as gender,
        CONVERT(varchar, nv.NgaySinh, 23) as dob,
        nv.DiaChi as address,
        pb.TenPhong as department,
        cv.TenChucVu as position,
        nv.Luong as salary,
        nv.TrangThai as status,
        nv.AnhDaiDien as avatar
      FROM NhanVien nv
      LEFT JOIN PhongBan pb ON nv.MaPhong = pb.MaPhong
      LEFT JOIN ChucVu cv ON nv.MaChucVu = cv.MaChucVu
      ORDER BY nv.MaNV DESC
    `);
    return res.json(result.recordset);
  } catch (err) {
    console.warn('SQL employees failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.employees || []);
  }
});

app.post('/api/employees', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      gender,
      dob,
      address,
      department,
      position,
      salary,
      status,
      avatar
    } = req.body;

    await sql.connect(appDbConfig);
    const deptResult = await sql.query`SELECT MaPhong FROM PhongBan WHERE TenPhong = ${department}`;
    const maPhong = deptResult.recordset[0]?.MaPhong || null;
    const posResult = await sql.query`SELECT MaChucVu FROM ChucVu WHERE TenChucVu = ${position}`;
    const maChucVu = posResult.recordset[0]?.MaChucVu || null;

    const result = await sql.query`
      INSERT INTO NhanVien (HoTen, Email, SoDienThoai, GioiTinh, NgaySinh, DiaChi, MaPhong, MaChucVu, Luong, TrangThai, AnhDaiDien)
      OUTPUT INSERTED.*
      VALUES (${name}, ${email}, ${phone}, ${gender}, ${dob}, ${address}, ${maPhong}, ${maChucVu}, ${salary}, ${status}, ${avatar})
    `;

    const employee = result.recordset[0];
    res.status(201).json({
      id: employee.MaNV,
      name: employee.HoTen,
      email: employee.Email,
      phone: employee.SoDienThoai,
      gender: employee.GioiTinh,
      dob: employee.NgaySinh,
      address: employee.DiaChi,
      department,
      position,
      salary: employee.Luong,
      status: employee.TrangThai,
      avatar: employee.AnhDaiDien
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/employees/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      gender,
      dob,
      address,
      department,
      position,
      salary,
      status,
      avatar
    } = req.body;

    await sql.connect(appDbConfig);
    const deptResult = await sql.query`SELECT MaPhong FROM PhongBan WHERE TenPhong = ${department}`;
    const maPhong = deptResult.recordset[0]?.MaPhong || null;
    const posResult = await sql.query`SELECT MaChucVu FROM ChucVu WHERE TenChucVu = ${position}`;
    const maChucVu = posResult.recordset[0]?.MaChucVu || null;

    const result = await sql.query`
      UPDATE NhanVien
      SET HoTen = ${name}, Email = ${email}, SoDienThoai = ${phone}, GioiTinh = ${gender}, NgaySinh = ${dob}, DiaChi = ${address}, MaPhong = ${maPhong}, MaChucVu = ${maChucVu}, Luong = ${salary}, TrangThai = ${status}, AnhDaiDien = ${avatar}
      OUTPUT INSERTED.*
      WHERE MaNV = ${id}
    `;

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    const employee = result.recordset[0];
    res.json({
      id: employee.MaNV,
      name: employee.HoTen,
      email: employee.Email,
      phone: employee.SoDienThoai,
      gender: employee.GioiTinh,
      dob: employee.NgaySinh,
      address: employee.DiaChi,
      department,
      position,
      salary: employee.Luong,
      status: employee.TrangThai,
      avatar: employee.AnhDaiDien
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/employees/:id', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`DELETE FROM NhanVien WHERE MaNV = ${req.params.id}`;
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/departments', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query(`SELECT MaPhong AS id, TenPhong AS name FROM PhongBan ORDER BY MaPhong DESC`);
    return res.json(result.recordset);
  } catch (err) {
    console.warn('SQL departments failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.departments || []);
  }
});

app.post('/api/departments', async (req, res) => {
  const { name } = req.body;
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`
      INSERT INTO PhongBan (TenPhong)
      OUTPUT INSERTED.MaPhong, INSERTED.TenPhong
      VALUES (${name})
    `;
    const department = result.recordset[0];
    res.status(201).json({ id: department.MaPhong, name: department.TenPhong });
  } catch (err) {
    console.warn('SQL add department failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    const newId = db.departments.length ? Math.max(...db.departments.map(d => d.id)) + 1 : 1;
    const newDepartment = { id: newId, name };
    db.departments = db.departments || [];
    db.departments.push(newDepartment);
    writeHrmFile(db);
    return res.status(201).json(newDepartment);
  }
});

app.delete('/api/departments/:id', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`DELETE FROM PhongBan WHERE MaPhong = ${req.params.id}`;
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.warn('SQL delete department failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    db.departments = (db.departments || []).filter(d => String(d.id) !== String(req.params.id));
    writeHrmFile(db);
    return res.json({ success: true });
  }
});

app.get('/api/positions', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query(`SELECT MaChucVu AS id, TenChucVu AS name FROM ChucVu ORDER BY MaChucVu DESC`);
    return res.json(result.recordset);
  } catch (err) {
    console.warn('SQL positions failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.positions || []);
  }
});

app.post('/api/positions', async (req, res) => {
  const { name } = req.body;
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`
      INSERT INTO ChucVu (TenChucVu)
      OUTPUT INSERTED.MaChucVu, INSERTED.TenChucVu
      VALUES (${name})
    `;
    const position = result.recordset[0];
    res.status(201).json({ id: position.MaChucVu, name: position.TenChucVu });
  } catch (err) {
    console.warn('SQL add position failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    const newId = db.positions.length ? Math.max(...db.positions.map(d => d.id)) + 1 : 1;
    const newPosition = { id: newId, name };
    db.positions = db.positions || [];
    db.positions.push(newPosition);
    writeHrmFile(db);
    return res.status(201).json(newPosition);
  }
});

app.delete('/api/positions/:id', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`DELETE FROM ChucVu WHERE MaChucVu = ${req.params.id}`;
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.json({ success: true });
  } catch (err) {
    console.warn('SQL delete position failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    db.positions = (db.positions || []).filter(p => String(p.id) !== String(req.params.id));
    writeHrmFile(db);
    return res.json({ success: true });
  }
});

// Upload avatar for employee
app.post('/api/employees/:id/upload-avatar', upload.single('avatar'), async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarPath = `/uploads/${req.file.filename}`;

    await sql.connect(appDbConfig);
    const result = await sql.query`
      UPDATE NhanVien
      SET AnhDaiDien = ${avatarPath}
      WHERE MaNV = ${id}
    `;

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ avatar: avatarPath });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Leaves
app.get('/api/leaves', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query(`
      SELECT 
        np.MaNghiPhep as id,
        nv.HoTen as employee,
        np.LoaiNghi as type,
        np.NgayBatDau as start,
        np.NgayKetThuc as end,
        np.TrangThai as status
      FROM NghiPhep np
      JOIN NhanVien nv ON np.MaNV = nv.MaNV
      ORDER BY np.MaNghiPhep DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.warn('SQL leaves failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.leaves || []);
  }
});

app.post('/api/leaves', async (req, res) => {
  try {
    const { employee, type, start, end, status } = req.body;
    
    // Find employee ID by name
    await sql.connect(appDbConfig);
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    const maNV = empResult.recordset[0]?.MaNV;
    
    if (!maNV) {
      return res.status(400).json({ error: 'Employee not found' });
    }
    
    const result = await sql.query(`
      INSERT INTO NghiPhep (MaNV, LoaiNghi, NgayBatDau, NgayKetThuc, TrangThai)
      OUTPUT INSERTED.*
      VALUES (${maNV}, '${type}', '${start}', '${end}', '${status}')
    `);
    
    const leave = result.recordset[0];
    res.status(201).json({
      id: leave.MaNghiPhep,
      employee,
      type: leave.LoaiNghi,
      start: leave.NgayBatDau.toISOString().split('T')[0],
      end: leave.NgayKetThuc.toISOString().split('T')[0],
      status: leave.TrangThai
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/leaves/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee, type, start, end, status } = req.body;
    
    // Find employee ID by name
    await sql.connect(appDbConfig);
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    const maNV = empResult.recordset[0]?.MaNV;
    
    if (!maNV) {
      return res.status(400).json({ error: 'Employee not found' });
    }
    
    const result = await sql.query(`
      UPDATE NghiPhep 
      SET MaNV = ${maNV}, LoaiNghi = '${type}', NgayBatDau = '${start}', NgayKetThuc = '${end}', TrangThai = '${status}'
      OUTPUT INSERTED.*
      WHERE MaNghiPhep = ${id}
    `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const leave = result.recordset[0];
    res.json({
      id: leave.MaNghiPhep,
      employee,
      type: leave.LoaiNghi,
      start: leave.NgayBatDau.toISOString().split('T')[0],
      end: leave.NgayKetThuc.toISOString().split('T')[0],
      status: leave.TrangThai
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/leaves/:id', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`DELETE FROM NghiPhep WHERE MaNghiPhep = ${req.params.id}`;
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Requests
app.get('/api/requests', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query(`
      SELECT 
        yc.MaYeuCau as id,
        nv.HoTen as employee,
        yc.LoaiYeuCau as type,
        yc.MoTa as title,
        yc.TrangThai as status,
        CONVERT(varchar, yc.NgayTao, 23) as date
      FROM YeuCau yc
      JOIN NhanVien nv ON yc.MaNV = nv.MaNV
      ORDER BY yc.MaYeuCau DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.warn('SQL requests failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.requests || []);
  }
});

app.post('/api/requests', async (req, res) => {
  try {
    const { employee, type, title, status } = req.body;
    
    // Find employee ID by name
    await sql.connect(appDbConfig);
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    const maNV = empResult.recordset[0]?.MaNV;
    
    if (!maNV) {
      return res.status(400).json({ error: 'Employee not found' });
    }
    
    const result = await sql.query(`
      INSERT INTO YeuCau (MaNV, LoaiYeuCau, MoTa, TrangThai)
      OUTPUT INSERTED.*
      VALUES (${maNV}, '${type}', '${title}', '${status}')
    `);
    
    const request = result.recordset[0];
    res.status(201).json({
      id: request.MaYeuCau,
      employee,
      type: request.LoaiYeuCau,
      title: request.MoTa,
      status: request.TrangThai,
      date: request.NgayTao.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee, type, title, status } = req.body;
    
    // Find employee ID by name
    await sql.connect(appDbConfig);
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    const maNV = empResult.recordset[0]?.MaNV;
    
    if (!maNV) {
      return res.status(400).json({ error: 'Employee not found' });
    }
    
    const result = await sql.query(`
      UPDATE YeuCau 
      SET MaNV = ${maNV}, LoaiYeuCau = '${type}', MoTa = '${title}', TrangThai = '${status}'
      OUTPUT INSERTED.*
      WHERE MaYeuCau = ${id}
    `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    
    const request = result.recordset[0];
    res.json({
      id: request.MaYeuCau,
      employee,
      type: request.LoaiYeuCau,
      title: request.MoTa,
      status: request.TrangThai,
      date: request.NgayTao.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/requests/:id', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`DELETE FROM YeuCau WHERE MaYeuCau = ${req.params.id}`;
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Performance
app.get('/api/performance', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query(`
      SELECT
        hs.MaHieuSuat as id,
        nv.HoTen as employee,
        hs.KPI as kpi,
        hs.DanhGia as review,
        hs.Diem as score,
        CONVERT(varchar, hs.NgayDanhGia, 23) as date
      FROM HieuSuat hs
      JOIN NhanVien nv ON hs.MaNV = nv.MaNV
      ORDER BY hs.NgayDanhGia DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.warn('SQL performance failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.performance || []);
  }
});

app.post('/api/performance', async (req, res) => {
  try {
    const { employee, kpi, review, score, date } = req.body;

    await sql.connect(appDbConfig);
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    const maNV = empResult.recordset[0]?.MaNV;

    if (!maNV) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    const result = await sql.query(`
      INSERT INTO HieuSuat (MaNV, KPI, DanhGia, Diem, NgayDanhGia)
      OUTPUT INSERTED.*
      VALUES (${maNV}, ${kpi}, ${review}, ${score}, ${date})
    `);

    const row = result.recordset[0];
    res.status(201).json({
      id: row.MaHieuSuat,
      employee,
      kpi: row.KPI,
      review: row.DanhGia,
      score: row.Diem,
      date: row.NgayDanhGia.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/performance/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee, kpi, review, score, date } = req.body;

    await sql.connect(appDbConfig);
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    const maNV = empResult.recordset[0]?.MaNV;

    if (!maNV) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    const result = await sql.query(`
      UPDATE HieuSuat
      SET MaNV = ${maNV}, KPI = ${kpi}, DanhGia = ${review}, Diem = ${score}, NgayDanhGia = ${date}
      OUTPUT INSERTED.*
      WHERE MaHieuSuat = ${id}
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    const row = result.recordset[0];
    res.json({
      id: row.MaHieuSuat,
      employee,
      kpi: row.KPI,
      review: row.DanhGia,
      score: row.Diem,
      date: row.NgayDanhGia.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/performance/:id', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`DELETE FROM HieuSuat WHERE MaHieuSuat = ${req.params.id}`;
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Payroll
app.get('/api/payroll', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query(`
      SELECT
        l.MaLuong as id,
        nv.HoTen as employee,
        l.LuongCoBan as basicSalary,
        l.Thuong as bonus,
        l.PhuCap as allowance,
        l.KhauTru as deduction,
        l.TongLuong as totalSalary,
        CONVERT(varchar, l.NgayTraLuong, 23) as payDate
      FROM Luong l
      JOIN NhanVien nv ON l.MaNV = nv.MaNV
      ORDER BY l.NgayTraLuong DESC
    `);
    res.json(result.recordset);
  } catch (err) {
    console.warn('SQL payroll failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.payroll || []);
  }
});

app.post('/api/payroll', async (req, res) => {
  try {
    const { employee, basicSalary, bonus, allowance, deduction, totalSalary, payDate } = req.body;

    await sql.connect(appDbConfig);
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    const maNV = empResult.recordset[0]?.MaNV;

    if (!maNV) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    const result = await sql.query(`
      INSERT INTO Luong (MaNV, LuongCoBan, Thuong, PhuCap, KhauTru, TongLuong, NgayTraLuong)
      OUTPUT INSERTED.*
      VALUES (${maNV}, ${basicSalary}, ${bonus}, ${allowance}, ${deduction}, ${totalSalary}, ${payDate})
    `);

    const row = result.recordset[0];
    res.status(201).json({
      id: row.MaLuong,
      employee,
      basicSalary: row.LuongCoBan,
      bonus: row.Thuong,
      allowance: row.PhuCap,
      deduction: row.KhauTru,
      totalSalary: row.TongLuong,
      payDate: row.NgayTraLuong.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/payroll/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { employee, basicSalary, bonus, allowance, deduction, totalSalary, payDate } = req.body;

    await sql.connect(appDbConfig);
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    const maNV = empResult.recordset[0]?.MaNV;

    if (!maNV) {
      return res.status(400).json({ error: 'Employee not found' });
    }

    const result = await sql.query(`
      UPDATE Luong
      SET MaNV = ${maNV}, LuongCoBan = ${basicSalary}, Thuong = ${bonus}, PhuCap = ${allowance}, KhauTru = ${deduction}, TongLuong = ${totalSalary}, NgayTraLuong = ${payDate}
      OUTPUT INSERTED.*
      WHERE MaLuong = ${id}
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }

    const row = result.recordset[0];
    res.json({
      id: row.MaLuong,
      employee,
      basicSalary: row.LuongCoBan,
      bonus: row.Thuong,
      allowance: row.PhuCap,
      deduction: row.KhauTru,
      totalSalary: row.TongLuong,
      payDate: row.NgayTraLuong.toISOString().split('T')[0]
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/payroll/:id', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`DELETE FROM Luong WHERE MaLuong = ${req.params.id}`;
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Attendance (read-only)
app.get('/api/attendance', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    // Default working hours: 08:00 - 16:00
    // Returns extra computed fields to support overtime/late calculations
    const result = await sql.query(`
      SELECT 
        CONVERT(varchar, cc.GioVao, 23) as date,
        nv.HoTen as employee,
        cc.TrangThai as status,
        CONVERT(varchar, cc.GioVao, 8) as timeIn,
        CONVERT(varchar, cc.GioRa, 8) as timeOut
      FROM ChamCong cc
      JOIN NhanVien nv ON cc.MaNV = nv.MaNV
      ORDER BY cc.GioVao DESC
    `);

    const rows = result.recordset.map(r => {
      const parseHHMM = (t) => {
        if (!t || typeof t !== 'string') return null;
        // Expected: HH:MM:SS from CONVERT(varchar, datetime, 8)
        const m = t.match(/^(\d{2}):(\d{2})/);
        if (!m) return null;
        const hh = Number(m[1]);
        const mm = Number(m[2]);
        return hh * 60 + mm;
      };

      const inMins = parseHHMM(r.timeIn);
      const outMins = parseHHMM(r.timeOut);
      const expectedIn = 8 * 60;
      const expectedOut = 16 * 60;

      const lateMinutes = (inMins !== null && inMins > expectedIn) ? (inMins - expectedIn) : 0;
      const overtimeMinutes = (outMins !== null && outMins > expectedOut) ? (outMins - expectedOut) : 0;

      const workingMinutes = (inMins !== null && outMins !== null && outMins > inMins) ? (outMins - inMins) : 0;
      return {
        ...r,
        lateMinutes,
        overtimeHours: Math.round((overtimeMinutes / 60) * 100) / 100,
        workingHours: Math.round((workingMinutes / 60) * 100) / 100
      };
    });

    res.json(rows);
  } catch (err) {
    console.warn('SQL attendance failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json((db.attendance || []).map(r => ({
      ...r,
      lateMinutes: r.lateMinutes ?? 0,
      overtimeHours: r.overtimeHours ?? 0,
      workingHours: r.workingHours ?? 0
    })));
  }
});

app.post('/api/attendance', async (req, res) => {
  const { employee, date, timeIn, status } = req.body;
  try {
    await sql.connect(appDbConfig);
    // Find employee ID
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${employee}`;
    if (empResult.recordset.length === 0) {
      throw new Error('Employee not found');
    }
    const maNV = empResult.recordset[0].MaNV;
    await sql.query`
      INSERT INTO ChamCong (MaNV, GioVao, TrangThai)
      VALUES (${maNV}, ${date + ' ' + timeIn}, ${status})
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('SQL attendance POST failed:', err);
    // Fallback to hrm_db.json
    const db = readHrmFile();
    const newAttendance = {
      id: Date.now(),
      employee,
      date,
      timeIn,
      status,
      timeOut: null
    };
    db.attendance = db.attendance || [];
    db.attendance.push(newAttendance);
    writeHrmFile(db);
    res.json({ success: true, id: newAttendance.id });
  }
});

app.put('/api/attendance/:id', async (req, res) => {
  const { id } = req.params;
  const { timeOut } = req.body;
  try {
    await sql.connect(appDbConfig);
    // Find by employee and date
    const empResult = await sql.query`SELECT MaNV FROM NhanVien WHERE HoTen = ${id}`;
    if (empResult.recordset.length === 0) {
      return res.status(400).json({ error: 'Employee not found' });
    }
    const maNV = empResult.recordset[0].MaNV;
    await sql.query`
      UPDATE ChamCong
      SET GioRa = ${timeOut}
      WHERE MaNV = ${maNV} AND CONVERT(varchar, GioVao, 23) = ${req.body.date}
    `;
    res.json({ success: true });
  } catch (err) {
    console.error('SQL attendance PUT failed:', err);
    // Fallback to hrm_db.json
    const db = readHrmFile();
    const attendance = db.attendance.find(a => a.employee === id && a.date === req.body.date);
    if (attendance) {
      attendance.timeOut = timeOut;
      writeHrmFile(db);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Attendance not found' });
    }
  }
});

// Departments
app.get('/api/departments', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`SELECT MaPhong as id, TenPhong as name FROM PhongBan ORDER BY MaPhong`;
    res.json(result.recordset);
  } catch (err) {
    console.warn('SQL departments failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.departments || []);
  }
});

// Positions
app.get('/api/positions', async (req, res) => {
  try {
    await sql.connect(appDbConfig);
    const result = await sql.query`SELECT MaChucVu as id, TenChucVu as name FROM ChucVu ORDER BY MaChucVu`;
    res.json(result.recordset);
  } catch (err) {
    console.warn('SQL positions failed, fallback hrm_db.json:', err.message);
    const db = readHrmFile();
    return res.json(db.positions || []);
  }
});

// Auth (Register into database)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body || {};

    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedName = String(name).trim();

    // Only allow roles (HR disabled in UI, but still validate server-side)
    const allowedRoles = new Set(['Employee', 'HR']);
    const safeRole = allowedRoles.has(role) ? role : 'Employee';

    await sql.connect(appDbConfig);

    // Check duplicate account
    const existsResult = await sql.query`
      SELECT TOP 1 MaTaiKhoan
      FROM TaiKhoan
      WHERE TenDangNhap = ${normalizedEmail}
    `;

    if (existsResult.recordset.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Insert into NhanVien first (minimal profile)
    // Keep nullable fields as NULL/empty where the schema allows.
    const insertEmpResult = await sql.query`
      INSERT INTO NhanVien (HoTen, Email, TrangThai)
      OUTPUT INSERTED.MaNV
      VALUES (${normalizedName}, ${normalizedEmail}, 'Active')
    `;

    const maNV = insertEmpResult.recordset[0]?.MaNV;
    if (!maNV) {
      return res.status(500).json({ error: 'Failed to create employee profile' });
    }

    // Insert into TaiKhoan
    const insertAccountResult = await sql.query`
      INSERT INTO TaiKhoan (TenDangNhap, MatKhau, VaiTro, MaNV)
      OUTPUT INSERTED.MaTaiKhoan, INSERTED.VaiTro, INSERTED.MaNV
      VALUES (${normalizedEmail}, ${password}, ${safeRole}, ${maNV})
    `;

    const row = insertAccountResult.recordset[0];

    return res.status(201).json({
      id: row.MaTaiKhoan,
      name: normalizedName,
      email: normalizedEmail,
      role: row.VaiTro,
      employeeId: row.MaNV
    });
  } catch (err) {
    console.error('Auth register error:', err);
    return res.status(500).json({ error: err.message || 'Database error' });
  }
});

// Auth (Login into database)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing email or password' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPassword = String(password);

    await sql.connect(appDbConfig);

    console.log('[auth.login] email:', normalizedEmail);
    // 1) Check if account exists by email (to distinguish wrong password vs wrong email)
    const existsResult = await sql.query`
      SELECT TOP 1
        tk.MaTaiKhoan as id,
        tk.TenDangNhap as email,
        tk.VaiTro as role,
        nv.MaNV as employeeId,
        nv.HoTen as name,
        tk.MatKhau as password
      FROM TaiKhoan tk
      LEFT JOIN NhanVien nv ON tk.MaNV = nv.MaNV
      WHERE tk.TenDangNhap = ${normalizedEmail}
    `;

    const existsRow = existsResult.recordset[0];
    if (!existsRow) {
      return res.status(401).json({ error: 'Account not found' });
    }

    // 2) Now verify password
    const result = await sql.query`
      SELECT TOP 1
        tk.MaTaiKhoan as id,
        tk.TenDangNhap as email,
        tk.VaiTro as role,
        nv.MaNV as employeeId,
        nv.HoTen as name
      FROM TaiKhoan tk
      LEFT JOIN NhanVien nv ON tk.MaNV = nv.MaNV
      WHERE tk.TenDangNhap = ${normalizedEmail} AND tk.MatKhau = ${normalizedPassword}
    `;

    const row = result.recordset[0];
    if (!row) {
      return res.status(401).json({ error: 'Wrong password' });
    }

    return res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      employeeId: row.employeeId
    });
  } catch (err) {
    console.error('Auth login error:', err);
    return res.status(500).json({ error: err.message || 'Database error' });
  }
});

app.use(express.static(path.join(__dirname), { index: 'index.html', fallthrough: true }));

// Health check for debugging from frontend
app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});


app.use((req, res, next) => {
  if (req.method !== 'GET' || req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Catch-all for missing API routes (so frontend gets a clear error)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api/')) return next();
  return res.status(404).json({ error: `API route not found: ${req.method} ${req.path}` });
});


app.listen(PORT, () => {
  console.log(`HRM API running on http://localhost:${PORT}`);
});

