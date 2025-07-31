document.addEventListener("DOMContentLoaded", () => {
  // =========================================================================
  // --- ⬇️ START OF CONFIGURATION ⬇️ ---

  // 1. GITHUB USERNAME: Replace 'your-github-username' with your actual GitHub username.
  const GITHUB_USERNAME = "andrinoff";

  // 2. GITHUB REPOSITORY: Replace 'your-repository-name' with the name of your repository.
  const GITHUB_REPONAME = "nata-mirzoeva";

  // 3. PHOTOS DIRECTORY: This should match the path in your repository.
  const PHOTOS_PATH = "assets/photos";

  // --- ⬆️ END OF CONFIGURATION ⬆️ ---
  // =========================================================================

  const portfolioGrid = document.getElementById("portfolio-grid");

  async function fetchFromGitHub() {
    const apiUrl = `https://api.github.com/repos/${GITHUB_USERNAME}/${GITHUB_REPONAME}/contents/${PHOTOS_PATH}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok)
        throw new Error(`Network response was not ok: ${response.statusText}`);
      const data = await response.json();

      const photoshoots = data.filter((item) => item.type === "dir");

      if (photoshoots.length === 0) {
        portfolioGrid.innerHTML = `<p>No photo galleries found. Make sure you've created folders inside the '${PHOTOS_PATH}' directory in your GitHub repository.</p>`;
        return;
      }

      portfolioGrid.innerHTML = ""; // Clear the "Loading..." message

      for (const photoshoot of photoshoots) {
        createGalleryFor(photoshoot);
      }
    } catch (error) {
      console.error("Failed to fetch photoshoots:", error);
      portfolioGrid.innerHTML = `<p class="error">Error loading portfolio. Please check your username and repository name in <code>script.js</code> and ensure the repository is public.</p>`;
    }
  }

  async function createGalleryFor(photoshoot) {
    const galleryContainer = document.createElement("section");
    galleryContainer.className = "photoshoot-gallery";

    const titleName = photoshoot.name.replace(/-/g, " ").replace(/_/g, " ");
    galleryContainer.innerHTML = `<h3>${titleName}</h3>`;

    const imageGrid = document.createElement("div");
    imageGrid.className = "image-grid";
    galleryContainer.appendChild(imageGrid);
    portfolioGrid.appendChild(galleryContainer);

    try {
      const imagesResponse = await fetch(photoshoot.url);
      if (!imagesResponse.ok)
        throw new Error(
          `Network response was not ok: ${imagesResponse.statusText}`
        );
      const images = await imagesResponse.json();

      const imageFiles = images.filter(
        (file) =>
          file.type === "file" && /\.(jpe?g|png|gif|webp)$/i.test(file.name)
      );

      if (imageFiles.length === 0) {
        imageGrid.innerHTML = `<p>No images found in this gallery.</p>`;
      } else {
        imageFiles.forEach((imageFile) => {
          const img = document.createElement("img");
          img.src = imageFile.download_url;
          img.alt = imageFile.name;
          img.loading = "lazy"; // Lazy load images for better performance
          imageGrid.appendChild(img);
        });
      }
    } catch (error) {
      console.error(`Failed to fetch images for ${photoshoot.name}:`, error);
      imageGrid.innerHTML = `<p>Error loading this gallery.</p>`;
    }
  }

  fetchFromGitHub();
});
