var targetSVG = "M9,0C4.029,0,0,4.029,0,9s4.029,9,9,9s9-4.029,9-9S13.971,0,9,0z M9,15.93 c-3.83,0-6.93-3.1-6.93-6.93S5.17,2.07,9,2.07s6.93,3.1,6.93,6.93S12.83,15.93,9,15.93 M12.5,9c0,1.933-1.567,3.5-3.5,3.5S5.5,10.933,5.5,9S7.067,5.5,9,5.5 S12.5,7.067,12.5,9z";

var data = {"canada":{"51.2537,-85.3232":10, "53.7608,-98.8138":20},
           "us":{"39.0119,-98.4842":10, "31.9686,-99.9018":2, "36.7782,-119.4179":20}};

var longtitude_canada = new Array();
var latitude_canada = new Array();
var value_canada = new Array();
var image_canada = new Array();
var j_canada = 0;


var longtitude_us = new Array();
var latitude_us = new Array();
var value_us = new Array();
var image_us = new Array();
var j_us = 0;

for(var i in data.canada){
  latitude_canada[j_canada] = i.substring(0,7);
  longtitude_canada[j_canada] = i.substring(8,i.length);
  value_canada[j_canada] = data.canada[i];
  j_canada++;
}

for(var i in data.us){
  latitude_us[j_us] = i.substring(0,7);
  longtitude_us[j_us] = i.substring(8,i.length);
  value_us[j_us] = data.us[i];
  j_us++;
}

for(var i=0;i<latitude_canada.length;i++){
  image_canada[i]={
      svgPath: targetSVG,
      zoomLevel: 1.7,
      scale: value_canada[i]*0.0389+0.6222,
      title: value_canada[i],
      latitude: latitude_canada[i],
      longitude: longtitude_canada[i]
  }
}

for(var i=0;i<latitude_us.length;i++){
  image_us[i]={
      svgPath: targetSVG,
      zoomLevel: 3,
      scale: value_us[i]*0.0389+0.6222,
      title: value_us[i],
      latitude: latitude_us[i],
      longitude: longtitude_us[i]
  }
}

window.map = AmCharts.makeChart( "chartdiv", {
  type: "map",
  "projection":"mercator",
  "theme": "none",

  "mouseWheelZoomEnabled": true,
  "minZoomLevel": 0.1,

  "smallMap": {},

  imagesSettings: {
    rollOverColor: "#089282",
    rollOverScale: 3,
    selectedScale: 3,
    selectedColor: "#089282",
    color: "#13564e"
  },

  areasSettings: {
    unlistedAreasColor: "#15A892",
    outlineThickness:0.1
  },

  dataProvider: {
    map: "canadaLow",
    images: image_canada
  },
  "export": {
    "enabled": true
  }

} );

window.map = AmCharts.makeChart( "chartdiv2", {
  type: "map",
  "projection":"mercator",
  "theme": "none",

  "mouseWheelZoomEnabled": true,

  "smallMap": {},

  imagesSettings: {
    rollOverColor: "#089282",
    rollOverScale: 3,
    selectedScale: 3,
    selectedColor: "#089282",
    color: "#13564e"
  },

  areasSettings: {
    unlistedAreasColor: "#15A892",
    outlineThickness:0.1
  },

  dataProvider: {
    map: "usaTerritoriesHigh",
    images: image_us
  },
  "export": {
    "enabled": true
  }

} );