import { useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { APP_COLORS } from '../constants';

interface FoodImageProps {
  uri: string | number; // Allow both URL strings and local image numbers
  size?: number;
  borderRadius?: number;
  style?: object;
}

const PLACEHOLDER_COLORS = [
  '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE', '#EDE9FE', '#FCE7F3',
];

function getPlaceholderColor(uri: string | number) {
  const str = typeof uri === 'string' ? uri : String(uri);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

export function FoodImage({ uri, size = 80, borderRadius = 12, style }: FoodImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const bgColor = getPlaceholderColor(uri);

  // Determine if it's a local image (number) or remote URL (string)
  const isLocal = typeof uri === 'number';
  const imageSource = isLocal ? uri : { uri: uri as string };

  if (hasError && !isLocal) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius, backgroundColor: bgColor },
          style,
        ]}
      >
        <Ionicons name="image-outline" size={size * 0.4} color={APP_COLORS.textSecondary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius, backgroundColor: bgColor },
        style,
      ]}
    >
      {isLoading && !isLocal && (
        <ActivityIndicator size="small" color={APP_COLORS.primary} style={styles.loader} />
      )}
      <Image
        source={imageSource}
        style={[styles.image, { width: size, height: size, borderRadius }]}
        onLoadStart={() => !isLocal && setIsLoading(true)}
        onLoadEnd={() => !isLocal && setIsLoading(false)}
        onError={() => {
          if (!isLocal) {
            setIsLoading(false);
            setHasError(true);
          }
        }}
      />
    </View>
  );
}

const PLACEHOLDER_COLORS = [
  '#FEE2E2', '#FEF3C7', '#D1FAE5', '#DBEAFE', '#EDE9FE', '#FCE7F3',
];

function getPlaceholderColor(uri: string) {
  let hash = 0;
  for (let i = 0; i < uri.length; i++) {
    hash = uri.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

export function FoodImage({ uri, size = 80, borderRadius = 12, style }: FoodImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const bgColor = getPlaceholderColor(uri);

  if (hasError) {
    return (
      <View
        style={[
          styles.container,
          { width: size, height: size, borderRadius, backgroundColor: bgColor },
          style,
        ]}
      >
        <Ionicons name="image-outline" size={size * 0.4} color={APP_COLORS.textSecondary} />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius, backgroundColor: bgColor },
        style,
      ]}
    >
      {isLoading && (
        <ActivityIndicator size="small" color={APP_COLORS.primary} style={styles.loader} />
      )}
      <Image
        source={{ uri }}
        style={[styles.image, { width: size, height: size, borderRadius }]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </View>
  );
}

export function HeroImage({ uri, style }: { uri: string; style?: object }) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <View style={[styles.heroPlaceholder, style]}>
        <Ionicons name="restaurant-outline" size={48} color={APP_COLORS.textSecondary} />
      </View>
    );
  }

  return (
    <View style={[styles.heroContainer, style]}>
      {isLoading && (
        <ActivityIndicator size="large" color="#FFF" style={styles.heroLoader} />
      )}
      <Image
        source={{ uri }}
        style={[styles.heroImage, style]}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  image: { position: 'absolute' },
  loader: { position: 'absolute' },
  heroContainer: { justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  heroImage: { position: 'absolute' },
  heroLoader: { position: 'absolute' },
  heroPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
  },
});
