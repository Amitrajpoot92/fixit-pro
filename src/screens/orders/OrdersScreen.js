// src/screens/orders/OrdersScreen.js
import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TouchableOpacity, Platform, StatusBar, ActivityIndicator, Image 
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';

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
  const navigation = useNavigation(); 
  
  // 🚀 Toggles State
  const [activeMainTab, setActiveMainTab] = useState('Services'); // 'Services' or 'Products'
  const [activeSubTab, setActiveSubTab] = useState('Ongoing'); // 'Ongoing', 'Completed', 'Cancelled'
  
  const [serviceOrders, setServiceOrders] = useState([]);
  const [productOrders, setProductOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Fetch Both Service Bookings & Product Orders
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Fetch Service Bookings
    const qServices = query(collection(db, 'bookings'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubServices = onSnapshot(qServices, (snapshot) => {
      const fetchedServices = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const mode = data.serviceMode || 'self';
        fetchedServices.push({
          id: doc.id,
          orderId: data.orderId || `#ORD-${doc.id.substring(0,4).toUpperCase()}`,
          service: data.brandName ? `${data.brandName} ${data.modelName}` : 'Device Repair',
          device: data.services ? data.services.map(s => s.serviceTitle).join(', ') : 'Service',
          date: data.createdAt ? new Date(data.createdAt.toDate()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'Just now',
          status: data.status || 'Order Placed',
          price: data.totalAmount ? `₹${data.totalAmount}` : 'Pending',
          proName: data.technicianName || 'Unassigned',
          modeName: mode === 'pickup' ? 'Pickup & Drop' : mode === 'home' ? 'Home Visit' : 'Self Drop',
          icon: mode === 'pickup' ? 'local-shipping' : mode === 'home' ? 'home-repair-service' : 'storefront',
          bg: mode === 'pickup' ? '#F3E8FF' : mode === 'home' ? '#E0F2FE' : '#FEF3C7',
          iconColor: mode === 'pickup' ? '#8B5CF6' : mode === 'home' ? '#0284C7' : '#D97706'
        });
      });
      setServiceOrders(fetchedServices);
      setLoading(false);
    });

    // 2. Fetch Product Orders
    const qProducts = query(collection(db, 'product_orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const fetchedProducts = [];
      snapshot.forEach(doc => {
        fetchedProducts.push({ id: doc.id, ...doc.data() });
      });
      setProductOrders(fetchedProducts);
    });

    return () => { unsubServices(); unsubProducts(); };
  }, []);

  // 🚀 Filter Logic for Active Tab
  const getFilteredData = () => {
    if (activeMainTab === 'Services') {
      return serviceOrders.filter(order => {
        const status = order.status.toLowerCase();
        if (activeSubTab === 'Ongoing') return ['order placed', 'technician assigned', 'repair in-progress'].includes(status);
        if (activeSubTab === 'Completed') return status === 'completed';
        if (activeSubTab === 'Cancelled') return status === 'cancelled';
        return false;
      });
    } else {
      return productOrders.filter(order => {
        const status = order.status?.toLowerCase() || '';
        if (activeSubTab === 'Ongoing') return ['pending', 'shipped'].includes(status);
        if (activeSubTab === 'Completed') return status === 'delivered';
        if (activeSubTab === 'Cancelled') return status === 'cancelled';
        return false;
      });
    }
  };

  const filteredData = getFilteredData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Orders</Text>
      </View>

      {/* 🟢 MAIN TOGGLE: Services vs Products */}
      <View style={styles.mainToggleWrapper}>
        <TouchableOpacity 
          style={[styles.mainToggleBtn, activeMainTab === 'Services' && styles.mainToggleActive]}
          onPress={() => setActiveMainTab('Services')}
        >
          <MaterialIcons name="build" size={16} color={activeMainTab === 'Services' ? '#FFF' : '#64748B'} />
          <Text style={[styles.mainToggleText, activeMainTab === 'Services' && styles.mainToggleTextActive]}>Service Bookings</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.mainToggleBtn, activeMainTab === 'Products' && styles.mainToggleActive]}
          onPress={() => setActiveMainTab('Products')}
        >
          <MaterialIcons name="shopping-bag" size={16} color={activeMainTab === 'Products' ? '#FFF' : '#64748B'} />
          <Text style={[styles.mainToggleText, activeMainTab === 'Products' && styles.mainToggleTextActive]}>Product Orders</Text>
        </TouchableOpacity>
      </View>

      {/* 🟢 SUB TOGGLE: Ongoing, Completed, Cancelled */}
      <View style={styles.subTabWrapper}>
        {['Ongoing', 'Completed', 'Cancelled'].map((tab) => (
          <TouchableOpacity 
            key={tab} 
            style={[styles.subPillButton, activeSubTab === tab && styles.subPillActive, activeSubTab === tab && pillShadow]}
            onPress={() => setActiveSubTab(tab)}
          >
            <Text style={[styles.subPillText, activeSubTab === tab && styles.subPillTextActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 🟢 DATA RENDERING */}
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#2563EB" />
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 20}}>
          {filteredData.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name={activeMainTab === 'Services' ? "home-repair-service" : "local-mall"} size={50} color="#CBD5E1" />
              <Text style={styles.emptyStateTitle}>No {activeSubTab.toLowerCase()} {activeMainTab.toLowerCase()}</Text>
              <TouchableOpacity 
                style={styles.bookNowBtn} 
                onPress={() => navigation.navigate(activeMainTab === 'Services' ? 'DeviceSelection' : 'ProductsMain')}
              >
                <Text style={styles.btnPrimaryText}>{activeMainTab === 'Services' ? 'Book a Service' : 'Shop Now'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredData.map((order) => {
              
              // 🛠️ RENDER SERVICE CARD
              if (activeMainTab === 'Services') {
                return (
                  <View key={order.id} style={[styles.orderCard, shadowStyle]}>
                    <View style={styles.cardHeader}>
                      <View>
                        <Text style={styles.orderId}>{order.orderId}</Text>
                        <View style={[styles.modeBadge, { backgroundColor: order.bg }]}>
                          <Text style={[styles.modeBadgeText, { color: order.iconColor }]}>{order.modeName}</Text>
                        </View>
                      </View>
                      <View style={styles.statusBadge}><Text style={styles.statusText}>{order.status}</Text></View>
                    </View>
                    
                    <View style={styles.cardBody}>
                      <View style={[styles.iconSquircle, { backgroundColor: order.bg }]}>
                        <MaterialIcons name={order.icon} size={26} color={order.iconColor} />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{order.service}</Text>
                        <Text style={styles.deviceName} numberOfLines={1}>{order.device}</Text>
                        <View style={styles.techRow}>
                          <MaterialIcons name="person-pin" size={14} color="#64748B" />
                          <Text style={styles.techText}>Pro: <Text style={{fontWeight: '700', color: '#0F172A'}}>{order.proName}</Text></Text>
                        </View>
                      </View>
                      <View style={{alignItems: 'flex-end'}}><Text style={styles.priceText}>{order.price}</Text></View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.dateText}>{order.date}</Text>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity style={[styles.actionBtn, styles.btnSoft]} onPress={() => navigation.navigate('Support')}>
                          <Text style={styles.btnSoftText}>Support</Text>
                        </TouchableOpacity>
                        {['order placed', 'technician assigned', 'repair in-progress'].includes(order.status.toLowerCase()) && (
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.btnPrimary]} 
                            onPress={() => navigation.navigate('OrderTracking', { orderId: order.orderId, type: 'Service' })} 
                          >
                            <Text style={styles.btnPrimaryText}>Track</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              }

              // 🛍️ RENDER PRODUCT CARD
              if (activeMainTab === 'Products') {
                const orderDate = order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A';
                return (
                  <View key={order.id} style={[styles.orderCard, shadowStyle]}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.orderId}>#ORD-{order.id.substring(0,6).toUpperCase()}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE' }]}>
                        <Text style={[styles.statusText, { color: '#2563EB' }]}>{order.status}</Text>
                      </View>
                    </View>

                    <View style={styles.productRow}>
                      <View style={styles.imgBox}>
                        <Image source={{ uri: order.productDetails?.image }} style={styles.productImg} resizeMode="contain" />
                      </View>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName} numberOfLines={1}>{order.productDetails?.name}</Text>
                        <Text style={styles.deviceName}>Qty: {order.productDetails?.quantity} • {order.productDetails?.category}</Text>
                        <Text style={[styles.priceText, { color: colors.link, marginTop: 4 }]}>₹{order.totalAmount}</Text>
                      </View>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.dateText}>Placed on: {orderDate}</Text>
                      <View style={styles.actionButtons}>
                        {['pending', 'shipped'].includes(order.status?.toLowerCase()) && (
                          <TouchableOpacity 
                            style={[styles.actionBtn, styles.btnPrimary]} 
                            onPress={() => navigation.navigate('OrderTracking', { orderId: order.id, type: 'Product' })} 
                          >
                            <Text style={styles.btnPrimaryText}>Track</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  </View>
                );
              }
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  
  // Toggle Styles
  mainToggleWrapper: { flexDirection: 'row', backgroundColor: '#E2E8F0', marginHorizontal: 20, borderRadius: 14, padding: 4, marginBottom: 15 },
  mainToggleBtn: { flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 12, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  mainToggleActive: { backgroundColor: colors.primary, ...shadowStyle },
  mainToggleText: { fontSize: 13, fontWeight: '700', color: '#64748B' },
  mainToggleTextActive: { color: '#FFF', fontWeight: '800' },

  subTabWrapper: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, gap: 10 },
  subPillButton: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center', backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
  subPillActive: { backgroundColor: '#FFF', borderColor: '#CBD5E1' },
  subPillText: { fontSize: 12, fontWeight: '700', color: '#64748B' },
  subPillTextActive: { color: colors.primary, fontWeight: '900' },
  
  // Card Styles
  orderCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 18, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId: { fontSize: 13, fontWeight: '800', color: '#64748B', marginBottom: 4 },
  modeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, alignSelf: 'flex-start' },
  modeBadgeText: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  statusBadge: { backgroundColor: '#FEF3C7', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: '800', color: '#D97706', textTransform: 'uppercase' },
  
  cardBody: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  imgBox: { width: 65, height: 65, backgroundColor: '#F8FAFC', borderRadius: 12, padding: 5, marginRight: 12, borderWidth: 1, borderColor: '#F1F5F9' },
  productImg: { width: '100%', height: '100%' },
  iconSquircle: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  serviceInfo: { flex: 1, paddingRight: 10 },
  serviceName: { fontSize: 16, fontWeight: '800', color: '#0F172A' },
  deviceName: { fontSize: 12, color: '#64748B', fontWeight: '600', marginVertical: 3 },
  techRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2, gap: 4 },
  techText: { fontSize: 12, color: '#64748B' },
  priceText: { fontSize: 18, fontWeight: '900', color: '#059669' },
  
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 15 },
  dateText: { fontSize: 12, color: '#64748B', fontWeight: '700' },
  actionButtons: { flexDirection: 'row' },
  actionBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, marginLeft: 10 },
  btnSoft: { backgroundColor: '#F1F5F9' },
  btnSoftText: { color: '#334155', fontSize: 13, fontWeight: '800' },
  btnPrimary: { backgroundColor: '#2563EB' },
  btnPrimaryText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
  
  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyStateTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginVertical: 15 },
  bookNowBtn: { backgroundColor: '#2563EB', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 }
});