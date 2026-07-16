import React from 'react';
import { View, Text, StyleSheet, Image, Platform } from 'react-native';
import { colors } from '../../theme/colors';

const shadowStyle = Platform.select({
  ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  android: { elevation: 5 },
  web: { boxShadow: '0px 4px 10px rgba(30, 41, 59, 0.1)' }
});

export default function PromoBanners() {
  return (
    <View style={styles.dualPromoContainer}>
      
      {/* 1. GREEN PROMO (10% OFF) */}
      <View style={[styles.miniPromo, {backgroundColor: colors.tintGreen}, shadowStyle]}>
        <View style={styles.promoTextWrapper}>
          <Text style={styles.promoTitleText}>Special Offer</Text>
          <Text style={styles.promoMainGreen}>Flat 10% OFF</Text>
          <Text style={styles.promoSub}>On All Repairs</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeText}>Use Code: FIXIT10</Text>
          </View>
        </View>
        <Image 
          source={require('../../../assets/home/phone1.png')} 
          style={styles.promoImage1} 
          resizeMode="contain"
        />
      </View>
      
      {/* 2. BLUE PROMO (FREE PICKUP) */}
      <View style={[styles.miniPromo, {backgroundColor: colors.tintBlue}, shadowStyle]}>
        <View style={styles.promoTextWrapper}>
          <Text style={styles.promoMainBlue}>Free Pickup{"\n"}& Drop</Text>
          <Text style={styles.promoSub}>On All Orders</Text>
        </View>
        <Image 
          source={require('../../../assets/home/delivery.png')} 
          style={styles.promoImage2} 
          resizeMode="contain"
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  /* DUAL PROMOS */
  dualPromoContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    paddingHorizontal: 15, 
    marginTop: 25 
  },
  miniPromo: { 
    width: '48%', 
    borderRadius: 12, 
    padding: 12, 
    height: 130, 
    position: 'relative', 
    overflow: 'hidden' 
  },
  promoTextWrapper: { 
    width: '60%', 
    zIndex: 2, 
    justifyContent: 'center' 
  }, 
  promoTitleText: { fontSize: 11, fontWeight: '800', color: colors.textDark, marginBottom: 2 },
  promoMainGreen: { fontSize: 13, fontWeight: '900', color: '#059669', marginBottom: 2 },
  promoMainBlue: { fontSize: 15, fontWeight: '900', color: colors.link, lineHeight: 20, marginBottom: 6, marginTop: 4 },
  promoSub: { fontSize: 10, color: colors.textLight, fontWeight: '600', marginBottom: 8 },
  codeBox: { backgroundColor: colors.success, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  
  promoImage1: { position: 'absolute', bottom: 0, right: 0, width: 75, height: 110 }, 
  promoImage2: { position: 'absolute', bottom: 0, right: 0, width: 95, height: 85 }, 
});