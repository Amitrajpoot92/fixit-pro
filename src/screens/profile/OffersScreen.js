// src/screens/profile/OffersScreen.js
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
  Alert
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { collection, query, onSnapshot } from 'firebase/firestore';
import * as Clipboard from 'expo-clipboard'; // 🚀 Copy code feature

import { colors } from '../../theme/colors';
import { db } from '../../services/firebaseConfig';

export default function OffersScreen({ navigation }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Real-time fetch offers from Global 'offers' collection
  useEffect(() => {
    const q = query(collection(db, 'offers'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedOffers = [];
      snapshot.forEach((doc) => {
        fetchedOffers.push({ id: doc.id, ...doc.data() });
      });
      setOffers(fetchedOffers);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 🚀 Copy Code to Clipboard function
  const handleCopyCode = async (code) => {
    await Clipboard.setStringAsync(code);
    Alert.alert("Code Copied!", `Promo code '${code}' copied to clipboard. Paste it during checkout.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Offers & Promos</Text>
        <View style={{width: 24}} />
      </View>

      {loading ? (
        <View style={styles.centerView}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : offers.length === 0 ? (
        <View style={styles.centerView}>
          <FontAwesome5 name="ticket-alt" size={50} color="#CBD5E1" />
          <Text style={styles.emptyText}>No active offers right now.</Text>
          <Text style={styles.emptySubText}>Check back later for exciting discounts!</Text>
        </View>
      ) : (
        <FlatList 
          data={offers}
          contentContainerStyle={{padding: 20}}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => (
            <View style={styles.offerCard}>
              <View style={{flex: 1, paddingRight: 10}}>
                <Text style={styles.offerTitle}>{item.title}</Text>
                <Text style={styles.offerDesc}>{item.desc}</Text>
              </View>
              <TouchableOpacity 
                style={styles.codeBtn} 
                onPress={() => handleCopyCode(item.code)}
              >
                <Text style={styles.codeText}>{item.code}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  title: { fontSize: 18, fontWeight: '800' },
  centerView: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#475569', marginTop: 15 },
  emptySubText: { fontSize: 13, color: '#94A3B8', marginTop: 5 },
  offerCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  offerTitle: { fontSize: 16, fontWeight: '900', color: colors.primary },
  offerDesc: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  codeBtn: { backgroundColor: '#EFF6FF', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1.5, borderColor: colors.primary },
  codeText: { fontWeight: '800', color: colors.primary, fontSize: 14, letterSpacing: 1 }
});