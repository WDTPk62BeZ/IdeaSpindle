import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';
import { File, Paths } from 'expo-file-system';

export default function useLocalImages(storageKey) {
  const [images, setImages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, _setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(false);

  // ライブラリのフックで権限状態を管理（写真のみ、音声・動画を除外）
  const [permission, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ['photo'],
  });

  // storageKey が指定されていればアルバム選択を復元
  useEffect(() => {
    if (!storageKey) return;
    const file = new File(Paths.document, `album_${storageKey}.json`);
    if (!file.exists) return;
    file.text().then((text) => {
      try { _setSelectedAlbum(JSON.parse(text)); } catch {}
    }).catch(() => {});
  }, [storageKey]);

  useEffect(() => {
    if (permission?.granted) {
      MediaLibrary.getAlbumsAsync().then(setAlbums);
    }
  }, [permission?.granted]);

  const setSelectedAlbum = useCallback((album) => {
    _setSelectedAlbum(album);
    if (storageKey) {
      try {
        new File(Paths.document, `album_${storageKey}.json`).write(JSON.stringify(album));
      } catch {}
    }
  }, [storageKey]);

  const loadImages = useCallback(async () => {
    if (!permission?.granted) return;
    setLoading(true);
    try {
      let allAssets = [];
      let after;
      let hasMore = true;
      while (hasMore) {
        const result = await MediaLibrary.getAssetsAsync({
          mediaType: MediaLibrary.MediaType.photo,
          album: selectedAlbum ?? undefined,
          first: 200,
          after,
          sortBy: MediaLibrary.SortBy.creationTime,
        });
        allAssets = allAssets.concat(result.assets);
        hasMore = result.hasNextPage;
        after = result.endCursor;
      }
      setImages(allAssets);
    } finally {
      setLoading(false);
    }
  }, [permission?.granted, selectedAlbum]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  return { images, albums, selectedAlbum, setSelectedAlbum, loading, permission, requestPermission };
}
