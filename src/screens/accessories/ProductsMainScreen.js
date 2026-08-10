import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Platform, StatusBar, ActivityIndicator, Alert, Animated, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { collection, query, onSnapshot, addDoc, getDocs, where, updateDoc, doc, increment, limit } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';

export default function ProductsMainScreen({ navigation }) {
  const { user } = useAuth();
  const [activeConditionTab, setActiveConditionTab] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState(['All']);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartCount, setCartCount] = useState(0);
  const [cartItemIds, setCartItemIds] = useState(new Set());
  const [productLimit, setProductLimit] = useState(14); // 🚀 Pagination limit
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (msg) => {
    setToastMessage(msg);
    Animated.timing(toastOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setToastMessage(''));
      }, 2000);
    });
  };

  useEffect(() => {
    // Fetch Categories
    const unsubCats = onSnapshot(collection(db, 'product_categories'), (snap) => {
      const cats = snap.docs.map(doc => doc.data().name);
      setCategories(['All', ...cats]);
    });

    // Fetch Products with Pagination Limit
    let newProds = []; let refProds = [];
    
    // Base Queries
    let qNew = query(collection(db, 'new_products'), limit(productLimit));
    let qRef = query(collection(db, 'refurbished_products'), limit(productLimit));

    const unsubNew = onSnapshot(qNew, (snap) => {
      newProds = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts([...newProds, ...refProds]); setLoading(false);
    });
    const unsubRef = onSnapshot(qRef, (snap) => {
      refProds = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts([...newProds, ...refProds]); setLoading(false);
    });

    // Fetch Cart Count
    let unsubCart = () => {};
    if (user) {
      unsubCart = onSnapshot(collection(db, `users/${user.uid}/cart`), (snap) => {
        setCartCount(snap.docs.length);
        const ids = new Set(snap.docs.map(doc => doc.data().productId));
        setCartItemIds(ids);
      });
    }

    return () => { unsubCats(); unsubNew(); unsubRef(); unsubCart(); };
  }, [user, productLimit]); // Re-run when limit increases

  const handleLoadMore = () => {
    setProductLimit(prev => prev + 10); // Increase limit for infinite scroll
  };

  const addToCart = async (product) => {
    if (!user) return Alert.alert("Login Required", "Please login to add items to cart.");
    try {
      const q = query(collection(db, `users/${user.uid}/cart`), where('productId', '==', product.id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, `users/${user.uid}/cart`, snap.docs[0].id), { quantity: increment(1) });
      } else {
        await addDoc(collection(db, `users/${user.uid}/cart`), { ...product, productId: product.id, quantity: 1 });
      }
      showToast("Item added to cart! 🛒");
    } catch (e) { console.error(e); }
  };

  const filteredProducts = allProducts.filter(p => 
    (activeConditionTab === 'All' || p.condition === activeConditionTab) &&
    (selectedCategory === 'All' || p.category === selectedCategory) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const renderProductCard = ({ item }) => {
    const hasDiscount = item.originalPrice && item.originalPrice > item.price;
    const discountPercent = hasDiscount ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;
    const isAdded = cartItemIds.has(item.id);
    
    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
        activeOpacity={0.9}
      >
        {/* Heart Icon acts as Add to Cart as requested */}
        <TouchableOpacity style={styles.heartIcon} onPress={() => addToCart(item)}>
           <Ionicons name={isAdded ? "heart" : "heart-outline"} size={20} color={isAdded ? "#EF4444" : "#94A3B8"} />
        </TouchableOpacity>

        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.productImage} 
            contentFit="contain" 
            transition={200}
            cachePolicy="disk"
          />
        </View>

        {/* Details Section */}
        <View style={styles.detailsContainer}>
           <Text style={styles.sponsoredText}>{item.condition || 'New'}</Text>
           <Text style={styles.productTitle} numberOfLines={2}>{item.name}</Text>
           
           {/* Price Row exactly like reference */}
           <View style={styles.priceRow}>
              {hasDiscount && (
                <Text style={styles.discountText}>
                  ↓{discountPercent}%
                </Text>
              )}
              {hasDiscount && <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>}
              <Text style={styles.currentPrice}>₹{item.price}</Text>
           </View>

           {/* Rating and Assured Row */}
           <View style={styles.ratingRow}>
              <View style={styles.starBadge}>
                 <Text style={styles.starText}>4.2</Text>
                 <MaterialIcons name="star" size={10} color="#FFF" style={{marginLeft: 2}} />
              </View>
              <View style={styles.assuredBadge}>
                 <MaterialIcons name="verified-user" size={12} color="#2563EB" />
                 <Text style={styles.assuredText}> Fixit<Text style={{fontWeight: '900'}}>Assured</Text></Text>
              </View>
           </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={24} color="#0F172A" /></TouchableOpacity>
        
        {/* Functional Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#64748B" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search accessories..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('CartScreen')}>
          <Ionicons name="cart-outline" size={26} color="#0F172A" />
          {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#F8FAFC', marginHorizontal: 10, marginTop: 10, borderRadius: 8, padding: 4 }}>
        {['All', 'New', 'Refurbished'].map((tab) => (
          <TouchableOpacity key={tab} style={[styles.toggleBtn, activeConditionTab === tab && styles.activeToggleBtn]} onPress={() => setActiveConditionTab(tab)}>
            <Text style={{ fontSize: 12, fontWeight: activeConditionTab === tab ? '800':'600', color: activeConditionTab === tab ? '#2563EB' : '#64748B' }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ maxHeight: 45, marginTop: 10, marginBottom: 10 }}>
        <FlatList horizontal data={categories} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 10 }} keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.catPill, selectedCategory === item && styles.activeCatPill]} onPress={() => setSelectedCategory(item)}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: selectedCategory === item ? '#2563EB' : '#475569' }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color="#2563EB"/></View> : (
        <View style={styles.listContainer}>
          <FlatList 
            data={filteredProducts} 
            numColumns={2} 
            keyExtractor={item => item.id} 
            contentContainerStyle={{ paddingBottom: 30 }} 
            columnWrapperStyle={{ justifyContent: 'space-between' }}
            renderItem={renderProductCard}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Custom Toast Message */}
      {toastMessage !== '' && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
           <Ionicons name="checkmark-circle" size={24} color="#FFF" />
           <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-start' },
  
  searchBar: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 8, paddingHorizontal: 12, height: 40, marginHorizontal: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, color: '#0F172A', padding: 0 },

  cartBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-end', position: 'relative' },
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', minWidth: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF' },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: '900' },
  
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
  activeToggleBtn: { backgroundColor: '#FFF', shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  
  catPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F8FAFC', marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0', justifyContent: 'center' },
  activeCatPill: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  
  listContainer: { flex: 1, backgroundColor: '#E2E8F0' }, 
  
  /* FLIPKART STYLE PRODUCT CARD */
  productCard: { 
    backgroundColor: '#FFF', 
    width: '49.8%', 
    marginBottom: 2, 
    padding: 12, 
    position: 'relative'
  },
  heartIcon: { position: 'absolute', top: 10, right: 10, zIndex: 2 },
  imageContainer: { height: 160, width: '100%', alignItems: 'center', justifyContent: 'center', marginBottom: 10, marginTop: 5 },
  productImage: { width: '95%', height: '100%' },
  
  detailsContainer: { flex: 1 },
  sponsoredText: { fontSize: 10, color: '#94A3B8', fontWeight: '500', marginBottom: 4 },
  productTitle: { fontSize: 13, fontWeight: '500', color: '#1E293B', marginBottom: 8, lineHeight: 18 },
  
  priceRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 },
  discountText: { fontSize: 13, color: '#059669', fontWeight: '800', marginRight: 6 },
  originalPrice: { fontSize: 12, color: '#94A3B8', textDecorationLine: 'line-through', marginRight: 6 },
  currentPrice: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  
  ratingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  starBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 4 },
  starText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  
  assuredBadge: { flexDirection: 'row', alignItems: 'center' },
  assuredText: { fontSize: 10, color: '#64748B', fontStyle: 'italic', marginLeft: 2 },
  
  toastContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 20,
    alignSelf: 'center',
    backgroundColor: '#059669',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    zIndex: 999
  },
  toastText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    marginLeft: 10
  }
});