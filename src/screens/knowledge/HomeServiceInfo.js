import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, ScrollView, 
  SafeAreaView, Platform, StatusBar 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function HomeServiceInfo({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" translucent={false} />
      
      {/* Back Button Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.iconBox}>
          <Ionicons name="home-outline" size={50} color={colors.link} />
        </View>
        <Text style={styles.title}>Home Service Repair</Text>
        <Text style={styles.description}>
          With our Home Service, our expert technicians will visit your home and repair your device right in front of you.
        </Text>
        <View style={styles.steps}>
          <Text style={styles.step}>1. Select your device and the required repair service.</Text>
          <Text style={styles.step}>2. Choose the "Home Visit" option on the Checkout page.</Text>
          <Text style={styles.step}>3. Select your preferred Date and Time slot.</Text>
          <Text style={styles.step}>4. Our technician will arrive at your address and fix your device instantly.</Text>
        </View>
      </ScrollView>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={() => navigation.navigate('DeviceSelection')} 
      >
        <Text style={styles.btnText}>Book Home Service</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  backBtn: {
    width: 40, height: 40, justifyContent: 'center'
  },
  content: { padding: 30, alignItems: 'center' },
  iconBox: { padding: 20, backgroundColor: '#EFF6FF', borderRadius: 25, marginBottom: 20 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 15, color: '#0F172A', textAlign: 'center' },
  description: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 30, lineHeight: 22 },
  steps: { alignSelf: 'stretch', marginBottom: 40 },
  step: { fontSize: 15, marginBottom: 12, fontWeight: '600', color: '#334155', lineHeight: 22 },
  bookButton: { backgroundColor: colors.link, margin: 20, padding: 18, borderRadius: 16, alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: '800', fontSize: 16 }
});