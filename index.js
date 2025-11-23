(function() {
  'use strict';

  const groupSelect = document.getElementById('groupSelect');
  const durationInput = document.getElementById('durationInput');
  const startBtn = document.getElementById('startBtn');

  let group = '1';
  let duration = 5;

  if (groupSelect) {
    groupSelect.addEventListener('change', event => {
      group = event.target.value;
    });
  }

  if (durationInput) {
    durationInput.addEventListener('input', event => {
      let value = Number(event.target.value);
      if (value < 5) value = 5;
      if (value > 15) value = 15;
      duration = value;
      event.target.value = value;
    });
  }

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const metadata = {
        group: group,
        duration: duration,
        startTime: new Date().toISOString()
      };

      const encrypted = window.EncryptionUtils.encrypt(JSON.stringify(metadata));
      const baseUrl = window.location.origin + window.location.pathname.replace('index.html', '');
      window.location.href = `${baseUrl}game_3.html?data=${encrypted}`;
    });
  }
})();

