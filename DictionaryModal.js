import { useState, useMemo, useRef } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput,
  FlatList, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useL } from './i18n';

const PAGE_SIZE = 40;

const TAB_KEYS = [
  { key: 'verb', accent: '#63dcbe' },
  { key: 'noun', accent: '#a78bfa' },
];

export default function DictionaryModal({
  visible, onClose,
  verbs, nouns,
  onSetVerbs, onSetNouns,
  onResetVerbs, onResetNouns,
}) {
  const L = useL();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('verb');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [addInput, setAddInput] = useState('');
  const addInputRef = useRef(null);
  const listRef = useRef(null);

  const { accent } = TAB_KEYS.find(t => t.key === activeTab);
  const allWords = activeTab === 'verb' ? verbs : nouns;
  const tabLabel = activeTab === 'verb' ? L.dict.tabVerb : L.dict.tabNoun;
  const resetTitle = activeTab === 'verb' ? L.dict.resetVerbTitle : L.dict.resetNounTitle;

  const filtered = useMemo(() => {
    const q = searchQuery.trim();
    return allWords
      .map((word, idx) => ({ word, idx }))
      .filter(({ word }) => !q || word.includes(q));
  }, [allWords, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages - 1);
  const paginated = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);

  const goToPage = (p) => {
    setPage(p);
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  };

  const handleTabChange = (key) => {
    if (key === activeTab) return;
    setActiveTab(key);
    setSearchQuery('');
    setPage(0);
    setAddInput('');
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    setPage(0);
  };

  const handleAdd = () => {
    const w = addInput.trim();
    if (!w) return;
    if (activeTab === 'verb') {
      onSetVerbs([w, ...verbs]);
    } else {
      onSetNouns([w, ...nouns]);
    }
    setAddInput('');
    setSearchQuery('');
    setPage(0);
  };

  const handleDelete = (originalIdx) => {
    if (activeTab === 'verb') {
      onSetVerbs(verbs.filter((_, i) => i !== originalIdx));
    } else {
      onSetNouns(nouns.filter((_, i) => i !== originalIdx));
    }
  };

  const handleReset = () => {
    Alert.alert(
      resetTitle,
      L.dict.resetConfirmMsg,
      [
        { text: L.common.cancel, style: 'cancel' },
        {
          text: L.dict.resetBtn, style: 'destructive',
          onPress: () => {
            (activeTab === 'verb' ? onResetVerbs : onResetNouns)();
            setPage(0);
            setSearchQuery('');
          },
        },
      ]
    );
  };

  const renderItem = ({ item, index }) => (
    <View
      style={{
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 11,
        borderBottomWidth: index < paginated.length - 1 ? 1 : 0,
        borderBottomColor: 'rgba(255,255,255,0.05)',
      }}
    >
      <Text style={{ flex: 1, color: '#d4d4d4', fontSize: 15 }}>{item.word}</Text>
      <TouchableOpacity
        onPress={() => handleDelete(item.idx)}
        hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
      >
        <Text style={{ color: '#ef4444', fontSize: 22, fontWeight: '300', lineHeight: 24 }}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <View style={{
          backgroundColor: '#0f0f1a',
          borderTopLeftRadius: 24, borderTopRightRadius: 24,
          height: "78%",
          borderWidth: 1, borderBottomWidth: 0,
          borderColor: 'rgba(255,255,255,0.08)',
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}>
          {/* ── ヘッダー ── */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14,
            borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)',
          }}>
            <Text style={{ flex: 1, color: '#fff', fontSize: 17, fontWeight: '700' }}>{L.dict.title}</Text>
            <TouchableOpacity onPress={handleReset} style={{ marginRight: 32 }}>
              <Text style={{ color: '#ec2121', fontSize: 16 }}>{L.dict.resetBtn}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ color: accent, fontSize: 24, fontWeight: '200', lineHeight: 26 }}>{L.dict.closeBtn}</Text>
            </TouchableOpacity>
          </View>

          {/* ── タブ ── */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 14, paddingBottom: 12, gap: 8 }}>
            {TAB_KEYS.map(({ key, accent: tAccent }) => {
              const count = key === 'verb' ? verbs.length : nouns.length;
              const tLabel = key === 'verb' ? L.dict.tabVerb : L.dict.tabNoun;
              const active = activeTab === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => handleTabChange(key)}
                  style={{
                    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center',
                    backgroundColor: active ? tAccent + '1e' : 'rgba(255,255,255,0.04)',
                    borderWidth: 1,
                    borderColor: active ? tAccent : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{ color: active ? tAccent : '#b1b1b1', fontWeight: '600', fontSize: 13 }}>
                    {tLabel}{'  '}
                    <Text style={{ fontSize: 11, fontWeight: '400' }}>{L.dict.wordCount(count)}</Text>
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* ── 検索 + 追加 ── */}
          <View style={{ paddingHorizontal: 20, gap: 8, paddingBottom: 10 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center',
              backgroundColor: '#1a1a2e', borderRadius: 10,
              paddingHorizontal: 12,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
            }}>
              <Text style={{ color: '#444', fontSize: 13, marginRight: 8 }}>🔍</Text>
              <TextInput
                value={searchQuery}
                onChangeText={handleSearchChange}
                placeholder={L.dict.searchPlaceholder}
                placeholderTextColor="#b1b1b1"
                style={{ flex: 1, color: '#fff', fontSize: 14, paddingVertical: 10 }}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => handleSearchChange('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={{ color: '#ffffff', fontSize: 16 }}>×</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={{ flexDirection: 'row', gap: 8 }}>
              <TextInput
                ref={addInputRef}
                value={addInput}
                onChangeText={setAddInput}
                onSubmitEditing={handleAdd}
                returnKeyType="done"
                placeholder={L.dict.addPlaceholder(tabLabel)}
                placeholderTextColor="#b1b1b1"
                style={{
                  flex: 1, backgroundColor: '#1a1a2e', borderRadius: 10,
                  paddingHorizontal: 12, paddingVertical: 10,
                  color: '#fff', fontSize: 14,
                  borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                }}
              />
              <TouchableOpacity
                onPress={handleAdd}
                style={{
                  paddingHorizontal: 18, justifyContent: 'center', borderRadius: 10,
                  backgroundColor: accent + '22',
                  borderWidth: 1, borderColor: accent + '55',
                }}
              >
                <Text style={{ color: accent, fontWeight: '700', fontSize: 14 }}>{L.dict.addBtn}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── 件数・ページ情報 ── */}
          <View style={{
            flexDirection: 'row', alignItems: 'center',
            paddingHorizontal: 20, paddingBottom: 6,
            borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
          }}>
            <Text style={{ flex: 1, color: '#3a3a4a', fontSize: 11 }}>
              {searchQuery.trim()
                ? L.dict.hitCount(filtered.length)
                : L.dict.totalCount(allWords.length)}
            </Text>
            {totalPages > 1 && (
              <Text style={{ color: '#3a3a4a', fontSize: 11 }}>
                {L.dict.pageInfo(currentPage + 1, totalPages)}
              </Text>
            )}
          </View>

          {/* ── 単語リスト ── */}
          <FlatList
            ref={listRef}
            data={paginated}
            keyExtractor={(item) => String(item.idx)}
            renderItem={renderItem}
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 2, paddingBottom: 8 }}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <Text style={{
                color: '#333', textAlign: 'center',
                paddingVertical: 32, fontSize: 13,
              }}>
                {searchQuery.trim() ? L.dict.noResults : L.dict.noWords}
              </Text>
            }
          />

          {/* ── ページネーション ── */}
          {totalPages > 1 && (
            <View style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
              paddingVertical: 10, gap: 0,
              borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)',
            }}>
              <TouchableOpacity
                onPress={() => goToPage(0)}
                disabled={currentPage === 0}
                style={{ paddingHorizontal: 10, paddingVertical: 8, opacity: currentPage === 0 ? 0.25 : 1 }}
              >
                <Text style={{ color: accent, fontSize: 13 }}>«</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => goToPage(currentPage - 1)}
                disabled={currentPage === 0}
                style={{ paddingHorizontal: 12, paddingVertical: 8, opacity: currentPage === 0 ? 0.25 : 1 }}
              >
                <Text style={{ color: accent, fontSize: 18 }}>‹</Text>
              </TouchableOpacity>

              {Array.from({ length: totalPages }, (_, i) => i)
                .filter(i => Math.abs(i - currentPage) <= 2)
                .map(i => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => goToPage(i)}
                    style={{
                      minWidth: 32, height: 32, borderRadius: 8,
                      alignItems: 'center', justifyContent: 'center',
                      marginHorizontal: 2,
                      backgroundColor: i === currentPage ? accent + '25' : 'transparent',
                      borderWidth: i === currentPage ? 1 : 0,
                      borderColor: accent,
                    }}
                  >
                    <Text style={{
                      color: i === currentPage ? accent : '#555',
                      fontSize: 13, fontWeight: i === currentPage ? '700' : '400',
                    }}>
                      {i + 1}
                    </Text>
                  </TouchableOpacity>
                ))}

              <TouchableOpacity
                onPress={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages - 1}
                style={{ paddingHorizontal: 12, paddingVertical: 8, opacity: currentPage === totalPages - 1 ? 0.25 : 1 }}
              >
                <Text style={{ color: accent, fontSize: 18 }}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => goToPage(totalPages - 1)}
                disabled={currentPage === totalPages - 1}
                style={{ paddingHorizontal: 10, paddingVertical: 8, opacity: currentPage === totalPages - 1 ? 0.25 : 1 }}
              >
                <Text style={{ color: accent, fontSize: 13 }}>»</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={{ height: Math.max(insets.bottom, 16) }} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
