document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // --- ⬇️ START OF CONFIGURATION ⬇️ ---
  const GITHUB_USERNAME = "andrinoff";
  const GITHUB_REPONAME = "nata-mirzoeva";
  const PHOTOS_PATH = "assets/photos";
  // --- ⬆️ END OF CONFIGURATION ⬆️ ---
  // =========================================================================

  const portfolioContainer = document.getElementById("portfolio-container");

  // Create and append the modal to the body
  const modal = document.createElement("div");
  modal.id = "image-modal";
  modal.classList.add("modal");
  const modalImg = document.createElement("img");
  modalImg.classList.add("modal-content");
  modalImg.id = "modal-image";
  const closeBtn = document.createElement("span");
  closeBtn.classList.add("close-button");
  closeBtn.innerHTML = "&times;";
  modal.appendChild(closeBtn);
  modal.appendChild(modalImg);
  document.body.appendChild(modal);

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  async function fetchFromGitHub() {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${PHOTOS_PATH}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`);
      const data = await response.json();

      const photoshoots = data.filter((item) => item.type === "dir");

      if (photoshoots.length === 0) {
        portfolioContainer.innerHTML = `<p>No photo galleries found. Make sure you've created folders inside the '${PHOTOS_PATH}' directory.</p>`;
        return;
      }

      portfolioContainer.innerHTML = ""; // Clear "Loading..."

      for (const photoshoot of photoshoots) {
        createCarouselFor(photoshoot);
      }
    } catch (error) {
      console.error("Failed to fetch photoshoots:", error);
      portfolioContainer.innerHTML = `<p class="error">Error loading portfolio. Please check your config in <code>script.js</code>.</p>`;
    }
  }

  async function createCarouselFor(photoshoot) {
    const gallerySection = document.createElement("section");
    gallerySection.className = "photoshoot-gallery";

    const titleName = photoshoot.name.replace(/-/g, " ").replace(/_/g, " ");

    gallerySection.innerHTML = `
      <div class="gallery-header">
        <h3>${titleName}</h3>
      </div>
      <div class="carousel-container">
        <button class="carousel-button prev">&lt;</button>
        <div class="carousel-track"></div>
        <button class="carousel-button next">&gt;</button>
      </div>
    `;

    portfolioContainer.appendChild(gallerySection);

    const carouselTrack = gallerySection.querySelector(".carousel-track");
    const prevButton = gallerySection.querySelector(".carousel-button.prev");
    const nextButton = gallerySection.querySelector(".carousel-button.next");

    try {
      const imagesResponse = await fetch(photoshoot.url);
      if (!imagesResponse.ok)
        throw new Error(`Fetch failed: ${imagesResponse.statusText}`);
      const images = await imagesResponse.json();
      const imageFiles = images.filter(
        (file) =>
          file.type === "file" && /\.(jpe?g|png|gif|webp)$/i.test(file.name)
      );

      if (imageFiles.length === 0) {
        carouselTrack.innerHTML = `<p>No images found in this gallery.</p>`;
      } else {
        imageFiles.forEach((imageFile) => {
          const carouselItem = document.createElement("div");
          carouselItem.className = "carousel-item";
          const img = document.createElement("img");
          img.src = imageFile.download_url;
          img.alt = imageFile.name;
          img.loading = "lazy";

          img.onclick = function () {
            modal.style.display = "block";
            modalImg.src = this.src;
          };

          carouselItem.appendChild(img);
          carouselTrack.appendChild(carouselItem);
        });

        // UPDATED: Check for overflow and show buttons if needed
        setTimeout(() => {
          const isOverflowing =
            carouselTrack.scrollWidth > carouselTrack.clientWidth;
          if (isOverflowing) {
            prevButton.style.display = "block";
            nextButton.style.display = "block";
          }
        }, 500); // Delay to allow images to render
      }
    } catch (error) {
      console.error(`Failed to fetch images for ${photoshoot.name}:`, error);
      carouselTrack.innerHTML = `<p>Error loading this gallery.</p>`;
    }

    let currentIndex = 0;
    prevButton.addEventListener("click", () => {
      const itemWidth =
        carouselTrack.querySelector(".carousel-item").clientWidth + 24;
      carouselTrack.style.transform = `translateX(-${
        itemWidth * --currentIndex
      }px)`;
    });

    nextButton.addEventListener("click", () => {
      const itemWidth =
        carouselTrack.querySelector(".carousel-item").clientWidth + 24;
      carouselTrack.style.transform = `translateX(-${
        itemWidth * ++currentIndex
      }px)`;
    });
  }

  fetchFromGitHub();
});
