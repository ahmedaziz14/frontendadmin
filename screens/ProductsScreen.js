import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LottieView from 'lottie-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

export default function ProductScreen() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [token, setToken] = useState(null);
  const navigation = useNavigation();

  // Récupérer le token depuis AsyncStorage au montage
  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('adminToken');
        if (storedToken) {
          setToken(storedToken);
          console.log('Token récupéré dans ProductScreen:', storedToken);
        } else {
          Alert.alert('Erreur', 'Aucun token trouvé, veuillez vous reconnecter.');
          navigation.replace('SignInScreen');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du token:', error);
        Alert.alert('Erreur', 'Échec de la récupération du token.');
        navigation.replace('SignInScreen');
      }
    };
    getToken();
  }, [navigation]);

  // Fonction pour ajouter une clé de produit (générée par le backend)
  const handleAddProductKey = async () => {
    if (!token) {
      Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
      navigation.replace('SignInScreen');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.7:3001/products/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        // Pas de body avec product_key, le backend le génère
      });

      const data = await response.json();

      if (response.ok) {
        fetchProducts();
        Alert.alert('Succès', 'Clé de produit ajoutée avec succès !');
      } else {
        Alert.alert('Erreur', data.error || 'Échec de l\'ajout de la clé de produit.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit:', error.message);
      Alert.alert('Erreur', 'Problème de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer les produits
  const fetchProducts = async () => {
    if (!token) {
      Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
      navigation.replace('SignInScreen');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://192.168.1.7:3001/products/all', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProducts(data.products || []);
      } else {
        Alert.alert('Erreur', data.error || 'Échec de la récupération des produits.');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error.message);
      Alert.alert('Erreur', 'Problème de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer une clé de produit
  const handleDeleteProduct = async (productKey) => {
    if (!token) {
      Alert.alert('Erreur', 'Token manquant. Veuillez vous reconnecter.');
      navigation.replace('SignInScreen');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`http://192.168.1.7:3001/products/${productKey}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        fetchProducts();
        Alert.alert('Succès', 'Clé de produit supprimée avec succès !');
      } else {
        Alert.alert('Erreur', data.error || 'Échec de la suppression de la clé de produit.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error.message);
      Alert.alert('Erreur', 'Problème de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les produits une fois que le token est disponible
  useEffect(() => {
    if (token) fetchProducts();
  }, [token]);

  return (
    <LinearGradient
      colors={['#FF9A9E', '#FAD0C4', '#A18CD1', '#FBC2EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <View style={styles.container}>
        <LottieView
          source={require('./img/products.json')}
          autoPlay
          loop
          style={styles.lottie}
        />
        <Text style={styles.title}>Gestion des Produits</Text>

        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          disabled={loading}
          onPress={handleAddProductKey}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Chargement...' : 'Ajouter une clé '}
          </Text>
        </TouchableOpacity>

        <FlatList
          data={products}
          keyExtractor={(item) => item.product_key}
          renderItem={({ item }) => (
            <View style={styles.productItem}>
              <Text style={styles.productText}>{item.product_key}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDeleteProduct(item.product_key)}
              >
                <Text style={styles.deleteButtonText}>Supprimer</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.productList}
        />
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
    padding: 20,
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
  button: {
    width: '80%',
    backgroundColor: '#FF6F61',
    padding: 15,
    borderRadius: 50,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  productList: {
    width: '100%',
    marginTop: 20,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 15,
    marginVertical: 5,
  },
  productText: {
    color: '#fff',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
  },
});