import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';

const shadowStyle = Platform.select({
  ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
  android: { elevation: 6 },
  web: { boxShadow: '0px 6px 12px rgba(30, 41, 59, 0.1)' }
});

export default function PromoBanners() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, 'coupons'),
      where('type', '==', 'global'),
      where('isActive', '==', true),
      limit(2)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const cps = [];
      snapshot.forEach(doc => cps.push({ id: doc.id, ...doc.data() }));
      setCoupons(cps);
    });
    return () => unsubscribe();
  }, []);

  const promo1 = coupons[0] || {
    title: 'Special Offer',
    desc: 'On All Repairs',
    discount: '10',
    code: 'FIXIT10'
  };

  const promo2 = coupons[1] || null;

  return (
    <View style={styles.dualPromoContainer}>
      
      {/* 1. FIRST PROMO */}
      <View style={[styles.miniPromoWrapper, shadowStyle]}>
        <LinearGradient 
          colors={['#10B981', '#047857']} 
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={styles.miniPromo}
        >
          <View style={styles.promoTextWrapper}>
            <Text style={styles.promoTitleText} numberOfLines={1}>{promo1.title}</Text>
            <Text style={styles.promoMain}>Flat ₹{promo1.discount} OFF</Text>
            <Text style={styles.promoSub} numberOfLines={1}>{promo1.desc || 'On All Repairs'}</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>CODE: {promo1.code}</Text>
            </View>
          </View>
          <Image 
            source={require('../../../assets/home/phone1.png')} 
            style={styles.promoImage1} 
            resizeMode="contain"
          />
        </LinearGradient>
      </View>
      
      {/* 2. SECOND PROMO OR FALLBACK */}
      <View style={[styles.miniPromoWrapper, shadowStyle]}>
        <LinearGradient 
          colors={['#3B82F6', '#1D4ED8']} 
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={styles.miniPromo}
        >
          {promo2 ? (
             <View style={styles.promoTextWrapper}>
               <Text style={styles.promoTitleText} numberOfLines={1}>{promo2.title}</Text>
               <Text style={styles.promoMain}>Flat ₹{promo2.discount} OFF</Text>
               <Text style={styles.promoSub} numberOfLines={1}>{promo2.desc || 'Special Discount'}</Text>
               <View style={styles.codeBox}>
                 <Text style={[styles.codeText, {color: '#1D4ED8'}]}>CODE: {promo2.code}</Text>
               </View>
             </View>
          ) : (
            <View style={styles.promoTextWrapper}>
              <Text style={styles.promoTitleText}>Free Service</Text>
              <Text style={styles.promoMain}>Pickup & Drop</Text>
              <Text style={styles.promoSub}>On All Orders</Text>
            </View>
          )}
          <Image 
            source={require('../../../assets/home/delivery.png')} 
            style={styles.promoImage2} 
            resizeMode="contain"
          />
        </LinearGradient>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  /* DUAL PROMOS */
  dualPromoContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 20, 
    marginTop: 15,
    marginBottom: 5
  },
  miniPromoWrapper: {
    width: '48%', 
    borderRadius: 20, 
    height: 140, 
  },
  miniPromo: { 
    flex: 1,
    borderRadius: 20, 
    padding: 15, 
    position: 'relative', 
    overflow: 'hidden' 
  },
  promoTextWrapper: { 
    width: '60%', 
    zIndex: 2, 
    justifyContent: 'center',
    height: '100%'
  }, 
  promoTitleText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  promoMain: { fontSize: 14, fontWeight: '900', color: '#FFF', lineHeight: 20, marginBottom: 2 },
  promoSub: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 8 },
  codeBox: { backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  codeText: { color: '#047857', fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  
  promoImage1: { position: 'absolute', bottom: -5, right: -12, width: 85, height: 125, zIndex: 1 }, 
  promoImage2: { position: 'absolute', bottom: -10, right: -18, width: 105, height: 100, zIndex: 1 }, 
});