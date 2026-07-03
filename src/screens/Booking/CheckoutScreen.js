// src/screens/Booking/CheckoutScreen.js
import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, TouchableOpacity, 
  Platform, StatusBar, ScrollView, Alert 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

// 🚀 Naya Import: Check karne ke liye ki user logged in hai ya nahi
import { useAuth } from '../../context/AuthContext'; 

export default function CheckoutScreen({ navigation, route }) {
  const { user } = useAuth(); // Auth context se user details nikal li
  
  // 🚀 Data Passed from ServiceSelectionScreen
  const brandName = route.params?.brandName || 'Unknown Brand';
  const modelName = route.params?.modelName || 'Unknown Model';
  const selectedServices = route.params?.selectedServices || [];
  const initialServicesTotal = route.params?.totalAmount || 0;

  // mode: 'home' (Visit), 'pickup' (Courier), 'self' (Store)
  const [mode, setMode] = useState('home'); 
  
  // Service Fees
  const visitFee = 199;   
  const pickupFee = 99;   
  const selfFee = 0;      

  // Logic to calculate dynamic total
  const getFee = () => {
    if (mode === 'home') return visitFee;
    if (mode === 'pickup') return pickupFee;
    return selfFee; 
  };

  const totalPayable = initialServicesTotal + getFee();

  // 🚀 Auth Check Logic before proceeding to Payment
  const handleProceedToPayment = () => {
    if (!user) {
      // Agar Guest hai toh turant Login Screen pe bhej do
      Alert.alert(
        "Login Required",
        "Please login to your account to complete this booking.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Login Now", onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    // Agar sab theek hai toh payment wali screen pe data pass kardo
    navigation.navigate('PaymentSelection', {
      brandName,
      modelName,
      selectedServices,
      totalAmount: totalPayable
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* DEVICE DETAILS SUMMARY */}
        <View style={styles.deviceBox}>
            <Text style={styles.deviceTitle}>{brandName} {modelName}</Text>
            {selectedServices.map((srv, index) => (
                <Text key={index} style={styles.deviceSubtitle}>
                    • {srv.serviceTitle} (via {srv.vendorName})
                </Text>
            ))}
        </View>

        {/* 1. SERVICE MODE SELECTION */}
        <Text style={styles.sectionTitle}>Select Service Mode</Text>
        <View style={styles.modeContainer}>
          
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'home' && styles.activeMode]}
            onPress={() => setMode('home')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="home-repair-service" size={24} color={mode === 'home' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'home' && styles.activeText]}>Home Visit</Text>
            <Text style={[styles.feeText, mode === 'home' && styles.activeText]}>₹{visitFee}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'pickup' && styles.activeMode]}
            onPress={() => setMode('pickup')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="local-shipping" size={24} color={mode === 'pickup' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'pickup' && styles.activeText]}>Pickup & Drop</Text>
            <Text style={[styles.feeText, mode === 'pickup' && styles.activeText]}>₹{pickupFee}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'self' && styles.activeMode]}
            onPress={() => setMode('self')}
            activeOpacity={0.8}
          >
            <MaterialIcons name="store" size={24} color={mode === 'self' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'self' && styles.activeText]}>Self Drop</Text>
            <Text style={[styles.feeText, mode === 'self' && styles.activeText]}>FREE</Text>
          </TouchableOpacity>
        </View>

        {/* ADDRESS SELECTION (Visible only if Home Visit or Pickup) */}
        {(mode === 'home' || mode === 'pickup') && (
            <View style={styles.addressBox}>
                <View style={styles.addressHeader}>
                    <Text style={styles.addressTitle}>Service Address</Text>
                    {/* Ye aage Manage Addresses wali screen se jhodenge */}
                    <TouchableOpacity><Text style={styles.changeLink}>Change</Text></TouchableOpacity>
                </View>
                <View style={styles.addressBody}>
                    <Ionicons name="location" size={24} color={colors.primary} />
                    <Text style={styles.addressText} numberOfLines={2}>
                        {user ? '123, Sector 45, Gurgaon, Haryana - 122003' : 'Please login to select address'}
                    </Text>
                </View>
            </View>
        )}

        {/* 2. ORDER SUMMARY */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
           <View style={styles.billRow}>
               <Text style={styles.billLabel}>Repair Charges</Text>
               <Text style={styles.billValue}>₹{initialServicesTotal}</Text>
           </View>
           <View style={styles.billRow}>
             <Text style={styles.billLabel}>{mode === 'home' ? 'Home Visit Fee' : mode === 'pickup' ? 'Pickup & Drop Fee' : 'Self Drop'}</Text>
             <Text style={[styles.billValue, {fontWeight: '800'}]}>{getFee() === 0 ? 'FREE' : `₹${getFee()}`}</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.billRow}>
               <Text style={styles.totalText}>Total Payable</Text>
               <Text style={styles.totalText}>₹{totalPayable}</Text>
           </View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.payBtn} onPress={handleProceedToPayment}>
          <Text style={styles.btnText}>Proceed to Payment</Text>
          <MaterialIcons name="chevron-right" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  
  deviceBox: { backgroundColor: '#EFF6FF', padding: 15, borderRadius: 16, marginBottom: 25, borderWidth: 1, borderColor: '#BFDBFE' },
  deviceTitle: { fontSize: 16, fontWeight: '900', color: colors.primary, marginBottom: 5 },
  deviceSubtitle: { fontSize: 13, color: '#3B82F6', fontWeight: '600', marginTop: 2 },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 15 },
  
  modeContainer: { flexDirection: 'row', gap: 10, marginBottom: 25 },
  modeBtn: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  activeMode: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { fontSize: 11, fontWeight: '800', marginTop: 8, color: '#64748B', textAlign: 'center' },
  activeText: { color: '#FFF' },
  feeText: { fontSize: 10, fontWeight: '900', marginTop: 2 },
  
  addressBox: { backgroundColor: '#FFF', padding: 18, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 25 },
  addressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  addressTitle: { fontSize: 14, fontWeight: '800', color: '#0F172A' },
  changeLink: { color: colors.primary, fontWeight: '700', fontSize: 13 },
  addressBody: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  addressText: { flex: 1, fontSize: 13, color: '#64748B', lineHeight: 20 },

  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  billLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },
  billValue: { fontSize: 14, color: '#0F172A', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 10 },
  totalText: { fontSize: 18, fontWeight: '900', color: '#0F172A' },
  
  bottomBar: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0', paddingBottom: Platform.OS === 'ios' ? 30 : 20 },
  payBtn: { flexDirection: 'row', backgroundColor: '#2563EB', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 5 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});