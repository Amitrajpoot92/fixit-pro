// src/navigation/AppNavigator.js
import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// 🧠 Auth Context Import
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

// Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import BottomTabNavigator from './BottomTabNavigator'; 
import DeviceSelectionScreen from '../screens/Booking/DeviceSelectionScreen';
import ModelSelectionScreen from '../screens/Booking/ModelSelectionScreen';
import ServiceSelectionScreen from '../screens/Booking/ServiceSelectionScreen'; 
import CheckoutScreen from '../screens/Booking/CheckoutScreen'; 
import PaymentSelectionScreen from '../screens/Booking/PaymentSelectionScreen';
import OrderSuccessScreen from '../screens/Booking/OrderSuccessScreen';
import OrderTrackingScreen from '../screens/Booking/OrderTrackingScreen';

// 🚀 Profile Module Imports
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AddressScreen from '../screens/profile/AddressScreen';
// 🔄 Updated: PaymentMethods replaced with ReferAndEarn
import ReferAndEarnScreen from '../screens/profile/ReferAndEarnScreen';
import OffersScreen from '../screens/profile/OffersScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// 🚀 Wallet Module Import
import WalletScreen from '../screens/wallet/WalletScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  // 🧠 Context se loading state nikaal li (user nikaalne ki yahan zaroorat nahi kyunki sab open hai)
  const { loading } = useAuth();

  // Jab tak Firebase check kar raha hai ki user login hai ya nahi, tab tak loader dikhao
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    // 🚀 initialRouteName "MainTabs" set kiya taaki app khulte hi seedha Home dikhe
    <Stack.Navigator initialRouteName="MainTabs" screenOptions={{ headerShown: false }}>
      
      {/* 🌍 Core Application (Explore First) */}
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      
      {/* 🔐 Authentication Screens (Jab zarurat ho tab yahan bhejenge) */}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />

      {/* 🛠️ Booking Flow Screens */}
      <Stack.Screen name="DeviceSelection" component={DeviceSelectionScreen} />
      <Stack.Screen name="ModelSelection" component={ModelSelectionScreen} />
      <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      
      {/* 🚀 Profile Screens */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      {/* 🔄 Updated Route Name */}
      <Stack.Screen name="ReferEarn" component={ReferAndEarnScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />

      {/* 🚀 Wallet Screen */}
      <Stack.Screen name="Wallet" component={WalletScreen} />

    </Stack.Navigator>
  );
}