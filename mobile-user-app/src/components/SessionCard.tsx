import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, ChevronUp, Image as ImageIcon, Calendar, FileText, Send, AlertCircle, Clock } from 'lucide-react-native';
import { Colors, Spacing, Typography, Shadows } from '../theme';
import { formatDate } from '../utils/dateUtils';
import { isPDF } from '../utils/fileUtils';
import { Upload } from '../types';
import { userApi } from '../api/userApi';

interface SessionCardProps {
  session: {
    sessionNumber: number;
    uploads: Upload[];
    uploadedAt: Date | string;
  };
  isExpanded: boolean;
  onToggle: () => void;
  onImagePress: (imageUrl: string) => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  isExpanded,
  onToggle,
  onImagePress,
}) => {
  const firstUpload = session.uploads[0];

  const getEmailStatusBadge = () => {
    switch (firstUpload.email_status) {
      case 'sent':
        return (
          <View style={styles.statusBadge}>
            <Send size={12} color={Colors.success[600]} />
            <Text style={[styles.statusText, styles.statusTextSuccess]}>Email Sent</Text>
          </View>
        );
      case 'failed':
        return (
          <View style={[styles.statusBadge, styles.statusBadgeError]}>
            <AlertCircle size={12} color={Colors.error[600]} />
            <Text style={[styles.statusText, styles.statusTextError]}>Email Failed</Text>
          </View>
        );
      case 'pending':
      default:
        return (
          <View style={[styles.statusBadge, styles.statusBadgeWarning]}>
            <Clock size={12} color={Colors.warning[600]} />
            <Text style={[styles.statusText, styles.statusTextWarning]}>Sending...</Text>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Session Header */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onToggle}
      >
        <LinearGradient
          colors={[Colors.primary[50], Colors.secondary[50]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
        <View style={styles.headerLeft}>
          <View style={styles.sessionBadge}>
            <Text style={styles.sessionNumber}>{session.sessionNumber}</Text>
          </View>

          <View style={styles.headerInfo}>
            <Text style={styles.sessionTitle}>
              Upload Session {session.sessionNumber}
            </Text>

            <View style={styles.sessionMeta}>
              <View style={styles.metaItem}>
                <ImageIcon size={14} color={Colors.gray[600]} />
                <Text style={styles.metaText}>
                  {session.uploads.length} {session.uploads.length === 1 ? 'file' : 'files'}
                </Text>
              </View>

              <View style={styles.metaItem}>
                <Calendar size={14} color={Colors.gray[600]} />
                <Text style={styles.metaText}>{formatDate(session.uploadedAt)}</Text>
              </View>

              {getEmailStatusBadge()}
            </View>
          </View>
        </View>

        {isExpanded ? (
          <ChevronUp size={24} color={Colors.gray[400]} />
        ) : (
          <ChevronDown size={24} color={Colors.gray[400]} />
        )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Session Content */}
      {isExpanded && (
        <View style={styles.content}>
          <ScrollView>
            <View style={styles.imageGrid}>
              {session.uploads.map((upload) => {
                const imageUrl = userApi.getImageUrl(upload.image_url);
                const isPdf = isPDF(upload.image_url);

                return (
                  <TouchableOpacity
                    key={upload._id}
                    style={styles.imageCard}
                    onPress={() => !isPdf && onImagePress(imageUrl)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.imageContainer}>
                      {isPdf ? (
                        <View style={styles.pdfPlaceholder}>
                          <FileText size={48} color={Colors.error[600]} />
                          <Text style={styles.pdfText}>PDF Document</Text>
                        </View>
                      ) : (
                        <Image
                          source={{ uri: imageUrl }}
                          style={styles.image}
                          resizeMode="cover"
                        />
                      )}
                    </View>
                    <View style={styles.imageInfo}>
                      <View style={styles.imageDate}>
                        <Calendar size={12} color={Colors.gray[500]} />
                        <Text style={styles.imageDateText}>
                          {formatDate(upload.uploaded_at)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sessionBadge: {
    backgroundColor: Colors.primary[600],
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  sessionNumber: {
    color: Colors.white,
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
  },
  headerInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: Typography.fontSizes.lg,
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: Spacing.xs,
  },
  sessionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.gray[600],
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeSuccess: {
    backgroundColor: Colors.success[100],
  },
  statusBadgeError: {
    backgroundColor: Colors.error[100],
  },
  statusBadgeWarning: {
    backgroundColor: Colors.warning[100],
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextSuccess: {
    color: Colors.success[700],
  },
  statusTextError: {
    color: Colors.error[700],
  },
  statusTextWarning: {
    color: Colors.warning[700],
  },
  content: {
    padding: Spacing['2xl'],
    backgroundColor: Colors.white,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.lg,
  },
  imageCard: {
    width: ((120 * 3) + Spacing.lg * 2) / 3, // 1/3 of container width
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: Colors.gray[50],
    ...Shadows.sm,
  },
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: Colors.gray[200,
  },
  pdfPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  pdfText: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '600',
    color: Colors.gray[700],
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageInfo: {
    padding: Spacing.sm,
    backgroundColor: Colors.white,
  },
  imageDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  imageDateText: {
    fontSize: Typography.fontSizes.xs,
    color: Colors.gray[600],
  },
});
