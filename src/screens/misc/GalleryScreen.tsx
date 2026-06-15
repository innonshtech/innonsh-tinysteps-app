import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Download, Share2, X } from 'lucide-react-native';

import { AppHeader } from '../../components/layout/AppHeader';
import { Typography } from '../../components/ui/Typography';
import { PodarColors } from '../../theme/colors';
import { PodarSpacing, PodarRadius } from '../../theme/spacing';
import { PodarShadows } from '../../theme/shadows';
import { GalleryService } from '../../services/gallery.service';

const { width } = Dimensions.get('window');
const COLUMN_SPACING = PodarSpacing.md;
const IMAGE_WIDTH = (width - (PodarSpacing.lg * 2) - COLUMN_SPACING) / 2;

export default function GalleryScreen({ route }: any) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    fetchGallery();
  }, []);

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const response = await GalleryService.getGallery();
      if (response && response.images) {
        const fetchedImages = response.images.map((img: any, i: number) => ({
          id: img._id || i.toString(),
          url: img.url,
          title: img.title || 'Gallery Image',
          height: [150, 200, 100, 175, 125][i % 5],
        }));
        setImages(fetchedImages);
      }
    } catch (e) {
      console.error('Failed to fetch gallery', e);
    } finally {
      setLoading(false);
    }
  };

  const col1 = images.filter((_, i) => i % 2 === 0);
  const col2 = images.filter((_, i) => i % 2 !== 0);

  const renderImageColumn = (colData: typeof images) => {
    return (
      <View style={styles.column}>
        {colData.map((img) => (
          <TouchableOpacity
            key={img.id}
            activeOpacity={0.8}
            onPress={() => setSelectedImage(img.url)}
            style={[styles.imageCard, { height: img.height }]}
          >
            <Image
              source={{ uri: img.url }}
              style={styles.image}
              resizeMode="cover"
            />
            <View style={styles.imageOverlay}>
              <Typography variant="caption" color={PodarColors.surface} numberOfLines={1}>
                {img.title}
              </Typography>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Gallery" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.masonryGrid}>
          {renderImageColumn(col1)}
          {renderImageColumn(col2)}
        </View>
      </ScrollView>

      {selectedImage && (
        <View style={styles.lightbox}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedImage(null)}
          >
            <X size={32} color={PodarColors.surface} />
          </TouchableOpacity>

          <Image
            source={{ uri: selectedImage }}
            style={styles.fullscreenImage}
            resizeMode="contain"
          />

          <View style={styles.lightboxActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <Share2 size={24} color={PodarColors.surface} />
              <Typography variant="caption" color={PodarColors.surface} style={{ marginTop: 4 }}>Share</Typography>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn}>
              <Download size={24} color={PodarColors.surface} />
              <Typography variant="caption" color={PodarColors.surface} style={{ marginTop: 4 }}>Save</Typography>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PodarColors.background,
  },
  scrollContent: {
    padding: PodarSpacing.lg,
    paddingBottom: 40,
  },
  masonryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: IMAGE_WIDTH,
  },
  imageCard: {
    width: '100%',
    marginBottom: COLUMN_SPACING,
    borderRadius: PodarRadius.lg,
    overflow: 'hidden',
    backgroundColor: PodarColors.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: PodarSpacing.sm,
    paddingTop: PodarSpacing.xl,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  lightbox: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 24,
    zIndex: 101,
  },
  fullscreenImage: {
    width: '100%',
    height: '70%',
  },
  lightboxActions: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-evenly',
  },
  actionBtn: {
    alignItems: 'center',
    padding: PodarSpacing.lg,
  }
});

