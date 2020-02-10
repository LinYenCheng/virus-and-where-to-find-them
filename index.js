import axios from "axios";
import srcVirus from "./virus.png";

const map = L.map("map").setView([23.5, 120.644], 5);

const tiles = L.tileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    attribution:
      '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  }
).addTo(map);

const virusIcon = L.icon({
  iconUrl: srcVirus,
  iconSize: [25, 25], // size of the icon
  iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
  popupAnchor: [-10, -25] // point from which the popup should open relative to the iconAnchor
});

let addressPoints = [];
let cityMarkers = [];

axios
  .all([
    axios.get(
      "https://cors-anywhere.herokuapp.com/https://api.coronatracker.com/analytics/country"
    ),
    axios.get(
      "https://cors-anywhere.herokuapp.com/https://infogram.com/api/live/flex/01a8508e-9cc9-4b64-994b-cb4fdc2ee6f4/9cb631ea-857c-49ac-a797-470cf6119f5e"
    )
  ])
  .then(
    axios.spread((resCountry, resChina) => {
      resCountry.data
        .filter(elm => elm.country !== "Mainland China")
        .map(elm => [
          elm.country,
          elm.total_confirmed,
          "確診",
          `${elm.lat} ${elm.lng}`,
          elm.country
        ])
        .concat(resChina.data.data[0])
        .forEach(elm => {
          let nowCount = parseInt(elm[1]);
          const tempMarker = L.marker(elm[3].split(" "), {
            icon: virusIcon
          }).bindPopup(elm[4] + "確診: " + elm[1]);
          cityMarkers.push(tempMarker);
          while (nowCount--) {
            addressPoints.push(
              elm[3].split(" ").map(tempValue => {
                const nowValue = parseFloat(tempValue);
                const shiftValue = (nowCount % 1000) * 0.001;
                if (Math.random() % 2 === 0) {
                  return nowValue + shiftValue;
                } else {
                  return nowValue - shiftValue;
                }
              })
            );
          }
        });

      const cities = L.layerGroup(cityMarkers).addTo(map);

      const heat = L.heatLayer(addressPoints, {
        radius: 25,
        blur: 15,
        minOpacity: 0.5
      }).addTo(map);

      map.on("zoomend", function() {
        const zoomLevel = map.getZoom();
        if (zoomLevel < 5) {
          map.removeLayer(cities);
        }
        if (zoomLevel >= 5) {
          if (map.hasLayer(cities)) {
            console.log("layer already added");
          } else {
            map.addLayer(cities);
          }
        }
      });
    })
  );

axios
  .get(
    "https://cors-anywhere.herokuapp.com/https://infogram.com/api/live/flex/01a8508e-9cc9-4b64-994b-cb4fdc2ee6f4/831f2b9f-88fd-4cf1-a323-17756db0c7a1"
  )
  .then(resChart => {
    const dates = [];
    const chinaPatientCounts = [];
    const otherPatientCounts = [];
    resChart.data.data[0]
      .filter(elm => elm[0] !== "日期")
      .forEach(elm => {
        dates.push(elm[0]);
        chinaPatientCounts.push(elm[1]);
        otherPatientCounts.push(elm[2]);
      });
    const chart = c3.generate({
      bindto: "#chart--line",
      data: {
        x: "date",
        xFormat: "%m/%d",
        columns: [
          ["date", ...dates],
          ["中國病例", ...chinaPatientCounts],
          ["其他病例", ...otherPatientCounts]
        ],
        axes: {
          中國病例: "y",
          其他病例: "y2"
        }
      },
      axis: {
        x: {
          type: "timeseries",
          tick: {
            format: "%m/%d"
          }
        },
        y2: {
          show: true
        }
      }
    });
  });
