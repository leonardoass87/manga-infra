// SiteManga Frontend - Configurações
const CONFIG = {
  // API Configuration
  API_BASE_URL: 'http://localhost:4000/api',
  UPLOAD_URL: 'http://localhost:4000/api/upload',
  
  // Timeouts
  REQUEST_TIMEOUT: 10000,
  UPLOAD_TIMEOUT: 300000, // 5 minutos
  
  // Retry Configuration
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  
  // Local Storage Keys
  STORAGE_KEYS: {
    TOKEN: 'sitemanga_token',
    USER: 'sitemanga_user',
    THEME: 'sitemanga_theme',
    SETTINGS: 'sitemanga_settings',
    READING_PROGRESS: 'sitemanga_reading_progress'
  },
  
  // Pagination
  ITEMS_PER_PAGE: 12,
  MAX_PAGES: 10,
  
  // Upload Configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  
  // UI Configuration
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 500,
  
  // Reader Configuration
  READER: {
    ZOOM_LEVELS: [0.5, 0.75, 1, 1.25, 1.5, 2],
    DEFAULT_ZOOM: 1,
    AUTO_SCROLL_SPEED: 50,
    KEYBOARD_SHORTCUTS: {
      NEXT_PAGE: ['ArrowRight', 'Space'],
      PREV_PAGE: ['ArrowLeft'],
      ZOOM_IN: ['+', '='],
      ZOOM_OUT: ['-'],
      FULLSCREEN: ['F11', 'f'],
      BACK_TO_TOP: ['Home', 'h']
    }
  },
  
  // Theme Configuration
  THEMES: {
    LIGHT: {
      name: 'Claro',
      primary: '#dc2626',
      secondary: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#1f2937',
      textSecondary: '#6b7280'
    },
    DARK: {
      name: 'Escuro',
      primary: '#dc2626',
      secondary: '#9ca3af',
      background: '#111827',
      surface: '#1f2937',
      text: '#ffffff',
      textSecondary: '#d1d5db'
    }
  },
  
  // Default Settings
  DEFAULT_SETTINGS: {
    theme: 'dark',
    language: 'pt-BR',
    autoSave: true,
    notifications: true,
    readerMode: 'single',
    showProgress: true
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}


