// src/screens/orders/OrdersScreen.js
import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Platform, StatusBar, ActivityIndicator 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useTabVisibility } from '../../context/TabVisibilityContext';
import { useNavigation } from '@react-navigation/native'; // 🚀 Bas itna hi chahiye

import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig'; 

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

export default function OrdersScreen() {
  const { setIsTabBarVisible } = useTabVisibility(); 
  const navigation = useNavigation(); 
  const currentY = useRef(0);
  const [activeTab, setActiveTab] = useState('Ongoing');
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOrders = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          orderId: data.orderId || `#ORD-${doc.id.substring(0,4).toUpperCase()}`,
          service: data.brandName + ' ' + data.modelName || 'Device Repair',
          device: data.services ? data.services.map(s => s.serviceTitle).join(', ') : 'Service',
          date: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Just now',
          status: data.status || 'Order Placed',
          price: data.totalAmount ? `₹${data.totalAmount}` : 'Pending',
          icon: 'build',
          bg: '#EFF6FF',
          iconColor: '#2563EB'
        };
      });
      
      setOrders(fetchedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = orders.filter(order => {
    const dbStatus = order.status.toLowerCase();
    if (activeTab === 'Ongoing') return ['order placed', 'technician assigned', 'repair in-progress'].includes(dbStatus);
    if (activeTab === 'Completed') return dbStatus === 'completed';
    if (activeTab === 'Cancelled') return dbStatus === 'cancelled';
    return false;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
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

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{paddingBottom: 150, paddingHorizontal: 20}}>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="receipt-long" size={40} color="#94A3B8" />
              <Text style={styles.emptyStateTitle}>No {activeTab.toLowerCase()} orders</Text>
              <TouchableOpacity style={styles.bookNowBtn} onPress={() => navigation.navigate('DeviceSelection')}>
                <Text style={styles.btnPrimaryText}>Book a Service</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={[styles.orderCard, shadowStyle]}>
                <View style={styles.cardHeader}>
                  <Text style={styles.orderId}>{order.orderId}</Text>
                  <View style={styles.statusBadge}><Text style={styles.statusText}>{order.status}</Text></View>
                </View>
                <View style={styles.cardBody}>
                  <View style={styles.iconSquircle}><MaterialIcons name={order.icon} size={26} color={order.iconColor} /></View>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{order.service}</Text>
                    <Text style={styles.deviceName}>{order.device}</Text>
                  </View>
                  <Text style={styles.priceText}>{order.price}</Text>
                </View>

                <View style={styles.cardFooter}>
                  <Text style={styles.dateText}>{order.date}</Text>
                  <View style={styles.actionButtons}>
                    {/* 🚀 SUPER CLEAN NAVIGATION */}
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.btnSoft]} 
                      onPress={() => navigation.navigate('Support')}
                    >
                      <Text style={styles.btnSoftText}>Support</Text>
                    </TouchableOpacity>
                    
                    {['order placed', 'technician assigned', 'repair in-progress'].includes(order.status.toLowerCase()) && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, styles.btnPrimary]} 
                        onPress={() => navigation.navigate('OrderTracking', { orderId: order.orderId })} 
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
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  tabWrapper: { flexDirection: 'row', backgroundColor: '#F1F5F9', marginHorizontal: 20, borderRadius: 14, padding: 4, marginBottom: 20 },
  pillButton: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  pillActive: { backgroundColor: '#FFF' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#64748B' },
  pillTextActive: { color: '#0F172A', fontWeight: '800' },
  orderCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  orderId: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '800', color: '#D97706' },
  cardBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  iconSquircle: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  deviceName: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  priceText: { fontSize: 16, fontWeight: '900' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 15 },
  dateText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  actionButtons: { flexDirection: 'row' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginLeft: 10 },
  btnSoft: { backgroundColor: '#F1F5F9' },
  btnSoftText: { color: '#334155', fontSize: 13, fontWeight: '800' },
  btnPrimary: { backgroundColor: '#2563EB' },
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyStateTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', marginVertical: 15 },
  bookNowBtn: { backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }
});