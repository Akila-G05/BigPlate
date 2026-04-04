import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabaseClient';

type Address = {
  id: string;
  label: string;
  line1: string;
  line2: string;
  city: string;
  is_default: boolean;
};

export default function AddressScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  if (!user) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Addresses</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.empty}>
          <Ionicons name="lock-closed-outline" size={64} color={APP_COLORS.textSecondary} />
          <Text style={styles.emptyTitle}>Sign in required</Text>
          <Text style={styles.emptySubtitle}>Please sign in to manage your addresses</Text>
          <TouchableOpacity style={styles.addFirstButton} onPress={() => router.push('/auth/login')}>
            <Text style={styles.addFirstText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const resetForm = () => {
    setLabel('');
    setLine1('');
    setLine2('');
    setCity('');
    setEditingAddress(null);
    setShowForm(false);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setLabel(address.label);
    setLine1(address.line1);
    setLine2(address.line2 || '');
    setCity(address.city);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('addresses').delete().eq('id', id);
            if (error) throw error;
            setAddresses((prev) => prev.filter((a) => a.id !== id));
          } catch (error: any) {
            Alert.alert('Error', error.message);
          }
        },
      },
    ]);
  };

  const handleSave = async () => {
    if (!label.trim() || !line1.trim() || !city.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update({ label, line1, line2: line2 || null, city })
          .eq('id', editingAddress.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: user.id,
            label,
            line1,
            line2: line2 || null,
            city,
            is_default: addresses.length === 0,
          });
        if (error) throw error;
      }

      resetForm();
      fetchAddresses();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id: string) => {
    try {
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;
      fetchAddresses();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Addresses</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
            <Ionicons name="add" size={24} color={APP_COLORS.primary} />
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={APP_COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={APP_COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(true)}>
          <Ionicons name="add" size={24} color={APP_COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {addresses.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="location-outline" size={64} color={APP_COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>Add your delivery address to get started</Text>
            <TouchableOpacity style={styles.addFirstButton} onPress={() => setShowForm(true)}>
              <Ionicons name="add-circle" size={20} color="#FFF" />
              <Text style={styles.addFirstText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((address) => (
            <View key={address.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <View style={styles.addressLabel}>
                  <Ionicons
                    name={address.label === 'Home' ? 'home' : address.label === 'Office' ? 'business' : 'location'}
                    size={20}
                    color={APP_COLORS.primary}
                  />
                  <Text style={styles.addressLabelText}>{address.label}</Text>
                  {address.is_default && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <View style={styles.addressActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleEdit(address)}>
                    <Ionicons name="pencil" size={18} color={APP_COLORS.textSecondary} />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.actionButton} onPress={() => handleDelete(address.id)}>
                    <Ionicons name="trash" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.addressLine1}>{address.line1}</Text>
              {address.line2 && address.line2.length > 0 && (
                <Text style={styles.addressLine2}>{address.line2}</Text>
              )}
              <Text style={styles.addressCity}>{address.city}</Text>
              {!address.is_default && (
                <TouchableOpacity style={styles.setDefaultButton} onPress={() => setDefault(address.id)}>
                  <Ionicons name="checkmark-circle-outline" size={16} color={APP_COLORS.primary} />
                  <Text style={styles.setDefaultText}>Set as default</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </ScrollView>

      <Modal visible={showForm} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={resetForm}>
                <Ionicons name="close" size={24} color={APP_COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Label *</Text>
                <View style={styles.labelChips}>
                  {['Home', 'Office', 'Other'].map((l) => (
                    <TouchableOpacity
                      key={l}
                      style={[styles.labelChip, label === l && styles.labelChipActive]}
                      onPress={() => setLabel(l)}
                    >
                      <Text style={[styles.labelChipText, label === l && styles.labelChipTextActive]}>
                        {l}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Street Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="No 45, Street Name"
                  value={line1}
                  onChangeText={setLine1}
                  placeholderTextColor={APP_COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Apt / Floor (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Apt 3B, 3rd Floor"
                  value={line2}
                  onChangeText={setLine2}
                  placeholderTextColor={APP_COLORS.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>City *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Colombo 03"
                  value={city}
                  onChangeText={setCity}
                  placeholderTextColor={APP_COLORS.textSecondary}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {editingAddress ? 'Update Address' : 'Save Address'}
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: APP_COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: APP_COLORS.card,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text },
  addButton: { padding: 4 },
  scrollContent: { padding: 20, paddingBottom: 100 },
  addressCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addressLabel: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  addressLabelText: { fontSize: 16, fontWeight: '600', color: APP_COLORS.text },
  defaultBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  defaultText: { fontSize: 10, fontWeight: '600', color: '#065F46' },
  addressActions: { flexDirection: 'row', gap: 8 },
  actionButton: { padding: 4 },
  addressLine1: { fontSize: 14, color: APP_COLORS.text, marginBottom: 2 },
  addressLine2: { fontSize: 14, color: APP_COLORS.textSecondary, marginBottom: 2 },
  addressCity: { fontSize: 14, color: APP_COLORS.textSecondary },
  setDefaultButton: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  setDefaultText: { fontSize: 13, color: APP_COLORS.primary, fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: APP_COLORS.textSecondary, marginTop: 8, textAlign: 'center', marginBottom: 24 },
  addFirstButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: APP_COLORS.primary, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 25, gap: 6 },
  addFirstText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: APP_COLORS.text },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: APP_COLORS.text, marginBottom: 8 },
  labelChips: { flexDirection: 'row', gap: 8 },
  labelChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  labelChipActive: { backgroundColor: APP_COLORS.primary, borderColor: APP_COLORS.primary },
  labelChipText: { fontSize: 14, color: APP_COLORS.textSecondary },
  labelChipTextActive: { color: '#FFF', fontWeight: '600' },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: APP_COLORS.text,
  },
  saveButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});
