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

const availabilityCalendar = document.querySelector("[data-availability-calendar]");

const availabilityUnits = {
  casa: {
    label: "Casa dei Cigni",
    seasonStartMonth: 3,
    seasonEndMonth: 9
  },
  casetta: {
    label: "La Casetta",
    seasonStartMonth: 5,
    seasonEndMonth: 8
  }
};

const availabilityStatusLabels = {
  available: "beschikbaar",
  booked: "bezet",
  option: "optie",
  closed: "gesloten"
};

const availabilityStatusPriority = {
  available: 0,
  option: 1,
  booked: 2,
  closed: 3
};

const calendarWeekdays = ["ma", "di", "wo", "do", "vr", "za", "zo"];
const calendarDayMs = 24 * 60 * 60 * 1000;
const calendarMonthFormatter = new Intl.DateTimeFormat("nl-NL", { month: "long", year: "numeric", timeZone: "UTC" });
const calendarDateFormatter = new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

function capitalise(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function dayNumber(year, month, day) {
  return Math.floor(Date.UTC(year, month, day) / calendarDayMs);
}

function dayNumberFromDate(date) {
  return dayNumber(date.getFullYear(), date.getMonth(), date.getDate());
}

function parseAvailabilityDate(value) {
  const text = String(value || "").trim();
  if (!text) return null;

  const googleDate = text.match(/^Date\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\)$/);
  if (googleDate) {
    return {
      year: Number(googleDate[1]),
      month: Number(googleDate[2]),
      day: Number(googleDate[3])
    };
  }

  const isoDate = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (isoDate) {
    return {
      year: Number(isoDate[1]),
      month: Number(isoDate[2]) - 1,
      day: Number(isoDate[3])
    };
  }

  const dutchDate = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dutchDate) {
    return {
      year: Number(dutchDate[3]),
      month: Number(dutchDate[2]) - 1,
      day: Number(dutchDate[1])
    };
  }

  return null;
}

function datePartsToDayNumber(parts) {
  if (!parts) return null;
  const date = new Date(Date.UTC(parts.year, parts.month, parts.day));
  if (
    date.getUTCFullYear() !== parts.year ||
    date.getUTCMonth() !== parts.month ||
    date.getUTCDate() !== parts.day
  ) {
    return null;
  }
  return Math.floor(date.getTime() / calendarDayMs);
}

function normaliseHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/\s+/g, "_");
}

function cellValue(cell) {
  if (!cell) return "";
  if (cell.f !== undefined && cell.f !== null && String(cell.f).trim()) return String(cell.f).trim();
  if (cell.v === undefined || cell.v === null) return "";
  return String(cell.v).trim();
}

function normaliseGoogleSheetRows(payload) {
  const table = payload?.table;
  if (!table?.cols?.length || !table?.rows?.length) return [];

  const headers = table.cols.map((column) => normaliseHeader(column.label || column.id));
  const fallbackHeaders = ["unit", "start_date", "end_date", "status", "note"];
  const activeHeaders = headers.some(Boolean) ? headers : fallbackHeaders;

  return table.rows.map((row) => {
    const record = {};
    activeHeaders.forEach((header, index) => {
      if (!header) return;
      record[header] = cellValue(row.c?.[index]);
    });
    return record;
  });
}

function parseAvailabilityBlocks(rows) {
  return rows.map((row) => {
    const unit = String(row.unit || "").trim().toLowerCase();
    const status = String(row.status || "").trim().toLowerCase();
    const startDay = datePartsToDayNumber(parseAvailabilityDate(row.start_date));
    const endDay = datePartsToDayNumber(parseAvailabilityDate(row.end_date));

    if (!availabilityUnits[unit] || !availabilityStatusLabels[status] || startDay === null || endDay === null || endDay <= startDay) {
      return null;
    }

    return { unit, status, startDay, endDay };
  }).filter(Boolean);
}

function loadGoogleSheet(sheetId) {
  return new Promise((resolve, reject) => {
    const callbackName = `availabilitySheet${Date.now()}${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error("Sheet request timed out"));
    }, 12000);

    function cleanup() {
      window.clearTimeout(timeout);
      delete window[callbackName];
      script.remove();
    }

    window[callbackName] = (payload) => {
      cleanup();
      resolve(payload);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Sheet request failed"));
    };

    const params = new URLSearchParams({
      gid: "0",
      headers: "1",
      tqx: `out:json;responseHandler:${callbackName}`
    });

    script.src = `https://docs.google.com/spreadsheets/d/${encodeURIComponent(sheetId)}/gviz/tq?${params.toString()}`;
    document.head.append(script);
  });
}

