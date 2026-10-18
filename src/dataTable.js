import jsonTaiwan from '../data/taiwan.json';
import jsonFinalTimeSeriesData from '../data/finalTimeSeriesData.json';
import { validRatReports } from './ratData.js';
import jsonFood from '../data/food.json';

function getPercentHTMLString({ intChild, intParent }) {
  let finalString = '';
  if (intChild && intParent) {
    const percent = ((intChild * 100) / intParent).toFixed(2);
    if (percent > 5) {
      finalString = `<span style="color: red;">${percent}%</span>`;
    } else {
      finalString = `${percent}%`;
    }
  } else {
    finalString = '0%';
  }
  return finalString;
}

function generateFoodTable() {
  $('#dataTable').removeClass('data-table-virus panel-open').show().empty();
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const ratings = [...new Set(jsonFood.map(({ rating }) => String(rating || '').trim()).filter(Boolean))].slice(0, 3);
  const getStreet = (item) => {
    const address = String(item.fullAddress || '');
    const match = address.match(/(?:市|縣)(?:[^區鄉鎮市]+[區鄉鎮市])?(.+?(?:路|街|大道|巷))/);
    return (match?.[1] || item.location || '').trim();
  };
  const renderCards = (items) => items.map(({ item, index }) => `
    <article class="map-card food-card" role="button" aria-pressed="false" tabindex="0" data-lat="${esc(item.lat)}" data-lng="${esc(item.lng)}" data-id="food-${index}">
      <div class="map-card-heading"><h3>${esc(item.name)}</h3></div>
      <div class="food-card__tags">${getStreet(item) ? `<button type="button" class="card-tag food-card__tag-button" data-street="${esc(getStreet(item))}" aria-label="篩選${esc(getStreet(item))}">${esc(getStreet(item))}</button>` : ''}${item.rating ? `<span class="card-tag food-card__rating">${esc(item.rating)}</span>` : ''}</div>
      <p class="card-address">⌖ ${esc(item.fullAddress)}</p>
      <p class="card-description">${esc(item.description)}</p>
    </article>`).join('');
  mountInfiniteCards('店家清單', jsonFood.map((item, index) => ({ item, index })), renderCards, { foodRatings: ratings });
}

function generateRatTable(filterRegion = null) {
  $('#dataTable').removeClass('data-table-virus panel-open').show().empty();
  const normalizeRegionName = (value = '') => String(value).replace(/臺/g, '台').trim();
  const normalizedFilter = normalizeRegionName(filterRegion || '');
  const items = validRatReports.filter(({ item }) => !normalizedFilter || normalizeRegionName(item.location).includes(normalizedFilter));
  const esc = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const renderCards = (entries) => entries.map(({ item, index }) => `
    <article class="map-card rat-card" role="button" aria-pressed="false" tabindex="0" data-lat="${esc(item.lat)}" data-lng="${esc(item.lng)}" data-id="rat-${index}">
      <div class="map-card-heading"><h3>${esc(item.location)}</h3><span class="card-date">${esc(item.time)}</span></div>
      <span class="card-tag">${esc(item.type)}</span><p class="card-description">${esc(item.description)}</p>
    </article>`).join('');
  mountInfiniteCards(filterRegion ? `${filterRegion} 通報` : '通報清單', items, renderCards);
}

