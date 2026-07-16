// src/components/home/HomeHeader.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors'; 

// 🔥 Firebase & Auth Imports for Live Cart Count
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

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
    <View>
      {/* 1. LOGO & TOP ICONS */}
      <View style={styles.header}>
        <View style={styles.brandLeft}>
          <Ionicons name="settings" size={24} color={colors.primary} />
          <Text style={styles.logoText}>Fixit</Text>
          <View style={styles.logoProBox}>
            <Text style={styles.logoProText}>Pro</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          {/* 🚀 Real Cart Button */}
          <TouchableOpacity 
            style={styles.iconBtn} 
            onPress={() => navigation.navigate('CartScreen')}
          >
            <MaterialIcons name="shopping-cart" size={26} color={colors.textDark} />
            {cartCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. SEARCH BAR */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={22} color={colors.textMuted} />
        <TextInput 
          placeholder="Search for services, accessories..." 
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput} 
        />
        <MaterialIcons name="mic-none" size={22} color={colors.textMuted} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  /* HEADER */
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 15, 
    paddingTop: 15, 
    paddingBottom: 10 
  },
  brandLeft: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '900', color: colors.primary, marginLeft: 6, marginRight: 4 },
  logoProBox: { backgroundColor: colors.link, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  logoProText: { color: colors.white, fontSize: 12, fontWeight: '800' },

  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { position: 'relative', padding: 4 },
  badge: { 
    position: 'absolute', 
    top: -2, 
    right: -2, 
    backgroundColor: colors.error, 
    borderRadius: 10, 
    minWidth: 18, 
    height: 18, 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderWidth: 1.5, 
    borderColor: colors.white,
    paddingHorizontal: 3
  },
  badgeText: { color: colors.white, fontSize: 10, fontWeight: 'bold' },

  /* SEARCH BAR */
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: colors.inputBg, 
    marginHorizontal: 15, 
    marginVertical: 15, 
    padding: 12, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: colors.borderColor 
  },
  searchInput: { marginHorizontal: 10, flex: 1, fontSize: 14, color: colors.textDark, outlineStyle: 'none' },
});