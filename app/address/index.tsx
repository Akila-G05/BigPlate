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
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../../src/constants';
import { useAuth } from '../../src/context/AuthContext';
import { supabase } from '../../src/lib/supabaseClient';

type City = { id: string; name: string; delivery_time_minutes: number; delivery_fee: number };
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
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [label, setLabel] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [saving, setSaving] = useState(false);

  const fetchCities = useCallback(async () => {
    const { data } = await supabase.from('cities').select('*').eq('is_active', true).order('name', { ascending: true });
    if (data) setCities(data);
  }, []);

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
    fetchCities();
    fetchAddresses();
  }, [fetchCities, fetchAddresses]);

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
    setSelectedCity(null);
    setEditingAddress(null);
    setShowForm(false);
    setShowCityPicker(false);
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setLabel(address.label);
    setLine1(address.line1);
    setLine2(address.line2 || '');
    const city = cities.find((c) => c.name === address.city);
    setSelectedCity(city || null);
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
    if (!label.trim() || !line1.trim() || !selectedCity) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      if (editingAddress) {
        const { error } = await supabase
          .from('addresses')
          .update({ label, line1, line2: line2 || null, city: selectedCity.name })
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
            city: selectedCity.name,
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

      {/* Add/Edit Modal */}
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
                <TouchableOpacity style={styles.cityPicker} onPress={() => setShowCityPicker(true)}>
                  <Ionicons name="location" size={20} color={APP_COLORS.textSecondary} />
                  <Text style={[styles.cityPickerText, !selectedCity && styles.cityPickerPlaceholder]}>
                    {selectedCity ? selectedCity.name : 'Select your city'}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={APP_COLORS.textSecondary} />
                </TouchableOpacity>
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

      {/* City Picker Modal */}
      <Modal visible={showCityPicker} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.cityPickerModal}>
            <View style={styles.cityPickerHeader}>
              <Text style={styles.cityPickerTitle}>Select City</Text>
              <TouchableOpacity onPress={() => setShowCityPicker(false)}>
                <Ionicons name="close" size={24} color={APP_COLORS.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={cities}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.cityItem, selectedCity?.id === item.id && styles.cityItemSelected]}
                  onPress={() => {
                    setSelectedCity(item);
                    setShowCityPicker(false);
                  }}
                >
                  <Ionicons name="location" size={20} color={APP_COLORS.primary} />
                  <Text style={[styles.cityName, selectedCity?.id === item.id && styles.cityNameSelected]}>
                    {item.name}
                  </Text>
                  <Text style={styles.cityDeliveryInfo}>
                    {item.delivery_time_minutes} min • Rs. {item.delivery_fee}
                  </Text>
                  {selectedCity?.id === item.id && (
                    <Ionicons name="checkmark-circle" size={22} color={APP_COLORS.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
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
  cityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: APP_COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  cityPickerText: { flex: 1, fontSize: 16, color: APP_COLORS.text },
  cityPickerPlaceholder: { color: APP_COLORS.textSecondary },
  saveButton: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cityPickerModal: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 24,
  },
  cityPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
  },
  cityPickerTitle: { fontSize: 18, fontWeight: '700', color: APP_COLORS.text },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: APP_COLORS.border,
    gap: 12,
  },
  cityItemSelected: { backgroundColor: '#FFF5F5' },
  cityName: { flex: 1, fontSize: 16, color: APP_COLORS.text },
  cityNameSelected: { fontWeight: '600', color: APP_COLORS.primary },
  cityDeliveryInfo: { fontSize: 12, color: APP_COLORS.textSecondary },
});
