// src/screens/Booking/PaymentSelectionScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, StatusBar } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function PaymentSelectionScreen({ navigation, route }) {
  const [method, setMethod] = useState('upi');
  const amount = 4999; // Ye data pichle screen se bhi le sakte ho

  const paymentOptions = [
    { id: 'upi', name: 'UPI (GPay, PhonePe, Paytm)', icon: 'account-balance', desc: 'Pay instantly via your favorite UPI app' },
    { id: 'card', name: 'Credit / Debit Card', icon: 'credit-card', desc: 'All major cards supported' },
    { id: 'cod', name: 'Cash on Delivery (COD)', icon: 'payments', desc: 'Pay technician after repair' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment Method</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
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
          >
            <View style={styles.iconCircle}>
              <MaterialIcons name={opt.icon} size={24} color={method === opt.id ? colors.primary : '#64748B'} />
            </View>
            <View style={{flex: 1, marginLeft: 15}}>
              <Text style={[styles.optionName, method === opt.id && {color: colors.primary}]}>{opt.name}</Text>
              <Text style={styles.optionDesc}>{opt.desc}</Text>
            </View>
            <Ionicons 
              name={method === opt.id ? "radio-button-on" : "radio-button-off"} 
              size={20} 
              color={method === opt.id ? colors.primary : '#CBD5E1'} 
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.payBtn} onPress={() => navigation.navigate('OrderSuccess')}>
          <Text style={styles.btnText}>{method === 'cod' ? 'Confirm Order' : 'Pay Now'}</Text>
          <MaterialIcons name="chevron-right" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  amountCard: { backgroundColor: colors.primary, padding: 30, borderRadius: 24, alignItems: 'center', marginBottom: 30 },
  amountLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  amountValue: { color: '#FFF', fontSize: 36, fontWeight: '900', marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#475569', marginBottom: 15 },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 18, borderRadius: 20, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  activeOption: { borderColor: colors.primary, backgroundColor: '#F0F7FF' },
  iconCircle: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center' },
  optionName: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  optionDesc: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  bottomBar: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0' },
  payBtn: { flexDirection: 'row', backgroundColor: '#2563EB', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});