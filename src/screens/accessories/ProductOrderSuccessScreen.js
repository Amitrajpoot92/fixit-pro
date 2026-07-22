// src/screens/accessories/ProductOrderSuccessScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, SafeAreaView } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function ProductOrderSuccessScreen({ navigation, route }) {
  // 🚀 Dynamic params passed from ProductCheckoutScreen
  const orderId = route.params?.orderId || 'ORD-P000000';
  const paymentMode = route.params?.paymentMode || 'Offline'; 
  
  const isOnline = paymentMode === 'Online';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      <View style={styles.content}>
        {/* SUCCESS ICON */}
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={100} color={colors.success} />
        </View>
        
        <Text style={styles.title}>Order Confirmed!</Text>
        
        {/* 🚀 DYNAMIC PAYMENT BADGE */}
        <View style={[styles.paymentBadge, isOnline ? styles.badgePaid : styles.badgeCod]}>
          <MaterialIcons name={isOnline ? "verified" : "payments"} size={16} color={isOnline ? "#15803D" : "#B45309"} />
          <Text style={[styles.paymentBadgeText, isOnline ? styles.textPaid : styles.textCod]}>
            {isOnline ? 'PRE-PAID (ONLINE)' : 'CASH ON DELIVERY (COD)'}
          </Text>
        </View>

        {/* 🚀 DYNAMIC DESCRIPTION FOR PRODUCTS */}
        <Text style={styles.desc}>
          {isOnline 
            ? `Your payment was successful. Product order `
            : `Your product order `}
          <Text style={{fontWeight: '800', color: '#0F172A'}}>#{orderId}</Text> 
          {isOnline
            ? ` has been placed. We will ship it to your delivery address soon. Track your order at order's tab in products orders. `
            : ` has been placed. Please pay the delivery executive at the time of delivery. Track your order at order's tab in products orders.`}
        </Text>

        <View style={styles.deliveryBox}>
          <MaterialIcons name="local-shipping" size={24} color={colors.link} />
          <Text style={styles.deliveryText}>Expected Delivery within 3-5 Business Days.</Text>
        </View>
      </View>

      <View style={styles.footer}>
        {/* 🚀 TRACK BUTTON - TYPE 'Product' PASS KIYA HAI */}
        <TouchableOpacity 
          style={styles.trackBtn} 
          onPress={() => navigation.replace('ProductOrderTracking', { orderId: orderId })} 
        >
          <Text style={styles.trackBtnText}>Track My Order</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shopBtn} 
          onPress={() => navigation.navigate('ProductsMain')}
        >
          <Text style={styles.shopBtnText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  successIcon: { marginBottom: 15 },
  title: { fontSize: 26, fontWeight: '900', color: '#0F172A', marginBottom: 15 },
  
  // Badge Styles
  paymentBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 15, gap: 5 },
  badgePaid: { backgroundColor: '#DCFCE7' },
  textPaid: { color: '#15803D', fontWeight: '800', fontSize: 12 },
  badgeCod: { backgroundColor: '#FEF3C7' },
  textCod: { color: '#B45309', fontWeight: '800', fontSize: 12 },

  desc: { fontSize: 15, color: '#64748B', textAlign: 'center', lineHeight: 22, marginBottom: 30 },
  
  deliveryBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE', width: '100%', justifyContent: 'center' },
  deliveryText: { marginLeft: 10, fontSize: 13, fontWeight: '700', color: '#1E3A8A', flexShrink: 1 },

  footer: { padding: 20 },
  trackBtn: { backgroundColor: colors.link, padding: 18, borderRadius: 16, alignItems: 'center', marginBottom: 10, elevation: 3, shadowColor: colors.link, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 5 },
  trackBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  shopBtn: { padding: 15, alignItems: 'center' },
  shopBtnText: { color: colors.link, fontWeight: '700', fontSize: 14 }
});