function mountInfiniteCards(title, items, renderCards, options = {}) {
  const dataRoot = $('#dataTable');
  dataRoot.data('cardsObserver')?.disconnect();
  const oldMapSortHandler = dataRoot.data('cardsMapSortHandler');
  if (oldMapSortHandler && window.map) window.map.off('moveend', oldMapSortHandler);
  const oldMarkerSelectHandler = dataRoot.data('foodMarkerSelectHandler');
  if (oldMarkerSelectHandler) window.removeEventListener('food-marker-select', oldMarkerSelectHandler);
  dataRoot.removeClass('data-table-virus panel-open').show().empty().removeClass('data-table-virus');
  const batchSize = 12;
  let shown = 0;
  let selectedCardId = null;
  let revealTimer = null;
  let observer = null;
  const ratingFilters = options.foodRatings?.length ? `<div class="food-rating-filters" role="group" aria-label="依評價篩選"><span class="food-rating-filters__label">評價</span>${options.foodRatings.map((rating) => `<button type="button" class="food-rating-filter" data-rating="${rating.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}" aria-label="篩選評價 ${rating}" aria-pressed="false">${rating}</button>`).join('')}</div>` : '';
  dataRoot.html(`<div class="cards-panel" data-list-title="${title}"><div class="cards-toolbar"><input class="cards-search" type="search" placeholder="搜尋名稱、地點或內容" aria-label="搜尋清單"><span class="cards-result-count"></span><span class="cards-count">${items.length} 筆</span></div>${ratingFilters}<div class="food-active-filters" aria-live="polite"></div><div class="cards-list" role="list"></div><p class="cards-end" hidden>已顯示全部項目</p></div>`);
  const panel = $('#dataTable .cards-panel');
  const list = panel.find('.cards-list');
  const search = panel.find('.cards-search');
  const resultCount = panel.find('.cards-result-count');
  const selectedRatings = new Set();
  let selectedStreet = '';
  const activeFilters = panel.find('.food-active-filters');
  let filtered = items;

  const applySelection = () => {
    const cards = panel.find('.map-card');
    cards.removeClass('is-selected').attr('aria-pressed', 'false');
    cards.filter((_, card) => card.dataset.id === selectedCardId).addClass('is-selected').attr('aria-pressed', 'true');
    panel.find('.food-card__tag-button').each((_, button) => {
      $(button).attr('aria-pressed', button.dataset.street === selectedStreet ? 'true' : 'false');
    });
  };
  const sortByMapCenter = () => {
    if (!window.map || items.length < 2) return;
    const center = window.map.getCenter();
    filtered.sort((a, b) => {
      const distanceA = window.map.distance(center, [Number(a.item.lat), Number(a.item.lng)]);
      const distanceB = window.map.distance(center, [Number(b.item.lat), Number(b.item.lng)]);
      return distanceA - distanceB || a.index - b.index;
    });
  };

  const loadMore = () => {
    if (shown >= filtered.length) return;
    const next = filtered.slice(shown, shown + batchSize);
    if (!next.length) return;
    list.find('.cards-sentinel').remove();
    list.append(renderCards(next));
    shown += next.length;
    resultCount.text(`${shown} / ${filtered.length}`);
    applySelection();
    panel.find('.cards-end').prop('hidden', shown < filtered.length);
    const sentinel = $('<div class="cards-sentinel" aria-hidden="true"></div>').appendTo(list)[0];
    if (observer) observer.observe(sentinel);
  };
  const revealSelectedCard = (id = selectedCardId, delay = 0) => {
    if (!id) return;
    window.clearTimeout(revealTimer);
    revealTimer = window.setTimeout(() => {
      if (id !== selectedCardId) return;
      while (!list.children('.map-card').toArray().some((card) => card.dataset.id === id) && shown < filtered.length) loadMore();
      const selectedCard = list.children('.map-card').toArray().find((card) => card.dataset.id === id);
      applySelection();
      selectedCard?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, delay);
  };
  const reset = () => {
    const query = String(search.val() || '').toLocaleLowerCase();
    filtered = items.filter(({ item }) => {
      const matchesSearch = !query || Object.values(item).some((value) => String(value ?? '').toLocaleLowerCase().includes(query));
      const matchesRating = selectedRatings.size === 0 || selectedRatings.has(String(item.rating || '').trim());
      const address = String(item.fullAddress || '');
      const streetMatch = address.match(/(?:市|縣)(?:[^區鄉鎮市]+[區鄉鎮市])?(.+?(?:路|街|大道|巷))/);
      const street = (streetMatch?.[1] || item.location || '').trim();
      const matchesStreet = !selectedStreet || street === selectedStreet;
      return matchesSearch && matchesRating && matchesStreet;
    });
    activeFilters.empty();
    if (selectedStreet) activeFilters.append(`<button type="button" class="food-active-filter" data-filter="street"><span class="food-active-filter__kind">路段</span><span>${selectedStreet}</span><span class="food-active-filter__remove" aria-hidden="true">×</span><span class="sr-only">移除${selectedStreet}篩選</span></button>`);
    selectedRatings.forEach((rating) => activeFilters.append(`<button type="button" class="food-active-filter" data-filter="rating" data-rating="${rating.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"><span class="food-active-filter__kind">評價</span><span>${rating}</span><span class="food-active-filter__remove" aria-hidden="true">×</span><span class="sr-only">移除評價篩選</span></button>`));
    sortByMapCenter();
    shown = 0;
    list.empty();
    panel.find('.cards-end').prop('hidden', true);
    loadMore();
  };
  panel.on('click keydown', '.map-card', function (event) {
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (event.type === 'keydown') event.preventDefault();
    const { lat, lng, id } = this.dataset;
    selectedCardId = id;
    applySelection();
    if (id.startsWith('food-') && window.matchMedia('(max-width: 720px)').matches) {
      const food = jsonFood[Number(id.slice('food-'.length))];
      if (food) {
        window.dispatchEvent(new CustomEvent('food-card-select', { detail: { food, id } }));
      }
      revealSelectedCard(id, 120);
      return;
    }
    if (window.map && lat && lng) {
      const markerMap = id.startsWith('food-') ? window.foodMarkerMap : window.ratMarkerMap;
      window.map.setView([Number(lat), Number(lng)], 18, { animate: false });
      if (markerMap?.has(id)) markerMap.get(id).openPopup();
    }
    revealSelectedCard(id, 120);
  });
  search.on('input', reset);
  panel.on('click', '.food-rating-filter', function () {
    const rating = this.dataset.rating;
    if (selectedRatings.has(rating)) selectedRatings.delete(rating);
    else selectedRatings.add(rating);
    $(this).attr('aria-pressed', selectedRatings.has(rating) ? 'true' : 'false');
    reset();
  });
  panel.on('click', '.food-card__tag-button', function (event) {
    event.stopPropagation();
    selectedStreet = this.dataset.street === selectedStreet ? '' : this.dataset.street;
    reset();
  });
  panel.on('click', '.food-active-filter', function () {
    if (this.dataset.filter === 'street') selectedStreet = '';
    if (this.dataset.filter === 'rating') selectedRatings.delete(this.dataset.rating);
    panel.find('.food-rating-filter').each((_, button) => {
      const rating = button.dataset.rating;
      $(button).attr('aria-pressed', selectedRatings.has(rating) ? 'true' : 'false');
    });
    reset();
  });
  if ('IntersectionObserver' in window) {
    observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) loadMore(); }, { root: list[0], rootMargin: '180px' });
    dataRoot.data('cardsObserver', observer);
  }
  const sortHandler = () => {
    reset();
    revealSelectedCard(selectedCardId, 120);
  };
  if (window.map && items.length) {
    window.map.on('moveend', sortHandler);
    dataRoot.data('cardsMapSortHandler', sortHandler);
  }
  const markerSelectHandler = ({ detail } = {}) => {
    const id = detail?.id;
    if (!id || !id.startsWith('food-') || !items.some(({ index }) => `food-${index}` === id)) return;
    selectedCardId = id;
    if (!filtered.some(({ index }) => `food-${index}` === id)) {
      search.val('');
      selectedRatings.clear();
      selectedStreet = '';
      panel.find('.food-rating-filter').attr('aria-pressed', 'false');
      filtered = items.slice();
      sortByMapCenter();
      shown = 0;
      list.empty();
      panel.find('.cards-end').prop('hidden', true);
    }
    revealSelectedCard(id, 120);
  };
  window.addEventListener('food-marker-select', markerSelectHandler);
  dataRoot.data('foodMarkerSelectHandler', markerSelectHandler);
  list.on('scroll', function () {
    if (this.scrollTop + this.clientHeight >= this.scrollHeight - 180) loadMore();
  });
  reset();
}

