document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#imageForm");
  const promptInput = document.querySelector("#imagePrompt");
  const generatedImage = document.querySelector("#generatedImage");
  const generateButton = document.querySelector("#generateButton");
  const loadingSpinner = document.querySelector("#loadingSpinner");
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
    generatedImage.style.display = "none";
    downloadButton.style.display = "none";

    try {
      const response = await axios.post("/ai/generate", {
        prompt: promptInput.value,
      });

      generatedImage.src = response.data;

      generateButton.disabled = false;
      generatedImage.style.display = "block";
      downloadButton.style.display = "block";
      loadingSpinner.style.display = "none";
    } catch (error) {
      console.error("Error generating image:", error);
      loadingSpinner.style.display = "none";
      generateButton.disabled = false;
    }
  });
});
