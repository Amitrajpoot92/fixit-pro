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
import { useTabVisibility } from '../context/TabVisibilityContext'; 

const Tab = createBottomTabNavigator();

const TabIcon = ({ focused, activeIcon, inactiveIcon, label }) => {
  return (
    <View style={styles.iconContainer}>
      <View style={[styles.iconBox, focused && styles.iconBoxActive]}>
        <Ionicons 
          name={focused ? activeIcon : inactiveIcon} 
          size={focused ? 20 : 22} 
          color={focused ? colors.link : '#94A3B8'} 
        />
      </View>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
    </View>
  );
};

export default function BottomTabNavigator() {
  const { isTabBarVisible } = useTabVisibility(); 

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        safeAreaInsets: { bottom: 0, top: 0 }, 
        tabBarStyle: [
            styles.floatingTabBar,
            { display: isTabBarVisible ? 'flex' : 'none' }, 
        ],
        tabBarItemStyle: { 
          height: '100%', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: 0, 
          margin: 0 
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
  floatingTabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 35 : 20, 
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 35, 
    height: 70, 
    borderTopWidth: 0, 
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingBottom: 0, 
    paddingTop: 0,
    overflow: 'hidden', 
    // 🚀 THE FIX: Yahan se old shadow nikal kar Platform select add kar diya
    ...Platform.select({
      ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
      android: { elevation: 20 },
      web: { boxShadow: '0px 10px 20px rgba(30, 41, 59, 0.1)' }
    })
  },
  
  iconContainer: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    // Android ke liye 6 se badha kar 16 kar diya. 
    marginTop: Platform.OS === 'android' ? 16 : 10, 
  },
  
  iconBox: { 
    width: 48, 
    height: 30, 
    borderRadius: 15, 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 4 
  },
  
  iconBoxActive: { 
    backgroundColor: '#EFF6FF', 
  },
  
  tabLabel: { 
    fontSize: 10, 
    fontWeight: '600', 
    color: '#94A3B8',
    textAlign: 'center',
  },
  
  tabLabelActive: { 
    color: colors.link, 
    fontWeight: '800' 
  }
});