// OpenWeather API Key for current location weather (scoped to avoid globals)
const STATE_WEATHER_API_KEY = '6809b68c82301a21a1be45f20b0575f2';
const STATE_WEATHER_API_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Get user's current location and fetch weather using centralized permission system
async function getCurrentLocationWeather() {
  const widget = document.querySelector('.weather-widget');
  if (widget) widget.classList.add('loading');
  
  try {
    // Use the centralized location manager
    const locationData = await window.locationManager.getLocation();
    
    if (!locationData) {
      throw new Error('Location permission not granted');
    }
    
    console.log(`📍 User location: ${locationData.latitude}, ${locationData.longitude}`);
    
    // Fetch weather by coordinates
    const weatherUrl = `${STATE_WEATHER_API_URL}?lat=${locationData.latitude}&lon=${locationData.longitude}&appid=${STATE_WEATHER_API_KEY}&units=metric`;
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch weather data: ${response.status}`);
    }

    const data = await response.json();
    console.log('Weather API Response:', data);

    // Update UI
    const locationElement = document.getElementById('weather-location');
    const tempElement = document.getElementById('weather-temp');

    if (locationElement) locationElement.textContent = data.name;
    if (tempElement) tempElement.textContent = `${Math.round(data.main.temp)}°C`;

    // Update weather icon
    const iconElement = document.getElementById('weather-icon');
    if (iconElement) {
      iconElement.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      iconElement.alt = data.weather[0].description;
    }

    if (widget) widget.classList.remove('loading', 'error');
  } catch (error) {
    console.error('❌ Error fetching current location weather:', error);

    const locationElement = document.getElementById('weather-location');
    if (locationElement) {
      locationElement.textContent = 'Location Weather Unavailable';
    }
    
    if (widget) {
      widget.classList.remove('loading');
      widget.classList.add('error');
    }
  }
}

// Function to update weather with location data (called from location permission system)
function updateWeatherWithLocation(locationData) {
  if (locationData) {
    getCurrentLocationWeather();
  }
}

// Back to top button functionality
function createBackToTopButton() {
  const backToTopBtn = document.createElement('button');
  backToTopBtn.id = 'back-to-top';
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopBtn.title = 'Back to Top';
  backToTopBtn.className = 'back-to-top-btn';
  
  // Add styles for the button
  const styles = document.createElement('style');
  styles.textContent = `
    .back-to-top-btn {
      position: fixed;
      bottom: 30px;
      right: 30px;
      width: 50px;
      height: 50px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
      transition: all 0.3s ease;
      z-index: 1000;
      opacity: 0;
      visibility: hidden;
      transform: translateY(20px);
    }
    
    .back-to-top-btn:hover {
      background: #0056b3;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(0, 123, 255, 0.4);
    }
    
    .back-to-top-btn.show {
      opacity: 1;
      visibility: visible;
      transform: translateY(0);
    }
    
    .back-to-top-btn:active {
      transform: translateY(0) scale(0.95);
    }
    
    @media (max-width: 768px) {
      .back-to-top-btn {
        bottom: 20px;
        right: 20px;
        width: 45px;
        height: 45px;
        font-size: 16px;
      }
    }
  `;
  document.head.appendChild(styles);
  
  // Add click event
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  document.body.appendChild(backToTopBtn);
  
  // Show/hide button based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });
}

// Initialize all slideshows
document.querySelectorAll('.slides').forEach((slideContainer, containerIndex) => {
    let currentIndex = 0;
    const slides = slideContainer.querySelectorAll('img');
    const dots = slideContainer.parentElement.querySelectorAll('.dot');

    function showSlide(index) {
        if (index >= slides.length) {
            currentIndex = 0;
        } else if (index < 0) {
            currentIndex = slides.length - 1;
        } else {
            currentIndex = index;
        }

        slides.forEach((slide, i) => {
            slide.classList.remove('active');
            if (dots[i]) dots[i].classList.remove('active');
        });

        slides[currentIndex].classList.add('active');
        if (dots[currentIndex]) dots[currentIndex].classList.add('active');
    }

    function changeSlide(step) {
        showSlide(currentIndex + step);
        resetAutoSlide();
    }

    function currentSlide(index) {
        showSlide(index - 1);
        resetAutoSlide();
    }

    // Auto-slide every 5 seconds
    let slideInterval = setInterval(() => {
        changeSlide(1);
    }, 5000);

    function resetAutoSlide() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => {
            changeSlide(1);
        }, 5000);
    }

    // Hook up prev/next buttons (if inside this card)
    const prevBtn = slideContainer.parentElement.querySelector('.prev');
    const nextBtn = slideContainer.parentElement.querySelector('.next');

    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

    // Hook up dots
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => currentSlide(i + 1));
    });

    // Initialize
    showSlide(currentIndex);
});

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing state.html page...');
  
  // Create back to top button
  createBackToTopButton();
  
  // Get current location weather
  getCurrentLocationWeather();
  
  // Refresh weather every 10 minutes
  setInterval(getCurrentLocationWeather, 600000);
  
  // Update year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
});