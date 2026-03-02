import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as FileSystem from 'expo-file-system/legacy';

const LANG_FILE = FileSystem.documentDirectory + 'language.json';

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
        const info = await FileSystem.getInfoAsync(LANG_FILE);
        if (info.exists) {
          const saved = JSON.parse(await FileSystem.readAsStringAsync(LANG_FILE));
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
      await FileSystem.writeAsStringAsync(LANG_FILE, JSON.stringify({ lang: newLang }));
    } catch {}
  }, []);

  return (
    <LanguageContext.Provider value={{ lang: lang ?? 'ja', setLang, langReady: lang !== null }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
