// OpenWeather API Key (Replace with your own API key)
const apiKey = '6809b68c82301a21a1be45f20b0575f2';
const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';
const defaultLocation = 'Kampar,MY'; // Default location

// Weather condition to emoji fallback mapping
const weatherIconMap = {
  '01d': '☀️', '01n': '🌙', // Clear sky
  '02d': '🌤️', '02n': '☁️', // Few clouds
  '03d': '☁️', '03n': '☁️', // Scattered clouds
  '04d': '☁️', '04n': '☁️', // Broken clouds
  '09d': '🌦️', '09n': '🌧️', // Shower rain
  '10d': '🌦️', '10n': '🌧️', // Rain
  '11d': '⛈️', '11n': '⛈️', // Thunderstorm
  '13d': '🌨️', '13n': '🌨️', // Snow
  '50d': '🌫️', '50n': '🌫️', // Mist/Fog
};

// Run a callback when DOM is ready, even if this script loads after DOMContentLoaded
function onReady(callback) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

// Update weather icon (centralized handling)
function updateWeatherIcon(iconCode, description) {
  const iconElement = document.getElementById('weather-icon');
  if (!iconElement) return;

  const openWeatherIconUrl = `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

  // Try OpenWeather icon
  iconElement.src = openWeatherIconUrl;
  iconElement.alt = description;

  // Fallback if image fails
  iconElement.onerror = function () {
    const fallbackIcon = weatherIconMap[iconCode] || '🌤️';
    this.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 100 100">
        <text y="50%" x="50%" text-anchor="middle" dominant-baseline="central" 
        font-size="60">${fallbackIcon}</text>
      </svg>`;
    this.alt = description;
  };
}

