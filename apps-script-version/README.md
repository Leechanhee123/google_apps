# Google Apps Script 기반 리드 수집 시스템

무료 호스팅(GitHub Pages) + Google Apps Script 백엔드로 완전한 커스텀 리드 수집 시스템을 구축합니다.

## 🌟 주요 특징

- ✅ **무료 호스팅**: GitHub Pages
- ✅ **완전한 디자인 자유도**: HTML/CSS/JS 커스터마이징
- ✅ **CORS 문제 해결**: Apps Script 웹앱
- ✅ **실시간 검증**: 클라이언트/서버 양쪽 검증
- ✅ **관리자 기능**: 브라우저에서 바로 데이터 조회
- ✅ **Google Sheets 직접 연동**: 별도 서버 불필요

## 🚀 빠른 시작 (15분 설정)

### 1단계: Google Apps Script 설정

1. **Google Apps Script 프로젝트 생성**
   - [script.google.com](https://script.google.com) 접속
   - "새 프로젝트" 클릭

2. **백엔드 코드 복사**
   - `backend/Code.gs` 파일 내용을 복사
   - Apps Script 에디터에 붙여넣기

3. **스프레드시트 생성 및 연결**
   ```javascript
   // Code.gs 상단에서 수정
   const SPREADSHEET_ID = 'YOUR_ACTUAL_SPREADSHEET_ID_HERE';
   ```
   - 새 Google Sheets 생성
   - URL에서 스프레드시트 ID 복사
   - 위 코드에서 `YOUR_ACTUAL_SPREADSHEET_ID_HERE` 부분 교체

4. **웹앱 배포**
   - 상단 메뉴: **배포** → **새 배포**
   - 유형: **웹 앱**
   - 실행 권한: **본인**
   - 액세스 권한: **모든 사용자**
   - **배포** 클릭
   - **웹 앱 URL 복사** (예: `https://script.google.com/macros/s/...../exec`)

### 2단계: 프론트엔드 설정

1. **GitHub 리포지토리 생성**
   - `frontend/` 폴더의 모든 파일을 업로드

2. **GitHub Pages 활성화**
   - **Settings** → **Pages**
   - **Source**: Deploy from a branch
   - **Branch**: main
   - **Folder**: / (root)

3. **API URL 설정**
   - GitHub Pages URL로 접속
   - 하단 "🔧 Apps Script API 상태" 섹션
   - 1단계에서 복사한 웹앱 URL 입력 후 저장

### 3단계: 테스트

1. **API 연결 테스트**
   - "API 연결 테스트" 버튼 클릭
   - ✅ 상태 확인

2. **폼 제출 테스트**
   - 상단 폼에서 테스트 데이터 입력
   - 제출 후 Google Sheets 확인

3. **관리자 기능 테스트**
   - "데이터 불러오기" 버튼 클릭
   - 저장된 리드 확인

## 📁 파일 구조

```
apps-script-version/
├── backend/
│   └── Code.gs             # Google Apps Script 백엔드 코드
├── frontend/
│   ├── index.html          # 메인 페이지
│   ├── css/
│   │   └── styles.css      # Google Material Design 스타일
│   └── js/
│       ├── config.js       # 설정 관리
│       ├── api.js          # API 통신
│       └── app.js          # 메인 애플리케이션 로직
└── README.md               # 이 파일
```

## ⚙️ 상세 설정

### Apps Script 권한 설정

첫 배포 시 필요한 권한:
- **Google Sheets API**: 데이터 읽기/쓰기
- **외부 URL 액세스**: CORS 헤더 설정

### 스프레드시트 설정

자동으로 생성되는 헤더:
- `Timestamp` - 신청 시각
- `Name` - 신청자 이름
- `Phone` - 연락처
- `Service` - 관심 서비스
- `ContactPreference` - 희망 상담 방식
- `Memo` - 추가 메모

### 보안 설정

**프로덕션 환경에서 권장:**
```javascript
// Code.gs에서 특정 도메인만 허용
function createCORSResponse(data, status = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);

  // 특정 도메인만 허용 (예시)
  // output.setHeader('Access-Control-Allow-Origin', 'https://yourdomain.github.io');

  return output;
}
```

## 🎨 커스터마이징

### 브랜딩 변경

**Apps Script에서 설정 변경:**
```javascript
// Code.gs의 getConfig() 함수에서
branding: {
  brandName: '당신의 브랜드명',
  landingTitle: '당신의 랜딩 타이틀',
  landingSubtitle: '당신의 서브타이틀',
  footerText: '당신의 푸터 텍스트'
}
```

### 폼 필드 수정

**서비스 옵션 변경:**
```javascript
service: {
  label: '관심 서비스 *',
  options: [
    '새로운 서비스 1',
    '새로운 서비스 2',
    '새로운 서비스 3'
  ]
}
```

### 스타일 커스터마이징

**CSS 변수 수정 (`css/styles.css`):**
```css
:root {
  --primary-color: #your-brand-color;
  --primary-hover: #your-hover-color;
}
```

## 🔧 고급 기능

### 이메일 알림 추가

Apps Script에서 이메일 알림:
```javascript
// submitLead 함수에 추가
function submitLead(data) {
  // ... 기존 코드 ...

  // 이메일 알림 발송
  MailApp.sendEmail({
    to: 'admin@yourdomain.com',
    subject: '새로운 리드 접수',
    body: `이름: ${data.name}\n연락처: ${data.phone}\n서비스: ${data.service}`
  });
}
```

### Slack 알림 연동

```javascript
function sendSlackNotification(leadData) {
  const webhook = 'YOUR_SLACK_WEBHOOK_URL';
  const payload = {
    text: `새로운 리드: ${leadData.name} (${leadData.phone})`
  };

  UrlFetchApp.fetch(webhook, {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}
```

### 데이터 검증 강화

```javascript
function validateLead(data) {
  const errors = [];

  // 이름 검증
  if (!data.name || data.name.length < 2) {
    errors.push('이름은 2글자 이상이어야 합니다.');
  }

  // 이메일 검증 (필드 추가시)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (data.email && !emailRegex.test(data.email)) {
    errors.push('올바른 이메일 형식이 아닙니다.');
  }

  return errors;
}
```

## 🐛 문제 해결

### CORS 오류
- Apps Script 웹앱이 "모든 사용자" 권한으로 배포되었는지 확인
- 새 배포로 다시 시도

### 데이터가 저장되지 않음
- 스프레드시트 ID가 올바른지 확인
- Apps Script 실행 권한 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인

### API 연결 실패
- 웹앱 URL이 `exec`로 끝나는지 확인
- Apps Script 프로젝트가 배포되었는지 확인

### GitHub Pages 404 오류
- `index.html`이 루트 디렉토리에 있는지 확인
- Pages 설정에서 브랜치와 폴더 확인

## 📊 성능 최적화

### 캐싱 전략
- 설정 정보 5분 캐시
- API 응답 로컬 스토리지 활용

### 로딩 최적화
- CSS/JS 파일 압축
- 이미지 최적화
- 지연 로딩 구현

## 🔄 업데이트 및 배포

### 백엔드 업데이트
1. Apps Script 코드 수정
2. 새 배포 생성
3. 프론트엔드 API URL 업데이트 (필요시)

### 프론트엔드 업데이트
1. GitHub에 코드 푸시
2. GitHub Pages 자동 배포

## 📈 확장 아이디어

- **다국어 지원**: i18n 라이브러리 추가
- **A/B 테스트**: 여러 폼 디자인 테스트
- **분석 연동**: Google Analytics 추가
- **챗봇 연동**: 실시간 상담 기능
- **결제 연동**: Stripe/PayPal 결제 폼

## 🆚 다른 버전과 비교

| 기능 | Apps Script 버전 | Node.js 버전 | 정적 버전 |
|------|------------------|--------------|-----------|
| **호스팅 비용** | 무료 | 유료 | 무료 |
| **커스터마이징** | 높음 | 매우 높음 | 낮음 |
| **설정 복잡도** | 중간 | 높음 | 낮음 |
| **CORS 해결** | ✅ | ✅ | ❌ |
| **실시간 검증** | ✅ | ✅ | ❌ |
| **관리자 기능** | ✅ | ✅ | ❌ |

## 🤝 지원 및 기여

이슈나 개선 제안은 GitHub Issues를 통해 제출해주세요.

## 📄 라이센스

MIT License - 자유롭게 사용하세요!