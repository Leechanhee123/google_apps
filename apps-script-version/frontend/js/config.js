// 설정 관리 모듈
class Config {
  constructor() {
    this.apiUrl = localStorage.getItem('appsScriptApiUrl') || '';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5분
  }

  // Apps Script API URL 설정
  setApiUrl(url) {
    this.apiUrl = url;
    localStorage.setItem('appsScriptApiUrl', url);
    this.clearCache();
  }

  // API URL 가져오기
  getApiUrl() {
    return this.apiUrl;
  }

  // API URL 유효성 검사
  isValidApiUrl(url) {
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.hostname === 'script.google.com' &&
             parsedUrl.pathname.includes('/macros/s/') &&
             parsedUrl.pathname.endsWith('/exec');
    } catch {
      return false;
    }
  }

  // 캐시된 데이터 가져오기
  getFromCache(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  // 캐시에 데이터 저장
  setCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  // 캐시 초기화
  clearCache() {
    this.cache.clear();
  }

  // 기본 설정값
  getDefaultConfig() {
    return {
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
          title: '🚀 시작은 10분이면 충분',
          description: 'Apps Script 설정만으로 별도 서버 없이 데이터를 바로 수집할 수 있습니다.'
        },
        {
          title: '👥 팀 동시 협업',
          description: 'Google Sheets 권한만 있으면 누구나 최신 리드를 열람하고 메모를 남길 수 있습니다.'
        },
        {
          title: '📊 맞춤 대시보드 연동',
          description: 'Looker Studio, Data Portal 등 원하는 도구로 바로 시각화까지 연결하세요.'
        }
      ]
    };
  }

  // API 연결 상태 확인
  async checkApiConnection() {
    if (!this.apiUrl) {
      return { connected: false, message: 'API URL이 설정되지 않았습니다.' };
    }

    try {
      const response = await fetch(`${this.apiUrl}?action=test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        connected: true,
        message: data.message || 'API 연결 성공!',
        data
      };
    } catch (error) {
      console.error('API 연결 테스트 실패:', error);
      return {
        connected: false,
        message: `연결 실패: ${error.message}`
      };
    }
  }
}

// 전역 config 인스턴스
window.config = new Config();