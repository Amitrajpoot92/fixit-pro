// src/screens/accessories/ProductCheckoutScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, Platform, StatusBar, ActivityIndicator, Alert, Modal
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// 🔥 Firebase Imports
import { collection, addDoc, serverTimestamp, query, onSnapshot, doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext'; 

export default function ProductCheckoutScreen({ navigation, route }) {
  // 🚀 Handle Array of Cart Items instead of a single product
  const cartItems = route.params?.cartItems || [];
  const initialTotalAmount = route.params?.totalAmount || 0;
  
  const { user } = useAuth(); // Logged in user info
  
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // 🚀 User details & Address states
  const [userData, setUserData] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const deliveryFee = 50;
  const totalAmount = initialTotalAmount + deliveryFee;

  // 🚀 Fetch User Data & Addresses
  useEffect(() => {
    if (!user?.uid) return;

    // Fetch User Profile
    const fetchUserProfile = async () => {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) setUserData(userDoc.data());
    };
    fetchUserProfile();

    // Fetch Addresses
    const q = query(collection(db, 'users', user.uid, 'addresses'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const addrs = [];
      snapshot.forEach(doc => addrs.push({ id: doc.id, ...doc.data() }));
      setSavedAddresses(addrs);
      
      if (addrs.length > 0) {
        if (!selectedAddress) setSelectedAddress(addrs[0]);
        else {
          const exists = addrs.find(a => a.id === selectedAddress.id);
          setSelectedAddress(exists ? exists : addrs[0]); 
        }
      } else {
        setSelectedAddress(null);
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 🚀 Final Order Placement Logic
  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to place an order.", [{ text: "OK" }]);
      return;
    }
    if (!selectedAddress) {
      Alert.alert("Address Required", "Please add a delivery address.");
      return;
    }

    setIsPlacingOrder(true);
    try {
      // 1. Prepare Order Data
      const orderData = {
        userId: user.uid,
        userName: userData?.name || 'N/A', 
        userPhone: userData?.mobile || user.phoneNumber || 'N/A', 
        userEmail: userData?.email || user.email || 'N/A', 
        productDetails: cartItems, // Save entire cart array
        deliveryAddress: selectedAddress, 
        paymentMethod: paymentMethod,
        totalAmount: totalAmount,
        status: 'Pending', 
        orderType: 'Ecommerce', 
        createdAt: serverTimestamp()
      };

      // 2. Save Order to Database
      await addDoc(collection(db, 'product_orders'), orderData);
      
      // 3. 🛒 Clear Cart using Batch Write
      const batch = writeBatch(db);
      cartItems.forEach(item => {
        if (item.cartId) {
          const cartRef = doc(db, `users/${user.uid}/cart`, item.cartId);
          batch.delete(cartRef);
        }
      });
      await batch.commit();
      
      Alert.alert('Success! 🎉', 'Your order has been placed successfully.', [
        { text: "OK", onPress: () => navigation.navigate('ProductsMain') } 
      ]);

    } catch (error) {
      console.error("Order Failed: ", error);
      Alert.alert('Error', 'Failed to place order. Try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 📍 DELIVERY ADDRESS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <TouchableOpacity onPress={() => savedAddresses.length > 0 ? setAddressModalVisible(true) : navigation.navigate('Address')}>
              <Text style={styles.changeText}>{selectedAddress ? 'Change' : 'Add New'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressCard}>
            <Ionicons name="location" size={24} color={colors.link} style={styles.addressIcon} />
            <View style={{ flex: 1 }}>
              {selectedAddress && <Text style={styles.addressTypeBadge}>{selectedAddress.type}</Text>}
              <Text style={styles.addressText} numberOfLines={2}>
                  {!user ? 'Please login to select an address' : 
                   selectedAddress ? `${selectedAddress.flat}, ${selectedAddress.area}, ${selectedAddress.city} - ${selectedAddress.pincode}` : 
                   'No delivery address found. Please add an address.'}
              </Text>
            </View>
          </View>
        </View>

        {/* 🛍️ ORDER SUMMARY (List of Cart Items) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary ({cartItems.length} Items)</Text>
          <View style={styles.summaryCard}>
            {cartItems.map((item, idx) => (
              <View key={idx} style={[styles.productRow, idx === cartItems.length - 1 && { borderBottomWidth: 0, paddingBottom: 0, marginBottom: 0 }]}>
                <View style={styles.productImgBox}>
                  <Image source={{ uri: item.image }} style={styles.productImg} resizeMode="contain" />
                </View>
                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                  <Text style={styles.productCategory}>{item.category}</Text>
                  <View style={styles.priceQtyRow}>
                    <Text style={styles.productPrice}>₹{item.price * item.quantity}</Text>
                    <Text style={styles.productQty}>Qty: {item.quantity}</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* 💳 PAYMENT METHOD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'Online' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('Online')}
          >
            <Ionicons name="card" size={20} color={paymentMethod === 'Online' ? colors.link : '#64748B'} />
            <Text style={[styles.paymentText, paymentMethod === 'Online' && styles.paymentTextActive]}>Pay Online (UPI, Cards)</Text>
            {paymentMethod === 'Online' && <Ionicons name="checkmark-circle" size={20} color={colors.link} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('COD')}
          >
            <Ionicons name="cash" size={20} color={paymentMethod === 'COD' ? colors.link : '#64748B'} />
            <Text style={[styles.paymentText, paymentMethod === 'COD' && styles.paymentTextActive]}>Cash on Delivery</Text>
            {paymentMethod === 'COD' && <Ionicons name="checkmark-circle" size={20} color={colors.link} />}
          </TouchableOpacity>
        </View>

        {/* 🧾 BILL DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          <View style={styles.billCard}>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Item Total</Text>
              <Text style={styles.billValue}>₹{initialTotalAmount}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billValue}>₹{deliveryFee}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.billRow}>
              <Text style={styles.billTotalLabel}>Total to Pay</Text>
              <Text style={styles.billTotalValue}>₹{totalAmount}</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* 🟢 BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPriceBox}>
          <Text style={styles.bottomPriceLabel}>Total Amount</Text>
          <Text style={styles.bottomPriceValue}>₹{totalAmount}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.placeOrderBtn, isPlacingOrder && { opacity: 0.7 }]} 
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
             <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.placeOrderText}>Place Order</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 🚀 FULL PREMIUM ADDRESS SELECTOR MODAL */}
      <Modal visible={addressModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Delivery Address</Text>
              <TouchableOpacity onPress={() => setAddressModalVisible(false)}>
                <Ionicons name="close" size={24} color="#0F172A" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 320 }}>
              {savedAddresses.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.addressSelectCard, selectedAddress?.id === item.id && styles.activeAddressCard]}
                  onPress={() => { setSelectedAddress(item); setAddressModalVisible(false); }}
                >
                  <View style={styles.addressSelectRow}>
                    <MaterialIcons name={item.type === 'Home' ? 'home' : item.type === 'Office' ? 'work' : 'place'} size={20} color={selectedAddress?.id === item.id ? colors.link : '#64748B'} />
                    <Text style={[styles.addressSelectType, selectedAddress?.id === item.id && { color: colors.link }]}>{item.type}</Text>
                    {selectedAddress?.id === item.id && <Ionicons name="checkmark-circle" size={20} color={colors.link} style={{ marginLeft: 'auto' }} />}
                  </View>
                  <Text style={styles.addressSelectText}>{item.flat}, {item.area}, {item.city} - {item.pincode}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TouchableOpacity style={styles.manageAddressBtn} onPress={() => { setAddressModalVisible(false); navigation.navigate('Address'); }}>
              <MaterialIcons name="edit-location" size={20} color="#FFF" />
              <Text style={styles.manageAddressBtnText}>Manage / Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100, paddingTop: 10 },
  section: { marginBottom: 25 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  changeText: { color: colors.link, fontSize: 13, fontWeight: '800' },
  
  addressCard: { flexDirection: 'row', backgroundColor: '#FFF', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  addressIcon: { marginRight: 15 },
  addressTypeBadge: { fontSize: 10, fontWeight: '800', color: colors.link, backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 6 },
  addressText: { fontSize: 13, color: '#475569', lineHeight: 20, fontWeight: '500' },

  summaryCard: { backgroundColor: '#FFF', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderColor: '#F1F5F9' },
  productImgBox: { width: 60, height: 60, backgroundColor: '#F8FAFC', borderRadius: 10, padding: 5, marginRight: 15, borderWidth: 1, borderColor: '#F1F5F9' },
  productImg: { width: '100%', height: '100%' },
  productDetails: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  productCategory: { fontSize: 11, color: '#94A3B8', fontWeight: '700', textTransform: 'uppercase', marginBottom: 8 },
  priceQtyRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productPrice: { fontSize: 16, fontWeight: '900', color: colors.link },
  productQty: { fontSize: 12, fontWeight: '700', color: '#64748B' },

  paymentOption: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 10 },
  paymentOptionActive: { borderColor: colors.link, backgroundColor: '#EFF6FF' },
  paymentText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#475569', marginLeft: 12 },
  paymentTextActive: { color: colors.link, fontWeight: '800' },

  billCard: { backgroundColor: '#FFF', padding: 18, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#64748B', fontWeight: '600' },
  billValue: { fontSize: 14, fontWeight: '700', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  billTotalLabel: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  billTotalValue: { fontSize: 18, fontWeight: '900', color: colors.link },

  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', padding: 20, paddingBottom: Platform.OS === 'ios' ? 35 : 20, borderTopWidth: 1, borderTopColor: '#E2E8F0', justifyContent: 'space-between', alignItems: 'center' },
  bottomPriceBox: { flex: 1 },
  bottomPriceLabel: { fontSize: 12, color: '#64748B', fontWeight: '700', marginBottom: 2 },
  bottomPriceValue: { fontSize: 22, fontWeight: '900', color: '#0F172A' },
  placeOrderBtn: { backgroundColor: colors.link, flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 14, gap: 6 },
  placeOrderText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  // Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  addressSelectCard: { backgroundColor: '#F8FAFC', padding: 15, borderRadius: 16, borderWidth: 1.5, borderColor: '#E2E8F0', marginBottom: 12 },
  activeAddressCard: { borderColor: colors.link, backgroundColor: '#EFF6FF' },
  addressSelectRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  addressSelectType: { fontSize: 14, fontWeight: '800', marginLeft: 8, color: '#0F172A' },
  addressSelectText: { fontSize: 13, color: '#64748B', lineHeight: 20, fontWeight: '500' },
  manageAddressBtn: { flexDirection: 'row', backgroundColor: colors.link, paddingVertical: 16, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 15, gap: 8 },
  manageAddressBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' }
});