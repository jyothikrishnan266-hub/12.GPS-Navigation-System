// ==========================================
// GPS NAVIGATION SYSTEM
// Dijkstra Shortest Path Algorithm
// ==========================================

// LocalStorage keys
const LOCATION_KEY = "gps_locations";
const ROAD_KEY = "gps_roads";
const HISTORY_KEY = "gps_navigation_history";

// Load saved data
let locations = JSON.parse(localStorage.getItem(LOCATION_KEY)) || [];
let roads = JSON.parse(localStorage.getItem(ROAD_KEY)) || [];
let navigationHistory =
    JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];


// ==========================================
// SAVE DATA
// ==========================================

function saveData() {
    localStorage.setItem(
        LOCATION_KEY,
        JSON.stringify(locations)
    );

    localStorage.setItem(
        ROAD_KEY,
        JSON.stringify(roads)
    );

    localStorage.setItem(
        HISTORY_KEY,
        JSON.stringify(navigationHistory)
    );
}


// ==========================================
// ADD LOCATION
// ==========================================

function addLocation() {

    const name = document
        .getElementById("locationName")
        .value.trim();

    const city = document
        .getElementById("locationCity")
        .value.trim();

    const type = document
        .getElementById("locationType")
        .value;

    if (!name || !city) {
        showMessage(
            "locationMessage",
            "Please enter location name and city.",
            "error"
        );
        return;
    }

    const exists = locations.some(
        location =>
            location.name.toLowerCase() === name.toLowerCase()
    );

    if (exists) {
        showMessage(
            "locationMessage",
            "Location already exists.",
            "error"
        );
        return;
    }

    const location = {
        id: Date.now(),
        name: name,
        city: city,
        type: type
    };

    locations.push(location);

    saveData();
    refreshAll();

    document.getElementById("locationName").value = "";
    document.getElementById("locationCity").value = "";

    showMessage(
        "locationMessage",
        "Location added successfully!",
        "success"
    );
}


// ==========================================
// DELETE LOCATION
// ==========================================

function deleteLocation(id) {

    const location = locations.find(
        item => item.id === id
    );

    if (!location) return;

    const connectedRoad = roads.some(
        road =>
            road.from === id ||
            road.to === id
    );

    if (connectedRoad) {
        alert(
            "Cannot delete this location because roads are connected to it."
        );
        return;
    }

    locations = locations.filter(
        item => item.id !== id
    );

    saveData();
    refreshAll();
}


// ==========================================
// DISPLAY LOCATIONS
// ==========================================

