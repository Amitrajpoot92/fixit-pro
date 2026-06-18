// src/screens/home/HomeScreen.js
import React, { useRef } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, 
  TextInput, TouchableOpacity, Image, Dimensions, Platform, StatusBar
} from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { useTabVisibility } from '../../context/TabVisibilityContext'; 
import { useNavigation } from '@react-navigation/native'; 

const { width } = Dimensions.get('window');

// Premium Shadows Helper
const shadowStyle = Platform.select({
  ios: { shadowColor: '#1E293B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
  android: { elevation: 5 },
  web: { boxShadow: '0px 4px 10px rgba(30, 41, 59, 0.1)' }
});

export default function HomeScreen() {
  const { setIsTabBarVisible } = useTabVisibility(); 
  const currentY = useRef(0);
  const navigation = useNavigation();

  // Scroll DOWN = Hide, Scroll UP = Show
  const handleScroll = (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    const isScrollingDown = yOffset > currentY.current && yOffset > 50; 

    if (isScrollingDown) {
      setIsTabBarVisible(false);
    } else if (yOffset < currentY.current && (currentY.current - yOffset > 5)) {
      setIsTabBarVisible(true);
    }
    
    if (yOffset <= 10) {
        setIsTabBarVisible(true);
    }

    currentY.current = yOffset;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} translucent={false} />
      
      {/* 1. HEADER */}
      <View style={styles.header}>
        <View style={styles.brandLeft}>
          <Ionicons name="settings" size={24} color={colors.primary} />
          <Text style={styles.logoText}>Fixit</Text>
          <View style={styles.logoProBox}>
            <Text style={styles.logoProText}>Pro</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <MaterialIcons name="notifications-none" size={26} color={colors.textDark} />
            <View style={styles.badge}><Text style={styles.badgeText}>3</Text></View>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, {marginLeft: 15}]}>
            <MaterialIcons name="shopping-cart" size={24} color={colors.textDark} />
            <View style={styles.badge}><Text style={styles.badgeText}>2</Text></View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        onScroll={handleScroll} 
        scrollEventThrottle={16} 
        contentContainerStyle={{paddingBottom: 150}} 
      >
        
        {/* 2. SEARCH BAR */}
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={22} color={colors.textMuted} />
          <TextInput 
            placeholder="Search for services, accessories..." 
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput} 
          />
          <MaterialIcons name="mic-none" size={22} color={colors.textMuted} />
        </View>

        {/* 3. HERO PROMO BANNER */}
        <View style={[styles.heroCard, shadowStyle]}>
          <View style={styles.heroLeft}>
            <Text style={styles.heroTitle}>Professional Repair{"\n"}Trusted Service{"\n"}At Your Doorstep</Text>
            
            <View style={styles.heroFeatures}>
               <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={12} color={colors.accent}/> Pickup</Text>
               <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={12} color={colors.accent}/> Repair</Text>
               <Text style={styles.heroFeatureText}><MaterialIcons name="verified" size={12} color={colors.accent}/> Delivered</Text>
            </View>

            <TouchableOpacity 
              style={styles.heroBtn} 
              onPress={() => navigation.navigate('DeviceSelection')}
            >
               <Text style={styles.heroBtnText}>Book Repair Now</Text>
               <MaterialIcons name="arrow-forward" size={16} color={colors.black}/>
            </TouchableOpacity>
          </View>

          <View style={styles.heroRight}>
            <Image 
              source={require('../../../assets/home/phone1.png')} 
              style={styles.brokenPhoneImg} 
              resizeMode="contain"
            />
            <View style={styles.shieldInfo}>
               <View style={styles.shieldBox}>
                 <Text style={styles.shieldNumber}>6</Text>
                 <Text style={styles.shieldText}>Month{"\n"}Warranty</Text>
               </View>
               <Text style={styles.shieldListText}>✓ Fast Repair</Text>
               <Text style={styles.shieldListText}>✓ Original Parts</Text>
            </View>
          </View>

          <View style={styles.sliderDots}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* 4. MAIN ACTION BUTTONS */}
        <View style={styles.actionGrid}>
          {[
            {n: 'Book Repair', i: 'build', c: colors.tintBlue, ic: colors.iconBlue, route: 'DeviceSelection'}, 
            {n: 'Pickup & Drop', i: 'moped', c: colors.tintGreen, ic: colors.success},
            {n: 'Home Service', i: 'home', c: colors.tintOrange, ic: colors.iconOrange},
            {n: 'Accessories', i: 'smartphone', c: colors.tintPurple, ic: colors.iconPurple},
            {n: 'Support', i: 'support-agent', c: colors.tintPink, ic: colors.iconPink},
          ].map((item, idx) => (
            <TouchableOpacity 
              key={idx} 
              style={styles.actionItem}
              onPress={() => item.route ? navigation.navigate(item.route) : null} 
            >
              <View style={[styles.actionIconCircle, {backgroundColor: item.c}, shadowStyle]}>
                <MaterialIcons name={item.i} size={28} color={item.ic} />
              </View>
              <Text style={styles.actionLabel}>{item.n}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 5. DUAL PROMOS (FIXED IMAGES) */}
        <View style={styles.dualPromoContainer}>
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

        {/* 6. POPULAR REPAIR SERVICES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Popular Repair Services</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All <MaterialIcons name="arrow-forward" size={14}/></Text></TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[
            {n: 'Screen\nReplacement', p: '₹999', img: 'https://cdn-icons-png.flaticon.com/512/1103/1103099.png'},
            {n: 'Battery\nReplacement', p: '₹499', img: 'https://cdn-icons-png.flaticon.com/512/3103/3103446.png'},
            {n: 'Speaker\nRepair', p: '₹399', img: 'https://cdn-icons-png.flaticon.com/512/865/865017.png'},
            {n: 'Charging\nRepair', p: '₹299', img: 'https://cdn-icons-png.flaticon.com/512/2689/2689533.png'},
            {n: 'More\nServices', p: '', isMore: true}
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={[styles.serviceCard, shadowStyle]}>
               <View style={styles.serviceImageWrapper}>
                 {item.isMore ? (
                   <View style={styles.moreDotCircle}><MaterialIcons name="more-horiz" size={24} color={colors.link} /></View>
                 ) : (
                   <Image source={{uri: item.img}} style={styles.serviceCardImage} resizeMode="contain" />
                 )}
               </View>
               <Text style={styles.sName}>{item.n}</Text>
               {!item.isMore && <Text style={styles.sPriceLabel}>From <Text style={styles.sPriceValue}>{item.p}</Text></Text>}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 7. SHOP BY CATEGORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by Category</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All <MaterialIcons name="arrow-forward" size={14}/></Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[
            {n: 'Display', img: 'https://cdn-icons-png.flaticon.com/512/1103/1103099.png', bg: colors.tintBlue},
            {n: 'Battery', img: 'https://cdn-icons-png.flaticon.com/512/3103/3103446.png', bg: '#F1F5F9'},
            {n: 'Charger', img: 'https://cdn-icons-png.flaticon.com/512/3063/3063822.png', bg: '#F1F5F9'},
            {n: 'Cable', img: 'https://cdn-icons-png.flaticon.com/512/2689/2689533.png', bg: '#F1F5F9'},
            {n: 'Cover', img: 'https://cdn-icons-png.flaticon.com/512/3276/3276388.png', bg: '#F1F5F9'},
            {n: 'More', isMore: true, bg: '#F1F5F9'}
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.catCircleItem}>
               <View style={[styles.catCircle, {backgroundColor: item.bg}, shadowStyle]}>
                 {item.isMore ? (
                   <MaterialIcons name="more-horiz" size={24} color={colors.link} />
                 ) : (
                   <Image source={{uri: item.img}} style={styles.catCircleImage} resizeMode="contain" />
                 )}
               </View>
               <Text style={styles.catCircleLabel}>{item.n}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* 8. TRENDING ACCESSORIES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Accessories</Text>
          <TouchableOpacity><Text style={styles.viewAll}>View All <MaterialIcons name="arrow-forward" size={14}/></Text></TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {[
            {n: 'Realme Buds 2', p: '₹299', op: '₹499', off: '40% OFF', img: 'https://cdn-icons-png.flaticon.com/512/3276/3276388.png'},
            {n: 'Type C Cable', p: '₹199', op: '₹299', off: '33% OFF', img: 'https://cdn-icons-png.flaticon.com/512/2689/2689533.png'},
            {n: 'Silicon Cover', p: '₹149', op: '₹249', off: '40% OFF', img: 'https://cdn-icons-png.flaticon.com/512/1103/1103099.png'}
          ].map((item, idx) => (
            <View key={idx} style={[styles.productCard, shadowStyle]}>
               <View style={styles.productContent}>
                 <View style={styles.productImageBackground}>
                   <Image source={{uri: item.img}} style={styles.productImage} resizeMode="contain" />
                 </View>
                 <View style={styles.productDetails}>
                   <Text style={styles.productName} numberOfLines={1}>{item.n}</Text>
                   <View style={styles.priceRow}>
                     <Text style={styles.currentPrice}>{item.p}</Text>
                     <Text style={styles.oldPrice}>{item.op}</Text>
                   </View>
                   <Text style={styles.discountText}>{item.off}</Text>
                 </View>
               </View>
               <TouchableOpacity style={styles.addButton}>
                 <MaterialIcons name="add" size={16} color={colors.white} />
               </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
  },
  
  /* HEADER */
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 15, paddingBottom: 10 },
  brandLeft: { flexDirection: 'row', alignItems: 'center' },
  logoText: { fontSize: 22, fontWeight: '900', color: colors.primary, marginLeft: 6, marginRight: 4 },
  logoProBox: { backgroundColor: colors.link, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  logoProText: { color: colors.white, fontSize: 12, fontWeight: '800' },

  headerRight: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { position: 'relative' },
  badge: { position: 'absolute', top: -5, right: -5, backgroundColor: colors.error, borderRadius: 10, width: 16, height: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: colors.white },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: 'bold' },

  /* SEARCH BAR */
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, marginHorizontal: 15, marginVertical: 15, padding: 12, borderRadius: 25, borderWidth: 1, borderColor: colors.borderColor },
  searchInput: { marginHorizontal: 10, flex: 1, fontSize: 14, color: colors.textDark },
  
  /* HERO LAYOUT */
  heroCard: { backgroundColor: colors.primaryDark, marginHorizontal: 15, borderRadius: 20, padding: 20, paddingBottom: 35, minHeight: 220, flexDirection: 'row', overflow: 'hidden' },
  heroLeft: { flex: 1.2, zIndex: 2 },
  heroTitle: { color: colors.white, fontSize: 15, fontWeight: '800', lineHeight: 22 },
  heroFeatures: { flexDirection: 'row', marginTop: 10, marginBottom: 15, flexWrap: 'wrap' },
  heroFeatureText: { color: colors.white, fontSize: 9, marginRight: 8, fontWeight: '600', marginBottom: 5 },
  heroBtn: { backgroundColor: colors.accent, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center' },
  heroBtnText: { fontWeight: '800', fontSize: 12, color: colors.black, marginRight: 6 },
  heroRight: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  brokenPhoneImg: { width: 90, height: 160, position: 'absolute', left: -20, top: -10 },
  shieldInfo: { position: 'absolute', right: 0, alignItems: 'center' },
  shieldBox: { width: 50, height: 60, borderColor: colors.white, borderWidth: 1, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  shieldNumber: { color: colors.white, fontSize: 16, fontWeight: '900' },
  shieldText: { color: colors.white, fontSize: 7, textAlign: 'center' },
  shieldListText: { color: colors.white, fontSize: 8, marginBottom: 4 },
  sliderDots: { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 3 },
  activeDot: { backgroundColor: colors.white, width: 16 },

  /* ACTION GRID */
  actionGrid: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 25 },
  actionItem: { alignItems: 'center', width: width / 5.5 },
  actionIconCircle: { width: 60, height: 60, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionLabel: { fontSize: 10, fontWeight: '700', textAlign: 'center', color: colors.textDark },

  /* DUAL PROMOS (FIXED IMAGES) */
  dualPromoContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 25 },
  miniPromo: { width: '48%', borderRadius: 12, padding: 12, height: 130, position: 'relative', overflow: 'hidden' },
  promoTextWrapper: { width: '60%', zIndex: 2, justifyContent: 'center' }, 
  promoTitleText: { fontSize: 11, fontWeight: '800', color: colors.textDark, marginBottom: 2 },
  promoMainGreen: { fontSize: 13, fontWeight: '900', color: '#059669', marginBottom: 2 },
  promoMainBlue: { fontSize: 15, fontWeight: '900', color: colors.link, lineHeight: 20, marginBottom: 6, marginTop: 4 },
  promoSub: { fontSize: 10, color: colors.textLight, fontWeight: '600', marginBottom: 8 },
  codeBox: { backgroundColor: colors.success, alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  codeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
  
  promoImage1: { position: 'absolute', bottom: 0, right: 0, width: 75, height: 110 }, 
  promoImage2: { position: 'absolute', bottom: 0, right: 0, width: 95, height: 85 }, 

  /* SECTION HEADERS */
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 15, marginTop: 30, alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.textDark },
  viewAll: { fontSize: 12, fontWeight: '700', color: colors.link, flexDirection: 'row', alignItems: 'center' },
  horizontalScroll: { paddingLeft: 15, marginTop: 15 },
  serviceCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borderColor, padding: 15, borderRadius: 12, width: 110, marginRight: 12, alignItems: 'center' },
  serviceImageWrapper: { height: 50, justifyContent: 'center', marginBottom: 5 },
  serviceCardImage: { width: 35, height: 35 },
  moreDotCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.tintBlue, justifyContent: 'center', alignItems: 'center' },
  sName: { textAlign: 'center', fontWeight: '700', fontSize: 11, height: 32, color: colors.textDark },
  sPriceLabel: { fontSize: 10, color: colors.textLight, marginTop: 4 },
  sPriceValue: { fontWeight: '800', color: colors.success, fontSize: 11 },

  catCircleItem: { alignItems: 'center', marginRight: 20, width: 60 },
  catCircle: { width: 55, height: 55, borderRadius: 27.5, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  catCircleImage: { width: 25, height: 25 },
  catCircleLabel: { fontSize: 11, fontWeight: '600', color: colors.textDark, textAlign: 'center' },

  /* TRENDING ACCESSORIES */
  productCard: { backgroundColor: colors.white, borderRadius: 16, width: width * 0.65, marginRight: 15, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  productContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productImageBackground: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.tintPurple, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  productImage: { width: 35, height: 35 },
  productDetails: { flex: 1, justifyContent: 'center' },
  productName: { fontSize: 13, fontWeight: '700', color: colors.textDark, marginBottom: 4 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  currentPrice: { fontSize: 14, fontWeight: '800', color: colors.success, marginRight: 6 },
  oldPrice: { fontSize: 11, color: colors.textMuted, textDecorationLine: 'line-through' },
  discountText: { fontSize: 11, color: colors.success, fontWeight: '700', marginTop: 2 },
  addButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.link, justifyContent: 'center', alignItems: 'center', elevation: 3 },
});