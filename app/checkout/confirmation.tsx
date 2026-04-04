import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useTheme } from '../../src/context/ThemeContext';
import type { ThemeColors } from '../../src/context/ThemeContext';

const STATUS_COLORS = {
  pending: { bg: '#FEF3C7', text: '#92400E', icon: '#F59E0B' },
  confirmed: { bg: '#DBEAFE', text: '#1E40AF', icon: '#3B82F6' },
  preparing: { bg: '#EDE9FE', text: '#5B21B6', icon: '#8B5CF6' },
  delivering: { bg: '#FEE2E2', text: '#991B1B', icon: '#EF4444' },
  delivered: { bg: '#D1FAE5', text: '#065F46', icon: '#10B981' },
};

const createStyles = (c: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: c.background },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  successIcon: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: c.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: c.textSecondary, textAlign: 'center', marginBottom: 32 },
  infoCard: {
    width: '100%',
    backgroundColor: c.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: c.border,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  infoText: { flex: 1 },
  infoLabel: { fontSize: 12, color: c.textSecondary },
  infoValue: { fontSize: 15, fontWeight: '600', color: c.text, marginTop: 2 },
  statusSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  step: { alignItems: 'center' },
  stepDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepDotPending: { backgroundColor: '#E5E7EB' },
  stepText: { fontSize: 11, color: c.text, marginTop: 6, fontWeight: '600' },
  stepTextPending: { color: c.textSecondary },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4, marginBottom: 20 },
  trackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: APP_COLORS.primary,
    borderRadius: 16,
    paddingVertical: 16,
    width: '100%',
    gap: 8,
    marginBottom: 12,
  },
  trackButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  homeButton: {
    paddingVertical: 12,
  },
  homeButtonText: { color: c.textSecondary, fontSize: 15, fontWeight: '600' },
});

export default function OrderConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const orderId = (params.orderId as string)?.slice(0, 8) || '';

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color={STATUS_COLORS.delivered.icon} />
        </View>
        <Text style={styles.title}>Order Placed!</Text>
        <Text style={styles.subtitle}>
          Your order has been received. We'll notify you once it's confirmed.
        </Text>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="receipt" size={20} color={colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>#{orderId}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={20} color={STATUS_COLORS.pending.icon} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Status</Text>
              <Text style={[styles.infoValue, { color: STATUS_COLORS.pending.text }]}>Pending</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={colors.textSecondary} />
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>Need Help?</Text>
              <Text style={styles.infoValue}>+94 77 035 9400</Text>
            </View>
          </View>
        </View>

        <View style={styles.statusSteps}>
          <View style={styles.step}>
            <View style={[styles.stepDot, { backgroundColor: STATUS_COLORS.pending.icon }]}>
              <Ionicons name="time" size={16} color="#FFF" />
            </View>
            <Text style={[styles.stepText, { color: STATUS_COLORS.pending.text }]}>Pending</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.step}>
            <View style={[styles.stepDot, styles.stepDotPending]}>
              <Ionicons name="flame" size={14} color={colors.textSecondary} />
            </View>
            <Text style={[styles.stepText, styles.stepTextPending]}>Preparing</Text>
          </View>
          <View style={styles.stepLine} />
          <View style={styles.step}>
            <View style={[styles.stepDot, styles.stepDotPending]}>
              <Ionicons name="home" size={14} color={colors.textSecondary} />
            </View>
            <Text style={[styles.stepText, styles.stepTextPending]}>Delivered</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.trackButton}
          onPress={() => router.replace('/(tabs)/orders')}
        >
          <Ionicons name="location" size={20} color="#FFF" />
          <Text style={styles.trackButtonText}>Track My Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.homeButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
