import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { strings } from './i18n';
import SlideShowScreen from './SlideShowScreen';
import ThemeScreen from './ThemeScreen';
import MemoryScreen from './MemoryScreen';
import SettingsScreen from './SettingsScreen';

const Tab = createBottomTabNavigator();

function AppNavigator() {
  const { lang } = useLanguage();
  const L = strings[lang] ?? strings.ja;

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: { backgroundColor: '#0a0a0f', borderTopColor: 'rgba(255,255,255,0.06)' },
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#797979',
          headerStyle: { backgroundColor: '#0a0a0f' },
          headerTintColor: '#fff',
        }}
      >
        <Tab.Screen
          name="slides"
          component={SlideShowScreen}
          options={{
            title: L.tabs.slides,
            tabBarLabel: L.tabs.slides,
            tabBarIcon: () => <Text style={{ fontSize: 18 }}>📷</Text>,
          }}
        />
        <Tab.Screen
          name="memory"
          component={MemoryScreen}
          options={{
            title: L.tabs.memory,
            tabBarLabel: L.tabs.memory,
            tabBarIcon: () => <Text style={{ fontSize: 18 }}>🧠</Text>,
          }}
        />
        <Tab.Screen
          name="theme"
          component={ThemeScreen}
          options={{
            title: L.tabs.theme,
            tabBarLabel: L.tabs.theme,
            tabBarIcon: () => <Text style={{ fontSize: 18 }}>🎲</Text>,
          }}
        />
        <Tab.Screen
          name="settings"
          component={SettingsScreen}
          options={{
            title: L.tabs.settings,
            tabBarLabel: L.tabs.settings,
            tabBarIcon: () => <Text style={{ fontSize: 18 }}>⚙️</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AppNavigator />
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
