// src/screens/home/SearchScreen.js
import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TextInput, 
  TouchableOpacity, FlatList, ActivityIndicator, Image, 
  Platform, StatusBar 
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

export default function SearchScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all searchable data once
  useEffect(() => {
    let brandsData = [];
    let modelsData = [];
    let newProducts = [];
    let refProducts = [];
    let mappedData = [];

    const updateCombinedData = () => {
      // Map Brands to provide brandName easily to models if needed, though models usually have brandId.
      const brandMap = {};
      brandsData.forEach(b => { brandMap[b.id] = b.name; });

      mappedData = [
        ...brandsData.map(item => ({ ...item, searchType: 'Brand', _key: `brand_${item.id}` })),
        ...modelsData.map(item => ({ ...item, searchType: 'Model', _key: `model_${item.id}`, brandNameMapped: brandMap[item.brandId] || 'Unknown Brand' })),
        ...newProducts.map(item => ({ ...item, searchType: 'Product', _key: `newprod_${item.id}` })),
        ...refProducts.map(item => ({ ...item, searchType: 'Product', _key: `refprod_${item.id}` }))
      ];
      setAllData(mappedData);
      setLoading(false);
    };

    const unsubBrands = onSnapshot(collection(db, 'master_brands'), (snap) => {
      brandsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateCombinedData();
    });

    const unsubModels = onSnapshot(collection(db, 'master_models'), (snap) => {
      modelsData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateCombinedData();
    });

    const unsubNewProds = onSnapshot(collection(db, 'new_products'), (snap) => {
      newProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateCombinedData();
    });

    const unsubRefProds = onSnapshot(collection(db, 'refurbished_products'), (snap) => {
      refProducts = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      updateCombinedData();
    });

    return () => {
      unsubBrands();
      unsubModels();
      unsubNewProds();
      unsubRefProds();
    };
  }, []);

  // Filter Data
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const queryStr = searchQuery.toLowerCase();
    
    return allData.filter(item => {
      const nameMatch = item.name?.toLowerCase().includes(queryStr);
      const categoryMatch = item.category?.toLowerCase().includes(queryStr);
      const brandMatch = item.brandNameMapped?.toLowerCase().includes(queryStr);
      return nameMatch || categoryMatch || brandMatch;
    });
  }, [searchQuery, allData]);

  const handleResultPress = (item) => {
    if (item.searchType === 'Brand') {
      navigation.navigate('ModelSelection', { 
        brandId: item.id, 
        brandName: item.name, 
        deviceType: item.type || 'Mobile' 
      });
    } else if (item.searchType === 'Model') {
      navigation.navigate('ServiceSelection', { 
        modelId: item.id, 
        modelName: item.name, 
        brandName: item.brandNameMapped 
      });
    } else if (item.searchType === 'Product') {
      navigation.navigate('ProductDetail', { product: item });
    }
  };

  const renderIcon = (type) => {
    switch(type) {
      case 'Brand': return <MaterialIcons name="business" size={20} color={colors.accent} />;
      case 'Model': return <Ionicons name="phone-portrait-outline" size={20} color={colors.accent} />;
      case 'Product': return <Feather name="shopping-bag" size={20} color={colors.accent} />;
      default: return <Ionicons name="search" size={20} color={colors.accent} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header Search Bar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products, brands, models..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={20} color={colors.textLight} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="search" size={20} color={colors.textLight} style={styles.clearBtn} />
          )}
        </View>
      </View>

      {/* Results List */}
      {loading && searchQuery.length > 0 ? (
        <View style={styles.centerBox}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : searchQuery.length > 0 && searchResults.length === 0 ? (
        <View style={styles.centerBox}>
          <Feather name="search" size={50} color={colors.textLight} style={{ marginBottom: 15 }} />
          <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
          <Text style={styles.emptySubText}>Try searching for a different keyword</Text>
        </View>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={item => item._key}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.resultItem} 
              onPress={() => handleResultPress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.iconBox}>
                {renderIcon(item.searchType)}
              </View>
              
              <View style={styles.resultDetails}>
                <Text style={styles.resultName} numberOfLines={1}>
                  {item.name}
                  {item.searchType === 'Model' && <Text style={styles.brandSubtitle}> ({item.brandNameMapped})</Text>}
                </Text>
                <Text style={styles.resultType}>{item.searchType}</Text>
              </View>
              
              <Ionicons name="chevron-forward" size={18} color={colors.textLight} />
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#FFFFFF', 
    paddingHorizontal: 15, 
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 2px 10px rgba(0,0,0,0.05)' }
    })
  },
  backBtn: { padding: 5, marginRight: 10 },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 45
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.textDark,
    fontWeight: '600',
    outlineStyle: 'none'
  },
  clearBtn: { marginLeft: 10 },
  
  listContent: { padding: 15 },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9'
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  resultDetails: { flex: 1, paddingRight: 10 },
  resultName: { fontSize: 15, fontWeight: '800', color: colors.textDark, marginBottom: 4 },
  brandSubtitle: { fontSize: 13, fontWeight: '600', color: colors.textLight },
  resultType: { fontSize: 11, fontWeight: '700', color: colors.textLight, textTransform: 'uppercase' },
  
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginBottom: 8, textAlign: 'center' },
  emptySubText: { fontSize: 13, fontWeight: '500', color: colors.textLight, textAlign: 'center' }
});
