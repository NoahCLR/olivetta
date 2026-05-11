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

const weatherWidget = document.querySelector("[data-weather-widget]");

const weatherDescriptions = new Map([
  [0, "Helder"],
  [1, "Licht bewolkt"],
  [2, "Half bewolkt"],
  [3, "Bewolkt"],
  [45, "Mist"],
  [48, "Mist"],
  [51, "Lichte motregen"],
  [53, "Motregen"],
  [55, "Motregen"],
  [56, "IJzel"],
  [57, "IJzel"],
  [61, "Lichte regen"],
  [63, "Regen"],
  [65, "Veel regen"],
  [66, "IJzel"],
  [67, "IJzel"],
  [71, "Lichte sneeuw"],
  [73, "Sneeuw"],
  [75, "Veel sneeuw"],
  [77, "Sneeuwkorrels"],
  [80, "Lichte buien"],
  [81, "Buien"],
  [82, "Felle buien"],
  [85, "Sneeuwbuien"],
  [86, "Sneeuwbuien"],
  [95, "Onweer"],
  [96, "Onweer met hagel"],
  [99, "Onweer met hagel"]
]);

function roundedTemperature(value) {
  if (typeof value !== "number") return "--&deg;";
  return `${Math.round(value)}&deg;`;
}

function weatherLabel(code) {
  return weatherDescriptions.get(code) || "Wisselend";
}

function formatForecastDay(date, index) {
  if (index === 0) return "Vandaag";
  if (index === 1) return "Morgen";
  return new Intl.DateTimeFormat("nl-NL", { weekday: "short" }).format(new Date(`${date}T12:00:00`));
}

async function initWeatherWidget() {
  if (!weatherWidget) return;

  const status = weatherWidget.querySelector("[data-weather-status]");
  const current = weatherWidget.querySelector("[data-weather-current]");
  const days = weatherWidget.querySelector("[data-weather-days]");
  const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");

  forecastUrl.search = new URLSearchParams({
    latitude: "43.879",
    longitude: "7.516",
    current: "temperature_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min,weather_code",
    timezone: "Europe/Rome",
    forecast_days: "5"
  });

  try {
    const response = await fetch(forecastUrl);
    if (!response.ok) throw new Error("Weather request failed");
    const weather = await response.json();
    const currentTemperature = weather.current?.temperature_2m;
    const currentCode = weather.current?.weather_code;

    if (typeof currentTemperature === "number" && current) {
      current.innerHTML = `
        <span>Nu</span>
        <strong>${roundedTemperature(currentTemperature)}</strong>
        <small>${weatherLabel(currentCode)}</small>
      `;
    }

    const daily = weather.daily;
    if (!daily?.time?.length || !days) throw new Error("Incomplete weather data");

    days.innerHTML = daily.time.map((date, index) => {
      const high = daily.temperature_2m_max[index];
      const low = daily.temperature_2m_min[index];
      const code = daily.weather_code[index];

      return `
        <article class="weather-day">
          <span>${formatForecastDay(date, index)}</span>
          <strong>${roundedTemperature(high)}</strong>
          <small>${roundedTemperature(low)} laag - ${weatherLabel(code)}</small>
        </article>
      `;
    }).join("");

    if (status) {
      status.textContent = "Live verwachting voor Olivetta San Michele, bijgewerkt via Open-Meteo.";
    }
  } catch (error) {
    if (status) {
      status.textContent = "De weerverwachting is tijdelijk niet beschikbaar. Probeer de pagina later opnieuw te laden.";
    }
    if (current) {
      current.innerHTML = `
        <span>Weer</span>
        <strong>--&deg;</strong>
        <small>Tijdelijk niet beschikbaar</small>
      `;
    }
  }
}

initWeatherWidget();
