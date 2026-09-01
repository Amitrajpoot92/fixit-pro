// src/screens/Booking/PaymentSelectionScreen.js
import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ScrollView, StatusBar, Platform, ActivityIndicator, Alert, TextInput
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, getDocs, query, where, updateDoc, serverTimestamp, increment, onSnapshot } from 'firebase/firestore'; 
import RazorpayCheckout from 'react-native-razorpay';
import { encode } from 'base-64'; 

import { db, auth } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

// 🔑 AAPKI LIVE RAZORPAY KEYS YAHAN INTEGRATE HO GAYI HAIN
const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID; 
const RAZORPAY_KEY_SECRET = process.env.EXPO_PUBLIC_RAZORPAY_KEY_SECRET;

export default function PaymentSelectionScreen({ navigation, route }) {
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0); 

  // 🎟️ Coupon States
  const [couponCode, setCouponCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState(null); // { code, discount, type, referrerUid, docId }
  
  // Draft Order States (Security against app crashes)
  const draftDocId = useRef(null);
  const draftOrderId = useRef(null);

  const initialAmount = route.params?.totalAmount || 0; 
  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const amount = Math.max(initialAmount - discountAmount, 0);

  const brandName = route.params?.brandName || 'Unknown Brand';
  const modelName = route.params?.modelName || 'Unknown Model';
  const selectedServices = route.params?.selectedServices || [];
  const serviceMode = route.params?.serviceMode || 'self';
  const scheduleDate = route.params?.scheduleDate || null;
  const scheduleTime = route.params?.scheduleTime || null;
  const serviceAddress = route.params?.serviceAddress || null; 
  const selectedTechId = route.params?.selectedTechId; 
  const selectedTechName = route.params?.selectedTechName;

  const paymentOptions = [
    { id: 'upi', name: 'UPI / Online Payment', icon: 'account-balance', desc: 'Secure & Auto-verified via Razorpay' },
    { id: 'wallet', name: 'Pay via Wallet', icon: 'account-balance-wallet', desc: 'Use your digital wallet balance' },
    { id: 'cod', name: 'Cash on Delivery (COD)', icon: 'payments', desc: 'Pay technician after repair' },
  ];

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser?.uid) {
      const userRef = doc(db, 'users', currentUser.uid);
      const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
          setWalletBalance(docSnap.data().walletBalance || 0);
        }
      });
      return () => unsubscribeUser();
    }
  }, []);

  // 🎟️ COUPON LOGIC
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      Alert.alert("Error", "Please enter a coupon code.");
      return;
    }
    setApplyingCoupon(true);
    const currentUser = auth.currentUser;
    
    try {
      const formattedCode = couponCode.trim().toUpperCase();

      // 1. Check if it's a Reward Coupon
      const qRewards = query(
        collection(db, 'coupons'), 
        where('code', '==', formattedCode), 
        where('isActive', '==', true), 
        where('ownerUid', '==', currentUser.uid)
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
        if (referrer.id === currentUser.uid) {
          Alert.alert("Invalid", "You cannot use your own referral code.");
          setApplyingCoupon(false);
          return;
        }
        
        // Check if first service booking ever
        const ordersQ = query(collection(db, 'bookings'), where('userId', '==', currentUser.uid));
        const ordersSnap = await getDocs(ordersQ);
        
        if (!ordersSnap.empty) {
          Alert.alert("Not Eligible", "Referral codes can only be used on your first booking.");
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
  const createDraftOrder = async (payMode, payStatus, initialStatus) => {
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid;

    const userDocRef = doc(db, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    let realCustomerName = currentUser.displayName || 'Customer';
    let realCustomerEmail = currentUser.email || 'guest@example.com';
    let realCustomerPhone = '';

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data();
      if (userData.name) realCustomerName = userData.name;
      if (userData.email) realCustomerEmail = userData.email;
      if (userData.phone && userData.phone.trim() !== '') realCustomerPhone = userData.phone;
    }

    const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

    const orderData = {
      orderId, userId, brandName, modelName, services: selectedServices, totalAmount: amount,
      paymentMethod: method, 
      paymentMode: payMode,     
      paymentStatus: payStatus,
      transactionId: 'PENDING', 
      status: initialStatus, 
      customerName: realCustomerName, customerEmail: realCustomerEmail, customerPhone: realCustomerPhone, 
      technicianId: selectedTechId, technicianName: selectedTechName, technicianStatus: 'Pending', 
      serviceMode, scheduleDate, scheduleTime, serviceAddress, 
      appliedCoupon: appliedCoupon?.code || null,
      discountAmount: appliedCoupon?.discount || 0,
      referrerUid: appliedCoupon?.referrerUid || null,
      couponDocId: appliedCoupon?.docId || null,
      referralRewarded: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, 'bookings'), orderData);
    return { docId: docRef.id, orderId: orderId, customerData: { name: realCustomerName, email: realCustomerEmail, phone: realCustomerPhone } };
  };

  // 2️⃣ CONFIRM ONLINE ORDER
  const confirmOnlineOrder = async (docId, displayOrderId, transactionId) => {
    try {
      const orderRef = doc(db, 'bookings', docId);
      await updateDoc(orderRef, {
        paymentStatus: 'Paid',
        status: 'Order Placed',
        transactionId: transactionId, 
        updatedAt: serverTimestamp()
      });

      // Mark reward coupon as inactive
      if (appliedCoupon && appliedCoupon.type === 'reward' && appliedCoupon.docId) {
        await updateDoc(doc(db, 'coupons', appliedCoupon.docId), {
          isActive: false,
          usedAt: serverTimestamp(),
          usedOrderId: displayOrderId
        });
      }

      setLoading(false);
      // 🚀 FIX: Yahan paymentMode: 'Online' pass kar diya taaki success screen par Pre-paid dikhe
      navigation.navigate('OrderSuccess', { orderId: displayOrderId, paymentMode: 'Online' });
    } catch (error) {
      Alert.alert("Error", "Payment successful but order update failed. Please contact support.");
      setLoading(false);
    }
  };

  // 3️⃣ PAYMENT BUTTON HANDLER
  const handlePayment = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.uid) return Alert.alert("Login Required", "Please login to complete booking.");
    if (!selectedTechId) return Alert.alert("Error", "Technician data lost.");

    setLoading(true);

    if (method === 'cod') {
      try {
        const draft = await createDraftOrder('Offline', 'Pending', 'Order Placed');
        
        // Mark reward coupon as inactive
        if (appliedCoupon && appliedCoupon.type === 'reward' && appliedCoupon.docId) {
          await updateDoc(doc(db, 'coupons', appliedCoupon.docId), {
            isActive: false,
            usedAt: serverTimestamp(),
            usedOrderId: draft.orderId
          });
        }

        setLoading(false);
        // 🚀 FIX: Yahan paymentMode: 'Offline' pass kar diya COD ke liye
        navigation.navigate('OrderSuccess', { orderId: draft.orderId, paymentMode: 'Offline' });
      } catch (error) {
        Alert.alert("Error", "Could not process COD order.");
        setLoading(false);
      }
    } else if (method === 'wallet') {
      // 🚀 WALLET LOGIC
      if (walletBalance < amount) {
        Alert.alert("Insufficient Balance", "You do not have enough wallet balance for this booking. Please add money or choose another method.");
        setLoading(false);
        return;
      }

      try {
        const draft = await createDraftOrder('Wallet', 'Paid', 'Order Placed');
        
        // Deduct from wallet & add transaction
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          walletBalance: increment(-amount)
        });
        
        await addDoc(collection(db, 'users', currentUser.uid, 'transactions'), {
          title: `Paid for Booking #${draft.orderId}`,
          amount: amount,
          type: 'debit',
          orderId: draft.orderId,
          createdAt: serverTimestamp()
        });

        // Mark order transaction ID
        await updateDoc(doc(db, 'bookings', draft.docId), {
          transactionId: `WAL-${Date.now()}`
        });

        // Mark reward coupon as inactive
        if (appliedCoupon && appliedCoupon.type === 'reward' && appliedCoupon.docId) {
          await updateDoc(doc(db, 'coupons', appliedCoupon.docId), {
            isActive: false,
            usedAt: serverTimestamp(),
            usedOrderId: draft.orderId
          });
        }

        setLoading(false);
        navigation.navigate('OrderSuccess', { orderId: draft.orderId, paymentMode: 'Online' });
      } catch (error) {
        Alert.alert("Error", "Could not process Wallet order.");
        setLoading(false);
      }
    } else {
      try {
        const draft = await createDraftOrder('Online', 'Pending', 'Payment_Pending');
        draftDocId.current = draft.docId;
        draftOrderId.current = draft.orderId;

        const basicAuth = encode(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
        
        let safePhone = draft.customerData.phone;
        
        if (safePhone) {
          safePhone = safePhone.replace(/\D/g, '').slice(-10);
        }

        if (!safePhone || safePhone.length < 10 || /^(.)\1{9}$/.test(safePhone)) {
          safePhone = "9812345678"; 
        }

        const finalAmountInPaise = Math.round(Number(amount) * 100);
        if (finalAmountInPaise < 100) {
          Alert.alert("Invalid Amount", "Total amount must be at least ₹1 for online payment.");
          setLoading(false);
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
            description: 'Payment for FixitPro Booking',
            image: 'https://i.imgur.com/3g7nmJC.png',
            currency: 'INR',
            key: RAZORPAY_KEY_ID,
            amount: finalAmountInPaise,
            name: 'FixitPro',
            order_id: data.id,
            prefill: {
              email: draft.customerData.email || 'guest@example.com',
              contact: safePhone,
              name: draft.customerData.name || 'Customer'
            },
            theme: {color: '#3B82F6'}
          }
          
          RazorpayCheckout.open(options).then(async (razorpayData) => {
            // handle success
            setLoading(true);
            if (draftDocId.current && draftOrderId.current) {
              await confirmOnlineOrder(draftDocId.current, draftOrderId.current, razorpayData.razorpay_payment_id); 
            } else {
              Alert.alert("Error", "Order sync failed.");
              setLoading(false);
            }
          }).catch(async (error) => {
            // handle failure
            setLoading(false);
            if (draftDocId.current) await updateDoc(doc(db, 'bookings', draftDocId.current), { status: 'Payment_Failed' });
            
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
          setLoading(false);
        }
      } catch (error) {
        Alert.alert("Gateway Error", "Could not connect to Razorpay.");
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={loading}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
          <Ionicons name="home-outline" size={22} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            {appliedCoupon && (
              <Text style={styles.originalAmountValue}>₹{initialAmount}</Text>
            )}
            <Text style={styles.amountValue}>₹{amount}</Text>
          </View>
        </View>

        {/* 🎟️ APPLY COUPON SECTION */}
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
        <View style={{height: 20}} />

        <Text style={styles.sectionTitle}>Select Method</Text>
        {paymentOptions.map((opt) => (
          <TouchableOpacity 
            key={opt.id} 
            style={[styles.optionCard, method === opt.id && styles.activeOption]}
            onPress={() => setMethod(opt.id)}
            activeOpacity={0.8}
            disabled={loading}
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name={opt.icon} size={24} color={method === opt.id ? colors.primary : '#64748B'} />
            </View>
            <View style={{flex: 1, marginLeft: 15}}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                <Text style={[styles.optionName, method === opt.id && {color: colors.primary}]}>{opt.name}</Text>
                {opt.id === 'wallet' && (
                  <Text style={{ fontSize: 13, fontWeight: '700', color: walletBalance >= amount ? '#16A34A' : '#EF4444' }}>
                    ₹{walletBalance}
                  </Text>
                )}
              </View>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            <Ionicons name={method === opt.id ? "radio-button-on" : "radio-button-off"} size={20} color={method === opt.id ? colors.primary : '#CBD5E1'} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={[styles.payBtn, loading && { opacity: 0.7 }]} onPress={handlePayment} disabled={loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Text style={styles.btnText}>{method === 'cod' ? 'Confirm Order' : `Pay ₹${amount}`}</Text>
              <MaterialIcons name="chevron-right" size={22} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  amountCard: { backgroundColor: '#2563EB', padding: 30, borderRadius: 24, alignItems: 'center', marginBottom: 30 },
  amountLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  amountValue: { color: '#FFF', fontSize: 36, fontWeight: '900', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 15 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 15, borderWidth: 1.5, borderColor: '#E2E8F0' },
  activeOption: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  iconCircle: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  optionName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  optionDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  bottomBar: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  payBtn: { flexDirection: 'row', backgroundColor: '#2563EB', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 5 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  webviewHeader: { padding: 15, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0', flexDirection: 'row', alignItems: 'center', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 15 },
  webviewCloseBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  webviewCloseText: { color: '#EF4444', fontWeight: 'bold', marginLeft: 5 },
  
  // Coupon Styles
  originalAmountValue: { color: 'rgba(255,255,255,0.6)', fontSize: 22, fontWeight: '700', textDecorationLine: 'line-through', marginRight: 10, marginTop: 5 },
  couponInputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 },
  couponInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 12, padding: 14, fontSize: 14, color: '#0F172A', fontWeight: '700' },
  applyCouponBtn: { backgroundColor: '#0F172A', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 12, justifyContent: 'center' },
  applyCouponText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  appliedCouponCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#DCFCE7', marginBottom: 5 },
  appliedCouponLeft: { flexDirection: 'row', alignItems: 'center' },
  appliedCouponCode: { fontSize: 14, fontWeight: '800', color: '#166534', textTransform: 'uppercase' },
  appliedCouponSaved: { fontSize: 12, fontWeight: '600', color: '#16A34A', marginTop: 2 },
  removeCouponBtn: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  removeCouponText: { fontSize: 12, fontWeight: '800', color: '#15803D' }
});