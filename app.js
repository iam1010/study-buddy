(() => {
  const fileInput = document.querySelector('#json-file');
  const dropZone = document.querySelector('#drop-zone');
  const emptyState = document.querySelector('#empty-state');
  const studyView = document.querySelector('#study-view');
  const status = document.querySelector('#status-message');
  const deckName = document.querySelector('#deck-name');
  const card = document.querySelector('#flashcard');
  const cardContent = document.querySelector('#card-content');
  const sideLabel = document.querySelector('#side-label');
  const flipHint = document.querySelector('#flip-hint');
  const flipButton = document.querySelector('#flip-button');
  const clearButton = document.querySelector('#clear-button');
  const previousButton = document.querySelector('#previous-button');
  const nextButton = document.querySelector('#next-button');
  const cardPosition = document.querySelector('#card-position');
  const cardNumber = document.querySelector('#card-number');
  const progressFill = document.querySelector('#progress-fill');
  const progressPercent = document.querySelector('#progress-percent');

  let cards = [];
  let currentIndex = 0;
  let showingAnswer = false;

  function parseCards(data) {
    // Accept a plain array, or a named deck object with a cards array.
    const source = Array.isArray(data) ? data : data && Array.isArray(data.cards) ? data.cards : null;
    if (!source || source.length === 0) {
      throw new Error('The JSON should contain a non-empty array of cards.');
    }
    return source.map((item, index) => {
      if (!item || typeof item !== 'object' || typeof item.question !== 'string' || typeof item.answer !== 'string' || !item.question.trim() || !item.answer.trim()) {
        throw new Error(`Card ${index + 1} needs a non-empty "question" and "answer" string.`);
      }
      return { question: item.question.trim(), answer: item.answer.trim() };
    });
  }

  function render() {
    const current = cards[currentIndex];
    const count = cards.length;
    cardContent.textContent = showingAnswer ? current.answer : current.question;
    sideLabel.textContent = showingAnswer ? 'ANSWER' : 'QUESTION';
    card.classList.toggle('is-answer', showingAnswer);
    card.setAttribute('aria-label', showingAnswer ? 'Show question' : 'Show answer');
    flipHint.innerHTML = showingAnswer ? '<span aria-hidden="true">↻</span> Click to see question' : '<span aria-hidden="true">↻</span> Click to reveal answer';
    flipButton.innerHTML = showingAnswer ? 'Show question <span aria-hidden="true">↗</span>' : 'Show answer <span aria-hidden="true">↗</span>';
    cardPosition.textContent = `CARD ${currentIndex + 1} OF ${count}`;
    cardNumber.textContent = String(currentIndex + 1).padStart(2, '0');
    const percent = Math.round(((currentIndex + 1) / count) * 100);
    progressFill.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;
    previousButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === count - 1;
  }

  function flip() {
    if (!cards.length) return;
    showingAnswer = !showingAnswer;
    render();
  }

  function move(step) {
    const nextIndex = currentIndex + step;
    if (nextIndex < 0 || nextIndex >= cards.length) return;
    currentIndex = nextIndex;
    showingAnswer = false;
    render();
  }

  async function loadFile(file) {
    if (!file) return;
    status.textContent = '';
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const nextCards = parseCards(data);
      cards = nextCards;
      currentIndex = 0;
      showingAnswer = false;
      deckName.textContent = data && typeof data.name === 'string' ? data.name : file.name.replace(/\.json$/i, '');
      emptyState.hidden = true;
      studyView.hidden = false;
      clearButton.hidden = false;
      render();
    } catch (error) {
      status.textContent = error instanceof SyntaxError ? 'This file is not valid JSON. Check the file and try again.' : error.message;
    }
    fileInput.value = '';
  }

  fileInput.addEventListener('change', () => loadFile(fileInput.files[0]));
  clearButton.addEventListener('click', () => {
    cards = [];
    currentIndex = 0;
    showingAnswer = false;
    deckName.textContent = 'No deck loaded';
    studyView.hidden = true;
    emptyState.hidden = false;
    clearButton.hidden = true;
    status.textContent = '';
  });
  card.addEventListener('click', flip);
  flipButton.addEventListener('click', flip);
  previousButton.addEventListener('click', () => move(-1));
  nextButton.addEventListener('click', () => move(1));

  document.addEventListener('keydown', (event) => {
    if (!cards.length || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.target instanceof HTMLElement && (event.target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(event.target.tagName))) return;
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
    if (event.code === 'Space') { event.preventDefault(); flip(); }
  });

  for (const eventName of ['dragenter', 'dragover']) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.add('drag-over');
    });
  }
  for (const eventName of ['dragleave', 'drop']) {
    dropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dropZone.classList.remove('drag-over');
    });
  }
  dropZone.addEventListener('drop', (event) => {
    const file = [...event.dataTransfer.files].find((item) => item.name.toLowerCase().endsWith('.json') || item.type === 'application/json');
    if (file) loadFile(file);
    else status.textContent = 'Drop a .json file to load a question set.';
  });
})();
