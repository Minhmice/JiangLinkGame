(function() {
  'use strict';

  const GOOGLE_SHEET_WEB_APP_URL = window.GOOGLE_SHEET_WEB_APP_URL || 'https://script.google.com/macros/s/AKfycbz5OCsKuQw3-Ny2Qh-7BR1F3ZLjzgo0wAeiifIAjTu7fjH-6bPlRdGv2rtsuAamRKbD7A/exec';
  const sharedRequirementHeading = 'Tạo form theo mẫu dưới đây:';
  const defaultPlaceholder = 'Viết HTML code ở đây...';

  let metadataState = null;
  let timer = null;
  const completedSteps = new Set();
  let currentStep = 1;
  let isTimeUp = false;

  let stepperElement = null;
  let submissionStatusElement = null;
  let timerDisplayElement = null;
  
  // Debounce timers for auto-save
  const debounceTimers = {};

  const exerciseData = [
    {
      id: 1,
      defaultTitle: 'Input Type Text',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="hoten">Họ tên:</label> <input id="hoten" type="text" name="ho_ten">`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input_tương_ứng"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"text"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span><span class="tag">&gt;</span>`,
      answer: `<label for="hoten">Họ tên:</label>
<input id="hoten" type="text" name="ho_ten">`
    },
    {
      id: 2,
      defaultTitle: 'Input Type Password',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="mk">Mật Khẩu:</label> <input type="password" id="mk" value="88888888">`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input_tương_ứng"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"password"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>`,
      answer: `<label for="mk">Mật Khẩu:</label>
<input type="password" id="mk" value="88888888">`
    },
    {
      id: 3,
      defaultTitle: 'Radio Buttons - Chọn size',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label>Chọn size:</label><br><input type="radio" name="size" value="S" id="sizeS"> <label for="sizeS">S</label> <input type="radio" name="size" value="M" id="sizeM" checked> <label for="sizeM">M</label> <input type="radio" name="size" value="L" id="sizeL"> <label for="sizeL">L</label>`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input_tương_ứng"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"radio"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>`,
      answer: `<label>Chọn size:</label><br>
<input type="radio" name="size" value="S" id="sizeS">
<label for="sizeS">S</label>
<input type="radio" name="size" value="M" id="sizeM" checked>
<label for="sizeM">M</label>
<input type="radio" name="size" value="L" id="sizeL">
<label for="sizeL">L</label>`
    },
    {
      id: 4,
      defaultTitle: 'Checkbox - Chọn sở thích',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label>Sở thích:</label><br><input type="checkbox" name="hobby" value="music" id="hb1" checked> <label for="hb1">Âm nhạc</label> <input type="checkbox" name="hobby" value="sport" id="hb2"> <label for="hb2">Thể thao</label> <input type="checkbox" name="hobby" value="reading" id="hb3"> <label for="hb3">Đọc sách</label>`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input_tương_ứng"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"checkbox"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>`,
      answer: `<label>Sở thích:</label><br>
<input type="checkbox" name="hobby" value="music" id="hb1" checked>
<label for="hb1">Âm nhạc</label>
<input type="checkbox" name="hobby" value="sport" id="hb2">
<label for="hb2">Thể thao</label>
<input type="checkbox" name="hobby" value="reading" id="hb3">
<label for="hb3">Đọc sách</label>`
    },
    {
      id: 5,
      defaultTitle: 'Select & Option - Chọn thành phố',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="city">Thành phố:</label> <select id="city" name="thanh_pho"> <option value="">-- Chọn --</option> <option value="hn">Hà Nội</option> <option value="hcm" selected>TP.HCM</option> <option value="dn">Đà Nẵng</option> </select>`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_select"</span><span class="tag">&gt;</span>Nhãn:<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;select</span> <span class="attr">id</span>=<span class="value">"id_select"</span> <span class="attr">name</span>=<span class="value">"tên_select"</span><span class="tag">&gt;</span><br>
        &nbsp;&nbsp;<span class="tag">&lt;option</span> <span class="attr">value</span>=<span class="value">"giá_trị"</span> <span class="attr">selected</span><span class="tag">&gt;</span>Text hiển thị<span class="tag">&lt;/option&gt;</span><br><span class="tag">&lt;/select&gt;</span>`,
      answer: `<label for="city">Thành phố:</label>
<select id="city" name="thanh_pho">
  <option value="">-- Chọn --</option>
  <option value="hn">Hà Nội</option>
  <option value="hcm" selected>TP.HCM</option>
  <option value="dn">Đà Nẵng</option>
</select>`
    },
    {
      id: 6,
      defaultTitle: 'Textarea - Nhập nội dung dài',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="message">Lời nhắn:</label><br><textarea id="message" name="loi_nhan" rows="4" cols="30" placeholder="Nhập lời nhắn..."></textarea>`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_textarea"</span><span class="tag">&gt;</span>Nhãn:<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;textarea</span> <span class="attr">id</span>=<span class="value">"id_textarea"</span> <span class="attr">name</span>=<span class="value">"tên_textarea"</span> <span class="attr">rows</span>=<span class="value">"4"</span> <span class="attr">cols</span>=<span class="value">"30"</span><span class="tag">&gt;&lt;/textarea&gt;</span>`,
      answer: `<label for="message">Lời nhắn:</label><br>
<textarea id="message" name="loi_nhan" rows="4" cols="30" placeholder="Nhập lời nhắn..."></textarea>`
    },
    {
      id: 7,
      defaultTitle: 'Button - Nút bấm',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<button type="button">Nhấn vào đây</button>`,
      syntax: `<span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"button"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>`,
      answer: `<button type="button">Nhấn vào đây</button>`
    },
    {
      id: 8,
      defaultTitle: 'Submit - Nút gửi form',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<button type="submit">Gửi đi</button>`,
      syntax: `<span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"submit"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>`,
      answer: `<button type="submit">Gửi đi</button>`
    },
    {
      id: 9,
      defaultTitle: 'Input Type File - Chọn file',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="avatar">Chọn ảnh đại diện:</label><br><input type="file" id="avatar" name="anh_dai_dien" accept="image/*">`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Nhãn:<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"file"</span><span class="tag">&gt;</span>`,
      answer: `<label for="avatar">Chọn ảnh đại diện:</label><br>
<input type="file" id="avatar" name="anh_dai_dien" accept="image/*">`
    },
    {
      id: 10,
      defaultTitle: 'Fieldset - Nhóm thông tin',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<fieldset><legend>Thông tin cá nhân</legend> <label for="fullname">Họ tên:</label> <input type="text" id="fullname" name="ho_ten"><br><br><label for="email">Email:</label> <input type="text" id="email" name="email"></fieldset>`,
      syntax: `<span class="tag">&lt;fieldset&gt;</span><br>
        &nbsp;&nbsp;<span class="tag">&lt;legend&gt;</span>Tiêu đề nhóm<span class="tag">&lt;/legend&gt;</span><br>
        &nbsp;&nbsp;<span class="comment">...Các input trong nhóm...</span><br><span class="tag">&lt;/fieldset&gt;</span>`,
      answer: `<fieldset>
  <legend>Thông tin cá nhân</legend>
  <label for="fullname">Họ tên:</label>
  <input type="text" id="fullname" name="ho_ten"><br><br>
  <label for="email">Email:</label>
  <input type="text" id="email" name="email">
</fieldset>`
    }
  ];

  const exerciseTitles = exerciseData.reduce((acc, exercise) => {
    acc[exercise.id] = exercise.defaultTitle;
    return acc;
  }, {});

  const answers = exerciseData.reduce((acc, exercise) => {
    acc[exercise.id] = exercise.answer;
    return acc;
  }, {});

  function loadMetadataFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const encryptedData = urlParams.get('data');
      
      if (!encryptedData) {
        const confirmed = confirm('Bạn chưa có dữ liệu hợp lệ. Bạn có muốn quay lại trang thiết lập không?');
        if (confirmed) {
          window.location.href = 'index.html';
        } else {
          window.location.href = 'index.html';
        }
        return null;
      }

      const decrypted = window.EncryptionUtils.decrypt(encryptedData);
      const metadata = JSON.parse(decrypted);
      
      // Save metadata to localStorage for validation
      saveMetadataToLocal(metadata);
      
      return metadata;
    } catch (error) {
      console.error('Error loading metadata:', error);
      const confirmed = confirm('Dữ liệu không hợp lệ. Bạn có muốn quay lại trang thiết lập không?');
      if (confirmed) {
        window.location.href = 'index.html';
      } else {
        window.location.href = 'index.html';
      }
      return null;
    }
  }

  // LocalStorage Functions
  const STORAGE_PREFIX = 'game3_';
  
  function saveCodeToLocal(exerciseId, code) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}code_${exerciseId}`, code);
    } catch (error) {
      console.error('Error saving code to localStorage:', error);
    }
  }

  function loadCodeFromLocal(exerciseId) {
    try {
      return localStorage.getItem(`${STORAGE_PREFIX}code_${exerciseId}`) || '';
    } catch (error) {
      console.error('Error loading code from localStorage:', error);
      return '';
    }
  }

  function saveCompletedSteps() {
    try {
      const stepsArray = Array.from(completedSteps);
      localStorage.setItem(`${STORAGE_PREFIX}completedSteps`, JSON.stringify(stepsArray));
    } catch (error) {
      console.error('Error saving completed steps to localStorage:', error);
    }
  }

  function loadCompletedSteps() {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}completedSteps`);
      if (saved) {
        const stepsArray = JSON.parse(saved);
        stepsArray.forEach(step => completedSteps.add(step));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error loading completed steps from localStorage:', error);
      return false;
    }
  }

  function saveRemainingTime(seconds) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}remainingTime`, String(seconds));
    } catch (error) {
      console.error('Error saving remaining time to localStorage:', error);
    }
  }

  function loadRemainingTime() {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}remainingTime`);
      if (saved) {
        const seconds = parseInt(saved, 10);
        return isNaN(seconds) ? null : seconds;
      }
      return null;
    } catch (error) {
      console.error('Error loading remaining time from localStorage:', error);
      return null;
    }
  }

  function saveMetadataToLocal(metadata) {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}metadata`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error saving metadata to localStorage:', error);
    }
  }

  function loadMetadataFromLocal() {
    try {
      const saved = localStorage.getItem(`${STORAGE_PREFIX}metadata`);
      if (saved) {
        return JSON.parse(saved);
      }
      return null;
    } catch (error) {
      console.error('Error loading metadata from localStorage:', error);
      return null;
    }
  }

  function loadAllProgress() {
    // Load completed steps
    loadCompletedSteps();
    
    // Code is already loaded in createExerciseCard, so we just need to update stepper
    // Update stepper after loading completed steps
    renderStepper();
  }

  function clearAllProgress() {
    try {
      // Clear all game3 related localStorage items
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing progress from localStorage:', error);
    }
  }

  function initTimer() {
    if (!metadataState || !timerDisplayElement) return;

    // Try to load remaining time from localStorage
    const savedRemainingTime = loadRemainingTime();
    const durationMinutes = savedRemainingTime 
      ? Math.ceil(savedRemainingTime / 60) 
      : (metadataState.duration || 5);
    
    timer = new window.Timer(
      durationMinutes,
      function(timeString, isWarning) {
        if (timerDisplayElement) {
          timerDisplayElement.textContent = `⏱️ Thời gian còn lại: ${timeString}`;
          timerDisplayElement.classList.toggle('warning', isWarning);
        }
        // Save remaining time every second
        if (timer) {
          const remaining = timer.getRemaining();
          saveRemainingTime(remaining);
        }
      },
      function() {
        isTimeUp = true;
        showSubmissionStatus('⏰ Hết thời gian! Bây giờ bạn có thể xong bài.', 'info');
        setTimeout(() => {
          submitExercises();
        }, 2000);
      }
    );

    // If we have saved remaining time, set it directly
    if (savedRemainingTime !== null && savedRemainingTime > 0) {
      timer.setRemaining(savedRemainingTime);
      // Update display immediately
      if (timerDisplayElement) {
        const isWarning = savedRemainingTime <= 60;
        timerDisplayElement.textContent = `⏱️ Thời gian còn lại: ${formatTime(savedRemainingTime)}`;
        timerDisplayElement.classList.toggle('warning', isWarning);
      }
    }

    timer.start();
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function calculateElapsedTime() {
    if (!metadataState || !metadataState.startTime) return 0;
    const start = new Date(metadataState.startTime);
    const now = new Date();
    return Math.floor((now - start) / 1000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    metadataState = loadMetadataFromURL();
    if (!metadataState) {
      return;
    }
    renderApp();
    initElementSdk();
  });

  function renderApp() {
    const appRoot = document.getElementById('app');
    if (!appRoot) {
      return;
    }

    appRoot.innerHTML = '';
    const exerciseSection = createExercisePage();
    appRoot.appendChild(exerciseSection);

    // Load all progress from localStorage
    loadAllProgress();
    
    renderStepper();
    updateStepVisibility();
    updateSubmitButtonState();
    initTimer();
  }

  function createExercisePage() {
    const section = document.createElement('section');
    section.className = 'exercise-page';
    section.innerHTML = `
      <div class="progress-panel">
        <div class="timer-display" id="timerDisplay">⏱️ Thời gian còn lại: ${formatTime((metadataState.duration || 5) * 60)}</div>
        <p class="stepper-title">🌟 Tiến trình bài tập</p>
        <div class="stepper" id="stepper"></div>
        <div class="progress-actions">
          <div class="submission-status" id="submissionStatus" aria-live="polite"></div>
        </div>
        <div class="total-score" id="totalScore">
          <h3>🏆 Kết quả của bạn</h3>
          <div class="stars" id="totalStars"></div>
          <p id="scoreMessage" style="margin-top: 12px; font-size: 16px;"></p>
        </div>
      </div>
      <div class="container" id="exerciseContainer"></div>
    `;

    stepperElement = section.querySelector('#stepper');
    submissionStatusElement = section.querySelector('#submissionStatus');
    timerDisplayElement = section.querySelector('#timerDisplay');

    const container = section.querySelector('#exerciseContainer');
    exerciseData.forEach(exercise => {
      const card = createExerciseCard(exercise);
      container.appendChild(card);
    });

    return section;
  }

  function createExerciseCard(exercise) {
    const template = document.createElement('template');
    template.innerHTML = getExerciseTemplate(exercise).trim();
    const card = template.content.firstElementChild;
    if (card) {
      card.dataset.step = String(exercise.id);
      
      // Add auto-save listener for code input
      const textarea = card.querySelector(`#code${exercise.id}`);
      if (textarea) {
        // Restore saved code
        const savedCode = loadCodeFromLocal(exercise.id);
        if (savedCode) {
          textarea.value = savedCode;
        }
        
        // Add input listener with debounce
        textarea.addEventListener('input', function() {
          const code = textarea.value;
          
          // Clear existing debounce timer
          if (debounceTimers[exercise.id]) {
            clearTimeout(debounceTimers[exercise.id]);
          }
          
          // Set new debounce timer
          debounceTimers[exercise.id] = setTimeout(() => {
            saveCodeToLocal(exercise.id, code);
          }, 500);
        });
      }
    }
    return card;
  }

  function getExerciseTemplate(exercise) {
    const titleId = `exercise${exercise.id}Title`;
    const requirementHeading = exercise.requirementHeading || sharedRequirementHeading;
    const placeholder = exercise.codePlaceholder || defaultPlaceholder;
    const title = exerciseTitles[exercise.id] || exercise.defaultTitle;

    return `
      <article class="exercise-card" data-step="${exercise.id}">
        <div class="exercise-header">
          <div class="exercise-number">${exercise.id}</div>
          <h2 class="exercise-title" id="${titleId}">${title}</h2>
        </div>
        <div class="section">
          <div class="section-title">📋 Yêu cầu</div>
          <div class="requirement-box">
            <h4>${requirementHeading}</h4>
            <div class="demo-form">${exercise.requirementDemo}</div>
          </div>
        </div>
        <div class="section">
          <div class="section-title">💡 Mẫu cú pháp</div>
          <div class="syntax-box">${exercise.syntax}</div>
        </div>
        <div class="section">
          <div class="section-title">✍️ Viết code của bạn</div>
          <div class="code-editor">
            <textarea id="code${exercise.id}" placeholder="${placeholder}"></textarea>
            <div class="error-message" id="error${exercise.id}"></div>
          </div>
          <div class="button-group">
            <button class="btn btn-run" onclick="window.runCode(${exercise.id})"><span>▶</span> Chạy code</button>
            <button class="btn btn-clear" onclick="window.clearCode(${exercise.id})">🗑️ Xóa</button>
          </div>
          <div class="step-feedback" id="feedback${exercise.id}" role="status" aria-live="polite"></div>
        </div>
        <div class="section">
          <div class="section-title">👀 Kết quả hiển thị</div>
          <div class="preview-box" id="preview${exercise.id}">
            <div class="preview-placeholder">Nhấn "Chạy code" để xem kết quả</div>
          </div>
        </div>
        <div class="answer-section" id="answer${exercise.id}">
          <div class="answer-header">
            <h3 class="answer-title">✅ Đáp án</h3>
            <div class="score-display">
              <span>Điểm:</span>
              <span class="star" id="star${exercise.id}">⭐</span>
            </div>
          </div>
          <div class="answer-code" id="answerCode${exercise.id}"></div>
        </div>
      </article>
    `;
  }

  function renderStepper() {
    if (!stepperElement) {
      return;
    }

    const fragment = document.createDocumentFragment();
    exerciseData.forEach(exercise => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'stepper-item';
      btn.innerHTML = `<span class="step-index">${exercise.id}</span><span class="sr-only">Bài ${exercise.id}</span>`;

      if (completedSteps.has(exercise.id)) {
        btn.classList.add('completed');
      }

      if (exercise.id === currentStep) {
        btn.classList.add('active');
      }

      btn.addEventListener('click', () => setCurrentStep(exercise.id));
      fragment.appendChild(btn);
    });

    stepperElement.innerHTML = '';
    stepperElement.appendChild(fragment);
  }

  function setCurrentStep(step) {
    const normalized = Math.min(Math.max(step, 1), exerciseData.length);
    if (normalized === currentStep) {
      updateStepVisibility();
      return;
    }

    currentStep = normalized;
    updateStepVisibility();
    renderStepper();
  }

  function updateStepVisibility() {
    const cards = document.querySelectorAll('.exercise-card');
    cards.forEach(card => {
      const step = Number(card.dataset.step);
      if (step === currentStep) {
        card.classList.remove('exercise-card--hidden');
      } else {
        card.classList.add('exercise-card--hidden');
      }
    });
  }

  function markStepComplete(step) {
    if (!completedSteps.has(step)) {
      completedSteps.add(step);
      updateStarState(step, true);
      renderStepper();
      // Save completed steps to localStorage
      saveCompletedSteps();
    }
  }

  function updateStarState(step, isCorrect) {
    const star = document.getElementById(`star${step}`);
    if (!star) {
      return;
    }
    star.style.color = isCorrect ? '#ffd700' : '#ddd';
  }

  function updateStepFeedback(step, message, status) {
    const feedback = document.getElementById(`feedback${step}`);
    if (!feedback) {
      return;
    }
    feedback.textContent = message;
    feedback.classList.remove('step-feedback--success', 'step-feedback--error');
    if (status === 'success') {
      feedback.classList.add('step-feedback--success');
    } else if (status === 'error') {
      feedback.classList.add('step-feedback--error');
    } else {
      feedback.style.display = 'none';
    }
  }

  function updateSubmitButtonState() {
    // No longer needed
  }

  function showSubmissionStatus(message, variant) {
    if (!submissionStatusElement) {
      return;
    }
    if (!message) {
      submissionStatusElement.style.display = 'none';
      submissionStatusElement.removeAttribute('data-variant');
      submissionStatusElement.textContent = '';
      return;
    }
    submissionStatusElement.textContent = message;
    submissionStatusElement.dataset.variant = variant || 'info';
  }

  function showTotalScore(totalScore) {
    const totalScoreDiv = document.getElementById('totalScore');
    const totalStarsDiv = document.getElementById('totalStars');
    const scoreMessage = document.getElementById('scoreMessage');

    if (totalStarsDiv) {
      totalStarsDiv.textContent = '⭐'.repeat(totalScore);
    }

    if (scoreMessage) {
      if (totalScore === exerciseData.length) {
        scoreMessage.textContent = '🎉 Xuất sắc! Bạn đã hoàn thành tất cả các bài tập!';
      } else if (totalScore >= 7) {
        scoreMessage.textContent = '👍 Tốt lắm! Hãy xem lại đáp án để học thêm nhé!';
      } else if (totalScore >= 4) {
        scoreMessage.textContent = '💪 Cố gắng lên! So sánh code của bạn với đáp án để cải thiện!';
      } else {
        scoreMessage.textContent = '📚 Đọc kỹ đáp án và luyện tập thêm nhé!';
      }
    }

    if (totalScoreDiv) {
      totalScoreDiv.classList.add('show');
      totalScoreDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function revealAllAnswers() {
    exerciseData.forEach(({ id }) => {
      const answerSection = document.getElementById(`answer${id}`);
      const answerCodeDiv = document.getElementById(`answerCode${id}`);
      if (answerSection && answerCodeDiv) {
        answerCodeDiv.textContent = answers[id];
        answerSection.classList.add('show');
      }
    });
  }

  function disableAllInputs() {
    document.querySelectorAll('.btn-run, .btn-clear').forEach(btn => {
      btn.disabled = true;
    });
    document.querySelectorAll('.code-editor textarea').forEach(textarea => {
      textarea.disabled = true;
    });
    if (timer) {
      timer.stop();
    }
  }

  function normalizeCode(code) {
    return code
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/>\s+</g, '><')
      .trim();
  }

  function normalizeForComparison(code) {
    let normalized = normalizeCode(code);
    normalized = normalized.replace(/\bfor\s*=\s*["'][^"']*["']/gi, 'for="X"');
    normalized = normalized.replace(/\bid\s*=\s*["'][^"']*["']/gi, 'id="X"');
    normalized = normalized.replace(/\bname\s*=\s*["'][^"']*["']/gi, 'name="X"');
    return normalized;
  }

  function isAnswerCorrect(step, code) {
    const answer = answers[step];
    if (!answer) {
      return false;
    }
    return normalizeForComparison(code) === normalizeForComparison(answer);
  }

  function renderPreview(previewDiv, code) {
    previewDiv.innerHTML = code;
    previewDiv.classList.add('has-content');

    const forms = previewDiv.querySelectorAll('form');
    forms.forEach(form => {
      form.addEventListener('submit', function(event) {
        event.preventDefault();
        const formData = new FormData(form);
        let result = '✅ Form đã được submit!\n\nDữ liệu:\n';
        for (const [key, value] of formData.entries()) {
          result += `${key}: ${value}\n`;
        }

        const resultDiv = document.createElement('div');
        resultDiv.style.cssText = 'margin-top: 16px; padding: 12px; background: #d4edda; border: 2px solid #28a745; border-radius: 6px; color: #155724; white-space: pre-line; font-family: monospace; font-size: 13px;';
        resultDiv.textContent = result;

        const existing = form.parentElement.querySelector('.form-result');
        if (existing) existing.remove();
        resultDiv.className = 'form-result';
        form.parentElement.appendChild(resultDiv);
      });
    });
  }

  function showFloatingIcon(exerciseNum, isCorrect) {
    const card = document.querySelector(`.exercise-card[data-step="${exerciseNum}"]`);
    if (!card) return;

    const icon = document.createElement('div');
    icon.className = 'floating-icon';
    icon.textContent = isCorrect ? '✅' : '❌';
    icon.style.cssText = `
      position: fixed;
      font-size: 80px;
      z-index: 10000;
      pointer-events: none;
      animation: floatUp 0.5s ease-out, floatDown 0.5s ease-in 0.5s;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
    `;

    document.body.appendChild(icon);

    setTimeout(() => {
      icon.remove();
    }, 1000);
  }

  window.runCode = function(exerciseNum) {
    const codeTextarea = document.getElementById(`code${exerciseNum}`);
    const previewDiv = document.getElementById(`preview${exerciseNum}`);
    const errorDiv = document.getElementById(`error${exerciseNum}`);

    if (!codeTextarea || !previewDiv || !errorDiv) {
      return;
    }

    const code = codeTextarea.value.trim();
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    if (!code) {
      errorDiv.textContent = '⚠️ Vui lòng nhập code HTML trước khi chạy!';
      errorDiv.style.display = 'block';
      return;
    }

    try {
      renderPreview(previewDiv, code);
      const isCorrect = isAnswerCorrect(exerciseNum, code);
      
      // Save code to localStorage after checking
      saveCodeToLocal(exerciseNum, code);
      
      // Show floating icon animation
      showFloatingIcon(exerciseNum, isCorrect);
      
      if (isCorrect) {
        setTimeout(() => {
          updateStepFeedback(exerciseNum, '🎉 Tuyệt vời! Bạn đã hoàn thành bước này.', 'success');
          markStepComplete(exerciseNum);
          // Auto next after icon animation completes
          setTimeout(() => {
            if (exerciseNum < exerciseData.length) {
              setCurrentStep(exerciseNum + 1);
            }
          }, 500);
        }, 1000);
      } else {
        setTimeout(() => {
          updateStepFeedback(exerciseNum, '❌ Chưa chính xác. Hãy kiểm tra lại code với yêu cầu.', 'error');
          completedSteps.delete(exerciseNum);
          updateStarState(exerciseNum, false);
          renderStepper();
          // Update completed steps in localStorage
          saveCompletedSteps();
        }, 1000);
      }
    } catch (error) {
      errorDiv.textContent = `❌ Lỗi: ${error.message}`;
      errorDiv.style.display = 'block';
      previewDiv.innerHTML = '<div class="preview-placeholder">Code có lỗi, vui lòng kiểm tra lại</div>';
      previewDiv.classList.remove('has-content');
    }
  };

  window.clearCode = function(exerciseNum) {
    const codeTextarea = document.getElementById(`code${exerciseNum}`);
    const previewDiv = document.getElementById(`preview${exerciseNum}`);
    const errorDiv = document.getElementById(`error${exerciseNum}`);
    const feedback = document.getElementById(`feedback${exerciseNum}`);

    if (!codeTextarea || !previewDiv || !errorDiv || !feedback) {
      return;
    }

    codeTextarea.value = '';
    previewDiv.innerHTML = '<div class="preview-placeholder">Nhấn "Chạy code" để xem kết quả</div>';
    previewDiv.classList.remove('has-content');
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    feedback.classList.remove('step-feedback--success', 'step-feedback--error');
    feedback.textContent = '';
    completedSteps.delete(exerciseNum);
    updateStarState(exerciseNum, false);
    renderStepper();
    // Clear code from localStorage
    saveCodeToLocal(exerciseNum, '');
    // Update completed steps in localStorage
    saveCompletedSteps();
  };

  window.submitExercises = async function() {
    if (!metadataState) {
      showSubmissionStatus('⚠️ Không tìm thấy thông tin học viên. Vui lòng quay lại trang thiết lập.', 'error');
      return;
    }

    if (!isTimeUp) {
      showSubmissionStatus('⏰ Chưa hết thời gian! Vui lòng đợi hết thời gian để xong bài.', 'error');
      return;
    }

    showSubmissionStatus('⏳ Đang gửi dữ liệu lên Google Sheet...', 'info');
    revealAllAnswers();
    showTotalScore(completedSteps.size);
    disableAllInputs();

    const elapsedSeconds = calculateElapsedTime();
    const elapsedMinutes = Math.floor(elapsedSeconds / 60);

    const payload = {
      group: String(metadataState.group),
      score: completedSteps.size,
      duration: elapsedMinutes
    };

    try {
      await postToGoogleSheet(payload);
      showSubmissionStatus('✅ Đã gửi kết quả lên Google Sheet thành công!', 'success');
      // Clear all progress from localStorage after successful submit
      clearAllProgress();
    } catch (error) {
      showSubmissionStatus(`❌ Gửi dữ liệu thất bại: ${error.message}`, 'error');
    }
  };

  async function postToGoogleSheet(data) {
    const webAppUrl = GOOGLE_SHEET_WEB_APP_URL;
    
    if (!webAppUrl || webAppUrl.includes('YOUR_SCRIPT_ID')) {
      throw new Error('Vui lòng cấu hình Google Apps Script URL trong file game_3.html');
    }

    try {
      const response = await fetch(webAppUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      return response;
    } catch (error) {
      console.error('Error posting to Google Sheet:', error);
      throw new Error('Không thể kết nối đến Google Sheet. Vui lòng kiểm tra lại URL.');
    }
  }

  const defaultConfig = {
    main_title: '🎓 Bài tập thực hành: Tạo Form HTML từng bước'
  };

  function getExerciseTitleKey(id) {
    return `exercise_${id}_title`;
  }

  function initElementSdk() {
    if (!window.elementSdk) {
      return;
    }

    exerciseData.forEach(exercise => {
      defaultConfig[getExerciseTitleKey(exercise.id)] = exercise.defaultTitle;
    });

    window.elementSdk.init({
      defaultConfig,
      onConfigChange,
      mapToCapabilities,
      mapToEditPanelValues
    });
  }

  async function onConfigChange(config) {
    const title = document.getElementById('mainTitle');
    if (title) {
      title.textContent = config.main_title || defaultConfig.main_title;
    }

    exerciseData.forEach(exercise => {
      const key = getExerciseTitleKey(exercise.id);
      const resolvedTitle = config[key] || exercise.defaultTitle;
      exerciseTitles[exercise.id] = resolvedTitle;
      const titleElement = document.getElementById(`exercise${exercise.id}Title`);
      if (titleElement) {
        titleElement.textContent = resolvedTitle;
      }
    });

    renderStepper();
  }

  function mapToEditPanelValues(config) {
    const values = new Map();
    values.set('main_title', config.main_title || defaultConfig.main_title);

    exerciseData.forEach(exercise => {
      const key = getExerciseTitleKey(exercise.id);
      values.set(key, config[key] || exercise.defaultTitle);
    });

    return values;
  }

  function mapToCapabilities() {
    return {
      recolorables: [],
      borderables: [],
      fontEditable: undefined,
      fontSizeable: undefined
    };
  }
})();

