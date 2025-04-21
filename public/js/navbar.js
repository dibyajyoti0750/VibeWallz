document.addEventListener("DOMContentLoaded", () => {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll(".nav-link");
  const homeLink = document.querySelector(".homeLink");

  // Special case: if path is /wallpapers, set homeLink active
  if (currentPath === "/wallpapers") {
    homeLink.classList.add("active");
  } else {
    navLinks.forEach((link) => {
      const linkPath = link.getAttribute("href");

      if (linkPath === currentPath) {
        link.classList.add("active");
      }
    });
  }
});
