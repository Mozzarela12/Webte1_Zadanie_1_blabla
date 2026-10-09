const menuButton = document.querySelector(".menu-toggle");
const navList = document.querySelector(".nav-list");
const SEMESTER_START = new Date(2026, 8, 14);
const SEMESTER_END = new Date(2026, 11, 14);

menuButton.addEventListener("click", function () {
  navList.classList.toggle("open");
});

const HOTSPOTS = [
  {
    x: 25,
    y: 40,
    title: "Hlavný monitor",
    text: "Na hlavnom monitore pracujem s kódom vo WebStorme. Používam ho pri tvorbe webových stránok a programovaní."
  },
  {
    x: 75,
    y: 44,
    title: "Druhý monitor",
    text: "Druhý monitor mi poskytuje ďalší priestor na otvorené okná. Pri práci tak môžem sledovať viac vecí súčasne."
  },
  {
    x: 26,
    y: 75,
    title: "Klávesnica",
    text: "Klávesnicu používam pri písaní kódu v jazykoch C a Python aj pri tvorbe webových stránok."
  },
  {
    x: 71,
    y: 76,
    title: "Myš",
    text: "Myš používam na ovládanie programov a pohyb medzi otvorenými oknami."
  },
  {
    x: 92,
    y: 87,
    title: "Slúchadlá",
    text: "Slúchadlá sú súčasťou môjho pracovného prostredia. Umožňujú počúvať zvuk bez reproduktorov."
  }
];
const workspaceImage = document.querySelector(".workspace-image");

if (workspaceImage) {
  workspaceImage.querySelectorAll(".hotspot").forEach(function (hotspot) {
    hotspot.remove();
  });

  HOTSPOTS.forEach(function (item, index) {
    const hotspot = document.createElement("div");
    hotspot.classList.add("hotspot");

    if (item.x > 50) {
      hotspot.classList.add("hotspot-left");
    }

    hotspot.style.setProperty("--x", item.x + "%");
    hotspot.style.setProperty("--y", item.y + "%");

    const button = document.createElement("button");
    button.classList.add("hotspot-button");
    button.type = "button";
    button.textContent = String(index + 1);

    const panel = document.createElement("div");
    panel.classList.add("hotspot-panel");

    const heading = document.createElement("h3");
    heading.textContent = item.title;

    const paragraph = document.createElement("p");
    paragraph.textContent = item.text;

    panel.append(heading, paragraph);
    hotspot.append(button, panel);
    workspaceImage.append(hotspot);
  });
}


const filterButtons = document.querySelectorAll(".schedule-filter");
const scheduleClasses = document.querySelectorAll(".schedule-class");
const scheduleEmpty = document.getElementById("schedule-empty");

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const selectedFilter = button.dataset.filter;

    filterButtons.forEach(function (filterButton) {
      filterButton.classList.remove("active");
    });

    button.classList.add("active");
    let visibleCount = 0;

    scheduleClasses.forEach(function (cell) {
      const shouldShow =
          selectedFilter === "all" ||
          cell.classList.contains(selectedFilter);

      cell.classList.toggle("filtered-out", !shouldShow);
      if (shouldShow) {
        visibleCount++;
      }
    });
    scheduleEmpty.hidden = visibleCount > 0;
  });
});
function timeToMinutes(time) {
  const parts = time.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  return hours * 60 + minutes;
}


const scheduleStatus = document.getElementById("schedule-status");

