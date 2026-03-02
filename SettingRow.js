import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput, Keyboard } from 'react-native';
import { useL } from './i18n';

export const formatSeconds = (secs) => {
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return s === 0 ? `${m}m` : `${m}m${s}s`;
};

export default function SettingRow({ label, options, value, onChange, accent = '#63dcbe' }) {
  const L = useL();
  const [modalVisible, setModalVisible] = useState(false);
  const [customSeconds, setCustomSeconds] = useState(null);
  const [inputText, setInputText] = useState('');

  const isCustom = !options.some((opt) => opt.seconds === value);

  const openModal = () => {
    setInputText(isCustom ? String(value) : (customSeconds != null ? String(customSeconds) : ''));
    setModalVisible(true);
  };

  const handleConfirm = () => {
    const secs = parseInt(inputText, 10);
    if (!isNaN(secs) && secs > 0) {
      setCustomSeconds(secs);
      onChange(secs);
    }
    setModalVisible(false);
    Keyboard.dismiss();
  };

  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <Text style={{ color: '#fff', fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', minWidth: 64, paddingTop: 5 }}>
          {label}
        </Text>
        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
          {options.map((opt) => {
            const selected = opt.seconds === value;
            return (
              <TouchableOpacity
                key={opt.seconds}
                onPress={() => onChange(opt.seconds)}
                style={{
                  paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1,
                  borderColor: selected ? accent : 'rgba(255,255,255,0.1)',
                  backgroundColor: selected ? accent + '22' : 'transparent',
                }}
              >
                <Text style={{ color: selected ? accent : '#acacac', fontSize: 16, fontWeight: '600' }}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity
            onPress={openModal}
            style={{
              paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, borderWidth: 1,
              borderColor: isCustom ? accent : 'rgba(255,255,255,0.1)',
              backgroundColor: isCustom ? accent + '22' : 'transparent',
            }}
          >
            <Text style={{ color: isCustom ? accent : '#fff', fontSize: 11, fontWeight: '600' }}>
              {isCustom ? L.row.customLabel(formatSeconds(value)) : L.row.customBtn}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.65)' }}>
          <View style={{ width: 290, backgroundColor: '#1a1a2e', borderRadius: 20, padding: 24, gap: 16 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' }}>
              {L.row.customTime}
            </Text>
            <Text style={{ color: '#fff', fontSize: 11, textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {label}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <TextInput
                style={{ color: '#fff', fontSize: 44, fontWeight: '700', textAlign: 'right', minWidth: 90 }}
                keyboardType="number-pad"
                value={inputText}
                onChangeText={setInputText}
                autoFocus
                selectTextOnFocus
                placeholder="0"
                placeholderTextColor="#333"
              />
              <Text style={{ color: '#fff', fontSize: 16 }}>{L.row.seconds}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setModalVisible(false); Keyboard.dismiss(); }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{L.common.cancel}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirm}
                style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: accent, alignItems: 'center' }}
              >
                <Text style={{ color: '#0a0a0f', fontSize: 14, fontWeight: '700' }}>{L.common.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
