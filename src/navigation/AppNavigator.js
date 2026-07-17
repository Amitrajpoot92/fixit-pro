import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import AddressScreen from '../screens/profile/AddressScreen';
import ReferAndEarnScreen from '../screens/profile/ReferAndEarnScreen';
import OffersScreen from '../screens/profile/OffersScreen';
import SupportScreen from '../screens/profile/SupportScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import WalletScreen from '../screens/wallet/WalletScreen';
import PickupDropInfo from '../screens/knowledge/PickupDropInfo';
import HomeServiceInfo from '../screens/knowledge/HomeServiceInfo';
import ProductsMainScreen from '../screens/accessories/ProductsMainScreen';
import ProductDetailScreen from '../screens/accessories/ProductDetailScreen';
import ProductCheckoutScreen from '../screens/accessories/ProductCheckoutScreen';
import CartScreen from '../screens/accessories/CartScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator 
      initialRouteName="MainTabs" 
      screenOptions={{ 
        headerShown: false,
        animation: 'slide_from_right' // 👈 Smoother performance in production
      }}
    >
      <Stack.Screen name="MainTabs" component={BottomTabNavigator} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="DeviceSelection" component={DeviceSelectionScreen} />
      <Stack.Screen name="ModelSelection" component={ModelSelectionScreen} />
      <Stack.Screen name="ServiceSelection" component={ServiceSelectionScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="PaymentSelection" component={PaymentSelectionScreen} />
      <Stack.Screen name="OrderSuccess" component={OrderSuccessScreen} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Address" component={AddressScreen} />
      <Stack.Screen name="ReferEarn" component={ReferAndEarnScreen} />
      <Stack.Screen name="Offers" component={OffersScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="PickupDropInfo" component={PickupDropInfo} />
      <Stack.Screen name="HomeServiceInfo" component={HomeServiceInfo} />
      <Stack.Screen name="ProductsMain" component={ProductsMainScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen name="ProductCheckout" component={ProductCheckoutScreen} />
      <Stack.Screen name="CartScreen" component={CartScreen} />
    </Stack.Navigator>
  );
}