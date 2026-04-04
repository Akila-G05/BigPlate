import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useTheme } from '../../src/context/ThemeContext';
import { useThemedAlert } from '../../src/context/ThemedAlertContext';
import type { ThemeColors } from '../../src/context/ThemeContext';
import { supabase } from '../../src/lib/supabaseClient';

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', padding: 8, marginBottom: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(230, 57, 70, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: c.text },
  subtitle: { fontSize: 15, color: c.textSecondary, marginTop: 8, textAlign: 'center' },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 8 },
  input: { backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: c.text },
  resetButton: { backgroundColor: APP_COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  resetButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  backToLogin: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  backToLoginText: { fontSize: 14, color: c.textSecondary },
  backToLoginLink: { fontSize: 14, color: APP_COLORS.primary, fontWeight: '700' },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  successIcon: { marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '800', color: c.text, marginBottom: 8, textAlign: 'center' },
  successSubtitle: { fontSize: 15, color: c.textSecondary, textAlign: 'center', marginBottom: 32 },
  successButton: { backgroundColor: APP_COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', width: '100%' },
  successButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showAlert } = useThemedAlert();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const styles = createStyles(colors);

  const handleReset = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: 'bigplate://reset-password',
      });

      if (error) throw error;
      setSent(true);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-open" size={80} color={APP_COLORS.primary} />
          </View>
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successSubtitle}>
            We've sent a password reset link to{'\n'}
            <Text style={{ fontWeight: '600', color: colors.text }}>{email}</Text>
          </Text>
          <TouchableOpacity style={styles.successButton} onPress={() => router.replace('/auth/login')}>
            <Text style={styles.successButtonText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={36} color={APP_COLORS.primary} />
          </View>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you a link to reset your password
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <TouchableOpacity style={styles.resetButton} onPress={handleReset} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.resetButtonText}>Send Reset Link</Text>
            )}
          </TouchableOpacity>

          <View style={styles.backToLogin}>
            <Text style={styles.backToLoginText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => router.replace('/auth/login')}>
              <Text style={styles.backToLoginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