if (scheduleStatus) {
  const now = new Date();
  const currentDay = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  let currentClass = null;

  scheduleClasses.forEach(function (cell) {
    const row = cell.closest("tr");
    const day = Number(row.dataset.day);
    const start = timeToMinutes(cell.dataset.start);
    const end = timeToMinutes(cell.dataset.end);

    if (
        day === currentDay &&
        currentTime >= start &&
        currentTime < end
    ) {
      currentClass = cell;
    }
  });

  if (currentClass) {
    currentClass.classList.add("current-class");

    const subject = currentClass.querySelector("strong").textContent;

    scheduleStatus.textContent = "Práve prebieha: " + subject + ".";
  } else {
    let nextClass = null;
    let shortestWait = Infinity;

    scheduleClasses.forEach(function (cell) {
      const row = cell.closest("tr");
      const day = Number(row.dataset.day);
      const start = timeToMinutes(cell.dataset.start);

      const daysAhead = (day - currentDay + 7) % 7;
      let wait = daysAhead * 24 * 60 + start - currentTime;

      if (wait <= 0) {
        wait += 7 * 24 * 60;
      }

      if (wait < shortestWait) {
        shortestWait = wait;
        nextClass = cell;
      }
    });

    if (nextClass) {
      const subject = nextClass.querySelector("strong").textContent;
      const row = nextClass.closest("tr");
      const dayName = row.querySelector("th").textContent;
      const startTime = nextClass.dataset.start;

      scheduleStatus.textContent =
          "Momentálne nemám výučbu. Najbližšia hodina: " +
          subject + " — " + dayName + " o " + startTime + ".";
    } else {
      scheduleStatus.textContent = "V rozvrhu nie je žiadna výučba.";
    }
  }
}
const semesterProgress = document.getElementById("semester-progress");
const semesterStatus = document.getElementById("semester-status");

if (semesterProgress && semesterStatus) {
  const today = new Date();

  const totalDuration = SEMESTER_END - SEMESTER_START;
  const elapsedDuration = today - SEMESTER_START;

  const percentage = elapsedDuration / totalDuration * 100;
  const limitedPercentage = Math.max(0, Math.min(100, percentage));
  const roundedPercentage = Math.round(limitedPercentage);

  semesterProgress.value = roundedPercentage;
  semesterProgress.textContent = roundedPercentage + " %";

  semesterStatus.textContent =
      "Uplynulo " + roundedPercentage + " % semestra. " +
      "Semester trvá od 14. 9. 2026 do 14. 12. 2026.";

}
function degreesToRadians(degrees) {
  return degrees * Math.PI / 180;
}

function calculateDistance(pointA, pointB) {
  const earthRadius = 6371;

  const latitudeA = degreesToRadians(pointA.lat);
  const latitudeB = degreesToRadians(pointB.lat);

  const latitudeDifference = degreesToRadians(pointB.lat - pointA.lat);
  const longitudeDifference = degreesToRadians(pointB.lng - pointA.lng);

  const a =
      Math.sin(latitudeDifference / 2) ** 2 +
      Math.cos(latitudeA) *
      Math.cos(latitudeB) *
      Math.sin(longitudeDifference / 2) ** 2;

  const limitedA = Math.max(0, Math.min(1, a));

  const angle = 2 * Math.atan2(
      Math.sqrt(limitedA),
      Math.sqrt(1 - limitedA)
  );

  return earthRadius * angle;
}
const mapElement = document.getElementById("map");

if (mapElement) {
  const map = L.map("map").setView(
      [48.151965, 17.072995],
      15
  );

  L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> — prispievatelia'
      }
  ).addTo(map);
  const schoolMarker = L.marker([48.151965, 17.072995])
      .addTo(map)
      .bindPopup("FEI STU Bratislava");
  const homeMarker = L.marker([48.1486, 17.1077])
      .addTo(map)
      .bindPopup("Bydlisko — fiktívna poloha v centre Bratislavy");

  const initialBounds = L.latLngBounds(
      schoolMarker.getLatLng(),
      homeMarker.getLatLng()
  );

  map.fitBounds(initialBounds, {
    padding: [40, 40]
  });

  const points = [
    {
      name: "Škola — FEI STU",
      lat: schoolMarker.getLatLng().lat,
      lng: schoolMarker.getLatLng().lng
    },
    {
      name: "Bydlisko",
      lat: homeMarker.getLatLng().lat,
      lng: homeMarker.getLatLng().lng
    }
  ];

  const pointSelect = document.getElementById("map-point");
  const targetSelect = document.getElementById("map-target");
  const mapStatus = document.getElementById("map-status");
  function createPopup(point) {
    const popup = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = point.name;
    popup.append(title);

    const description = document.createElement("p");

    if (targetSelect.value === "") {
      description.textContent =
          "Vyberte cieľ na výpočet vzdialenosti.";
    } else {
      const targetIndex = Number(targetSelect.value);
      const targetPoint = points[targetIndex];
      const distance = calculateDistance(point, targetPoint);

      description.textContent =
          "Vzdialenosť k cieľu „" + targetPoint.name +
          "“: " + distance.toFixed(2) + " km.";
    }

    popup.append(description);

    return popup;
  }

