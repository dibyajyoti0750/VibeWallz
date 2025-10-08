document.addEventListener("DOMContentLoaded", () => {
  let likeBtn = document.querySelector(".like-btn");

  if (!likeBtn) return; // Safety check

  likeBtn.addEventListener("click", async () => {
    if (likeBtn.disabled) return; // Prevent multiple clicks

    let wallpaperId = likeBtn.getAttribute("data-wallpaper-id");

    try {
      let res = await axios.post(
        `/wallpapers/${wallpaperId}/like`,
        {},
        { withCredentials: true }
      );

      if (res.data.success) {
        let heartIcon = likeBtn.querySelector("i");
        let likeCount = likeBtn.querySelector("span");

        heartIcon.classList.toggle("far");
        heartIcon.classList.toggle("fas");
        heartIcon.style.color = heartIcon.classList.contains("fas")
          ? "#ff3a78"
          : "";

        likeCount.textContent = res.data.likes;
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        window.location.href = error.response.data.redirectUrl;
      } else {
        console.log(error);
      }
    } finally {
      likeBtn.disabled = false;
    }
  });

  const dialog = document.querySelector("dialog");
  const showDialog = document.querySelector(".show-dialog");
  const closeDialog = document.querySelector(".close-dialog");

  let mapInitialized = false;

  if (showDialog && dialog) {
    showDialog.addEventListener("click", () => {
      dialog.showModal();

      if (!mapInitialized) {
        mapboxgl.accessToken = window.mapToken;

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

        new mapboxgl.Marker({ element: el })
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

        mapInitialized = true;
      }
    });
  }

  if (closeDialog && dialog) {
    closeDialog.addEventListener("click", () => {
      dialog.close();
    });
  }
});
