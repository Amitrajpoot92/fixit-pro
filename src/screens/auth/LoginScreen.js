// src/screens/auth/LoginScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 
import { auth, db } from '../../services/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { colors } from '../../theme/colors'; 

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 🧹 Clean inputs before processing
    const cleanEmail = email.trim();
    
    if (!cleanEmail || !password) {
      alert("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Firebase Auth se login karo
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      
      setLoading(false);
      
      // 🚀 YAHAN HAI FIX: Login hone ke baad wapas pichli screen par bhejo!
      if (navigation.canGoBack()) {
        navigation.goBack(); // Profile se aaya tha toh wapas profile par
      } else {
        navigation.navigate('MainTabs'); // Safe side ke liye
      }

    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found') {
        alert("Invalid Email or Password.");
      } else {
        alert("Login failed. Please try again.");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        <View style={styles.abstractCurve} />

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.graphicContainer}>
            <Image 
              source={require('../../../assets/platform-img/logo.jpeg')} 
              style={styles.heroImage}
              resizeMode="contain"
            />
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.subtitleText}>Login to book your service</Text>
          </View>

          <View style={styles.bottomSheet}>
            <View style={styles.formContainer}>
              
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="test@gmail.com"
                placeholderTextColor={colors.textLight}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
                  <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={22} color={colors.textLight} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.loginButtonText}>Login Securely</Text>}
              </TouchableOpacity>

              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                  <Text style={styles.signupLink}>Create Now</Text>
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1 },
  abstractCurve: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.accent,
    opacity: 0.15,
  },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between' },
  graphicContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 50, paddingBottom: 20 },
  heroImage: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, borderColor: '#fff', marginBottom: 15 },
  welcomeText: { fontSize: 28, fontWeight: '900', color: colors.primary, marginBottom: 4 },
  subtitleText: { fontSize: 14, color: colors.textDark, fontWeight: '500' },
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 50,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 15 },
      android: { elevation: 10 },
      web: { boxShadow: '0px -5px 15px rgba(0, 0, 0, 0.05)' }
    })
  },
  label: { fontSize: 13, color: colors.textDark, marginBottom: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 4 },
  input: { backgroundColor: colors.inputBg, borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, marginBottom: 20, color: colors.textDark, fontSize: 16, fontWeight: '600' },
  passwordContainer: { 
    backgroundColor: colors.inputBg, 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 24,
    height: 60
  },
  passwordInput: { flex: 1, height: '100%', color: colors.textDark, fontSize: 16, fontWeight: '600' },
  iconContainer: { padding: 5, marginLeft: 10 },
  loginButton: { backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10, justifyContent: 'center', elevation: 5 },
  loginButtonText: { color: colors.primary, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  signupText: { color: colors.textLight, fontSize: 15, fontWeight: '500' },
  signupLink: { color: colors.textDark, fontSize: 15, fontWeight: '800', marginLeft: 4 }
});