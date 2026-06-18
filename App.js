// App.js 
import 'react-native-gesture-handler'; // 🚀 CRITICAL FIX: Ye LINE 1 par hi hona chahiye!
import React from 'react';
import { Platform, LogBox } from 'react-native'; // 🚀 ADDED: Platform aur LogBox import
import { SafeAreaProvider } from 'react-native-safe-area-context'; // 🚀 CRITICAL FIX: For Android Notches
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { TabVisibilityProvider } from './src/context/TabVisibilityContext';

// 🚀 1. Mobile screen ki warnings chup karne ke liye
LogBox.ignoreLogs([
  'props.pointerEvents is deprecated',
  '"shadow*" style props are deprecated'
]);

// 🚀 2. Web Browser ke console ka kachra saaf karne ke liye (Master Trick)
if (Platform.OS === 'web') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' && 
      (args[0].includes('pointerEvents is deprecated') || args[0].includes('"shadow*" style props are deprecated'))
    ) {
      return; // Inko console mein mat dikhao
    }
    originalWarn(...args);
  };
}

export default function App() {
  // Abhi test karne ke liye user ko 'true' (logged in) set kiya hai
  const user = true;

  return (
    // 🚀 SafeAreaProvider se wrap karna bohot zaroori hai native app ke liye
    <SafeAreaProvider> 
      <TabVisibilityProvider>
        <NavigationContainer>
          <AppNavigator user={user} />
        </NavigationContainer>
      </TabVisibilityProvider>
    </SafeAreaProvider>
  );
}