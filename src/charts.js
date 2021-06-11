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

  for (let [key, value] of Object.entries(objOfTotalCountsByDate)) {
    const DAYS_TO_SHOW = 300;
    const dayjsNowItem = dayjs(key, "MM/DD/YY");
    const date1 = dayjs(dayjsNowItem);
    const date2 = dayjs();
    const hours = date2.diff(date1, "hours");
    const days = Math.floor(hours / 24);
    if (days < DAYS_TO_SHOW) {
      dates.push(dayjsNowItem.format("YYYY-MM-DD"));
      counts.push(value);
      diffCounts.push(value - prevValue || 0);
    }
    prevValue = value;
  }
  return {
    counts: [...counts],
    diffCounts: [...diffCounts],
    // 一張表只需要用一次日期
    dates: [...dates],
  };
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
      let sma14 = [];
      let sma7 = [];

      if (resChart[0]) {
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
        sma14.length = 14;
        sma14.fill(0);
        sma14 = [...sma14, ...sma(finalDiffConfirmCounts, 14)];
        sma7 = [0, 0, 0, 0, 0, 0, 0, ...sma(finalDiffConfirmCounts, 7)];

        const chartCountry = c3.generate({
          bindto: "#chart--line",
          zoom: {
            enabled: true,
            rescale: true,
          },
          title: {
            text: `${title}
             確診: ${totalCounts[totalCounts.length - 1]}
             死亡:${deathCounts[deathCounts.length - 1]} (${(
              (deathCounts[deathCounts.length - 1] * 100) /
              totalCounts[totalCounts.length - 1]
            ).toFixed(2)}%)`,
            //  恢復: ${recoverCounts[recoverCounts.length - 1]}(${(
            //   (recoverCounts[recoverCounts.length - 1] * 100) /
            //   totalCounts[totalCounts.length - 1]
            // ).toFixed(2)}%)`
          },

          data: {
            x: "date",
            xFormat: "%Y-%m-%d",
            columns: [
              ["date", ...dates],
              // ["累積確診", ...totalCounts],
              ["7日平均", ...sma7],
              ["14日平均", ...sma14],
              ["新增病例", ...diffConfirmCounts],
              ["新增死亡", ...diffDeathCounts],
              // ["恢復", ...recoverCounts],
            ],
            type: "bar",
            types: {
              "7日平均": "spline",
              "14日平均": "spline",
            },
            groups: [["新增病例", "新增死亡"]],
            // axes: {
            //   死亡: "y2",
            //   新增病例: "y2",
            //   "7日平均": "y",
            //   "14日平均": "y",
            // },
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
            // y2: {
            //   min: 0,
            //   show: true,
            // },
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
    // counts: confirmPatientCounts,
    diffCounts: diffConfirmCounts,
  } = getCountsAndDiffPreviousCount(cases);
  const { counts: deathCounts, diffCounts: diffDeathCounts } =
    getCountsAndDiffPreviousCount(deaths);
  const { counts: recoverCounts } = getCountsAndDiffPreviousCount(recovered);

  const finalDiffConfirmCounts = [...diffConfirmCounts];
  sma30.length = 30;
  sma60.length = 60;
  sma60.fill(0);
  sma30.fill(0);
  sma60 = [...sma60, ...sma(finalDiffConfirmCounts, 60)];
  sma30 = [...sma30, ...sma(finalDiffConfirmCounts, 30)];

  const chart = c3.generate({
    bindto: "#chart--bar",
    title: {
      text: `
      確診: ${todayConfirmed}
      全球死亡: ${todayDeath} (${((todayDeath * 100) / todayConfirmed).toFixed(
        2
      )}%)`,
      // 全球恢復: ${todayRecover} (${(
      //   (todayRecover * 100) /
      //   todayConfirmed
      // ).toFixed(2)}%)`,
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
        // ["全球確診", ...confirmPatientCounts],
        // ["全球死亡", ...deathCounts],
        // ["全球恢復", ...recoverCounts],
      ],
      type: "bar",
      types: {
        "30日平均": "spline",
        "60日平均": "spline",
      },
      groups: [["新增病例", "新增死亡"]],
      axes: {
        新增病例: "y",
        // 全球日增: "y2",
        // "30日平均": "y2",
        // "60日平均": "y2",
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
        max: 4500000,
      },
      // y2: {
      //   min: 0,
      //   show: true,
      // },
    },
  });
  window.addEventListener("resize", () => {
    if (chart) chart.resize();
  });
}

export {
  generateChart,
  generateDounutChartTaiwan,
  generateChartCountry,
  generateChartGlobal,
};
