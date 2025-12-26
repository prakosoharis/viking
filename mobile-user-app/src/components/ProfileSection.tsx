import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Phone, Mail, Building2, MapPin, Hash } from 'lucide-react-native';
import { Colors, Spacing, Typography, Shadows } from '../theme';

interface ProfileSectionProps {
  user: {
    company_name?: string;
    org_nr?: string;
    phone_number: string;
    company_email?: string;
    address?: string;
    zip_code?: string;
  };
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user }) => {
  const hasProfileData = user.company_name || user.company_email || user.address;

  if (!hasProfileData) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <LinearGradient
        colors={[Colors.primary[50], Colors.secondary[50]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <User size={24} color={Colors.white} />
          </View>
          <View>
            <Text style={styles.headerTitle}>My Profile</Text>
            <Text style={styles.headerSubtitle}>Account Information</Text>
        </View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: Spacing['2xl'],
    borderWidth: 2,
    borderColor: Colors.primary[100],
    ...Shadows.xl,
    minWidth: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  headerIcon: {
    backgroundColor: Colors.primary[600],
    borderRadius: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: Typography.fontSizes.sm,
    color: Colors.gray[600],
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    width: (48 * 4 + Spacing['2xl'] * 3), // Approximately 50% width
    marginRight: Spacing.md,
    ...Shadows.sm,
  },
  infoIconWrapper: {
    backgroundColor: Colors.primary[100],
    borderRadius: 12,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: Typography.fontSizes.xs,
    fontWeight: '600',
    color: Colors.gray[500],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: Typography.fontSizes.sm,
    fontWeight: '700',
    color: Colors.gray[900],
  },
  fullWidth: {
    width: '100%',
    marginRight: 0,
  },
});
