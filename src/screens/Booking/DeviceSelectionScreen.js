// src/screens/Booking/DeviceSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Platform, StatusBar, FlatList, TextInput, Dimensions,
  ActivityIndicator
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

// 🚀 Database Import
import { db } from '../../services/firebaseConfig';

const { width } = Dimensions.get('window');

// 🌟 Premium Soft Shadows for Cards
const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
  android: { elevation: 4, shadowColor: '#94A3B8' },
  web: { boxShadow: '0px 6px 12px rgba(148, 163, 184, 0.12)' }
});

export default function DeviceSelectionScreen({ navigation }) {
  // 🚀 TAB PAR AB SIRF MOBILE YA LAPTOP HI RAHEGA (Default: Mobile)
  const [activeDevice, setActiveDevice] = useState('Mobile');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Firebase States
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 REAL-TIME FETCH FROM FIREBASE (Sare brands ek sath lane ke liye)
  useEffect(() => {
    const q = query(collection(db, 'master_brands'), orderBy('name', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const brandsList = [];
      snapshot.forEach((doc) => {
        brandsList.push({ id: doc.id, ...doc.data() });
      });
      setBrands(brandsList);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching brands: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚀 SMART BULLETPROOF FILTERING LOGIC
  const filteredBrands = brands.filter((brand) => {
    // 1. Search filter logic
    const matchesSearch = brand.name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 2. Type matching logic (Case-insensitive check)
    const matchesType = brand.type?.toLowerCase() === activeDevice.toLowerCase();

    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Loading Brands...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderHeader = () => (
    <View>
      {/* 🚀 DEVICE TYPE TOGGLE */}
      <View style={styles.toggleContainer}>
        {['Mobile', 'Laptop'].map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.toggleBtn,
              activeDevice === type && styles.toggleActive
            ]}
            onPress={() => {
              setActiveDevice(type);
              setSearchQuery('');
            }}
          >
            <MaterialIcons 
              name={type === 'Mobile' ? "phone-android" : "laptop"} 
              size={18} 
              color={activeDevice === type ? "#FFFFFF" : "#64748B"} 
            />
            <Text style={[
              styles.toggleText,
              activeDevice === type && styles.toggleTextActive
            ]}>
              {type === 'Mobile' ? 'Phone' : 'Laptop'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🔍 SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#94A3B8" />
        <TextInput 
          placeholder={`Search ${activeDevice === 'Mobile' ? 'Phone' : 'Laptop'} brand...`}
          placeholderTextColor="#94A3B8"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>

      {/* 📊 GRID ZONE TITLE */}
      <Text style={styles.sectionTitle}>
        Popular {activeDevice === 'Mobile' ? 'Phone' : 'Laptop'} Brands ({filteredBrands.length})
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Brand</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backButton}>
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <FlatList 
        data={filteredBrands}
        keyExtractor={item => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={renderHeader}
        columnWrapperStyle={styles.rowWrapper}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="search-off" size={44} color="#94A3B8" />
            <Text style={styles.emptyText}>No brands found matching your selection.</Text>
          </View>
        )}
        renderItem={({ item: brand }) => (
          <TouchableOpacity 
            style={[styles.brandCard, shadowStyle]}
            onPress={() => navigation.navigate('ModelSelection', { brandId: brand.id, brandName: brand.name })}
          >
            <View style={styles.brandIconBox}>
              {brand.image ? (
                <Image 
                  source={{ uri: brand.image }} 
                  style={styles.brandImage}
                  contentFit="contain"
                  transition={200}
                  cachePolicy="disk"
                />
              ) : (
                <MaterialIcons name="broken-image" size={22} color="#CBD5E1" />
              )}
            </View>
            <Text style={styles.brandName} numberOfLines={1}>{brand.name}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: '#64748B', fontWeight: '600', fontSize: 14 },
  
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#F8FAFC' },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...shadowStyle },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  
  // 🚀 FIX: flexGrow: 1 lagaya hai taaki page kitna bhi lamba ho, scroll smoothly chale aur cutoff na ho
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 50, flexGrow: 1 },
  
  toggleContainer: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 16, padding: 6, marginBottom: 20, gap: 4 },
  toggleBtn: { flex: 1, flexDirection: 'row', paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  toggleActive: { backgroundColor: '#2563EB', ...shadowStyle },
  toggleText: { fontSize: 14, fontWeight: '700', color: '#64748B', marginLeft: 6 },
  toggleTextActive: { color: '#FFFFFF' },
  
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A', fontWeight: '500' },
  
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 15, paddingHorizontal: 4 },
  
  // 🚀 GRID LAYOUT USING FLATLIST COLUMN WRAPPER
  rowWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start', gap: 10, width: '100%' },
  
  // 🚀 EXACT 3 CARDS PER ROW CALCULATION: 
  // Total padding/margins nikalne ke baad (width - 40 - 20) / 3 balance karke ekdum tight 3 columns dega
  brandCard: { 
    width: (width - 60) / 3, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 18, 
    paddingVertical: 18, 
    alignItems: 'center', 
    marginBottom: 4, 
    borderWidth: 1, 
    borderColor: '#F1F5F9' 
  },
  
  brandIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginBottom: 10, overflow: 'hidden' },
  brandImage: { width: '100%', height: '100%' },
  brandName: { fontSize: 13, fontWeight: '800', color: '#334155', textAlign: 'center', paddingHorizontal: 4 },
  
  emptyContainer: { width: '100%', alignItems: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 10, color: '#94A3B8', fontWeight: '600', textAlign: 'center', fontSize: 14 }
});