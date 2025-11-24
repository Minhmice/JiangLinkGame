# Hướng dẫn Setup Google Sheet Integration

## Bước 1: Tạo Google Apps Script

1. Mở file `google-apps-script.js` trong thư mục này
2. Copy toàn bộ code
3. Truy cập https://script.google.com
4. Tạo project mới (New Project)
5. Dán code vào editor
6. Lưu project (Ctrl+S hoặc Cmd+S)

## Bước 2: Deploy Web App

1. Trong Google Apps Script editor, click **Deploy** > **New deployment**
2. Chọn type: **Web app**
3. Cấu hình:
   - **Execute as**: Me (tài khoản của bạn)
   - **Who has access**: Anyone
4. Click **Deploy**
5. Copy **Web app URL** (sẽ có dạng: `https://script.google.com/macros/s/.../exec`)

## Bước 3: Cấu hình URL trong game_3.html

1. Mở file `game_3.html`
2. Tìm dòng:
   ```javascript
   window.GOOGLE_SHEET_WEB_APP_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL';
   ```
3. Thay `YOUR_GOOGLE_APPS_SCRIPT_URL` bằng URL bạn đã copy ở bước 2
4. Lưu file

## Bước 4: Kiểm tra Google Sheet

1. Mở Google Sheet: https://docs.google.com/spreadsheets/d/1jMUyLFaYPgv9h8RpaI4C_XA12SRYMMQgMG1QIADOFtw/edit
2. Đảm bảo cấu trúc sheet như sau:
   - Row 1: Header (Đội | Điểm | Thời gian)
   - Row 2-13: Dữ liệu cho các đội 1-12

## Lưu ý

- Google Sheet phải được share với tài khoản Google bạn dùng để tạo Apps Script
- Nếu có lỗi, kiểm tra:
  - URL trong `game_3.html` đã đúng chưa
  - Google Sheet ID trong `google-apps-script.js` đã đúng chưa
  - Quyền truy cập của Web App đã set là "Anyone" chưa

