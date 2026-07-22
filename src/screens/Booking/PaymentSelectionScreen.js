// src/screens/Booking/PaymentSelectionScreen.js
import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ScrollView, StatusBar, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'; 
import { WebView } from 'react-native-webview'; 
import { encode } from 'base-64'; 

import { db, auth } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

// 🔑 AAPKI LIVE RAZORPAY KEYS YAHAN INTEGRATE HO GAYI HAIN
const RAZORPAY_KEY_ID = 'rzp_test_TDkSfPEYeOrsUu'; 
const RAZORPAY_KEY_SECRET = 'JRFXeYF4d88u0q4tHECJbBw6';

export default function PaymentSelectionScreen({ navigation, route }) {
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null); 
  
  // Draft Order States (Security against app crashes)
  const draftDocId = useRef(null);
  const draftOrderId = useRef(null);

  const amount = route.params?.totalAmount || 0; 
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
    { id: 'cod', name: 'Cash on Delivery (COD)', icon: 'payments', desc: 'Pay technician after repair' },
  ];

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
      serviceMode, scheduleDate, scheduleTime, serviceAddress, createdAt: serverTimestamp(),
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
        setLoading(false);
        // 🚀 FIX: Yahan paymentMode: 'Offline' pass kar diya COD ke liye
        navigation.navigate('OrderSuccess', { orderId: draft.orderId, paymentMode: 'Offline' });
      } catch (error) {
        Alert.alert("Error", "Could not process COD order.");
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

        const response = await fetch('https://api.razorpay.com/v1/payment_links', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${basicAuth}`
          },
          body: JSON.stringify({
            amount: finalAmountInPaise, 
            currency: "INR",
            accept_partial: false,
            reference_id: draftOrderId.current,
            description: `Payment for FixitPro Booking`,
            customer: {
              name: draft.customerData.name || "Customer",
              email: draft.customerData.email || "guest@example.com",
              contact: safePhone
            },
            notify: { sms: false, email: false },
            reminder_enable: false,
            callback_url: "https://fixitpro.com/payment-success",
            callback_method: "get"
          })
        });

        const data = await response.json();
        
        if (data.short_url) {
          setPaymentUrl(data.short_url); 
        } else {
          const razorpayError = data.error?.description || "Failed to generate payment link via Razorpay API.";
          Alert.alert("Razorpay Error", razorpayError);
          setLoading(false);
        }
      } catch (error) {
        Alert.alert("Gateway Error", "Could not connect to Razorpay.");
        setLoading(false);
      }
    }
  };

  const extractParam = (url, paramName) => {
    const regex = new RegExp(`[?&]${paramName}=([^&]+)`);
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  // 4️⃣ AUTO VERIFICATION VIA WEBVIEW
  const handleNavigationStateChange = async (navState) => {
    const currentUrl = navState.url;

    if (currentUrl.includes('fixitpro.com/payment-success')) {
      if (currentUrl.includes('razorpay_payment_link_status=paid')) {
        const razorpayPaymentId = extractParam(currentUrl, 'razorpay_payment_id') || 'Verified_By_Razorpay';

        setPaymentUrl(null); 
        setLoading(true);
        
        if (draftDocId.current && draftOrderId.current) {
          await confirmOnlineOrder(draftDocId.current, draftOrderId.current, razorpayPaymentId); 
        } else {
          Alert.alert("Error", "Order sync failed.");
          setLoading(false);
        }
      } else {
        setPaymentUrl(null);
        setLoading(false);
        if (draftDocId.current) await updateDoc(doc(db, 'bookings', draftDocId.current), { status: 'Payment_Failed' });
        Alert.alert("Payment Failed", "Transaction could not be completed.");
      }
    } else if (currentUrl.includes('payment-failure') || currentUrl.includes('cancel')) {
      setPaymentUrl(null);
      setLoading(false);
      if (draftDocId.current) await updateDoc(doc(db, 'bookings', draftDocId.current), { status: 'Payment_Cancelled' });
      Alert.alert("Payment Cancelled", "Your transaction was cancelled.");
    }
  };

  if (paymentUrl) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
        <View style={styles.webviewHeader}>
          <TouchableOpacity 
            style={styles.webviewCloseBtn}
            onPress={() => {
              setPaymentUrl(null);
              setLoading(false);
              Alert.alert("Cancelled", "You cancelled the payment process.");
            }}
          >
            <Ionicons name="close" size={24} color="#EF4444" />
            <Text style={styles.webviewCloseText}>Cancel Payment</Text>
          </TouchableOpacity>
        </View>
        <WebView 
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          startInLoadingState={true}
          renderLoading={() => <ActivityIndicator size="large" color={colors.primary} style={StyleSheet.absoluteFill} />}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} disabled={loading}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{amount}</Text>
        </View>

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
              <Text style={[styles.optionName, method === opt.id && {color: colors.primary}]}>{opt.name}</Text>
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
  webviewCloseText: { color: '#EF4444', fontWeight: 'bold', marginLeft: 5 }
});