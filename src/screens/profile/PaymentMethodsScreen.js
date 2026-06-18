// src/screens/profile/PaymentMethodsScreen.js
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, Platform, StatusBar } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const methods = [
  { id: '1', type: 'UPI', provider: 'Google Pay', detail: 'aman@oksbi', icon: 'account-balance' },
  { id: '2', type: 'Card', provider: 'HDFC Credit Card', detail: '**** **** **** 4242', icon: 'credit-card' },
];

export default function PaymentMethodsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* 🚀 StatusBar added for clean UI on Android */}
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Payment Methods</Text>
        <View style={{width: 24}} />
      </View>

      <FlatList
        data={methods}
        contentContainerStyle={{padding: 20}}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={styles.card}>
            <View style={styles.row}>
              <MaterialIcons name={item.icon} size={28} color={colors.primary} />
              <View style={{marginLeft: 15, flex: 1}}>
                <Text style={styles.provider}>{item.provider}</Text>
                <Text style={styles.detail}>{item.detail}</Text>
              </View>
              <TouchableOpacity>
                <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addBtn}>
        <MaterialIcons name="add" size={20} color="#FFF" />
        <Text style={styles.addBtnText}>Add New Method</Text>
      </TouchableOpacity>
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
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A' },
  card: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0' },
  row: { flexDirection: 'row', alignItems: 'center' },
  provider: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  detail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  addBtn: { flexDirection: 'row', margin: 20, backgroundColor: colors.primary, padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10 },
  addBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' }
});