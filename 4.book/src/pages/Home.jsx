import React from 'react'
import { useTranslation } from 'react-i18next'

export default function Home(){
  const { t } = useTranslation()
  const features = t('features.items', { returnObjects: true })

  return (
    <main>
      <section className="bg-gradient-to-br from-white to-gray-50 py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h1 className="text-3xl sm:text-4xl font-extrabold">{t('hero.title')}</h1>
          <p className="mt-4 text-lg text-gray-600">{t('hero.subtitle')}</p>
          <div className="mt-8 flex justify-center gap-4">
            <a className="px-6 py-3 rounded-md bg-brand text-white font-medium shadow-md" href="#">Get started</a>
            <a className="px-6 py-3 rounded-md border" href="#">Learn more</a>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <article key={i} className="p-6 rounded-xl bg-white shadow-sm">
              <h3 className="font-semibold">{f}</h3>
              <p className="mt-2 text-sm text-gray-500">Description for {f}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
