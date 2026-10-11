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
        .addTo(map);

    const homeMarker = L.marker([48.1486, 17.1077])
        .addTo(map);

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

        return popup;
    }

    function createSchoolPopup() {
        return createPopup(points[0]);
    }

    function createHomePopup() {
        return createPopup(points[1]);
    }

    schoolMarker.bindPopup(createSchoolPopup);
    homeMarker.bindPopup(createHomePopup);

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