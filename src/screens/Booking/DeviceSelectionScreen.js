// src/screens/Booking/DeviceSelectionScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Platform, StatusBar, ScrollView, TextInput, Dimensions 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 🌟 Premium Soft Shadows (🚀 FIX: Web fallback added)
const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
  android: { elevation: 5, shadowColor: '#94A3B8' },
  web: { boxShadow: '0px 6px 12px rgba(148, 163, 184, 0.12)' }
});

// 📱 MOCK DATA - Brands
const mobileBrands = [
  { id: '1', name: 'Apple', icon: 'logo-apple', color: '#000000', bg: '#F1F5F9' },
  { id: '2', name: 'Samsung', textIcon: 'S', color: '#1428A0', bg: '#EFF6FF' },
  { id: '3', name: 'OnePlus', textIcon: '1+', color: '#E50010', bg: '#FEF2F2' },
  { id: '4', name: 'Xiaomi', textIcon: 'Mi', color: '#FF6700', bg: '#FFF7ED' },
  { id: '5', name: 'Google', icon: 'logo-google', color: '#EA4335', bg: '#FEF2F2' },
  { id: '6', name: 'Vivo', textIcon: 'V', color: '#415FFF', bg: '#EEF2FF' },
  { id: '7', name: 'Oppo', textIcon: 'O', color: '#007A5E', bg: '#ECFDF5' },
  { id: '8', name: 'Realme', textIcon: 'R', color: '#FFC915', bg: '#FEFCE8' },
  { id: '9', name: 'Other', textIcon: '...', color: '#64748B', bg: '#F8FAFC' },
];

const laptopBrands = [
  { id: '1', name: 'Apple', icon: 'logo-apple', color: '#000000', bg: '#F1F5F9' },
  { id: '2', name: 'HP', textIcon: 'hp', color: '#0096D6', bg: '#F0F9FF' },
  { id: '3', name: 'Dell', textIcon: 'DELL', color: '#007DB8', bg: '#F0F9FF' },
  { id: '4', name: 'Lenovo', textIcon: 'L', color: '#E2231A', bg: '#FEF2F2' },
  { id: '5', name: 'Asus', textIcon: 'A', color: '#00539B', bg: '#EFF6FF' },
  { id: '6', name: 'Acer', textIcon: 'ac', color: '#83B81A', bg: '#F7FEE7' },
];

export default function DeviceSelectionScreen({ navigation }) {
  const [activeDevice, setActiveDevice] = useState('Mobile');
  const [searchQuery, setSearchQuery] = useState('');

  // Search filter logic
  const currentBrands = activeDevice === 'Mobile' ? mobileBrands : laptopBrands;
  const displayedBrands = currentBrands.filter(brand => 
    brand.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 🚀 Yahan se Navigation Hoga
  const handleBrandSelect = (brandName) => {
    navigation.navigate('ModelSelection', { 
      brandName: brandName,
      deviceType: activeDevice 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* 🔙 PREMIUM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Brand</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 50 }}>
        
        {/* 🔄 DEVICE TYPE TOGGLE */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleBtn, activeDevice === 'Mobile' && styles.toggleActive]}
            onPress={() => { setActiveDevice('Mobile'); setSearchQuery(''); }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="smartphone" size={18} color={activeDevice === 'Mobile' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.toggleText, activeDevice === 'Mobile' && styles.toggleTextActive]}>Mobile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.toggleBtn, activeDevice === 'Laptop' && styles.toggleActive]}
            onPress={() => { setActiveDevice('Laptop'); setSearchQuery(''); }}
            activeOpacity={0.8}
          >
            <MaterialIcons name="laptop-mac" size={18} color={activeDevice === 'Laptop' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.toggleText, activeDevice === 'Laptop' && styles.toggleTextActive]}>Laptop</Text>
          </TouchableOpacity>
        </View>

        {/* 🔍 SEARCH BAR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput 
            placeholder={`Search ${activeDevice} brands...`}
            placeholderTextColor="#94A3B8"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#CBD5E1" />
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          {searchQuery.length > 0 ? 'Search Results' : 'Popular Brands'}
        </Text>

        {/* 📱 BRAND GRID (All are Clickable Buttons Now) */}
        <View style={styles.gridContainer}>
          {displayedBrands.length === 0 ? (
             <Text style={styles.noResultText}>No brands found for "{searchQuery}"</Text>
          ) : (
            displayedBrands.map((brand) => (
              <TouchableOpacity 
                key={brand.id} 
                style={[styles.brandCard, shadowStyle]}
                onPress={() => handleBrandSelect(brand.name)} 
                activeOpacity={0.7}
              >
                <View style={[styles.brandIconBox, { backgroundColor: brand.bg }]}>
                  {brand.icon ? (
                    <Ionicons name={brand.icon} size={28} color={brand.color} />
                  ) : (
                    <Text style={[styles.brandTextIcon, { color: brand.color }]}>{brand.textIcon}</Text>
                  )}
                </View>
                <Text style={styles.brandName}>{brand.name}</Text>
              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC', 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  
  /* HEADER */
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  
  /* TOGGLE */
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4, marginBottom: 25 },
  toggleBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  
  // 🚀 FIX: Removed old shadow props and used Platform.select
  toggleActive: { 
    backgroundColor: '#2563EB', 
    ...Platform.select({
      ios: { shadowColor: '#2563EB', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.2, shadowRadius: 4 },
      android: { elevation: 2 },
      web: { boxShadow: '0px 2px 4px rgba(37, 99, 235, 0.2)' }
    })
  },
  
  toggleText: { fontSize: 14, fontWeight: '700', color: '#64748B', marginLeft: 6 },
  toggleTextActive: { color: '#FFFFFF' },

  /* SEARCH */
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A', fontWeight: '600' },
  
  /* SECTION TITLE */
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  
  /* GRID */
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: '5%' },
  brandCard: { width: '30%', backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 20, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  brandIconBox: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  brandTextIcon: { fontSize: 18, fontWeight: '900' },
  brandName: { fontSize: 13, fontWeight: '800', color: '#475569' },
  
  noResultText: { fontSize: 14, color: '#94A3B8', fontWeight: '600', width: '100%', textAlign: 'center', marginTop: 20 }
});