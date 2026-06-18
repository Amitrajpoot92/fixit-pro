// src/navigation/AppNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

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
import PaymentMethodsScreen from '../screens/profile/PaymentMethodsScreen';
import OffersScreen from '../screens/profile/OffersScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';

// 🚀 Wallet Module Import
import WalletScreen from '../screens/wallet/WalletScreen';

const Stack = createStackNavigator();

export default function AppNavigator({ user }) {
  return (
    <Stack.Navigator key={user ? 'user' : 'guest'} screenOptions={{ headerShown: false }}>
      {!user ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
          <Stack.Screen name="DeviceSelection" component={DeviceSelectionScreen} />
          <Stack.Screen name="ModelSelection" component={ModelSelectionScreen} />
          <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
          <Stack.Screen name="Checkout" component={CheckoutScreen} />
          <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
          <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
          <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
          
          {/* 🚀 Profile Screens Registered */}
          <Stack.Screen name="EditProfile" component={EditProfileScreen} />
          <Stack.Screen name="Address" component={AddressScreen} />
          <Stack.Screen name="Payments" component={PaymentMethodsScreen} />
          <Stack.Screen name="Offers" component={OffersScreen} />
          <Stack.Screen name="Support" component={SupportScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />

          {/* 🚀 Wallet Screen Registered */}
          <Stack.Screen name="Wallet" component={WalletScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}