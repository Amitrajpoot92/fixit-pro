// src/screens/wallet/WalletScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  FlatList, 
  Platform, 
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebaseConfig';

export default function WalletScreen({ navigation }) {
  const { user } = useAuth();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // 🚀 1. Listen to Real-time Balance
    const userRef = doc(db, 'users', user.uid);
    const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().walletBalance || 0);
      }
    });

    // 🚀 2. Listen to Real-time Transactions (Newest first)
    const transactionsRef = collection(db, 'users', user.uid, 'transactions');
    const q = query(transactionsRef, orderBy('createdAt', 'desc'));
    
    const unsubscribeTx = onSnapshot(q, (snapshot) => {
      const txData = [];
      snapshot.forEach((doc) => {
        txData.push({ id: doc.id, ...doc.data() });
      });
      setTransactions(txData);
      setLoading(false);
    });

    // Cleanup listeners
    return () => {
      unsubscribeUser();
      unsubscribeTx();
    };
  }, [user]);

  // UI Component for individual transaction
  const renderTransaction = ({ item }) => {
    const isCredit = item.type === 'credit';
    
    // Formatting date safely
    let dateStr = 'Unknown Date';
    if (item.createdAt) {
      const dateObj = new Date(item.createdAt);
      dateStr = dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    return (
      <View style={styles.txCard}>
        <View style={[styles.txIconBox, { backgroundColor: isCredit ? '#DCFCE7' : '#FEE2E2' }]}>
          <MaterialIcons 
            name={isCredit ? "call-received" : "call-made"} 
            size={20} 
            color={isCredit ? "#16A34A" : "#EF4444"} 
          />
        </View>
        <View style={styles.txDetails}>
          <Text style={styles.txTitle}>{item.title}</Text>
          <Text style={styles.txDate}>{dateStr}</Text>
        </View>
        <Text style={[styles.txAmount, { color: isCredit ? "#16A34A" : "#0F172A" }]}>
          {isCredit ? '+' : '-'} ₹{item.amount}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      {/* 🔹 Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>My Wallet</Text>
        <View style={{width: 24}} /> 
      </View>

      {/* 🔹 Balance Card */}
      <View style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <FontAwesome5 name="wallet" size={20} color="rgba(255,255,255,0.7)" />
        </View>
        <Text style={styles.balanceAmount}>₹{balance}</Text>
        
        {/* Add Money Button (Future scope ke liye UI me daal diya hai) */}
        <TouchableOpacity style={styles.addMoneyBtn} onPress={() => alert('Add Money Gateway will open here!')}>
          <MaterialIcons name="add" size={18} color={colors.primary} />
          <Text style={styles.addMoneyText}>Add Money</Text>
        </TouchableOpacity>
      </View>

      {/* 🔹 Transactions Section */}
      <View style={styles.txContainer}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
        ) : transactions.length === 0 ? (
          <View style={styles.emptyBox}>
            <FontAwesome5 name="receipt" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No transactions yet</Text>
            <Text style={styles.emptySubText}>Your wallet history will appear here.</Text>
          </View>
        ) : (
          <FlatList 
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransaction}
            contentContainerStyle={{ paddingBottom: 30 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  
  // Balance Card
  balanceCard: { backgroundColor: colors.primary, marginHorizontal: 20, padding: 25, borderRadius: 24, shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 10 },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: '900', marginBottom: 20 },
  addMoneyBtn: { flexDirection: 'row', backgroundColor: '#FFF', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start', alignItems: 'center', gap: 5 },
  addMoneyText: { color: colors.primary, fontWeight: '800', fontSize: 14 },

  // Transactions
  txContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  
  txCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  txIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  txDetails: { flex: 1 },
  txTitle: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 4 },
  txDate: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  txAmount: { fontSize: 16, fontWeight: '800' },

  emptyBox: { alignItems: 'center', marginTop: 50 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#475569', marginTop: 15 },
  emptySubText: { fontSize: 13, color: '#94A3B8', marginTop: 5 }
});