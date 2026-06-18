// src/screens/profile/OffersScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const offers = [
  { id: '1', title: 'FLAT 20% OFF', desc: 'On all Apple device repairs', code: 'FIXIT20' },
  { id: '2', title: 'FREE PICKUP', desc: 'Valid for first 2 bookings', code: 'FREEPICK' },
  { id: '3', title: '₹100 OFF', desc: 'On motherboard repairs', code: 'MOB100' },
];

export default function OffersScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 StatusBar added for clean UI on Android */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Offers & Promos</Text>
        <View style={{width: 24}} />
      </View>

      <FlatList 
        data={offers}
        contentContainerStyle={{padding: 20}}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={styles.offerCard}>
            <View>
              <Text style={styles.offerTitle}>{item.title}</Text>
              <Text style={styles.offerDesc}>{item.desc}</Text>
            </View>
            <TouchableOpacity style={styles.codeBtn}>
              <Text style={styles.codeText}>{item.code}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // 🚀 FIX: Added paddingTop for Android Status Bar height
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: { flexDirection: 'row', padding: 20, alignItems: 'center', justifyContent: 'space-between' },
  title: { fontSize: 18, fontWeight: '800' },
  offerCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0' },
  offerTitle: { fontSize: 16, fontWeight: '900', color: colors.primary },
  offerDesc: { fontSize: 13, color: '#64748B', marginTop: 4 },
  codeBtn: { backgroundColor: '#EFF6FF', padding: 10, borderRadius: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.primary },
  codeText: { fontWeight: '800', color: colors.primary }
});