require([
    "esri/config",
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/GraphicsLayer",
    "esri/PopupTemplate",
    "esri/Graphic"
], function(
    esriConfig,
    Map,
    MapView,
    GraphicsLayer,
    PopupTemplate,
    Graphic
) {

    var map = new Map({
      basemap: "dark-gray"
    });

    var view = new MapView({
      center: [7.7376486,42.3563571],
      zoom: 5,
      map: map,
      container: "viewDiv"
    });

    var layer = new GraphicsLayer({
      graphics : []
    });

    map.add(layer);

    var popupTemplate = new PopupTemplate({
      title: "Tracking Position",
      content: "{*}"
    });

    var markerSymbol = {
      type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
      color: [226, 119, 40],
      outline: {
        // autocasts as new SimpleLineSymbol()
        color: [255, 255, 255],
        width: 2
      }
    };

    function graphicFromData(obj) {

        let point = {
            type : "point",
            x : obj.lon,
            y : obj.lat
        };

        let position = new Graphic({
            geometry: point,
            popupTemplate : popupTemplate,
            symbol : markerSymbol,
            attributes : {
            ObjectID : obj.ObjectID,
            ip : obj.ip,
            lat : obj.lat,
            lon : obj.lon,
            ASN: `<a href="https://api.iptoasn.com/v1/as/ip/${obj.ip}">${obj.ip}</a>`,
            IPv4: /\./.test(obj.ip),
            }
        });

      return position;
    }

    function errorHandler(error) {
      document.getElementById("upload-status").innerHTML =
        "<p style='color:red;max-width: 500px;'>" + error.message + "</p>";
    }

    function updateLayer(graphic) {
        layer.add(graphic);
    };

    view.when(() => {
        window.empty = true;
        const socket = new WebSocket('ws://localhost:8000');
        socket.addEventListener('message', function (event) {
            updateLayer(graphicFromData(JSON.parse(event.data)));
        });
    })

});