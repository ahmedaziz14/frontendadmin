import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function GetStartedScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF9A9E', '#FAD0C4', '#A18CD1', '#FBC2EB']} // Nouveau dégradé avec rose et violet
        start={{ x: 0, y: 0 }} // Point de départ du dégradé (haut à gauche)
        end={{ x: 1, y: 1 }} // Point d'arrivée du dégradé (bas à droite)
        style={styles.background}
      >
        <LottieView
          source={require('./img/admin.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.title}>Welcome to CarApp</Text>
        <Text style={styles.subtitle}>
          Unlock the future with your car in one tap.
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('SignInScreen')}
        >
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lottie: {
    width: 300,
    height: 300,
  },
  title: {
    fontSize: 32,
    color: '#ffffff',
    fontWeight: 'bold',
    marginTop: 20,
  },
  subtitle: {
    fontSize: 18,
    color: '#d1d1d1',
    textAlign: 'center',
    marginHorizontal: 40,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF6F61',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    shadowColor: '#FF6F61',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});