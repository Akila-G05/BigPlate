import { Stack } from "expo-router";
import { ThemeProvider } from "../src/context/ThemeContext";
import { ThemedAlertProvider } from "../src/context/ThemedAlertContext";
import { NotificationProvider } from "../src/context/NotificationContext";
import { PushNotificationProvider } from "../src/context/PushNotificationContext";
import { AuthProvider } from "../src/context/AuthContext";
import { CartProvider } from "../src/context/CartContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedAlertProvider>
        <AuthProvider>
          <PushNotificationProvider>
            <NotificationProvider>
              <CartProvider>
                <Stack screenOptions={{ headerShown: false }} />
              </CartProvider>
            </NotificationProvider>
          </PushNotificationProvider>
        </AuthProvider>
      </ThemedAlertProvider>
    </ThemeProvider>
  );
}
