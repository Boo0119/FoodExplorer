// Show Malaysia local time
function updateTime() {
  $.getJSON("https://timeapi.io/api/Time/current/zone?timeZone=Asia/Kuala_Lumpur", function(data) {
    const date = new Date(data.dateTime);
    const options = { 
      weekday: 'short', 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    $("#local-time").text("🕒 " + date.toLocaleString("en-GB", options));
  });
}
setInterval(updateTime, 60000);
updateTime();

// OpenWeather integration with current location support
(function($){
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
    return $.ajax({
      url: `https://api.openweathermap.org/data/2.5/weather`,
      data: { lat, lon, appid: apiKey, units: "metric" },
      dataType: "json"
    });
  }

  function renderWeather(data) {
    const temp = Math.round(data.main?.temp);
    const condition = data.weather?.[0]?.main || "";
    const icon = weatherIcons[condition] || "🌤️";
    const city = data.name || "";
    const country = data.sys?.country || "";
    const locationLabel = city ? `${city}${country ? ", " + country : ""}` : "";
    const el = $("#local-weather");
    if (el.length) {
      el.text(`${icon} ${isFinite(temp) ? temp + "°C" : ""}${temp && locationLabel ? ", " : ""}${locationLabel}`);
    }
  }

  function loadWeatherWithFallback() {
    const dfd = $.Deferred();

    // Try LocationPermissionManager if available
    if (window.locationManager?.getLocation) {
      window.locationManager.getLocation().then(function(loc) {
        if (loc?.latitude && loc?.longitude) {
          fetchWeatherByCoords(loc.latitude, loc.longitude)
            .done(renderWeather)
            .always(() => dfd.resolve());
        }
      }).catch(() => dfd.reject());
      return dfd.promise();
    }

    // Try browser geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function(position) {
          fetchWeatherByCoords(position.coords.latitude, position.coords.longitude)
            .done(renderWeather)
            .always(() => dfd.resolve());
        },
        function() { dfd.reject(); },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
      );
      return dfd.promise();
    }

    // Fallback to Kuala Lumpur if everything fails
    fetchWeatherByCoords(KL_COORDS.lat, KL_COORDS.lon)
      .done(renderWeather)
      .fail(function(err) {
        $("#local-weather").text("Weather unavailable");
        console.error("Weather fetch error:", err);
      })
      .always(() => dfd.resolve());

    return dfd.promise();
  }

  // Hook for LocationPermissionManager
  window.updateWeatherWithLocation = function(locationData) {
    if (!locationData) return loadWeatherWithFallback();
    fetchWeatherByCoords(locationData.latitude, locationData.longitude)
      .done(renderWeather)
      .fail(loadWeatherWithFallback);
  };

  // Initial load + refresh every 10 minutes
  loadWeatherWithFallback();
  setInterval(loadWeatherWithFallback, 600000);

})(jQuery);
