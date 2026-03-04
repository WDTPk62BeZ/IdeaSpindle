import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useL } from './i18n';

export default function AlbumPickerModal({ visible, albums, selectedAlbum, onSelect, onClose, accent = '#63dcbe' }) {
  const L = useL();
  const insets = useSafeAreaInsets();
  const allPhotosItem = { id: null, title: L.common.allPhotos };
  const items = [allPhotosItem, ...albums];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#1a1a2e', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingLeft: insets.left, paddingRight: insets.right }}>
          <View style={{ paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', textAlign: 'center' }}>{L.albumPicker.title}</Text>
          </View>
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingBottom: insets.bottom }}
            renderItem={({ item }) => {
              const isSelected = selectedAlbum?.id === item.id || (!selectedAlbum && item.id === null);
              return (
                <TouchableOpacity
                  onPress={() => onSelect(item.id === null ? null : item)}
                  style={{
                    paddingVertical: 14, paddingHorizontal: 20,
                    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)',
                    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 14 }}>{item.title}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    {item.assetCount > 0 && (
                      <Text style={{ color: '#fff', fontSize: 12 }}>{item.assetCount}枚</Text>
                    )}
                    {isSelected && <Text style={{ color: accent, fontSize: 16 }}>✓</Text>}
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
