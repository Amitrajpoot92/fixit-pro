import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, 
  Image, Platform, StatusBar, Alert, FlatList, Dimensions, Animated 
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, increment, onSnapshot } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';

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
    const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />
      
      {/* 🟢 HEADER WITH LIVE CART BADGE */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.navigate('CartScreen')}>
          <MaterialIcons name="shopping-cart" size={22} color="#0F172A" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* 🚀 IMAGE CAROUSEL SECTION */}
        <View style={styles.imageBox}>
          <FlatList
            ref={flatListRef}
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onMomentumScrollEnd}
            keyExtractor={(_, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width: width, justifyContent: 'center', alignItems: 'center' }}>
                <Image source={{ uri: item }} style={styles.mainImage} resizeMode="contain" />
              </View>
            )}
          />

          {/* Carousel Navigation Arrows */}
          {productImages.length > 1 && (
            <>
              {currentImageIndex > 0 && (
                <TouchableOpacity style={[styles.arrowBtn, { left: 15 }]} onPress={scrollLeft}>
                  <Ionicons name="chevron-back" size={24} color="#0F172A" />
                </TouchableOpacity>
              )}
              {currentImageIndex < productImages.length - 1 && (
                <TouchableOpacity style={[styles.arrowBtn, { right: 15 }]} onPress={scrollRight}>
                  <Ionicons name="chevron-forward" size={24} color="#0F172A" />
                </TouchableOpacity>
              )}
              
              {/* Dots */}
              <View style={styles.dotsContainer}>
                {productImages.map((_, idx) => (
                  <View key={idx} style={[styles.dot, currentImageIndex === idx && styles.activeDot]} />
                ))}
              </View>
            </>
          )}
        </View>

        {/* 🟢 DETAILS SECTION */}
        <View style={styles.detailsBox}>
          <Text style={styles.categoryText}>{product.category}</Text>
          <Text style={styles.productTitle}>{product.name}</Text>
          <Text style={styles.priceText}>₹{product.price}</Text>
          {product.originalPrice && <Text style={styles.originalPrice}>M.R.P: <Text style={{textDecorationLine: 'line-through'}}>₹{product.originalPrice}</Text></Text>}
          
          <View style={styles.divider} />
          
          <Text style={{fontSize: 16, fontWeight: '800', marginBottom: 10}}>Description</Text>
          <Text style={{fontSize: 14, color: '#64748B', lineHeight: 22}}>{product.description}</Text>
        </View>
      </ScrollView>

      {/* 🟢 BOTTOM ACTION BAR */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={{fontSize: 12, color: '#64748B', fontWeight: '600'}}>Total Price</Text>
          <Text style={{fontSize: 22, fontWeight: '900', color: '#0F172A'}}>₹{product.price}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={addToCart} activeOpacity={0.8}>
          <MaterialIcons name="add-shopping-cart" size={20} color="#FFF" />
          <Text style={{color: '#FFF', fontWeight: '800', fontSize: 16}}>Add to Cart</Text>
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
  container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, position: 'absolute', top: Platform.OS === 'android' ? StatusBar.currentHeight : 0, left: 0, right: 0, zIndex: 10 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  
  cartBadge: { position: 'absolute', top: -4, right: -4, backgroundColor: '#EF4444', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  cartBadgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },

  imageBox: { height: 400, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  mainImage: { width: '70%', height: '70%' },
  
  arrowBtn: { position: 'absolute', top: '45%', width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 5 },
  dotsContainer: { position: 'absolute', bottom: 30, flexDirection: 'row', justifyContent: 'center', width: '100%' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#CBD5E1', marginHorizontal: 4 },
  activeDot: { backgroundColor: colors.link, width: 20 },

  detailsBox: { padding: 25, backgroundColor: '#FFF', borderTopLeftRadius: 35, borderTopRightRadius: 35, marginTop: -25 },
  categoryText: { fontSize: 12, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 6 },
  productTitle: { fontSize: 24, fontWeight: '900', color: '#0F172A', marginBottom: 12, lineHeight: 30 },
  priceText: { fontSize: 28, fontWeight: '900', color: colors.link },
  originalPrice: { fontSize: 14, color: '#94A3B8', fontWeight: '600', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#E2E8F0', marginVertical: 20 },
  
  bottomBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', flexDirection: 'row', padding: 20, borderTopWidth: 1, borderColor: '#E2E8F0', justifyContent: 'space-between', alignItems: 'center', paddingBottom: Platform.OS === 'ios' ? 35 : 20 },
  addToCartBtn: { backgroundColor: colors.link, flexDirection: 'row', paddingVertical: 16, paddingHorizontal: 30, borderRadius: 16, gap: 8, elevation: 4, shadowColor: colors.link, shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8 },

  // Animation Styles
  flyingElement: { position: 'absolute', width: 60, height: 60, backgroundColor: '#FFF', borderRadius: 12, padding: 5, zIndex: 1000, elevation: 1000, borderWidth: 1, borderColor: '#E2E8F0' }
});