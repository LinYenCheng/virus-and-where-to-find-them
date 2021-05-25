// import jsonFinalTimeSeriesData from "../data/finalTimeSeriesData.json";
import jsonFinalGlobalTimeSeriesData from "../data/global.json";
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

  function generateNations() {
    var chartDounut = c3.generate({
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
    var chartDounut = c3.generate({
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
    var chartDounut = c3.generate({
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
      generateAges();
    } else if (nowChart === 1) {
      nowChart = 2;
      generateNations();
    } else {
      nowChart = 0;
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

        for (let [key, value] of Object.entries(deaths)) {
          deathCounts.push(value);
        }

        for (let [key, value] of Object.entries(recovered)) {
          recoverCounts.push(value);
        }

        const chartCountry = c3.generate({
          bindto: "#chart--line",
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
              ["每日增加", ...diffConfirmCounts],
              ["確診", ...totalCounts],
              ["死亡", ...deathCounts],
              ["恢復", ...recoverCounts],
            ],
            axes: {
              確診: "y",
              每日增加: "y2",
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
    data: {
      x: "date",
      xFormat: "%Y-%m-%d",
      columns: [
        ["date", ...dates],
        ["每日增加", ...diffConfirmCounts],
        ["全球確診", ...confirmPatientCounts],
        ["全球死亡", ...deathCounts],
        ["全球恢復", ...recoverCounts],
      ],
      axes: {
        全球確診病例: "y",
        每日增加: "y2",
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
