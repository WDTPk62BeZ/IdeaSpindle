import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CircleTimer from './CircleTimer';
import SettingRow from './SettingRow';
import useLocalImages from './useLocalImages';
import AlbumPickerModal from './AlbumPickerModal';
import SettingToggleButton from './SettingToggleButton';
import { useLanguage } from './LanguageContext';
import { useL } from './i18n';
import usePersistedState from './usePersistedState';

const SLIDE_TIME_OPTIONS_JA = [
  {label:"30秒", seconds:30}, {label:"3分", seconds:180}, {label:"10分", seconds:600},
  {label:"30分", seconds:1800}, {label:"１時間", seconds:3600}];
const SLIDE_TIME_OPTIONS_EN = [
  {label:"30s", seconds:30}, {label:"3m", seconds:180}, {label:"10m", seconds:600},
  {label:"30m", seconds:1800}, {label:"1h", seconds:3600}];

const rand = (arr, exclude = -1) => {
  if (arr.length === 0) return 0;
  let i;
  do { i = Math.floor(Math.random() * arr.length); } while (i === exclude && arr.length > 1);
  return i;
};

export default function SlideShowScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { lang } = useLanguage();
  const L = useL();
  const timeOptions = lang === 'en' ? SLIDE_TIME_OPTIONS_EN : SLIDE_TIME_OPTIONS_JA;

  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [timeLimit, setTimeLimit] = usePersistedState('slideshow_timeLimit.json', 60);
  const [remaining, setRemaining] = useState(60);
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const { images, albums, selectedAlbum, setSelectedAlbum, loading, permission, requestPermission } = useLocalImages('slideshow');

  useEffect(() => {
    if (images.length > 0) {
      setIdx(Math.floor(Math.random() * images.length));
      setPlaying(false);
    }
  }, [images]);

  const next = useCallback(() => {
    if (images.length === 0) return;
    Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
      setIdx((i) => rand(images, i));
      setRemaining(timeLimit);
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  }, [timeLimit, fadeAnim, images]);

  useEffect(() => {
    if (!playing) return;
    if (remaining <= 0) { next(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [playing, remaining, next]);

  useFocusEffect(useCallback(() => {
    setShowIntro(true);
    setSettingsVisible(true);
    return () => setPlaying(false);
  }, []));

  const togglePlay = () => {
    if (images.length === 0) return;
    if (!playing) {
      setShowIntro(false);
      setRemaining(timeLimit);
      setPlaying(true);
      setSettingsVisible(false);
    } else {
      setPlaying(false);
    }
  };
  const handleTime = (t) => { setTimeLimit(t); setRemaining(t); setPlaying(false); };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, backgroundColor: '#0a0a0f' }}>
        <Text style={{ fontSize: 48 }}>📷</Text>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{L.common.photoAccessTitle}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
          {L.slideshow.accessMsg}
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14, backgroundColor: '#63dcbe' }}
        >
          <Text style={{ color: '#0a0a0f', fontSize: 15, fontWeight: '700' }}>{L.common.allowAccess}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && images.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0a0a0f' }}>
        <ActivityIndicator color="#63dcbe" size="large" />
        <Text style={{ color: '#fff', fontSize: 13 }}>{L.common.loadingImages}</Text>
      </View>
    );
  }

  const img = images[idx] ?? images[0];

  const settingsContent = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ color: '#fff', fontSize: 18, letterSpacing: 0.5, textTransform: 'uppercase', minWidth: 64 }}>{L.common.album}</Text>
        <TouchableOpacity
          onPress={() => setAlbumModalVisible(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
        >
          <Text style={{ color: '#63dcbe', fontSize: 18, fontWeight: '600' }}>
            {selectedAlbum ? selectedAlbum.title : L.common.allPhotos}
          </Text>
          <Text style={{ color: '#63dcbe', fontSize: 10 }}>▼</Text>
        </TouchableOpacity>
      </View>

      <SettingRow label={L.slideshow.displayTime} options={timeOptions} value={timeLimit} onChange={handleTime} accent="#63dcbe" />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={togglePlay}
          style={{
            flex: 1, height: 50, borderRadius: 14,
            backgroundColor: playing ? '#ee5a24' : '#63dcbe',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{playing ? L.slideshow.stop : L.slideshow.start}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={next}
          style={{
            width: 50, height: 50, borderRadius: 14,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)',
            backgroundColor: 'rgba(255,255,255,0.05)',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 20 }}>⏭</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <View style={{ flex: 1, flexDirection: isLandscape ? 'row' : 'column', backgroundColor: '#111116' }}>
      {/* 画像エリア */}
      {images.length === 0 ? (      
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, backgroundColor: '#0a0a0f' }}>
          <Text style={{ fontSize: 48 }}>🖼️</Text>
          <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
            {L.common.noImages}
          </Text>
        </View>
      ) : (    
        <View style={{ flex: 1, overflow: 'hidden' }}>
          {showIntro ? (
            <TouchableOpacity
              onPress={togglePlay}
              activeOpacity={1}
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(10,10,15,0.88)',
                gap: 12, padding: 24,
              }}
            >
              <Text style={{ fontSize: 52 }}>📷</Text>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{L.tabs.slides}</Text>
              <Text style={{ color: 'rgba(255,255,255,0.45)', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>{L.slideshow.introHint}</Text>
              <TouchableOpacity
                onPress={togglePlay}
                style={{
                  height: 50, borderRadius: 14,
                  backgroundColor: '#63dcbe',
                  alignItems: 'center', justifyContent: 'center',
                  margin: 12, padding: 12, 
                }}
              >
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{ L.slideshow.start}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ):(
            <>
              <Animated.Image
                source={{ uri: img.uri }}
                style={{ width: '100%', height: '100%', opacity: fadeAnim }}
                resizeMode="contain"
              />
              {playing && (
                <View style={{ position: 'absolute', top: 16, right: 16 }}>
                  <CircleTimer value={remaining} max={timeLimit} />
                </View>
              )}
            </>
          )}

        </View>
        )
      }

      {isLandscape ? (
        <View style={{
          width: settingsVisible ? 240 : 0,
          backgroundColor: '#0a0a0f',
          borderLeftWidth: settingsVisible ? 1 : 0,
          borderLeftColor: 'rgba(255,255,255,0.06)',
          overflow: 'hidden',
          justifyContent: 'center',
          paddingHorizontal: settingsVisible ? 16 : 0,
          paddingVertical: 16,
        }}>
          {settingsVisible && settingsContent}
        </View>
      ) : (
        <View style={{
          backgroundColor: settingsVisible ? '#0a0a0f' : 'transparent',
          borderTopWidth: settingsVisible ? 1 : 0,
          borderTopColor: 'rgba(255,255,255,0.06)',
          paddingBottom: settingsVisible ? 22 : 0,
          paddingHorizontal: 20,
        }}>
          <SettingToggleButton settingsVisible={settingsVisible} setSettingsVisible={setSettingsVisible} />
          {settingsVisible && settingsContent}
        </View>
      )}

      {isLandscape && (
        <TouchableOpacity
          onPress={() => setSettingsVisible(v => !v)}
          style={{
            position: 'absolute',
            right: settingsVisible ? 240 : 0,
            top: '50%',
            marginTop: -24,
            width: 20,
            height: 48,
            backgroundColor: '#1c1c2e',
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
            borderWidth: 1,
            borderRightWidth: 0,
            borderColor: 'rgba(255,255,255,0.12)',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
          }}
        >
          <Text style={{ color: '#cacaca', fontSize: 10 }}>{settingsVisible ? '▶' : '◀'}</Text>
        </TouchableOpacity>
      )}

      <AlbumPickerModal
        visible={albumModalVisible}
        albums={albums}
        selectedAlbum={selectedAlbum}
        onSelect={(album) => { setSelectedAlbum(album); setAlbumModalVisible(false); }}
        onClose={() => setAlbumModalVisible(false)}
        accent="#63dcbe"
      />
    </View>
  );
}
