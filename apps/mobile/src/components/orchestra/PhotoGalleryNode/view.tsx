import {
  View,
  Text,
  Image,
  FlatList,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import type { PhotoGalleryNodeProps, PhotoItem } from './types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_WIDTH - 48 - 8) / 2;

export function PhotoGalleryNodeView({
  title,
  photos,
  allowCapture,
  onCapture,
}: PhotoGalleryNodeProps) {
  const renderItem = ({ item }: { item: PhotoItem }) => (
    <View style={styles.photoWrap}>
      <Image source={{ uri: item.uri }} style={styles.photo} />
      {item.caption && (
        <Text style={styles.caption} numberOfLines={1}>
          {item.caption}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {allowCapture && (
          <Pressable style={styles.captureBtn} onPress={onCapture}>
            <Text style={styles.captureBtnText}>{'\u{1F4F7}'} Add Photo</Text>
          </Pressable>
        )}
      </View>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#f8fafc',
  },
  captureBtn: {
    backgroundColor: '#6366f1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  captureBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  grid: {
    paddingHorizontal: 16,
  },
  row: {
    gap: 8,
    marginBottom: 8,
  },
  photoWrap: {
    width: PHOTO_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1e293b',
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE,
  },
  caption: {
    fontSize: 12,
    color: '#94a3b8',
    padding: 8,
  },
});
