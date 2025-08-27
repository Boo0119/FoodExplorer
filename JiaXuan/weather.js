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

// Show weather using OpenWeather API
async function loadWeather() {
  const apiKey = "2cfd43855f99e910f0202148f940ef0b";
  const lat = 3.139;   // Kuala Lumpur latitude
  const lon = 101.6869; // Kuala Lumpur longitude

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
    );
    const data = await response.json();
    const temp = Math.round(data.main.temp);
    const condition = data.weather[0].main;       // e.g. "Clouds"
    const description = data.weather[0].description; // e.g. "broken clouds"

    // Weather icon mapping
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

    // Pick icon based on condition
    const icon = weatherIcons[condition] || "🌤️";

    // Display with icon + temp + description
    document.getElementById("local-weather").textContent =
      `${icon} ${temp}°C, ${description}`;
  } catch (err) {
    console.error("Weather fetch error:", err);
    document.getElementById("local-weather").textContent = "Weather unavailable";
  }
}

// Load once
loadWeather();
// Refresh every 10 minutes
setInterval(loadWeather, 600000);