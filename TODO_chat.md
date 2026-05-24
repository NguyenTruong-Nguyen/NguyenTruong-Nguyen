# TODO - Chat widget (phòng ban + 1-1)

- [ ] (1) Thêm HTML chat widget góc phải dưới vào `index.html` và `employee.html`.
- [ ] (2) Thêm CSS chat widget vào `styles.css` (đảm bảo hiển thị “nhỏ” ở góc phải dưới).
- [ ] (3) Thêm i18n labels chat (VI/EN) trong `app.js` (t() / currentLang).
- [ ] (4) Thiết kế API chat backend trong `server.js`:
  - [ ] Chat phòng ban theo `MaPhong` (room chung)
  - [ ] Chat 1-1 theo cặp nhân viên (conversation)
- [ ] (5) Thêm schema DB vào `qlnv.sql` (bảng Messages/Rooms/Conversation hoặc tối giản).
- [ ] (6) Implement `app.js`:
  - [ ] Load danh sách phòng ban + conversation
  - [ ] Hiển thị danh sách tin nhắn và gửi tin nhắn
  - [ ] Tối thiểu hiển thị khung chat và gửi/nhận thành công
- [ ] (7) Test end-to-end: đăng nhập HR/Employee, gửi tin nhắn, reload kiểm tra persistence DB.

