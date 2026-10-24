import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useCallback, useState } from 'react';
import { useColorScheme, View } from 'react-native';

import AppTabs from '@/components/app-tabs';
import { StartupSplash } from '@/components/startup-splash';
import { TransactionsProvider } from '@/hooks/use-transactions';

SplashScreen.setOptions({ duration: 450, fade: true });

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const finishStartupSplash = useCallback(() => setShowStartupSplash(false), []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <TransactionsProvider>
        <View style={{ flex: 1 }}>
          <AppTabs />
          {showStartupSplash && <StartupSplash onFinish={finishStartupSplash} />}
        </View>
      </TransactionsProvider>
    </ThemeProvider>
  );
}
