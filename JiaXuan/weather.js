// Show Malaysia local time with jQuery
function updateTime() {
  $.getJSON("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kuala_Lumpur", function(data) {
    const date = new Date(data.dateTime);
    const options = { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    $("#local-time").text("🕒 " + date.toLocaleString("en-GB", options));
  });
}
setInterval(updateTime, 60000);
updateTime();

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

  function fetchWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    return $.getJSON(url);
  }

  function renderWeather(data) {
    const temp = Math.round(data.main?.temp);
    const condition = data.weather?.[0]?.main || "";
    const icon = weatherIcons[condition] || "🌤️";
    const city = data.name || "";
    const country = data.sys?.country || "";
    const locationLabel = city ? `${city}${country ? ", " + country : ""}` : "";
    const text = `${icon} ${isFinite(temp) ? temp + "°C" : ""}${temp && locationLabel ? ", " : ""}${locationLabel}`;
    $("#local-weather").text(text);
  }

  function loadWeatherWithFallback() {
    // Prefer LocationPermissionManager if present
    if (window.locationManager && window.locationManager.getLocation) {
      window.locationManager.getLocation().then(function(loc) {
        if (loc && loc.latitude && loc.longitude) {
          fetchWeatherByCoords(loc.latitude, loc.longitude)
            .done(renderWeather)
            .fail(loadWeatherWithFallbackFallback);
        } else {
          loadWeatherWithFallbackFallback();
        }
      }).catch(loadWeatherWithFallbackFallback);
      return;
    }

    // Fallback to direct geolocation API
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        const { latitude, longitude } = position.coords;
        fetchWeatherByCoords(latitude, longitude)
          .done(renderWeather)
          .fail(loadWeatherWithFallbackFallback);
      }, loadWeatherWithFallbackFallback, { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 });
    } else {
      loadWeatherWithFallbackFallback();
    }
  }

  function loadWeatherWithFallbackFallback() {
    // Final fallback: Kuala Lumpur
    fetchWeatherByCoords(KL_COORDS.lat, KL_COORDS.lon)
      .done(renderWeather)
      .fail(function(err) {
        $("#local-weather").text("Weather unavailable");
        console.error("Weather fetch error:", err);
      });
  }

  // Expose a hook for LocationPermissionManager to push updates immediately after grant
  window.updateWeatherWithLocation = function(locationData) {
    if (!locationData) return loadWeatherWithFallback();
    fetchWeatherByCoords(locationData.latitude, locationData.longitude)
      .done(renderWeather)
      .fail(loadWeatherWithFallback);
  };

  // Initial load + refresh every 10 minutes
  $(document).ready(function() {
    loadWeatherWithFallback();
    setInterval(loadWeatherWithFallback, 600000);
  });
})();
