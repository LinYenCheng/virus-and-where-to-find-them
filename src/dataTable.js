import jsonTaiwan from '../data/taiwan.json';
import jsonFinalTimeSeriesData from '../data/finalTimeSeriesData.json';
import jsonRat from '../data/mouse.json';
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
  let table = '';
  table += `
  <button id="btn-toggle">顯示/隱藏</button>
  <table id="dataTable-now" class="dataTable-food display responsive nowrap">
      <thead>
            <tr>
                <th>名稱</th>
                <th>評價</th>    
                <th>地址</th>
                <th>說明</th>
            </tr>
        </thead>
        <tbody>
        `;

  /* loop over each object in the array to create rows*/
  jsonFood.forEach((item, index) => {
    table += `<tr class="food-row" data-lat="${item.lat}" data-lng="${item.lng}" data-id="food-${index}">
    <td>${item.name}</td>
    <td>${item.rating}</td>
    <td>${item.fullAddress}</td>
    <td>${item.description}</td>
    </tr>`;
  });
  table += '</tbody></table>';
  $('#dataTable').html(table);

  // Add click handler for rows
  $('.food-row').on('click', function() {
    const lat = $(this).data('lat');
    const lng = $(this).data('lng');
    const id = $(this).data('id');
    if (window.map && lat && lng) {
      window.map.setView([lat, lng], 18);
      // Trigger popup if marker exists
      if (window.foodMarkerMap && window.foodMarkerMap.has(id)) {
        window.foodMarkerMap.get(id).openPopup();
      }
    }
  });

  $(`#dataTable-now`).DataTable({
    order: [[1, 'desc']],
    responsive: true,
    lengthMenu: [
      [8, 12],
      [8, 12],
    ],
    language: {
      search: '搜尋:',
      info: '_START_ - _END_ / _TOTAL_',
      paginate: {
        previous: '<',
        next: '>',
      },
    },
  });
  $('#btn-toggle').click(function () {
    $('#dataTable-now_wrapper').toggle();
  });
  $('#btn-toggle').click();
}

function generateRatTable(filterRegion = null) {
  let table = '';
  table += `
  <button id="btn-toggle">顯示/隱藏</button>
  <table id="dataTable-now" class="dataTable-rat display responsive nowrap">
      <thead>
            <tr>
                <th>地點</th>
                <th>類型</th>    
                <th>時間</th>
                <th>說明</th>
            </tr>
        </thead>
        <tbody>
        `;

  /* loop over each object in the array to create rows*/
  jsonRat
    .filter((item) => !filterRegion || item.location.includes(filterRegion))
    .forEach((item, index) => {
      table += `<tr class="rat-row" data-lat="${item.lat}" data-lng="${item.lng}" data-id="rat-${index}">
    <td>${item.location}</td>
    <td>${item.type}</td>
    <td>${item.time}</td>
    <td>${item.description}</td>
    </tr>`;
    });
  table += '</tbody></table>';
  $('#dataTable').html(table);

  // Add click handler for rows
  $('.rat-row').on('click', function() {
    const lat = $(this).data('lat');
    const lng = $(this).data('lng');
    const id = $(this).data('id');
    if (window.map && lat && lng) {
      window.map.setView([lat, lng], 18);
      // Trigger popup if marker exists in global marker map
      if (window.ratMarkerMap && window.ratMarkerMap.has(id)) {
        window.ratMarkerMap.get(id).openPopup();
      }
    }
  });

  $(`#dataTable-now`).DataTable({
    order: [[0, 'desc']],
    responsive: true,
    lengthMenu: [
      [8, 12],
      [8, 12],
    ],
    language: {
      search: '搜尋:',
      info: '_START_ - _END_ / _TOTAL_',
      paginate: {
        previous: '<',
        next: '>',
      },
    },
  });
  $('#btn-toggle').click(function () {
    $('#dataTable-now_wrapper').toggle();
  });
  $('#btn-toggle').click();
}

function generateGlobalTable() {
  let table = '';
  table += `
  <button id="btn-toggle">顯示/隱藏</button>
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
  $('#dataTable').html(table);
  $(`#dataTable-now`).DataTable({
    order: [
      [2, 'desc'],
      [3, 'desc'],
    ],
    lengthMenu: [
      [8, 12],
      [8, 12],
    ],
    responsive: true,
    language: {
      search: '搜尋:',
      info: '_START_ - _END_ / _TOTAL_',
      paginate: {
        previous: '<',
        next: '>',
      },
    },
  });
  $('#btn-toggle').click(function () {
    $('#dataTable-now_wrapper').toggle();
  });
  $('#btn-toggle').click();
}

function generateTaiwanTable() {
  let table = '';
  table += `
  <button id="btn-toggle">顯示/隱藏</button>
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
  $('#dataTable').html(table);
  $(`#dataTable-now`).DataTable({
    order: [[0, 'desc']],
    responsive: true,
    lengthMenu: [
      [8, 12],
      [8, 12],
    ],
    language: {
      search: '搜尋:',
      info: '_START_ - _END_ / _TOTAL_',
      paginate: {
        previous: '<',
        next: '>',
      },
    },
  });
  $('#btn-toggle').click(function () {
    $('#dataTable-now_wrapper').toggle();
  });
  $('#btn-toggle').click();
}

export { generateGlobalTable, generateTaiwanTable, generateRatTable, generateFoodTable };
