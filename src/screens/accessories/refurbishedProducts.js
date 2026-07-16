import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Platform, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// 🔥 Firebase Imports
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig'; // Apna correct path check kar lena

const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  android: { elevation: 3 },
  web: { boxShadow: '0px 4px 8px rgba(148, 163, 184, 0.1)' }
});

export default function RefurbishedProducts({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 Fetch Real-time Data
  useEffect(() => {
    const q = query(collection(db, 'refurbished_products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const prodList = [];
      snapshot.forEach(doc => prodList.push({ id: doc.id, ...doc.data() }));
      setProducts(prodList);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const renderProductCard = ({ item }) => {
    const hasDiscount = item.originalPrice && item.originalPrice > item.price;
    const discountPercent = hasDiscount ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;

    return (
      <TouchableOpacity 
        style={[styles.productCard, shadowStyle]}
        onPress={() => navigation.navigate('ProductDetail', { product: item })}
      >
        <View style={styles.badgeRow}>
          <View style={styles.conditionBadge}>
            <Text style={styles.conditionText}>REFURBISHED</Text>
          </View>
          {hasDiscount && (
            <View style={styles.discountBadge}><Text style={styles.discountText}>{discountPercent}% OFF</Text></View>
          )}
        </View>

        <View style={styles.imgContainer}>
          <Image source={{ uri: item.image }} style={styles.prodImage} resizeMode="contain" />
        </View>

        <Text style={styles.prodName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.prodCat}>{item.category}</Text>

        <View style={styles.priceRow}>
          <View>
            <Text style={styles.priceText}>₹{item.price}</Text>
            {hasDiscount && <Text style={styles.oldPriceText}>₹{item.originalPrice}</Text>}
          </View>
          <TouchableOpacity style={styles.addCartBtn}>
            <MaterialIcons name="add-shopping-cart" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) return <View style={styles.loader}><ActivityIndicator size="large" color={colors.link} /></View>;

  return (
    <FlatList 
      data={products}
      numColumns={2}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.gridContent}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={styles.gridRowWrapper}
      renderItem={renderProductCard}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <MaterialIcons name="layers-clear" size={45} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No refurbished products found</Text>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  gridContent: { paddingHorizontal: 15, paddingBottom: 50, paddingTop: 10 },
  gridRowWrapper: { justifyContent: 'space-between' },
  productCard: { backgroundColor: '#FFF', width: '48%', borderRadius: 16, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  badgeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 20 },
  conditionBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  conditionText: { color: '#B45309', fontSize: 8, fontWeight: '900' },
  discountBadge: { backgroundColor: '#D1FAE5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  discountText: { color: '#065F46', fontSize: 8, fontWeight: '900' },
  imgContainer: { height: 100, justifyContent: 'center', alignItems: 'center', marginVertical: 10 },
  prodImage: { width: '80%', height: '100%' },
  prodName: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  prodCat: { fontSize: 10, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginTop: 2, marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  priceText: { fontSize: 15, fontWeight: '900', color: '#0F172A' },
  oldPriceText: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through', marginTop: 1 },
  addCartBtn: { width: 28, height: 28, borderRadius: 8, backgroundColor: colors.link, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginTop: 12 },
});