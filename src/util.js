const locations = [
  {
    location: "新北市",
    lng: 121.465452,
    lat: 25.012458,
  },
  {
    location: "高雄市",
    lng: 120.312019,
    lat: 22.623045,
  },
  {
    location: "台中市",
    lng: 120.645756,
    lat: 24.176912,
  },
  {
    location: "台北市",
    lng: 121.5598,
    lat: 25.09108,
  },
  {
    location: "桃園市",
    lng: 121.300974,
    lat: 24.993312,
  },
  {
    location: "台南市",
    lng: 120.1851,
    lat: 23.005181,
  },
  {
    location: "彰化縣",
    lng: 120.4818,
    lat: 23.99297,
  },
  {
    location: "屏東縣",
    lng: 120.62,
    lat: 22.54951,
  },
  {
    location: "雲林縣",
    lng: 120.3897,
    lat: 23.75585,
  },
  {
    location: "苗栗縣",
    lng: 120.820793,
    lat: 24.565031,
  },
  {
    location: "嘉義縣",
    lng: 120.574,
    lat: 23.45889,
  },
  {
    location: "新竹縣",
    lng: 121.012893,
    lat: 24.827162,
  },
  {
    location: "南投縣",
    lng: 120.9876,
    lat: 23.83876,
  },
  {
    location: "宜蘭縣",
    lng: 121.7195,
    lat: 24.69295,
  },
  {
    location: "新竹市",
    lng: 120.9647,
    lat: 24.80395,
  },
  {
    location: "基隆市",
    lng: 121.7081,
    lat: 25.10898,
  },
  {
    location: "花蓮縣",
    lng: 121.3542,
    lat: 23.7569,
  },
  {
    location: "嘉義市",
    lng: 120.4473,
    lat: 23.47545,
  },
  {
    location: "台東縣",
    lng: 120.9876,
    lat: 22.98461,
  },
  {
    location: "金門縣",
    lng: 118.3186,
    lat: 24.43679,
  },
  {
    location: "澎湖縣",
    lng: 119.6151,
    lat: 23.56548,
  },
  {
    location: "連江縣",
    lng: 119.5397,
    lat: 26.19737,
  },
];

//var csv is the CSV file with headers
function csvJSON(csv) {
  var lines = csv.split("\n");

  var result = [];

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

function getRandomAround([latitude, longitude], radiusInMeters = 90 * 1000) {
  var getRandomCoordinates = function (radius, uniform) {
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
      b * radius * Math.sin((2 * Math.PI * a) / b),
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
    parseFloat(longitude) + offsetLongitude * (180 / Math.PI).toFixed(5),
  ];
}

function modifyCountryName(name) {
  let finalName = name;
  switch (name) {
    case "Taiwan*":
      finalName = "Taiwan";
      break;
    case "Korea, South":
      finalName = "Korea";
      break;
    case "USA":
      finalName = "US";
      break;
    case "United Kingdom":
      finalName = "UK";
      break;

    default:
      break;
  }
  return finalName;
}

function modifyCountryParam(name) {
  let finalName = name.toLowerCase();
  switch (name) {
    case "taiwan":
      finalName = "taiwan*";
      break;
    case "united arab emirates":
      finalName = "UAE";
      break;
    case "korea, south":
      finalName = "S. Korea";
      break;
    case "united kingdom":
      finalName = "UK";
      break;
    case "us":
      finalName = "USA";
      break;
    case "bosnia and herzegovina":
      finalName = "Bosnia";
      break;

    default:
      break;
  }
  return finalName;
}

export {
  locations,
  csvJSON,
  getRandomAround,
  modifyCountryName,
  modifyCountryParam,
};
