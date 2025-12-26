import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Phone } from 'lucide-react-native';
import { VikingHelm } from '../components/VikingHelm';
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, Typography, Shadows } from '../theme';

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }

    setLoading(true);
    try {
      const user = await userApi.login(phone.trim());
      await login(user);

      // Navigate to dashboard
      navigation.reset({
        index: 0,
        routes: [{ name: 'Dashboard' }],
      });
    } catch (error: any) {
      console.error('Login error:', error);

      let errorMessage = 'Login failed. Please try again.';
      if (error.message && error.message.includes('not registered')) {
        errorMessage =
          'Phone number not registered.\n\n' +
          'Please contact your administrator to create an account for you.';
      }

      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <View style={styles.logoWrapper}>
            <VikingHelm size={96} color={Colors.primary[600]} />
          </View>
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>Vikings Invoice</Text>
          <Text style={styles.subtitle}>Enter your phone number to continue</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Phone size={20} color={Colors.gray[400]} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="+62 812 3456 7890"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              placeholderTextColor={Colors.gray[400]}
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing['2xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoWrapper: {
    backgroundColor: Colors.primary[100],
    borderRadius: 32,
    padding: Spacing['2xl'],
    ...Shadows.lg,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: Spacing['3xl'],
  },
  title: {
    fontSize: Typography.fontSizes['3xl'],
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSizes.base,
    color: Colors.gray[600],
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.gray[200],
    borderRadius: 12,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    marginBottom: Spacing['2xl'],
  },
  inputIcon: {
    marginRight: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Typography.fontSizes.lg,
    color: Colors.gray[900],
  },
  button: {
    backgroundColor: Colors.primary[600],
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    ...Shadows.lg,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.lg,
    fontWeight: '600',
  },
});
