import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import English from './English.json';
import French from './French.json';
import Portuguese from './Portuguese.json'
  
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'English',
  fallbackLng: 'French',
  resources: {
    English: English,
    French: French,
    Portuguese:Portuguese
  },
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});
  
export default i18n;