const filters = document.querySelectorAll(".filter");
let activeFilter = null;

filters.forEach((filter) =>
  filter.addEventListener("click", async () => {
    const selectedFilter = filter.getAttribute("id");

    if (activeFilter === selectedFilter) {
      // Unselect filter and reset
      activeFilter = null;
      await resetWallpapers(); // Reload original wallpapers without refreshing the page
      filters.forEach((f) => {
        f.style.backgroundColor = "";
        f.style.opacity = "0.7";
      });
    } else {
      // Apply new filter
      activeFilter = selectedFilter;
      await applyFilter(filter);

      filters.forEach((f) => {
        f.style.backgroundColor = "";
        f.style.opacity = "0.7";
      });

      filter.style.backgroundColor = "#f0f0f0";
      filter.style.opacity = "1";
    }
  })
);

const applyFilter = async (theFilter) => {
  let value = theFilter.getAttribute("id");
  console.log("Applying filter:", value);

  try {
    let res = await axios.get(`/wallpapers?filter=${value}`);
    let filteredWallpapers = res.data;

    renderWallpapers(filteredWallpapers);
  } catch (error) {
    console.error(error);
  }
};

const resetWallpapers = async () => {
  console.log("Resetting wallpapers...");

  try {
    let res = await axios.get(`/wallpapers`); // Fetch **all** wallpapers without any filter
    let allWallpapers = res.data;

    renderWallpapers(allWallpapers);
  } catch (error) {
    console.error(error);
  }
};

const renderWallpapers = (wallpapers) => {
  const wallpapersContainer = document.querySelector(".row.g-3");

  // Always remove previous animation classes first
  wallpapersContainer.classList.remove("fade-in", "fade-out");

  // Start fade-out
  wallpapersContainer.classList.add("fade-out");

  setTimeout(() => {
    wallpapersContainer.innerHTML = "";

    wallpapers.forEach((wallpaper) => {
      const col = document.createElement("div");
      col.className = "col-6 col-md-2 col-sm-4";

      col.innerHTML = `
      <div class="card shadow-lg border-0 rounded-4 overflow-hidden position-relative" data-orientation="portrait">
        <a href="/wallpapers/${wallpaper._id}" class="wallpaper-link">
          <img
            loading="lazy"
            src="${wallpaper.image.url}"
            class="card-img-top img-fluid"
            alt="${wallpaper.title}"
            style="object-fit: cover"
          />
        </a>
        <a
          download
          href="${wallpaper.image.url.replace(
            "/upload/",
            `/upload/fl_attachment:${wallpaper.title.replace(/\s+/g, "_")}`
          )}"
          title="Download wallpaper"
          class="download-btn btn"
        >
          <i class="fas fa-download"></i>
        </a>
      </div>
    `;

      wallpapersContainer.appendChild(col);
    });

    // Re-run Masonry after new wallpapers are rendered
    imagesLoaded(wallpapersContainer, function () {
      new Masonry(wallpapersContainer, {
        itemSelector: ".col-6",
        percentPosition: true,
      });
    });

    // After content is changed, trigger fade-in
    wallpapersContainer.classList.remove("fade-out");
    wallpapersContainer.classList.add("fade-in");
  }, 200);
};
