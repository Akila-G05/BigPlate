import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { APP_COLORS } from '../constants';

export function SkeletonCard() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { opacity }]} />
      <View style={styles.info}>
        <Animated.View style={[styles.line, styles.lineShort, { opacity }]} />
        <Animated.View style={[styles.line, styles.lineMedium, { opacity }]} />
        <Animated.View style={[styles.line, styles.linePrice, { opacity }]} />
      </View>
    </View>
  );
}

export function SkeletonHero() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.hero, { opacity }]} />;
}

export function SkeletonCategory() {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return <Animated.View style={[styles.category, { opacity }]} />;
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: APP_COLORS.border,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  info: { flex: 1, marginLeft: 12, justifyContent: 'space-between', paddingVertical: 4 },
  line: { height: 14, borderRadius: 7, backgroundColor: '#E5E7EB' },
  lineShort: { width: '60%' },
  lineMedium: { width: '80%' },
  linePrice: { width: '40%', height: 16 },
  hero: {
    margin: 20,
    height: 160,
    borderRadius: 20,
    backgroundColor: '#E5E7EB',
  },
  category: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    marginRight: 16,
  },
});
