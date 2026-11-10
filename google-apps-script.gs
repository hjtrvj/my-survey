/*
  Google Sheets 응답 수집용 Apps Script
  1) Google 스프레드시트에서 확장 프로그램 > Apps Script 열기
  2) 이 코드를 붙여넣고 SPREADSHEET_ID를 본인 시트 ID로 변경
  3) 배포 > 새 배포 > 웹 앱
  4) 실행 사용자: 나 / 액세스 권한: 모든 사용자 (계정 정책에 따라 선택지가 다를 수 있음)
  5) 배포된 웹 앱 URL을 script.js의 CONFIG.APPS_SCRIPT_URL에 붙여넣기
*/
const SPREADSHEET_ID = "여기에_스프레드시트_ID";
const SHEET_NAME = "응답";

function doPost(e) {
  const data = JSON.parse(e.postData.contents || "{}");
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["제출 시각", "디저트 취향", "선호 스타일", "오늘 가능한 시간", "추가 답변"]);
  }
  sheet.appendRow([
    data.submittedAt || new Date().toISOString(),
    data.dessert || "",
    data.texture || "",
    data.time || "",
    data.note || ""
  ]);
  return ContentService.createTextOutput("OK");
}
