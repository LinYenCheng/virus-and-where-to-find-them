// import jsonFinalTimeSeriesData from "../data/finalTimeSeriesData.json";
import jsonFinalGlobalTimeSeriesData from "../data/global.json";
import { sma } from "./util";
// import { modifyCountryParam } from "./util.js";

const chartColors = {
  shortAverage: "#2d6f9f",
  longAverage: "#dd8a24",
  cases: "#56a36c",
  deaths: "#d75c4a",
};

const baseChartOptions = {
  bar: {
    width: {
      ratio: 0.72,
    },
  },
  grid: {
    y: {
      show: true,
    },
  },
  legend: {
    position: "bottom",
  },
  padding: {
    top: 8,
    right: 22,
    bottom: 10,
    left: 58,
  },
  point: {
    r: 2.2,
    focus: {
      expand: {
        r: 4,
      },
    },
  },
  transition: {
    duration: 180,
  },
};

function updateChartStat(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function generateChart(resChart) {
  const dates = [];
  const diffConfirmCounts = [];
  const confirmPatientCounts = [];
  const deathCounts = [];
  const recoverCounts = [];
  if (!resChart.data[0]) return;
  const { todayConfirmed, todayDeath, todayRecover } = resChart.data[0];

  resChart.data.forEach((elm) => {
    if (elm) {
      dates.push(elm.today.toString().substring(0, 10));
      diffConfirmCounts.push(elm.diffConfirmed);
      confirmPatientCounts.push(elm.todayConfirmed);
      deathCounts.push(elm.todayDeath);
      recoverCounts.push(elm.todayRecover);
    }
  });
  const chart = c3.generate({
    bindto: "#chart--bar",
    title: {
      text: `累積死亡: ${((todayDeath * 100) / todayConfirmed).toFixed(2)}%
      累積恢復: ${((todayRecover * 100) / todayConfirmed).toFixed(2)}%`,
    },
    zoom: {
      enabled: true,
    },
    data: {
      x: "date",
      xFormat: "%Y-%m-%d",
      columns: [
        ["date", ...dates],
        ["單日增加", ...diffConfirmCounts],
        ["全球確診", ...confirmPatientCounts],
        ["全球死亡", ...deathCounts],
        ["全球恢復", ...recoverCounts],
      ],
      axes: {
        全球確診病例: "y",
        單日增加: "y2",
      },
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%m-%d",
        },
      },
      y: {
        min: 0,
      },
      y2: {
        min: 0,
        show: true,
      },
    },
  });
  window.addEventListener("resize", () => {
    chart.resize();
  });
}

function generateDounutChartTaiwan({
  otherCounts,
  taiwanCounts,
  locations,
  ages,
}) {
  let nowChart = 0;
  let chartDounutNations;
  let chartDounutCounty;
  let chartDounutAge;

  function generateNations() {
    chartDounutNations = c3.generate({
      bindto: "#chart--dounut",
      data: {
        columns: [
          ["非本國籍", otherCounts],
          ["本國籍", taiwanCounts],
        ],
        type: "donut",
      },
      donut: {
        title: "台灣疫情",
        label: {
          format: function (value, ratio, id) {
            return value;
          },
        },
      },
    });
  }

  function generateCounties() {
    const cloumns = locations
      .filter(({ count }) => count > 0)
      .map(({ location, count }) => [location, count]);
    chartDounutCounty = c3.generate({
      bindto: "#chart--dounut",
      data: {
        columns: [...cloumns],
        type: "donut",
      },
      donut: {
        title: "台灣疫情",
        label: {
          format: function (value, ratio, id) {
            return value;
          },
        },
      },
    });
  }

  function generateAges() {
    const cloumns = ages
      .filter(({ count }) => count > 0)
      .map(({ range, count }) => [range, count]);
    chartDounutAge = c3.generate({
      bindto: "#chart--dounut",
      data: {
        columns: [...cloumns],
        type: "donut",
      },
      donut: {
        title: "年齡分布",
        label: {
          format: function (value, ratio, id) {
            return value;
          },
        },
      },
    });
  }

  // setInterval(() => {
  //   if (nowChart === 0) {
  //     nowChart = 1;
  //     chartDounutCounty.destroy();
  //     generateAges();
  //   } else if (nowChart === 1) {
  //     nowChart = 2;
  //     chartDounutAge.destroy();
  //     generateNations();
  //   } else {
  //     nowChart = 0;
  //     chartDounutNations.destroy();
  //     generateCounties();
  //   }
  // }, 10000);
  generateAges();
}

