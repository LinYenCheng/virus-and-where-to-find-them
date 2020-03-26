function generateChart(resChart) {
  const dates = [];
  const diffConfirmCounts = [];
  const confirmPatientCounts = [];
  const deathCounts = [];
  const recoverCounts = [];
  const { todayConfirmed, todayDeath, todayRecover } = resChart.data[0];

  resChart.data.forEach(elm => {
    dates.push(elm.ytd.toString().substring(0, 10));
    diffConfirmCounts.push(elm.diffConfirmed);
    confirmPatientCounts.push(elm.todayConfirmed);
    deathCounts.push(elm.todayDeath);
    recoverCounts.push(elm.todayRecover);
  });
  const chart = c3.generate({
    bindto: "#chart--bar",
    title: {
      text: `累積死亡: ${((todayDeath * 100) / todayConfirmed).toFixed(2)}% 
      累積恢復: ${((todayRecover * 100) / todayConfirmed).toFixed(2)}%`
    },
    data: {
      x: "date",
      xFormat: "%Y-%m-%d",
      columns: [
        ["date", ...dates],
        ["單日增加", ...diffConfirmCounts],
        ["全球確診", ...confirmPatientCounts],
        ["全球死亡", ...deathCounts],
        ["全球恢復", ...recoverCounts]
      ],
      axes: {
        全球確診病例: "y",
        單日增加: "y2"
      }
    },
    axis: {
      x: {
        type: "timeseries",
        tick: {
          format: "%m-%d"
        }
      },
      y: {
        min: 0
      },
      y2: {
        min: 0,
        show: true
      }
    }
  });
}

function generateDounutChartTaiwan({ otherCounts, taiwanCounts }) {
  var chartDounut = c3.generate({
    bindto: "#chart--dounut",
    data: {
      columns: [
        ["境外移入", otherCounts],
        ["本土", taiwanCounts]
      ],
      type: "donut"
    },
    donut: {
      title: "台灣疫情",
      label: {
        format: function(value, ratio, id) {
          return value;
        }
      }
    }
  });
}

function generateChartCountry({ api, title, paramCountry }) {
  api
    .get(`https://corona.lmao.ninja/v2/historical/${paramCountry}`)
    .then(resChart => {
      const dates = [];
      const totalCounts = [];
      const deathCounts = [];
      const diffConfirmCounts = [];
      let prevValue = 0;
      const {
        data: {
          timeline: { cases, deaths }
        }
      } = resChart;
      for (let [key, value] of Object.entries(cases)) {
        dates.push(dayjs(key, "MM/DD/YY").format("YYYY-MM-DD"));
        totalCounts.push(value);
        diffConfirmCounts.push(value - prevValue);
        prevValue = value;
      }

      for (let [key, value] of Object.entries(deaths)) {
        deathCounts.push(value);
      }
      const chartBar = c3.generate({
        bindto: "#chart--line",
        title: {
          text: `${title}  
          死亡:${(
            (deathCounts[deathCounts.length - 1] * 100) /
            totalCounts[totalCounts.length - 1]
          ).toFixed(2)}%`
        },
        data: {
          x: "date",
          xFormat: "%Y-%m-%d",
          columns: [
            ["date", ...dates],
            ["確診數", ...totalCounts],
            ["死亡", ...deathCounts],
            ["單日增加", ...diffConfirmCounts]
          ],
          axes: {
            確診數: "y",
            單日增加: "y2"
          }
        },
        axis: {
          x: {
            type: "timeseries",
            tick: {
              format: "%m-%d"
            }
          },
          y: {
            min: 0
          },
          y2: {
            min: 0,
            show: true
          }
        }
      });
    });
  $("#btn-open").click();
}

export { generateChart, generateDounutChartTaiwan, generateChartCountry };
