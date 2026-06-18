// src/screens/wallet/WalletScreen.js
import React, { useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useTabVisibility } from '../../context/TabVisibilityContext';
import { useNavigation } from '@react-navigation/native'; // 🚀 ADDED NAVIGATION

// 🌟 Premium Soft Shadows with Web Fallback
const shadowStyle = Platform.select({
  ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  android: { elevation: 6 },
  web: { boxShadow: '0px 4px 10px rgba(30, 41, 59, 0.1)' }
});

export default function WalletScreen() {
  const { setIsTabBarVisible } = useTabVisibility(); 
  const navigation = useNavigation(); // 🚀 INITIALIZED NAVIGATION
  const currentY = useRef(0);

  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset > currentY.current && yOffset > 50) setIsTabBarVisible(false);
    else if (yOffset < currentY.current && (currentY.current - yOffset > 5)) setIsTabBarVisible(true); 
    if (yOffset <= 10) setIsTabBarVisible(true);
    currentY.current = yOffset;
  };

  const transactions = [
    { id: 1, title: 'Screen Repair Payment', date: '12 Jun 2026', amount: '-₹999', type: 'debit', icon: 'build' },
    { id: 2, title: 'Cashback Received', date: '10 Jun 2026', amount: '+₹150', type: 'credit', icon: 'card-giftcard' },
    { id: 3, title: 'Added to Wallet', date: '05 Jun 2026', amount: '+₹2000', type: 'credit', icon: 'account-balance-wallet' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 STATUS BAR FIX */}
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      
      {/* 🔙 HEADER WITH BACK BUTTON */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Wallet</Text>
        
        <TouchableOpacity style={styles.headerIconBtn}>
          <MaterialIcons name="help-outline" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} onScroll={handleScroll} scrollEventThrottle={16} 
        contentContainerStyle={{paddingBottom: 150, paddingHorizontal: 15}}
      >
        {/* Balance Card */}
        <View style={[styles.balanceCard, shadowStyle]}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>₹2,450.00</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.actionBtn}>
              <MaterialIcons name="add" size={20} color={colors.primaryDark} />
              <Text style={styles.actionBtnText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, styles.actionBtnOutline]}>
              <MaterialIcons name="history" size={20} color={colors.white} />
              <Text style={[styles.actionBtnText, {color: colors.white}]}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recent Transactions</Text>

        {transactions.map((tx) => (
          <View key={tx.id} style={styles.txRow}>
            <View style={[styles.txIcon, { backgroundColor: tx.type === 'credit' ? colors.tintGreen : colors.tintBlue }]}>
              <MaterialIcons name={tx.icon} size={20} color={tx.type === 'credit' ? colors.success : colors.link} />
            </View>
            <View style={styles.txDetails}>
              <Text style={styles.txTitle}>{tx.title}</Text>
              <Text style={styles.txDate}>{tx.date}</Text>
            </View>
            <Text style={[styles.txAmount, { color: tx.type === 'credit' ? colors.success : colors.textDark }]}>
              {tx.amount}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚀 PADDING FIX RETAINED FOR ANDROID NOTCH
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 15 
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: colors.textDark },
  balanceCard: { backgroundColor: colors.primaryDark, borderRadius: 20, padding: 25, marginTop: 5, marginBottom: 30 },
  balanceLabel: { color: colors.textLight, fontSize: 13, fontWeight: '600', marginBottom: 5 },
  balanceAmount: { color: colors.white, fontSize: 32, fontWeight: '900', marginBottom: 20 },
  cardActions: { flexDirection: 'row' },
  actionBtn: { flex: 1, backgroundColor: colors.white, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 10, marginRight: 10 },
  actionBtnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', marginRight: 0 },
  actionBtnText: { color: colors.primaryDark, fontWeight: '800', marginLeft: 6, fontSize: 13 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark, marginBottom: 15 },
  txRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, padding: 15, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.borderColor },
  txIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txDetails: { flex: 1 },
  txTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark, marginBottom: 2 },
  txDate: { fontSize: 11, color: colors.textLight, fontWeight: '500' },
  txAmount: { fontSize: 15, fontWeight: '900' }
});