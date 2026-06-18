// src/screens/orders/OrdersScreen.js
import React, { useRef, useState } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Platform, StatusBar 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useTabVisibility } from '../../context/TabVisibilityContext';
import { useNavigation } from '@react-navigation/native';

// 🌟 Premium Shadows
const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 15 },
  android: { elevation: 6, shadowColor: '#94A3B8' },
  web: { boxShadow: '0px 8px 15px rgba(148, 163, 184, 0.15)' }
});

const pillShadow = Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 3 },
  web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)' }
});

const orderData = [
  { id: '#ORD-9823', service: 'Screen Replacement', device: 'iPhone 13 Pro', date: '15 Jun, 10:30 AM', status: 'Ongoing', price: '₹4,999', icon: 'smartphone', bg: '#EFF6FF', iconColor: '#2563EB' },
  { id: '#ORD-9824', service: 'Motherboard Repair', device: 'MacBook Air M1', date: '16 Jun, 12:00 PM', status: 'Ongoing', price: '₹8,499', icon: 'laptop-mac', bg: '#F5F3FF', iconColor: '#7C3AED' },
  { id: '#ORD-8711', service: 'Battery Replacement', device: 'OnePlus 9', date: '12 Jun, 02:00 PM', status: 'Completed', price: '₹1,299', icon: 'battery-charging-full', bg: '#ECFDF5', iconColor: '#059669' },
  { id: '#ORD-8502', service: 'Water Damage Fix', device: 'Samsung S22', date: '05 Jun, 04:30 PM', status: 'Cancelled', price: '₹0', icon: 'water-drop', bg: '#FEF2F2', iconColor: '#DC2626' },
];

export default function OrdersScreen() {
  const { setIsTabBarVisible } = useTabVisibility(); 
  const navigation = useNavigation(); 
  const currentY = useRef(0);
  const [activeTab, setActiveTab] = useState('Ongoing');

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const isScrollingDown = yOffset > currentY.current && yOffset > 50; 
    if (isScrollingDown) setIsTabBarVisible(false);
    else if (yOffset < currentY.current && (currentY.current - yOffset > 5)) setIsTabBarVisible(true); 
    if (yOffset <= 10) setIsTabBarVisible(true);
    currentY.current = yOffset;
  };

  const filteredOrders = orderData.filter(order => order.status === activeTab);

  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 ADDED: Clean Status Bar configuration */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
        <TouchableOpacity style={styles.searchBtn}>
          <Ionicons name="search" size={20} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <View style={styles.tabWrapper}>
        {['Ongoing', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.pillButton, activeTab === tab && styles.pillActive, activeTab === tab && pillShadow]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.pillText, activeTab === tab && styles.pillTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        onScroll={handleScroll}
        scrollEventThrottle={16} 
        contentContainerStyle={{paddingBottom: 150, paddingHorizontal: 20}} 
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <MaterialIcons name="receipt-long" size={40} color="#94A3B8" />
            </View>
            <Text style={styles.emptyStateTitle}>No {activeTab.toLowerCase()} orders</Text>
            <Text style={styles.emptyStateSub}>Looks like you haven't placed any orders yet.</Text>
            <TouchableOpacity 
              style={styles.bookNowBtn} 
              onPress={() => navigation.navigate('DeviceSelection')}
            >
              <Text style={styles.btnPrimaryText}>Book a Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredOrders.map((order, idx) => (
            <View key={idx} style={[styles.orderCard, shadowStyle]}>
              <View style={styles.cardHeader}>
                <View style={styles.idBox}>
                  <MaterialIcons name="receipt" size={14} color="#64748B" />
                  <Text style={styles.orderId}>{order.id}</Text>
                </View>
                <View style={[styles.statusBadge, order.status === 'Completed' ? {backgroundColor: '#ECFDF5'} : {backgroundColor: '#FEF2F2'}]}>
                  <Text style={[styles.statusText, order.status === 'Completed' ? {color: '#059669'} : {color: '#DC2626'}]}>{order.status}</Text>
                </View>
              </View>

              <View style={styles.cardBody}>
                <View style={[styles.iconSquircle, { backgroundColor: order.bg }]}>
                  <MaterialIcons name={order.icon} size={26} color={order.iconColor} />
                </View>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{order.service}</Text>
                  <Text style={styles.deviceName}>{order.device}</Text>
                </View>
                <Text style={styles.priceText}>{order.price}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.dateContainer}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={styles.dateText}>{order.date}</Text>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionBtn, styles.btnSoft]}><Text style={styles.btnSoftText}>Support</Text></TouchableOpacity>
                  {order.status === 'Ongoing' && (
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.btnPrimary]} 
                      onPress={() => navigation.navigate('OrderTracking')}
                    >
                      <Text style={styles.btnPrimaryText}>Track</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚀 FIXED: Added paddingTop for Android Status Bar
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  searchBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 2 },
  tabWrapper: { flexDirection: 'row', backgroundColor: '#F1F5F9', marginHorizontal: 20, borderRadius: 14, padding: 4, marginBottom: 20 },
  pillButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  pillActive: { backgroundColor: '#FFF' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  pillTextActive: { color: '#0F172A', fontWeight: '800' },
  orderCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  idBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 8, borderRadius: 8 },
  orderId: { fontSize: 12, fontWeight: '700', color: '#64748B', marginLeft: 6 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '800' },
  cardBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconSquircle: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  deviceName: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  priceText: { fontSize: 16, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 15 },
  dateContainer: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 12, color: '#64748B', fontWeight: '700', marginLeft: 6 },
  actionButtons: { flexDirection: 'row' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginLeft: 10 },
  btnSoft: { backgroundColor: '#F1F5F9' },
  btnSoftText: { color: '#334155', fontSize: 13, fontWeight: '800' },
  btnPrimary: { backgroundColor: '#2563EB' },
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyIconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyStateTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  emptyStateSub: { fontSize: 14, color: '#64748B', marginTop: 8 },
  bookNowBtn: { marginTop: 20, backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }
});