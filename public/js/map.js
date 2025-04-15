mapboxgl.accessToken = window.mapToken;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v12",
  center: [88.3629, 22.5744],
  zoom: 9,
});
