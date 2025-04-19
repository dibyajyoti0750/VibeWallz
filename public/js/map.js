mapboxgl.accessToken = window.mapToken;

const mapContainer = document.getElementById("map");

if (mapContainer) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: coordinates,
    zoom: 9,
  });

  const marker = new mapboxgl.Marker({ color: "black", rotation: 45 })
    .setLngLat(coordinates)
    .addTo(map);
}