// Fetch weather
async function fetchWeather() {
  try {
    const response = await fetch(`${apiUrl}?q=${defaultLocation}&appid=${apiKey}&units=metric`);
    if (!response.ok) throw new Error('Failed to fetch weather data');

    const data = await response.json();

    // Update UI
    const locationElement = document.getElementById('weather-location');
    const tempElement = document.getElementById('weather-temp');

    if (locationElement) locationElement.textContent = data.name;
    if (tempElement) tempElement.textContent = `${Math.round(data.main.temp)}°C`;

    updateWeatherIcon(data.weather[0].icon, data.weather[0].description);

    console.log('Weather loaded:', {
      location: data.name,
      temperature: data.main.temp,
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);

    const locationElement = document.getElementById('weather-location');
    const tempElement = document.getElementById('weather-temp');
    const iconElement = document.getElementById('weather-icon');

    if (locationElement) locationElement.textContent = 'Weather Unavailable';
    if (tempElement) tempElement.textContent = '';
    if (iconElement) {
      iconElement.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 100 100">
          <text y="50%" x="50%" text-anchor="middle" dominant-baseline="central" 
          font-size="60">🌤️</text>
        </svg>`;
      iconElement.alt = 'Weather data unavailable';
    }
  }
}

// Retry mechanism
async function fetchWeatherWithRetry(maxRetries = 3) {
  let attempts = 0;
  while (attempts < maxRetries) {
    try {
      await fetchWeather();
      return;
    } catch (error) {
      attempts++;
      console.warn(`Weather fetch attempt ${attempts} failed:`, error);
      if (attempts < maxRetries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempts)));
      }
    }
  }
  console.error('All weather fetch attempts failed');
}

// Local Storage utilities
const LocalStorage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Could not save to localStorage:', e);
    }
  },
  get(key, defaultValue) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Could not read from localStorage:', e);
      return defaultValue;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Could not remove from localStorage:', e);
    }
  }
};

// Session Storage utilities
const SessionStorage = {
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn('Could not save to sessionStorage:', e);
    }
  },
  get(key, defaultValue) {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.warn('Could not read from sessionStorage:', e);
      return defaultValue;
    }
  }
};

// FIXED: Get state ID more reliably
function getStateId() {
  // Try multiple methods to get state ID
  const bodyState = document.body?.getAttribute('data-state');
  const pathName = window.location.pathname.split('/').pop().replace(/\.html$/i, '');
  const titleState = document.title.toLowerCase().split(' ')[0];
  
  return bodyState || pathName || titleState || 'global';
}

// Favorites management
const stateId = getStateId();
const FAVORITES_KEY = `${stateId}-favorites`;
let favorites = LocalStorage.get(FAVORITES_KEY, []);
let searchHistory = SessionStorage.get('search-history', []);

// Smooth scrolling for anchor links
onReady(function () {
  const links = document.querySelectorAll("a[href^='#']");

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault(); // Prevent default behavior
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  // Initialize favorites display
  updateFavoritesCount();
  updateFavoriteButtons();

  // Initialize search functionality
  initializeSearch();

  // Initialize sort functionality
  initializeSortButtons();

  // Initialize user session
  initializeUserSession();

  // Fetch weather data with retry mechanism
  fetchWeatherWithRetry();

  // Refresh weather every 10 minutes
  setInterval(fetchWeatherWithRetry, 600000);
});

// User session management
function initializeUserSession() {
  const visitCount = LocalStorage.get('visit-count', 0) + 1;
  LocalStorage.set('visit-count', visitCount);

  const lastVisit = LocalStorage.get('last-visit', null);
  LocalStorage.set('last-visit', new Date().toISOString());

  // Session tracking
  SessionStorage.set('session-start', Date.now());
  SessionStorage.set('page-url', window.location.href);
}

// FIXED: Search functionality with better error handling
function initializeSearch() {
  const searchInput = document.getElementById('search-input');
  const clearButton = document.getElementById('clear-search');
  const searchResults = document.getElementById('search-results');

  if (!searchInput) {
    console.warn('Search input not found');
    return;
  }

  let searchTimeout;

  searchInput.addEventListener('input', function () {
    clearTimeout(searchTimeout);
    const query = this.value.trim();

    if (query) {
      if (clearButton) clearButton.style.display = 'block';
      searchTimeout = setTimeout(() => {
        performSearch(query);
        addToSearchHistory(query);
      }, 300);
    } else {
      if (clearButton) clearButton.style.display = 'none';
      clearSearch();
    }
  });

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      if (searchInput) {
        searchInput.value = '';
        this.style.display = 'none';
        clearSearch();
        searchInput.focus();
      }
    });
  }
}

function performSearch(query) {
  const foodSections = document.querySelectorAll('.food-section');
  const searchResults = document.getElementById('search-results');
  let matchCount = 0;

  if (foodSections.length === 0) {
    console.warn('No food sections found for search');
    return;
  }

  foodSections.forEach(section => {
    const name = section.getAttribute('data-name') || '';
    const ingredients = section.getAttribute('data-ingredients') || '';
    const description = section.querySelector('.food-details p')?.textContent || '';

    const searchText = `${name} ${ingredients} ${description}`.toLowerCase();
    const isMatch = searchText.includes(query.toLowerCase());

    if (isMatch) {
      // Use current computed display if possible; fallback to grid
      const current = getComputedStyle(section).display;
      section.style.display = current === 'none' ? 'grid' : current;
      section.classList.remove('fade-out');
      matchCount++;
    } else {
      section.style.display = 'none';
    }
  });

  if (searchResults) {
    searchResults.style.display = 'block';
    searchResults.textContent = `Found ${matchCount} result${matchCount !== 1 ? 's' : ''} for "${query}"`;
  }

  console.log(`Search for "${query}" found ${matchCount} results`);
}

function clearSearch() {
  const foodSections = document.querySelectorAll('.food-section');
  const searchResults = document.getElementById('search-results');

  foodSections.forEach(section => {
    const current = section.dataset.originalDisplay || getComputedStyle(section).display || 'grid';
    section.style.display = current === 'none' ? 'grid' : current;
    section.classList.remove('fade-out');
  });

  if (searchResults) {
    searchResults.style.display = 'none';
  }

  console.log('Search cleared');
}

function addToSearchHistory(query) {
  if (!query || searchHistory.includes(query)) return;

  searchHistory.unshift(query);
  if (searchHistory.length > 10) {
    searchHistory = searchHistory.slice(0, 10);
  }
  SessionStorage.set('search-history', searchHistory);
}

// FIXED: Sort functionality with proper initialization
let originalOrder = [];
let currentSortType = null;

function initializeSortButtons() {
  // Store original order
  const container = document.getElementById('food-container');
  if (container) {
    const sections = Array.from(container.children);
    originalOrder = sections.map(section => ({
      element: section,
      name: section.getAttribute('data-name') || section.id || ''
    }));
    console.log('Original order stored:', originalOrder.length, 'items');
  }

  // Add event listeners to sort buttons
  const sortButtons = document.querySelectorAll('.sort-btn');
  sortButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      e.preventDefault();
      const buttonText = this.textContent.trim();
      
      if (buttonText === 'A-Z') {
        sortFoodItems('asc');
      } else if (buttonText === 'Z-A') {
        sortFoodItems('desc');
      } else if (buttonText.includes('Original')) {
        resetOrder();
      }
    });
  });

  // Load saved sort preference
  const savedSort = LocalStorage.get('sort-preference', null);
  if (savedSort) {
    setTimeout(() => {
      sortFoodItems(savedSort);
    }, 100);
  }
}

function sortFoodItems(sortType) {
  const container = document.getElementById('food-container');
  if (!container) {
    console.error('Food container not found');
    return;
  }

  const sections = Array.from(container.children);
  
  if (sections.length === 0) {
    console.warn('No food sections found to sort');
    return;
  }

  // Add fade out effect
  sections.forEach(section => {
    section.classList.add('fade-out');
  });

  setTimeout(() => {
    // Sort sections based on data-name attribute
    sections.sort((a, b) => {
      const nameA = (a.getAttribute('data-name') || a.id || '').toLowerCase();
      const nameB = (b.getAttribute('data-name') || b.id || '').toLowerCase();

      if (sortType === 'asc') {
        return nameA.localeCompare(nameB);
      } else if (sortType === 'desc') {
        return nameB.localeCompare(nameA);
      }
      return 0;
    });

    // Clear container and re-append in sorted order
    const frag = document.createDocumentFragment();
    sections.forEach(section => frag.appendChild(section));
    container.innerHTML = '';
    container.appendChild(frag);

    // Remove fade out effect
    setTimeout(() => {
      sections.forEach(section => {
        section.classList.remove('fade-out');
      });
    }, 50);

    // Update button states
    updateButtonStates(sortType);
    currentSortType = sortType;

    // Save sort preference
    LocalStorage.set('sort-preference', sortType);

    // Re-initialize slideshows after DOM changes
    reinitializeSlideshows();

    console.log(`Sorted ${sections.length} items by ${sortType}`);

  }, 300);
}

function resetOrder() {
  const container = document.getElementById('food-container');
  if (!container || originalOrder.length === 0) {
    console.error('Cannot reset order: container or original order not found');
    return;
  }

  const sections = Array.from(container.children);

  // Add fade out effect
  sections.forEach(section => {
    section.classList.add('fade-out');
  });

  setTimeout(() => {
    // Clear container and restore original order
    const frag = document.createDocumentFragment();
    originalOrder.forEach(item => {
      if (item.element) frag.appendChild(item.element);
    });
    container.innerHTML = '';
    container.appendChild(frag);

    // Remove fade out effect
    setTimeout(() => {
      originalOrder.forEach(item => {
        if (item.element) {
          item.element.classList.remove('fade-out');
        }
      });
    }, 50);

    // Update button states
    updateButtonStates(null);
    currentSortType = null;

    LocalStorage.remove('sort-preference');

    // Re-initialize slideshows after DOM changes
    reinitializeSlideshows();

    console.log('Order reset to original');

  }, 300);
}

function updateButtonStates(activeSort) {
  const buttons = document.querySelectorAll('.sort-btn');
  buttons.forEach(btn => {
    btn.classList.remove('active');
  });

  buttons.forEach(btn => {
    const buttonText = btn.textContent.trim();
    if ((activeSort === 'asc' && buttonText === 'A-Z') ||
        (activeSort === 'desc' && buttonText === 'Z-A')) {
      btn.classList.add('active');
    }
  });
}

// FIXED: Favorites functionality with better error handling
function getFoodIdFromButton(btn, explicitId) {
  if (explicitId) return explicitId;
  const section = btn?.closest?.('.food-section');
  return section?.id || null;
}

function toggleFavorite(foodId) {
  // Support being called via inline onclick or event listener on the button
  if (this instanceof HTMLElement && !foodId) {
    foodId = getFoodIdFromButton(this, this.getAttribute('data-food-id'));
  }
  if (!foodId) {
    console.error('No food ID provided');
    return;
  }

  const index = favorites.indexOf(foodId);

  if (index > -1) {
    favorites.splice(index, 1);
    showToast('Removed from favorites', 'info');
  } else {
    favorites.push(foodId);
    showToast('Added to favorites!', 'success');
  }

  LocalStorage.set(FAVORITES_KEY, favorites);
  updateFavoritesCount();
  updateFavoriteButtons();
  
  console.log(`Toggled favorite for ${foodId}. Current favorites:`, favorites);
}

function updateFavoritesCount() {
  const countElement = document.getElementById('favorites-count');
  if (countElement) {
    countElement.textContent = favorites.length;
  }
}

function updateFavoriteButtons() {
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  favoriteButtons.forEach(btn => {
    const foodId = btn.getAttribute('data-food-id') || getFoodIdFromButton(btn);
    const heart = btn.querySelector('.heart');

    if (!foodId || !heart) return;

    if (favorites.includes(foodId)) {
      heart.textContent = '❤️';
      btn.classList.add('active');
    } else {
      heart.textContent = '🤍';
      btn.classList.remove('active');
    }
  });
}

// FIXED: Favorites panel toggle with proper functionality
function toggleFavoritesPanel() {
  if (favorites.length === 0) {
    showToast('No favorites yet! Add some delicious foods to your list.', 'info');
    return;
  }

  const foodSections = document.querySelectorAll('.food-section');
  const showingFavorites = document.body.classList.contains('showing-favorites');
  const favoritesBtn = document.getElementById('favorites-btn');

  if (showingFavorites) {
    // Show all foods
    foodSections.forEach(section => {
      section.style.display = 'grid';
    });
    document.body.classList.remove('showing-favorites');
    if (favoritesBtn) {
      favoritesBtn.querySelector('span:nth-child(2)').textContent = 'My Favorites';
    }
    showToast('Showing all foods', 'info');
  } else {
    // Show only favorites
    let visibleCount = 0;
    foodSections.forEach(section => {
      const foodId = section.id;
      if (favorites.includes(foodId)) {
        section.style.display = 'grid';
        visibleCount++;
      } else {
        section.style.display = 'none';
      }
    });
    document.body.classList.add('showing-favorites');
    if (favoritesBtn) {
      favoritesBtn.querySelector('span:nth-child(2)').textContent = 'Show All';
    }
    showToast(`Showing ${visibleCount} favorite${visibleCount !== 1 ? 's' : ''}`, 'info');
  }
}

// Slideshow functionality for individual food items
const slideshows = {};

function initializeSlideshow(slideshowId) {
  const slideshowElement = document.querySelector(`[data-slideshow="${slideshowId}"]`);
  if (!slideshowElement) return;

  const slides = slideshowElement.querySelectorAll('.slides img');
  const dots = slideshowElement.querySelectorAll('.dot');
  let currentIndex = 0;
  let autoSlideInterval;

  slideshows[slideshowId] = {
    currentIndex: 0,
    slides: slides,
    dots: dots,

    showSlide(index) {
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

      this.currentIndex = currentIndex;
    },

    nextSlide() {
      this.showSlide(this.currentIndex + 1);
    },

    prevSlide() {
      this.showSlide(this.currentIndex - 1);
    },

    goToSlide(index) {
      this.showSlide(index - 1);
    }
  };

  // Initialize first slide
  slideshows[slideshowId].showSlide(0);

  // Auto-advance slides every 5 seconds
  autoSlideInterval = setInterval(() => {
    slideshows[slideshowId].nextSlide();
  }, 5000);

  // Pause auto-advance on hover
  slideshowElement.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
  });

  slideshowElement.addEventListener('mouseleave', () => {
    autoSlideInterval = setInterval(() => {
      slideshows[slideshowId].nextSlide();
    }, 5000);
  });
}

function changeSlideshow(slideshowId, direction) {
  if (slideshows[slideshowId]) {
    if (direction === 1) {
      slideshows[slideshowId].nextSlide();
    } else {
      slideshows[slideshowId].prevSlide();
    }
  }
}

function currentSlideshow(slideshowId, slideNumber) {
  if (slideshows[slideshowId]) {
    slideshows[slideshowId].goToSlide(slideNumber);
  }
}

function reinitializeSlideshows() {
  // Clear existing slideshow data
  Object.keys(slideshows).forEach(key => {
    delete slideshows[key];
  });

  // Re-initialize all slideshows
  const slideshowElements = document.querySelectorAll('[data-slideshow]');
  slideshowElements.forEach(element => {
    const slideshowId = element.getAttribute('data-slideshow');
    initializeSlideshow(slideshowId);
  });
}

// Initialize all slideshows when page loads
onReady(function () {
  reinitializeSlideshows();

  // Initialize favorites button event listener
  const favoritesBtn = document.getElementById('favorites-btn');
  if (favoritesBtn) {
    favoritesBtn.addEventListener('click', function(e) {
      e.preventDefault();
      toggleFavoritesPanel();
    });
  }

  // Also attach click handlers to any favorite buttons (in case inline onclick missing)
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      e.preventDefault();
      toggleFavorite.call(this);
    });
  });
  
  // EXTRA: Event delegation fallback to ensure clicks are always captured
  document.addEventListener('click', function(e){
    const btn = e.target?.closest?.('.favorite-btn');
    if (!btn) return;
    e.preventDefault();
    const explicitId = btn.getAttribute('data-food-id');
    // Use call to bind 'this' as the button for getFoodIdFromButton
    try {
      toggleFavorite.call(btn, explicitId);
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  });
});

// Image modal functionality
let currentModal = null;

function openImageModal(imageSrc, imageAlt) {
  // Create modal if it doesn't exist
  if (!currentModal) {
    currentModal = document.createElement('div');
    currentModal.className = 'image-modal';
    currentModal.innerHTML = `
      <span class="modal-close" onclick="closeImageModal()">&times;</span>
      <img id="modal-image" src="" alt="">
      <div class="modal-caption"></div>
    `;
    document.body.appendChild(currentModal);

    // Close modal when clicking outside image
    currentModal.addEventListener('click', function (e) {
      if (e.target === currentModal) {
        closeImageModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && currentModal.classList.contains('active')) {
        closeImageModal();
      }
    });
  }

  // Set image and caption
  const modalImage = currentModal.querySelector('#modal-image');
  const modalCaption = currentModal.querySelector('.modal-caption');

  modalImage.src = imageSrc;
  modalImage.alt = imageAlt;
  modalCaption.textContent = imageAlt;

  // Show modal
  currentModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeImageModal() {
  if (currentModal) {
    currentModal.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <button onclick="this.parentElement.remove()" style="background: none; border: none; color: inherit; margin-left: 10px; cursor: pointer;">&times;</button>
  `;

  // Add toast styles if not already present
  if (!document.getElementById('toast-styles')) {
    const styles = document.createElement('style');
    styles.id = 'toast-styles';
    styles.textContent = `
      .toast {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 5px;
        z-index: 1000;
        display: flex;
        align-items: center;
        margin-bottom: 10px;
        animation: slideInRight 0.3s ease;
      }
      .toast-success { background: #27ae60; }
      .toast-error { background: #e74c3c; }
      .toast-warning { background: #f39c12; }
      .toast-info { background: #3498db; }
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(toast);

  // Auto-remove toast
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, duration);
}

// Ensure inline HTML onclick handlers can find these functions
// This is safe in non-module scripts and helps if scope isolation occurs
try {
  window.sortFoodItems = sortFoodItems;
  window.resetOrder = resetOrder;
  window.toggleFavorite = toggleFavorite;
  window.changeSlideshow = changeSlideshow;
  window.currentSlideshow = currentSlideshow;
  window.openImageModal = openImageModal;
  window.closeImageModal = closeImageModal;
  window.initializeSearch = initializeSearch;
  window.reinitializeSlideshows = reinitializeSlideshows;
} catch (_) { /* ignore if window is unavailable */ }