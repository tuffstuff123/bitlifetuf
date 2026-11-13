(() => {
  const playButton = document.querySelector('#playButton');
  const loadButton = document.querySelector('#loadButton');
  const retryButton = document.querySelector('#retryButton');
  const fullscreenButton = document.querySelector('#fullscreenButton');
  const gameSection = document.querySelector('#game');
  const placeholder = document.querySelector('#gamePlaceholder');
  const loadingPanel = document.querySelector('#loadingPanel');
  const gameError = document.querySelector('#gameError');
  const errorMessage = document.querySelector('#errorMessage');
  const gameStatus = document.querySelector('#gameStatus');
  const loadingText = document.querySelector('#loadingText');
  const progress = document.querySelector('.progress-track');
  const progressFill = document.querySelector('#progressFill');
  let unityInstance = null;
  let loading = false;

  function setProgress(value) {
    const percent = Math.max(0, Math.min(100, Math.round(value * 100)));
    progressFill.style.width = `${percent}%`;
    progress.setAttribute('aria-valuenow', String(percent));
    loadingText.textContent = percent > 0 ? `Getting your life ready… ${percent}%` : 'Getting your life ready…';
  }

  function showError(message) {
    loading = false;
    loadingPanel.hidden = true;
    gameError.hidden = false;
    errorMessage.textContent = typeof message === 'string' ? message : 'Please refresh and try again.';
    gameStatus.textContent = 'Could not load';
    fullscreenButton.disabled = true;
  }

  function loadGame() {
    if (loading || unityInstance) return;
    if (!window.UnityLoader) {
      showError('The game loader did not load. Check your connection and try again.');
      return;
    }

    loading = true;
    placeholder.hidden = true;
    gameError.hidden = true;
    loadingPanel.hidden = false;
    gameStatus.textContent = 'Loading game…';
    setProgress(0);

    try {
      unityInstance = window.UnityLoader.instantiate('gameContainer', './Build/BitLife.json', {
        onProgress: (_instance, value) => {
          setProgress(value);
          if (value >= 1) {
            loading = false;
            loadingPanel.hidden = true;
            gameStatus.textContent = 'Ready to play';
            fullscreenButton.disabled = false;
          }
        },
        onsuccess: () => {
          loading = false;
          loadingPanel.hidden = true;
          gameStatus.textContent = 'Ready to play';
          fullscreenButton.disabled = false;
        },
        onerror: (message) => showError(message)
      });
    } catch (error) {
      showError(error && error.message);
    }
  }

  function startFromHero() {
    gameSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    loadGame();
  }

  playButton.addEventListener('click', startFromHero);
  loadButton.addEventListener('click', loadGame);
  retryButton.addEventListener('click', () => {
    // A failed Unity instance cannot be safely reused; a page reload resets its state.
    window.location.reload();
  });
  fullscreenButton.addEventListener('click', () => {
    if (unityInstance && typeof unityInstance.SetFullscreen === 'function') {
      unityInstance.SetFullscreen(1);
    } else {
      const container = document.querySelector('#gameContainer');
      if (container.requestFullscreen) container.requestFullscreen();
    }
  });
})();
