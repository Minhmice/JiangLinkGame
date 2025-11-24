(function() {
  'use strict';

  const themes = {
    default: {
      gradient: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
      name: 'Mặc định'
    },
    ocean: {
      gradient: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)',
      name: 'Đại dương'
    },
    sunset: {
      gradient: 'linear-gradient(-45deg, #fa709a, #fee140, #ff6e7f, #bfe9ff)',
      name: 'Hoàng hôn'
    },
    forest: {
      gradient: 'linear-gradient(-45deg, #11998e, #38ef7d, #0f2027, #203a43)',
      name: 'Rừng xanh'
    },
    purple: {
      gradient: 'linear-gradient(-45deg, #667eea, #764ba2, #f093fb, #4facfe)',
      name: 'Tím mộng mơ'
    },
    dark: {
      gradient: 'linear-gradient(-45deg, #1a1a2e, #16213e, #0f3460, #533483)',
      name: 'Tối'
    }
  };

  function initThemeSwitcher() {
    const switcherBtn = document.getElementById('themeSwitcher');
    const themeMenu = document.getElementById('themeMenu');
    const themeOptions = document.querySelectorAll('.theme-option');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('gameTheme') || 'default';
    applyTheme(savedTheme);

    // Toggle menu
    if (switcherBtn && themeMenu) {
      switcherBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        themeMenu.classList.toggle('hidden');
      });

      // Close menu when clicking outside
      document.addEventListener('click', (e) => {
        if (!themeMenu.contains(e.target) && !switcherBtn.contains(e.target)) {
          themeMenu.classList.add('hidden');
        }
      });

      // Theme selection
      themeOptions.forEach(option => {
        option.addEventListener('click', () => {
          const theme = option.dataset.theme;
          applyTheme(theme);
          
          // Update active state
          themeOptions.forEach(opt => opt.classList.remove('active'));
          option.classList.add('active');
          
          // Save to localStorage
          localStorage.setItem('gameTheme', theme);
          
          // Update button colors
          updateButtonColors(theme);
          
          // Close menu
          themeMenu.classList.add('hidden');
        });
      });

      // Set active theme on load
      themeOptions.forEach(option => {
        if (option.dataset.theme === savedTheme) {
          option.classList.add('active');
        }
      });
    }
  }

  function applyTheme(themeName) {
    const theme = themes[themeName] || themes.default;
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('theme-ocean', 'theme-sunset', 'theme-forest', 'theme-purple', 'theme-dark');
    
    // Add new theme class if not default
    if (themeName !== 'default') {
      body.classList.add(`theme-${themeName}`);
    }
    
    // Update background gradient
    const bgElement = body.querySelector('.bg-gradient-animated') || body;
    if (bgElement) {
      // Extract colors from gradient for CSS variable or direct style
      bgElement.style.background = theme.gradient;
      bgElement.style.backgroundSize = '400% 400%';
    }
    
    // Update button colors based on theme
    updateButtonColors(themeName);
  }

  function updateButtonColors(themeName) {
    // Get theme colors
    const themeColors = getThemeColors(themeName);
    
    // Update start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.style.background = `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})`;
      startBtn.style.boxShadow = `0 10px 25px ${themeColors[0]}40, 0 0 0 0 ${themeColors[0]}40`;
    }
    
    // Update run code buttons
    const runButtons = document.querySelectorAll('.btn-run-code');
    runButtons.forEach(btn => {
      btn.style.background = `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})`;
      btn.style.boxShadow = `0 4px 12px ${themeColors[0]}40`;
      // Update animation keyframes dynamically
      updateButtonAnimation(btn, themeColors[0]);
    });
    
    // Update timer display
    const timerDisplay = document.getElementById('timerDisplay');
    if (timerDisplay) {
      timerDisplay.style.backgroundColor = `${themeColors[0]}20`;
      timerDisplay.style.borderColor = `${themeColors[0]}50`;
      timerDisplay.style.color = themeColors[0];
    }
    
    // Update stepper buttons
    const stepperButtons = document.querySelectorAll('.stepper-item');
    stepperButtons.forEach(btn => {
      if (btn.classList.contains('active')) {
        const indexSpan = btn.querySelector('span');
        btn.style.borderColor = themeColors[1];
        btn.style.boxShadow = `0 4px 12px ${themeColors[1]}30`;
        if (indexSpan) {
          indexSpan.style.backgroundColor = themeColors[1];
        }
      }
    });
    
    // Update submit button
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
      submitBtn.style.background = `linear-gradient(135deg, ${themeColors[0]}, ${themeColors[1]})`;
      submitBtn.style.boxShadow = `0 4px 12px ${themeColors[0]}4D`;
    }
  }

  function getThemeColors(themeName) {
    const colorMap = {
      default: ['#2563eb', '#7c3aed', '#ee7752', '#e73c7e'],
      ocean: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
      sunset: ['#fa709a', '#fee140', '#ff6e7f', '#bfe9ff'],
      forest: ['#11998e', '#38ef7d', '#0f2027', '#203a43'],
      purple: ['#667eea', '#764ba2', '#f093fb', '#4facfe'],
      dark: ['#1a1a2e', '#16213e', '#0f3460', '#533483']
    };
    return colorMap[themeName] || colorMap.default;
  }

  function updateButtonAnimation(button, color) {
    // Convert hex to rgb for rgba
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const rgb = hexToRgb(color);
    if (rgb) {
      const rgba1 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
      const rgba2 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.7)`;
      const rgba3 = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`;
      
      // Create dynamic keyframes
      const styleId = 'btn-run-code-animation';
      let styleElement = document.getElementById(styleId);
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = styleId;
        document.head.appendChild(styleElement);
      }
      
      styleElement.textContent = `
        .btn-run-code:hover {
          animation: button-pulse-${color.replace('#', '')} 2s ease-in-out infinite;
        }
        @keyframes button-pulse-${color.replace('#', '')} {
          0%, 100% {
            box-shadow: 0 6px 20px ${rgba1};
          }
          50% {
            box-shadow: 0 6px 25px ${rgba2}, 0 0 0 4px ${rgba3};
          }
        }
      `;
    }
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSwitcher);
  } else {
    initThemeSwitcher();
  }

  // Export for use in other scripts
  window.ThemeManager = {
    applyTheme,
    updateButtonColors,
    getThemeColors,
    themes
  };
})();

