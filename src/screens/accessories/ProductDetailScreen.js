import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, 
  Image, Platform, StatusBar, Alert, FlatList, Dimensions, Animated, Share
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, increment, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProductDetailScreen({ navigation, route }) {
  const { product } = route.params;
  const { user } = useAuth();
  
  // 🚀 Image Carousel State
  // Puraani aur nayi dono products ke liye logic (image vs images array)
  const productImages = product.images && product.images.length > 0 ? product.images : [product.image].filter(Boolean);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const flatListRef = useRef(null);

  // 🚀 Cart Badge Count State
  const [cartCount, setCartCount] = useState(0);

  // 🚀 Recommendations State
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const collectionName = product.condition === 'Refurbished' ? 'refurbished_products' : 'new_products';
        const q = query(collection(db, collectionName), limit(6));
        const snap = await getDocs(q);
        const items = snap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== product.id);
        setRecommendedProducts(items);
      } catch (e) {
        console.log('Error fetching recommendations', e);
      }
    };
    fetchRecommendations();
  }, [product.id]);

  // 🚀 Animation States
  const [isAnimating, setIsAnimating] = useState(false);
  const moveAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current; // Initially invisible

  // Fetch Cart Count
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, `users/${user.uid}/cart`));
    const unsubscribe = onSnapshot(q, (snap) => {
      setCartCount(snap.docs.length);
    });
    return () => unsubscribe();
  }, [user]);

  // Handle Scroll for Image Carousel
  const onMomentumScrollEnd = (event) => {
    const cardWidth = width - 30;
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / cardWidth);
    setCurrentImageIndex(newIndex);
  };

  const scrollLeft = () => {
    if (currentImageIndex > 0) {
      const nextIndex = currentImageIndex - 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentImageIndex(nextIndex);
    }
  };

  const scrollRight = () => {
    if (currentImageIndex < productImages.length - 1) {
      const nextIndex = currentImageIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentImageIndex(nextIndex);
    }
  };

  // 🚀 ADD TO CART LOGIC WITH ANIMATION
  const addToCart = async () => {
    if (!user) return Alert.alert("Login Required", "Please login to add to cart.");
    
    // 1. Trigger Animation
    setIsAnimating(true);
    
    // Start position (Approximate bottom center)
    moveAnim.setValue({ x: width / 2 - 20, y: Dimensions.get('window').height - 120 }); 
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);

    Animated.parallel([
      Animated.timing(moveAnim, {
        toValue: { x: width - 60, y: Platform.OS === 'ios' ? 50 : 20 }, // End position (Top Right Cart Icon)
        duration: 700,
        useNativeDriver: false, // Required false for position animation in some RN versions
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.2, // Shrink while flying
        duration: 700,
        useNativeDriver: false,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0, // Fade out at the end
        duration: 700,
        useNativeDriver: false,
      })
    ]).start(() => {
      setIsAnimating(false);
    });

    // 2. Silent Database Update (No Alert Popup)
    try {
      const q = query(collection(db, `users/${user.uid}/cart`), where('productId', '==', product.id));
      const snap = await getDocs(q);
      if (!snap.empty) {
        await updateDoc(doc(db, `users/${user.uid}/cart`, snap.docs[0].id), { quantity: increment(1) });
      } else {
        await addDoc(collection(db, `users/${user.uid}/cart`), { ...product, productId: product.id, quantity: 1 });
      }
    } catch (e) { console.error(e); }
  };

  // 🚀 Share Product Logic
  const onShare = async () => {
    try {
      await Share.share({
        message: `Check out this amazing product: ${product.name} for just ₹${product.price} on FixitPro!\n\nDownload the app now: https://play.google.com/store/apps/details?id=com.codewebx.fixitpro`,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* 🟢 HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtnWrapper}>
          <Ionicons name="arrow-back" size={22} color="#1E293B" />
          <Text style={styles.backBtnText}>BACK TO PRODUCTS</Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('CartScreen')} style={styles.cartIconWrapper}>
          <Ionicons name="cart-outline" size={24} color="#1E293B" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        
        {/* 🚀 MAIN IMAGE CARD */}
        <View style={styles.mainImageCard}>
          {/* Top Overlays inside Card */}
          <View style={styles.cardOverlays}>
            <View style={styles.categoryPillTop}>
              <Text style={styles.categoryPillTopText}>{product.category}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={onShare}>
              <Ionicons name="share-social-outline" size={20} color="#1E293B" />
            </TouchableOpacity>
          </View>
          
          <FlatList
            ref={flatListRef}
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width: width - 30, height: '100%', justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item }} style={styles.mainImage} resizeMode="contain" />
              </View>
            )}
          />
        </View>

        {/* 🚀 THUMBNAILS LIST */}
        {productImages.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailsContainer}>
            {productImages.map((img, idx) => (
              <TouchableOpacity 
                key={idx} 
                onPress={() => setCurrentImageIndex(idx)}
                style={[styles.thumbnailWrapper, currentImageIndex === idx && styles.thumbnailActive]}
              >
                <Image source={{ uri: img }} style={styles.thumbnailImg} resizeMode="contain" />
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* 🟢 DETAILS SECTION */}
        <View style={styles.detailsBox}>
          
          {/* Accent Pills Row */}
          <View style={styles.pillsRow}>
            <View style={styles.accentPill}>
              <Text style={styles.accentPillText}>{product.category}</Text>
            </View>
            <View style={styles.accentPill}>
              <Ionicons name="star" size={14} color="#F59E0B" style={{marginRight: 4}} />
              <Text style={styles.accentPillTextDark}>4.8 EXPERT RATING</Text>
            </View>
          </View>
          
          <Text style={styles.productTitle}>{product.name}</Text>
          
          <View style={styles.pillsRow}>
            <View style={styles.dealPill}>
              <Text style={styles.dealPillText}>BIG DEAL</Text>
            </View>
          </View>
          
          {/* Product Highlights Card */}
          <View style={styles.highlightsCard}>
            <View style={styles.highlightsHeader}>
              <Text style={styles.highlightsTitle}>Product Highlights</Text>
              {product.originalPrice && product.originalPrice > product.price && (
                <View style={styles.discountPillSmall}>
                  <Text style={styles.discountPillTextSmall}>
                    {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.highlightRow}>
              <View style={styles.highlightIconBox}>
                <Ionicons name="document-text-outline" size={20} color="#475569" />
              </View>
              <View style={styles.highlightTextBox}>
                <Text style={styles.highlightText}>{product.description}</Text>
              </View>
            </View>
            
            {/* You can add more highlight rows here if data permits */}
          </View>

          {/* 🚀 SIMILAR PRODUCTS SECTION */}
          {recommendedProducts.length > 0 && (
            <View style={styles.recSection}>
              <Text style={styles.recSectionTitle}>Similar Products</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recList}>
                {recommendedProducts.map((item) => (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.recCard}
                    activeOpacity={0.9}
                    onPress={() => navigation.push('ProductDetail', { product: item })}
                  >
                    <View style={styles.recImgBox}>
                      <Image source={{ uri: item.image || (item.images && item.images[0]) }} style={styles.recImg} resizeMode="contain" />
                    </View>
                    <Text style={styles.recName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.recPrice}>₹{item.price}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

        </View>
      </ScrollView>

      {/* 🟢 BOTTOM ACTION BAR */}
      <View style={styles.bottomActionBar}>
        <View style={styles.bottomPriceBox}>
          <Text style={styles.bottomPrice}>₹{product.price}</Text>
          {product.originalPrice && product.originalPrice > product.price && (
            <Text style={styles.bottomOriginalPrice}>₹{product.originalPrice}</Text>
          )}
        </View>
        
        <TouchableOpacity style={styles.buyBtn} onPress={addToCart} activeOpacity={0.8}>
          <Text style={styles.buyBtnText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>

      {/* 🚀 FLYING ANIMATION VIEW */}
      {isAnimating && (
        <Animated.View
          style={[
            styles.flyingElement,
            {
              opacity: opacityAnim,
              transform: [
                { translateX: moveAnim.x },
                { translateY: moveAnim.y },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          <Image source={{ uri: productImages[0] }} style={{width: '100%', height: '100%'}} resizeMode="contain" />
        </Animated.View>
      )}

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  
  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  backBtnWrapper: { flexDirection: 'row', alignItems: 'center' },
  backBtnText: { fontSize: 13, fontWeight: '700', color: '#64748B', marginLeft: 8, letterSpacing: 0.5 },
  cartIconWrapper: { position: 'relative', padding: 5 },
  cartBadge: { position: 'absolute', top: -2, right: -2, backgroundColor: '#EF4444', width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FFF' },
  cartBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '900' },

  // Main Image Card
  mainImageCard: { backgroundColor: '#F8F9FA', margin: 15, borderRadius: 30, height: width * 0.9, position: 'relative', justifyContent: 'center', alignItems: 'center' },
  cardOverlays: { position: 'absolute', top: 20, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 10 },
  categoryPillTop: { backgroundColor: '#FFFFFF', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  categoryPillTopText: { fontSize: 11, fontWeight: '800', color: '#F97316', textTransform: 'uppercase', letterSpacing: 0.5 },
  shareBtn: { backgroundColor: '#FFFFFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  mainImage: { width: '80%', height: '80%' },

  // Thumbnails
  thumbnailsContainer: { paddingHorizontal: 15, paddingBottom: 20, gap: 12 },
  thumbnailWrapper: { width: 70, height: 70, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#F1F5F9', overflow: 'hidden' },
  thumbnailActive: { borderColor: '#F97316' },
  thumbnailImg: { width: '80%', height: '80%' },

  // Details
  detailsBox: { paddingHorizontal: 20, paddingTop: 10 },
  pillsRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 10 },
  accentPill: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  accentPillText: { fontSize: 11, fontWeight: '800', color: '#F97316', textTransform: 'uppercase', letterSpacing: 0.5 },
  accentPillTextDark: { fontSize: 11, fontWeight: '800', color: '#475569', letterSpacing: 0.5 },
  dealPill: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 10 },
  dealPillText: { fontSize: 11, fontWeight: '800', color: '#F97316', letterSpacing: 0.5 },

  productTitle: { fontSize: 28, fontWeight: '700', color: '#1E293B', marginBottom: 15, lineHeight: 34 },
  
  // Highlights Card
  highlightsCard: { backgroundColor: '#F8F9FA', borderRadius: 24, padding: 20, marginTop: 15 },
  highlightsHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  highlightsTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  discountPillSmall: { backgroundColor: '#FFF7ED', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  discountPillTextSmall: { color: '#F97316', fontSize: 10, fontWeight: '800' },
  
  highlightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 15 },
  highlightIconBox: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#F1F5F9' },
  highlightTextBox: { flex: 1, justifyContent: 'center', paddingTop: 2 },
  highlightText: { fontSize: 14, color: '#475569', lineHeight: 22, fontWeight: '500' },

  // Bottom Action Bar
  bottomActionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', flexDirection: 'row', paddingHorizontal: 20, paddingTop: 15, paddingBottom: Platform.OS === 'ios' ? 35 : 20, borderTopWidth: 1, borderColor: '#F1F5F9', alignItems: 'center', justifyContent: 'space-between' },
  bottomPriceBox: { flex: 1 },
  bottomPrice: { fontSize: 24, fontWeight: '800', color: '#1E293B' },
  bottomOriginalPrice: { fontSize: 14, color: '#94A3B8', textDecorationLine: 'line-through', marginTop: 2 },
  buyBtn: { backgroundColor: '#F97316', paddingHorizontal: 35, paddingVertical: 15, borderRadius: 14 },
  buyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },

  // Recommendations
  recSection: { marginTop: 30, paddingTop: 20, borderTopWidth: 1, borderColor: '#F1F5F9' },
  recSectionTitle: { fontSize: 18, fontWeight: '800', color: '#1E293B', marginBottom: 15 },
  recList: { gap: 15, paddingBottom: 10 },
  recCard: { width: 140, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#F1F5F9', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  recImgBox: { width: '100%', height: 100, backgroundColor: '#F8F9FA', borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  recImg: { width: '80%', height: '80%' },
  recName: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 4, lineHeight: 18 },
  recPrice: { fontSize: 15, fontWeight: '800', color: '#F97316' },

  // Animation
  flyingElement: { position: 'absolute', width: 60, height: 60, backgroundColor: '#FFF', borderRadius: 12, padding: 5, zIndex: 1000, elevation: 1000, borderWidth: 1, borderColor: '#E2E8F0' }
});