import { Text, TouchableOpacity } from 'react-native';
import { useL } from './i18n';

export default function SettingToggleButton({ settingsVisible, setSettingsVisible }) {
  const L = useL();
  return (
    <TouchableOpacity
      onPress={() => setSettingsVisible(v => !v)}
      style={{
        alignSelf: 'center',
        marginTop: -16,
        marginBottom: settingsVisible ? 10 : 0,
        backgroundColor: '#1c1c2e',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        paddingVertical: 4,
        paddingHorizontal: 14,
      }}
    >
      <Text style={{ color: '#cacaca', fontSize: 14 }}>
        {settingsVisible ? L.toggle.hide : L.toggle.show}
      </Text>
    </TouchableOpacity>
  );
}
