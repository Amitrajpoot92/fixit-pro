// src/screens/Booking/DeviceSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Platform, StatusBar, ScrollView, TextInput, Dimensions,
  ActivityIndicator, Image
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

// 🚀 Database Import
import { db } from '../../services/firebaseConfig';

const { width } = Dimensions.get('window');

// 🌟 Premium Soft Shadows
const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
  android: { elevation: 5, shadowColor: '#94A3B8' },
  web: { boxShadow: '0px 6px 12px rgba(148, 163, 184, 0.12)' }
});

export default function DeviceSelectionScreen({ navigation }) {
  const [activeDevice, setActiveDevice] = useState('Mobile');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🚀 Firebase States
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 REAL-TIME FETCH FROM FIREBASE
  useEffect(() => {
    setLoading(true);
    
    const q = query(
      collection(db, 'master_brands'), 
      where('type', '==', activeDevice)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedBrands = [];
      snapshot.forEach((doc) => {
        fetchedBrands.push({ id: doc.id, ...doc.data() });
      });
      setBrands(fetchedBrands);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching brands: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeDevice]);

  // 🔍 Search filter logic
  const displayedBrands = brands.filter(brand => 
    brand.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBrandSelect = (brand) => {
    navigation.navigate('ModelSelection', { 
      brandId: brand.id,
      brandName: brand.name,
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

        {/* 📱 BRAND GRID */}
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
        ) : (
          <View style={styles.gridContainer}>
            {displayedBrands.length === 0 ? (
               <Text style={styles.noResultText}>No brands found for "{searchQuery}"</Text>
            ) : (
              displayedBrands.map((brand) => (
                <TouchableOpacity 
                  key={brand.id} 
                  style={[styles.brandCard, shadowStyle]}
                  onPress={() => handleBrandSelect(brand)} 
                  activeOpacity={0.7}
                >
                  <View style={styles.brandIconBox}>
                    {brand.image ? (
                      <Image source={{ uri: brand.image }} style={styles.brandImage} resizeMode="contain" />
                    ) : (
                      <Text style={styles.brandTextIcon}>{brand.name.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 4, marginBottom: 25 },
  toggleBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleActive: { backgroundColor: '#2563EB', ...shadowStyle },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#64748B', marginLeft: 6 },
  toggleTextActive: { color: '#FFFFFF' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A', fontWeight: '600', outlineStyle: 'none' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 20 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: '5%' },
  brandCard: { width: '30%', backgroundColor: '#FFFFFF', borderRadius: 18, paddingVertical: 20, alignItems: 'center', marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  
  /* 🚀 Image Styling */
  brandIconBox: { width: 60, height: 60, borderRadius: 16, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  brandImage: { width: '70%', height: '70%' },
  brandTextIcon: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  
  brandName: { fontSize: 13, fontWeight: '800', color: '#475569', textAlign: 'center', paddingHorizontal: 5 },
  noResultText: { fontSize: 14, color: '#94A3B8', fontWeight: '600', width: '100%', textAlign: 'center', marginTop: 20 }
});