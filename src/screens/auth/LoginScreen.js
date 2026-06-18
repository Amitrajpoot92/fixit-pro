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
import { auth } from '../../services/firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Please enter both email and password");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Login failed. Please check your credentials.");
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
          </View>

          <View style={styles.bottomSheet}>
            <View style={styles.formContainer}>
              
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="test@gmail.com"
                placeholderTextColor="#9CA3AF"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="@admin123"
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.iconContainer}>
                  <MaterialIcons name={showPassword ? 'visibility' : 'visibility-off'} size={22} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
                {loading ? <ActivityIndicator color="#000000" /> : <Text style={styles.loginButtonText}>Login</Text>}
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
  safeArea: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { flex: 1 },
  abstractCurve: {
    position: 'absolute',
    top: -100,
    right: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#FFB800',
    opacity: 0.15,
  },
  scrollContainer: { flexGrow: 1, justifyContent: 'space-between' },
  graphicContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 20 },
  heroImage: { width: 220, height: 220, borderRadius: 110, borderWidth: 3, borderColor: '#fff' },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 50,
    // 🚀 FIX: shadow props ko hata kar Platform select use kiya
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.05, shadowRadius: 15 },
      android: { elevation: 10 },
      web: { boxShadow: '0px -5px 15px rgba(0, 0, 0, 0.05)' }
    })
  },
  label: { fontSize: 13, color: '#111827', marginBottom: 8, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8, marginLeft: 4 },
  input: { backgroundColor: '#F9FAFB', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, marginBottom: 24, color: '#111827', fontSize: 16, fontWeight: '600' },
  passwordContainer: { 
    backgroundColor: '#F9FAFB', 
    borderRadius: 16, 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    marginBottom: 24 
  },
  passwordInput: { 
    flex: 1, 
    paddingVertical: 18, 
    color: '#111827', 
    fontSize: 16, 
    fontWeight: '600' 
  },
  iconContainer: { padding: 5 },
  loginButton: { backgroundColor: '#FFB800', borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 8, justifyContent: 'center', elevation: 5 },
  loginButtonText: { color: '#000000', fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  signupContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  signupText: { color: '#6B7280', fontSize: 15, fontWeight: '500' },
  signupLink: { color: '#111827', fontSize: 15, fontWeight: '800', marginLeft: 4 }
});