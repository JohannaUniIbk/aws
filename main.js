/* Wetterstationen Euregio Beispiel */

// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11,
};

// Karte initialisieren
let map = L.map("map").setView([ibk.lat, ibk.lng], ibk.zoom);

// thematische Layer
let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    wind: L.featureGroup(),
    snow: L.featureGroup(),
    direction: L.featureGroup().addTo(map),
}


// Layer control
L.control.layers({
    "Relief avalanche.report": L.tileLayer(
        "https://static.avalanche.report/tms/{z}/{x}/{y}.webp", {
        attribution: `© <a href="https://sonny.4lima.de">Sonny</a>, <a href="https://www.eea.europa.eu/en/datahub/datahubitem-view/d08852bc-7b5f-4835-a776-08362e2fbf4b">EU-DEM</a>, <a href="https://lawinen.report/">avalanche.report</a>, all licensed under <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>`,
        maxZoom:12
    }).addTo(map),
    "OpenStreetMap": L.tileLayer.provider("OpenStreetMap.Mapnik"),
    "OpenTopoMap": L.tileLayer.provider("OpenTopoMap"),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery"),
}, {
    "Wetterstationen": overlays.stations,
    "Temperatur": overlays.temperature,
    "Wind": overlays.wind,
    "Schneehöhe": overlays.snow,
    "Windrichtung": overlays.direction,
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Wetterstationen
async function loadStations(url) {
    let response = await fetch(url);
    let jsondata = await response.json();


    // Wetterstationen mit Icons und Popups
    //console.log(jsondata);
    L.geoJSON(jsondata, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: "icons/wifi.png",
                    iconSize: [32, 37],
                    iconAnchor: [16, 37]
                })
            });
        },
        onEachFeature: function (feature, layer) {
            let pointInTime = new Date(feature.properties.date);
            console.log(pointInTime);
            //console.log(feature.properties);
            //console.log(feature.geometry);
            let props = feature.properties;
            layer.bindPopup(`
                <h4>${feature.properties.name} (${feature.geometry.coordinates[2]}m)</h4>
                <ul>
                    <li>Lufttemperatur (C) ${feature.properties.LT !== undefined ? feature.properties.LT : "-"}</li>
                    <li>Relative Luftfeuchte (%) ${feature.properties.RH ||"-"}</li>
                    <li>Windgeschwindigkeit (km/h) ${feature.properties.WG ||"-"}</li>
                    <li>Schneehöhe (cm) ${feature.properties.HS ||"-"}</li>
                </ul>
                <span>${pointInTime.toLocaleString()}</span>
            `);
        }
    }).addTo(overlays.stations);
    showTemperature(jsondata);
    showWind(jsondata);
    showSnow(jsondata);
    showDirection(jsondata);
}





//GEOJSON laden
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");


//Temperatur
function showTemperature(jsondata) {
    L.geoJSON(jsondata, {
        filter: function(feature){
            if(feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }
        },
            pointToLayer: function(feature,latlng){
                let color = getColor(feature.properties.LT, COLORS.temperature);
                return L.marker(latlng,{
                    icon: L.divIcon({
                        className: "aws-div-icon",
                        html: `<span style="background-color:${color}">${feature.properties.LT.toFixed(1)}</span>`,
                    }),
                })
            },
    }).addTo(overlays.temperature);
}

console.log(COLORS);
function getColor(value, ramp) {
    for(let rule of ramp) {
        console.log("rule", rule);
        if (value>= rule.min && value < rule.max)
            return rule.color;
    }
}
//let testColor =getColor(-5, COLORS.temperature);
//console.log("TestColor fuer temp -5", testColor);


//Wind
function showWind(jsondata) {
    L.geoJSON(jsondata, {
        filter: function(feature){
            if(feature.properties.WG > 0 && feature.properties.WG < 1000) {
                return true;
            }
        },
            pointToLayer: function(feature,latlng){
                let color = getColor(feature.properties.WG, COLORS.wind);
                return L.marker(latlng,{
                    icon: L.divIcon({
                        className: "aws-div-icon-wind",
                        html: `<span style="background-color:${color}">${feature.properties.WG.toFixed(1)}</span>`,
                    }),
                })
            },
    }).addTo(overlays.wind);
}

console.log(COLORS);
function getColor(value, ramp) {
    for(let rule of ramp) {
        console.log("rule", rule);
        if (value>= rule.min && value < rule.max)
            return rule.color;
    }
}
//let testColor =getColor(-5, COLORS.wind);
//console.log("TestColor fuer wind 10", testColor);


//Schnee
function showSnow(jsondata) {
    L.geoJSON(jsondata, {
        filter: function(feature){
            if(feature.properties.HS > -1 && feature.properties.HS < 50000) {
                return true;
            }
        },
            pointToLayer: function(feature,latlng){
                let color = getColor(feature.properties.HS, COLORS.snow);
                return L.marker(latlng,{
                    icon: L.divIcon({
                        className: "aws-div-icon-snow",
                        html: `<span style="background-color:${color}">${feature.properties.HS.toFixed(1)}</span>`,
                    }),
                })
            },
    }).addTo(overlays.snow);
}

console.log(COLORS);
function getColor(value, ramp) {
    for(let rule of ramp) {
        console.log("rule", rule);
        if (value>= rule.min && value < rule.max)
            return rule.color;
    }
}
// Umwandlung von Grad in Himmelsrichtungen
/*function getWindDirectionLabel(degrees) {
    if (degrees >= 337.5 || degrees < 22.5) return "N";
    if (degrees >= 22.5 && degrees < 67.5) return "NE";
    if (degrees >= 67.5 && degrees < 112.5) return "E";
    if (degrees >= 112.5 && degrees < 157.5) return "SE";
    if (degrees >= 157.5 && degrees < 202.5) return "S";
    if (degrees >= 202.5 && degrees < 247.5) return "SW";
    if (degrees >= 247.5 && degrees < 292.5) return "W";
    if (degrees >= 292.5 && degrees < 337.5) return "NW";
    return "-"; 
}*/

//Windrichtung
function showDirection(jsondata) {
    L.geoJSON(jsondata, {
        filter: function(feature){
            if(feature.properties.WR > 0 && feature.properties.WR < 361) {
                return true;
            }
        },
            pointToLayer: function(feature,latlng){
                let color = getColor(feature.properties.WG, COLORS.wind);
                /*let windDirectionDegrees = feature.properties.WR;*/
                /*let windDirectionLabel = getWindDirectionLabel(windDirectionDegrees);*/

                return L.marker(latlng,{
                    icon: L.divIcon({
                        className: "aws-div-icon-wind",
                        html: `<span><i style="transform:rotate(${feature.properties.WR}deg);
                        color:${color}"class="fa-solid
                        fa-circle-arrow-down"></i></span>`,
                    })
                })
            },
    }).addTo(overlays.direction);
}

console.log(COLORS);
function getColor(value, ramp) {
    for(let rule of ramp) {
        console.log("rule", rule);
        if (value>= rule.min && value < rule.max)
            return rule.color;
    }
}

    // Rainviewer initialisieren
    
    L.control.rainviewer({ 
        position: 'bottomleft',
        nextButtonText: '>',
        playStopButtonText: '▶/⏸',
        prevButtonText: '<',
        positionSliderLabelText: "Zeit:",
        opacitySliderLabelText: "Deckkraft:",
        animationInterval: 300,
        opacity: 0.5
    }).addTo(map);

    
    