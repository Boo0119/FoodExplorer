// Show Malaysia local time
function updateTime() {
  fetch("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kuala_Lumpur")
    .then(response => response.json())
    .then(data => {
      const date = new Date(data.dateTime);
      const options = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
      document.getElementById("local-time").textContent = "🕒 " + date.toLocaleString("en-GB", options);
    });
}
setInterval(updateTime, 60000);
updateTime();

// OpenWeather integration with current location support
(function(){
  const apiKey = "2cfd43855f99e910f0202148f940ef0b";
  const KL_COORDS = { lat: 3.139, lon: 101.6869 };

  const weatherIcons = {
    Clear: "☀️",
    Clouds: "☁️",
    FewClouds: "🌤️",
    ScatteredClouds: "🌥️",
    BrokenClouds: "☁️",
    Rain: "🌧️",
    Drizzle: "🌦️",
    Thunderstorm: "⛈️",
    Snow: "❄️",
    Mist: "🌫️",
    Haze: "🌫️",
    Smoke: "💨",
    Dust: "🌪️",
    Fog: "🌫️",
    Sand: "🏜️",
    Ash: "🌋",
    Squall: "💨",
    Tornado: "🌪️"
  };

  async function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("Weather fetch failed");
    return response.json();
  }

  function renderWeather(data) {
    const temp = Math.round(data.main?.temp);
    const condition = data.weather?.[0]?.main || "";
    const icon = weatherIcons[condition] || "🌤️";
    const city = data.name || "";
    const country = data.sys?.country || "";
    const locationLabel = city ? `${city}${country ? ", " + country : ""}` : "";
    const el = document.getElementById("local-weather");
    if (el) el.textContent = `${icon} ${isFinite(temp) ? temp + "°C" : ""}${temp && locationLabel ? ", " : ""}${locationLabel}`;
  }

  async function loadWeatherWithFallback() {
    try {
      // Prefer LocationPermissionManager if present
      if (window.locationManager?.getLocation) {
        const loc = await window.locationManager.getLocation();
        if (loc?.latitude && loc?.longitude) {
          const data = await fetchWeatherByCoords(loc.latitude, loc.longitude);
          return renderWeather(data);
        }
      }

      // Fallback to direct geolocation API
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 });
        });
        const { latitude, longitude } = position.coords;
        const data = await fetchWeatherByCoords(latitude, longitude);
        return renderWeather(data);
      }
    } catch (_) {
      // ignore and fallback
    }
    try {
      // Final fallback: Kuala Lumpur
      const data = await fetchWeatherByCoords(KL_COORDS.lat, KL_COORDS.lon);
      renderWeather(data);
    } catch (err) {
      const el = document.getElementById("local-weather");
      if (el) el.textContent = "Weather unavailable";
      console.error("Weather fetch error:", err);
    }
  }

  // Expose a hook for LocationPermissionManager to push updates immediately after grant
  window.updateWeatherWithLocation = async function(locationData){
    if (!locationData) return loadWeatherWithFallback();
    try {
      const data = await fetchWeatherByCoords(locationData.latitude, locationData.longitude);
      renderWeather(data);
    } catch {
      loadWeatherWithFallback();
    }
  };

  // Initial load + refresh every 10 minutes
  loadWeatherWithFallback();
  setInterval(loadWeatherWithFallback, 600000);
})();
