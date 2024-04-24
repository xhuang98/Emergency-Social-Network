class MapView extends Component {
  constructor () {
    super("map");
  }

  onContainerRegister () {

  }

  onViewFocus (args) {
    const lat = args[0];
    const long = args[1];
    mapboxgl.accessToken = mapboxToken;

    const map = new mapboxgl.Map({
      container: 'map-container', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [long, lat], // starting position [lng, lat]
      zoom: 12, // starting zoom
      projection: 'globe'
    });

    map.on('style.load', () => {
      map.setFog({}); // Set the default atmosphere style
    });

    map.addControl(new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true
      },
      trackUserLocation: true,
      showUserHeading: true
    }));

    // Create a new marker.
    new mapboxgl.Marker()
      .setLngLat([long, lat])
      .addTo(map);
  }
}

const mapView = new MapView();
mapView.register();
