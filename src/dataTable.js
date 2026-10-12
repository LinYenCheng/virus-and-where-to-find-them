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
  const renderCards = (items) => items.map(({ item, index }) => `
    <article class="map-card food-card" role="button" aria-pressed="false" tabindex="0" data-lat="${esc(item.lat)}" data-lng="${esc(item.lng)}" data-id="food-${index}">
      <div class="map-card-heading"><h3>${esc(item.name)}</h3><span class="card-rating">${esc(item.rating || '尚無評價')}</span></div>
      <span class="card-tag">${esc(item.location || '新竹')}</span>
      <p class="card-address">⌖ ${esc(item.fullAddress)}</p>
      <p class="card-description">${esc(item.description)}</p>
    </article>`).join('');
  mountInfiniteCards('店家清單', jsonFood.map((item, index) => ({ item, index })), renderCards);
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

function mountInfiniteCards(title, items, renderCards) {
  $('#dataTable').removeClass('data-table-virus panel-open').show();
  $('#dataTable').empty();
  $('#dataTable').removeClass('data-table-virus');
  $('#dataTable').data('cardsObserver')?.disconnect();
  const batchSize = 12;
  let shown = 0;
  $('#dataTable').html(`<div class="cards-panel" data-list-title="${title}"><div class="cards-toolbar"><input class="cards-search" type="search" placeholder="搜尋名稱、地點或內容" aria-label="搜尋清單"><span class="cards-result-count"></span><span class="cards-count">${items.length} 筆</span></div><div class="cards-list" role="list"><div class="cards-sentinel" aria-hidden="true"></div></div><p class="cards-end" hidden>已顯示全部項目</p></div>`);
  const panel = $('#dataTable .cards-panel');
  const list = panel.find('.cards-list');
  const search = panel.find('.cards-search');
  const resultCount = panel.find('.cards-result-count');
  const sentinel = panel.find('.cards-sentinel')[0];
  let filtered = items;

  const loadMore = () => {
    if (shown >= filtered.length) return;
    const next = filtered.slice(shown, shown + batchSize);
    if (!next.length) return;
    list.append(renderCards(next));
    shown += next.length;
    resultCount.text(`${shown} / ${filtered.length}`);
    panel.find('.cards-end').prop('hidden', shown < filtered.length);
  };
  const reset = () => {
    filtered = items.filter(({ item }) => !search.val() || Object.values(item).some((value) => String(value ?? '').toLocaleLowerCase().includes(search.val().toLocaleLowerCase())));
    shown = 0;
    list.empty();
    panel.find('.cards-end').prop('hidden', true);
    loadMore();
  };
  panel.on('click keydown', '.map-card', function (event) {
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    if (event.type === 'keydown') event.preventDefault();
    const { lat, lng, id } = this.dataset;
    panel.find('.map-card').removeClass('is-selected').attr('aria-pressed', 'false');
    $(this).addClass('is-selected').attr('aria-pressed', 'true');
    if (id.startsWith('food-') && window.matchMedia('(max-width: 720px)').matches) {
      const food = jsonFood[Number(id.slice('food-'.length))];
      if (food) {
        window.dispatchEvent(new CustomEvent('food-card-select', { detail: { food, id } }));
      }
      return;
    }
    if (window.map && lat && lng) {
      const markerMap = id.startsWith('food-') ? window.foodMarkerMap : window.ratMarkerMap;
      window.map.setView([Number(lat), Number(lng)], 18, { animate: false });
      if (markerMap?.has(id)) markerMap.get(id).openPopup();
    }
  });
  search.on('input', reset);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => { if (entries.some((entry) => entry.isIntersecting)) loadMore(); }, { root: list[0], rootMargin: '180px' });
    observer.observe(sentinel);
    $('#dataTable').data('cardsObserver', observer);
  }
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