function generateGlobalTable() {
  $('#dataTable').empty().removeClass('data-table-virus panel-open').show();
  let table = '';
  table += `
  <table id="dataTable-now" class="dataTable-virus display responsive nowrap">
      <thead>
            <tr>
                <th>Country</th>
                <th>Confirmed</th>
                <th>NewCon.</th>
                <th>NewCon.</th>
                <th>Deaths</th>
                <th>NewDea.</th>
                <th>NewDea.</th>
                <th>Recovered</th>
            </tr>
        </thead>
        <tbody>
        `;

  /* loop over each object in the array to create rows*/
  jsonFinalTimeSeriesData.forEach((item) => {
    table += `<tr>
    <td>${item.region}</td>
    <td>${item.confirmed}</td>
    <td>${item.newConfirmed}</td>
    <td>${getPercentHTMLString({
      intChild: item.newConfirmed,
      intParent: item.confirmed,
    })}</td>
    <td>${item.deaths}</td>
    <td>${item.newDeaths}</td>
    <td>${getPercentHTMLString({
      intChild: item.newDeaths,
      intParent: item.deaths,
    })}</td>
    <td>${item.recovered}</td>
    </tr>`;
  });
  table += '</tbody></table>';
  $('#dataTable').html(`<div class="data-table-scroll">${table}</div>`).removeClass('data-table-virus panel-open').show();
  $(`#dataTable-now`).DataTable({
    order: [
      [2, 'desc'],
      [3, 'desc'],
    ],
    lengthMenu: [
      [8, 12],
      [8, 12],
    ],
    pagingType: 'full',
    responsive: true,
    scrollY: '50vh',
    scrollX: true,
    scrollCollapse: true,
    initComplete() {
      this.api().table().container().querySelector('.dt-search input')?.setAttribute('aria-label', '搜尋資料');
    },
    language: {
      search: ' ',
      info: '_START_ - _END_ / _TOTAL_',
      paginate: {
        previous: '<',
        next: '>',
      },
    },
  });
  $('#dataTable-now_wrapper').show();
}

