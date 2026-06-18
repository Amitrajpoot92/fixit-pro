// src/screens/auth/RegisterScreen.js
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
// PATH FIX: 2 level upar se import
import { auth, db } from '../../services/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { colors } from '../../theme/colors';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !mobile || !email || !password) {
      alert("Please fill all details"); 
      return;
    }
    if (mobile.length !== 10) {
      alert("Please enter a valid 10 digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        mobile: mobile,
        email: email,
        role: "customer",
        createdAt: new Date().toISOString()
      });

      setLoading(false);
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/email-already-in-use') {
        alert("This email is already registered");
      } else if (error.code === 'auth/weak-password') {
        alert("Password should be at least 6 characters");
      } else {
        alert("Error: Something went wrong");
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        
        {/* Abstract Visual Curve for consistency */}
        <View style={styles.abstractCurve} />

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join FixitPro for expert repairs.</Text>
          </View>

          <View style={styles.bottomSheet}>
            <View style={styles.formContainer}>
              
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.input}
                placeholder="John Doe"
                placeholderTextColor={colors.textLight}
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.label}>Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="9876543210"
                placeholderTextColor={colors.textLight}
                value={mobile}
                onChangeText={setMobile}
                keyboardType="numeric"
                maxLength={10}
              />

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

              <TouchableOpacity style={styles.registerButton} onPress={handleRegister} disabled={loading}>
                {loading ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.registerButtonText}>Register Now</Text>}
              </TouchableOpacity>

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Text style={styles.loginLink}>Login Here</Text>
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
  headerContainer: { alignItems: 'flex-start', justifyContent: 'center', paddingTop: 80, paddingBottom: 20, paddingHorizontal: 28 },
  title: { fontSize: 36, fontWeight: '900', color: colors.primary, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textLight, fontWeight: '500' },
  
  bottomSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 50,
    marginTop: 10,
    // 🚀 FIX: shadow props ko hata kar Platform select use kiya
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
  
  registerButton: { backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 18, alignItems: 'center', marginTop: 10, justifyContent: 'center', elevation: 5 },
  registerButtonText: { color: colors.primary, fontSize: 18, fontWeight: '900', letterSpacing: 0.5 },
  
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  loginText: { color: colors.textLight, fontSize: 15, fontWeight: '500' },
  loginLink: { color: colors.textDark, fontSize: 15, fontWeight: '800', marginLeft: 4 }
});