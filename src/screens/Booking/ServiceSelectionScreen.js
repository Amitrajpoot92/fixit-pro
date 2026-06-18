// src/screens/Booking/ServiceSelectionScreen.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Platform, StatusBar, ScrollView } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';

const servicesData = [
  { id: '1', name: 'Screen Replacement', price: 4999, icon: 'smartphone', color: '#2563EB', bg: '#EFF6FF' },
  { id: '2', name: 'Battery Replacement', price: 1299, icon: 'battery-charging-full', color: '#059669', bg: '#ECFDF5' },
  { id: '3', name: 'Charging Port', price: 899, icon: 'power', color: '#7C3AED', bg: '#F5F3FF' },
  { id: '4', name: 'Speaker/Mic Repair', price: 699, icon: 'volume-up', color: '#EA580C', bg: '#FFF7ED' },
  { id: '5', name: 'Camera Repair', price: 1599, icon: 'camera-alt', color: '#DB2777', bg: '#FCE7F3' },
  { id: '6', name: 'Software Update', price: 499, icon: 'settings-system-daydream', color: '#0891B2', bg: '#ECFEFF' },
];

export default function ServiceSelectionScreen({ navigation, route }) {
  const [selectedServices, setSelectedServices] = useState([]);

  const toggleService = (id) => {
    if (selectedServices.includes(id)) {
      setSelectedServices(selectedServices.filter(sId => sId !== id));
    } else {
      setSelectedServices([...selectedServices, id]);
    }
  };

  const total = selectedServices.length > 0 ? 8000 : 0; // Dummy total calculation

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Services</Text>
        <View style={{width: 44}} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.subHeader}>What's wrong with your device?</Text>
        
        <View style={styles.grid}>
          {servicesData.map((item) => {
            const isSelected = selectedServices.includes(item.id);
            return (
              <TouchableOpacity 
                key={item.id} 
                style={[styles.serviceCard, isSelected && styles.activeCard]}
                onPress={() => toggleService(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBox, { backgroundColor: item.bg }]}>
                  <MaterialIcons name={item.icon} size={28} color={item.color} />
                </View>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.priceText}>₹{item.price}</Text>
                
                <View style={styles.checkbox}>
                  {isSelected && <MaterialIcons name="check" size={16} color="#FFF" />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      {selectedServices.length > 0 && (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutBtn} onPress={() => navigation.navigate('Checkout')}>
            <Text style={styles.btnText}>Checkout</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  scrollContent: { padding: 20 },
  subHeader: { fontSize: 16, fontWeight: '700', color: '#475569', marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  serviceCard: { width: '47%', backgroundColor: '#FFF', borderRadius: 20, padding: 15, marginBottom: 15, alignItems: 'center', borderWidth: 2, borderColor: '#F1F5F9' },
  activeCard: { borderColor: '#2563EB', backgroundColor: '#F0F7FF' },
  iconBox: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  serviceName: { fontSize: 13, fontWeight: '700', color: '#0F172A', textAlign: 'center', marginBottom: 5 },
  priceText: { fontSize: 15, fontWeight: '900', color: '#059669' },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#CBD5E1', marginTop: 10, justifyContent: 'center', alignItems: 'center' },
  bottomBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderColor: '#E2E8F0' },
  totalLabel: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  totalAmount: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  checkoutBtn: { flexDirection: 'row', backgroundColor: '#2563EB', paddingHorizontal: 25, paddingVertical: 15, borderRadius: 15 },
  btnText: { color: '#FFF', fontWeight: '800', marginRight: 5 }
});