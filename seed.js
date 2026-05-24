import sql from 'mssql';

// SQL Server configuration
const config = {
  user: 'sa', // Change this to your SQL Server username
  password: '123456', // Change this to your SQL Server password
  server: 'localhost',
  database: 'QuanLyNhanVien',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function seedDatabase() {
  try {
    await sql.connect(config);
    console.log('Connected to database');

    // Insert sample employees
    await sql.query(`
      INSERT INTO NhanVien (HoTen, Email, MaPhong, TrangThai)
      VALUES
      ('John Doe', 'john@company.com', 2, 'Active'),
      ('Jane Smith', 'jane@company.com', 1, 'Active'),
      ('Bob Johnson', 'bob@company.com', 3, 'On Leave')
    `);
    console.log('Inserted employees');

    // Insert sample leaves
    await sql.query(`
      INSERT INTO NghiPhep (MaNV, LoaiNghi, NgayBatDau, NgayKetThuc, TrangThai)
      VALUES
      (1, 'Annual', '2024-01-20', '2024-01-22', 'Pending'),
      (3, 'Sick', '2024-01-15', '2024-01-15', 'Approved')
    `);
    console.log('Inserted leaves');

    // Insert sample requests
    await sql.query(`
      INSERT INTO YeuCau (MaNV, LoaiYeuCau, MoTa, TrangThai)
      VALUES
      (1, 'Training', 'React Course', 'Approved'),
      (2, 'Equipment', 'New Monitor', 'Pending')
    `);
    console.log('Inserted requests');

    // Insert sample attendance
    await sql.query(`
      INSERT INTO ChamCong (MaNV, GioVao, GioRa, TrangThai)
      VALUES
      (1, '2024-01-15 09:00:00', '2024-01-15 17:30:00', 'Present'),
      (2, '2024-01-15 08:45:00', '2024-01-15 17:00:00', 'Present')
    `);
    console.log('Inserted attendance');

    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await sql.close();
  }
}

seedDatabase();