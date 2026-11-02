// src/navigation/BottomTabNavigator.js
import React from 'react';
import { View, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home/HomeScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import ProductsMainScreen from '../screens/accessories/ProductsMainScreen';

import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

// 🎯 YouTube/Material-style clean icon wrapper with active pill background
const TabIcon = ({ focused, activeIcon, inactiveIcon }) => {
  return (
    <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
      <Ionicons
        name={focused ? activeIcon : inactiveIcon}
        size={20}
        color={focused ? colors.link : '#94A3B8'}
      />
    </View>
  );
};

export default function BottomTabNavigator() {
  const insets = useSafeAreaInsets();

  // 🚀 AUTOMATIC & SLEEK SNUG FIT:
  // insets.bottom navigation mode (3-button vs gesture navigation) ke hisaab se automatic adjust hoga.
  const paddingBottom = insets.bottom > 0 ? insets.bottom : 0;
  const tabBarHeight = 56 + paddingBottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.link,
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 2,
          marginBottom: 4,
          includeFontPadding: false,
        },
        tabBarStyle: [
          styles.standardTabBar,
          {
            height: tabBarHeight,
            paddingBottom: paddingBottom,
          }
        ],
        tabBarItemStyle: {
          justifyContent: 'center',
          alignItems: 'center',
          paddingTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon="home" inactiveIcon="home-outline" />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon="receipt" inactiveIcon="receipt-outline" />
          ),
        }}
      />
      <Tab.Screen
        name="ProductsTab"
        component={ProductsMainScreen}
        options={{
          tabBarLabel: 'Products',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon="cart" inactiveIcon="cart-outline" />
          ),
        }}
      />
      <Tab.Screen
        name="Bookings"
        component={BookingsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon="calendar" inactiveIcon="calendar-outline" />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} activeIcon="person" inactiveIcon="person-outline" />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  standardTabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    ...Platform.select({
      ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 8 },
    })
  },

  iconBox: {
    width: 38,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },

  iconBoxActive: {
    backgroundColor: '#EFF6FF',
  },
});