import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const shadowStyle = Platform.select({
  ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
  android: { elevation: 6 },
  web: { boxShadow: '0px 6px 12px rgba(30, 41, 59, 0.1)' }
});

export default function PromoBanners() {
  return (
    <View style={styles.dualPromoContainer}>
      
      {/* 1. GREEN PROMO (10% OFF) */}
      <View style={[styles.miniPromoWrapper, shadowStyle]}>
        <LinearGradient 
          colors={['#10B981', '#047857']} 
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={styles.miniPromo}
        >
          <View style={styles.promoTextWrapper}>
            <Text style={styles.promoTitleText}>Special Offer</Text>
            <Text style={styles.promoMain}>Flat 10% OFF</Text>
            <Text style={styles.promoSub}>On All Repairs</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>CODE: FIXIT10</Text>
            </View>
          </View>
          <Image 
            source={require('../../../assets/home/phone1.png')} 
            style={styles.promoImage1} 
            resizeMode="contain"
          />
        </LinearGradient>
      </View>
      
      {/* 2. BLUE PROMO (FREE PICKUP) */}
      <View style={[styles.miniPromoWrapper, shadowStyle]}>
        <LinearGradient 
          colors={['#3B82F6', '#1D4ED8']} 
          start={{x: 0, y: 0}} end={{x: 1, y: 1}}
          style={styles.miniPromo}
        >
          <View style={styles.promoTextWrapper}>
            <Text style={styles.promoTitleText}>Free Service</Text>
            <Text style={styles.promoMain}>Pickup & Drop</Text>
            <Text style={styles.promoSub}>On All Orders</Text>
          </View>
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
    marginTop: 35,
    marginBottom: 10
  },
  miniPromoWrapper: {
    width: '48%', 
    borderRadius: 20, 
    height: 140, 
  },
  miniPromo: { 
    flex: 1,
    borderRadius: 20, 
    padding: 16, 
    position: 'relative', 
    overflow: 'hidden' 
  },
  promoTextWrapper: { 
    width: '65%', 
    zIndex: 2, 
    justifyContent: 'center',
    height: '100%'
  }, 
  promoTitleText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  promoMain: { fontSize: 14, fontWeight: '900', color: '#FFF', lineHeight: 20, marginBottom: 4 },
  promoSub: { fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: '600', marginBottom: 12 },
  codeBox: { backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  codeText: { color: '#047857', fontSize: 10, fontWeight: '900' },
  
  promoImage1: { position: 'absolute', bottom: -5, right: -10, width: 85, height: 125, zIndex: 1 }, 
  promoImage2: { position: 'absolute', bottom: -10, right: -15, width: 105, height: 100, zIndex: 1 }, 
});