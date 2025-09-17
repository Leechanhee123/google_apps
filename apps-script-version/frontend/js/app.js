// 메인 애플리케이션 로직
class App {
  constructor() {
    this.isInitialized = false;
    this.config = window.config;
    this.api = window.api;
    this.utils = window.apiUtils;
  }

  // 앱 초기화
  async init() {
    if (this.isInitialized) return;

    try {
      // 로딩 표시
      this.showLoading(true);

      // 기본 UI 설정
      this.setupBasicUI();

      // 이벤트 리스너 등록
      this.setupEventListeners();

      // API URL이 있으면 설정 로드
      if (this.config.getApiUrl()) {
        await this.loadAppConfig();
        await this.checkApiStatus();
      } else {
        this.useDefaultConfig();
      }

      // 로딩 숨김
      this.showLoading(false);

      this.isInitialized = true;
      console.log('앱 초기화 완료');

    } catch (error) {
      console.error('앱 초기화 실패:', error);
      this.showLoading(false);
      this.showError('앱 초기화에 실패했습니다. 페이지를 새로고침해주세요.');
    }
  }

  // 기본 UI 설정
  setupBasicUI() {
    // 현재 연도 설정
    const yearElement = document.getElementById('year');
    if (yearElement) {
      yearElement.textContent = new Date().getFullYear();
    }

    // 현재 API URL 표시
    const apiUrlElement = document.getElementById('current-api-url');
    if (apiUrlElement) {
      const currentUrl = this.config.getApiUrl();
      apiUrlElement.textContent = currentUrl || '설정되지 않음';
    }

    // API URL 입력 필드에 현재 값 설정
    const apiUrlInput = document.getElementById('api-url-input');
    if (apiUrlInput) {
      apiUrlInput.value = this.config.getApiUrl();
    }
  }

  // 이벤트 리스너 설정
  setupEventListeners() {
    // 폼 제출
    const leadForm = document.getElementById('lead-form');
    if (leadForm) {
      leadForm.addEventListener('submit', this.handleFormSubmit.bind(this));
    }

    // 전화번호 자동 포맷팅
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
      phoneInput.addEventListener('input', this.handlePhoneInput.bind(this));
    }

    // API URL 저장
    const saveUrlBtn = document.getElementById('save-url-btn');
    if (saveUrlBtn) {
      saveUrlBtn.addEventListener('click', this.handleSaveApiUrl.bind(this));
    }

    // API 연결 테스트
    const testApiBtn = document.getElementById('test-api-btn');
    if (testApiBtn) {
      testApiBtn.addEventListener('click', this.handleTestApi.bind(this));
    }

    // 데이터 불러오기
    const loadDataBtn = document.getElementById('load-data-btn');
    if (loadDataBtn) {
      loadDataBtn.addEventListener('click', this.handleLoadData.bind(this));
    }

