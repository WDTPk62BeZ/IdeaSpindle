import { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, Linking, Animated, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CircleTimer from './CircleTimer';
import SettingRow from './SettingRow';
import useWordListsStorage from './useWordListsStorage';
import SettingToggleButton from './SettingToggleButton';
import { useLanguage } from './LanguageContext';
import { useL } from './i18n';

const SLIDE_TIME_OPTIONS_JA = [
  {label:"30秒", seconds:30}, {label:"1分", seconds:60}, {label:"3分", seconds:180},
  {label:"5分", seconds:300}, {label:"10分", seconds:600}];
const SLIDE_TIME_OPTIONS_EN = [
  {label:"30s", seconds:30}, {label:"1m", seconds:60}, {label:"3m", seconds:180},
  {label:"5m", seconds:300}, {label:"10m", seconds:600}];

const rand = (arr, exclude = -1) => {
  if (arr.length === 0) return 0;
  let i;
  do { i = Math.floor(Math.random() * arr.length); } while (i === exclude && arr.length > 1);
  return i;
};

const searchUrl = (word, lang) =>
  `https://www.google.com/search?q=${encodeURIComponent(lang === 'en' ? word + ' meaning' : word + '　意味')}`;

function WordChip({ word, typeLabel, accent, accentBg, accentBorder, isLandscape, lang }) {
  return (
    <TouchableOpacity
      onPress={() => Linking.openURL(searchUrl(word, lang)).catch(() => {})}
      style={{
        alignItems: 'center',
        backgroundColor: accentBg,
        borderWidth: 1,
        borderColor: accentBorder,
        borderRadius: 16,
        paddingVertical: isLandscape ? 6 : 10,
        paddingHorizontal: 22,
        width: '100%',
      }}
    >
      <Text
        style={{ color: '#fff', fontSize: isLandscape ? 44 : 66, fontWeight: '700', width: '100%', textAlign: 'center' }}
        adjustsFontSizeToFit
        numberOfLines={1}
        minimumFontScale={0.3}
      >
        {word}
      </Text>
    </TouchableOpacity>
  );
}

export default function ThemeScreen() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const { lang } = useLanguage();
  const L = useL();
  const timeOptions = lang === 'en' ? SLIDE_TIME_OPTIONS_EN : SLIDE_TIME_OPTIONS_JA;

  const { verbs, nouns, loading, reload } = useWordListsStorage(lang);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  const [verbIdx, setVerbIdx] = useState(0);
  const [nounIdx, setNounIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [timeLimit, setTimeLimit] = useState(60);
  const [remaining, setRemaining] = useState(60);
  const [settingsVisible, setSettingsVisible] = useState(true);
  const animValue = useRef(new Animated.Value(1)).current;

  // 辞書ロード完了後に初期インデックスをランダム設定
  useEffect(() => {
    if (verbs.length > 0 && nouns.length > 0) {
      setVerbIdx(rand(verbs));
      setNounIdx(rand(nouns));
    }
  }, [verbs, nouns]);

  const next = useCallback(() => {
    Animated.timing(animValue, { toValue: 0, duration: 250, useNativeDriver: true }).start(() => {
      setVerbIdx((i) => rand(verbs, i));
      setNounIdx((i) => rand(nouns, i));
      setRemaining(timeLimit);
      Animated.timing(animValue, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    });
  }, [timeLimit, animValue, verbs, nouns]);

  useEffect(() => {
    if (!playing) return;
    if (remaining <= 0) { next(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [playing, remaining, next]);

  const togglePlay = () => {
    if (!playing) { setRemaining(timeLimit); setPlaying(true); }
    else setPlaying(false);
  };
  const handleTime = (t) => { setTimeLimit(t); setRemaining(t); setPlaying(false); };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, backgroundColor: '#0a0a0f' }}>
        <ActivityIndicator color="#a78bfa" size="large" />
        <Text style={{ color: '#fff', fontSize: 13 }}>{L.theme.loading}</Text>
      </View>
    );
  }

  // お題全体テキスト：英語は空白区切り、日本語は全角スペース区切り
  const themeText = lang === 'en'
    ? `"${verbs[verbIdx]} ${nouns[nounIdx]}"`
    : `「${verbs[verbIdx]}　${nouns[nounIdx]}」`;

  return (
    <>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, paddingVertical: isLandscape ? 8 : 24, backgroundColor: '#0a0a0f' }}>
        {playing && (
          <View style={{ position: 'absolute', top: 16, right: 20 }}>
            <CircleTimer value={remaining} max={timeLimit} size={52} />
          </View>
        )}
        <Animated.View style={{
          flexDirection: isLandscape ? 'row' : 'column',
          alignItems: 'center',
          gap: isLandscape ? 10 : 14,
          width: '100%',
          opacity: animValue,
          transform: [
            { translateY: animValue.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
            { scale: animValue.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1] }) },
          ],
        }}>
          <View style={isLandscape ? { flex: 1 } : { width: '100%' }}>
            <WordChip
              word={verbs[verbIdx]}
              typeLabel={L.theme.verbAdj}
              accent="#63dcbe"
              accentBg="rgba(99,220,190,0.12)"
              accentBorder="rgba(99,220,190,0.35)"
              isLandscape={isLandscape}
              lang={lang}
            />
          </View>
          <Text style={{ color: '#9c9c9c', fontSize: isLandscape ? 18 : 24, fontWeight: '300' }}>＋</Text>
          <View style={isLandscape ? { flex: 1 } : { width: '100%' }}>
            <WordChip
              word={nouns[nounIdx]}
              typeLabel={L.theme.noun}
              accent="#a78bfa"
              accentBg="rgba(167,139,250,0.12)"
              accentBorder="rgba(167,139,250,0.35)"
              isLandscape={isLandscape}
              lang={lang}
            />
          </View>
        </Animated.View>
        <Animated.Text
          style={{ marginTop: isLandscape ? 10 : 28, color: '#e9e9e9', fontSize: 40, letterSpacing: 1, opacity: animValue, width: '100%', textAlign: 'center' }}
          adjustsFontSizeToFit
          numberOfLines={1}
          minimumFontScale={0.3}
        >
          {themeText}
        </Animated.Text>
        {!isLandscape && (
          <View style={{ marginTop: 32, backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', borderRadius: 14, paddingVertical: 10, paddingHorizontal: 18, maxWidth: 300 }}>
            <Text style={{ color: '#e9e9e9', fontSize: 12, lineHeight: 20, textAlign: 'center' }}>
              {L.theme.tapHint}<Text style={{ color: '#63dcbe' }}>{L.theme.tapHintAccent}</Text>{L.theme.tapHint2}
            </Text>
          </View>
        )}
      </View>
      {/* ボトムパネル */}
      <View style={{
        backgroundColor: settingsVisible ? '#0a0a0f' : 'transparent',
        borderTopWidth: settingsVisible ? 1 : 0,
        borderTopColor: 'rgba(255,255,255,0.06)',
        paddingBottom: settingsVisible ? (isLandscape ? 10 : 22) : 0,
        paddingHorizontal: 20,
      }}>
        <SettingToggleButton settingsVisible={settingsVisible} setSettingsVisible={setSettingsVisible} />
        {settingsVisible && (
          <View style={{ backgroundColor: '#0a0a0f', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 12, paddingBottom: isLandscape ? 8 : 24, paddingHorizontal: 20 }}>
            <SettingRow label={L.theme.switchTime} options={timeOptions} value={timeLimit} onChange={handleTime} accent="#a78bfa" />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={togglePlay}
                style={{ flex: 1, height: 50, borderRadius: 14, backgroundColor: playing ? '#ee5a24' : '#a78bfa', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>{playing ? L.theme.stop : L.theme.start}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={next}
                style={{ width: 50, height: 50, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 20 }}>⏭</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </>
  );
}
