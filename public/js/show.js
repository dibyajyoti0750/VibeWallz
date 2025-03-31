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
});
