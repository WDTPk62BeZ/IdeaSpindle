import { useState, useEffect, useCallback } from 'react';
import * as MediaLibrary from 'expo-media-library';

export default function useLocalImages() {
  const [images, setImages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [loading, setLoading] = useState(false);

  // ライブラリのフックで権限状態を管理（写真のみ、音声・動画を除外）
  const [permission, requestPermission] = MediaLibrary.usePermissions({
    granularPermissions: ['photo'],
  });

  useEffect(() => {
    if (permission?.granted) {
      MediaLibrary.getAlbumsAsync().then(setAlbums);
    }
  }, [permission?.granted]);

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
