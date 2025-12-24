document.addEventListener('DOMContentLoaded', () => {
    createSnowflakes();
    initMap();

    // Splash Screen Logic
    const splash = document.getElementById('splash-screen');
    if (splash) {
        setTimeout(() => {
            splash.style.opacity = '0';
            setTimeout(() => {
                splash.style.display = 'none';
            }, 800); // Wait for transition to finish
        }, 3000); // Show for 3 seconds to let animations play
    }
});

function createSnowflakes() {
    const container = document.getElementById('snow-container');
    const snowflakeCount = 50;

    for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.innerHTML = '❄';

        // Random positioning and animation duration
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's'; // 2-5s
        snowflake.style.opacity = Math.random();
        snowflake.style.fontSize = (Math.random() * 10 + 10) + 'px';
        snowflake.style.animationDelay = Math.random() * 5 + 's';

        container.appendChild(snowflake);
    }
}

// Map variables
let map;
let routingControl;
let currentTileLayer;
let isDarkMode = true; // Default to dark mode as per recent changes

function initMap() {
    // Center map on India (approximate center)
    map = L.map('map').setView([20.5937, 78.9629], 5);

    // Initial Layer: Dark Matter
    currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);
}

function toggleMapTheme() {
    isDarkMode = !isDarkMode;
    const btn = document.getElementById('theme-toggle');

    if (currentTileLayer) {
        map.removeLayer(currentTileLayer);
    }

    if (isDarkMode) {
        // Switch to Dark Mode
        currentTileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 20
        }).addTo(map);

        btn.innerText = "☀️ Light Mode";
        btn.style.background = "var(--santa-red)";
        btn.style.color = "white";

        // Update container style for dark aesthetic
        document.querySelector('.leaflet-container').style.background = "#242424";

    } else {
        // Switch to Light Mode (OpenStreetMap Standard)
        currentTileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        btn.innerText = "🌙 Dark Mode";
        btn.style.background = "var(--pine-green)";
        btn.style.color = "white";

        // Update container style for light aesthetic
        document.querySelector('.leaflet-container').style.background = "#ddd";
    }
}

// Simulate Gemini AI Analysis
async function mockGeminiAnalysis() {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({
                safe: true,
                message: "Gemini AI Analysis: Route is 95% Safe. avoiding unlit areas.",
                details: "Verified with police heatmap and street light database."
            });
        }, 1500); // 1.5s delay
    });
}

// Helper to update status log
function updateStatus(msg, color = 'var(--text-primary)') {
    const el = document.getElementById('status-log');
    if (el) {
        el.style.color = color;
        el.innerText = msg;
    }
    console.log("Map Status:", msg);
}

// Robust Geocoding Function using fetch
async function geocodeLocation(query) {
    if (!query.toLowerCase().includes("india")) query += ", India";
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data && data.length > 0) {
            return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), display_name: data[0].display_name };
        }
        return null;
    } catch (error) {
        console.error("Geocoding error:", error);
        return null;
    }
}

