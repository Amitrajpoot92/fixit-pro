// src/screens/profile/ReferAndEarnScreen.js
import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Platform, 
  StatusBar,
  ScrollView,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';

import { colors } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../services/firebaseConfig';

const { width } = Dimensions.get('window');

// 🌟 Premium Soft Shadows
const shadowStyle = Platform.select({
  ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 12 },
  android: { elevation: 4, shadowColor: '#94A3B8' },
  web: { boxShadow: '0px 6px 12px rgba(148, 163, 184, 0.12)' }
});

export default function ReferAndEarnScreen({ navigation }) {
  const { user } = useAuth();
  const [earnedCoupons, setEarnedCoupons] = useState([]);
  const [refConfig, setRefConfig] = useState({ rewardDiscount: 30, referralDiscount: 50 });

  // 🚀 Referral Code Generator
  const firstName = user?.name ? user.name.split(' ')[0].toUpperCase() : 'USER';
  const referralCode = `FIXIT${firstName}${user?.uid?.substring(0, 4).toUpperCase() || '50'}`; 

  useEffect(() => {
    if (!user?.uid) return;

    // Save referral code to user doc if not present (fire and forget)
    updateDoc(doc(db, 'users', user.uid), {
      referralCode: referralCode
    }).catch(e => console.log("Referral code update error:", e));

    const q = query(
      collection(db, 'coupons'), 
      where('ownerUid', '==', user.uid),
      where('isActive', '==', true)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const coupons = [];
      snapshot.forEach(doc => {
        coupons.push({ id: doc.id, ...doc.data() });
      });
      setEarnedCoupons(coupons);
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'referral'), (docSnap) => {
      if (docSnap.exists()) {
        setRefConfig(docSnap.data());
      }
    });

    return () => {
      unsubscribe();
      unsubSettings();
    };
  }, [user]);

  const handleCopyCode = async (codeToCopy) => {
    await Clipboard.setStringAsync(codeToCopy);
    Alert.alert("Copied!", `Code ${codeToCopy} copied to clipboard.`);
  };

  const handleShare = async () => {
    try {
      const appUrl = 'https://play.google.com/store/apps/details?id=com.codewebx.fixitpro'; 
      await Share.share({
        message: `Hey! Use my code ${referralCode} to get ₹${refConfig.referralDiscount} OFF your first order on FixitPro!\n\nDownload the app now: ${appUrl}`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" translucent={false} />

      {/* 🔙 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refer & Earn</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* 🚀 MAIN WRAPPER */}
      <View style={styles.mainWrapper}>
        
        {/* 📜 SCROLLABLE CONTENT */}
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          
          {/* 🎁 ICON CONTAINER */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircleBg}>
              <FontAwesome5 name="gift" size={50} color={colors.primary} />
            </View>
          </View>

          {/* 📜 TEXT INFO */}
          <Text style={styles.mainHeading}>Invite Friends, Earn Rewards!</Text>
          <Text style={styles.subHeading}>
            Share your unique referral code with your friends. They get a ₹{refConfig.referralDiscount} discount on their 1st booking, and you earn a ₹{refConfig.rewardDiscount} reward coupon!
          </Text>
          
          {/* 🎫 REFERRAL CODE BOX */}
          <View style={styles.codeWrapper}>
            <Text style={styles.codeLabel}>Your Referral Code</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{referralCode}</Text>
              <TouchableOpacity style={styles.copyBtn} onPress={() => handleCopyCode(referralCode)} activeOpacity={0.7}>
                <MaterialIcons name="content-copy" size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 🚀 SHARE BUTTON */}
          <TouchableOpacity 
            style={styles.shareBtn}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <FontAwesome5 name="whatsapp" size={20} color="#FFF" />
            <Text style={styles.shareBtnText}>Share Code</Text>
          </TouchableOpacity>

          {/* 📋 HOW IT WORKS STEPS */}
          <View style={styles.stepsContainer}>
            <Text style={styles.stepsTitle}>How does it work?</Text>
            
            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: '#EFF6FF' }]}>
                <Text style={[styles.stepNumberText, { color: '#2563EB' }]}>1</Text>
              </View>
              <Text style={styles.stepText}>Send invite link & code to your friends.</Text>
            </View>

            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.stepNumberText, { color: '#16A34A' }]}>2</Text>
              </View>
              <Text style={styles.stepText}>They register and complete their 1st booking.</Text>
            </View>

            <View style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: '#FEF3C7' }]}>
                <Text style={[styles.stepNumberText, { color: '#D97706' }]}>3</Text>
              </View>
              <Text style={styles.stepText}>You get a ₹{refConfig.rewardDiscount} discount coupon when they complete their order!</Text>
            </View>
          </View>

          {/* 🎟️ EARNED COUPONS SECTION */}
          <View style={styles.couponsContainer}>
            <Text style={styles.stepsTitle}>My Earned Coupons</Text>
            {earnedCoupons.length === 0 ? (
              <Text style={styles.noCouponText}>You haven't earned any reward coupons yet. Start referring!</Text>
            ) : (
              earnedCoupons.map((coupon, idx) => (
                <View key={coupon.id} style={styles.rewardCard}>
                  <View style={styles.rewardLeft}>
                    <MaterialIcons name="local-offer" size={24} color="#16A34A" />
                    <View style={{marginLeft: 10}}>
                      <Text style={styles.rewardDiscount}>₹{coupon.discount} OFF</Text>
                      <Text style={styles.rewardCode}>{coupon.code}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => handleCopyCode(coupon.code)} style={styles.rewardCopyBtn}>
                    <Text style={styles.rewardCopyText}>COPY</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

        </ScrollView>


      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#F8FAFC', zIndex: 10 },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', ...shadowStyle },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  
  mainWrapper: { flex: 1, position: 'relative' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, alignItems: 'center' },
  
  // 🚀 ICON STYLES
  iconContainer: { marginVertical: 25, justifyContent: 'center', alignItems: 'center' },
  iconCircleBg: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#DBEAFE' },
  
  mainHeading: { fontSize: 22, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  subHeading: { fontSize: 14, fontWeight: '600', color: '#64748B', textAlign: 'center', lineHeight: 22, paddingHorizontal: 10, marginBottom: 25 },
  
  codeWrapper: { width: '100%', alignItems: 'center', marginBottom: 20 },
  codeLabel: { fontSize: 13, fontWeight: '700', color: '#64748B', marginBottom: 8, textTransform: 'uppercase' },
  codeBox: { width: '100%', flexDirection: 'row', backgroundColor: '#FFF', borderWidth: 2, borderColor: '#E2E8F0', borderRadius: 16, borderStyle: 'dashed', padding: 15, alignItems: 'center', justifyContent: 'space-between' },
  codeText: { fontSize: 20, fontWeight: '900', color: colors.primary, letterSpacing: 2 },
  copyBtn: { padding: 5 },

  shareBtn: { width: '100%', flexDirection: 'row', backgroundColor: colors.primary, padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 25 },
  shareBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },

  stepsContainer: { width: '100%', backgroundColor: '#FFF', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 20 },
  stepsTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 15 },
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  stepNumber: { width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  stepNumberText: { fontSize: 14, fontWeight: '900' },
  stepText: { flex: 1, fontSize: 14, fontWeight: '700', color: '#475569' },

  // Earned Coupons
  couponsContainer: { width: '100%', marginBottom: 30 },
  noCouponText: { fontSize: 14, color: '#94A3B8', fontWeight: '600', textAlign: 'center', marginTop: 10 },
  rewardCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F0FDF4', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#DCFCE7' },
  rewardLeft: { flexDirection: 'row', alignItems: 'center' },
  rewardDiscount: { fontSize: 16, fontWeight: '900', color: '#166534' },
  rewardCode: { fontSize: 12, fontWeight: '700', color: '#16A34A', marginTop: 2, textTransform: 'uppercase' },
  rewardCopyBtn: { backgroundColor: '#DCFCE7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  rewardCopyText: { fontSize: 12, fontWeight: '800', color: '#15803D' }
});