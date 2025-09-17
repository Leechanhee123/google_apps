// API 통신 모듈
class AppsScriptAPI {
  constructor(config) {
    this.config = config;
  }

  // GET 요청
  async get(action, params = {}) {
    const url = new URL(this.config.getApiUrl());
    url.searchParams.append('action', action);

    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    try {
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API GET 요청 실패 (${action}):`, error);
      throw new Error(`API 요청 실패: ${error.message}`);
    }
  }

  // POST 요청
  async post(data) {
    try {
      const response = await fetch(this.config.getApiUrl(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API POST 요청 실패:', error);
      throw new Error(`API 요청 실패: ${error.message}`);
    }
  }

  // 리드 제출
  async submitLead(leadData) {
    const data = {
      action: 'submitLead',
      ...leadData
    };

    return await this.post(data);
  }

  // 설정 정보 가져오기
  async getConfig() {
    // 캐시 확인
    const cached = this.config.getFromCache('appConfig');
    if (cached) {
      return cached;
    }

    try {
      const data = await this.get('getConfig');
      this.config.setCache('appConfig', data);
      return data;
    } catch (error) {
      console.warn('원격 설정 로드 실패, 기본 설정 사용:', error);
      return this.config.getDefaultConfig();
    }
  }

  // 저장된 리드 데이터 가져오기
  async getEntries() {
    return await this.get('getEntries');
  }

  // API 연결 테스트
  async testConnection() {
    return await this.get('test');
  }
}

// API 유틸리티 함수들
class APIUtils {
  static showError(message, container) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-status error';
    errorDiv.textContent = message;

    container.innerHTML = '';
    container.appendChild(errorDiv);

    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  static showSuccess(message, container) {
    const successDiv = document.createElement('div');
    successDiv.className = 'form-status success';
    successDiv.textContent = message;

    container.innerHTML = '';
    container.appendChild(successDiv);

    setTimeout(() => {
      successDiv.remove();
    }, 5000);
  }

  static validatePhoneNumber(phone) {
    const phoneRegex = /^\d{2,3}-\d{3,4}-\d{4}$/;
    return phoneRegex.test(phone);
  }

  static formatPhoneNumber(phone) {
    // 숫자만 추출
    const numbers = phone.replace(/\D/g, '');

    // 자동 하이픈 추가
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
    } else if (numbers.length === 10) {
      return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    return phone;
  }

  static showLoading(button, show = true) {
    const btnText = button.querySelector('.btn-text');
    const btnSpinner = button.querySelector('.btn-spinner');

    if (show) {
      btnText.style.display = 'none';
      btnSpinner.style.display = 'inline';
      button.disabled = true;
    } else {
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
      button.disabled = false;
    }
  }

  static createDataTable(data) {
    if (!data || !data.rows || data.rows.length === 0) {
      return '<div class="table-placeholder"><p>저장된 데이터가 없습니다.</p></div>';
    }

    const headers = [
      { key: 'timestamp', label: '신청일시' },
      { key: 'name', label: '이름' },
      { key: 'phone', label: '연락처' },
      { key: 'service', label: '관심 서비스' },
      { key: 'contactPreference', label: '상담 방식' },
      { key: 'memo', label: '메모' }
    ];

    let html = '<table class="data-table"><thead><tr>';
    headers.forEach(header => {
      html += `<th>${header.label}</th>`;
    });
    html += '</tr></thead><tbody>';

    data.rows.forEach(row => {
      html += '<tr>';
      headers.forEach(header => {
        const value = row[header.key] || '';
        html += `<td>${this.escapeHtml(value)}</td>`;
      });
      html += '</tr>';
    });

    html += '</tbody></table>';
    return html;
  }

  static escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  static updateStatusIndicator(isConnected, message) {
    const indicator = document.getElementById('api-status-indicator');
    const dot = indicator.querySelector('.status-dot');
    const text = indicator.querySelector('.status-text');

    dot.className = `status-dot ${isConnected ? 'connected' : 'error'}`;
    text.textContent = message;
  }
}

// 전역 API 인스턴스
window.api = new AppsScriptAPI(window.config);
window.apiUtils = APIUtils;