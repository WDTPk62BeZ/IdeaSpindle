import { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import CircleTimer from './CircleTimer';
import SettingRow from './SettingRow';
import useLocalImages from './useLocalImages';
import AlbumPickerModal from './AlbumPickerModal';
import SettingToggleButton from './SettingToggleButton';
import { useLanguage } from './LanguageContext';
import { useL } from './i18n';

const VIEW_TIME_OPTIONS_JA = [
  {label:"30秒", seconds:30}, {label:"1分", seconds:60}, {label:"3分", seconds:180},
  {label:"5分", seconds:300}, {label:"10分", seconds:600}];
const VIEW_TIME_OPTIONS_EN = [
  {label:"30s", seconds:30}, {label:"1m", seconds:60}, {label:"3m", seconds:180},
  {label:"5m", seconds:300}, {label:"10m", seconds:600}];
const BLANK_TIME_OPTIONS_JA = [
  {label:"30秒", seconds:30}, {label:"1分", seconds:60}, {label:"3分", seconds:180},
  {label:"5分", seconds:300}, {label:"10分", seconds:600}];
const BLANK_TIME_OPTIONS_EN = [
  {label:"30s", seconds:30}, {label:"1m", seconds:60}, {label:"3m", seconds:180},
  {label:"5m", seconds:300}, {label:"10m", seconds:600}];

const rand = (arr, exclude = -1) => {
  if (arr.length === 0) return 0;
  let i;
  do { i = Math.floor(Math.random() * arr.length); } while (i === exclude && arr.length > 1);
  return i;
};

const PHASE = { IDLE: 'idle', VIEWING: 'viewing', BLANK: 'blank', DONE: 'done' };

export default function MemoryScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { lang } = useLanguage();
  const L = useL();
  const viewTimeOptions = lang === 'en' ? VIEW_TIME_OPTIONS_EN : VIEW_TIME_OPTIONS_JA;
  const blankTimeOptions = lang === 'en' ? BLANK_TIME_OPTIONS_EN : BLANK_TIME_OPTIONS_JA;

  const [phase, setPhase] = useState(PHASE.IDLE);
  const [idx, setIdx] = useState(0);
  const [viewTime, setViewTime] = useState(60);
  const [blankTime, setBlankTime] = useState(120);
  const [remaining, setRemaining] = useState(0);
  const [imgVisible, setImgVisible] = useState(false);
  const [blurAmount, setBlurAmount] = useState(0);
  const [peekVisible, setPeekVisible] = useState(false);
  const [albumModalVisible, setAlbumModalVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(true);
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const { images, albums, selectedAlbum, setSelectedAlbum, loading, permission, requestPermission } = useLocalImages();

  useEffect(() => {
    if (images.length > 0) {
      setIdx(Math.floor(Math.random() * images.length));
      setPhase(PHASE.IDLE);
      setImgVisible(false);
      setBlurAmount(0);
      setPeekVisible(false);
    }
  }, [images]);

  useEffect(() => {
    if (phase === PHASE.IDLE || phase === PHASE.DONE) return;
    if (remaining <= 0) {
      if (phase === PHASE.VIEWING) {
        setBlurAmount(20);
        setTimeout(() => {
          setImgVisible(false);
          setBlurAmount(0);
          setPhase(PHASE.BLANK);
          setRemaining(blankTime);
        }, 600);
      } else if (phase === PHASE.BLANK) {
        setImgVisible(true);
        setPeekVisible(false);
        setPhase(PHASE.DONE);
      }
      return;
    }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, remaining, blankTime]);

  const startRound = () => {
    const nextIdx = rand(images, idx);
    setIdx(nextIdx);
    setImgVisible(false);
    setBlurAmount(0);
    setTimeout(() => {
      setImgVisible(true);
      setPhase(PHASE.VIEWING);
      setRemaining(viewTime);
    }, 400);
  };

  const handleStart = () => {
    setPhase(PHASE.VIEWING);
    setBlurAmount(0);
    setImgVisible(true);
    setRemaining(viewTime);
    setSettingsVisible(false);
  };

  const handleReset = () => {
    setPhase(PHASE.IDLE);
    setImgVisible(false);
    setBlurAmount(0);
    setPeekVisible(false);
  };

  if (!permission?.granted) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, backgroundColor: '#0a0a0f' }}>
        <Text style={{ fontSize: 48 }}>🚨</Text>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' }}>{L.common.photoAccessTitle}</Text>
        <Text style={{ color: 'fff', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
          {L.memory.accessMsg}
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          style={{ paddingVertical: 12, paddingHorizontal: 28, borderRadius: 14, backgroundColor: '#a855f7' }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{L.common.allowAccess}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && images.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0a0a0f' }}>
        <ActivityIndicator color="#a855f7" size="large" />
        <Text style={{ color: '#fff', fontSize: 13 }}>{L.common.loadingImages}</Text>
      </View>
    );
  }

  if (images.length === 0) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32, backgroundColor: '#0a0a0f' }}>
        <Text style={{ fontSize: 48 }}>🖼️</Text>
        <Text style={{ color: '#fff', fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
          {L.common.noImages}
        </Text>
      </View>
    );
  }

  const img = images[idx] ?? images[0];

  const accentColor = phase === PHASE.VIEWING ? '#f59e0b'
    : phase === PHASE.BLANK ? '#fb7185'
    : phase === PHASE.DONE  ? '#34d399'
    : '#e879f9';

  const settingsContent = (
    <>
      <View pointerEvents={phase === PHASE.IDLE ? 'auto' : 'none'} style={{ opacity: phase === PHASE.IDLE ? 1 : 0.4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', minWidth: 64, color:'#fff' }}>{L.common.album}</Text>
          <TouchableOpacity
            onPress={() => setAlbumModalVisible(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
          >
            <Text style={{ color: '#e879f9', fontSize: 12, fontWeight: '600' }}>
              {selectedAlbum ? selectedAlbum.title : L.common.allPhotos}
            </Text>
            <Text style={{ color: '#e879f9', fontSize: 10 }}>▼</Text>
          </TouchableOpacity>
        </View>
        <SettingRow label={L.memory.viewTime} options={viewTimeOptions} value={viewTime}
          onChange={(t) => setViewTime(t)} accent="#f59e0b" />
        <SettingRow label={L.memory.drawTime} options={blankTimeOptions} value={blankTime}
          onChange={(t) => setBlankTime(t)} accent="#fb7185" />
      </View>

      {phase === PHASE.IDLE ? (
        <TouchableOpacity
          onPress={handleStart}
          style={{
            height: 50, borderRadius: 14, backgroundColor: '#a855f7',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{L.memory.startBtn}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity
            onPress={handleReset}
            style={{
              flex: 1, height: 50, borderRadius: 14,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)',
              backgroundColor: 'rgba(255,255,255,0.05)',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '600' }}>{L.memory.resetBtn}</Text>
          </TouchableOpacity>
          {phase === PHASE.BLANK && (
            <TouchableOpacity
              onPressIn={() => setPeekVisible(true)}
              onPressOut={() => setPeekVisible(false)}
              activeOpacity={1}
              style={{
                flex: 2, height: 50, borderRadius: 14,
                borderWidth: 1, borderColor: '#fb7185',
                backgroundColor: peekVisible ? 'rgba(251,113,133,0.25)' : 'rgba(251,113,133,0.1)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fb7185', fontSize: 14, fontWeight: '600' }}>{L.memory.showAnswerBtn}</Text>
            </TouchableOpacity>
          )}
          {phase === PHASE.DONE && (
            <TouchableOpacity
              onPress={startRound}
              style={{
                flex: 2, height: 50, borderRadius: 14, backgroundColor: '#059669',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{L.memory.nextBtn}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </>
  );

  return (
    <View style={{ flex: 1, flexDirection: isLandscape ? 'row' : 'column', backgroundColor: '#111116' }}>
      {/* 画像 / ブランクエリア */}
      <View style={{ flex: 1, overflow: 'hidden', backgroundColor: '#111116' }}>
        <Image
          source={{ uri: img.uri }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: (imgVisible || peekVisible) ? 1 : 0 }}
          resizeMode="contain"
          blurRadius={blurAmount}
        />

        {phase === PHASE.BLANK && !peekVisible && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 }}>
            <Text style={{ fontSize: 52 }}>✏️</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center', lineHeight: 27 }}>
              {L.memory.blankInstruction}<Text style={{ color: '#fb7185' }}>{L.memory.blankAccent}</Text>{L.memory.blankInstruction2}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', lineHeight: 20 }}>
              {L.memory.blankHint}
            </Text>
          </View>
        )}

        {phase === PHASE.IDLE && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Text style={{ fontSize: 48 }}>🧠</Text>
            <Text style={{ color: '#cacaca', fontSize: 14, textAlign: 'center', lineHeight: 24 }}>
              {L.memory.idleHint}
            </Text>
          </View>
        )}

        <View style={{ position: 'absolute', top: 16, right: 16 }}>
          {(phase === PHASE.VIEWING || phase === PHASE.BLANK) && (
            <CircleTimer value={remaining} max={phase === PHASE.VIEWING ? viewTime : blankTime} size={40} colorOverride={accentColor} />
          )}
        </View>
      </View>

      {isLandscape ? (
        <View style={{
          width: settingsVisible ? 260 : 0,
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
            right: settingsVisible ? 260 : 0,
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
        accent="#e879f9"
      />
    </View>
  );
}
