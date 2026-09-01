// src/screens/orders/OrdersScreen.js
import React, { useRef, useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, FlatList, 
  TouchableOpacity, Platform, StatusBar, ActivityIndicator 
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useNavigation } from '@react-navigation/native';

import { collection, query, where, orderBy, onSnapshot, limit } from 'firebase/firestore';
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
  
  const [activeSubTab, setActiveSubTab] = useState('Ongoing');
  
  const [productOrders, setProductOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderLimit, setOrderLimit] = useState(20); 

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setLoading(false);
      return;
    }

    const qProducts = query(collection(db, 'product_orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(orderLimit));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const fetchedProducts = [];
      snapshot.forEach(doc => {
        const pData = doc.data();
        fetchedProducts.push({ 
          id: doc.id, 
          paymentMode: pData.paymentMode || 'Offline', 
          ...pData 
        });
      });
      setProductOrders(fetchedProducts);
      setLoading(false);
    });

    return () => unsubProducts();
  }, [orderLimit]);

  const handleLoadMore = () => {
    setOrderLimit(prev => prev + 10);
  };

  // 🚀 Filter Logic for Active Tab
  const getFilteredData = () => {
    return productOrders.filter(order => {
      const status = order.status?.toLowerCase() || '';
      if (activeSubTab === 'Ongoing') return ['pending', 'processing', 'shipped'].includes(status);
      if (activeSubTab === 'Completed') return status === 'delivered';
      if (activeSubTab === 'Cancelled') return status === 'cancelled';
      return false;
    });
  };

  const filteredData = getFilteredData();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Product Orders</Text>
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
      ) : filteredData.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="local-mall" size={50} color="#CBD5E1" />
          <Text style={styles.emptyStateTitle}>No {activeSubTab.toLowerCase()} orders</Text>
          <TouchableOpacity 
            style={styles.bookNowBtn} 
            onPress={() => navigation.navigate('ProductsTab')}
          >
            <Text style={styles.btnPrimaryText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList 
          data={filteredData}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 100, paddingHorizontal: 20}}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          renderItem={({ item: order }) => {
              const orderDate = order.createdAt ? new Date(order.createdAt.toDate()).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }) : 'N/A';
              return (
                <View key={order.id} style={[styles.orderCard, shadowStyle]}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.orderId}>#ORD-{order.id.substring(0,6).toUpperCase()}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: '#DBEAFE' }]}>
                      <Text style={[styles.statusText, { color: '#2563EB' }]}>{order.status}</Text>
                    </View>
                  </View>

                  {(() => {
                    const firstProduct = order.productDetails && order.productDetails.length > 0 ? order.productDetails[0] : {};
                    const extraItemsCount = order.productDetails ? order.productDetails.length - 1 : 0;
                    return (
                      <View style={styles.productRow}>
                        <View style={styles.imgBox}>
                          <Image source={{ uri: firstProduct.image }} style={styles.productImg} resizeMode="contain" />
                        </View>
                        <View style={styles.serviceInfo}>
                          <Text style={styles.serviceName} numberOfLines={1}>
                            {firstProduct.name || 'Product'}
                            {extraItemsCount > 0 ? ` (+${extraItemsCount} more)` : ''}
                          </Text>
                          <Text style={styles.deviceName}>Qty: {firstProduct.quantity || 1} • {firstProduct.category || 'Item'}</Text>
                          
                          <View style={[
                            styles.paymentBadge, 
                            order.paymentMode === 'Online' ? styles.badgePaid : styles.badgeCod,
                            { marginTop: 4, alignSelf: 'flex-start' }
                          ]}>
                            <MaterialIcons 
                              name={order.paymentMode === 'Online' ? "verified" : "payments"} 
                              size={12} 
                              color={order.paymentMode === 'Online' ? "#15803D" : "#B45309"} 
                            />
                            <Text style={[
                              styles.paymentBadgeText, 
                              order.paymentMode === 'Online' ? styles.textPaid : styles.textCod
                            ]}>
                              {order.paymentMode === 'Online' ? 'PRE-PAID' : 'COD'}
                            </Text>
                          </View>
                        </View>
                        <View style={{alignItems: 'flex-end'}}>
                          <Text style={[styles.priceText, { color: colors.link }]}>₹{order.totalAmount}</Text>
                        </View>
                      </View>
                    );
                  })()}

                  <View style={styles.cardFooter}>
                    <Text style={styles.dateText}>Placed on: {orderDate}</Text>
                    <View style={styles.actionButtons}>
                      {['pending', 'processing', 'shipped'].includes(order.status?.toLowerCase()) ? (
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.btnPrimary]} 
                          onPress={() => navigation.navigate('ProductOrderTracking', { orderId: order.orderId || order.id })} 
                        >
                          <Text style={styles.btnPrimaryText}>Track</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity 
                          style={[styles.actionBtn, styles.btnSoft, { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0' }]} 
                          onPress={() => navigation.navigate('ProductOrderTracking', { orderId: order.orderId || order.id })} 
                        >
                          <Text style={[styles.btnSoftText, { color: '#64748B' }]}>View Details</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              );
          }} 
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: '900', color: '#0F172A' },
  
  // Toggle Styles
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

  // 🚀 Payment Badge Styles
  paymentBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, gap: 3 },
  badgePaid: { backgroundColor: '#DCFCE7' },
  badgeCod: { backgroundColor: '#FEF3C7' },
  paymentBadgeText: { fontSize: 10, fontWeight: '800' },
  textPaid: { color: '#15803D' },
  textCod: { color: '#B45309' },
  
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