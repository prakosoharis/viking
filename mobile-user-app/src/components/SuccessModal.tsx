import React, { useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors, Spacing, Typography, Shadows } from '../theme';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  count: number;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  count,
}) => {
  const [fadeAnim] = React.useState(new Animated.Value(0));
  const [scaleAnim] = React.useState(new Animated.Value(0.9));

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    } else {
      // Reset animations when closed
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      transparent
      visible={isOpen}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.iconContainer}>
            <Check size={48} color={Colors.success[600]} strokeWidth={3} />
          </View>

          <Text style={styles.title}>Success!</Text>
          <Text style={styles.message}>
            {count} {count === 1 ? 'image' : 'images'} uploaded
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={onClose}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Done</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing['2xl'],
  },
  modal: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: Spacing['4xl'],
    alignItems: 'center',
    maxWidth: Math.min(350, SCREEN_WIDTH - 48),
    width: '100%',
    ...Shadows['2xl'],
  },
  iconContainer: {
    backgroundColor: Colors.success[100],
    borderRadius: 64,
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing['2xl'],
  },
  title: {
    fontSize: Typography.fontSizes['2xl'],
    fontWeight: '700',
    color: Colors.gray[900],
    marginBottom: Spacing.sm,
  },
  message: {
    fontSize: Typography.fontSizes.base,
    color: Colors.gray[600],
    marginBottom: Spacing['2xl'],
    textAlign: 'center',
  },
  button: {
    backgroundColor: Colors.success[600],
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing['4xl'],
    borderRadius: 12,
    ...Shadows.md,
  },
  buttonText: {
    color: Colors.white,
    fontSize: Typography.fontSizes.base,
    fontWeight: '600',
  },
});
