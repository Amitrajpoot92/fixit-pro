// App.js 
import 'react-native-gesture-handler'; // 🚀 CRITICAL FIX: Ye LINE 1 par hi hona chahiye!
import React from 'react';
import { Platform, LogBox } from 'react-native'; 
import { SafeAreaProvider } from 'react-native-safe-area-context'; 
import { NavigationContainer } from '@react-navigation/native';

// 🧠 Contexts Import
import { AuthProvider } from './src/context/AuthContext';
import { TabVisibilityProvider } from './src/context/TabVisibilityContext';

import AppNavigator from './src/navigation/AppNavigator';

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
  // 🚀 Hardcoded user = true hata diya gaya hai.
  // Ab Firebase aur AuthContext khud decide karenge ki user login hai ya nahi.

  return (
    // 🚀 SafeAreaProvider se wrap karna bohot zaroori hai native app ke liye
    <SafeAreaProvider> 
      {/* 🧠 App ka Dimaag (Auth) sabse upar laga diya */}
      <AuthProvider>
        <TabVisibilityProvider>
          <NavigationContainer>
            {/* 🚀 AppNavigator ko ab alag se user pass karne ki zaroorat nahi */}
            <AppNavigator />
          </NavigationContainer>
        </TabVisibilityProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}