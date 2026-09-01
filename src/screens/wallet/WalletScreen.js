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
  ActivityIndicator,
  Modal,
  TextInput,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { collection, query, orderBy, onSnapshot, doc, addDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import RazorpayCheckout from 'react-native-razorpay';
import { encode } from 'base-64';

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebaseConfig';

const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID; 
const RAZORPAY_KEY_SECRET = process.env.EXPO_PUBLIC_RAZORPAY_KEY_SECRET;

export default function WalletScreen({ navigation }) {
  const { user } = useAuth();
  
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [addAmount, setAddAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

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

  // 🚀 Add Money Logic via Razorpay
  const handleAddMoney = async () => {
    const amount = Number(addAmount);
    if (!amount || amount < 1) {
      Alert.alert("Invalid Amount", "Please enter a valid amount (Min ₹1).");
      return;
    }

    setIsProcessing(true);
    try {
      const finalAmountInPaise = Math.round(amount * 100);
      const basicAuth = encode(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
      
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${basicAuth}`
        },
        body: JSON.stringify({
          amount: finalAmountInPaise, 
          currency: "INR",
          receipt: `wallet_${Date.now()}`
        })
      });

      const data = await response.json();
      
      if (data.id) {
        var options = {
          description: 'Add Money to FixitPro Wallet',
          image: 'https://i.imgur.com/3g7nmJC.png',
          currency: 'INR',
          key: RAZORPAY_KEY_ID,
          amount: finalAmountInPaise,
          name: 'FixitPro Wallet',
          order_id: data.id,
          prefill: {
            email: user?.email || 'user@example.com',
            contact: user?.phoneNumber || '9999999999',
            name: user?.displayName || 'Customer'
          },
          theme: {color: '#0284C7'}
        };
        
        RazorpayCheckout.open(options).then(async (razorpayData) => {
          // Success: Update Balance and Add Transaction
          const userRef = doc(db, 'users', user.uid);
          await updateDoc(userRef, {
            walletBalance: increment(amount)
          });

          await addDoc(collection(db, 'users', user.uid, 'transactions'), {
            title: 'Money Added via Razorpay',
            amount: amount,
            type: 'credit',
            paymentId: razorpayData.razorpay_payment_id,
            createdAt: serverTimestamp()
          });
          
          setIsProcessing(false);
          setIsModalVisible(false);
          setAddAmount('');
          Alert.alert("Success", `₹${amount} added to your wallet successfully!`);
          
        }).catch((error) => {
          setIsProcessing(false);
          Alert.alert("Payment Failed", "Could not complete the transaction.");
        });
      } else {
        setIsProcessing(false);
        Alert.alert("Error", "Failed to generate Razorpay order.");
      }
    } catch (e) {
      setIsProcessing(false);
      Alert.alert("Error", e.message);
    }
  };

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
        
        {/* Add Money Button */}
        <TouchableOpacity style={styles.addMoneyBtn} onPress={() => setIsModalVisible(true)}>
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

      {/* 🔹 Add Money Modal */}
      <Modal visible={isModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add Money to Wallet</Text>
            <Text style={styles.modalSub}>Enter amount to top up your wallet</Text>
            
            <TextInput
              style={styles.amountInput}
              placeholder="₹ Amount"
              keyboardType="numeric"
              value={addAmount}
              onChangeText={setAddAmount}
              autoFocus
            />
            
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setIsModalVisible(false)} disabled={isProcessing}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={handleAddMoney} disabled={isProcessing}>
                {isProcessing ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.confirmBtnText}>Add ₹{addAmount || '0'}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
  emptySubText: { fontSize: 13, color: '#94A3B8', marginTop: 5 },

  // Modal
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF', padding: 25, borderRadius: 24, shadowColor: '#000', shadowOffset: {width: 0, height: 10}, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#0F172A', marginBottom: 5 },
  modalSub: { fontSize: 14, color: '#64748B', marginBottom: 20 },
  amountInput: { backgroundColor: '#F1F5F9', fontSize: 24, fontWeight: '700', padding: 15, borderRadius: 16, textAlign: 'center', marginBottom: 25, color: '#0F172A' },
  modalBtns: { flexDirection: 'row', gap: 15 },
  cancelBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: '#F1F5F9', alignItems: 'center' },
  cancelBtnText: { color: '#475569', fontWeight: '700', fontSize: 16 },
  confirmBtn: { flex: 1, paddingVertical: 15, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center' },
  confirmBtnText: { color: '#FFF', fontWeight: '700', fontSize: 16 }
});