import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Importer LinearGradient

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide.');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.7:3001/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        Alert.alert('Succès', 'Inscription réussie !');
        navigation.navigate('SignInScreen');
      } else {
        Alert.alert('Erreur', data.error || 'Problème d\'inscription.');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Erreur', 'Problème de connexion au serveur.');
    }
  };

  return (
    <LinearGradient
      colors={['#FF9A9E', '#FAD0C4', '#A18CD1', '#FBC2EB']} // Même dégradé que les autres écrans
      start={{ x: 0, y: 0 }} // Direction du dégradé (haut à gauche)
      end={{ x: 1, y: 1 }} // Direction du dégradé (bas à droite)
      style={styles.background}
    >
      <View style={styles.container}>
        <LottieView
          source={require('./img/signup.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.title}>Inscription Admin</Text>
        <TextInput
          style={[styles.input, email && styles.activeInput]}
          placeholder="Email"
          placeholderTextColor="#aaa"
          onChangeText={setEmail}
          value={email}
        />
        <TextInput
          style={[styles.input, password && styles.activeInput]}
          placeholder="Mot de passe"
          placeholderTextColor="#aaa"
          secureTextEntry
          onChangeText={setPassword}
          value={password}
        />
        <TextInput
          style={[styles.input, confirmPassword && styles.activeInput]}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor="#aaa"
          secureTextEntry
          onChangeText={setConfirmPassword}
          value={confirmPassword}
        />
        <TouchableOpacity
          style={[
            styles.button,
            email && password && confirmPassword && isValidEmail(email) && password === confirmPassword
              ? styles.activeButton
              : { opacity: 0.6 },
          ]}
          disabled={loading || !email || !password || !confirmPassword || !isValidEmail(email) || password !== confirmPassword}
          onPress={handleSignUp}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Chargement...' : 'S\'inscrire'}
          </Text>
        </TouchableOpacity>
        <Text
          style={styles.link}
          onPress={() => navigation.navigate('SignInScreen')}
        >
          Déjà un compte ? Connectez-vous
        </Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  lottie: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    color: '#fff',
    marginBottom: 20,
  },
  input: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)', // Fond semi-transparent pour mieux voir le dégradé
    borderRadius: 8,
    padding: 15,
    color: '#fff',
    marginVertical: 10,
    fontSize: 16,
  },
  activeInput: {
    borderColor: '#FF6F61',
    borderWidth: 1,
  },
  button: {
    width: '80%',
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 50,
    marginVertical: 10,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activeButton: {
    backgroundColor: '#FF6F61',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  link: {
    color: '#FF6F61',
    marginTop: 10,
    textDecorationLine: 'underline',
  },
});