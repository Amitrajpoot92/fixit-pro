import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Image, Platform, StatusBar, ActivityIndicator, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { collection, query, onSnapshot, addDoc, getDocs, where, updateDoc, doc, increment } from 'firebase/firestore';
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

  useEffect(() => {
    // Fetch Categories
    const unsubCats = onSnapshot(collection(db, 'product_categories'), (snap) => {
      const cats = snap.docs.map(doc => doc.data().name);
      setCategories(['All', ...cats]);
    });

    // Fetch Products
    let newProds = []; let refProds = [];
    const unsubNew = onSnapshot(collection(db, 'new_products'), (snap) => {
      newProds = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts([...newProds, ...refProds]); setLoading(false);
    });
    const unsubRef = onSnapshot(collection(db, 'refurbished_products'), (snap) => {
      refProds = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAllProducts([...newProds, ...refProds]); setLoading(false);
    });

    // Fetch Cart Count
    let unsubCart = () => {};
    if (user) {
      unsubCart = onSnapshot(collection(db, `users/${user.uid}/cart`), (snap) => {
        setCartCount(snap.docs.length);
      });
    }

    return () => { unsubCats(); unsubNew(); unsubRef(); unsubCart(); };
  }, [user]);

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
      Alert.alert("Success", "Item added to cart!");
    } catch (e) { console.error(e); }
  };

  const filteredProducts = allProducts.filter(p => 
    (activeConditionTab === 'All' || p.condition === activeConditionTab) &&
    (selectedCategory === 'All' || p.category === selectedCategory)
  );

  const renderProductCard = ({ item }) => {
    const hasDiscount = item.originalPrice && item.originalPrice > item.price;
    return (
      <TouchableOpacity style={styles.productCard} onPress={() => navigation.navigate('ProductDetail', { product: item })}>
        <View style={{height: 100, alignItems: 'center'}}><Image source={{ uri: item.image }} style={{width: '80%', height: '100%'}} resizeMode="contain" /></View>
        <Text style={{fontSize: 13, fontWeight: '800', marginTop: 10}} numberOfLines={1}>{item.name}</Text>
        <Text style={{fontSize: 10, color: '#94A3B8', fontWeight: '700', marginBottom: 10}}>{item.category}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end'}}>
          <View><Text style={{fontSize: 15, fontWeight: '900'}}>₹{item.price}</Text></View>
          <TouchableOpacity style={styles.addCartBtn} onPress={() => addToCart(item)}>
            <MaterialIcons name="add-shopping-cart" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><Ionicons name="arrow-back" size={22} color="#0F172A" /></TouchableOpacity>
        <Text style={styles.headerTitle}>Store</Text>
        <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('CartScreen')}>
          <MaterialIcons name="shopping-cart" size={22} color="#0F172A" />
          {cartCount > 0 && <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>}
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', backgroundColor: '#F1F5F9', margin: 15, borderRadius: 12, padding: 4 }}>
        {['All', 'New', 'Refurbished'].map((tab) => (
          <TouchableOpacity key={tab} style={[styles.toggleBtn, activeConditionTab === tab && styles.activeToggleBtn]} onPress={() => setActiveConditionTab(tab)}>
            <Text style={{ fontSize: 12, fontWeight: activeConditionTab === tab ? '800':'700', color: activeConditionTab === tab ? colors.link : '#64748B' }}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ maxHeight: 50, marginBottom: 15 }}>
        <FlatList horizontal data={categories} showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 15 }} keyExtractor={item => item}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.catPill, selectedCategory === item && styles.activeCatPill]} onPress={() => setSelectedCategory(item)}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: selectedCategory === item ? '#FFF' : '#64748B' }}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color={colors.link}/></View> : (
        <FlatList data={filteredProducts} numColumns={2} keyExtractor={item => item.id} contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 50 }} columnWrapperStyle={{ justifyContent: 'space-between' }} renderItem={renderProductCard} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  cartBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  cartBadge: { position: 'absolute', top: -5, right: -5, backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  toggleBtn: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 8 },
  activeToggleBtn: { backgroundColor: '#FFF', elevation: 1 },
  catPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#FFF', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0', height: 36 },
  activeCatPill: { backgroundColor: colors.link, borderColor: colors.link },
  productCard: { backgroundColor: '#FFF', width: '48%', borderRadius: 16, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9', elevation: 2 },
  addCartBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.link, justifyContent: 'center', alignItems: 'center' }
});