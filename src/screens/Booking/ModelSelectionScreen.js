// src/screens/Booking/ModelSelectionScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Platform, StatusBar, ScrollView, TextInput, Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

export default function ModelSelectionScreen({ navigation, route }) {
  // 🚀 Get brand info passed from previous screen
  const selectedBrandId = route.params?.brandId; 
  const selectedBrandName = route.params?.brandName || 'Selected Brand'; 
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🚀 Firebase States
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 REAL-TIME FETCH FROM FIREBASE
  useEffect(() => {
    if (!selectedBrandId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // Query: Fetch from 'master_models' collection where brandId matches the clicked brand
    const q = query(
      collection(db, 'master_models'), 
      where('brandId', '==', selectedBrandId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedModels = [];
      snapshot.forEach((doc) => {
        fetchedModels.push({ id: doc.id, ...doc.data() });
      });
      setModels(fetchedModels);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching models: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedBrandId]);

  // 🔍 Real-time Search Logic
  const filteredModels = models.filter(model => 
    model.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            placeholder={`Search ${selectedBrandName} models...`}
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
          {searchQuery.length > 0 ? 'Search Results' : `All ${selectedBrandName} Models`}
        </Text>
      </View>

      {/* 📱 MODELS GRID */}
      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
        >
          <View style={styles.gridContainer}>
            {filteredModels.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="phone-portrait-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyStateText}>No models found</Text>
              </View>
            ) : (
              filteredModels.map((model) => (
                <TouchableOpacity 
                  key={model.id} 
                  style={[styles.modelCard, shadowStyle]}
                  // 🚀 NAVIGATION: Pass modelId to fetch specific services next
                  onPress={() => navigation.navigate('ServiceSelection', { 
                    modelId: model.id, 
                    modelName: model.name,
                    brandName: selectedBrandName
                  })} 
                  activeOpacity={0.8}
                >
                  <View style={styles.modelIconBox}>
                    <Ionicons name="phone-portrait-outline" size={32} color="#2563EB" />
                  </View>
                  <View style={styles.modelInfo}>
                    <Text style={styles.brandTag}>{selectedBrandName}</Text>
                    <Text style={styles.modelName} numberOfLines={2}>{model.name}</Text>
                    {model.series && (
                      <View style={styles.seriesPill}>
                        <Text style={styles.seriesText}>{model.series}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        </ScrollView>
      )}
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
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20, ...Platform.select({ web: { outlineStyle: 'none' } }) },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A', fontWeight: '600', outlineStyle: 'none' },
  
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