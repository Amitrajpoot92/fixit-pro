// src/screens/Booking/OrderTrackingScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar, ScrollView, Platform, ActivityIndicator } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { colors } from '../../theme/colors';

export default function OrderTrackingScreen({ navigation, route }) {
  const { orderId } = route.params || {};
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;
    const q = query(collection(db, 'bookings'), where('orderId', '==', orderId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) setOrder(snapshot.docs[0].data());
      setLoading(false);
    });
    return () => unsubscribe();
  }, [orderId]);

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>;

  const steps = [
    { id: 'order placed', title: 'Order Placed', icon: 'receipt-long' },
    { id: 'technician assigned', title: 'Technician Assigned', icon: 'person-pin' },
    { id: 'repair in-progress', title: 'Repair In-Progress', icon: 'build' },
    { id: 'completed', title: 'Completed', icon: 'check-circle' }
  ];

  const currentIdx = steps.findIndex(s => s.id === order?.status?.toLowerCase());

  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 StatusBar me translucent false lagaya */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Order Summary Card */}
        <View style={styles.orderSummary}>
          <Text style={styles.orderIdLabel}>Order #{orderId}</Text>
          <Text style={styles.deviceInfo}>{order?.brandName} {order?.modelName}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{order?.totalAmount}</Text>
            <View style={styles.statusBadge}><Text style={styles.statusText}>{order?.status}</Text></View>
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timelineContainer}>
          {steps.map((step, index) => (
            <View key={step.id} style={styles.step}>
              <View style={[styles.iconBox, index <= currentIdx ? styles.iconActive : styles.iconInactive]}>
                <MaterialIcons name={step.icon} size={20} color={index <= currentIdx ? '#FFF' : '#94A3B8'} />
              </View>
              <Text style={[styles.stepTitle, index <= currentIdx && styles.textActive]}>{step.title}</Text>
              {index < steps.length - 1 && <View style={[styles.connector, index < currentIdx && styles.connActive]} />}
            </View>
          ))}
        </View>

        {/* Tech Info */}
        {order?.technicianName && (
          <View style={styles.techCard}>
            <View style={styles.techAvatar}><Text style={styles.avatarTxt}>{order.technicianName.charAt(0)}</Text></View>
            <View style={styles.techDetails}>
              <Text style={styles.techName}>{order.technicianName}</Text>
              <Text style={styles.techRole}>Your Pro Technician</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}><Ionicons name="call" size={20} color="#FFF" /></TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚀 FIX YAHAN HAI: paddingTop add kiya Platform ke hisab se
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 20, fontWeight: '900', marginLeft: 15 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  scroll: { padding: 20 },
  orderSummary: { backgroundColor: '#FFF', padding: 20, borderRadius: 24, marginBottom: 25, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  orderIdLabel: { fontSize: 14, fontWeight: '800', color: '#64748B' },
  deviceInfo: { fontSize: 18, fontWeight: '900', color: '#0F172A', marginTop: 4 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
  price: { fontSize: 20, fontWeight: '900', color: '#059669' },
  statusBadge: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '800', color: '#2563EB' },
  timelineContainer: { backgroundColor: '#FFF', padding: 25, borderRadius: 24, marginBottom: 25 },
  step: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  iconActive: { backgroundColor: '#2563EB' },
  iconInactive: { backgroundColor: '#F1F5F9' },
  stepTitle: { marginLeft: 15, fontSize: 14, fontWeight: '800', color: '#94A3B8' },
  textActive: { color: '#0F172A' },
  connector: { position: 'absolute', left: 20, top: 40, width: 2, height: 20, backgroundColor: '#F1F5F9' },
  connActive: { backgroundColor: '#2563EB' },
  techCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 24 },
  techAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 20, fontWeight: '800', color: '#2563EB' },
  techDetails: { flex: 1, marginLeft: 15 },
  techName: { fontSize: 16, fontWeight: '800' },
  techRole: { fontSize: 12, color: '#64748B' },
  callBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#059669', justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});