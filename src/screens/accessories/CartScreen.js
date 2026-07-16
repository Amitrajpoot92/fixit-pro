// src/screens/accessories/CartScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, 
  TouchableOpacity, Image, Platform, StatusBar, ActivityIndicator 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, onSnapshot, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

export default function CartScreen({ navigation }) {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch Cart Items from Firebase
  useEffect(() => {
    if (!user) { 
      setLoading(false); 
      return; 
    }
    
    const q = query(collection(db, `users/${user.uid}/cart`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = [];
      snapshot.forEach(doc => items.push({ cartId: doc.id, ...doc.data() }));
      setCartItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 🔄 Update Quantity Logic
  const updateQuantity = async (cartId, currentQty, type) => {
    let newQty = type === 'inc' ? currentQty + 1 : currentQty - 1;
    if (newQty < 1) return; // Minimum 1 quantity
    await updateDoc(doc(db, `users/${user.uid}/cart`, cartId), { quantity: newQty });
  };

  // ❌ Remove Item Logic
  const removeItem = async (cartId) => {
    await deleteDoc(doc(db, `users/${user.uid}/cart`, cartId));
  };

  // 💰 Calculate Total
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.link} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        <View style={{width: 44}} />
      </View>

      {cartItems.length === 0 ? (
        // 🛒 EMPTY CART STATE
        <View style={styles.center}>
          <View style={styles.emptyIconBox}>
            <MaterialIcons name="remove-shopping-cart" size={60} color="#94A3B8" />
          </View>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <Text style={styles.emptySubText}>Looks like you haven't added anything yet.</Text>
          <TouchableOpacity style={styles.shopBtn} onPress={() => navigation.navigate('ProductsMain')}>
            <Text style={styles.shopBtnText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* 🛍️ CART ITEMS LIST */}
          <FlatList 
            data={cartItems}
            keyExtractor={item => item.cartId}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.cartCard}>
                <View style={styles.imageBox}>
                  <Image source={{ uri: item.image }} style={styles.image} resizeMode="contain" />
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.category}>{item.category}</Text>
                  <Text style={styles.price}>₹{item.price}</Text>
                  
                  <View style={styles.actionRow}>
                    <View style={styles.qtyBox}>
                      <TouchableOpacity onPress={() => updateQuantity(item.cartId, item.quantity, 'dec')} style={styles.qtyBtn}>
                        <Ionicons name="remove" size={16} color="#475569" />
                      </TouchableOpacity>
                      <Text style={styles.qtyText}>{item.quantity}</Text>
                      <TouchableOpacity onPress={() => updateQuantity(item.cartId, item.quantity, 'inc')} style={styles.qtyBtn}>
                        <Ionicons name="add" size={16} color="#475569" />
                      </TouchableOpacity>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(item.cartId)} style={styles.deleteBtn}>
                      <Ionicons name="trash-outline" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}
          />
          
          {/* 💳 BOTTOM CHECKOUT BAR */}
          <View style={styles.bottomBar}>
            <View>
              <Text style={styles.totalLabel}>Total Payable</Text>
              <Text style={styles.totalVal}>₹{totalAmount}</Text>
            </View>
            <TouchableOpacity 
              style={styles.checkoutBtn} 
              onPress={() => navigation.navigate('ProductCheckout', { cartItems, totalAmount })}
            >
              <Text style={styles.checkoutBtnText}>Checkout</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  
  emptyIconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  emptyText: { fontSize: 20, fontWeight: '900', color: '#0F172A', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 25 },
  shopBtn: { backgroundColor: colors.link, paddingHorizontal: 30, paddingVertical: 14, borderRadius: 12 },
  shopBtnText: { color: '#FFF', fontWeight: '800', fontSize: 15 },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  cartCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 15, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  imageBox: { width: 90, height: 90, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 5, marginRight: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  image: { width: '100%', height: '100%' },
  info: { flex: 1, justifyContent: 'center' },
  name: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  category: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 6 },
  price: { fontSize: 18, fontWeight: '900', color: colors.link, marginBottom: 12 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  qtyBtn: { padding: 8 },
  qtyText: { fontWeight: '800', marginHorizontal: 12, fontSize: 14, color: '#0F172A' },
  deleteBtn: { padding: 8, backgroundColor: '#FEF2F2', borderRadius: 10 },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 35 : 20 },
  totalLabel: { fontSize: 13, color: '#64748B', fontWeight: '700', marginBottom: 2 },
  totalVal: { fontSize: 24, fontWeight: '900', color: '#0F172A' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.link, paddingHorizontal: 25, paddingVertical: 15, borderRadius: 14 },
  checkoutBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});