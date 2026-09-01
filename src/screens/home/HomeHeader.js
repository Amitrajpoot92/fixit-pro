// src/components/home/HomeHeader.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Image, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors'; 

// 🔥 Firebase & Auth Imports for Live Cart Count
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeHeader({ navigation }) {
  const { user } = useAuth();
  const [cartCount, setCartCount] = useState(0);

  // 🚀 Fetch Live Cart Count from Firebase
  useEffect(() => {
    if (!user) {
      setCartCount(0);
      return;
    }
    
    const q = query(collection(db, `users/${user.uid}/cart`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCartCount(snapshot.docs.length);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <View style={styles.container}>
      {/* 1. LOGO & TOP ICONS */}
      <View style={styles.header}>
        <View style={styles.brandLeft}>
          <Image source={require('../../../assets/platform-img/logo.png')} style={styles.logoIcon} />
          <Text style={styles.logoText}>Fixit</Text>
          <LinearGradient 
            colors={['#3B82F6', '#2563EB']} 
            start={{x: 0, y: 0}} end={{x: 1, y: 1}}
            style={styles.logoProBox}
          >
            <Text style={styles.logoProText}>Pro</Text>
          </LinearGradient>
        </View>

        <View style={styles.headerRight}>
          {/* 🚀 Real Cart Button */}
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('CartScreen')}
            activeOpacity={0.7}
          >
            <MaterialIcons name="shopping-cart" size={26} color="#1E293B" />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SEARCH BAR */}
      <TouchableOpacity 
        style={styles.searchContainer}
        onPress={() => navigation.navigate('SearchScreen')}
        activeOpacity={0.9}
      >
        <MaterialIcons name="search" size={22} color="#64748B" />
        <Text style={styles.searchInput}>Search for cases, chargers, repairs...</Text>
        <View style={styles.micBox}>
          <MaterialIcons name="mic-none" size={20} color="#3B82F6" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F8FAFC', 
    paddingBottom: 10,
  },
  /* HEADER */
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingTop: 15, 
    paddingBottom: 15 
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center' },
  logoIcon: { width: 32, height: 32, resizeMode: 'contain' },
  logoText: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginLeft: 8, marginRight: 6, letterSpacing: -0.5 },
  logoProBox: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 3 },
  logoProText: { color: colors.white, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { position: 'relative', padding: 6, backgroundColor: '#FFF', borderRadius: 12, ...Platform.select({ ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8 }, android: { elevation: 3 } }) },
  badge: { 
    position: 'absolute', 
    top: -4, 
    right: -4, 
    backgroundColor: '#EF4444', 
    borderRadius: 12, 
    minWidth: 20, 
    height: 20, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 2, 
    borderColor: '#FFF',
    paddingHorizontal: 4,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  badgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },

  /* SEARCH BAR */
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFF', 
    marginHorizontal: 20, 
    paddingHorizontal: 16,
    paddingVertical: 12, 
    borderRadius: 30, 
    borderWidth: 1, 
    borderColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 2 },
    })
  },
  searchInput: { marginLeft: 12, flex: 1, fontSize: 14, color: '#94A3B8', fontWeight: '500' },
  micBox: {
    backgroundColor: '#EFF6FF',
    padding: 6,
    borderRadius: 20,
  }
});