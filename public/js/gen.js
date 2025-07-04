document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#imageForm");
  const promptInput = document.querySelector("#imagePrompt");
  const generatedImage = document.querySelector("#generatedImage");
  const generateButton = document.querySelector("#generateButton");
  const loadingSpinner = document.querySelector("#loadingSpinner");
  const imageSkeleton = document.getElementById("imageSkeleton");
  const downloadButton = document.querySelector("#downloadButton");

  const updateGenLeft = async () => {
    try {
      const res = await axios.get("/ai/generation-count");
      if (res.data.success) {
        const usedCount = res.data.data;
        const remaining = 5 - usedCount;
        document.querySelector(
          "#genLeft"
        ).innerText = `Generations left: ${remaining}`;
      }
    } catch (error) {
      console.error("Error loading generation count:", error);
    }
  };

  updateGenLeft();

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

      updateGenLeft();
    } catch (error) {
      console.error("Error generating image:", error);
      loadingSpinner.style.display = "none";
      generateButton.disabled = false;
      loadingSpinner.style.display = "none";
      imageSkeleton.style.display = "none";
      generateButton.disabled = false;

      // ✅ If server responded with rate limit error
      const errorMessage = document.querySelector("#errorMessage");
      if (error.response && error.response.status === 429) {
        const data = error.response.data;

        errorMessage.innerHTML = `
  <div>${data.message}</div>
  <button id="buy-plan" class="btn">Buy Plan</button>
  <button type="button" class="btn-close" onclick="errorMessage.classList.add('d-none')">&times;</button>
`;
        errorMessage.classList.remove("d-none");

        setTimeout(() => {
          const buyBtn = document.querySelector("#buy-plan");
          if (buyBtn) {
            buyBtn.addEventListener("click", async () => {
              try {
                const res = await axios.post("/payment/order");
                const { orderId, amount, currency, key } = res.data;

                const options = {
                  key,
                  amount,
                  currency,
                  name: "VibeWallz",
                  description: "Buy more image generations",
                  order_id: orderId,
                  handler: async function (response) {
                    alert("Payment successful!");
                    window.location.reload();
                  },
                  prefill: {
                    email: "user@example.com", // Optionally use req.user.email
                  },

                  theme: {
                    color: "#3399cc",
                  },
                };

                const razor = new Razorpay(options);
                razor.open();
              } catch (error) {
                alert("Error creating Razorpay order");
              }
            });
          }
        }, 100);
      }
    }
  });

  // I don't know how, but somehow it works
  downloadButton.addEventListener("click", async () => {
    const imageURL = generatedImage.src;

    try {
      const response = await fetch(imageURL);
      const blob = await response.blob();
      const blobURL = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobURL;
      link.download = `vibeWallz-ai-image${Date.now()}.png`;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobURL);
    } catch (error) {
      console.error("Download failed:", error);
      alert("Failed to download image. Please try again.");
    }
  });
});
