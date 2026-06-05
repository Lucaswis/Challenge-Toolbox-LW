import { useSelector } from 'react-redux'
import en from '../locales/en.json'
import es from '../locales/es.json'

const translations = { en, es }

export function useTranslation () {
  const language = useSelector((state) => state.ui.language)
  return (key) => translations[language]?.[key] ?? key
}
