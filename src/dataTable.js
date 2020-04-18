import jsonTaiwan from "../data/taiwan.json";
import jsonFinalTimeSeriesData from "../data/finalTimeSeriesData.json";

function getPercentHTMLString({ intChild, intParent }) {
  let finalString = "";
  if (intChild && intParent) {
    const percent = ((intChild * 100) / intParent).toFixed(2);
    if (percent > 5) {
      finalString = `<span style="color: red;">+${percent}%</span>`;
    } else {
      finalString = `+${percent}%`;
    }
  } else {
    finalString = "0%";
  }
  return finalString;
}

function generateGlobalTable() {
  let table = "";
  table += `<table id="dataTable-global" class="dataTable-virus display responsive nowrap">
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
  table += "</tbody></table>";
  $("#dataTable").html(table);
  $(`#dataTable-global`).DataTable({
    order: [[1, "desc"]],
    responsive: true,
    language: {
      search: "搜尋:",
      info: "_START_ - _END_ / _TOTAL_",
      paginate: {
        previous: "<",
        next: ">",
      },
    },
  });
}

function generateTaiwanTable() {
  let table = "";
  table += `<table id="dataTable-taiwan" class="dataTable-virus display responsive nowrap">
      <thead>
            <tr>
                <th>週別</th>    
                <th>縣市</th>
                <th>性別</th>
                <th>境外移入</th>
                <th>年齡層</th>
                <th>病例數</th>
            </tr>
        </thead>
        <tbody>
        `;

  /* loop over each object in the array to create rows*/
  jsonTaiwan.forEach((item) => {
    table += `<tr>
    <td>${item["發病週別"]}</td>
    <td>${item["縣市"]}</td>
    <td>${item["性別"]}</td>
    <td>${item["是否為境外移入"]}</td>
    <td>${item["年齡層"]}</td>
    <td>${item["確定病例數"]}</td>
    </tr>`;
  });
  table += "</tbody></table>";
  $("#dataTable").html(table);
  $(`#dataTable-taiwan`).DataTable({
    order: [[0, "desc"]],
    responsive: true,
    language: {
      search: "搜尋:",
      info: "_START_ - _END_ / _TOTAL_",
      paginate: {
        previous: "<",
        next: ">",
      },
    },
  });
}

export { generateGlobalTable, generateTaiwanTable };
