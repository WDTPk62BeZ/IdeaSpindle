import { useState, useEffect, useRef, useCallback } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

// Metro bundler resolves require() statically — 4ファイルすべてをバンドルに含める
const VERB_JA = require('./verbs.csv');
const NOUN_JA = require('./nouns.csv');
const VERB_EN = require('./verbs_en.csv');
const NOUN_EN = require('./nouns_en.csv');

const parseCSV = (text) =>
  text.trim().split('\n').map((l) => l.trim()).filter(Boolean);

function getPaths(lang) {
  return {
    verbsPath: FileSystem.documentDirectory + `verbs_custom_${lang}.json`,
    nounsPath: FileSystem.documentDirectory + `nouns_custom_${lang}.json`,
  };
}

function getModules(lang) {
  return lang === 'en'
    ? { verbModule: VERB_EN, nounModule: NOUN_EN }
    : { verbModule: VERB_JA, nounModule: NOUN_JA };
}

async function readOrInit(path, assetModule) {
  try {
    const info = await FileSystem.getInfoAsync(path);
    if (info.exists) return JSON.parse(await FileSystem.readAsStringAsync(path));
  } catch {}
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  const words = parseCSV(await FileSystem.readAsStringAsync(asset.localUri));
  await FileSystem.writeAsStringAsync(path, JSON.stringify(words));
  return words;
}

/** lang パラメータで言語別辞書ファイルを切り替えるフック */
export default function useWordListsStorage(lang = 'ja') {
  const [verbs, setVerbsState] = useState([]);
  const [nouns, setNounsState] = useState([]);
  const [loading, setLoading] = useState(true);
  // langRef で最新の lang を callback 内から参照できるようにする
  const langRef = useRef(lang);

  // lang が変わるたびに対応する辞書ファイルをロード
  useEffect(() => {
    langRef.current = lang;
    const { verbsPath, nounsPath } = getPaths(lang);
    const { verbModule, nounModule } = getModules(lang);
    let cancelled = false;

    setLoading(true);
    setVerbsState([]);
    setNounsState([]);

    Promise.all([
      readOrInit(verbsPath, verbModule),
      readOrInit(nounsPath, nounModule),
    ]).then(([v, n]) => {
      if (!cancelled) {
        setVerbsState(v);
        setNounsState(n);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [lang]);

  // サイレントリロード（フォーカス復帰時など）
  const reload = useCallback(async () => {
    const { verbsPath, nounsPath } = getPaths(langRef.current);
    const { verbModule, nounModule } = getModules(langRef.current);
    try {
      const [v, n] = await Promise.all([
        readOrInit(verbsPath, verbModule),
        readOrInit(nounsPath, nounModule),
      ]);
      setVerbsState(v);
      setNounsState(n);
    } catch {}
  }, []);

  const setVerbs = useCallback(async (words) => {
    const { verbsPath } = getPaths(langRef.current);
    setVerbsState(words);
    await FileSystem.writeAsStringAsync(verbsPath, JSON.stringify(words)).catch(() => {});
  }, []);

  const setNouns = useCallback(async (words) => {
    const { nounsPath } = getPaths(langRef.current);
    setNounsState(words);
    await FileSystem.writeAsStringAsync(nounsPath, JSON.stringify(words)).catch(() => {});
  }, []);

  const resetVerbs = useCallback(async () => {
    const { verbsPath } = getPaths(langRef.current);
    const { verbModule } = getModules(langRef.current);
    const asset = Asset.fromModule(verbModule);
    await asset.downloadAsync();
    const words = parseCSV(await FileSystem.readAsStringAsync(asset.localUri));
    await FileSystem.writeAsStringAsync(verbsPath, JSON.stringify(words));
    setVerbsState(words);
  }, []);

  const resetNouns = useCallback(async () => {
    const { nounsPath } = getPaths(langRef.current);
    const { nounModule } = getModules(langRef.current);
    const asset = Asset.fromModule(nounModule);
    await asset.downloadAsync();
    const words = parseCSV(await FileSystem.readAsStringAsync(asset.localUri));
    await FileSystem.writeAsStringAsync(nounsPath, JSON.stringify(words));
    setNounsState(words);
  }, []);

  return { verbs, nouns, loading, reload, setVerbs, setNouns, resetVerbs, resetNouns };
}
