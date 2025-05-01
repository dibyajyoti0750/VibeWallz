const filters = document.querySelectorAll(".filter");

let crossIcon = document.createElement("span");
crossIcon.classList.add("crossIcon");
crossIcon.innerText = "X";

let activeFilter = null;

crossIcon.addEventListener("click", async (e) => {
  e.stopPropagation();
  filters.forEach((f) => f.classList.remove("active"));
  crossIcon.remove();
  activeFilter = null;
  await resetWallpapers();
});

filters.forEach((filter) =>
  filter.addEventListener("click", async () => {
    const selectedFilter = filter.getAttribute("id");

    filters.forEach((f) => f.classList.remove("active"));
    crossIcon.remove();

    if (activeFilter === selectedFilter) {
      activeFilter = null;
      await resetWallpapers();
    } else {
      activeFilter = selectedFilter;
      await applyFilter(filter);
      filter.classList.add("active");
      filter.insertAdjacentElement("afterBegin", crossIcon);
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
