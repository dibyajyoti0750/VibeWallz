document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#imageForm");
  const promptInput = document.querySelector("#imagePrompt");
  const generatedImage = document.querySelector("#generatedImage");
  const generateButton = document.querySelector("#generateButton");
  const loadingSpinner = document.querySelector("#loadingSpinner");
  const imageSkeleton = document.getElementById("imageSkeleton");
  const downloadButton = document.querySelector("#downloadButton");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!promptInput.value.trim()) {
      promptInput.classList.add("is-invalid");
      return;
    }

    promptInput.classList.remove("is-invalid");
    generateButton.disabled = true;
    loadingSpinner.style.display = "block";
    imageSkeleton.style.display = "block";
    generatedImage.style.display = "none";
    downloadButton.style.display = "none";

    // Scroll to bottom smoothly when generation starts
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });

    try {
      const response = await axios.post("/ai/generate", {
        prompt: promptInput.value,
      });

      const imageURL = response.data;

      if (!imageURL) throw new Error("Invalid response from server");

      generatedImage.src = imageURL;

      generatedImage.onload = () => {
        generatedImage.style.display = "block";
        downloadButton.style.display = "block";
        loadingSpinner.style.display = "none";
        imageSkeleton.style.display = "none";
        generateButton.disabled = false;
      };
    } catch (error) {
      console.error("Error generating image:", error);
      loadingSpinner.style.display = "none";
      generateButton.disabled = false;
      loadingSpinner.style.display = "none";
      imageSkeleton.style.display = "none";
      generateButton.disabled = false;
    }
  });
});
