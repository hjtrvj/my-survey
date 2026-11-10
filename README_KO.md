# 취향 조사 사이트 스타터

친구에게 생일이나 선물 이야기를 직접 꺼내지 않고, 평범한 취향 질문처럼 보낼 수 있는 작은 웹사이트입니다.

## 1. 문구와 질문 수정하기

`script.js` 파일을 열어 수정하면 됩니다.

- 첫 화면 문구: `CONFIG.introTitle`, `CONFIG.introText`
- 질문과 선택지: `QUESTIONS` 안의 `title`, `subtitle`, `options`
- 도망 버튼 횟수: `CONFIG.dodgeLimit` (기본값 3)

시간 질문의 마지막 선택지는 `오늘은 못 만날 것 같아 🥺`입니다. 이 버튼은 포인터가 닿거나 터치하면 최대 3번 움직이고, 그 뒤에는 실제로 선택할 수 있게 됩니다. 도망 버튼을 눌러도 친구가 답변을 마칠 수 있도록 설계했습니다.

## 2. 사진이나 동영상 넣기

사진/동영상 파일을 `assets` 폴더에 넣은 다음 `index.html` 또는 `script.js`에 아래처럼 추가할 수 있습니다.

사진:
`<img src="assets/photo.jpg" alt="사진 설명">`

동영상:
`<video controls playsinline src="assets/clip.mp4"></video>`

파일 이름과 경로는 실제 넣은 파일명에 맞춰야 합니다.

## 3. 응답을 내게 전달하기

응답을 자동으로 받으려면 Google Sheets와 Apps Script 설정이 필요합니다.

1. Google 스프레드시트를 새로 만듭니다.
2. 스프레드시트 주소에서 `/d/`와 `/edit` 사이의 문자열이 스프레드시트 ID입니다.
3. 확장 프로그램 > Apps Script를 열고 `google-apps-script.gs`의 코드를 붙여넣습니다.
4. `SPREADSHEET_ID`를 실제 ID로 바꿉니다.
5. 배포 > 새 배포 > 웹 앱으로 배포합니다. 실행 권한과 접근 범위를 확인하세요.
6. 배포된 웹 앱 URL을 `script.js`의 `CONFIG.APPS_SCRIPT_URL`에 붙여넣습니다.

주의: 브라우저의 `no-cors` 요청은 페이지에서 서버의 성공 여부를 확인할 수 없습니다. 실제 배포 후 테스트 응답을 보내고 스프레드시트에 행이 추가되는지 직접 확인하세요. 접근 범위를 '모든 사용자'로 설정하면 링크를 가진 사람이 응답을 보낼 수 있으므로, 민감한 개인정보는 수집하지 마세요.

URL을 설정하지 않으면 사이트가 응답을 자동 전송하지 않습니다. 테스트 화면에서 답변을 복사할 수 있습니다.

## 4. GitHub Pages로 공개하기

1. GitHub에서 새 저장소(repository)를 만듭니다.
2. 압축을 푼 파일과 `assets` 폴더를 저장소에 업로드합니다.
3. 저장소 Settings > Pages에서 배포 소스를 설정합니다. 일반적으로 `Deploy from a branch`, `main`, `/(root)`를 선택합니다.
4. 생성된 공개 주소를 열어 휴대전화에서도 테스트합니다.

GitHub Pages 메뉴와 정책은 계정/저장소 설정에 따라 달라질 수 있습니다.

## 파일 구성

- `index.html`: 화면 뼈대
- `style.css`: 색상, 글꼴, 배치
- `script.js`: 질문, 화면 전환, 도망 버튼, 응답 처리
- `google-apps-script.gs`: Google Sheets 응답 수집 코드
- `assets/`: 사진·동영상 파일을 넣는 폴더
