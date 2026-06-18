// src/screens/Booking/CheckoutScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function CheckoutScreen({ navigation }) {
  // mode: 'home' (Visit), 'pickup' (Courier), 'self' (Store)
  const [mode, setMode] = useState('home'); 
  
  const repairCharge = 4999;
  const visitFee = 199;   // Technician ghar aayega
  const pickupFee = 99;   // Courier le jayega
  const selfFee = 0;      // Free

  // Logic to calculate dynamic total
  const getFee = () => {
    if (mode === 'home') return visitFee;
    if (mode === 'pickup') return pickupFee;
    return selfFee; 
  };

  const totalPayable = repairCharge + getFee();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* 1. SERVICE MODE SELECTION */}
        <Text style={styles.sectionTitle}>Select Service Mode</Text>
        <View style={styles.modeContainer}>
          
          {/* Home Visit */}
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'home' && styles.activeMode]}
            onPress={() => setMode('home')}
          >
            <MaterialIcons name="home-repair-service" size={24} color={mode === 'home' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'home' && styles.activeText]}>Home Visit</Text>
            <Text style={[styles.feeText, mode === 'home' && styles.activeText]}>₹{visitFee}</Text>
          </TouchableOpacity>

          {/* Pickup & Drop */}
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'pickup' && styles.activeMode]}
            onPress={() => setMode('pickup')}
          >
            <MaterialIcons name="local-shipping" size={24} color={mode === 'pickup' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'pickup' && styles.activeText]}>Pickup & Drop</Text>
            <Text style={[styles.feeText, mode === 'pickup' && styles.activeText]}>₹{pickupFee}</Text>
          </TouchableOpacity>

          {/* Self Drop */}
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'self' && styles.activeMode]}
            onPress={() => setMode('self')}
          >
            <MaterialIcons name="store" size={24} color={mode === 'self' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'self' && styles.activeText]}>Self Drop</Text>
            <Text style={[styles.feeText, mode === 'self' && styles.activeText]}>FREE</Text>
          </TouchableOpacity>
        </View>

        {/* 2. ORDER SUMMARY */}
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.card}>
           <View style={styles.billRow}><Text>Repair Charges</Text><Text>₹{repairCharge}</Text></View>
           <View style={styles.billRow}>
             <Text>{mode === 'home' ? 'Home Visit Fee' : mode === 'pickup' ? 'Pickup & Drop Fee' : 'Self Drop'}</Text>
             <Text style={{fontWeight: '800'}}>{getFee() === 0 ? 'FREE' : `₹${getFee()}`}</Text>
           </View>
           <View style={styles.divider} />
           <View style={styles.billRow}><Text style={styles.totalText}>Total Payable</Text><Text style={styles.totalText}>₹{totalPayable}</Text></View>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.payBtn} onPress={() => navigation.navigate('OrderSuccess')}>
          <Text style={styles.btnText}>Proceed to Payment</Text>
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
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 15 },
  modeContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  modeBtn: { flex: 1, backgroundColor: '#FFF', padding: 15, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  activeMode: { backgroundColor: colors.primary, borderColor: colors.primary },
  modeText: { fontSize: 11, fontWeight: '800', marginTop: 8, color: '#64748B' },
  activeText: { color: '#FFF' },
  feeText: { fontSize: 10, fontWeight: '900' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F1F5F9' },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 10 },
  totalText: { fontSize: 16, fontWeight: '900', color: '#0F172A' },
  bottomBar: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0' },
  payBtn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});