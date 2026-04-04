import { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../context/ThemeContext';
import { APP_COLORS } from '../constants';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: c.card, borderRadius: 20, padding: 24, width: '80%', maxWidth: 320 },
  title: { fontSize: 18, fontWeight: '700', color: c.text, textAlign: 'center', marginBottom: 8 },
  message: { fontSize: 15, color: c.textSecondary, textAlign: 'center', marginBottom: 20, lineHeight: 22 },
  buttons: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  buttonDefault: { backgroundColor: APP_COLORS.primary },
  buttonCancel: { backgroundColor: c.input },
  buttonDestructive: { backgroundColor: '#EF4444' },
  buttonText: { fontSize: 15, fontWeight: '600', color: '#FFF' },
  buttonTextCancel: { color: c.text },
});

export function useCustomAlert() {
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({ visible: false, title: '', message: '', buttons: [] });

  const showAlert = (title: string, message: string, buttons: AlertButton[] = [{ text: 'OK' }]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  const handlePress = (button: AlertButton) => {
    hideAlert();
    if (button.onPress) button.onPress();
  };

  const { colors } = useTheme();
  const styles = createStyles(colors);

  const AlertComponent = () => (
    <Modal visible={alertConfig.visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{alertConfig.title}</Text>
          <Text style={styles.message}>{alertConfig.message}</Text>
          <View style={styles.buttons}>
            {alertConfig.buttons.map((btn, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.button,
                  btn.style === 'cancel' ? styles.buttonCancel : btn.style === 'destructive' ? styles.buttonDestructive : styles.buttonDefault,
                ]}
                onPress={() => handlePress(btn)}
              >
                <Text style={[styles.buttonText, btn.style === 'cancel' && styles.buttonTextCancel]}>
                  {btn.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );

  return { showAlert, AlertComponent };
}
