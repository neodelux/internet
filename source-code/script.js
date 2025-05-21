function showTab(tab) {
  document.getElementById('web-form').style.display = tab === 'web' ? 'block' : 'none';
  document.getElementById('image-form').style.display = tab === 'images' ? 'block' : 'none';
  document.getElementById('onion-form').style.display = tab === 'onion' ? 'block' : 'none';

  const buttons = document.querySelectorAll('.tabs button');
  buttons.forEach(btn => btn.classList.remove('active'));
  event.target.classList.add('active');
}

function showOnion() {
  showTab('onion');
}

// Функция для обработки поиска через DuckDuckGo
function searchWeb(query) {
  const url = `https://api.duckduckgo.com/?q= ${encodeURIComponent(query)}&format=json&no_redirect=1`;
  fetch(url)
    .then(response => response.json())
    .then(data => {
      const resultsContainer = document.getElementById('results');
      resultsContainer.innerHTML = '';

      if (data.AbstractText) {
        resultsContainer.innerHTML += `
          <div class="result">
            <h3><a href="${escapeHtml(data.AbstractURL)}" target="_blank">${escapeHtml(data.Heading)}</a></h3>
            <p class="url">${escapeHtml(data.AbstractURL)}</p>
            <p class="snippet">${escapeHtml(data.AbstractText)}</p>
          </div>
        `;
      }

      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        data.RelatedTopics.forEach(topic => {
          if (topic.FirstURL) {
            resultsContainer.innerHTML += `
              <div class="result">
                <h3><a href="${escapeHtml(topic.FirstURL)}" target="_blank">${escapeHtml(topic.Text)}</a></h3>
                <p class="url">${escapeHtml(topic.FirstURL)}</p>
                <p class="snippet">${escapeHtml(topic.Result || '')}</p>
              </div>
            `;
          }
        });
      }

      if (!data.AbstractText && (!data.RelatedTopics || data.RelatedTopics.length === 0)) {
        resultsContainer.innerHTML = `<p>No results found for "${escapeHtml(query)}"</p>`;
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('results').innerHTML = `<p>Error loading results.</p>`;
    });
}

// Функция для обработки поиска через Википедию
function searchWiki(query) {
  const lang = /^[а-яё]/i.test(query) ? 'ru' : 'en';
  const wikiUrl = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`;

  fetch(wikiUrl)
    .then(response => response.json())
    .then(data => {
      const resultsContainer = document.getElementById('results');
      if (data.extract) {
        const thumbnail = data.thumbnail ? `<img src="${data.thumbnail.source}" alt="Thumbnail" style="max-width:150px; float:right;" />` : '';
        resultsContainer.innerHTML = `
          <div class="wiki-card">
            ${thumbnail}
            <h3>${escapeHtml(data.title)}</h3>
            <p>${escapeHtml(data.extract)}</p>
            <a href="${escapeHtml(data.content_urls.desktop.page)}" target="_blank">Read more on Wikipedia</a>
          </div>
        `;
      } else {
        resultsContainer.innerHTML = `<p>No information found about "${escapeHtml(query)}" in Wikipedia.</p>`;
      }
    })
    .catch(err => {
      console.error(err);
      document.getElementById('results').innerHTML = `<p>Error fetching from Wikipedia.</p>`;
    });
}

// Функция для обработки `.onion` поиска
function searchOnion(query) {
  const encodedQuery = encodeURIComponent(query);
  window.location.href = `https://ahmia.fi/search/?q= ${encodedQuery}`;
}

// Функция для очистки результатов
function clearResults() {
  document.getElementById('results').innerHTML = '';
}

// Функция для обработки отправки формы
function handleSearch(event) {
  event.preventDefault();
  const query = document.getElementById('search-input').value.trim();
  if (!query) return;

  clearResults();

  const currentTab = document.querySelector('.tabs button.active').textContent.toLowerCase();
  switch (currentTab) {
    case 'web':
      searchWeb(query);
      break;
    case 'wiki':
      searchWiki(query);
      break;
    case 'onion':
      searchOnion(query);
      break;
  }
}

// Функция для экранирования HTML
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) { return {'&':'&amp;','<':'<', '>':'>','"':'&quot;',"'":'&#39;'}[m]; });
}

// Обработчик события submit для формы
document.getElementById('search-form').addEventListener('submit', handleSearch);