function getCountsAndDiffPreviousCount(objOfTotalCountsByDate) {
  const counts = [];
  const diffCounts = [];
  const dates = [];
  let prevValue = 0;

  const entries = Object.entries(objOfTotalCountsByDate);
  if (entries.length === 0) return { counts, diffCounts, dates };

  const DAYS_TO_SHOW = 300;
  // Use the latest date in the dataset as reference instead of today's date
  const lastKey = entries[entries.length - 1][0];
  const lastDate = new Date(lastKey);

  for (let [key, value] of entries) {
    const currentDate = new Date(key);
    const diffTime = lastDate.getTime() - currentDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < DAYS_TO_SHOW) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
      counts.push(Number(value));
      diffCounts.push(Number(value) - prevValue || 0);
    }
    prevValue = Number(value);
  }
  return {
    counts: [...counts],
    diffCounts: [...diffCounts],
    dates: [...dates],
  };
}

let chartCountryInstance = null;
let chartGlobalInstance = null;

// 抓出個別的表
function generateChartCountry({ title, paramCountry }) {
  const countryTitleEl = document.getElementById("chart-country-title");
  if (countryTitleEl) countryTitleEl.textContent = title || "國家/地區";
  updateChartStat("chart-country-stat", "載入中...");

  const formattedParam = paramCountry ? paramCountry.replace("*", "") : "taiwan";
  fetch(`data/${formattedParam}.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then((json) => {
      let resChart = json;
      let sma14 = [];
      let sma7 = [];

      if (resChart && resChart[0]) {
        const {
          timeline: { cases, deaths, recovered },
        } = resChart[0];

        const {
          dates,
          counts: totalCounts,
          diffCounts: diffConfirmCounts,
        } = getCountsAndDiffPreviousCount(cases);
        const { counts: deathCounts, diffCounts: diffDeathCounts } =
          getCountsAndDiffPreviousCount(deaths);
        const { counts: recoverCounts } =
          getCountsAndDiffPreviousCount(recovered);

        const finalDiffConfirmCounts = [...diffConfirmCounts];
        // For SMA with range N, we need N-1 padding items to align with the original data
        sma14 = [...Array(13).fill(0), ...sma(finalDiffConfirmCounts, 14)];
        sma7 = [...Array(6).fill(0), ...sma(finalDiffConfirmCounts, 7)];

        const latestConfirmed = totalCounts[totalCounts.length - 1] || 0;
        const latestDeaths = deathCounts[deathCounts.length - 1] || 0;
        const deathRatio = latestConfirmed > 0 ? ((latestDeaths * 100) / latestConfirmed).toFixed(2) : "0.00";

        updateChartStat(
          "chart-country-stat",
          `確診: ${Number(latestConfirmed).toLocaleString()} | 死亡: ${Number(latestDeaths).toLocaleString()} (${deathRatio}%)`
        );

        if (chartCountryInstance && typeof chartCountryInstance.destroy === "function") {
          try { chartCountryInstance.destroy(); } catch (e) {}
        }

        chartCountryInstance = c3.generate({
          bindto: "#chart--line",
          padding: {
            top: 10,
            right: 20,
            bottom: 10,
            left: 55,
          },
          zoom: {
            enabled: true,
            rescale: true,
          },
          data: {
            x: "date",
            xFormat: "%Y-%m-%d",
            columns: [
              ["date", ...dates],
              ["7日平均", ...sma7],
              ["14日平均", ...sma14],
              ["新增病例", ...diffConfirmCounts],
              ["新增死亡", ...diffDeathCounts],
            ],
            type: "bar",
            types: {
              "7日平均": "spline",
              "14日平均": "spline",
            },
            groups: [["新增病例", "新增死亡"]],
            colors: {
              "新增病例": chartColors.cases,
              "新增死亡": chartColors.deaths,
              "7日平均": chartColors.shortAverage,
              "14日平均": chartColors.longAverage,
            },
          },
          axis: {
            x: {
              type: "timeseries",
              tick: {
                centered: true,
                format: "%m-%d",
                culling: true,
                count: 90,
                fit: true,
              },
            },
            y: {
              min: 0,
            },
          },
        });
      } else {
        updateChartStat("chart-country-stat", "無數據");
      }
    })
    .catch(function (error) {
      console.log(error);
      updateChartStat("chart-country-stat", "載入失敗");
    });
}

function generateChartGlobal() {
  let sma30 = [];
  let sma60 = [];

  const {
    todayRecover,
    todayConfirmed,
    todayDeath,
    timeline: { cases, deaths, recovered },
  } = jsonFinalGlobalTimeSeriesData;

  const {
    dates,
    diffCounts: diffConfirmCounts,
  } = getCountsAndDiffPreviousCount(cases);
  const { counts: deathCounts, diffCounts: diffDeathCounts } =
    getCountsAndDiffPreviousCount(deaths);
  const { counts: recoverCounts } = getCountsAndDiffPreviousCount(recovered);

  const finalDiffConfirmCounts = [...diffConfirmCounts];
  // For SMA with range N, we need N-1 padding items to align with the original data
  sma30 = [...Array(29).fill(0), ...sma(finalDiffConfirmCounts, 30)];
  sma60 = [...Array(59).fill(0), ...sma(finalDiffConfirmCounts, 60)];

  const globalDeathRatio = todayConfirmed > 0 ? ((todayDeath * 100) / todayConfirmed).toFixed(2) : "0.00";
  updateChartStat(
    "chart-global-stat",
    `確診: ${Number(todayConfirmed).toLocaleString()} | 死亡: ${Number(todayDeath).toLocaleString()} (${globalDeathRatio}%)`
  );

  if (chartGlobalInstance && typeof chartGlobalInstance.destroy === "function") {
    try { chartGlobalInstance.destroy(); } catch (e) {}
  }

  chartGlobalInstance = c3.generate({
    bindto: "#chart--bar",
    padding: {
      top: 10,
      right: 20,
      bottom: 10,
      left: 55,
    },
    zoom: {
      enabled: true,
      rescale: true,
    },
    data: {
      x: "date",
      xFormat: "%Y-%m-%d",
      columns: [
        ["date", ...dates],
        ["30日平均", ...sma30],
        ["60日平均", ...sma60],
        ["新增病例", ...diffConfirmCounts],
        ["新增死亡", ...diffDeathCounts],
      ],
      type: "bar",
      types: {
        "30日平均": "spline",
        "60日平均": "spline",
      },
      groups: [["新增病例", "新增死亡"]],
      colors: {
        "新增病例": chartColors.cases,
        "新增死亡": chartColors.deaths,
        "30日平均": chartColors.shortAverage,
        "60日平均": chartColors.longAverage,
      },
      axes: {
        新增病例: "y",
      },
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%m-%d",
          culling: true,
          count: 90,
          fit: true,
        },
      },
      y: {
        min: 0,
      },
    },
  });
}

window.addEventListener("resize", () => {
  if (chartCountryInstance && typeof chartCountryInstance.resize === "function") {
    chartCountryInstance.resize();
  }
  if (chartGlobalInstance && typeof chartGlobalInstance.resize === "function") {
    chartGlobalInstance.resize();
  }
});

export {
  generateChart,
  generateDounutChartTaiwan,
  generateChartCountry,
  generateChartGlobal,
};
