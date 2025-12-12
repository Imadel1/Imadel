// Removed: language switcher no longer used (site fixed in French)
export default function LanguageSwitcher() {
  return null;
}
import { useTranslation } from '../utils/i18n';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  return (
    <div className="language-switcher">
      <button
        className={`lang-btn ${language === 'fr' ? 'active' : ''}`}
        onClick={() => setLanguage('fr')}
        aria-label="Français"
        title="Français"
      >
        FR
      </button>
      <button
        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
        onClick={() => setLanguage('en')}
        aria-label="English"
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher;

