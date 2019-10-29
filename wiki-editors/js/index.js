require([
		"esri/config",
		"esri/Map",
		"esri/views/SceneView",
		"esri/views/MapView",
		"esri/layers/GraphicsLayer",
		"esri/PopupTemplate",
		"esri/Graphic"
], function(
		esriConfig,
		Map,
		SceneView,
		MapView,
		GraphicsLayer,
		PopupTemplate,
		Graphic
) {

    var map = new Map({
      	basemap: "dark-gray"
    });

    var view = new MapView({
		center: [-30,40],
		zoom: 3,
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
		type: "simple-marker", 
		color: [0, 255, 255],
		outline: null
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
            ip : obj.location.ip,
            lat : obj.location.latitude,
            lon : obj.location.longitude,
            ASN: `<a href="https://api.iptoasn.com/v1/as/ip/${obj.ip}">Consulta el ASN</a>`,
            IPv4: /\./.test(obj.ip),
            }
		});
		
		// Para levantar en local

		// let point = {
        //     type : "point",
        //     x : obj.location.longitude,
        //     y : obj.location.latitude,
		// };
		
		// let position = new Graphic({
        //     geometry: point,
        //     popupTemplate : popupTemplate,
        //     symbol : markerSymbol,
        //     attributes : {
        //     ObjectID : obj.ObjectID,
        //     ip : obj.location.ip,
        //     lat : obj.location.latitude,
        //     lon : obj.location.longitude,
        //     ASN: `<a href="https://api.iptoasn.com/v1/as/ip/${obj.location.ip}">Consulta el ASN</a>`,
        //     IPv4: /\./.test(obj.location.ip),
        //     }
        // });
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