    // 새로고침
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => location.reload());
    }

    // 부드러운 스크롤
    document.querySelectorAll('a[href^="#"]').forEach(link => {
      link.addEventListener('click', this.handleSmoothScroll);
    });
  }

  // 앱 설정 로드
  async loadAppConfig() {
    try {
      const appConfig = await this.api.getConfig();
      this.applyConfig(appConfig);
    } catch (error) {
      console.warn('원격 설정 로드 실패, 기본 설정 사용:', error);
      this.useDefaultConfig();
    }
  }

  // 기본 설정 사용
  useDefaultConfig() {
    const defaultConfig = this.config.getDefaultConfig();
    this.applyConfig(defaultConfig);
  }

  // 설정 적용
  applyConfig(appConfig) {
    // 브랜딩 설정
    const branding = appConfig.branding || {};
    this.updateElementText('brand-name', branding.brandName);
    this.updateElementText('landing-title', branding.landingTitle);
    this.updateElementText('landing-subtitle', branding.landingSubtitle);
    this.updateElementText('footer-text', branding.footerText);

    // 폼 설정
    this.setupFormFields(appConfig.forms || {});

    // 기능 카드 설정
    this.setupFeatureCards(appConfig.features || []);
  }

  // 폼 필드 설정
  setupFormFields(formsConfig) {
    const fields = formsConfig.fields || {};

    // 서비스 옵션
    const serviceSelect = document.getElementById('service');
    if (serviceSelect && fields.service && fields.service.options) {
      serviceSelect.innerHTML = `<option value="">${fields.service.placeholder || '선택하세요'}</option>`;
      fields.service.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        serviceSelect.appendChild(optionElement);
      });
    }

    // 상담 방식 옵션
    const contactSelect = document.getElementById('contactPreference');
    if (contactSelect && fields.contactPreference && fields.contactPreference.options) {
      contactSelect.innerHTML = `<option value="">${fields.contactPreference.placeholder || '선택하세요'}</option>`;
      fields.contactPreference.options.forEach(option => {
        const optionElement = document.createElement('option');
        optionElement.value = option;
        optionElement.textContent = option;
        contactSelect.appendChild(optionElement);
      });
    }
  }

  // 기능 카드 설정
  setupFeatureCards(features) {
    const featureGrid = document.getElementById('feature-grid');
    if (!featureGrid) return;

    featureGrid.innerHTML = '';

    features.forEach(feature => {
      const card = document.createElement('div');
      card.className = 'feature-card fade-in';
      card.innerHTML = `
        <h3>${feature.title}</h3>
        <p>${feature.description}</p>
      `;
      featureGrid.appendChild(card);
    });
  }

  // API 상태 확인
  async checkApiStatus() {
    try {
      const result = await this.config.checkApiConnection();
      this.utils.updateStatusIndicator(result.connected, result.message);
    } catch (error) {
      this.utils.updateStatusIndicator(false, '연결 확인 실패');
    }
  }

  // 폼 제출 처리
  async handleFormSubmit(event) {
    event.preventDefault();

    const submitBtn = document.querySelector('.submit-btn');
    const statusDiv = document.getElementById('form-status');

    if (!this.config.getApiUrl()) {
      this.utils.showError('먼저 Apps Script API URL을 설정해주세요.', statusDiv);
      return;
    }

    try {
      this.utils.showLoading(submitBtn, true);

      const formData = new FormData(event.target);
      const leadData = {
        name: formData.get('name')?.trim(),
        phone: formData.get('phone')?.trim(),
        service: formData.get('service'),
        contactPreference: formData.get('contactPreference'),
        memo: formData.get('memo')?.trim() || ''
      };

      // 유효성 검사
      if (!leadData.name || !leadData.phone || !leadData.service || !leadData.contactPreference) {
        throw new Error('필수 항목을 모두 입력해주세요.');
      }

      if (!this.utils.validatePhoneNumber(leadData.phone)) {
        throw new Error('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)');
      }

      // API 호출
      const result = await this.api.submitLead(leadData);

      if (result.status === 'success') {
        this.utils.showSuccess(result.message, statusDiv);
        event.target.reset();
      } else {
        throw new Error(result.error || '알 수 없는 오류가 발생했습니다.');
      }

    } catch (error) {
      console.error('폼 제출 오류:', error);
      this.utils.showError(error.message, statusDiv);
    } finally {
      this.utils.showLoading(submitBtn, false);
    }
  }

  // 전화번호 입력 처리
  handlePhoneInput(event) {
    const input = event.target;
    const formatted = this.utils.formatPhoneNumber(input.value);

    if (formatted !== input.value) {
      input.value = formatted;
    }
  }

  // API URL 저장
  handleSaveApiUrl() {
    const input = document.getElementById('api-url-input');
    const url = input.value.trim();

    if (!url) {
      alert('API URL을 입력해주세요.');
      return;
    }

    if (!this.config.isValidApiUrl(url)) {
      alert('올바른 Google Apps Script URL이 아닙니다.\n예: https://script.google.com/macros/s/.../exec');
      return;
    }

    this.config.setApiUrl(url);

    // UI 업데이트
    document.getElementById('current-api-url').textContent = url;

    // API 상태 확인
    this.checkApiStatus();

    alert('API URL이 저장되었습니다.');
  }

  // API 연결 테스트
  async handleTestApi() {
    if (!this.config.getApiUrl()) {
      alert('먼저 API URL을 설정해주세요.');
      return;
    }

    try {
      const result = await this.config.checkApiConnection();
      alert(result.message);
      this.utils.updateStatusIndicator(result.connected, result.message);
    } catch (error) {
      alert(`연결 테스트 실패: ${error.message}`);
      this.utils.updateStatusIndicator(false, '연결 실패');
    }
  }

  // 데이터 불러오기
  async handleLoadData() {
    if (!this.config.getApiUrl()) {
      alert('먼저 API URL을 설정해주세요.');
      return;
    }

    const container = document.getElementById('data-table-container');
    const countElement = document.getElementById('data-count');

    try {
      container.innerHTML = '<div class="table-placeholder"><p>데이터를 불러오는 중...</p></div>';

      const data = await this.api.getEntries();

      if (data.rows && data.rows.length > 0) {
        container.innerHTML = this.utils.createDataTable(data);
        countElement.textContent = `총 ${data.rows.length}건의 데이터`;
      } else {
        container.innerHTML = '<div class="table-placeholder"><p>저장된 데이터가 없습니다.</p></div>';
        countElement.textContent = '데이터 없음';
      }

    } catch (error) {
      console.error('데이터 로드 오류:', error);
      container.innerHTML = `<div class="table-placeholder"><p>데이터 로드 실패: ${error.message}</p></div>`;
      countElement.textContent = '로드 실패';
    }
  }

  // 부드러운 스크롤
  handleSmoothScroll(event) {
    event.preventDefault();
    const targetId = event.target.getAttribute('href').substring(1);
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
      targetElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  // 로딩 표시/숨김
  showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
      if (show) {
        overlay.classList.remove('hidden');
      } else {
        overlay.classList.add('hidden');
      }
    }
  }

  // 텍스트 업데이트 유틸리티
  updateElementText(id, text) {
    const element = document.getElementById(id);
    if (element && text) {
      element.textContent = text;
    }
  }

  // 에러 표시
  showError(message) {
    alert(message);
  }
}

// 앱 시작
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
  window.app.init();
});