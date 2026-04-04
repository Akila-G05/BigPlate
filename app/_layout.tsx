import { Stack } from "expo-router";
import { ThemeProvider } from "../src/context/ThemeContext";
import { ThemedAlertProvider } from "../src/context/ThemedAlertContext";
import { AuthProvider } from "../src/context/AuthContext";
import { CartProvider } from "../src/context/CartContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <ThemedAlertProvider>
        <AuthProvider>
          <CartProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </CartProvider>
        </AuthProvider>
      </ThemedAlertProvider>
    </ThemeProvider>
  );
}
