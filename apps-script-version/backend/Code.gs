  /**
   * Google Apps Script 백엔드
   * 리드 데이터를 Google Sheets에 저장하고 API 엔드포인트 제공
   */

  // 설정 - 실제 사용시 본인의 스프레드시트 ID로 변경하세요
  const SPREADSHEET_ID = '1_vgmXfFTnUrebptefeXBRD1rsRyZL1gPPgGY8oyrTRQ'; // URL이 아닌 ID만    
  const SHEET_NAME = '리드데이터';

  // CORS 허용을 위한 응답 설정
  function createCORSResponse(data, status = 200) {
    const output = ContentService.createTextOutput(JSON.stringify(data));
    output.setMimeType(ContentService.MimeType.JSON);
    return output; // Apps Script가 자동으로 CORS 처리
  }

  // GET 요청 처리
  function doGet(e) {
    const action = e.parameter.action;

    try {
      switch (action) {
        case 'test':
          return createCORSResponse({
            status: 'ok',
            message: 'Apps Script API 연결 성공!',
            timestamp: new Date().toISOString()
          });

        case 'getEntries':
          return getEntries();

        case 'getConfig':
          return getConfig();

        default:
          return createCORSResponse({
            error: '지원하지 않는 액션입니다.',
            availableActions: ['test', 'getEntries', 'getConfig']
          }, 400);
      }
    } catch (error) {
      console.error('doGet 오류:', error);
      return createCORSResponse({
        error: '서버 오류가 발생했습니다.',
        details: error.toString()
      }, 500);
    }
  }

// POST 요청 처리 (리드 저장)
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    switch (action) {
      case 'submitLead':
        return submitLead(data);

      default:
        return createCORSResponse({
          error: '지원하지 않는 액션입니다.'
        }, 400);
    }
  } catch (error) {
    console.error('doPost 오류:', error);
    return createCORSResponse({
      error: '데이터 처리 중 오류가 발생했습니다.',
      details: error.toString()
    }, 500);
  }
}

// 리드 데이터 저장
function submitLead(data) {
  try {
    // 입력 검증
    const { name, phone, service, contactPreference, memo } = data;

    if (!name || !phone || !service || !contactPreference) {
      return createCORSResponse({
        error: '필수 항목이 누락되었습니다.'
      }, 400);
    }

    // 전화번호 형식 검증
    const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
    if (!phoneRegex.test(phone)) {
      return createCORSResponse({
        error: '전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)'
      }, 400);
    }

    // 스프레드시트 열기
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    // 시트가 없으면 생성
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // 헤더 추가
      sheet.getRange(1, 1, 1, 6).setValues([[
        'Timestamp', 'Name', 'Phone', 'Service', 'ContactPreference', 'Memo'
      ]]);
      sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
    }

    // 데이터 추가
    const timestamp = new Date().toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    sheet.appendRow([
      timestamp,
      name.trim(),
      phone.trim(),
      service,
      contactPreference,
      memo ? memo.trim() : ''
    ]);

    // 성공 응답
    return createCORSResponse({
      status: 'success',
      message: '신청이 완료되었습니다. 빠르게 연락드릴게요!',
      timestamp: timestamp
    });

  } catch (error) {
    console.error('submitLead 오류:', error);
    return createCORSResponse({
      error: '데이터 저장 중 오류가 발생했습니다.',
      details: error.toString()
    }, 500);
  }
}

// 저장된 리드 데이터 조회
function getEntries() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return createCORSResponse({ rows: [] });
    }

    const data = sheet.getDataRange().getValues();
    const [headers, ...rows] = data;

    // 객체 배열로 변환
    const entries = rows.map(row => ({
      timestamp: row[0] || '',
      name: row[1] || '',
      phone: row[2] || '',
      service: row[3] || '',
      contactPreference: row[4] || '',
      memo: row[5] || ''
    }));

    return createCORSResponse({
      rows: entries,
      count: entries.length
    });

  } catch (error) {
    console.error('getEntries 오류:', error);
    return createCORSResponse({
      error: '데이터 조회 중 오류가 발생했습니다.',
      details: error.toString()
    }, 500);
  }
}

// 프론트엔드 설정 정보 제공
function getConfig() {
  const config = {
    branding: {
      brandName: '스프레드시트 자동화',
      landingTitle: '구글 시트로 간편하게 리드를 모으고 관리하세요',
      landingSubtitle: '전화번호와 관심 정보를 남겨 주시면, 맞춤 상담을 준비해 바로 연락드립니다.',
      footerText: '스프레드시트 자동화. 모든 권리 보유.'
    },
    forms: {
      submittingMessage: '제출 중...',
      successMessage: '신청이 완료되었습니다. 빠르게 연락드릴게요!',
      errorMessage: '제출에 실패했습니다. 다시 시도해주세요.',
      fields: {
        name: {
          label: '이름 *',
          placeholder: '홍길동',
          required: true
        },
        phone: {
          label: '연락처 *',
          placeholder: '010-1234-5678',
          required: true,
          pattern: '^\\d{2,3}-\\d{3,4}-\\d{4}$'
        },
        service: {
          label: '관심 서비스 *',
          placeholder: '관심 서비스를 선택하세요',
          options: [
            '데이터 수집 자동화',
            '영업 리드 관리',
            '마케팅 캠페인 추적',
            '맞춤형 대시보드 구성'
          ]
        },
        contactPreference: {
          label: '희망 상담 방식 *',
          placeholder: '희망 상담 방식을 선택하세요',
          options: ['전화 상담', '온라인 미팅', '이메일 회신']
        },
        memo: {
          label: '추가로 궁금한 내용을 알려주세요',
          placeholder: '원하시는 일정이나 참고 사항이 있다면 작성해주세요.',
          rows: 4
        }
      }
    },
    features: [
      {
        title: '시작은 10분이면 충분',
        description: 'Apps Script 설정만으로 별도 서버 없이 데이터를 바로 수집할 수 있습니다.'
      },
      {
        title: '팀 동시 협업',
        description: 'Google Sheets 권한만 있으면 누구나 최신 리드를 열람하고 메모를 남길 수 있습니다.'
      },
      {
        title: '맞춤 대시보드 연동',
        description: 'Looker Studio, Data Portal 등 원하는 도구로 바로 시각화까지 연결하세요.'
      }
    ]
  };

  return createCORSResponse(config);
}

// 수동 테스트용 함수
function testAPI() {
  console.log('=== Apps Script API 테스트 ===');

  // 테스트 데이터
  const testLead = {
    action: 'submitLead',
    name: '테스트 사용자',
    phone: '010-1234-5678',
    service: '데이터 수집 자동화',
    contactPreference: '전화 상담',
    memo: '테스트 메모입니다.'
  };

  try {
    const result = submitLead(testLead);
    console.log('테스트 결과:', result.getContent());
  } catch (error) {
    console.error('테스트 오류:', error);
  }
}