import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient'; // Importer LinearGradient

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('GetStarted');
    }, 3000);

    return () => clearTimeout(timer); // Cleanup timer
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FF9A9E', '#FAD0C4', '#A18CD1', '#FBC2EB']} // Même dégradé que GetStartedScreen
        start={{ x: 0, y: 0 }} // Direction du dégradé (haut à gauche)
        end={{ x: 1, y: 1 }} // Direction du dégradé (bas à droite)
        style={styles.background}
      >
        <LottieView
          source={require('./img/splash.json')} // Chemin vers votre animation
          autoPlay
          loop={false}
          style={styles.animation}
        />
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 300,
    height: 300,
  },
});