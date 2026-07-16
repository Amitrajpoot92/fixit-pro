// src/navigation/BottomTabNavigator.js
import React from 'react';
import { View, Text, Platform, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; 

import HomeScreen from '../screens/home/HomeScreen';
import OrdersScreen from '../screens/orders/OrdersScreen';
import BookingsScreen from '../screens/bookings/BookingsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen'; 

import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, activeIcon, inactiveIcon, label }) => {
  return (
    <View style={styles.tabContent}>
      {/* Icon Wrapper */}
      <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
        <Ionicons 
          name={focused ? activeIcon : inactiveIcon} 
          size={22} 
          color={focused ? colors.link : '#94A3B8'} 
        />
      </View>
      {/* Label */}
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
};

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.standardTabBar,
        // Item style fix taaki tabs evenly distribute hon
        tabBarItemStyle: { 
          justifyContent: 'center', 
          alignItems: 'center',
          paddingTop: 5,
        }, 
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({focused}) => <TabIcon focused={focused} activeIcon="home" inactiveIcon="home-outline" label="Home" /> }} 
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen} 
        options={{ tabBarIcon: ({focused}) => <TabIcon focused={focused} activeIcon="receipt" inactiveIcon="receipt-outline" label="Orders" /> }} 
      />
      <Tab.Screen 
        name="Bookings" 
        component={BookingsScreen} 
        options={{ tabBarIcon: ({focused}) => <TabIcon focused={focused} activeIcon="calendar" inactiveIcon="calendar-outline" label="Bookings" /> }} 
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ tabBarIcon: ({focused}) => <TabIcon focused={focused} activeIcon="person" inactiveIcon="person-outline" label="Profile" /> }} 
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  standardTabBar: {
    backgroundColor: '#FFFFFF',
    height: Platform.OS === 'ios' ? 85 : 65, 
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingBottom: Platform.OS === 'ios' ? 20 : 5, 
    ...Platform.select({
      ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 5 },
      android: { elevation: 8 },
    })
  },
  
  tabContent: { 
    alignItems: 'center', 
    justifyContent: 'center',
    width: 60, // Fixed width taaki text center rahe
  },
  
  iconBox: { 
    width: 40, 
    height: 25, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 12,
  },
  
  iconBoxActive: { 
    backgroundColor: '#EFF6FF', 
  },
  
  tabLabel: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: '#94A3B8',
    marginTop: 4, // Icon se thoda gap
  },
  
  tabLabelActive: { 
    color: colors.link, 
  }
});