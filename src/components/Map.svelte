<script>
  import { onMount } from "svelte";
  import srcVirus from "../../virus.png";
  import convidActivityJSON from "../../data/covid-activity.json";
  // https://github.com/ronnywang/twgeojson/blob/master/twcounty2010.2.2.json
  // import twcounty2010 from "../../data/twcounty2010.2.json";

  // import { getRandomAround, locations } from "../util.js";

  export let countries = [];

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

  onMount(() => {
    const map = L.map("map").setView([23.5, 120.8], 8);
    window.map = map;
    const tiles = L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    convidActivityJSON
      // .filter((elm) => {
      //   const { end } = elm;
      //   const date1 = dayjs(end);
      //   const date2 = dayjs();
      //   const hours = date2.diff(date1, "hours");
      //   const days = Math.floor(hours / 24);
      //   return days < 14;
      // })
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
    map.addLayer(convidMarkers);

    countries.forEach((elm) => {
      const totalCount = parseInt(elm[1]);
      let nowCount = 0;
      const arrLatLng = elm[3].split(" ");
      if (elm[0] !== "US" && !isNaN(parseFloat(arrLatLng[0]))) {
        const tempMarker = L.marker(elm[3].split(" "), {
          icon: virusIcon,
        }).bindPopup(`${elm[0]}確診：${elm[1]}`);

        cityMarkers.push(tempMarker);
        // if (arrLatLng[1] > 120.1 && arrLatLng[1] < 121.8) {
        //   // 不做事
        // } else {
        //   while (nowCount < totalCount) {
        //     const arrayLatLng = elm[3].split(" ");
        //     if (nowCount < 100) {
        //       nowCount += 1;
        //       addressPoints.push(getRandomAround(arrayLatLng, nowCount));
        //     } else if (nowCount < 1000) {
        //       // 10 ~ 100 公里
        //       nowCount += 17;
        //       addressPoints.push(getRandomAround(arrayLatLng, nowCount * 50));
        //     } else if (nowCount < 5000) {
        //       // 50 ~ 250 公里
        //       nowCount += 37;
        //       addressPoints.push(getRandomAround(arrayLatLng, nowCount * 20));
        //     } else if (nowCount < 20000) {
        //       // 75 ~ 300 公里
        //       nowCount += 157;
        //       addressPoints.push(getRandomAround(arrayLatLng, nowCount * 10));
        //     } else if (nowCount < 40000) {
        //       // 100 ~ 200 公里
        //       nowCount += 317;
        //       addressPoints.push(getRandomAround(arrayLatLng, nowCount * 3));
        //     } else if (nowCount < 80000) {
        //       // 120 ~ 240 公里
        //       nowCount += 487;
        //       addressPoints.push(getRandomAround(arrayLatLng, nowCount * 2));
        //     } else if (nowCount < 100000) {
        //       nowCount += 1109 * 17;
        //       addressPoints.push(getRandomAround(arrayLatLng, nowCount * 0.5));
        //     } else if (nowCount < 2000000) {
        //       nowCount += 5393 * 17;
        //       addressPoints.push(getRandomAround(arrayLatLng, nowCount * 0.05));
        //     } else {
        //       nowCount += 5000000;
        //     }
        //   }
        // }
      }
    });

    const cities = L.layerGroup(cityMarkers).addTo(map);
    const heat = L.heatLayer(addressPoints, {
      radius: 9,
      blur: 12,
      minOpacity: 0.6,
    }).addTo(map);

    // 鄉鎮市界
    // L.geoJson(twcounty2010, {
    //   style: function (feature) {
    //     return {
    //       fillColor: "white",
    //       weight: 3,
    //       opacity: 0.8,
    //       color: "gray",
    //       dashArray: "3",
    //       fillOpacity: 0.1,
    //     };
    //   },
    // }).addTo(map);

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
