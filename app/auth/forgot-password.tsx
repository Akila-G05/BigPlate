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
import { validateEmail } from '../../src/utils/validation';

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
  codeInput: { fontSize: 24, fontWeight: '700', textAlign: 'center', letterSpacing: 8 },
  primaryButton: { backgroundColor: APP_COLORS.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  primaryButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  backToLogin: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  backToLoginText: { fontSize: 14, color: c.textSecondary },
  backToLoginLink: { fontSize: 14, color: APP_COLORS.primary, fontWeight: '700' },
  resendText: { fontSize: 14, color: APP_COLORS.primary, fontWeight: '600', textAlign: 'center', marginTop: 16 },
});

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { showAlert } = useThemedAlert();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const styles = createStyles(colors);

  const handleSendCode = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('smooth-worker', {
        body: { email: email.trim() },
      });

      if (error) throw error;
      // Navigate to code entry screen
      setStep(2);
      showAlert('Code Sent', `A 6-digit verification code has been sent to ${email.trim()}. Please check your inbox.`);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to send code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      showAlert('Error', 'Please enter the 6-digit code');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('password_reset_codes')
        .select('*')
        .eq('email', email.trim())
        .eq('code', code)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) throw new Error('Invalid or expired code');

      setStep(3);
    } catch (error: any) {
      showAlert('Error', error.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      showAlert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Call Edge Function to update password securely
      const { data, error } = await supabase.functions.invoke('smooth-worker', {
        body: {
          action: 'update_password',
          email: email.trim(),
          code,
          newPassword,
        },
      });

      if (error) throw error;

      showAlert('Success', 'Password updated! Please sign in.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={step === 1 ? 'mail' : step === 2 ? 'key' : 'lock-closed'} size={36} color={APP_COLORS.primary} />
          </View>
          <Text style={styles.title}>
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Enter Code' : 'New Password'}
          </Text>
          <Text style={styles.subtitle}>
            {step === 1
              ? 'Enter your email to receive a verification code'
              : step === 2
              ? 'Enter the 6-digit code sent to your email'
              : 'Create a new secure password'}
          </Text>
        </View>

        <View style={styles.form}>
          {step === 1 && (
            <>
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
              <TouchableOpacity style={styles.primaryButton} onPress={handleSendCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Send Code</Text>}
              </TouchableOpacity>
            </>
          )}

          {step === 2 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  placeholder="000000"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyCode} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Verify Code</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendCode} disabled={loading}>
                <Text style={styles.resendText}>Resend Code</Text>
              </TouchableOpacity>
            </>
          )}

          {step === 3 && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={handleResetPassword} disabled={loading}>
                {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryButtonText}>Update Password</Text>}
              </TouchableOpacity>
            </>
          )}

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
