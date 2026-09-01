// src/screens/accessories/ProductCheckoutScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Image, Platform, StatusBar, ActivityIndicator, Alert, Modal, TextInput
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// 🔥 Firebase & WebView Imports
import { collection, addDoc, serverTimestamp, query, where, onSnapshot, doc, getDoc, getDocs, writeBatch, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext'; 
import RazorpayCheckout from 'react-native-razorpay';
import { encode } from 'base-64'; 

// 🔑 LIVE RAZORPAY KEYS
const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID; 
const RAZORPAY_KEY_SECRET = process.env.EXPO_PUBLIC_RAZORPAY_KEY_SECRET;

export default function ProductCheckoutScreen({ navigation, route }) {
  const cartItems = route.params?.cartItems || [];
  const initialTotalAmount = route.params?.totalAmount || 0;
  const { user } = useAuth(); 
  
  const [paymentMethod, setPaymentMethod] = useState('Online');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  // 🎟️ Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, type, referrerUid, docId }

  const draftDocId = useRef(null);
  const draftOrderId = useRef(null);

  // User details & Address states
  const [userData, setUserData] = useState(null);
  const [walletBalance, setWalletBalance] = useState(0); // 🚀 Add wallet balance state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [addressModalVisible, setAddressModalVisible] = useState(false);

  const deliveryFee = 50;
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const totalAmount = Math.max(initialTotalAmount + deliveryFee - discountAmount, 0);

  useEffect(() => {
    if (!user?.uid) return;

    // Fetch User Data & Wallet Balance
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
        setWalletBalance(docSnap.data().walletBalance || 0); // 🚀 Read wallet balance
      }
    });

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

    return () => {
        unsubscribe();
        unsubscribeUser();
    };
  }, [user]);

  // 🛒 Helper: Clear Cart
  const clearUserCart = async () => {
    try {
      const batch = writeBatch(db);
      cartItems.forEach(item => {
        if (item.cartId) {
          const cartRef = doc(db, `users/${user.uid}/cart`, item.cartId);
          batch.delete(cartRef);
        }
      });
      await batch.commit();
    } catch (e) {
      console.error("Error clearing cart: ", e);
    }
  };

  // 🎟️ COUPON LOGIC
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code.");
      return;
    }
    setApplyingCoupon(true);
    
    try {
      const formattedCode = couponCode.trim().toUpperCase();

      // 1. Check if it's a Reward Coupon
      const qRewards = query(
        collection(db, 'coupons'), 
        where('code', '==', formattedCode), 
        where('isActive', '==', true), 
        where('ownerUid', '==', user.uid)
      );
      const rewardSnap = await getDocs(qRewards);
      
      if (!rewardSnap.empty) {
        const rewardData = rewardSnap.docs[0].data();
        setAppliedCoupon({ 
          code: formattedCode, 
          discount: rewardData.discount || 30, 
          type: 'reward', 
          docId: rewardSnap.docs[0].id 
        });
        setApplyingCoupon(false);
        Alert.alert("Success", `Reward coupon applied! You got ₹${rewardData.discount || 30} off.`);
        return;
      }

      // 2. Check if it's a Global Coupon
      const qGlobal = query(
        collection(db, 'coupons'),
        where('code', '==', formattedCode),
        where('type', '==', 'global'),
        where('isActive', '==', true)
      );
      const globalSnap = await getDocs(qGlobal);
      if (!globalSnap.empty) {
        const globalData = globalSnap.docs[0].data();
        setAppliedCoupon({
          code: formattedCode,
          discount: globalData.discount,
          type: 'global',
          docId: globalSnap.docs[0].id
        });
        setApplyingCoupon(false);
        Alert.alert("Success", `Promo applied! You got ₹${globalData.discount} off.`);
        return;
      }

      // 3. Check if it's a Referral Code
      const qReferral = query(collection(db, 'users'), where('referralCode', '==', formattedCode));
      const refSnap = await getDocs(qReferral);
      
      if (!refSnap.empty) {
        const referrer = refSnap.docs[0];
        if (referrer.id === user.uid) {
          Alert.alert("Invalid", "You cannot use your own referral code.");
          setApplyingCoupon(false);
          return;
        }
        
        // Check if first order ever
        const ordersQ = query(collection(db, 'product_orders'), where('userId', '==', user.uid));
        const ordersSnap = await getDocs(ordersQ);
        
        if (!ordersSnap.empty) {
          Alert.alert("Not Eligible", "Referral codes can only be used on your first order.");
          setApplyingCoupon(false);
          return;
        }
        
        // Fetch dynamic discount
        let refDiscount = 50;
        try {
          const snapRef = await getDoc(doc(db, 'settings', 'referral'));
          if (snapRef.exists() && snapRef.data().referralDiscount) {
            refDiscount = snapRef.data().referralDiscount;
          }
        } catch(e) {}

        setAppliedCoupon({ 
          code: formattedCode, 
          discount: refDiscount, 
          type: 'referral', 
          referrerUid: referrer.id 
        });
        setApplyingCoupon(false);
        Alert.alert("Success", `Referral code applied! You got ₹${refDiscount} off.`);
        return;
      }

      Alert.alert("Invalid Coupon", "This coupon code is invalid or expired.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Could not apply coupon.");
    }
    setApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };

  // 1️⃣ DRAFT ORDER CREATION
  const createDraftOrder = async (payMode, initialStatus) => {
    const orderId = `ORD-P${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      orderId: orderId,
      userId: user.uid,
      userName: userData?.name || 'Customer', 
      userPhone: userData?.mobile || user.phoneNumber || '', 
      userEmail: userData?.email || user.email || 'guest@example.com', 
      productDetails: cartItems, 
      deliveryAddress: selectedAddress, 
      paymentMethod: paymentMethod,
      paymentMode: payMode,
      totalAmount: totalAmount,
      transactionId: 'PENDING',
      status: initialStatus, 
      orderType: 'Ecommerce', 
      appliedCoupon: appliedCoupon?.code || null,
      discountAmount: appliedCoupon?.discount || 0,
      referrerUid: appliedCoupon?.referrerUid || null,
      couponDocId: appliedCoupon?.docId || null,
      referralRewarded: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'product_orders'), orderData);
    return { docId: docRef.id, orderId: orderId, phone: orderData.userPhone, email: orderData.userEmail, name: orderData.userName };
  };

  // 2️⃣ CONFIRM ONLINE ORDER AFTER PAYMENT
  const confirmOnlineOrder = async (docId, displayOrderId, transactionId) => {
    try {
      const orderRef = doc(db, 'product_orders', docId);
      await updateDoc(orderRef, {
        paymentStatus: 'Paid',
        status: 'Pending', // E-commerce initial status
        transactionId: transactionId, 
        updatedAt: serverTimestamp()
      });
      
      // If a reward coupon was used, mark it as inactive (Used)
      if (appliedCoupon && appliedCoupon.type === 'reward' && appliedCoupon.docId) {
        await updateDoc(doc(db, 'coupons', appliedCoupon.docId), {
          isActive: false,
          usedAt: serverTimestamp(),
          usedOrderId: displayOrderId
        });
      }

      await clearUserCart();
      setIsPlacingOrder(false);
      
      // 🚀 UPDATED: Navigate to ProductOrderSuccess
      navigation.navigate('ProductOrderSuccess', { orderId: displayOrderId, paymentMode: 'Online' });
    } catch (error) {
      Alert.alert("Error", "Payment successful but order sync failed. Contact support.");
      setIsPlacingOrder(false);
    }
  };

  // 3️⃣ PLACE ORDER LOGIC (Main Button Click)
  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert("Login Required", "Please login to place an order.");
      return;
    }
    if (!selectedAddress) {
      Alert.alert("Address Required", "Please add a delivery address.");
      return;
    }

    setIsPlacingOrder(true);

    if (paymentMethod === 'COD') {
      try {
        const draft = await createDraftOrder('Offline', 'Pending');
        
        // Mark reward coupon as inactive (Used)
        if (appliedCoupon && appliedCoupon.type === 'reward' && appliedCoupon.docId) {
          await updateDoc(doc(db, 'coupons', appliedCoupon.docId), {
            isActive: false,
            usedAt: serverTimestamp(),
            usedOrderId: draft.orderId
          });
        }

        await clearUserCart();
        setIsPlacingOrder(false);
        // 🚀 UPDATED: Navigate to ProductOrderSuccess
        navigation.navigate('ProductOrderSuccess', { orderId: draft.orderId, paymentMode: 'Offline' });
      } catch (error) {
        Alert.alert("Error", "Could not process COD order.");
        setIsPlacingOrder(false);
      }
    } else {
        // 🚀 WALLET LOGIC
        if (paymentMethod === 'Wallet') {
          if (walletBalance < totalAmount) {
            Alert.alert("Insufficient Balance", "You do not have enough wallet balance for this order. Please add money or choose another method.");
            setIsPlacingOrder(false);
            return;
          }

          // 1. Create Order
          const { docId, orderId } = await createDraftOrder('Wallet', 'Pending');
          
          // 2. Deduct from wallet & add transaction
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            walletBalance: increment(-totalAmount)
          });
          
          await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            title: `Paid for Order #${orderId}`,
            amount: totalAmount,
            type: 'debit',
            orderId: orderId,
            createdAt: serverTimestamp()
          });

          // 3. Mark Order as Paid & Clear Cart
          await updateDoc(doc(db, 'product_orders', docId), {
            paymentStatus: 'Paid',
            status: 'Pending',
            transactionId: `WAL-${Date.now()}`
          });
          // If a reward coupon was used, mark it as inactive
          if (appliedCoupon && appliedCoupon.type === 'reward' && appliedCoupon.docId) {
            await updateDoc(doc(db, 'coupons', appliedCoupon.docId), {
              isActive: false,
              usedAt: serverTimestamp(),
              usedOrderId: orderId
            });
          }

          await clearUserCart();
          setIsPlacingOrder(false);
          navigation.navigate('ProductOrderSuccess', { orderId: orderId, paymentMode: 'Online' });
          return;
        }

        // RAZORPAY LOGIC (Online)
        try {
        const draft = await createDraftOrder('Online', 'Payment_Pending');
        draftDocId.current = draft.docId;
        draftOrderId.current = draft.orderId;

        const basicAuth = encode(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
        
        let safePhone = draft.phone;
        if (safePhone) safePhone = safePhone.replace(/\D/g, '').slice(-10);
        if (!safePhone || safePhone.length < 10 || /^(.)\1{9}$/.test(safePhone)) {
          safePhone = "9812345678"; 
        }

        const finalAmountInPaise = Math.round(Number(totalAmount) * 100);
        if (finalAmountInPaise < 100) {
          Alert.alert("Invalid Amount", "Total amount must be at least ₹1.");
          setIsPlacingOrder(false);
          return;
        }

        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`
          },
          body: JSON.stringify({
            amount: finalAmountInPaise, 
            currency: "INR",
            receipt: draftOrderId.current
          })
        });

        const data = await response.json();
        
        if (data.id) {
          var options = {
            description: 'Payment for FixitPro Products',
            image: 'https://i.imgur.com/3g7nmJC.png',
            currency: 'INR',
            key: RAZORPAY_KEY_ID,
            amount: finalAmountInPaise,
            name: 'FixitPro',
            order_id: data.id,
            prefill: {
              email: draft.email || 'guest@example.com',
              contact: safePhone,
              name: draft.name || 'Customer'
            },
            theme: {color: '#3B82F6'}
          }
          
          RazorpayCheckout.open(options).then(async (razorpayData) => {
            // handle success
            setIsPlacingOrder(true);
            if (draftDocId.current && draftOrderId.current) {
              await confirmOnlineOrder(draftDocId.current, draftOrderId.current, razorpayData.razorpay_payment_id); 
            }
          }).catch(async (error) => {
            // handle failure
            setIsPlacingOrder(false);
            if (draftDocId.current) await updateDoc(doc(db, 'product_orders', draftDocId.current), { status: 'Payment_Failed' });
            
            let errorMsg = "Transaction could not be completed. Please try again.";
            if (error && error.description) {
               try {
                  const parsed = JSON.parse(error.description);
                  if (parsed.error && parsed.error.reason === 'payment_cancelled') {
                      errorMsg = "Payment was cancelled by you.";
                  } else {
                      errorMsg = "Payment failed or was interrupted. Please try again.";
                  }
               } catch (e) {
                  // Not JSON, use as is
                  errorMsg = error.description;
               }
            }
            Alert.alert("Payment Failed", errorMsg);
          });

        } else {
          const razorpayError = data.error?.description || "Failed to generate order via Razorpay API.";
          Alert.alert("Razorpay Error", razorpayError);
          setIsPlacingOrder(false);
        }
      } catch (error) {
        Alert.alert("Gateway Error", "Could not connect to Razorpay.");
        setIsPlacingOrder(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={isPlacingOrder}>
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

        {/* 🛍️ ORDER SUMMARY */}
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

        {/* 🎟️ APPLY COUPON SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Coupons & Offers</Text>
          {appliedCoupon ? (
            <View style={styles.appliedCouponCard}>
              <View style={styles.appliedCouponLeft}>
                <MaterialIcons name="verified" size={24} color="#16A34A" />
                <View style={{marginLeft: 10}}>
                  <Text style={styles.appliedCouponCode}>{appliedCoupon.code}</Text>
                  <Text style={styles.appliedCouponSaved}>You saved ₹{appliedCoupon.discount}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={removeCoupon} style={styles.removeCouponBtn}>
                <Text style={styles.removeCouponText}>REMOVE</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponInputWrapper}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter Coupon or Referral Code"
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity 
                style={[styles.applyCouponBtn, !couponCode && { opacity: 0.5 }]} 
                onPress={handleApplyCoupon}
                disabled={!couponCode || applyingCoupon}
              >
                {applyingCoupon ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.applyCouponText}>APPLY</Text>}
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* 💳 PAYMENT METHOD */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'Online' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('Online')}
            disabled={isPlacingOrder}
          >
            <Ionicons name="card" size={20} color={paymentMethod === 'Online' ? colors.link : '#64748B'} />
            <Text style={[styles.paymentText, paymentMethod === 'Online' && styles.paymentTextActive]}>Pay Online (UPI, Cards)</Text>
            {paymentMethod === 'Online' && <Ionicons name="checkmark-circle" size={20} color={colors.link} />}
          </TouchableOpacity>
          
          {/* 🚀 WALLET OPTION */}
          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'Wallet' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('Wallet')}
            disabled={isPlacingOrder}
          >
            <Ionicons name="wallet" size={20} color={paymentMethod === 'Wallet' ? colors.link : '#64748B'} />
            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={[styles.paymentText, paymentMethod === 'Wallet' && styles.paymentTextActive]}>Pay via Wallet</Text>
              <Text style={{ fontSize: 13, fontWeight: '700', color: walletBalance >= totalAmount ? '#16A34A' : '#EF4444' }}>
                ₹{walletBalance}
              </Text>
            </View>
            {paymentMethod === 'Wallet' && <Ionicons name="checkmark-circle" size={20} color={colors.link} style={{marginLeft: 10}} />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.paymentOption, paymentMethod === 'COD' && styles.paymentOptionActive]}
            onPress={() => setPaymentMethod('COD')}
            disabled={isPlacingOrder}
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
            {appliedCoupon && (
              <View style={styles.billRow}>
                <Text style={[styles.billLabel, {color: '#16A34A'}]}>Discount Applied</Text>
                <Text style={[styles.billValue, {color: '#16A34A'}]}>- ₹{appliedCoupon.discount}</Text>
              </View>
            )}
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
              <Text style={styles.placeOrderText}>{paymentMethod === 'COD' ? 'Place Order' : 'Pay & Place Order'}</Text>
              <Ionicons name="chevron-forward" size={18} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* 🚀 ADDRESS SELECTOR MODAL */}
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

  // WebView Styles
  webviewHeader: { padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15 },
  webviewCloseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  webviewCloseText: { color: '#EF4444', fontWeight: 'bold', marginLeft: 5 },

  // Coupon Styles
  couponInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  couponInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 14, fontSize: 14, color: '#0F172A', fontWeight: '700' },
  applyCouponBtn: { backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, justifyContent: 'center' },
  applyCouponText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  appliedCouponCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#DCFCE7' },
  appliedCouponLeft: { flexDirection: 'row', alignItems: 'center' },
  appliedCouponCode: { fontSize: 14, fontWeight: '800', color: '#166534', textTransform: 'uppercase' },
  appliedCouponSaved: { fontSize: 12, fontWeight: '600', color: '#16A34A', marginTop: 2 },
  removeCouponBtn: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  removeCouponText: { fontSize: 12, fontWeight: '800', color: '#15803D' },

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