function generateTaiwanTable() {
  const host = $('#dataTable');
  host.data('cardsObserver')?.disconnect();
  if ($.fn.DataTable.isDataTable('#dataTable-now')) {
    $('#dataTable-now').DataTable().destroy();
  }
  let table = '';
  table += `
  <table id="dataTable-now" class="dataTable-virus display responsive nowrap">
      <thead>
            <tr>
                <th>年份</th>
                <th>月份</th>    
                <th>縣市</th>
                <th>性別</th>
                <th>年齡層</th>
                <th>病例數</th>
            </tr>
        </thead>
        <tbody>
        `;

  /* loop over each object in the array to create rows*/
  jsonTaiwan
    .filter((item) => item['確定病名'] === '嚴重特殊傳染性肺炎')
    .forEach((item) => {
      table += `<tr>
    <td>${item['發病年份']}</td>
    <td>${item['發病月份']}</td>
    <td>${item['縣市']}</td>
    <td>${item['性別']}</td>
    <td>${item['年齡層']}</td>
    <td>${item['確定病例數']}</td>
    </tr>`;
    });
  table += '</tbody></table>';
  const tableHost = $('#dataTable');
  tableHost.data('cardsObserver')?.disconnect();
  tableHost.html(`<div class="data-table-scroll">${table}</div>`).removeClass('data-table-virus panel-open').show();
  tableHost.find('#dataTable-now').DataTable({
    order: [[0, 'desc']],
    responsive: true,
    scrollY: '50vh',
    scrollX: true,
    scrollCollapse: true,
    initComplete() {
      this.api().table().container().querySelector('.dt-search input')?.setAttribute('aria-label', '搜尋資料');
    },
    lengthMenu: [
      [8, 12],
      [8, 12],
    ],
    pagingType: 'full',
    language: {
      search: ' ',
      info: '_START_ - _END_ / _TOTAL_',
      paginate: {
        previous: '<',
        next: '>',
      },
    },
  });
  tableHost.find('.dt-container').show();
}

export { generateGlobalTable, generateTaiwanTable, generateRatTable, generateFoodTable };
