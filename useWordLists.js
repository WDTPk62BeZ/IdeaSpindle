import { useState, useEffect } from 'react';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

const parseCSV = (text) =>
  text.trim().split('\n').map((line) => line.trim()).filter(Boolean);

export default function useWordLists() {
  const [verbs, setVerbs] = useState([]);
  const [nouns, setNouns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const verbAsset = Asset.fromModule(require('./verbs.csv'));
        const nounAsset = Asset.fromModule(require('./nouns.csv'));
        await Promise.all([verbAsset.downloadAsync(), nounAsset.downloadAsync()]);
        const [verbText, nounText] = await Promise.all([
          FileSystem.readAsStringAsync(verbAsset.localUri),
          FileSystem.readAsStringAsync(nounAsset.localUri),
        ]);
        setVerbs(parseCSV(verbText));
        setNouns(parseCSV(nounText));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return { verbs, nouns, loading };
}
