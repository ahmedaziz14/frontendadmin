import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function UsersScreen({ route }) {
  const [users, setUsers] = useState([]);
  const [searchKey, setSearchKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sortByName, setSortByName] = useState(false);
  const [token, setToken] = useState(null);
  const navigation = useNavigation();

  // Récupérer le token depuis AsyncStorage
  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('adminToken');
        if (storedToken) {
          setToken(storedToken);
        } else {
          Alert.alert('Error', 'No token found, please login again.');
          navigation.replace('SignInScreen');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
        Alert.alert('Error', 'Failed to retrieve token.');
        navigation.replace('SignInScreen');
      }
    };
    getToken();
  }, [navigation]);

  // Récupérer tous les utilisateurs
  const fetchAllUsers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch('http://192.168.1.7:3001/api/users', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        let userList = data.users || [];
        if (sortByName) {
          userList = userList.sort((a, b) => a.name.localeCompare(b.name));
        }
        setUsers(userList);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch users.');
        setUsers([]);
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to connect to the server.');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Récupérer un utilisateur par clé produit
  const fetchUserByProductKey = async (productKey) => {
    if (!token) return null;
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.1.7:3001/api/user/product/${productKey}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        return data.user;
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch user.');
        return null;
      }
    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to connect to the server.');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un utilisateur
  const deleteUser = async (productKey) => {
    if (!token) return;
    setLoading(true);
    try {
      const response = await fetch(`http://192.168.1.7:3001/api/user/product/${productKey}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter((user) => user.product_key !== productKey));
        Alert.alert('Success', 'User deleted successfully!');
        setSelectedUser(null);
      } else {
        Alert.alert('Error', data.error || 'Failed to delete user.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  // Charger les utilisateurs au démarrage
  useEffect(() => {
    if (token) fetchAllUsers();
  }, [token]);

  // Gérer la recherche
  const handleSearch = async () => {
    if (!searchKey.trim()) {
      fetchAllUsers();
      return;
    }
    const user = await fetchUserByProductKey(searchKey);
    if (user) {
      setUsers([user]);
    } else {
      setUsers([]);
    }
  };

  // Gérer la suppression
  const handleDelete = (productKey, userName) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteUser(productKey),
        },
      ]
    );
  };

  // Gérer le tri par nom
  const toggleSort = () => {
    setSortByName(!sortByName);
    setUsers((prevUsers) =>
      [...prevUsers].sort((a, b) =>
        sortByName ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
      )
    );
  };

  // Naviguer vers ProductScreen
  const handleAddProduct = () => {
    navigation.navigate('ProductScreen'); // Assurez-vous que 'ProductScreen' est enregistré dans votre navigation
  };

  // Afficher un utilisateur
  const renderUserItem = ({ item }) => (
    <View style={styles.userContainer}>
      <TouchableOpacity
        style={styles.userInfoContainer}
        onPress={() => setSelectedUser(item)}
      >
        <Image
          source={{ uri: item.profile_picture || 'https://via.placeholder.com/50' }}
          style={styles.avatar}
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name || 'No name'}</Text>
          <Text style={styles.userDetails}>{item.interest || 'No interests'}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate('ChatScreen', {
          user_id: item.id,
          user_name: item.name,
          product_key: item.product_key,
          token,
        })}
      >
        <Text style={styles.chatButtonText}>Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDelete(item.product_key, item.name)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <LinearGradient
      colors={['#FF9A9E', '#FAD0C4', '#A18CD1', '#FBC2EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>User Management</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="Search by Product Key"
          placeholderTextColor="#666"
          value={searchKey}
          onChangeText={setSearchKey}
        />
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.6 }]}
            disabled={loading}
            onPress={handleSearch}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Search</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.refreshButton, loading && { opacity: 0.6 }]}
            disabled={loading}
            onPress={fetchAllUsers}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.refreshButtonText}>Refresh</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
          <Text style={styles.sortButtonText}>
            {sortByName ? 'Unsort' : 'Sort by Name'}
          </Text>
        </TouchableOpacity>

        {loading && !users.length ? (
          <ActivityIndicator size="large" color="#4caf50" style={styles.loading} />
        ) : users.length === 0 ? (
          <Text style={styles.emptyText}>No users found</Text>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshing={loading}
            onRefresh={fetchAllUsers}
          />
        )}

        {/* Bouton flottant "Plus" */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleAddProduct}
        >
          <Text style={styles.fabText}>+</Text>
        </TouchableOpacity>

        {selectedUser && (
          <Modal
            animationType="slide"
            transparent={true}
            visible={!!selectedUser}
            onRequestClose={() => setSelectedUser(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Image
                  source={{ uri: selectedUser.profile_picture || 'https://via.placeholder.com/100' }}
                  style={styles.modalAvatar}
                />
                <Text style={styles.modalTitle}>{selectedUser.name}</Text>
                <Text style={styles.modalText}>Interest: {selectedUser.interest || 'N/A'}</Text>
                <Text style={styles.modalText}>More Info: {selectedUser.more_info || 'N/A'}</Text>
                <Text style={styles.modalText}>Product Key: {selectedUser.product_key || 'N/A'}</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setSelectedUser(null)}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  innerContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4caf50',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    flex: 1,
    marginRight: 10,
  },
  refreshButton: {
    backgroundColor: '#2196F3',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 5,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sortButton: {
    backgroundColor: '#FF9800',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  sortButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    paddingBottom: 20,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  userDetails: {
    fontSize: 14,
    color: '#666',
  },
  chatButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 10,
  },
  chatButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loading: {
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 18,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    width: '80%',
  },
  modalAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#4caf50',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4caf50',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
  fabText: {
    fontSize: 30,
    color: '#fff',
    fontWeight: 'bold',
  },
});