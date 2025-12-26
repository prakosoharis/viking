import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Upload, Camera, Image as ImageIcon } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { Colors, Spacing, Typography, Shadows } from '../theme';
import { SelectedFile } from '../types';
import { FileItem } from './FileItem';

const MAX_FILES = 10;
const MIN_FILES = 1;

interface UploadSectionProps {
  selectedFiles: SelectedFile[];
  onFilesChange: (files: SelectedFile[]) => void;
  onUpload: () => void;
  isUploading: boolean;
}

export const UploadSection: React.FC<UploadSectionProps> = ({
  selectedFiles,
  onFilesChange,
  onUpload,
  isUploading,
}) => {
  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera permissions to make this work!');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    if (selectedFiles.length >= MAX_FILES) {
      alert(`You can only upload a maximum of ${MAX_FILES} files at once.`);
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        quality: 1,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const newFile: SelectedFile = {
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: 0, // Will be set if needed
          fromCamera: true,
        };
        onFilesChange([...selectedFiles, newFile]);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    if (selectedFiles.length >= MAX_FILES) {
      alert(`You can only upload a maximum of ${MAX_FILES} files at once.`);
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newFiles: SelectedFile[] = result.assets.map((asset) => ({
          uri: asset.uri,
          name: asset.fileName || `image_${Date.now()}.jpg`,
          type: asset.mimeType || 'image/jpeg',
          size: 0,
          fromCamera: false,
        }));

        const totalFiles = selectedFiles.length + newFiles.length;
        if (totalFiles > MAX_FILES) {
          alert(`You can only upload a maximum of ${MAX_FILES} files at once.`);
          // Add only up to the limit
          const remaining = MAX_FILES - selectedFiles.length;
          onFilesChange([...selectedFiles, ...newFiles.slice(0, remaining)]);
        } else {
          onFilesChange([...selectedFiles, ...newFiles]);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to pick image');
    }
  };

  const removeFile = (index: number) => {
    onFilesChange(selectedFiles.filter((_, i) => i !== index));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Upload Images</Text>

      {/* Upload Area */}
      <View style={styles.uploadArea}>
        <View style={styles.iconContainer}>
          <Upload size={32} color={Colors.primary[600]} />
        </View>

        <Text style={styles.areaTitle}>Upload Images</Text>
        <Text style={styles.areaSubtitle}>Take a photo or choose from gallery</Text>
        <Text style={styles.areaHint}>
          Min: {MIN_FILES} file • Max: {MAX_FILES} files per upload
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.cameraButton]}
            onPress={takePhoto}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            <Camera size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.galleryButton]}
            onPress={pickFromGallery}
            disabled={isUploading}
            activeOpacity={0.8}
          >
            <ImageIcon size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>Choose Files</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.supportedFormats}>
          All image formats supported (JPG, PNG, HEIC, WebP, etc.)
        </Text>
      </View>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <View style={styles.filesContainer}>
          <View style={styles.filesHeader}>
            <Text style={styles.filesTitle}>Selected Files</Text>
            <View style={styles.counterContainer}>
              <Text style={[
                styles.counter,
                selectedFiles.length >= MAX_FILES && styles.counterFull
              ]}>
                {selectedFiles.length} / {MAX_FILES}
              </Text>
              {selectedFiles.length >= MAX_FILES && (
                <Text style={styles.maxBadge}>Max reached</Text>
              )}
            </View>
          </View>

          <ScrollView>
            {selectedFiles.map((file, index) => (
              <FileItem
                key={`${file.uri}-${index}`}
                file={file}
                onRemove={() => removeFile(index)}
              />
            ))}
          </ScrollView>

          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.clearButton]}
              onPress={() => onFilesChange([])}
              disabled={isUploading}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.uploadButton]}
              onPress={onUpload}
              disabled={isUploading || selectedFiles.length < MIN_FILES}
              activeOpacity={0.8}
            >
              <Text style={styles.uploadButtonText}>
                {isUploading ? 'Uploading...' : `Upload ${selectedFiles.length} ${selectedFiles.length === 1 ? 'File' : 'Files'}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing['2xl'],
    marginBottom: Spacing['2xl'],
    ...Shadows.xl,
  },
  title: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: Spacing['2xl'],
  },
  uploadArea: {
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: Spacing['4xl'],
    alignItems: 'center',
  },
  iconContainer: {
    backgroundColor: Colors.primary[100],
    borderRadius: 24,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  areaTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: Spacing.sm,
  },
  areaSubtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.gray[600],
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  areaHint: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.primary[600],
    marginBottom: Spacing['2xl'],
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['2xl'],
    borderRadius: 12,
    ...Shadows.lg,
  },
  cameraButton: {
    backgroundColor: Colors.primary[600],
  },
  galleryButton: {
    backgroundColor: Colors.gray[700],
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.base,
    fontWeight: '600',
  },
  supportedFormats: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.gray[500],
    textAlign: 'center',
  },
  filesContainer: {
    marginTop: Spacing['2xl'],
  },
  filesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  filesTitle: {
    fontSize: Typography.fontSizes.base,
    fontWeight: '700',
    color: Colors.gray[900},
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  counter: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.primary[600],
  },
  counterFull: {
    color: Colors.error[600],
  },
  maxBadge: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.error[600],
    backgroundColor: Colors.error[50],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.gray[200],
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    color: Colors.gray[700],
    fontSize: Typography.fontSizes.base,
    fontWeight: '600',
  },
  uploadButton: {
    flex: 1,
    backgroundColor: Colors.success[600],
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.lg,
  },
  uploadButtonText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '700',
  },
});
