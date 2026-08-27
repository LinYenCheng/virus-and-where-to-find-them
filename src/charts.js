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

function updateChartStat(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get or create an ECharts instance bound to the given DOM id. */
function getChart(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  return echarts.getInstanceByDom(el) || echarts.init(el);
}

/** Build common dataZoom components used by all time-series charts. */
function buildDataZoom() {
  return [
    { type: "inside", xAxisIndex: 0, filterMode: "filter" },
    { type: "slider", xAxisIndex: 0, bottom: 4, height: 20, filterMode: "filter" },
  ];
}

// ---------------------------------------------------------------------------
// generateChart  (legacy – kept for API compatibility, currently unused in UI)
// ---------------------------------------------------------------------------
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

  const chart = getChart("chart--bar");
  if (!chart) return;

  chart.setOption({
    title: {
      text: `累積死亡: ${((todayDeath * 100) / todayConfirmed).toFixed(2)}%  累積恢復: ${((todayRecover * 100) / todayConfirmed).toFixed(2)}%`,
      textStyle: { fontSize: 13 },
    },
    tooltip: { trigger: "axis" },
    legend: { bottom: 28 },
    dataZoom: buildDataZoom(),
    grid: { top: 48, right: 22, bottom: 70, left: 58 },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { formatter: (v) => v.slice(5) },
    },
    yAxis: [
      { type: "value", min: 0 },
      { type: "value", min: 0 },
    ],
    series: [
      {
        name: "單日增加",
        type: "bar",
        yAxisIndex: 1,
        data: diffConfirmCounts,
        itemStyle: { color: chartColors.cases },
      },
      {
        name: "全球確診",
        type: "line",
        data: confirmPatientCounts,
        itemStyle: { color: chartColors.shortAverage },
        showSymbol: false,
      },
      {
        name: "全球死亡",
        type: "line",
        data: deathCounts,
        itemStyle: { color: chartColors.deaths },
        showSymbol: false,
      },
      {
        name: "全球恢復",
        type: "line",
        data: recoverCounts,
        itemStyle: { color: chartColors.longAverage },
        showSymbol: false,
      },
    ],
  });

  window.addEventListener("resize", () => chart.resize());
}

// ---------------------------------------------------------------------------
// generateDounutChartTaiwan
// ---------------------------------------------------------------------------
function generateDounutChartTaiwan({
  otherCounts,
  taiwanCounts,
  locations,
  ages,
}) {
  function buildDonutOption(title, data) {
    return {
      title: {
        text: title,
        left: "center",
        top: "center",
        textStyle: { fontSize: 14, fontWeight: "bold" },
      },
      tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
      legend: { bottom: 4, type: "scroll" },
      series: [
        {
          type: "pie",
          radius: ["40%", "68%"],
          label: { formatter: "{b}: {c}" },
          data,
        },
      ],
    };
  }

  function generateNations() {
    const chart = getChart("chart--dounut");
    if (!chart) return;
    chart.setOption(
      buildDonutOption("台灣疫情", [
        { name: "非本國籍", value: otherCounts },
        { name: "本國籍", value: taiwanCounts },
      ])
    );
  }

  function generateCounties() {
    const chart = getChart("chart--dounut");
    if (!chart) return;
    const data = locations
      .filter(({ count }) => count > 0)
      .map(({ location, count }) => ({ name: location, value: count }));
    chart.setOption(buildDonutOption("台灣疫情", data));
  }

  function generateAges() {
    const chart = getChart("chart--dounut");
    if (!chart) return;
    const data = ages
      .filter(({ count }) => count > 0)
      .map(({ range, count }) => ({ name: range, value: count }));
    chart.setOption(buildDonutOption("年齡分布", data));
  }

  generateAges();
}

// ---------------------------------------------------------------------------
// getCountsAndDiffPreviousCount  (unchanged data-processing helper)
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// generateChartCountry
// ---------------------------------------------------------------------------
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

        if (chartCountryInstance) {
          try { chartCountryInstance.dispose(); } catch (e) {}
        }

        const el = document.getElementById("chart--line");
        if (!el) return;
        chartCountryInstance = echarts.init(el);

        chartCountryInstance.setOption({
          tooltip: { trigger: "axis" },
          legend: { top: 4, type: "scroll" },
          dataZoom: buildDataZoom(),
          grid: { top: 36, right: 20, bottom: 52, left: 55 },
          xAxis: {
            type: "category",
            data: dates,
            axisLabel: { formatter: (v) => v.slice(5), rotate: 30 },
            boundaryGap: true,
          },
          yAxis: { type: "value", min: 0 },
          series: [
            {
              name: "新增病例",
              type: "bar",
              stack: "daily",
              data: diffConfirmCounts,
              itemStyle: { color: chartColors.cases },
            },
            {
              name: "新增死亡",
              type: "bar",
              stack: "daily",
              data: diffDeathCounts,
              itemStyle: { color: chartColors.deaths },
            },
            {
              name: "7日平均",
              type: "line",
              data: sma7,
              smooth: true,
              showSymbol: false,
              lineStyle: { color: chartColors.shortAverage, width: 2 },
              itemStyle: { color: chartColors.shortAverage },
            },
            {
              name: "14日平均",
              type: "line",
              data: sma14,
              smooth: true,
              showSymbol: false,
              lineStyle: { color: chartColors.longAverage, width: 2 },
              itemStyle: { color: chartColors.longAverage },
            },
          ],
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

// ---------------------------------------------------------------------------
// generateChartGlobal
// ---------------------------------------------------------------------------
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

  if (chartGlobalInstance) {
    try { chartGlobalInstance.dispose(); } catch (e) {}
  }

  const el = document.getElementById("chart--bar");
  if (!el) return;
  chartGlobalInstance = echarts.init(el);

  chartGlobalInstance.setOption({
    tooltip: { trigger: "axis" },
    legend: { top: 4, type: "scroll" },
    dataZoom: buildDataZoom(),
    grid: { top: 36, right: 20, bottom: 52, left: 55 },
    xAxis: {
      type: "category",
      data: dates,
      axisLabel: { formatter: (v) => v.slice(5), rotate: 30 },
      boundaryGap: true,
    },
    yAxis: { type: "value", min: 0 },
    series: [
      {
        name: "新增病例",
        type: "bar",
        stack: "daily",
        data: diffConfirmCounts,
        itemStyle: { color: chartColors.cases },
      },
      {
        name: "新增死亡",
        type: "bar",
        stack: "daily",
        data: diffDeathCounts,
        itemStyle: { color: chartColors.deaths },
      },
      {
        name: "30日平均",
        type: "line",
        data: sma30,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: chartColors.shortAverage, width: 2 },
        itemStyle: { color: chartColors.shortAverage },
      },
      {
        name: "60日平均",
        type: "line",
        data: sma60,
        smooth: true,
        showSymbol: false,
        lineStyle: { color: chartColors.longAverage, width: 2 },
        itemStyle: { color: chartColors.longAverage },
      },
    ],
  });
}

window.addEventListener("resize", () => {
  if (chartCountryInstance) {
    try { chartCountryInstance.resize(); } catch (e) {}
  }
  if (chartGlobalInstance) {
    try { chartGlobalInstance.resize(); } catch (e) {}
  }
});

export {
  generateChart,
  generateDounutChartTaiwan,
  generateChartCountry,
  generateChartGlobal,
};