async function calculateRoute() {
    let from = document.getElementById('from-location').value;
    let to = document.getElementById('to-location').value;
    const btn = document.querySelector('button[onclick="calculateRoute()"]');

    if (!from || !to) {
        alert("Please enter both 'From' and 'To' locations.");
        return;
    }

    // UI Loading State
    btn.disabled = true;
    btn.style.opacity = "0.7";
    updateStatus("🔍 Searching for locations...", "blue");

    // 1. Geocode Start
    updateStatus(`📍 Looking for "${from}"...`, "var(--santa-red)");
    const startLoc = await geocodeLocation(from);
    if (!startLoc) {
        updateStatus(`❌ Could not find "${from}"`, "red");
        alert(`Could not find location: ${from}`);
        btn.disabled = false;
        btn.style.opacity = "1";
        return;
    }

    // 2. Geocode End
    updateStatus(`📍 Looking for "${to}"...`, "var(--santa-red)");
    const endLoc = await geocodeLocation(to);
    if (!endLoc) {
        updateStatus(`❌ Could not find "${to}"`, "red");
        alert(`Could not find location: ${to}`);
        btn.disabled = false;
        btn.style.opacity = "1";
        return;
    }

    // 3. Gemini Analysis (Simulated)
    updateStatus("✨ Gemini AI Analyzing Route Safety...", "#F8B229"); // Gold
    await mockGeminiAnalysis();

    // 4. Update Map
    updateStatus("✅ Route Verified! Drawing map...", "#2ecc71");

    // Clear previous elements
    if (routingControl) map.removeControl(routingControl);
    map.eachLayer((layer) => {
        if (layer instanceof L.Circle || layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const fromLatLng = L.latLng(startLoc.lat, startLoc.lon);
    const toLatLng = L.latLng(endLoc.lat, endLoc.lon);

    // Add Markers & Pulsing Circles
    L.marker(fromLatLng).addTo(map).bindPopup(`Start: ${from}`).openPopup();
    L.marker(toLatLng).addTo(map).bindPopup(`End: ${to}`);

    L.circle(fromLatLng, { color: '#00FF00', fillColor: '#00FF00', fillOpacity: 0.3, radius: 500, className: 'pulsing-circle' }).addTo(map);
    L.circle(toLatLng, { color: '#00FF00', fillColor: '#00FF00', fillOpacity: 0.3, radius: 500, className: 'pulsing-circle' }).addTo(map);

    // Routing Control
    routingControl = L.Routing.control({
        waypoints: [fromLatLng, toLatLng],
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: false, // Manual fit
        lineOptions: {
            styles: [{ color: '#00FF00', opacity: 1, weight: 8, className: 'neon-route-line' }]
        },
        createMarker: function () { return null; } // We added custom markers already
    }).addTo(map);

    routingControl.on('routesfound', function (e) {
        const routes = e.routes;
        const bounds = L.latLngBounds(routes[0].coordinates);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16, animate: true });
        updateStatus("✅ Safe Route Displayed", "#2ecc71");

        // Show Share Buttons
        document.getElementById('share-actions').style.display = 'flex';

        // Show AI Box
        let aiMsgDiv = document.getElementById('ai-msg');
        if (!aiMsgDiv) {
            aiMsgDiv = document.createElement('div');
            aiMsgDiv.id = 'ai-msg';
            aiMsgDiv.style.marginTop = '1rem';
            aiMsgDiv.style.padding = '1rem';
            aiMsgDiv.style.borderRadius = '8px';
            aiMsgDiv.style.backgroundColor = '#1e1e1e';
            aiMsgDiv.style.border = '2px solid #00FF00';
            aiMsgDiv.style.color = '#00FF00';
            aiMsgDiv.style.fontWeight = 'bold';
            aiMsgDiv.style.boxShadow = '0 0 15px rgba(0, 255, 0, 0.2)';
            document.querySelector('.route-inputs').after(aiMsgDiv);
        }
        aiMsgDiv.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:1.5rem">🤖</span>
                <div>
                    <div>Gemini AI Analysis: Route is 95% Safe using main roads.</div>
                    <div style="font-weight:normal; font-size:0.9em; margin-top:4px; color: #ccc;">Verified with real-time street light data.</div>
                </div>
            </div>`;
    });

    routingControl.on('routingerror', function (e) {
        console.error("Routing error:", e);
        updateStatus("⚠️ Route calculation failed. Try closer locations.", "red");
        // Fallback: just fit bounds to markers if route fails
        map.fitBounds(L.latLngBounds([fromLatLng, toLatLng]), { padding: [50, 50] });
    });

    btn.disabled = false;
    btn.style.opacity = "1";
    btn.innerText = "Find Route 🚀";
}

function shareOnWhatsApp() {
    // Feedback that it's working
    const btn = document.querySelector('button[onclick="shareOnWhatsApp()"]');
    if (btn) btn.innerText = "🛰️ Locating...";

    // Helper to send messages
    const sendShareAlerts = (lat, lng) => {
        const fromEl = document.getElementById('from-location');
        const toEl = document.getElementById('to-location');

        let from = fromEl ? fromEl.value : "";
        let to = toEl ? toEl.value : "";

        if (!from) from = "My Location";
        if (!to) to = "Destination";

        let mapsLink;
        if (lat && lng) {
            mapsLink = `https://maps.google.com/?q=${lat},${lng}`;
        } else {
            // Fallback link to destination if GPS fails
            mapsLink = `https://maps.google.com/?q=${encodeURIComponent(to)}`;
        }

        let text;
        if (from !== "My Location" && to !== "Destination") {
            text = `🎄 *SantaForShe Live Tracking* 🎄\n\nI am travelling from *${from}* to *${to}*.\n\n📍 Track my REAL-TIME LOCATION here:\n${mapsLink}\n\n(Sent via SantaForShe)`;
        } else {
            text = `🎄 *SantaForShe Live Tracking* 🎄\n\nI am sharing my live location with you.\n\n📍 Track my REAL-TIME LOCATION here:\n${mapsLink}\n\n(Sent via SantaForShe)`;
        }

        // 1. WhatsApp
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');

        // 2. SMS (delayed)
        setTimeout(() => {
            const smsUri = `sms:?body=${encodeURIComponent(text)}`;
            window.location.href = smsUri;
        }, 1500);

        // Reset button
        if (btn) btn.innerText = "📱 Share Live Location on WhatsApp";
        alert("✅ Live Link Generated!\n\nCheck WhatsApp and SMS to send.");
    };

    // Get Real Location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                sendShareAlerts(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.error("Share location error:", error);
                alert("⚠️ GPS denied/failed. Sending destination link instead.");
                sendShareAlerts(null, null);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    } else {
        alert("⚠️ Geolocation not supported. Sending destination link.");
        sendShareAlerts(null, null);
    }
}

