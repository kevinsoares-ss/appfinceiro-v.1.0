import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

type StartupSplashProps = {
  onFinish: () => void;
};

export function StartupSplash({ onFinish }: StartupSplashProps) {
  const [splashOpacity] = useState(() => new Animated.Value(1));
  const [markOpacity] = useState(() => new Animated.Value(0));
  const [markScale] = useState(() => new Animated.Value(0.7));
  const [titleOpacity] = useState(() => new Animated.Value(0));
  const [titleOffset] = useState(() => new Animated.Value(16));
  const [progress] = useState(() => new Animated.Value(0));
  const [coinRotation] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const intro = Animated.parallel([
      Animated.spring(markScale, {
        toValue: 1,
        damping: 12,
        stiffness: 150,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(markOpacity, {
        toValue: 1,
        duration: 420,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.sequence([
        Animated.delay(180),
        Animated.parallel([
          Animated.timing(titleOpacity, {
            toValue: 1,
            duration: 360,
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(titleOffset, {
            toValue: 0,
            duration: 360,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ]),
    ]);

    const coinAnimation = Animated.loop(
      Animated.timing(coinRotation, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      })
    );

    let finishTimer: ReturnType<typeof setTimeout> | undefined;
    const progressTimer = setTimeout(() => {
      Animated.timing(progress, {
        toValue: 1,
        duration: 680,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    }, 360);
    const fadeTimer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 360,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
      finishTimer = setTimeout(onFinish, 360);
    }, 1500);

    intro.start();
    coinAnimation.start();

    return () => {
      clearTimeout(progressTimer);
      clearTimeout(fadeTimer);
      if (finishTimer) {
        clearTimeout(finishTimer);
      }
      intro.stop();
      coinAnimation.stop();
    };
  }, [
    coinRotation,
    markOpacity,
    markScale,
    onFinish,
    progress,
    splashOpacity,
    titleOffset,
    titleOpacity,
  ]);

  const coinSpin = coinRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      accessibilityLabel="Carregando Meu Dinheiro"
      accessibilityRole="progressbar"
      style={[styles.overlay, { opacity: splashOpacity }]}
    >
      <StatusBar style="light" />
      <View pointerEvents="none" style={styles.glowTop} />
      <View pointerEvents="none" style={styles.glowBottom} />

      <View style={styles.content}>
        <Animated.View
          style={[
            styles.mark,
            {
              opacity: markOpacity,
              transform: [{ scale: markScale }],
            },
          ]}
        >
          <View style={styles.wallet}>
            <Text style={styles.currency}>R$</Text>
            <View style={styles.walletPocket}>
              <View style={styles.walletDot} />
            </View>
          </View>
          <Animated.View style={[styles.coin, { transform: [{ rotate: coinSpin }] }]}>
            <Text style={styles.coinText}>+</Text>
          </Animated.View>
        </Animated.View>

        <Animated.View
          style={[
            styles.brand,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleOffset }],
            },
          ]}
        >
          <Text style={styles.title}>Meu Dinheiro</Text>
          <Text style={styles.subtitle}>Sua vida financeira, mais leve.</Text>
        </Animated.View>
      </View>

      <View style={styles.loading}>
        <View style={styles.progressTrack}>
          <Animated.View
            style={[
              styles.progressFill,
              {
                transform: [{ scaleX: progress }],
              },
            ]}
          />
        </View>
        <Text style={styles.loadingText}>Preparando tudo para você</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    zIndex: 10,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#253A70',
  },
  glowTop: {
    position: 'absolute',
    top: -150,
    right: -95,
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: '#4169C1',
    opacity: 0.36,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -190,
    left: -130,
    width: 380,
    height: 380,
    borderRadius: 190,
    backgroundColor: '#16834A',
    opacity: 0.2,
  },
  content: {
    alignItems: 'center',
    marginTop: -20,
  },
  mark: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
    shadowColor: '#071534',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.24,
    shadowRadius: 20,
    elevation: 12,
  },
  wallet: {
    width: 66,
    height: 48,
    justifyContent: 'center',
    paddingLeft: 10,
    borderRadius: 10,
    backgroundColor: '#253A70',
  },
  currency: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  walletPocket: {
    position: 'absolute',
    right: -1,
    top: 12,
    width: 23,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopLeftRadius: 7,
    borderBottomLeftRadius: 7,
    backgroundColor: '#4169C1',
  },
  walletDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  coin: {
    position: 'absolute',
    top: -12,
    right: -12,
    width: 37,
    height: 37,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    borderRadius: 19,
    backgroundColor: '#F2C45D',
  },
  coinText: {
    color: '#684D13',
    fontSize: 21,
    fontWeight: '800',
    lineHeight: 24,
  },
  brand: {
    alignItems: 'center',
    marginTop: 28,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  subtitle: {
    marginTop: 8,
    color: '#D8E1FF',
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  loading: {
    position: 'absolute',
    right: 36,
    bottom: 54,
    left: 36,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    maxWidth: 260,
    height: 4,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  progressFill: {
    flex: 1,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    color: '#D8E1FF',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.3,
  },
});
