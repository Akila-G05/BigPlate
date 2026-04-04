import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { APP_COLORS } from "../../src/constants";
import { useAuth } from "../../src/context/AuthContext";
import { useTheme } from "../../src/context/ThemeContext";
import { useThemedAlert } from "../../src/context/ThemedAlertContext";
import type { ThemeColors } from "../../src/context/ThemeContext";
import { supabase } from "../../src/lib/supabaseClient";

const createStyles = (c: ThemeColors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: c.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingTop: 50,
      paddingBottom: 16,
      backgroundColor: c.card,
    },
    backButton: { padding: 4 },
    headerTitle: { fontSize: 18, fontWeight: "700", color: c.text },
    saveButton: { padding: 4 },
    saveText: { fontSize: 16, fontWeight: "700", color: APP_COLORS.primary },
    scrollContent: { padding: 20, paddingBottom: 100 },
    avatarSection: { alignItems: "center", marginBottom: 32 },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: APP_COLORS.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    avatarText: { color: "#FFF", fontSize: 28, fontWeight: "700" },
    section: {
      backgroundColor: c.card,
      borderRadius: 16,
      marginBottom: 16,
      paddingTop: 16,
      paddingLeft: 16,
      borderWidth: 1,
      borderColor: c.border,
      overflow: "hidden",
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: c.text,
      marginBottom: 12,
      paddingHorizontal: 4,
    },
    inputGroup: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    label: {
      fontSize: 13,
      fontWeight: "600",
      color: c.textSecondary,
      marginBottom: 6,
    },
    input: { fontSize: 16, color: c.text, paddingVertical: 4 },
    inputDisabled: { color: c.textSecondary },
    divider: { height: 1, backgroundColor: c.border },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    menuItemText: { flex: 1, fontSize: 15, color: c.text },
    menuSubText: { fontSize: 13, color: c.textSecondary, marginTop: 2 },
  });

export default function ProfileDetailsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors } = useTheme();
  const { showAlert } = useThemedAlert();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const styles = createStyles(colors);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        if (error) throw error;
        if (data) {
          setName(data.name || "");
          setPhone(data.phone || "");
          setEmail(data.email || user.email || "");
        } else {
          setEmail(user.email || "");
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        setEmail(user?.email || "");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      showAlert("Error", "Please enter your name");
      return;
    }
    if (!phone.trim()) {
      showAlert("Error", "Please enter your phone number");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({ name: name.trim(), phone: phone.trim() })
        .eq("id", user?.id);

      if (error) throw error;
      showAlert("Success", "Profile updated successfully");
      router.back();
    } catch (error: any) {
      showAlert("Error", error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile Details</Text>
          <View style={{ width: 40 }} />
        </View>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={APP_COLORS.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile Details</Text>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={APP_COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials || "?"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Info</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter your name"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+94 7X XXX XXXX"
              placeholderTextColor={colors.textSecondary}
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              selectTextOnFocus={false}
            />
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              Email cannot be changed
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/auth/forgot-password")}>
            <Ionicons name="lock-closed" size={22} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Change Password</Text>
              <Text style={styles.menuSubText}>Update your password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push("/address")}
          >
            <Ionicons name="location" size={22} color={colors.textSecondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>Manage Addresses</Text>
              <Text style={styles.menuSubText}>
                Add or edit delivery addresses
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
