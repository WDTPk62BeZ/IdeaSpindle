import { useState, useEffect, useRef, useCallback } from 'react';
import { File, Paths } from 'expo-file-system';

/**
 * useState と同じインターフェースで、値を expo-file-system に永続化するフック。
 * @param {string} filename  Paths.document 以下のファイル名（例: 'slideshow_timeLimit.json'）
 * @param {*} defaultValue   ファイルが存在しない場合のデフォルト値
 */
export default function usePersistedState(filename, defaultValue) {
  const [value, setValue] = useState(defaultValue);
  const valueRef = useRef(defaultValue);

  useEffect(() => {
    const file = new File(Paths.document, filename);
    if (!file.exists) return;
    file.text().then((text) => {
      try {
        const parsed = JSON.parse(text);
        valueRef.current = parsed;
        setValue(parsed);
      } catch {}
    }).catch(() => {});
  }, [filename]);

  const setPersistedValue = useCallback((newValue) => {
    const resolved = typeof newValue === 'function' ? newValue(valueRef.current) : newValue;
    valueRef.current = resolved;
    setValue(resolved);
    try {
      new File(Paths.document, filename).write(JSON.stringify(resolved));
    } catch {}
  }, [filename]);

  return [value, setPersistedValue];
}
