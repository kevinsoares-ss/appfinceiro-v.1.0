import { Colors } from '@/constants/theme';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AppTabs() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
        }}
      />
      <Tabs.Screen
        name="new-transaction"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}