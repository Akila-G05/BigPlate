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
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { useTheme } from '../../src/context/ThemeContext';
import { useThemedAlert } from '../../src/context/ThemedAlertContext';
import type { ThemeColors } from '../../src/context/ThemeContext';

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', padding: 8, marginBottom: 24 },
  header: { alignItems: 'center', marginBottom: 32 },
  logoImage: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: c.text },
  subtitle: { fontSize: 15, color: c.textSecondary, marginTop: 8 },
  form: { width: '100%' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: c.text, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  input: { flex: 1, fontSize: 16, color: c.text },
  forgotButton: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, color: APP_COLORS.primary, fontWeight: '600' },
  loginButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonDisabled: { opacity: 0.6 },
  loginButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24, gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: c.border },
  dividerText: { fontSize: 14, color: c.textSecondary },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 14,
    paddingVertical: 14,
    gap: 10,
  },
  socialButtonText: { fontSize: 15, fontWeight: '600', color: c.text },
  signupPrompt: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  signupText: { fontSize: 14, color: c.textSecondary },
  signupLink: { fontSize: 14, color: APP_COLORS.primary, fontWeight: '700' },
});

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors } = useTheme();
  const { showAlert } = useThemedAlert();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const styles = createStyles(colors);

  const handleLogin = async () => {
    if (!email.trim()) {
      showAlert('Error', 'Please enter your email');
      return;
    }
    if (!password.trim()) {
      showAlert('Error', 'Please enter your password');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      showAlert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Back */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.header}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop' }}
            style={styles.logoImage}
          />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your Big Plate account</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
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
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                placeholderTextColor={colors.textSecondary}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.forgotButton} onPress={() => router.push('/auth/forgot-password')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.loginButtonText}>Signing in...</Text>
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.socialButton}>
            <Ionicons name="logo-google" size={20} color="#EA4335" />
            <Text style={styles.socialButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.signupPrompt}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/auth/signup')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
