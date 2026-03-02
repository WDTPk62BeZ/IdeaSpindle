import { useState, useEffect, useRef, useCallback } from 'react';
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';

// Metro bundler resolves require() statically — 4ファイルすべてをバンドルに含める
const VERB_JA = require('./verbs.csv');
const NOUN_JA = require('./nouns.csv');
const VERB_EN = require('./verbs_en.csv');
const NOUN_EN = require('./nouns_en.csv');

const parseCSV = (text) =>
  text.trim().split('\n').map((l) => l.trim()).filter(Boolean);

function getFiles(lang) {
  return {
    verbsFile: new File(Paths.document, `verbs_custom_${lang}.json`),
    nounsFile: new File(Paths.document, `nouns_custom_${lang}.json`),
  };
}

function getModules(lang) {
  return lang === 'en'
    ? { verbModule: VERB_EN, nounModule: NOUN_EN }
    : { verbModule: VERB_JA, nounModule: NOUN_JA };
}

async function readOrInit(file, assetModule) {
  try {
    if (file.exists) return JSON.parse(await file.text());
  } catch {}
  const asset = Asset.fromModule(assetModule);
  await asset.downloadAsync();
  const words = parseCSV(await new File(asset.localUri).text());
  file.write(JSON.stringify(words));
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
    const { verbsFile, nounsFile } = getFiles(lang);
    const { verbModule, nounModule } = getModules(lang);
    let cancelled = false;

    setLoading(true);
    setVerbsState([]);
    setNounsState([]);

    Promise.all([
      readOrInit(verbsFile, verbModule),
      readOrInit(nounsFile, nounModule),
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
    const { verbsFile, nounsFile } = getFiles(langRef.current);
    const { verbModule, nounModule } = getModules(langRef.current);
    try {
      const [v, n] = await Promise.all([
        readOrInit(verbsFile, verbModule),
        readOrInit(nounsFile, nounModule),
      ]);
      setVerbsState(v);
      setNounsState(n);
    } catch {}
  }, []);

  const setVerbs = useCallback(async (words) => {
    const { verbsFile } = getFiles(langRef.current);
    setVerbsState(words);
    try { verbsFile.write(JSON.stringify(words)); } catch {}
  }, []);

  const setNouns = useCallback(async (words) => {
    const { nounsFile } = getFiles(langRef.current);
    setNounsState(words);
    try { nounsFile.write(JSON.stringify(words)); } catch {}
  }, []);

  const resetVerbs = useCallback(async () => {
    const { verbsFile } = getFiles(langRef.current);
    const { verbModule } = getModules(langRef.current);
    const asset = Asset.fromModule(verbModule);
    await asset.downloadAsync();
    const words = parseCSV(await new File(asset.localUri).text());
    verbsFile.write(JSON.stringify(words));
    setVerbsState(words);
  }, []);

  const resetNouns = useCallback(async () => {
    const { nounsFile } = getFiles(langRef.current);
    const { nounModule } = getModules(langRef.current);
    const asset = Asset.fromModule(nounModule);
    await asset.downloadAsync();
    const words = parseCSV(await new File(asset.localUri).text());
    nounsFile.write(JSON.stringify(words));
    setNounsState(words);
  }, []);

  return { verbs, nouns, loading, reload, setVerbs, setNouns, resetVerbs, resetNouns };
}
