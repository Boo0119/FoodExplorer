// Global location permission management
class LocationPermissionManager {
  constructor() {
    this.hasPermission = false;
    this.isRequesting = false;
    this.locationData = null;
    this.listeners = [];
    this.init();
  }

  init() {
    // Check if we already have permission stored
    const storedPermission = localStorage.getItem('location-permission');
    if (storedPermission === 'granted') {
      this.hasPermission = true;
      // Was calling a non-existent method; use getLocation() to fetch fresh data
      this.getLocation();
    }
  }

  // Request location permission once
  async requestPermission() {
    if (this.isRequesting) {
      return new Promise((resolve) => {
        this.listeners.push(resolve);
      });
    }

    if (this.hasPermission) {
      return this.locationData;
    }

    this.isRequesting = true;

    try {
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser.');
      }

      // Request permission and get location
      const position = await this.getCurrentPosition();
      this.hasPermission = true;
      this.locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: Date.now()
      };

      // Store permission in localStorage
      localStorage.setItem('location-permission', 'granted');
      localStorage.setItem('location-data', JSON.stringify(this.locationData));

      // Notify all waiting listeners
      this.listeners.forEach(resolve => resolve(this.locationData));
      this.listeners = [];
      this.isRequesting = false;

      return this.locationData;
    } catch (error) {
      console.error('Location permission denied or error:', error);
      this.hasPermission = false;
      localStorage.setItem('location-permission', 'denied');
      
      // Notify all waiting listeners with error
      this.listeners.forEach(resolve => resolve(null));
      this.listeners = [];
      this.isRequesting = false;
      
      throw error;
    }
  }

  // Get current position with promise wrapper
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      });
    });
  }

  // Get stored location data
  getStoredLocation() {
    if (this.locationData) {
      return this.locationData;
    }

    const stored = localStorage.getItem('location-data');
    if (stored) {
      this.locationData = JSON.parse(stored);
      return this.locationData;
    }

    return null;
  }

  // Check if we have valid location data (not older than 1 hour)
  hasValidLocation() {
    const location = this.getStoredLocation();
    if (!location) return false;

    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
    return (Date.now() - location.timestamp) < oneHour;
  }

  // Clear stored permission (for testing or user preference change)
  clearPermission() {
    this.hasPermission = false;
    this.locationData = null;
    localStorage.removeItem('location-permission');
    localStorage.removeItem('location-data');
  }

  // Get location data - either from cache or request new permission
  async getLocation() {
    // If we have valid cached location, use it
    if (this.hasValidLocation()) {
      return this.getStoredLocation();
    }

    // If we have permission but need fresh data
    if (this.hasPermission) {
      try {
        const position = await this.getCurrentPosition();
        this.locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: Date.now()
        };
        localStorage.setItem('location-data', JSON.stringify(this.locationData));
        return this.locationData;
      } catch (error) {
        console.error('Error getting fresh location:', error);
        // Fall back to stored data if available
        return this.getStoredLocation();
      }
    }

    // Request permission for the first time
    return this.requestPermission();
  }
}

// Create global instance
window.locationManager = new LocationPermissionManager();

// Function to show location permission prompt
function showLocationPrompt() {
  const prompt = document.createElement('div');
  prompt.id = 'location-prompt';
  prompt.innerHTML = `
    <div class="location-prompt-overlay">
      <div class="location-prompt-content">
        <div class="location-prompt-icon">📍</div>
        <h3>Enable Location Services</h3>
        <p>We'd like to show you weather information for your current location. This helps provide a better experience across all pages.</p>
        <div class="location-prompt-buttons">
          <button class="btn btn-primary" onclick="enableLocation()">Enable Location</button>
          <button class="btn btn-secondary" onclick="dismissLocationPrompt()">Not Now</button>
        </div>
      </div>
    </div>
  `;

  // Add styles
  const styles = document.createElement('style');
  styles.textContent = `
    .location-prompt-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }
    
    .location-prompt-content {
      background: white;
      padding: 30px;
      border-radius: 12px;
      max-width: 400px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s ease;
    }
    
    .location-prompt-icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
    
    .location-prompt-content h3 {
      margin-bottom: 15px;
      color: #333;
    }
    
    .location-prompt-content p {
      margin-bottom: 25px;
      color: #666;
      line-height: 1.5;
    }
    
    .location-prompt-buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    
    .location-prompt-buttons .btn {
      padding: 10px 20px;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s ease;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
    }
    
    .btn-primary:hover {
      background: #0056b3;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover {
      background: #545b62;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    @media (max-width: 480px) {
      .location-prompt-content {
        margin: 20px;
        padding: 20px;
      }
      
      .location-prompt-buttons {
        flex-direction: column;
      }
    }
  `;
  document.head.appendChild(styles);

  document.body.appendChild(prompt);
}

// Function to enable location
async function enableLocation() {
  try {
    const locationData = await window.locationManager.requestPermission();
    if (locationData) {
      // Trigger weather update on all pages
      if (typeof updateWeatherWithLocation === 'function') {
        updateWeatherWithLocation(locationData);
      }
    }
  } catch (error) {
    console.error('Failed to enable location:', error);
  } finally {
    dismissLocationPrompt();
  }
}

// Function to dismiss location prompt
function dismissLocationPrompt() {
  const prompt = document.getElementById('location-prompt');
  if (prompt) {
    prompt.remove();
  }
  localStorage.setItem('location-permission', 'dismissed');
}

// Check if we should show the location prompt
function checkLocationPermission() {
  const permission = localStorage.getItem('location-permission');
  
  // If permission hasn't been requested yet, show prompt
  if (!permission) {
    // Wait a bit for the page to load, then show prompt
    setTimeout(() => {
      showLocationPrompt();
    }, 2000);
  }
}

// Initialize location permission check when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  checkLocationPermission();
});

