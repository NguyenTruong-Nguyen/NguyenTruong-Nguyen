# TODO - Register lưu vào Database

- [ ] Kiểm tra schema trong `qlnv.sql`: xác định bảng lưu tài khoản (TaiKhoan) và các cột cần dùng.
- [ ] Backend: thêm API `POST /api/auth/register` trong `server.js` để insert vào bảng `TaiKhoan`.
- [ ] Backend: thêm API `POST /api/auth/login` trong `server.js` để kiểm tra đăng nhập từ bảng `TaiKhoan`.
- [ ] Frontend: sửa `auth.js` để `register()` gọi `/api/auth/register` thay vì chỉ mock/localStorage.
- [ ] Frontend: sửa `login()` để gọi `/api/auth/login` (không còn mockUsers), và lưu profile vào `localStorage`.
- [ ] Test nhanh: đăng ký 1 tài khoản mới -> kiểm tra record mới trong SQL.
- [ ] Test login: đăng nhập bằng tài khoản vừa tạo.

