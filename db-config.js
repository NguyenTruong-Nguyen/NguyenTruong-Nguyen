// Database configuration
// Update these settings to match your SQL Server setup.
// Current SQL Server instance is localhost, and SSMS is connected with Windows user THIENHENRY\MY PC.

// Option 1: SQL Server Authentication
// export const dbConfig = {
//   user: 'sa',
//   password: '123456',
//   server: 'localhost',
//   database: 'QuanLyNhanVien',
//   options: {
//     encrypt: false,
//     trustServerCertificate: true,
//     enableArithAbort: true
//   },
//   pool: {
//     max: 10,
//     min: 0,
//     idleTimeoutMillis: 30000
//   }
// };

// Option 2: Windows Authentication
// SSMS screenshot shows Windows Authentication with THIENHENRY\MY PC.
// Use 'master' for connection validation before QuanLyNhanVien is created.
export const dbConfig = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=master;Trusted_Connection=Yes;TrustServerCertificate=Yes;Encrypt=no;',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Use this config when the QuanLyNhanVien database exists.
export const appDbConfig = {
  connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=QuanLyNhanVien;Trusted_Connection=Yes;TrustServerCertificate=Yes;Encrypt=no;',
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// If this fails, you can switch back to SQL auth and use a SQL login instead.