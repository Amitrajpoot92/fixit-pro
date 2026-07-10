// src/screens/Booking/PaymentSelectionScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  ScrollView, StatusBar, Platform, ActivityIndicator, Alert 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'; 

// Firebase & App Imports
import { db, auth } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

export default function PaymentSelectionScreen({ navigation, route }) {
  const [method, setMethod] = useState('upi');
  const [loading, setLoading] = useState(false);

  // CheckoutScreen se aane wala data
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
    { id: 'upi', name: 'UPI (GPay, PhonePe, Paytm)', icon: 'account-balance', desc: 'Pay instantly via your favorite UPI app' },
    { id: 'card', name: 'Credit / Debit Card', icon: 'credit-card', desc: 'All major cards supported' },
    { id: 'cod', name: 'Cash on Delivery (COD)', icon: 'payments', desc: 'Pay technician after repair' },
  ];

  // ORDER CREATE KARNE KA LOGIC
  const handlePayment = async () => {
    const currentUser = auth.currentUser;
    const userId = currentUser?.uid;
    
    if (!userId) {
      Alert.alert("Login Required", "Please login to complete your booking.");
      return;
    }

    if (!selectedTechId) {
      Alert.alert("Error", "Technician data was lost. Please restart the booking process.");
      return;
    }

    setLoading(true);

    try {
      // Users collection se data fetch karo
      const userDocRef = doc(db, 'users', userId);
      const userDocSnap = await getDoc(userDocRef);
      
      let realCustomerName = currentUser.displayName || 'Customer';
      let realCustomerEmail = currentUser.email || 'N/A';
      let realCustomerPhone = 'N/A';

      // 1. Check inside Users Collection
      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.name) realCustomerName = userData.name;
        if (userData.email) realCustomerEmail = userData.email;
        
        // 🚀 BULLETPROOF PHONE CHECK: Har possible key check karega
        if (userData.phone && userData.phone.trim() !== '') realCustomerPhone = userData.phone;
        else if (userData.phoneNumber && userData.phoneNumber.trim() !== '') realCustomerPhone = userData.phoneNumber;
        else if (userData.mobile && userData.mobile.trim() !== '') realCustomerPhone = userData.mobile;
      }

      // 2. Check Auth Phone Number (Agar Users DB me nahi mila)
      if (realCustomerPhone === 'N/A' && currentUser.phoneNumber) {
        realCustomerPhone = currentUser.phoneNumber;
      }

      // 3. Check inside Selected Address (Agar dono jagah nahi mila)
      if (realCustomerPhone === 'N/A' && serviceAddress) {
        if (serviceAddress.phone) realCustomerPhone = serviceAddress.phone;
        else if (serviceAddress.mobile) realCustomerPhone = serviceAddress.mobile;
        else if (serviceAddress.phoneNumber) realCustomerPhone = serviceAddress.phoneNumber;
      }

      const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderData = {
        orderId,
        userId,
        brandName,
        modelName,
        services: selectedServices,
        totalAmount: amount,
        paymentMethod: method,
        paymentStatus: method === 'cod' ? 'Pending' : 'Paid',
        status: 'Order Placed',
        
        // REAL DATA SAVED PERMANENTLY HERE
        customerName: realCustomerName,
        customerEmail: realCustomerEmail,
        customerPhone: realCustomerPhone, // Ab ye 100% save hoga

        // Technician Integration
        technicianId: selectedTechId,
        technicianName: selectedTechName,
        technicianStatus: 'Pending', 
        
        // Mode & Scheduling
        serviceMode: serviceMode,     
        scheduleDate: scheduleDate,   
        scheduleTime: scheduleTime, 
        serviceAddress: serviceAddress,

        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'bookings'), orderData);

      setLoading(false);
      navigation.navigate('OrderSuccess', { orderId });

    } catch (error) {
      console.error("Booking Error: ", error);
      Alert.alert("Error", "Could not process your booking. Please try again.");
      setLoading(false);
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
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});