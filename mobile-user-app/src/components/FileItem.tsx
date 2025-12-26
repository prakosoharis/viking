import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image as ImageIcon, X, FileText } from 'lucide-react-native';
import { Colors, Spacing, Typography } from '../theme';
import { formatFileSize } from '../utils/dateUtils';

interface FileItemProps {
  file: {
    name: string;
    size: number;
    type?: string;
  };
  onRemove: () => void;
}

export const FileItem: React.FC<FileItemProps> = ({ file, onRemove }) => {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

  return (
    <View style={styles.container}>
      {isPDF ? (
        <FileText size={20} color={Colors.error[600]} />
      ) : (
        <ImageIcon size={20} color={Colors.primary[600]} />
      )}

      <Text style={styles.fileName} numberOfLines={1}>
        {file.name}
      </Text>

      <Text style={styles.fileSize}>{formatFileSize(file.size)}</Text>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={onRemove}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <X size={16} color={Colors.error[600]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  fileName: {
    flex: 1,
    fontSize: Typography.fontSizes.sm,
    fontWeight: '500',
    color: Colors.gray[700],
    marginHorizontal: Spacing.sm,
  },
  fileSize: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.gray[500],
    marginRight: Spacing.md,
  },
  removeButton: {
    padding: Spacing.xs,
  },
});