function displayLocations(list = locations) {

    const table =
        document.getElementById("locationTable");

    table.innerHTML = "";

    list.forEach(location => {

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(location.name)}</td>
            <td>${escapeHTML(location.city)}</td>
            <td>${escapeHTML(location.type)}</td>
            <td>
                <button
                    class="delete-btn"
                    onclick="deleteLocation(${location.id})">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}


// ==========================================
// SEARCH LOCATIONS
// ==========================================

function searchLocations() {

    const search =
        document
            .getElementById("searchInput")
            .value
            .toLowerCase();

    const filtered = locations.filter(location =>

        location.name
            .toLowerCase()
            .includes(search) ||

        location.city
            .toLowerCase()
            .includes(search) ||

        location.type
            .toLowerCase()
            .includes(search)
    );

    displayLocations(filtered);
}


// ==========================================
// UPDATE SELECT BOXES
// ==========================================

function updateLocationSelects() {

    const selects = [
        "roadFrom",
        "roadTo",
        "startLocation",
        "endLocation"
    ];

    selects.forEach(id => {

        const select =
            document.getElementById(id);

        const oldValue = select.value;

        select.innerHTML =
            `<option value="">Select location</option>`;

        locations.forEach(location => {

            const option =
                document.createElement("option");

            option.value = location.id;

            option.textContent =
                `${location.name} - ${location.city}`;

            select.appendChild(option);
        });

        if (
            locations.some(
                location =>
                    String(location.id) === oldValue
            )
        ) {
            select.value = oldValue;
        }
    });
}


// ==========================================
// ADD ROAD
// ==========================================

function addRoad() {

    const from =
        Number(document.getElementById("roadFrom").value);

    const to =
        Number(document.getElementById("roadTo").value);

    const distance =
        Number(document.getElementById("roadDistance").value);

    const speed =
        Number(document.getElementById("roadSpeed").value);

    const traffic =
        document.getElementById("roadTraffic").value;

    if (!from || !to || !distance || !speed) {

        showMessage(
            "roadMessage",
            "Please fill all road details.",
            "error"
        );

        return;
    }

    if (from === to) {

        showMessage(
            "roadMessage",
            "Start and destination cannot be the same.",
            "error"
        );

        return;
    }

    if (distance <= 0 || speed <= 0) {

        showMessage(
            "roadMessage",
            "Distance and speed must be greater than zero.",
            "error"
        );

        return;
    }

    const roadExists = roads.some(
        road =>
            road.from === from &&
            road.to === to
    );

    if (roadExists) {

        showMessage(
            "roadMessage",
            "This road already exists.",
            "error"
        );

        return;
    }

    roads.push({
        id: Date.now(),
        from: from,
        to: to,
        distance: distance,
        speed: speed,
        traffic: traffic
    });

    saveData();
    refreshAll();

    showMessage(
        "roadMessage",
        "Road added successfully!",
        "success"
    );
}


// ==========================================
// DELETE ROAD
// ==========================================

function deleteRoad(id) {

    roads = roads.filter(
        road => road.id !== id
    );

    saveData();
    refreshAll();
}


// ==========================================
// DISPLAY ROADS
// ==========================================

function displayRoads() {

    const table =
        document.getElementById("roadTable");

    table.innerHTML = "";

    roads.forEach(road => {

        const fromLocation =
            getLocation(road.from);

        const toLocation =
            getLocation(road.to);

        if (!fromLocation || !toLocation) return;

        const row =
            document.createElement("tr");

        row.innerHTML = `
            <td>${escapeHTML(fromLocation.name)}</td>

            <td>${escapeHTML(toLocation.name)}</td>

            <td>${road.distance.toFixed(1)} km</td>

            <td>${road.speed} km/h</td>

            <td>${getTrafficIcon(road.traffic)}
                ${road.traffic}
            </td>

            <td>
                <button
                    class="delete-btn"
                    onclick="deleteRoad(${road.id})">
                    Delete
                </button>
            </td>
        `;

        table.appendChild(row);
    });
}


// ==========================================
// GET LOCATION
// ==========================================

function getLocation(id) {

    return locations.find(
        location => location.id === id
    );
}


// ==========================================
// TRAFFIC FACTOR
// ==========================================

function getTrafficFactor(traffic) {

    switch (traffic) {

        case "Medium":
            return 1.25;

        case "High":
            return 1.60;

        default:
            return 1;
    }
}


// ==========================================
// TRAFFIC ICON
// ==========================================

function getTrafficIcon(traffic) {

    if (traffic === "Low") return "🟢";

    if (traffic === "Medium") return "🟡";

    return "🔴";
}


// ==========================================
// DIJKSTRA'S ALGORITHM
// ==========================================

function dijkstra(startId, endId) {

    const graph = {};

    // Create graph
    locations.forEach(location => {
        graph[location.id] = [];
    });

    // Roads are treated as bidirectional
    roads.forEach(road => {

        graph[road.from].push({
            node: road.to,
            distance: road.distance,
            road: road
        });

        graph[road.to].push({
            node: road.from,
            distance: road.distance,
            road: road
        });
    });

    const distances = {};
    const previous = {};
    const visited = new Set();

    locations.forEach(location => {
        distances[location.id] = Infinity;
        previous[location.id] = null;
    });

    distances[startId] = 0;

    while (visited.size < locations.length) {

        let current = null;
        let smallestDistance = Infinity;

        locations.forEach(location => {

            if (
                !visited.has(location.id) &&
                distances[location.id] <
                smallestDistance
            ) {
                smallestDistance =
                    distances[location.id];

                current = location.id;
            }
        });

        if (current === null) break;

        if (current === endId) break;

        visited.add(current);

        graph[current].forEach(edge => {

            if (visited.has(edge.node)) return;

            const newDistance =
                distances[current] +
                edge.distance;

            if (
                newDistance <
                distances[edge.node]
            ) {

                distances[edge.node] =
                    newDistance;

                previous[edge.node] = {
                    node: current,
                    road: edge.road
                };
            }
        });
    }

    if (distances[endId] === Infinity) {
        return null;
    }

    // Reconstruct route
    const path = [];
    let current = endId;

    while (current !== null) {

        path.unshift(current);

        if (previous[current]) {
            current =
                previous[current].node;
        } else {
            current = null;
        }
    }

    return {
        path: path,
        distance: distances[endId]
    };
}


// ==========================================
// CALCULATE ROUTE INFORMATION
// ==========================================

function calculateRouteInfo(path) {

    let distance = 0;
    let time = 0;
    let trafficValues = [];

    for (let i = 0; i < path.length - 1; i++) {

        const from = path[i];
        const to = path[i + 1];

        const road = roads.find(
            r =>
                (r.from === from && r.to === to) ||
                (r.from === to && r.to === from)
        );

        if (!road) continue;

        distance += road.distance;

        const trafficFactor =
            getTrafficFactor(road.traffic);

        const adjustedSpeed =
            road.speed / trafficFactor;

        time +=
            (road.distance / adjustedSpeed) * 60;

        trafficValues.push(road.traffic);
    }

    return {
        distance,
        time,
        trafficValues
    };
}


// ==========================================
// FIND SHORTEST ROUTE
// ==========================================

function findShortestRoute() {

    const start =
        Number(document.getElementById("startLocation").value);

    const end =
        Number(document.getElementById("endLocation").value);

    const fuelEfficiency =
        Number(document.getElementById("fuelEfficiency").value);

    const fuelPrice =
        Number(document.getElementById("fuelPrice").value);

    if (!start || !end) {

        alert("Please select start and destination.");

        return;
    }

    if (start === end) {

        alert("Start and destination must be different.");

        return;
    }

    if (
        fuelEfficiency <= 0 ||
        fuelPrice < 0
    ) {

        alert("Enter valid fuel information.");

        return;
    }

    const result =
        dijkstra(start, end);

    if (!result) {

        document.getElementById("routeResult").innerHTML = `
            <div class="route-card">
                <h3>❌ No Route Found</h3>
                <p>There is no connected road between the selected locations.</p>
            </div>
        `;

        return;
    }

    const info =
        calculateRouteInfo(result.path);

    const fuelUsed =
        info.distance / fuelEfficiency;

    const fuelCost =
        fuelUsed * fuelPrice;

    const startLocation =
        getLocation(start);

    const endLocation =
        getLocation(end);

    // Save navigation
    navigationHistory.push({
        id: Date.now(),
        start: start,
        end: end,
        distance: info.distance,
        time: info.time,
        fuelCost: fuelCost
    });

    saveData();

    displayRoute(
        result.path,
        info,
        fuelUsed,
        fuelCost,
        startLocation,
        endLocation
    );

    updateStatistics();
}


// ==========================================
// DISPLAY ROUTE
// ==========================================

function displayRoute(
    path,
    info,
    fuelUsed,
    fuelCost,
    startLocation,
    endLocation
) {

    let sequenceHTML = "";

    path.forEach((id, index) => {

        const location = getLocation(id);

        sequenceHTML += `
            <span class="location-node">
                ${escapeHTML(location.name)}
            </span>
        `;

        if (index < path.length - 1) {

            sequenceHTML += `
                <span class="arrow">→</span>
            `;
        }
    });

    const alternatives =
        findAlternativeRoutes(
            startLocation.id,
            endLocation.id,
            path
        );

    let alternativesHTML = "";

    if (alternatives.length > 0) {

        alternativesHTML = `
            <h3>🏆 Alternative Routes</h3>
        `;

        alternatives.forEach(
            (route, index) => {

                const names =
                    route.path.map(
                        id => getLocation(id).name
                    );

                const routeInfo =
                    calculateRouteInfo(route.path);

                alternativesHTML += `
                    <div class="alternative">

                        <h4>
                            Alternative Route ${index + 1}
                        </h4>

                        <p>
                            ${names.join(" → ")}
                        </p>

                        <p>
                            📏 Distance:
                            ${routeInfo.distance.toFixed(2)} km
                            |
                            ⏱️ Time:
                            ${formatTime(routeInfo.time)}
                        </p>

                    </div>
                `;
            }
        );
    }

    document.getElementById("routeResult").innerHTML = `

        <div class="route-card">

            <h3>
                🗺️ Shortest Route
            </h3>

            <div class="route-details">

                <div class="route-detail">
                    📏 Distance
                    <strong>
                        ${info.distance.toFixed(2)} km
                    </strong>
                </div>

                <div class="route-detail">
                    ⏱️ Travel Time
                    <strong>
                        ${formatTime(info.time)}
                    </strong>
                </div>

                <div class="route-detail">
                    ⛽ Fuel Used
                    <strong>
                        ${fuelUsed.toFixed(2)} L
                    </strong>
                </div>

                <div class="route-detail">
                    💰 Fuel Cost
                    <strong>
                        ₹${fuelCost.toFixed(2)}
                    </strong>
                </div>

            </div>

            <h3>📋 Complete Route Sequence</h3>

            <div class="sequence">
                ${sequenceHTML}
            </div>

            <br>

            <h3>🚦 Traffic Conditions</h3>

            <p>
                ${getTrafficSummary(info.trafficValues)}
            </p>

            <br>

            ${alternativesHTML}

        </div>
    `;
}


// ==========================================
// FIND ALTERNATIVE ROUTES
// ==========================================

function findAlternativeRoutes(
    start,
    end,
    shortestPath
) {

    const results = [];
    const visited = new Set();

    function dfs(
        current,
        path,
        distance
    ) {

        if (results.length >= 10) return;

        if (current === end) {

            const sameAsShortest =
                JSON.stringify(path) ===
                JSON.stringify(shortestPath);

            if (!sameAsShortest) {

                results.push({
                    path: [...path],
                    distance: distance
                });
            }

            return;
        }

        visited.add(current);

        const connectedRoads =
            roads.filter(
                road =>
                    road.from === current ||
                    road.to === current
            );

        connectedRoads.forEach(road => {

            const next =
                road.from === current
                    ? road.to
                    : road.from;

            if (visited.has(next)) return;

            path.push(next);

            dfs(
                next,
                path,
                distance + road.distance
            );

            path.pop();
        });

        visited.delete(current);
    }

    dfs(start, [start], 0);

    results.sort(
        (a, b) =>
            a.distance - b.distance
    );

    return results.slice(0, 3);
}


// ==========================================
// TIME FORMAT
// ==========================================

function formatTime(minutes) {

    if (minutes < 60) {

        return `${Math.round(minutes)} min`;
    }

    const hours =
        Math.floor(minutes / 60);

    const mins =
        Math.round(minutes % 60);

    return `${hours} hr ${mins} min`;
}


// ==========================================
// TRAFFIC SUMMARY
// ==========================================

function getTrafficSummary(trafficValues) {

    if (trafficValues.length === 0) {
        return "No traffic data";
    }

    const high =
        trafficValues.filter(
            t => t === "High"
        ).length;

    const medium =
        trafficValues.filter(
            t => t === "Medium"
        ).length;

    if (high > 0) {
        return "🔴 High traffic detected on part of the route.";
    }

    if (medium > 0) {
        return "🟡 Medium traffic detected on part of the route.";
    }

    return "🟢 Traffic is low on the selected route.";
}


// ==========================================
// STATISTICS
// ==========================================

function updateStatistics() {

    const totalDistance =
        roads.reduce(
            (sum, road) =>
                sum + road.distance,
            0
        );

    const averageDistance =
        roads.length > 0
            ? totalDistance / roads.length
            : 0;

    document.getElementById(
        "locationCount"
    ).textContent = locations.length;

    document.getElementById(
        "roadCount"
    ).textContent = roads.length;

    document.getElementById(
        "roadDistance"
    ).textContent =
        `${totalDistance.toFixed(1)} km`;

    document.getElementById(
        "navigationCount"
    ).textContent =
        navigationHistory.length;

    document.getElementById(
        "statLocations"
    ).textContent =
        locations.length;

    document.getElementById(
        "statRoads"
    ).textContent =
        roads.length;

    document.getElementById(
        "statDistance"
    ).textContent =
        `${totalDistance.toFixed(2)} km`;

    document.getElementById(
        "statAverage"
    ).textContent =
        `${averageDistance.toFixed(2)} km`;

    if (navigationHistory.length > 0) {

        const shortest =
            Math.min(
                ...navigationHistory.map(
                    n => n.distance
                )
            );

        const longest =
            Math.max(
                ...navigationHistory.map(
                    n => n.distance
                )
            );

        document.getElementById(
            "statShortest"
        ).textContent =
            `${shortest.toFixed(2)} km`;

        document.getElementById(
            "statLongest"
        ).textContent =
            `${longest.toFixed(2)} km`;

    } else {

        document.getElementById(
            "statShortest"
        ).textContent = "-";

        document.getElementById(
            "statLongest"
        ).textContent = "-";
    }
}


// ==========================================
// REFRESH EVERYTHING
// ==========================================

function refreshAll() {

    displayLocations();
    displayRoads();
    updateLocationSelects();
    updateStatistics();
}


// ==========================================
// MESSAGE
// ==========================================

function showMessage(
    elementId,
    message,
    type
) {

    const element =
        document.getElementById(elementId);

    element.className = type;
    element.textContent = message;

    setTimeout(() => {
        element.textContent = "";
    }, 3000);
}


// ==========================================
// CLEAR ALL DATA
// ==========================================

function clearAllData() {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete all navigation data?"
        );

    if (!confirmDelete) return;

    locations = [];
    roads = [];
    navigationHistory = [];

    localStorage.removeItem(LOCATION_KEY);
    localStorage.removeItem(ROAD_KEY);
    localStorage.removeItem(HISTORY_KEY);

    document.getElementById(
        "routeResult"
    ).innerHTML = "";

    refreshAll();
}


// ==========================================
// SECURITY HELPER
// ==========================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ==========================================
// START APPLICATION
// ==========================================

refreshAll();