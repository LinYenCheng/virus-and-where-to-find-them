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

axios
  .all([
    axios.get(
      "https://cors-anywhere.herokuapp.com/https://e.infogram.com/api/live/flex/01a8508e-9cc9-4b64-994b-cb4fdc2ee6f4/d88a8a03-ca6a-45a3-b286-3f818a507004"
    ),
    axios.get(
      "https://cors-anywhere.herokuapp.com/https://infogram.com/api/live/flex/01a8508e-9cc9-4b64-994b-cb4fdc2ee6f4/fa0a13f4-b153-48db-9e94-7cb6e1d85fab"
    )
  ])
  .then(
    axios.spread((resWorld, resChina) => {
      resWorld.data.data[0]
        .filter(elm => elm[2] !== "無")
        .filter(
          elm => elm[4] !== "中國" && elm[4] !== "香港" && elm[4] !== "澳門"
        )
        .concat(resChina.data.data[0])
        .forEach(elm => {
          L.marker(elm[3].split(" "), { icon: virusIcon })
            .addTo(map)
            .bindPopup(elm[4] + "確診: " + elm[1]);
          let nowCount = parseInt(elm[1]);
          while (nowCount--) {
            addressPoints.push(elm[3].split(" "));
          }
        });

      const heat = L.heatLayer(addressPoints, {
        radius: 25,
        blur: 15,
        minOpacity: 0.5
      }).addTo(map);
    })
  );
