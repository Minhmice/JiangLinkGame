// Google Apps Script Code
// Copy code này vào Google Apps Script Editor
// 1. Mở https://script.google.com
// 2. Tạo project mới
// 3. Dán code này vào
// 4. Lưu project
// 5. Deploy > New deployment > Web app
// 6. Chọn "Execute as: Me" và "Who has access: Anyone"
// 7. Copy URL và dán vào game_3.html (thay YOUR_GOOGLE_APPS_SCRIPT_URL)

function doPost(e) {
  try {
    const sheetId = '1jMUyLFaYPgv9h8RpaI4C_XA12SRYMMQgMG1QIADOFtw';
    const sheet = SpreadsheetApp.openById(sheetId).getActiveSheet();
    
    // Parse JSON data
    const data = JSON.parse(e.postData.contents);
    const group = String(data.group || '1.1');
    const score = Number(data.score || 0);
    const duration = Number(data.duration || 0);
    const wrongCount = Number(data.wrongCount || 0);
    const wrongQuestions = String(data.wrongQuestions || 'Không có');
    
    // Calculate row based on team format (fixed rows)
    // Row 1 = Header, Row 2 = 1.1, Row 3 = 1.2, Row 4 = 2.1, ..., Row 13 = 6.2
    let row = 2; // Default to row 2
    if (group.includes('.')) {
      const parts = group.split('.');
      const major = parseInt(parts[0]) || 1;
      const minor = parseInt(parts[1]) || 1;
      // Formula: row = (major - 1) * 2 + minor + 1
      // Examples: 1.1 -> row 2, 1.2 -> row 3, 2.1 -> row 4, 2.2 -> row 5, 6.2 -> row 13
      row = (major - 1) * 2 + minor + 1;
    } else {
      // Fallback for old format (if any)
      row = parseInt(group) + 1;
    }
    
    // Ensure row is within valid range (2-13)
    if (row < 2) row = 2;
    if (row > 13) row = 13;
    
    // Update the row: 
    // Column A = Đội, Column B = Điểm, Column C = Thời gian, Column D = Số câu sai, Column E = Câu sai
    sheet.getRange(row, 1).setValue(group);
    sheet.getRange(row, 2).setValue(score);
    sheet.getRange(row, 3).setValue(duration);
    sheet.getRange(row, 4).setValue(wrongCount);
    sheet.getRange(row, 5).setValue(wrongQuestions);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully',
      group: group,
      score: score,
      duration: duration,
      wrongCount: wrongCount,
      wrongQuestions: wrongQuestions
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('Google Sheets API is running').setMimeType(ContentService.MimeType.TEXT);
}

