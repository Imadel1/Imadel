// Settings utility to read settings from localStorage
// This allows the admin panel settings to be used throughout the site

export type Theme = 'orange' | 'blue';

export interface Settings {
  theme?: Theme;
  phoneNumber: string;
  orangeMoney: string;
  malitel: string;
  bankMali: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    agency: string;
    swiftCode: string;
  };
  bankInternational: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
  };
}

const DEFAULT_SETTINGS: Settings = {
  theme: 'orange',
  phoneNumber: '+223 20 79 98 40',
  orangeMoney: '+223 71 71 85 85',
  malitel: '+223 66 78 73 85',
  bankMali: {
    bankName: 'Bank of Africa - Mali (BOA)',
    accountName: 'IMADEL',
    accountNumber: '00123456789',
    agency: 'Bamako-Hamdallaye ACI 2000',
    swiftCode: 'BOAMMLBM',
  },
  bankInternational: {
    bankName: 'Ecobank Mali',
    accountName: 'IMADEL International',
    accountNumber: '0987654321',
    iban: 'ML13 0012 3456 7890 1234 5678 901',
    swiftCode: 'ECOMMLBM',
  },
};

export const getSettings = (): Settings => {
  try {
    const raw = localStorage.getItem('imadel_settings');
    if (raw) {
      const saved = JSON.parse(raw);
      // Merge with defaults to ensure all fields exist
      const merged = { ...DEFAULT_SETTINGS, ...saved };
      // Apply theme immediately
      applyTheme(merged.theme || 'orange');
      return merged;
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  applyTheme(DEFAULT_SETTINGS.theme || 'orange');
  return DEFAULT_SETTINGS;
};

// Apply theme to the document
export const applyTheme = (theme: Theme): void => {
  const root = document.documentElement;
  
  if (theme === 'blue') {
    // Blue theme colors
    root.style.setProperty('--primary', '#0066CC');
    root.style.setProperty('--primary-dark', '#0052A3');
    root.style.setProperty('--primary-darker', '#003D7A');
    root.style.setProperty('--primary-light', '#3385D6');
    root.style.setProperty('--primary-lighter', '#66A3E0');
    root.style.setProperty('--primary-alpha', 'rgba(0, 102, 204, 0.1)');
    root.style.setProperty('--primary-alpha-2', 'rgba(0, 102, 204, 0.2)');
    root.style.setProperty('--primary-alpha-3', 'rgba(0, 102, 204, 0.3)');
    root.style.setProperty('--shadow-primary-hover', '0 8px 25px rgba(0, 102, 204, 0.4)');
  } else {
    // Orange theme colors (default)
    root.style.setProperty('--primary', '#FF6B00');
    root.style.setProperty('--primary-dark', '#e55a00');
    root.style.setProperty('--primary-darker', '#cc4f00');
    root.style.setProperty('--primary-light', '#ff8c33');
    root.style.setProperty('--primary-lighter', '#ffb366');
    root.style.setProperty('--primary-alpha', 'rgba(255, 107, 0, 0.1)');
    root.style.setProperty('--primary-alpha-2', 'rgba(255, 107, 0, 0.2)');
    root.style.setProperty('--primary-alpha-3', 'rgba(255, 107, 0, 0.3)');
    root.style.setProperty('--shadow-primary-hover', '0 8px 25px rgba(255, 107, 0, 0.4)');
  }
};

// Listen for settings updates
export const subscribeToSettings = (callback: (settings: Settings) => void): (() => void) => {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'imadel_settings') {
      callback(getSettings());
    }
  };
  
  const handleCustomEvent = () => {
    callback(getSettings());
  };

  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('imadel:settings:updated', handleCustomEvent);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('imadel:settings:updated', handleCustomEvent);
  };
};

