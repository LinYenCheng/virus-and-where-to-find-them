// import jsonFinalTimeSeriesData from "../data/finalTimeSeriesData.json";
import jsonFinalGlobalTimeSeriesData from "../data/global.json";
import { sma } from "./util";
// import { modifyCountryParam } from "./util.js";

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

  setInterval(() => {
    if (nowChart === 0) {
      nowChart = 1;
      chartDounutCounty.destroy();
      generateAges();
    } else if (nowChart === 1) {
      nowChart = 2;
      chartDounutAge.destroy();
      generateNations();
    } else {
      nowChart = 0;
      chartDounutNations.destroy();
      generateCounties();
    }
  }, 10000);
  generateCounties();
}

// 抓出個別的表
function generateChartCountry({ title, paramCountry }) {
  fetch(`data/${paramCountry.replace("*", "")}.json`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      return response.json();
    })
    .then((json) => {
      let resChart = json;
      const dates = [];
      const totalCounts = [];
      const deathCounts = [];
      const recoverCounts = [];
      const diffConfirmCounts = [];
      let sma14 = [];
      let sma7 = [];
      let prevValue = 0;
      if (resChart[0]) {
        const {
          timeline: { cases, deaths, recovered },
        } = resChart[0];
        for (let [key, value] of Object.entries(cases)) {
          dates.push(dayjs(key, "MM/DD/YY").format("YYYY-MM-DD"));
          totalCounts.push(value);
          diffConfirmCounts.push(value - prevValue || 0);
          prevValue = value;
        }

        const finalDiffConfirmCounts = [...diffConfirmCounts];
        sma14.length = 14;
        sma14.fill(0);
        sma14 = [...sma14, ...sma(finalDiffConfirmCounts, 14)];
        sma7 = [0, 0, 0, 0, 0, 0, 0, ...sma(finalDiffConfirmCounts, 7)];

        for (let [key, value] of Object.entries(deaths)) {
          deathCounts.push(value);
        }

        for (let [key, value] of Object.entries(recovered)) {
          recoverCounts.push(value);
        }

        const chartCountry = c3.generate({
          bindto: "#chart--line",
          zoom: {
            enabled: true,
            rescale: true,
          },
          title: {
            text: `${title}
             Death:${(
               (deathCounts[deathCounts.length - 1] * 100) /
               totalCounts[totalCounts.length - 1]
             ).toFixed(2)}%
             Recovered: ${(
               (recoverCounts[recoverCounts.length - 1] * 100) /
               totalCounts[totalCounts.length - 1]
             ).toFixed(2)}%`,
          },
          data: {
            x: "date",
            xFormat: "%Y-%m-%d",
            columns: [
              ["date", ...dates],
              ["累積確診", ...totalCounts],
              ["每日增加", ...diffConfirmCounts],
              ["7日平均", ...sma7],
              ["14日平均", ...sma14],
              ["死亡", ...deathCounts],
              // ["恢復", ...recoverCounts],
            ],
            axes: {
              累積確診: "y",
              每日增加: "y2",
              "7日平均": "y2",
              "14日平均": "y2",
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
          if (chartCountry) chartCountry.resize();
        });
      }
    })
    .catch(function (error) {
      console.log(error);
    });
}

function generateChartGlobal() {
  const dates = [];
  const diffConfirmCounts = [];
  const confirmPatientCounts = [];
  const deathCounts = [];
  const recoverCounts = [];
  let sma30 = [];
  let sma60 = [];
  let prevValue = 0;
  const {
    todayRecover,
    todayConfirmed,
    todayDeath,
    timeline: { cases, deaths, recovered },
  } = jsonFinalGlobalTimeSeriesData;
  for (let [key, value] of Object.entries(cases)) {
    dates.push(dayjs(key, "MM/DD/YY").format("YYYY-MM-DD"));
    confirmPatientCounts.push(value);
    diffConfirmCounts.push(value - prevValue);
    prevValue = value;
  }

  const finalDiffConfirmCounts = [...diffConfirmCounts];
  sma30.length = 30;
  sma60.length = 60;
  sma60.fill(0);
  sma30.fill(0);
  sma60 = [...sma60, ...sma(finalDiffConfirmCounts, 60)];
  sma30 = [...sma30, ...sma(finalDiffConfirmCounts, 30)];

  for (let [key, value] of Object.entries(deaths)) {
    deathCounts.push(value);
  }

  for (let [key, value] of Object.entries(recovered)) {
    recoverCounts.push(value);
  }

  const chart = c3.generate({
    bindto: "#chart--bar",
    title: {
      text: `Global Death: ${((todayDeath * 100) / todayConfirmed).toFixed(2)}%
      recovered: ${((todayRecover * 100) / todayConfirmed).toFixed(2)}%`,
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
        ["全球確診", ...confirmPatientCounts],
        ["全球日增", ...diffConfirmCounts],
        ["30日平均", ...sma30],
        ["60日平均", ...sma60],
        // ["全球死亡", ...deathCounts],
        // ["全球恢復", ...recoverCounts],
      ],
      axes: {
        全球確診: "y",
        全球日增: "y2",
        "30日平均": "y2",
        "60日平均": "y2",
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

export {
  generateChart,
  generateDounutChartTaiwan,
  generateChartCountry,
  generateChartGlobal,
};
