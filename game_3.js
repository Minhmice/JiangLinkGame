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
  let submitBtnElement = null;
  let isSubmitting = false;
  
  // Debounce timers for auto-save
  const debounceTimers = {};

  const exerciseData = [
    {
      id: 1,
      defaultTitle: 'Input Type Text',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="hoten">Họ tên:</label> <input id="hoten" type="text" name="ho_ten">`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span><span class="tag">&gt;</span>`,
      answer: `<label for="hoten">Họ tên:</label>
<input id="hoten" type="text" name="ho_ten">`
    },
    {
      id: 2,
      defaultTitle: 'Input Type Password',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="mk">Mật Khẩu:</label> <input id="mk" type="password" name="mat_khau" value="88888888">`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>`,
      answer: `<label for="mk">Mật Khẩu:</label>
<input id="mk" type="password" name="mat_khau" value="88888888">`
    },
    {
      id: 3,
      defaultTitle: 'Radio Buttons - Giới tính',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label>Giới tính:</label> <input id="gt_Nam" type="radio" name="gioi_tinh" value="nam" > <label for="gt_Nam">Nam</label> <input id="gt_Nu" type="radio" name="gioi_tinh" value="nu" > <label for="gt_Nu">Nữ</label>`,
      syntax: `<span class="tag">&lt;label&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span> <span class="tag">&gt;</span><br><span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span> <span class="tag">&gt;</span><br><span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span>`,
      answer: `<label>Giới tính:</label>
<input id="gt_Nam" type="radio" name="gioi_tinh" value="nam" >
<label for="gt_Nam">Nam</label>
<input id="gt_Nu" type="radio" name="gioi_tinh" value="nu" >
<label for="gt_Nu">Nữ</label>`
    },
    {
      id: 4,
      defaultTitle: 'Checkbox - Sở thích',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label>Sở thích:</label><br> <input id="st1" type="checkbox" name="so_thich1" value="nhac"> <label for="st1">Âm nhạc</label> <input id="st2" type="checkbox" name="sơ_thich2" value="thethao"> <label for="st2">Thể thao</label> <input id="st3" type="checkbox" name="so_thich3" value="docsach"> <label for="st3">Đọc sách</label>`,
      syntax: `<span class="tag">&lt;label&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><span class="tag">&lt;br&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span><br><span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span><br><span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span><br><span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span>`,
      answer: `<label>Sở thích:</label><br>
<input id="st1" type="checkbox" name="so_thich1" value="nhac">
<label for="st1">Âm nhạc</label>
<input id="st2" type="checkbox" name="sơ_thich2" value="thethao">
<label for="st2">Thể thao</label>
<input id="st3" type="checkbox" name="so_thich3" value="docsach">
<label for="st3">Đọc sách</label>`
    },
    {
      id: 5,
      defaultTitle: 'Select & Option - Thành phố',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="tp">Thành phố:</label> <select id="tp" name="thanh_pho"> <option value="">-- Chọn --</option> <option value="hn">Hà Nội</option> <option value="hcm">TP.HCM</option> <option value="dn">Đà Nẵng</option> </select>`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;select</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span><span class="tag">&gt;</span><br><span class="tag">&lt;option</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>Tên lựa chọn<span class="tag">&lt;/option&gt;</span><br><span class="tag">&lt;option</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>Tên lựa chọn<span class="tag">&lt;/option&gt;</span><br><span class="tag">&lt;option</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>Tên lựa chọn<span class="tag">&lt;/option&gt;</span><br><span class="tag">&lt;option</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>Tên lựa chọn<span class="tag">&lt;/option&gt;</span><br><span class="tag">&lt;/select&gt;</span>`,
      answer: `<label for="tp">Thành phố:</label>
<select id="tp" name="thanh_pho">
<option value="">-- Chọn --</option>
<option value="hn">Hà Nội</option>
<option value="hcm">TP.HCM</option>
<option value="dn">Đà Nẵng</option>
</select>`
    },
    {
      id: 6,
      defaultTitle: 'Textarea - Lời nhắn',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="tn">Lời nhắn:</label><br> <textarea id="tn" name="loi_nhan" rows="4" cols="30"></textarea>`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><span class="tag">&lt;br&gt;</span><br><span class="tag">&lt;textarea</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">name</span>=<span class="value">"tên_vùng_text"</span> <span class="attr">rows</span>=<span class="value">"giá_trị_hàng"</span> <span class="attr">cols</span>=<span class="value">"giá_trik_cột"</span><span class="tag">&gt;&lt;/textarea&gt;</span>`,
      answer: `<label for="tn">Lời nhắn:</label><br>
<textarea id="tn" name="loi_nhan" rows="4" cols="30"></textarea>`
    },
    {
      id: 7,
      defaultTitle: 'Button - Nút bấm',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<input id="bt" type="button" name="bt1" value="Nhấn vào đây">`,
      syntax: `<span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>`,
      answer: `<input id="bt" type="button" name="bt1" value="Nhấn vào đây">`
    },
    {
      id: 8,
      defaultTitle: 'Submit - Nút gửi form',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<input id="sb" type="submit" name="sb1" value="Gửi đi">`,
      syntax: `<span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span> <span class="attr">value</span>=<span class="value">"giá_trị_input"</span><span class="tag">&gt;</span>`,
      answer: `<input id="sb" type="submit" name="sb1" value="Gửi đi">`
    },
    {
      id: 9,
      defaultTitle: 'Input Type File - Chọn ảnh đại diện',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<label for="avatar">Chọn ảnh đại diện:</label><br> <input id="avatar" type="file" name="anh_dai_dien">`,
      syntax: `<span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><span class="tag">&lt;br&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span> <span class="attr">name</span>=<span class="value">"tên_input"</span><span class="tag">&gt;</span>`,
      answer: `<label for="avatar">Chọn ảnh đại diện:</label><br>
<input id="avatar" type="file" name="anh_dai_dien">`
    },
    {
      id: 10,
      defaultTitle: 'Fieldset - Thông tin cá nhân',
      requirementHeading: sharedRequirementHeading,
      requirementDemo: `<fieldset> <legend>Thông tin cá nhân</legend> <label for="hoten">Họ tên:</label> <input id="hoten" type="text"><br><br> <label for="email">Email:</label> <input id="email" type="text"> </fieldset>`,
      syntax: `<span class="tag">&lt;fieldset&gt;</span><br><span class="tag">&lt;legend&gt;</span>Tên vùng<span class="tag">&lt;/legend&gt;</span><br><span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span><span class="tag">&gt;</span><span class="tag">&lt;br&gt;&lt;br&gt;</span><br><span class="tag">&lt;label</span> <span class="attr">for</span>=<span class="value">"id_input"</span><span class="tag">&gt;</span>Tên nhãn<span class="tag">&lt;/label&gt;</span><br><span class="tag">&lt;input</span> <span class="attr">id</span>=<span class="value">"id_input"</span> <span class="attr">type</span>=<span class="value">"loại_input"</span><span class="tag">&gt;</span><br><span class="tag">&lt;/fieldset&gt;</span>`,
      answer: `<fieldset>
<legend>Thông tin cá nhân</legend>
<label for="hoten">Họ tên:</label>
<input id="hoten" type="text"><br><br>
<label for="email">Email:</label>
<input id="email" type="text">
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
        if (isWarning) {
          timerDisplayElement.classList.remove('animate-timer-pulse');
          timerDisplayElement.classList.add('bg-red-100/50', 'border-red-300/50', 'text-red-700', 'animate-timer-warning');
        } else {
          timerDisplayElement.classList.remove('bg-red-100/50', 'border-red-300/50', 'text-red-700', 'animate-timer-warning');
          timerDisplayElement.classList.add('animate-timer-pulse');
          // Update colors based on theme
          if (window.ThemeManager) {
            const savedTheme = localStorage.getItem('gameTheme') || 'default';
            const themeColors = window.ThemeManager.getThemeColors(savedTheme);
            timerDisplayElement.style.backgroundColor = `${themeColors[0]}20`;
            timerDisplayElement.style.borderColor = `${themeColors[0]}50`;
            timerDisplayElement.style.color = themeColors[0];
          }
        }
      }
        // Save remaining time every second
        if (timer) {
          const remaining = timer.getRemaining();
          saveRemainingTime(remaining);
        }
      },
      function() {
        isTimeUp = true;
        showSubmissionStatus('⏰ Hết thời gian! Bạn có thể nộp bài bất cứ lúc nào.', 'info');
      }
    );

    // If we have saved remaining time, set it directly
    if (savedRemainingTime !== null && savedRemainingTime > 0) {
      timer.setRemaining(savedRemainingTime);
      // Update display immediately
      if (timerDisplayElement) {
        const isWarning = savedRemainingTime <= 60;
        timerDisplayElement.textContent = `⏱️ Thời gian còn lại: ${formatTime(savedRemainingTime)}`;
        if (isWarning) {
          timerDisplayElement.classList.remove('animate-timer-pulse');
          timerDisplayElement.classList.add('bg-red-100/50', 'border-red-300/50', 'text-red-700', 'animate-timer-warning');
        } else {
          timerDisplayElement.classList.add('animate-timer-pulse');
          // Update colors based on theme
          if (window.ThemeManager) {
            const savedTheme = localStorage.getItem('gameTheme') || 'default';
            const themeColors = window.ThemeManager.getThemeColors(savedTheme);
            timerDisplayElement.style.backgroundColor = `${themeColors[0]}20`;
            timerDisplayElement.style.borderColor = `${themeColors[0]}50`;
            timerDisplayElement.style.color = themeColors[0];
          }
        }
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
    
    // Update button colors and theme-based elements based on current theme
    if (window.ThemeManager) {
      const savedTheme = localStorage.getItem('gameTheme') || 'default';
      window.ThemeManager.updateButtonColors(savedTheme);
    }
  }

  function createExercisePage() {
    const section = document.createElement('section');
    section.className = 'flex flex-col lg:flex-row gap-6 items-start w-full';
    section.innerHTML = `
      <div class="w-full lg:w-[350px] xl:w-[380px] flex-shrink-0 bg-white/95 rounded-2xl p-6 shadow-xl animate-panel-slide">
        <div class="mb-4 p-3 rounded-xl border-2 text-center text-lg font-bold animate-timer-pulse" id="timerDisplay" style="background-color: rgba(37, 99, 235, 0.2); border-color: rgba(37, 99, 235, 0.5); color: #2563eb;">⏱️ Thời gian còn lại: ${formatTime((metadataState.duration || 5) * 60)}</div>
        <p class="mb-3 text-base font-semibold text-indigo-600 animate-text-shimmer">🌟 Tiến trình bài tập</p>
        <div class="grid grid-cols-5 lg:grid-cols-2 gap-2.5 mb-5" id="stepper"></div>
        <button id="submitBtn" class="w-full py-3.5 px-6 rounded-xl border-none font-bold text-base cursor-pointer text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden btn-submit" style="background: linear-gradient(135deg, var(--theme-color-1, #2563eb), var(--theme-color-2, #7c3aed)); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);" onclick="window.submitExercises()">
          <span class="submit-btn-text">📤 Nộp bài</span>
          <span class="submit-btn-loading hidden">
            <span class="loading-spinner"></span>
            <span class="ml-2">Đang gửi...</span>
          </span>
          <span class="submit-btn-status hidden"></span>
        </button>
        <div class="hidden mt-5 p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white" id="totalScore">
          <h3 class="mb-3 text-lg font-bold">🏆 Kết quả của bạn</h3>
          <div class="text-3xl tracking-wider mb-3" id="totalStars"></div>
          <p id="scoreMessage" class="mt-3 text-base"></p>
        </div>
      </div>
      <div class="w-full" id="exerciseContainer"></div>
    `;

    stepperElement = section.querySelector('#stepper');
    submissionStatusElement = section.querySelector('#submissionStatus');
    timerDisplayElement = section.querySelector('#timerDisplay');
    submitBtnElement = section.querySelector('#submitBtn');
    
    // Hide submissionStatus div since we're using button status now
    if (submissionStatusElement) {
      submissionStatusElement.style.display = 'none';
    }

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
      <article class="hidden bg-white rounded-xl p-6 mb-6 shadow-xl animate-card-enter" data-step="${exercise.id}">
        <div class="flex items-center gap-3 mb-5 pb-4 border-b-4 border-indigo-500">
          <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 animate-number-bounce">${exercise.id}</div>
          <h2 class="text-xl font-bold text-slate-800 m-0 animate-title-slide" id="${titleId}">${title}</h2>
        </div>
        <div class="mb-5 animate-section-fade" style="animation-delay: 0.1s">
          <div class="bg-indigo-50 px-4 py-2.5 border-l-4 border-indigo-500 font-semibold text-indigo-600 mb-3 rounded animate-section-title">📋 Yêu cầu</div>
          <div class="bg-white border-2 border-slate-200 rounded-lg p-5 mb-3 animate-box-glow">
            <h4 class="m-0 mb-3 text-slate-800 text-base font-bold">${requirementHeading}</h4>
            <div class="bg-slate-50 border border-slate-200 rounded-md p-4 font-sans text-sm mt-3 leading-relaxed animate-demo-slide">${exercise.requirementDemo}</div>
          </div>
        </div>
        <div class="mb-5 animate-section-fade" style="animation-delay: 0.2s">
          <div class="bg-indigo-50 px-4 py-2.5 border-l-4 border-indigo-500 font-semibold text-indigo-600 mb-3 rounded animate-section-title">💡 Mẫu cú pháp</div>
          <div class="bg-slate-50 border border-slate-200 rounded-md p-4 font-mono text-xs text-slate-800 overflow-x-auto leading-relaxed animate-syntax-glow">${exercise.syntax}</div>
        </div>
        <div class="mb-5 animate-section-fade" style="animation-delay: 0.3s">
          <div class="bg-indigo-50 px-4 py-2.5 border-l-4 border-indigo-500 font-semibold text-indigo-600 mb-3 rounded animate-section-title">✍️ Viết code của bạn</div>
          <div class="relative">
            <textarea id="code${exercise.id}" placeholder="${placeholder}" class="w-full min-h-[200px] p-4 border-2 border-slate-300 rounded-lg font-mono text-sm leading-relaxed resize-y bg-white text-slate-800 transition-all duration-300 focus:outline-none focus:border-indigo-500 focus:ring-3 focus:ring-indigo-200 hover:border-indigo-400 animate-textarea-focus"></textarea>
            <div class="hidden mt-3 p-3 rounded-lg text-xs" id="error${exercise.id}"></div>
          </div>
          <div class="flex gap-3 mt-3 flex-wrap">
            <button class="btn-run-code" onclick="window.runCode(${exercise.id})">
              <span>▶ Chạy code</span>
            </button>
            <button class="px-6 py-2.5 rounded-lg border-none font-semibold text-sm cursor-pointer transition-all duration-200 bg-slate-200 text-slate-600 hover:bg-slate-300 active:translate-y-0" onclick="window.clearCode(${exercise.id})">🗑️ Xóa</button>
          </div>
          <div class="hidden mt-3 p-3 rounded-lg text-sm" id="feedback${exercise.id}" role="status" aria-live="polite"></div>
        </div>
        <div class="mb-5 animate-section-fade" style="animation-delay: 0.4s">
          <div class="bg-indigo-50 px-4 py-2.5 border-l-4 border-indigo-500 font-semibold text-indigo-600 mb-3 rounded animate-section-title">👀 Kết quả hiển thị</div>
          <div class="bg-slate-50 border border-slate-200 rounded-md p-4 font-sans text-sm mt-3 leading-relaxed min-h-[150px] animate-preview-glow" id="preview${exercise.id}">
            <div class="text-center text-slate-400 italic py-10 px-5">Nhấn "Chạy code" để xem kết quả</div>
          </div>
        </div>
        <div class="hidden bg-yellow-50 border-2 border-yellow-400 rounded-lg p-5 mt-5 animate-answer-reveal" id="answer${exercise.id}">
          <div class="flex items-center gap-3 mb-4 pb-3 border-b-2 border-yellow-400">
            <h3 class="text-base font-bold text-slate-800 m-0">✅ Đáp án</h3>
            <div class="flex items-center gap-2 bg-white px-4 py-2 rounded-full border-2 border-yellow-400 ml-auto">
              <span>Điểm:</span>
              <span class="text-2xl text-slate-300" id="star${exercise.id}">⭐</span>
            </div>
          </div>
          <div class="bg-slate-50 border border-slate-200 rounded-md p-4 font-mono text-xs text-slate-800 overflow-x-auto leading-relaxed whitespace-pre-wrap break-words" id="answerCode${exercise.id}"></div>
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
      btn.className = 'border-2 border-slate-200 rounded-xl bg-white p-4 cursor-pointer transition-all duration-200 flex items-center justify-center hover:border-indigo-400 hover:shadow-md animate-stepper-hover';
      btn.innerHTML = `<span class="w-9 h-9 rounded-full inline-flex items-center justify-center bg-slate-200 text-slate-600 font-bold transition-all duration-200">${exercise.id}</span><span class="sr-only">Bài ${exercise.id}</span>`;

      if (completedSteps.has(exercise.id)) {
        btn.classList.remove('border-slate-200');
        btn.classList.add('border-green-500', 'animate-stepper-complete');
        const indexSpan = btn.querySelector('span');
        if (indexSpan) {
          indexSpan.classList.remove('bg-slate-200', 'text-slate-600');
          indexSpan.classList.add('bg-green-500', 'text-white', 'animate-star-spin');
        }
      }

      if (exercise.id === currentStep) {
        btn.classList.remove('border-slate-200');
        btn.classList.add('stepper-active', 'shadow-lg', 'animate-stepper-active');
        const indexSpan = btn.querySelector('span');
        if (indexSpan) {
          indexSpan.classList.remove('bg-slate-200', 'text-slate-600');
          indexSpan.classList.add('stepper-active-index', 'text-white');
        }
        // Update colors based on theme
        if (window.ThemeManager) {
          const savedTheme = localStorage.getItem('gameTheme') || 'default';
          const themeColors = window.ThemeManager.getThemeColors(savedTheme);
          btn.style.borderColor = themeColors[1];
          btn.style.boxShadow = `0 4px 12px ${themeColors[1]}30`;
          if (indexSpan) {
            indexSpan.style.backgroundColor = themeColors[1];
          }
        }
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
    const cards = document.querySelectorAll('[data-step]');
    cards.forEach(card => {
      const step = Number(card.dataset.step);
      if (step === currentStep) {
        card.classList.remove('hidden');
        card.classList.add('animate-card-enter');
      } else {
        card.classList.add('hidden');
        card.classList.remove('animate-card-enter');
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
    if (isCorrect) {
      star.classList.remove('text-slate-300');
      star.classList.add('text-yellow-500', 'animate-star-glow');
    } else {
      star.classList.remove('text-yellow-500', 'animate-star-glow');
      star.classList.add('text-slate-300');
    }
  }

  function updateStepFeedback(step, message, status) {
    const feedback = document.getElementById(`feedback${step}`);
    if (!feedback) {
      return;
    }
    feedback.textContent = message;
    feedback.classList.remove('hidden', 'bg-green-100', 'border-green-500', 'text-green-800', 'bg-red-100', 'border-red-500', 'text-red-800');
    if (status === 'success') {
      feedback.classList.add('block', 'bg-green-100', 'border-2', 'border-green-500', 'text-green-800', 'animate-feedback-success');
    } else if (status === 'error') {
      feedback.classList.add('block', 'bg-red-100', 'border-2', 'border-red-500', 'text-red-800', 'animate-feedback-error');
    } else {
      feedback.classList.add('hidden');
    }
  }

  function updateSubmitButtonState() {
    if (!submitBtnElement) return;
    
    // Always enable button - can submit anytime
    submitBtnElement.disabled = false;
    submitBtnElement.style.opacity = '1';
    submitBtnElement.style.cursor = 'pointer';
    
    // Update button colors based on theme
    if (window.ThemeManager) {
      const savedTheme = localStorage.getItem('gameTheme') || 'default';
      const themeColors = window.ThemeManager.getThemeColors(savedTheme);
      if (themeColors && themeColors.length >= 2) {
        submitBtnElement.style.background = `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})`;
        submitBtnElement.style.boxShadow = `0 4px 12px ${themeColors[0]}4D`;
      }
    }
  }

  function showSubmissionStatus(message, variant) {
    if (!submissionStatusElement) {
      return;
    }
    if (!message) {
      submissionStatusElement.classList.add('hidden');
      submissionStatusElement.textContent = '';
      return;
    }
    submissionStatusElement.textContent = message;
    submissionStatusElement.classList.remove('hidden', 'bg-blue-100', 'border-blue-500', 'text-blue-800', 'bg-green-100', 'border-green-500', 'text-green-800', 'bg-red-100', 'border-red-500', 'text-red-800');
    if (variant === 'success') {
      submissionStatusElement.classList.add('block', 'bg-green-100', 'border-2', 'border-green-500', 'text-green-800');
    } else if (variant === 'error') {
      submissionStatusElement.classList.add('block', 'bg-red-100', 'border-2', 'border-red-500', 'text-red-800');
    } else {
      submissionStatusElement.classList.add('block', 'bg-blue-100', 'border-2', 'border-blue-500', 'text-blue-800');
    }
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
      totalScoreDiv.classList.remove('hidden');
      totalScoreDiv.classList.add('block', 'animate-score-reveal');
      totalScoreDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function playCompletionMusic() {
    const audio = document.getElementById('completionMusic');
    if (audio) {
      audio.volume = 0.5; // Set volume to 50%
      audio.loop = true; // Loop the music
      audio.play().catch(error => {
        console.log('Auto-play prevented. User interaction required:', error);
        // Music will play when user interacts with the page
      });
    }
  }

  function stopCompletionMusic() {
    const audio = document.getElementById('completionMusic');
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function revealAllAnswers() {
    exerciseData.forEach(({ id }) => {
      const answerSection = document.getElementById(`answer${id}`);
      const answerCodeDiv = document.getElementById(`answerCode${id}`);
      if (answerSection && answerCodeDiv) {
        answerCodeDiv.textContent = answers[id];
        answerSection.classList.remove('hidden');
        answerSection.classList.add('block', 'animate-answer-reveal');
      }
    });
  }

  function disableAllInputs() {
    document.querySelectorAll('.btn-run-code, .btn-clear').forEach(btn => {
      btn.disabled = true;
    });
    document.querySelectorAll('.code-editor textarea, textarea[id^="code"]').forEach(textarea => {
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
    normalized = normalized.replace(/\bvalue\s*=\s*["'][^"']*["']/gi, 'value="X"');
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
    // Remove placeholder if exists
    const placeholder = previewDiv.querySelector('.text-center.text-slate-400');
    if (placeholder) {
      placeholder.remove();
    }
    previewDiv.innerHTML = code;
    previewDiv.classList.remove('bg-slate-50', 'border-slate-200');
    previewDiv.classList.add('bg-white', 'border-2', 'border-slate-300', 'animate-preview-glow');

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
    errorDiv.classList.add('hidden');
    errorDiv.classList.remove('block', 'bg-red-50', 'border-red-500', 'text-red-700', 'bg-yellow-50', 'border-yellow-500', 'text-yellow-800');
    errorDiv.textContent = '';

    if (!code) {
      errorDiv.textContent = '⚠️ Vui lòng nhập code HTML trước khi chạy!';
      errorDiv.classList.remove('hidden');
      errorDiv.classList.add('block', 'bg-yellow-50', 'border-2', 'border-yellow-500', 'text-yellow-800');
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
      errorDiv.classList.remove('hidden');
      errorDiv.classList.add('block', 'bg-red-50', 'border-2', 'border-red-500', 'text-red-700');
      const errorPlaceholder = document.createElement('div');
      errorPlaceholder.className = 'text-center text-slate-400 italic py-10 px-5';
      errorPlaceholder.textContent = 'Code có lỗi, vui lòng kiểm tra lại';
      previewDiv.innerHTML = '';
      previewDiv.appendChild(errorPlaceholder);
      previewDiv.classList.remove('bg-white', 'border-2', 'border-slate-300', 'animate-preview-glow');
      previewDiv.classList.add('bg-slate-50', 'border-slate-200');
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
    const placeholder = document.createElement('div');
    placeholder.className = 'text-center text-slate-400 italic py-10 px-5';
    placeholder.textContent = 'Nhấn "Chạy code" để xem kết quả';
    previewDiv.innerHTML = '';
    previewDiv.appendChild(placeholder);
    previewDiv.classList.remove('bg-white', 'border-2', 'border-slate-300', 'animate-preview-glow');
    previewDiv.classList.add('bg-slate-50', 'border-slate-200');
    errorDiv.classList.add('hidden');
    errorDiv.classList.remove('block', 'bg-red-50', 'border-red-500', 'text-red-700', 'bg-yellow-50', 'border-yellow-500', 'text-yellow-800');
    errorDiv.textContent = '';
    feedback.classList.remove('block', 'bg-green-100', 'border-green-500', 'text-green-800', 'bg-red-100', 'border-red-500', 'text-red-800', 'animate-feedback-success', 'animate-feedback-error');
    feedback.classList.add('hidden');
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
    if (isSubmitting) {
      return; // Prevent multiple submissions
    }

    if (!metadataState) {
      setSubmitButtonStatus('⚠️ Không tìm thấy thông tin học viên. Vui lòng quay lại trang thiết lập.', 'error');
      return;
    }

    // Set loading state
    isSubmitting = true;
    setSubmitButtonLoading(true);

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
      setSubmitButtonStatus('✅ Đã gửi kết quả lên Google Sheet thành công!', 'success');
      // Clear all progress from localStorage after successful submit
      clearAllProgress();
      isSubmitting = false;
      // Play music when submission is successful
      playCompletionMusic();
    } catch (error) {
      setSubmitButtonStatus(`❌ Gửi dữ liệu thất bại: ${error.message}`, 'error');
      setSubmitButtonLoading(false);
      isSubmitting = false;
    }
  };

  function setSubmitButtonLoading(loading) {
    if (!submitBtnElement) return;
    
    const textSpan = submitBtnElement.querySelector('.submit-btn-text');
    const loadingSpan = submitBtnElement.querySelector('.submit-btn-loading');
    const statusSpan = submitBtnElement.querySelector('.submit-btn-status');
    
    if (loading) {
      submitBtnElement.disabled = true;
      if (textSpan) textSpan.classList.add('hidden');
      if (loadingSpan) loadingSpan.classList.remove('hidden');
      if (statusSpan) statusSpan.classList.add('hidden');
    } else {
      submitBtnElement.disabled = false;
      if (textSpan) textSpan.classList.remove('hidden');
      if (loadingSpan) loadingSpan.classList.add('hidden');
      if (statusSpan) statusSpan.classList.add('hidden');
    }
  }

  function setSubmitButtonStatus(message, variant) {
    if (!submitBtnElement) return;
    
    const textSpan = submitBtnElement.querySelector('.submit-btn-text');
    const loadingSpan = submitBtnElement.querySelector('.submit-btn-loading');
    const statusSpan = submitBtnElement.querySelector('.submit-btn-status');
    
    if (!statusSpan) return;
    
    // Hide other states
    if (textSpan) textSpan.classList.add('hidden');
    if (loadingSpan) loadingSpan.classList.add('hidden');
    
    // Show status
    statusSpan.textContent = message;
    statusSpan.classList.remove('hidden', 'submit-status-success', 'submit-status-error', 'submit-status-info');
    
    // Apply variant class
    if (variant === 'success') {
      statusSpan.classList.add('submit-status-success');
      submitBtnElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      submitBtnElement.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
      submitBtnElement.disabled = true;
    } else if (variant === 'error') {
      statusSpan.classList.add('submit-status-error');
      submitBtnElement.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
      submitBtnElement.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
      submitBtnElement.disabled = false;
      // Reset to normal state after 3 seconds
      setTimeout(() => {
        resetSubmitButton();
      }, 3000);
    } else {
      statusSpan.classList.add('submit-status-info');
    }
  }

  function resetSubmitButton() {
    if (!submitBtnElement) return;
    
    const textSpan = submitBtnElement.querySelector('.submit-btn-text');
    const loadingSpan = submitBtnElement.querySelector('.submit-btn-loading');
    const statusSpan = submitBtnElement.querySelector('.submit-btn-status');
    
    // Show text, hide others
    if (textSpan) textSpan.classList.remove('hidden');
    if (loadingSpan) loadingSpan.classList.add('hidden');
    if (statusSpan) statusSpan.classList.add('hidden');
    
    // Reset button state
    submitBtnElement.disabled = false;
    
    // Restore theme colors
    if (window.ThemeManager) {
      const savedTheme = localStorage.getItem('gameTheme') || 'default';
      const themeColors = window.ThemeManager.getThemeColors(savedTheme);
      if (themeColors && themeColors.length >= 2) {
        submitBtnElement.style.background = `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})`;
        submitBtnElement.style.boxShadow = `0 4px 12px ${themeColors[0]}4D`;
      }
    }
  }

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

