import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enJson from './en.json';
import ruJson from './ru.json';
import ukJson from './uk.json';

const resources = {
  en: {
    translation: enJson,
  },
  ru: {
    translation: ruJson,
  },
  uk: {
    translation: ukJson,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'uk',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
