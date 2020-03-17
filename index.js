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

//var csv is the CSV file with headers
function csvJSON(csv) {
  var lines = csv.split("\n");

  var result = [];

  // NOTE: If your columns contain commas in their values, you'll need
  // to deal with those before doing the next step
  // (you might convert them to &&& or something, then covert them back later)
  // jsfiddle showing the issue https://jsfiddle.net/
  var headers = lines[0].split(",");

  for (var i = 1; i < lines.length; i++) {
    var obj = {};
    var currentline = lines[i].split(",");

    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentline[j];
    }

    result.push(obj);
  }

  //return result; //JavaScript object
  return JSON.stringify(result); //JSON
}

const getRandomAround = function(
  [latitude, longitude],
  radiusInMeters = 90 * 1000
) {
  var getRandomCoordinates = function(radius, uniform) {
    // Generate two random numbers
    var a = Math.random(),
      b = Math.random();

    // Flip for more uniformity.
    if (uniform) {
      if (b < a) {
        var c = b;
        b = a;
        a = c;
      }
    }

    // It's all triangles.
    return [
      b * radius * Math.cos((2 * Math.PI * a) / b),
      b * radius * Math.sin((2 * Math.PI * a) / b)
    ];
  };

  var randomCoordinates = getRandomCoordinates(radiusInMeters, true);

  // Earths radius in meters via WGS 84 model.
  var earth = 6378137;

  // Offsets in meters.
  var northOffset = randomCoordinates[0],
    eastOffset = randomCoordinates[1];

  // Offset coordinates in radians.
  var offsetLatitude = northOffset / earth,
    offsetLongitude =
      eastOffset / (earth * Math.cos(Math.PI * (parseFloat(latitude) / 180)));

  // Offset position in decimal degrees.
  return [
    parseFloat(latitude) + offsetLatitude * (180 / Math.PI).toFixed(5),
    parseFloat(longitude) + offsetLongitude * (180 / Math.PI).toFixed(5)
  ];
};

axios
  .all([
    axios.get(
      "https://cors-anywhere.herokuapp.com/https://api.coronatracker.com/analytics/country"
    ),
    axios.get(
      "https://cors-anywhere.herokuapp.com/https://api.coronatracker.com/v2/analytics/area?limit=100"
    )
  ])
  .then(
    axios.spread((resCountry, resChina) => {
      resCountry.data
        .filter(
          elm =>
            elm.country !== "China" &&
            elm.country !== "Hong Kong" &&
            elm.country !== "N/A"
        )
        .map(elm => [
          elm.country,
          elm.total_confirmed,
          "確診",
          `${elm.lat} ${elm.lng}`,
          elm.country
        ])
        .concat(
          resChina.data.map(elm => [
            elm.state,
            elm.total_confirmed,
            "確診",
            `${elm.lat} ${elm.lng}`,
            elm.state
          ])
        )
        .forEach(elm => {
          let nowCount = parseInt(elm[1]);
          const tempMarker = L.marker(elm[3].split(" "), {
            icon: virusIcon
          }).bindPopup(`${elm[4]}確診：${elm[1]}`);
          cityMarkers.push(tempMarker);
          while (nowCount--) {
            const arrayLatLng = elm[3].split(" ");
            if (nowCount > 1000) {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 3));
            } else if (nowCount > 2000) {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 1.5));
            } else if (nowCount > 3000) {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 1.2));
            } else if (nowCount > 4000) {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 1.1));
            } else {
              addressPoints.push(getRandomAround(arrayLatLng, nowCount * 100));
            }
          }
        });

      const cities = L.layerGroup(cityMarkers).addTo(map);

      const heat = L.heatLayer(addressPoints, {
        radius: 25,
        blur: 20,
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
    "https://cors-anywhere.herokuapp.com/https://api.coronatracker.com/v2/stats/diff/global"
  )
  .then(resChart => {
    const dates = [];
    const otherPatientCounts = [];
    resChart.data
      // .filter(elm => elm[0] !== "日期")
      .forEach(elm => {
        dates.push(elm.ytd.toString().substring(0, 10));
        // chinaPatientCounts.push(elm[1]);
        otherPatientCounts.push(elm.ytdConfirmed);
      });
    const chart = c3.generate({
      bindto: "#chart--line",
      data: {
        x: "date",
        xFormat: "%Y-%m-%d",
        columns: [
          ["date", ...dates],
          // ["中國病例", ...chinaPatientCounts],
          ["全球確診病例", ...otherPatientCounts]
        ]
        // axes: {
        // 中國病例: "y",
        // 其他病例: "y2"
        // }
      },
      axis: {
        x: {
          type: "timeseries",
          tick: {
            format: "%m-%d"
          }
        }
        // y2: {
        //   show: true
        // }
      }
    });
  });
