import {
  View, Text, TouchableOpacity, ScrollView,
  Alert, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import useWordListsStorage from './useWordListsStorage';
import DictionaryModal from './DictionaryModal';
import { useState } from 'react';
import { useLanguage } from './LanguageContext';
import { useL } from './i18n';

const APP_VERSION = '1.0.0';

function SectionLabel({ title }) {
  return (
    <Text style={{
      color: '#fff', fontSize: 11, fontWeight: '600',
      letterSpacing: 1, textTransform: 'uppercase',
      marginBottom: 10, marginTop: 4,
    }}>
      {title}
    </Text>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginBottom: 20 }} />;
}

export default function SettingsScreen() {
  const { lang, setLang } = useLanguage();
  const L = useL();
  const { verbs, nouns, loading, setVerbs, setNouns, resetVerbs, resetNouns } = useWordListsStorage(lang);
  const [dictModalVisible, setDictModalVisible] = useState(false);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0f', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <ActivityIndicator color="#a78bfa" size="large" />
        <Text style={{ color: '#555', fontSize: 13 }}>{L.settings.loading}</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#0a0a0f' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 52 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── 言語 ── */}
        <SectionLabel title={L.settings.langSection} />
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 24 }}>
          {[{ key: 'ja', label: '日本語' }, { key: 'en', label: 'English' }].map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setLang(key)}
              style={{
                flex: 1, paddingVertical: 11, borderRadius: 12, alignItems: 'center',
                backgroundColor: lang === key ? 'rgba(167,139,250,0.12)' : 'rgba(255,255,255,0.04)',
                borderWidth: 1,
                borderColor: lang === key ? '#a78bfa' : 'rgba(255,255,255,0.08)',
              }}
            >
              <Text style={{
                color: lang === key ? '#a78bfa' : '#666',
                fontWeight: '600', fontSize: 14,
              }}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Divider />

        {/* ── 辞書管理 ── */}
        <SectionLabel title={L.settings.dictSection} />
        <TouchableOpacity
          onPress={() => setDictModalVisible(true)}
          style={{
            flexDirection: 'row', alignItems: 'center',
            backgroundColor: '#111116',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            borderRadius: 14, padding: 16, marginBottom: 24,
          }}
        >
          <View style={{ flex: 1, gap: 6 }}>
            <Text style={{ color: '#e9e9e9', fontSize: 15, fontWeight: '600' }}>{L.settings.dictButton}</Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#63dcbe' }} />
                <Text style={{ color: '#fff', fontSize: 12 }}>{L.settings.verbsLabel(verbs.length)}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#a78bfa' }} />
                <Text style={{ color: '#fff', fontSize: 12 }}>{L.settings.nounsLabel(nouns.length)}</Text>
              </View>
            </View>
          </View>
          <Text style={{ color: '#3a3a4a', fontSize: 18 }}>›</Text>
        </TouchableOpacity>

        <Divider />

        {/* ── プレミアム ── */}
        <SectionLabel title={L.settings.premiumSection} />
        <TouchableOpacity
          onPress={() => Alert.alert(L.settings.premiumTitle, L.settings.premiumMsg)}
          style={{
            backgroundColor: 'rgba(251,191,36,0.08)',
            borderWidth: 1, borderColor: 'rgba(251,191,36,0.3)',
            borderRadius: 14, paddingVertical: 16,
            alignItems: 'center', marginBottom: 24,
          }}
        >
          <Text style={{ color: '#fbbf24', fontWeight: '700', fontSize: 15 }}>{L.settings.premiumBtn}</Text>
          <Text style={{ color: 'rgba(251,191,36,0.45)', fontSize: 12, marginTop: 4 }}>
            {L.settings.premiumSub}
          </Text>
        </TouchableOpacity>

        <Divider />

        {/* ── サポート ── */}
        <SectionLabel title={L.settings.supportSection} />
        <TouchableOpacity
          onPress={() => Alert.alert(L.settings.feedbackTitle, L.settings.feedbackMsg)}
          style={{
            backgroundColor: 'rgba(255,255,255,0.04)',
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            borderRadius: 14, paddingVertical: 14,
            alignItems: 'center', marginBottom: 12,
            flexDirection: 'row', justifyContent: 'center', gap: 8,
          }}
        >
          <Text style={{ fontSize: 16 }}>✉️</Text>
          <Text style={{ color: '#9ca3af', fontWeight: '600', fontSize: 14 }}>{L.settings.feedbackBtn}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => Alert.alert(L.settings.privacyTitle, L.settings.privacyMsg)}
          style={{ alignItems: 'center', paddingVertical: 10, marginBottom: 24 }}
        >
          <Text style={{ color: '#555566', fontSize: 12, textDecorationLine: 'underline' }}>{L.settings.privacyBtn}</Text>
        </TouchableOpacity>

        {/* ── バージョン ── */}
        <Text style={{ color: '#bdbdbd', fontSize: 12, textAlign: 'center' }}>
          IdeaSpindle  v{APP_VERSION}
        </Text>
      </ScrollView>

      <DictionaryModal
        visible={dictModalVisible}
        onClose={() => setDictModalVisible(false)}
        verbs={verbs}
        nouns={nouns}
        onSetVerbs={setVerbs}
        onSetNouns={setNouns}
        onResetVerbs={resetVerbs}
        onResetNouns={resetNouns}
      />
    </KeyboardAvoidingView>
  );
}
