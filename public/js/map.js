mapboxgl.accessToken = window.mapToken;

const mapContainer = document.getElementById("map");

if (mapContainer) {
  const map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v12",
    center: wallpaper.geometry.coordinates,
    zoom: 9,
  });

  const el = document.createElement("img");
  el.src = "/src/camera.png";
  el.style.width = "3.5rem";
  el.style.height = "3.5rem";

  const marker = new mapboxgl.Marker({ element: el })
    .setLngLat(wallpaper.geometry.coordinates)
    .setPopup(
      new mapboxgl.Popup({ offset: 25, maxWidth: "22rem" }).setHTML(
        `<div style="font-family: 'Montserrat', sans-serif; padding: 0.5rem;">
          <h4 style="margin: 0 0 0.313rem; font-size: 1rem; color: #2c3e50;">${wallpaper.title}</h4>
          <p style="margin: 0; font-size: 0.875rem;"><strong>Location:</strong> ${wallpaper.location}</p>
          <p style="margin: 0.313rem 0 0; font-size: 0.813rem; color: #555;">This photo was captured here.</p>
        </div>`
      )
    )
    .addTo(map);
}
