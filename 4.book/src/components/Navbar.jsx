import React from 'react'
import { useTranslation } from 'react-i18next'
import LanguageToggle from './LanguageToggle'

export default function Navbar(){
  const { t } = useTranslation()
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="text-lg font-semibold">SS</div>
          <nav className="hidden md:flex gap-6 items-center">
            <a href="#" className="hover:text-brand">{t('nav.home')}</a>
            <a href="#" className="hover:text-brand">{t('nav.about')}</a>
            <a href="#" className="hover:text-brand">{t('nav.contact')}</a>
            <LanguageToggle />
          </nav>
          <div className="md:hidden">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
