import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import type { ThemeColors } from '../context/ThemeContext';
import { APP_COLORS } from '../constants';

export interface ThemedAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons: ThemedAlertButton[];
}

interface ThemedAlertContextType {
  showAlert: (title: string, message: string, buttons?: ThemedAlertButton[]) => void;
}

const ThemedAlertContext = createContext<ThemedAlertContextType | undefined>(undefined);

export function useThemedAlert() {
  const context = useContext(ThemedAlertContext);
  if (!context) throw new Error('useThemedAlert must be used within ThemedAlertProvider');
  return context;
}

const createStyles = (c: ThemeColors) => StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  container: { backgroundColor: c.card, borderRadius: 20, padding: 24, width: '80%', maxWidth: 320, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
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

export function ThemedAlertProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [config, setConfig] = useState<AlertConfig>({ visible: false, title: '', message: '', buttons: [] });
  const opacity = useRef(new Animated.Value(0)).current;

  const showAlert = useCallback((title: string, message: string, buttons: ThemedAlertButton[] = [{ text: 'OK' }]) => {
    setConfig({ visible: true, title, message, buttons });
    Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
  }, [opacity]);

  const hideAlert = useCallback(() => {
    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setConfig((prev) => ({ ...prev, visible: false }));
    });
  }, [opacity]);

  const handlePress = useCallback((button: ThemedAlertButton) => {
    hideAlert();
    if (button.onPress) setTimeout(button.onPress, 160);
  }, [hideAlert]);

  return (
    <ThemedAlertContext.Provider value={{ showAlert }}>
      {children}
      <Modal visible={config.visible} transparent animationType="none">
        <View style={styles.overlay}>
          <Animated.View style={{ opacity, width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
            <TouchableOpacity style={{ position: 'absolute', width: '100%', height: '100%' }} activeOpacity={1} onPress={hideAlert} />
            <View style={styles.container} onStartShouldSetResponder={() => true}>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.message}>{config.message}</Text>
              <View style={styles.buttons}>
                {config.buttons.map((btn, i) => (
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
          </Animated.View>
        </View>
      </Modal>
    </ThemedAlertContext.Provider>
  );
}