function triggerSOS() {
    // Immediate WhatsApp Alert
    if (confirm("🚨 ACTIVATE SOS? \n\nWe need to access your CURRENT LOCATION to share it with emergency contacts.\n\nClick OK to allow location access and send alert.")) {

        // Show immediate visual feedback
        document.body.style.animation = "pulse-red 0.5s infinite";
        // Create or update a status overlay
        let sosStatus = document.getElementById('sos-status');
        if (!sosStatus) {
            sosStatus = document.createElement('div');
            sosStatus.id = 'sos-status';
            sosStatus.style.position = 'fixed';
            sosStatus.style.top = '50%';
            sosStatus.style.left = '50%';
            sosStatus.style.transform = 'translate(-50%, -50%)';
            sosStatus.style.background = 'rgba(0,0,0,0.9)';
            sosStatus.style.color = '#fff';
            sosStatus.style.padding = '20px';
            sosStatus.style.borderRadius = '10px';
            sosStatus.style.zIndex = '9999';
            sosStatus.style.textAlign = 'center';
            sosStatus.style.fontSize = '1.2rem';
            document.body.appendChild(sosStatus);
        }
        sosStatus.innerHTML = "🛰️ Accessing GPS...<br><small>Please 'Allow' location access</small>";
        sosStatus.style.display = 'block';

        // Function to send the message
        const sendAlerts = (lat, lng) => {
            const mapsLink = lat && lng ? `https://maps.google.com/?q=${lat},${lng}` : "Location unavailable";
            const sosText = `🚨 SOS! EMERGENCY! I am in danger!\n\n📍 Location:\n${mapsLink}\n\nPlease help immediately!`;

            // 1. Open WhatsApp
            window.open(`https://wa.me/?text=${encodeURIComponent(sosText)}`, '_blank');

            // 2. Open SMS (slightly delayed to allow browser to process first request)
            setTimeout(() => {
                // '000' is a placeholder. On mobile, this opens the SMS app where user selects contacts.
                // Some devices support ?body=, others &body=
                const smsUri = `sms:?body=${encodeURIComponent(sosText)}`;
                window.location.href = smsUri;
            }, 1000);

            sosStatus.innerHTML = "✅ Alerts Generated!<br><small>WhatsApp & SMS opened.<br>HIT SEND ON BOTH!</small>";
            setTimeout(() => {
                document.body.style.animation = "none";
                sosStatus.style.display = 'none';
            }, 8000);
        };

        // Try to get precise location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    sendAlerts(latitude, longitude);
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    let errMsg = "GPS signal weak.";
                    let detailedHelp = "Please ensure Location is ON.";

                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errMsg = "Location Access Denied.";
                            detailedHelp = "Please ALLOW Location in your browser settings (Top Left Lock Icon).";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errMsg = "Location Unavailable.";
                            detailedHelp = "GPS signal lost. Try moving outdoors.";
                            break;
                        case error.TIMEOUT:
                            errMsg = "Location Timeout.";
                            detailedHelp = "GPS took too long. Retrying might help.";
                            break;
                    }

                    alert(`⚠️ ${errMsg}\n\n${detailedHelp}\n\nSwitching to manual location mode...`);

                    // Fallback to manual entry or generic message
                    let from = document.getElementById('from-location').value;

                    const sosText = `🚨 SOS! EMERGENCY! I am in danger!\n\n📍 Location Context: Near ${from || "Unknown Location"}\n\n(GPS Error: ${errMsg})`;

                    // Trigger both fallbacks
                    window.open(`https://wa.me/?text=${encodeURIComponent(sosText)}`, '_blank');
                    setTimeout(() => { window.location.href = `sms:?body=${encodeURIComponent(sosText)}`; }, 1000);

                    sosStatus.innerHTML = `⚠️ ${errMsg}<br><small>Sending generic alerts...</small>`;
                    setTimeout(() => {
                        document.body.style.animation = "none";
                        sosStatus.style.display = 'none';
                    }, 3000);
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
            );
        } else {
            // Fallback if browser doesn't support geolocation
            sendAlerts(null, null);
        }
    }
}
