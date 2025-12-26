import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { Upload, LogOut, X } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { userApi } from '../api/userApi';
import { User, Upload as UploadType, SelectedFile } from '../types';
import { Colors, Spacing, Typography, Shadows } from '../theme';
import { ProfileSection } from '../components/ProfileSection';
import { UploadSection } from '../components/UploadSection';
import { SuccessModal } from '../components/SuccessModal';
import { SessionCard } from '../components/SessionCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const DashboardScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth();
  const [uploads, setUploads] = useState<UploadType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadUploads();
  }, []);

  const loadUploads = async () => {
    try {
      if (user) {
        const userUploads = await userApi.getUserUploads(user._id);
        setUploads(userUploads);
      }
    } catch (error) {
      console.error('Failed to load uploads:', error);
    }
  };

  const groupUploadsBySession = (uploads: UploadType[]) => {
    const sessions: { [key: number]: UploadType[] } = {};
    uploads.forEach(upload => {
      const sessionNum = upload.session_number || 1;
      if (!sessions[sessionNum]) {
        sessions[sessionNum] = [];
      }
      sessions[sessionNum].push(upload);
    });

    return Object.entries(sessions)
      .map(([sessionNum, uploads]) => ({
        sessionNumber: parseInt(sessionNum),
        uploads: uploads.sort((a, b) =>
          new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
        ),
        uploadedAt: uploads[0].uploaded_at,
      }))
      .sort((a, b) => b.sessionNumber - a.sessionNumber);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least 1 file to upload.');
      return;
    }

    if (selectedFiles.length > 10) {
      alert('You can only upload a maximum of 10 files at once.');
      return;
    }

    setIsUploading(true);
    try {
      // Check if any file is from camera (iOS workaround)
      const hasCameraFiles = selectedFiles.some(f => f.fromCamera);

      const result = await userApi.uploadImages(user!._id, selectedFiles, hasCameraFiles);

      setUploadCount(result.count);
      setShowModal(true);
      setSelectedFiles([]);

      // Reload uploads
      loadUploads();
    } catch (error: any) {
      console.error('Upload failed:', error);
      alert(`Failed to upload images: ${error.message || 'Please try again'}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const toggleSession = (sessionNumber: number) => {
    setExpandedSession(expandedSession === sessionNumber ? null : sessionNumber);
  };

  const sessions = groupUploadsBySession(uploads);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Upload size={24} color={Colors.primary[600]} />
          </View>
          <View>
            <Text style={styles.headerTitle}>Invoice Upload</Text>
            <Text style={styles.headerSubtitle}>{user?.phone_number}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <LogOut size={20} color={Colors.gray[700]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Section */}
        <ProfileSection user={user || {}} />

        {/* Upload Section */}
        <UploadSection
          selectedFiles={selectedFiles}
          onFilesChange={setSelectedFiles}
          onUpload={handleUpload}
          isUploading={isUploading}
        />

        {/* Upload History */}
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Your Uploads</Text>

          {uploads.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Upload size={40} color={Colors.gray[400]} />
              </View>
              <Text style={styles.emptyTitle}>No uploads yet</Text>
              <Text style={styles.emptySubtitle}>Upload your first invoice above</Text>
            </View>
          ) : (
            <View>
              {sessions.map((session) => (
                <SessionCard
                  key={session.sessionNumber}
                  session={session}
                  isExpanded={expandedSession === session.sessionNumber}
                  onToggle={() => toggleSession(session.sessionNumber)}
                  onImagePress={setPreviewImage}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        count={uploadCount}
      />

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableOpacity
          style={styles.previewOverlay}
          activeOpacity={1}
          onPress={() => setPreviewImage(null)}
        >
          <TouchableOpacity
            style={styles.previewClose}
            onPress={() => setPreviewImage(null)}
            hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}
          >
            <X size={32} color={Colors.white} />
          </TouchableOpacity>
          <Image
            source={{ uri: previewImage || '' }}
            style={styles.previewImage}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[200],
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    backgroundColor: Colors.primary[100],
    borderRadius: 12,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSizes.xl,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.gray[600],
  },
  logoutButton: {
    padding: Spacing.sm,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing['2xl'],
  },
  historyContainer: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing['2xl'],
    ...Shadows.xl,
  },
  historyTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: Spacing['2xl'],
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },
  emptyIcon: {
    backgroundColor: Colors.gray[100],
    borderRadius: 32,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSizes.lg,
    color: Colors.gray[600],
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.gray[500],
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewClose: {
    position: 'absolute',
    top: 48,
    right: 24,
    zIndex: 1,
  },
  previewImage: {
    width: SCREEN_WIDTH - 48,
    height: SCREEN_WIDTH * 1.2,
  },
});
