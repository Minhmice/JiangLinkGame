(function() {
  'use strict';

  window.EncryptionUtils = {
    encrypt: function(text) {
      try {
        const encoded = btoa(encodeURIComponent(text));
        return encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      } catch (error) {
        console.error('Encryption error:', error);
        return text;
      }
    },

    decrypt: function(encrypted) {
      try {
        let base64 = encrypted.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
          base64 += '=';
        }
        return decodeURIComponent(atob(base64));
      } catch (error) {
        console.error('Decryption error:', error);
        return encrypted;
      }
    }
  };

  window.Timer = function(durationMinutes, onUpdate, onComplete) {
    let totalSeconds = durationMinutes * 60;
    let remainingSeconds = totalSeconds;
    let intervalId = null;
    let isPaused = false;

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    function update() {
      if (isPaused) return;

      if (remainingSeconds <= 0) {
        stop();
        if (onComplete) onComplete();
        return;
      }

      remainingSeconds--;
      if (onUpdate) {
        const isWarning = remainingSeconds <= 60;
        onUpdate(formatTime(remainingSeconds), isWarning);
      }
    }

    return {
      start: function() {
        if (intervalId) return;
        intervalId = setInterval(update, 1000);
        update();
      },

      pause: function() {
        isPaused = true;
      },

      resume: function() {
        isPaused = false;
      },

      stop: function() {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      },

      getRemaining: function() {
        return remainingSeconds;
      },

      getFormatted: function() {
        return formatTime(remainingSeconds);
      },

      setRemaining: function(seconds) {
        remainingSeconds = Math.max(0, seconds);
        totalSeconds = remainingSeconds;
      }
    };
  };
})();

