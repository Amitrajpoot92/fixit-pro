// src/screens/profile/SupportScreen.js
import React, { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore'; // 🚀 onSnapshot import kiya
import { db } from '../../services/firebaseConfig';
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
  // Default fallbacks (Agar net slow ho ya admin ne delete kar diya ho)
  const [supportPhone, setSupportPhone] = useState('+919576441800');
  const [supportEmail, setSupportEmail] = useState('Admin.mrfixitpro@gmail.com');

  // 🚀 LIVE SYNC LOGIC: Admin panel se direct data fetch hoga real-time me
  useEffect(() => {
    const docRef = doc(db, 'admin_settings', 'global_config');
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.supportPhone) setSupportPhone(data.supportPhone);
        if (data.supportEmail) setSupportEmail(data.supportEmail);
      }
    }, (error) => {
      console.log("Error fetching live support settings:", error);
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // 🚀 WhatsApp Logic
  const openWhatsApp = () => {
    const message = 'Hello FixitPro Team! I am facing an issue and need some help. Please assist me.';
    Linking.openURL(`whatsapp://send?phone=${supportPhone}&text=${encodeURIComponent(message)}`);
  };

  // 🚀 Email Logic
  const openEmail = () => {
    const subject = 'Need Support - FixitPro App';
    Linking.openURL(`mailto:${supportEmail}?subject=${encodeURIComponent(subject)}`);
  };

  // 🚀 Call Logic
  const openCall = () => {
    Linking.openURL(`tel:${supportPhone}`);
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
          {/* ⚠️ NOTE: Fallback error handling added safely */}
          <Image 
            source={require('../../../assets/platform-img/logo.jpeg')} 
            style={styles.logoImage} 
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