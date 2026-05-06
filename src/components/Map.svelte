<script>
  import { onMount } from "svelte";
  import srcVirus from "../../virus.png";
  import convidActivityJSON from "../../data/covid-activity.json";
  // https://github.com/ronnywang/twgeojson/blob/master/twcounty2010.2.2.json
  import twcounty2010 from "../../data/twcounty2010.2.json";

  // import { getRandomAround, locations } from "../util.js";

  export let countries = [];
  export let mapMode = "virus";

  import ratData from "../../data/mouse.json";

  const virusIcon = L.icon({
    iconUrl: srcVirus,
    iconSize: [22, 22], // size of the icon
    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
    popupAnchor: [-10, -25], // point from which the popup should open relative to the iconAnchor
  });

  const virusIconSmall = L.icon({
    iconUrl: srcVirus,
    iconSize: [12, 12], // size of the icon
    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
    popupAnchor: [-10, -25], // point from which the popup should open relative to the iconAnchor
  });

  let cityMarkers = [];
  let addressPoints = [];
  var convidMarkers = L.markerClusterGroup();
  let map;
  let virusLayers = L.layerGroup();
  let ratLayers = L.layerGroup();
  let ratMarkers = L.markerClusterGroup();
  let ratHeatPoints = [];

  $: if (map && mapMode) {
    updateMapMode();
  }

  function updateMapMode() {
    if (mapMode === "virus") {
      map.removeLayer(ratLayers);
      map.removeLayer(ratMarkers);
      map.addLayer(virusLayers);
      map.addLayer(convidMarkers);
    } else {
      map.removeLayer(virusLayers);
      map.removeLayer(convidMarkers);
      map.addLayer(ratLayers);
      map.addLayer(ratMarkers);
    }
  }

  onMount(() => {
    map = L.map("map").setView([23.5, 120.8], 8);
    window.map = map;
    const tiles = L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    const latestEntryDate = convidActivityJSON.reduce((max, elm) => {
      const current = new Date(elm.end).getTime();
      return current > max ? current : max;
    }, 0);

    convidActivityJSON
      .filter((elm) => {
        const { end } = elm;
        const date1 = new Date(end);
        const diffTime = latestEntryDate - date1.getTime();
        const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return days < 20;
      })
      .forEach((elm) => {
        const { latitude, longitude, begin, end, name, address } = elm;
        if (longitude !== "" && latitude !== "") {
          var marker = L.marker(
            new L.LatLng(parseFloat(latitude), parseFloat(longitude), {
              title: name,
            })
          );
          var strPopup = "";
          addressPoints.push([latitude, longitude]);

          if (elm["案號"] !== "") {
            strPopup = `${strPopup} + 案號: ${elm["案號"]} <br>`;
          }

          if (name !== "") {
            strPopup = `${strPopup} + ${name} <br>`;
          }

          if (begin !== "") {
            strPopup = `${strPopup} + 開始:${begin} <br> `;
          }

          if (end !== "") {
            strPopup = `${strPopup} + 結束:${end} <br> `;
          }

          if (address !== "") {
            strPopup = `${strPopup} + 地址:${address} <br> `;
          }

          if (elm["資料來源"] !== "") {
            strPopup = `${strPopup} + <a href="${elm["資料來源"]}" target="_blank">資料來源連結<a> <br> `;
          }

          marker.bindPopup(strPopup);
          convidMarkers.addLayer(marker);
        }
      });

    countries.forEach((elm) => {
      const totalCount = parseInt(elm[1]);
      let nowCount = 0;
      const arrLatLng = elm[3].split(" ");
      if (elm[0] !== "US" && !isNaN(parseFloat(arrLatLng[0]))) {
        const tempMarker = L.marker(elm[3].split(" "), {
          icon: virusIcon,
        }).bindPopup(`${elm[0]}${elm[2]}：${elm[1]}`);

        cityMarkers.push(tempMarker);
      }
    });

    const cities = L.layerGroup(cityMarkers);
    const heat = L.heatLayer(addressPoints, {
      radius: 9,
      blur: 12,
      minOpacity: 0.6,
    });
    virusLayers.addLayer(cities);
    virusLayers.addLayer(heat);

    // Rat Map Data
    window.ratMarkerMap = new Map();
    ratData.forEach((elm, index) => {
      const lat = parseFloat(elm.lat);
      const lng = parseFloat(elm.lng);
      if (!isNaN(lat) && !isNaN(lng)) {
        ratHeatPoints.push([lat, lng]);
        const marker = L.marker([lat, lng]);
        const id = `rat-${index}`;
        let popupContent = `
          <div class="rat-popup">
            <strong>時間:</strong> ${elm.time}<br>
            <strong>地點:</strong> ${elm.location}<br>
            <strong>類型:</strong> ${elm.type}<br>
            <strong>說明:</strong> ${elm.description}<br>
        `;
        if (elm.image && elm.image.startsWith('http')) {
          popupContent += `<img src="${elm.image}" style="width:100%;max-width:250px;margin-top:8px;border-radius:4px;display:block;" alt="通報照片" />`;
        }
        popupContent += `</div>`;
        marker.bindPopup(popupContent);
        ratMarkers.addLayer(marker);
        window.ratMarkerMap.set(id, marker);
      }
    });

    const ratHeat = L.heatLayer(ratHeatPoints, {
      radius: 15,
      blur: 20,
      minOpacity: 0.4,
    });
    ratLayers.addLayer(ratHeat);

    updateMapMode();

    // 鄉鎮市界
    L.geoJson(twcounty2010, {
      style: function (feature) {
        return {
          fillColor: "white",
          weight: 3,
          opacity: 0.8,
          color: "gray",
          dashArray: "3",
          fillOpacity: 0.1,
        };
      },
    }).addTo(map);

    map.on("zoomend", function () {
      const zoomLevel = map.getZoom();
      if (zoomLevel < 7) {
        map.removeLayer(cities);
      }
      if (zoomLevel >= 7) {
        if (map.hasLayer(cities)) {
          // console.log("layer already added");
        } else {
          map.addLayer(cities);
        }
      }
    });

    // 加入 GA
    var _gaId = "UA-106834789-1";
    var _gaDomain = "linyencheng.github.io";

    if (location.host === _gaDomain) {
      // Originial
      (function (i, s, o, g, r, a, m) {
        i["GoogleAnalyticsObject"] = r;
        (i[r] =
          i[r] ||
          function () {
            (i[r].q = i[r].q || []).push(arguments);
          }),
          (i[r].l = 1 * new Date());
        (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
        a.async = 1;
        a.src = g;
        m.parentNode.insertBefore(a, m);
      })(
        window,
        document,
        "script",
        "//www.google-analytics.com/analytics.js",
        "ga"
      );

      ga("create", _gaId, _gaDomain);
      ga("send", "pageview");
    }
  });
</script>

<div id="map">
  <div id="dataTable" />
</div>