// Funkcia sa skončila vyššie.
// Nasledujúce nastavenia sú už mimo nej.

  schoolMarker.bindPopup(function () {
    return createPopup(points[0]);
  });

  homeMarker.bindPopup(function () {
    return createPopup(points[1]);
  });
  function savePoints() {
    const customPoints = points.slice(2);

    try {
      localStorage.setItem(
          "samuel-map-points",
          JSON.stringify(customPoints)
      );
    } catch {
      mapStatus.textContent =
          "Body sa nepodarilo uložiť do prehliadača.";
    }
  }
  function loadPoints() {
    try {
      const savedPoints = localStorage.getItem("samuel-map-points");

      if (savedPoints === null) {
        return;
      }

      const customPoints = JSON.parse(savedPoints);

      if (!Array.isArray(customPoints)) {
        return;
      }

      customPoints.forEach(function (point) {
        if (
            point === null ||
            typeof point !== "object" ||
            typeof point.name !== "string" ||
            point.name.trim() === "" ||
            !Number.isFinite(point.lat) ||
            !Number.isFinite(point.lng) ||
            point.lat < -90 ||
            point.lat > 90 ||
            point.lng < -180 ||
            point.lng > 180
        ) {
          return;
        }

        points.push(point);

        L.marker([point.lat, point.lng])
            .addTo(map)
            .bindPopup(function () {
              return createPopup(point);
            });
      });
    } catch {
      mapStatus.textContent =
          "Uložené body sa nepodarilo načítať.";
    }
  }

  function updateSelects() {
    [pointSelect, targetSelect].forEach(function (select) {
      const previousValue = select.value;

      select.textContent = "";

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Vyberte miesto";
      select.append(placeholder);

      points.forEach(function (point, index) {
        const option = document.createElement("option");
        option.value = String(index);
        option.textContent = point.name;
        select.append(option);
      });

      select.value = previousValue;
    });
  }
  let connectionLine = null;
  function updateDistance() {
    map.closePopup();
    if (connectionLine !== null) {
      map.removeLayer(connectionLine);
      connectionLine = null;
    }
    if (pointSelect.value === "" || targetSelect.value === "") {
      mapStatus.textContent =
          "Vyberte začiatok a cieľ na výpočet vzdialenosti. " +
          "Vlastné miesto pridáte kliknutím do mapy a zadaním názvu.";
      return;
    }

    const startIndex = Number(pointSelect.value);
    const targetIndex = Number(targetSelect.value);

    const startPoint = points[startIndex];
    const targetPoint = points[targetIndex];

    const distance = calculateDistance(startPoint, targetPoint);
    const lineColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent")
        .trim();

    connectionLine = L.polyline(
        [
          [startPoint.lat, startPoint.lng],
          [targetPoint.lat, targetPoint.lng]
        ],
        {
          color: lineColor,
          weight: 3,
          interactive: false
        }
    ).addTo(map);

    mapStatus.textContent =
        "Vzdialenosť z bodu „" + startPoint.name +
        "“ do cieľa „" + targetPoint.name +
        "“: " + distance.toFixed(2) + " km.";
  }

  pointSelect.addEventListener("change", updateDistance);
  targetSelect.addEventListener("change", updateDistance);

  loadPoints();
  updateSelects();

  map.on("click", function (event) {
    const name = prompt("Ako sa má volať tento bod?");

    if (name === null || name.trim() === "") {
      return;
    }

    const point = {
      name: name.trim(),
      lat: event.latlng.lat,
      lng: event.latlng.lng
    };

    points.push(point);
    updateSelects();
    savePoints();

    L.marker([point.lat, point.lng])
        .addTo(map)
        .bindPopup(function () {
          return createPopup(point);
        })
        .openPopup();
  });

}