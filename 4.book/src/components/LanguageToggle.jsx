import React from 'react'
import { useTranslation } from 'react-i18next'

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const toggle = () => i18n.changeLanguage(i18n.language === 'en' ? 'te' : 'en')

  return (
    <button
      onClick={toggle}
      className="px-3 py-1 rounded-md border hover:shadow focus:outline-none focus:ring"
      aria-label="Toggle language"
    >
      {i18n.language === 'en' ? 'తెలుగు' : 'English'}
    </button>
  )
}
