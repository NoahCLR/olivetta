const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });
}

const pad = (number) => String(number).padStart(2, "0");

const gallerySets = {
  casa: Array.from({ length: 29 }, (_, index) => ({
    src: `assets/images/casa/casa-${pad(index)}.webp`,
    alt: `Casa dei Cigni foto ${index}`,
    caption: `Casa dei Cigni - foto ${index}`,
    className: index === 0 || index === 11 || index === 12 || index === 20 ? "wide" : index === 6 || index === 14 || index === 21 || index === 26 ? "tall" : ""
  })),
  casetta: Array.from({ length: 10 }, (_, index) => {
    const photo = index + 1;
    return {
      src: `assets/images/casetta/casetta-${pad(photo)}.webp`,
      alt: `La Casetta foto ${photo}`,
      caption: `La Casetta - foto ${photo}`,
      className: photo === 1 || photo === 5 ? "wide" : photo === 2 ? "tall" : ""
    };
  }),
  omgeving: Array.from({ length: 8 }, (_, index) => {
    const photo = index + 1;
    return {
      src: `assets/images/omgeving/omgeving-${pad(photo)}.webp`,
      alt: `Olivetta en omgeving foto ${photo}`,
      caption: `Olivetta en omgeving - foto ${photo}`,
      className: photo === 4 || photo === 6 ? "wide" : photo === 1 || photo === 5 ? "tall" : ""
    };
  })
};

document.querySelectorAll("[data-gallery-set]").forEach((grid) => {
  const name = grid.dataset.gallerySet;
  const items = gallerySets[name] || [];
  const limit = Number(grid.dataset.limit || items.length);

  items.slice(0, limit).forEach((item, index) => {
    const link = document.createElement("a");
    link.href = item.src;
    link.className = item.className;
    link.dataset.galleryName = name;
    link.dataset.galleryIndex = String(index);
    link.dataset.caption = item.caption;
    link.setAttribute("aria-label", item.caption);

    const image = document.createElement("img");
    image.src = item.src;
    image.alt = item.alt;
    image.loading = "lazy";
    image.decoding = "async";

    link.append(image);
    grid.append(link);
  });
});

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.setAttribute("role", "dialog");
lightbox.setAttribute("aria-modal", "true");
lightbox.setAttribute("aria-label", "Fotoweergave");
lightbox.innerHTML = `
  <button class="lightbox-close" type="button" aria-label="Sluiten" title="Sluiten">&times;</button>
  <button class="lightbox-prev" type="button" aria-label="Vorige foto" title="Vorige foto">&#8249;</button>
  <img alt="">
  <button class="lightbox-next" type="button" aria-label="Volgende foto" title="Volgende foto">&#8250;</button>
  <div class="lightbox-caption"></div>
`;
document.body.append(lightbox);

const lightboxImage = lightbox.querySelector("img");
const lightboxCaption = lightbox.querySelector(".lightbox-caption");
let activeGalleryName = "";
let activeIndex = 0;

function showLightbox(galleryName, index) {
  const items = gallerySets[galleryName] || [];
  if (!items[index]) return;
  activeGalleryName = galleryName;
  activeIndex = index;
  const item = items[index];
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCaption.textContent = item.caption;
  lightbox.classList.add("is-open");
  document.body.classList.add("is-locked");
}

function closeLightbox() {
  lightbox.classList.remove("is-open");
  document.body.classList.remove("is-locked");
  lightboxImage.removeAttribute("src");
}

function moveLightbox(direction) {
  const items = gallerySets[activeGalleryName] || [];
  activeIndex = (activeIndex + direction + items.length) % items.length;
  showLightbox(activeGalleryName, activeIndex);
}

document.addEventListener("click", (event) => {
  const galleryLink = event.target.closest("[data-gallery-name]");
  if (galleryLink) {
    event.preventDefault();
    showLightbox(galleryLink.dataset.galleryName, Number(galleryLink.dataset.galleryIndex));
    return;
  }

  if (event.target.closest(".lightbox-close")) closeLightbox();
  if (event.target.closest(".lightbox-prev")) moveLightbox(-1);
  if (event.target.closest(".lightbox-next")) moveLightbox(1);
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (!lightbox.classList.contains("is-open")) return;
  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowLeft") moveLightbox(-1);
  if (event.key === "ArrowRight") moveLightbox(1);
});
