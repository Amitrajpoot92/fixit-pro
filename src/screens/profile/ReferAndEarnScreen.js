// src/screens/profile/ReferAndEarnScreen.js
import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform, 
  StatusBar,
  Share,
  Image
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard'; // Agar clipboard use karna ho

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';

export default function ReferAndEarnScreen({ navigation }) {
  const { user } = useAuth();

  // 🚀 Generate a unique referral code based on user's name
  const firstName = user?.name ? user.name.split(' ')[0].toUpperCase() : 'USER';
  const referralCode = `FIXIT${firstName}50`; // Example: FIXITAMAN50

  // 🚀 Native Share Logic (WhatsApp, Messages, etc.)
  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `Use my referral code ${referralCode} to get ₹50 off on your first home service booking with FixitPro! Download the app now: https://fixitpro.com/download`,
        title: 'FixitPro Referral',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(referralCode);
    alert('Referral Code Copied!'); // Tum isko ek aache toast me badal sakte ho
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.title}>Refer & Earn</Text>
        <View style={{width: 24}} />
      </View>

      <View style={styles.content}>
        {/* Graphic Area */}
        <View style={styles.iconContainer}>
          <FontAwesome5 name="gifts" size={80} color={colors.primary} />
        </View>

        <Text style={styles.mainHeading}>Invite Friends & Earn</Text>
        <Text style={styles.subText}>
          Get ₹50 in your wallet for every friend who signs up and completes their first service booking!
        </Text>

        {/* Code Container */}
        <View style={styles.codeWrapper}>
          <Text style={styles.codeLabel}>Your Referral Code</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>{referralCode}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy}>
              <MaterialIcons name="content-copy" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Button */}
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <MaterialIcons name="share" size={22} color="#FFF" />
          <Text style={styles.shareBtnText}>Share with Friends</Text>
        </TouchableOpacity>

        {/* Steps/Rules */}
        <View style={styles.stepsContainer}>
          <Text style={styles.stepsTitle}>How it works?</Text>
          
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>1</Text></View>
            <Text style={styles.stepText}>Share your code with friends</Text>
          </View>
          
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>2</Text></View>
            <Text style={styles.stepText}>Friend signs up & books a service</Text>
          </View>
          
          <View style={styles.stepRow}>
            <View style={styles.stepNumber}><Text style={styles.stepNumText}>3</Text></View>
            <Text style={styles.stepText}>You both get ₹50 in Wallet!</Text>
          </View>
        </View>

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
  content: { flex: 1, paddingHorizontal: 25, alignItems: 'center', paddingTop: 20 },
  
  iconContainer: { width: 140, height: 140, backgroundColor: '#E0E7FF', borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 30 },
  mainHeading: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 10 },
  subText: { fontSize: 14, color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10, marginBottom: 40 },
  
  codeWrapper: { width: '100%', alignItems: 'center', marginBottom: 30 },
  codeLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
  codeBox: { width: '100%', flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 16, borderStyle: 'dashed', padding: 15, alignItems: 'center', justifyContent: 'space-between' },
  codeText: { fontSize: 20, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
  copyBtn: { padding: 5 },

  shareBtn: { width: '100%', flexDirection: 'row', backgroundColor: colors.primary, padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 40 },
  shareBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  stepsContainer: { width: '100%', backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  stepsTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  stepNumber: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNumText: { color: colors.primary, fontWeight: '800', fontSize: 12 },
  stepText: { fontSize: 14, color: '#475569', fontWeight: '600' }
});