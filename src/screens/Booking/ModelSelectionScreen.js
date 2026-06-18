// src/screens/Booking/ModelSelectionScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Platform, StatusBar, ScrollView, TextInput, Dimensions 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// 🌟 Premium Soft Shadows
const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
  android: { elevation: 5, shadowColor: '#94A3B8' },
});

// 📱 MASSIVE MOCK DATA FOR MODELS
const allModels = [
  // Apple
  { id: '1', brand: 'Apple', name: 'iPhone 15 Pro Max', series: '15 Series' },
  { id: '2', brand: 'Apple', name: 'iPhone 15 Pro', series: '15 Series' },
  { id: '3', brand: 'Apple', name: 'iPhone 15', series: '15 Series' },
  { id: '4', brand: 'Apple', name: 'iPhone 14 Pro Max', series: '14 Series' },
  { id: '5', brand: 'Apple', name: 'iPhone 14 Plus', series: '14 Series' },
  { id: '6', brand: 'Apple', name: 'iPhone 13', series: '13 Series' },
  { id: '7', brand: 'Apple', name: 'iPhone 12 Mini', series: '12 Series' },
  { id: '8', brand: 'Apple', name: 'iPhone 11', series: '11 Series' },
  // Samsung
  { id: '9', brand: 'Samsung', name: 'Galaxy S24 Ultra', series: 'S Series' },
  { id: '10', brand: 'Samsung', name: 'Galaxy S23 Plus', series: 'S Series' },
  { id: '11', brand: 'Samsung', name: 'Galaxy Z Fold 5', series: 'Z Series' },
  { id: '12', brand: 'Samsung', name: 'Galaxy Z Flip 5', series: 'Z Series' },
  { id: '13', brand: 'Samsung', name: 'Galaxy A54 5G', series: 'A Series' },
  { id: '14', brand: 'Samsung', name: 'Galaxy M53', series: 'M Series' },
  // OnePlus
  { id: '15', brand: 'OnePlus', name: 'OnePlus 12', series: 'Flagship' },
  { id: '16', brand: 'OnePlus', name: 'OnePlus 11R', series: 'R Series' },
  { id: '17', brand: 'OnePlus', name: 'OnePlus Nord CE 3', series: 'Nord' },
  { id: '18', brand: 'OnePlus', name: 'OnePlus 9 Pro', series: 'Flagship' },
  // Google & Others
  { id: '19', brand: 'Google', name: 'Pixel 8 Pro', series: 'Pixel 8' },
  { id: '20', brand: 'Google', name: 'Pixel 7a', series: 'Pixel 7' },
  { id: '21', brand: 'Vivo', name: 'Vivo X100 Pro', series: 'X Series' },
  { id: '22', brand: 'Xiaomi', name: 'Xiaomi 14 Ultra', series: '14 Series' },
  { id: '23', brand: 'Xiaomi', name: 'Redmi Note 13', series: 'Note Series' },
  { id: '24', brand: 'Oppo', name: 'Reno 11 Pro', series: 'Reno' },
];

export default function ModelSelectionScreen({ navigation, route }) {
  const selectedBrand = route.params?.brandName || 'Apple'; 
  const [searchQuery, setSearchQuery] = useState('');

  // 🔍 Real-time Search Logic
  const filteredModels = allModels.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch; 
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* 🔙 PREMIUM HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Model</Text>
        <View style={{ width: 44 }} /> 
      </View>

      <View style={styles.searchSection}>
        {/* 🔍 SEARCH BAR FIXED AT TOP */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={22} color="#94A3B8" />
          <TextInput 
            placeholder="Search your phone model..."
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
          {searchQuery.length > 0 ? 'Search Results' : 'All Popular Models'}
        </Text>
      </View>

      {/* 📱 MODELS GRID (Fixed Scroll Issue by taking it out of strict View constraints) */}
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        <View style={styles.gridContainer}>
          {filteredModels.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="phone-portrait-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyStateText}>No models found for "{searchQuery}"</Text>
            </View>
          ) : (
            filteredModels.map((model) => (
              <TouchableOpacity 
                key={model.id} 
                style={[styles.modelCard, shadowStyle]}
                // 🚀 FIXED NAVIGATION: Ab ye click pe Service page par jayega
                onPress={() => navigation.navigate('ServiceSelection', { modelName: model.name })} 
                activeOpacity={0.8}
              >
                <View style={styles.modelIconBox}>
                  <Ionicons name="phone-portrait-outline" size={32} color="#2563EB" />
                </View>
                <View style={styles.modelInfo}>
                  <Text style={styles.brandTag}>{model.brand}</Text>
                  <Text style={styles.modelName} numberOfLines={2}>{model.name}</Text>
                  <View style={styles.seriesPill}>
                    <Text style={styles.seriesText}>{model.series}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  
  searchSection: { paddingHorizontal: 20 },

  /* SEARCH BAR */
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, elevation: 2, shadowColor: '#94A3B8', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.08, shadowRadius: 5 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A', fontWeight: '600' },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 15 },
  
  /* SCROLL & GRID FIXES */
  scrollView: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 50 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  
  modelCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  modelIconBox: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  modelInfo: { flex: 1 },
  brandTag: { fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 2 },
  modelName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 8, lineHeight: 18 },
  
  seriesPill: { alignSelf: 'flex-start', backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  seriesText: { fontSize: 10, fontWeight: '700', color: '#475569' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 40, width: '100%' },
  emptyStateText: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginTop: 10 }
});