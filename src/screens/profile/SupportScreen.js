// src/screens/profile/SupportScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView, 
  Linking, 
  Platform, 
  StatusBar,
  Image 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

export default function SupportScreen({ navigation }) {
  
  // 🚀 WhatsApp Logic
  const openWhatsApp = () => {
    const phoneNumber = '+919576441800';
    const message = 'Hello FixitPro Team! I am facing an issue and need some help. Please assist me.';
    Linking.openURL(`whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`);
  };

  // 🚀 Email Logic
  const openEmail = () => {
    const email = 'Admin.mrfixitpro@gmail.com';
    const subject = 'Need Support - FixitPro App';
    Linking.openURL(`mailto:${email}?subject=${encodeURIComponent(subject)}`);
  };

  // 🚀 Call Logic
  const openCall = () => {
    const phoneNumber = '+919576441800';
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Help & Support</Text>
        <View style={{width: 24}} /> 
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Custom Brand Logo Section */}
        <View style={styles.logoContainer}>
          {/* ⚠️ NOTE: Agar tumhara logo.jpeg yahan nahi mila toh app crash hogi. Agar image nahi hai, toh is <Image> tag ko hata dena */}
          <Image 
            source={require('../../../assets/platform-img/logo.jpeg')} 
            style={styles.logoImage} 
            // Fallback error handling in React Native
            onError={(e) => console.log('Logo Image failed to load', e.nativeEvent.error)}
          />
        </View>

        <Text style={styles.sectionTitle}>How can we help you?</Text>
        
        {/* 📞 Call Option */}
        <TouchableOpacity style={styles.optionCard} onPress={openCall} activeOpacity={0.8}>
          <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
            <Ionicons name="call" size={24} color="#2563EB" />
          </View>
          <View style={{marginLeft: 15, flex: 1}}>
            <Text style={styles.optTitle}>Call Us</Text>
            <Text style={styles.optSub}>Speak directly with our team</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        {/* 💬 WhatsApp Option */}
        <TouchableOpacity style={styles.optionCard} onPress={openWhatsApp} activeOpacity={0.8}>
          <View style={[styles.iconBox, { backgroundColor: '#DCFCE7' }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#16A34A" />
          </View>
          <View style={{marginLeft: 15, flex: 1}}>
            <Text style={styles.optTitle}>Chat on WhatsApp</Text>
            <Text style={styles.optSub}>Instant support from our team</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        {/* ✉️ Email Option */}
        <TouchableOpacity style={styles.optionCard} onPress={openEmail} activeOpacity={0.8}>
          <View style={[styles.iconBox, { backgroundColor: '#F1F5F9' }]}>
            <Ionicons name="mail" size={24} color="#475569" />
          </View>
          <View style={{marginLeft: 15, flex: 1}}>
            <Text style={styles.optTitle}>Email Us</Text>
            <Text style={styles.optSub}>Get response within 24 hours</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#CBD5E1" />
        </TouchableOpacity>

        {/* FAQs */}
        <Text style={[styles.sectionTitle, { marginTop: 30 }]}>Frequently Asked Questions</Text>
        <View style={styles.faqCard}>
           <Text style={styles.faqQ}>Q: How to reschedule my booking?</Text>
           <Text style={styles.faqA}>A: Go to 'My Bookings', select the upcoming booking, and tap on 'Reschedule'.</Text>
        </View>
      </ScrollView>
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
  content: { padding: 20 },
  
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30, 
    marginTop: 10,
  },
  logoImage: {
    width: 180, 
    height: 60,
    resizeMode: 'contain', 
  },

  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 15, color: '#0F172A' },
  optionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 16, marginBottom: 15, borderWidth: 1, borderColor: '#E2E8F0', ...Platform.select({ ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 }, android: { elevation: 2 } }) },
  iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  optTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  optSub: { fontSize: 12, color: '#64748B', marginTop: 2 },
  faqCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  faqQ: { fontSize: 14, fontWeight: '800', marginBottom: 8, color: '#0F172A' },
  faqA: { fontSize: 13, color: '#64748B', lineHeight: 20 }
});