'use client'

import i18next from 'i18next'
import { initReactI18next, useTranslation as useTranslationOrg } from 'react-i18next'
import { useCookies } from 'react-cookie'
import resourcesToBackend from 'i18next-resources-to-backend'
import LanguageDetector from 'i18next-browser-languagedetector'
import { getOptions, languages, cookieName } from './settings'

const runsOnServerSide = typeof window === 'undefined'

// 
i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: string, namespace: string) => import(`../../public/locales/${language}/${namespace}.json`)))
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: runsOnServerSide ? languages : []
  })

export function useTranslation(lng: string, ns: string, options: any = {}) {
  const [cookies, setCookie] = useCookies([cookieName])
  const ret = useTranslationOrg(ns, options)
  const { i18n } = ret
  if (runsOnServerSide && lng && i18n.resolvedLanguage !== lng) {
    i18n.changeLanguage(lng)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeLng, setActiveLng] = i18next.language === undefined ? [undefined, undefined] : [i18next.language, i18next.changeLanguage]
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (activeLng === i18next.language) return ret
    // eslint-disable-next-line react-hooks/rules-of-hooks
    if (activeLng !== lng) {
        // @ts-ignore
        setActiveLng(lng)
    }
  }
  return ret
}
