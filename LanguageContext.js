import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { File, Paths } from 'expo-file-system';

const langFile = new File(Paths.document, 'language.json');

function detectDeviceLocale() {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale;
    return locale.startsWith('ja') ? 'ja' : 'en';
  } catch {
    return 'ja';
  }
}

const LanguageContext = createContext({ lang: 'ja', setLang: () => {}, langReady: false });

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(null); // null = まだ読込中

  useEffect(() => {
    const init = async () => {
      try {
        if (langFile.exists) {
          const saved = JSON.parse(await langFile.text());
          if (saved.lang === 'ja' || saved.lang === 'en') {
            setLangState(saved.lang);
            return;
          }
        }
      } catch {}
      setLangState(detectDeviceLocale());
    };
    init();
  }, []);

  const setLang = useCallback(async (newLang) => {
    setLangState(newLang);
    try {
      langFile.write(JSON.stringify({ lang: newLang }));
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ lang: lang ?? 'ja', setLang, langReady: lang !== null }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