function statusForDay(blocks, unit, day) {
  return blocks
    .filter((block) => block.unit === unit && block.startDay <= day && day < block.endDay)
    .sort((a, b) => availabilityStatusPriority[b.status] - availabilityStatusPriority[a.status])[0]?.status || "available";
}

function seasonYearForUnit(unit) {
  const today = new Date();
  const config = availabilityUnits[unit];
  return today.getMonth() > config.seasonEndMonth ? today.getFullYear() + 1 : today.getFullYear();
}

function buildMonthElement(unit, year, month, blocks, todayDay) {
  const config = availabilityUnits[unit];
  const monthDate = new Date(Date.UTC(year, month, 1));
  const monthElement = document.createElement("article");
  monthElement.className = "calendar-month";

  const header = document.createElement("header");
  const title = document.createElement("h3");
  title.textContent = capitalise(calendarMonthFormatter.format(monthDate));
  const label = document.createElement("span");
  label.textContent = config.label;
  header.append(title, label);

  const weekdays = document.createElement("div");
  weekdays.className = "calendar-weekdays";
  calendarWeekdays.forEach((weekday) => {
    const weekdayElement = document.createElement("span");
    weekdayElement.textContent = weekday;
    weekdays.append(weekdayElement);
  });

  const days = document.createElement("div");
  days.className = "calendar-days";
  const firstWeekday = (monthDate.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

  for (let index = 0; index < firstWeekday; index += 1) {
    const padDay = document.createElement("span");
    padDay.className = "calendar-day is-pad";
    padDay.setAttribute("aria-hidden", "true");
    days.append(padDay);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const currentDay = dayNumber(year, month, day);
    const status = statusForDay(blocks, unit, currentDay);
    const date = new Date(Date.UTC(year, month, day));
    const dayElement = document.createElement("span");
    dayElement.className = `calendar-day is-${status}`;
    dayElement.textContent = String(day);
    dayElement.title = `${calendarDateFormatter.format(date)}: ${availabilityStatusLabels[status]}`;
    dayElement.setAttribute("aria-label", dayElement.title);

    if (currentDay < todayDay) dayElement.classList.add("is-past");
    if (currentDay === todayDay) dayElement.classList.add("is-today");

    days.append(dayElement);
  }

  monthElement.append(header, weekdays, days);
  return monthElement;
}

function initAvailabilityCalendar() {
  if (!availabilityCalendar) return;

  const sheetId = availabilityCalendar.dataset.availabilitySheetId;
  const status = availabilityCalendar.querySelector("[data-availability-status]");
  const months = availabilityCalendar.querySelector("[data-availability-months]");
  const unitButtons = availabilityCalendar.querySelectorAll("[data-availability-unit]");
  const state = {
    activeUnit: "casa",
    blocks: []
  };

  function setStatus(message) {
    if (status) status.textContent = message;
  }

  function render() {
    if (!months) return;
    const config = availabilityUnits[state.activeUnit];
    const year = seasonYearForUnit(state.activeUnit);
    const todayDay = dayNumberFromDate(new Date());
    months.innerHTML = "";

    if (!config) {
      const empty = document.createElement("p");
      empty.className = "calendar-empty";
      empty.textContent = "Deze kalender is tijdelijk niet beschikbaar.";
      months.append(empty);
      return;
    }

    for (let month = config.seasonStartMonth; month <= config.seasonEndMonth; month += 1) {
      months.append(buildMonthElement(state.activeUnit, year, month, state.blocks, todayDay));
    }
  }

  unitButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.activeUnit = button.dataset.availabilityUnit;
      unitButtons.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle("is-active", isActive);
        item.setAttribute("aria-selected", String(isActive));
      });
      render();
    });
  });

  render();

  if (!sheetId) {
    setStatus("De beschikbaarheid kan tijdelijk niet worden geladen. Stuur ons gerust een e-mail voor de actuele stand.");
    return;
  }

  loadGoogleSheet(sheetId)
    .then((payload) => {
      state.blocks = parseAvailabilityBlocks(normaliseGoogleSheetRows(payload));
      render();
      setStatus("Actuele beschikbaarheid geladen. Dagen zonder blokkade staan als beschikbaar.");
    })
    .catch(() => {
      setStatus("De kalender kan tijdelijk niet worden geladen. Stuur ons gerust een e-mail voor de actuele beschikbaarheid.");
    });
}

initAvailabilityCalendar();

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
