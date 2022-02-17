<script>
  import { onMount } from 'svelte';
  import srcVirus from '../../virus.png';
  import convidActivityJSON from '../../data/covid-activity.json';
  // import { getRandomAround, locations } from "../util.js";

  export let countries = [];
  let map;

  const virusIcon = L.icon({
    iconUrl: srcVirus,
    iconSize: [22, 22], // size of the icon
    iconAnchor: [20, 20], // point of the icon which will correspond to marker's location
    popupAnchor: [-10, -25], // point from which the popup should open relative to the iconAnchor
  });

  let cityMarkers = [];
  let addressPoints = [];
  var convidMarkers = L.markerClusterGroup();

  const initialView = [23.5, 120.8];
  function createMap(container) {
    let _map = L.map(container, { preferCanvas: true }).setView(initialView, 8);
    window.map = _map;
    const tiles = L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      // 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(_map);
    return _map;
  }

  function mapAction(container) {
    map = createMap(container);
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
        if (longitude !== '' && latitude !== '') {
          var marker = L.marker(
            new L.LatLng(parseFloat(latitude), parseFloat(longitude), {
              title: name,
            })
          );
          var strPopup = '';
          addressPoints.push([latitude, longitude]);

          if (elm['案號'] !== '') {
            strPopup = `${strPopup} + 案號: ${elm['案號']} <br>`;
          }

          if (name !== '') {
            strPopup = `${strPopup} + ${name} <br>`;
          }

          if (begin !== '') {
            strPopup = `${strPopup} + 開始:${begin} <br> `;
          }

          if (end !== '') {
            strPopup = `${strPopup} + 結束:${end} <br> `;
          }

          if (address !== '') {
            strPopup = `${strPopup} + 地址:${address} <br> `;
          }

          if (elm['資料來源'] !== '') {
            strPopup = `${strPopup} + <a href="${elm['資料來源']}" target="_blank">資料來源連結<a> <br> `;
          }

          marker.bindPopup(strPopup);
          convidMarkers.addLayer(marker);
        }
      });
    map.addLayer(convidMarkers);

    countries.forEach((elm) => {
      // const totalCount = parseInt(elm[1]);
      // let nowCount = 0;
      const arrLatLng = elm[3].split(' ');
      if (elm[0] !== 'US' && !isNaN(parseFloat(arrLatLng[0]))) {
        const tempMarker = L.marker(elm[3].split(' '), {
          icon: virusIcon,
        }).bindPopup(`${elm[0]}確診：${elm[1]}`);

        cityMarkers.push(tempMarker);
      }
    });

    const cities = L.layerGroup(cityMarkers).addTo(map);
    const heat = L.heatLayer(addressPoints, {
      radius: 9,
      blur: 12,
      minOpacity: 0.6,
    }).addTo(map);

    map.on('zoomend', function () {
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

    return {
      destroy: () => {
        map.remove();
        map = null;
      },
    };
  }

  onMount(() => {
    // 加入 GA
    var _gaId = 'UA-106834789-1';
    var _gaDomain = 'linyencheng.github.io';

    if (location.host === _gaDomain) {
      // Originial
      (function (i, s, o, g, r, a, m) {
        i['GoogleAnalyticsObject'] = r;
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
        'script',
        '//www.google-analytics.com/analytics.js',
        'ga'
      );

      ga('create', _gaId, _gaDomain);
      ga('send', 'pageview');
    }
  });

  function resizeMap() {
    if (map) {
      map.invalidateSize();
    }
  }
</script>

<svelte:window on:resize={resizeMap} />

<div id="map" use:mapAction>
  <div id="dataTable" />
</div>
