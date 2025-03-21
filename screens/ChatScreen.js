import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { io } from 'socket.io-client';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import Icon from 'react-native-vector-icons/MaterialIcons';

export default function ChatScreen({ route }) {
  const navigation = useNavigation();
  const { user_id, user_name, product_key, token: paramToken } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [token, setToken] = useState(null);
  const [sound, setSound] = useState(null);

  const playMessageSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require('../assets/notification-2-269292.mp3')
      );
      setSound(sound);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  useEffect(() => {
    const initializeToken = async () => {
      try {
        if (paramToken) {
          setToken(paramToken);
        } else {
          const storedToken = await AsyncStorage.getItem('adminToken');
          if (storedToken) {
            setToken(storedToken);
          } else {
            Alert.alert('Error', 'No token found, please log in again.');
            navigation.replace('SignInScreen');
          }
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
        Alert.alert('Error', 'Failed to retrieve token.');
        navigation.replace('SignInScreen');
      }
    };
    initializeToken();
  }, [paramToken, navigation]);

  useEffect(() => {
    if (!token || !product_key) return;

    const newSocket = io('http://192.168.1.7:3001', { auth: { token } });
    newSocket.on('connect', () => console.log('Connected to WebSocket'));
    newSocket.on('connect_error', (err) => Alert.alert('Connection Error', 'Failed to connect'));
    newSocket.on('receiveMessage', (message) => {
      setMessages((prev) => [...prev, message]);
      playMessageSound();
    });
    setSocket(newSocket);

    const fetchChatHistory = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://192.168.1.7:3001/chat/history?product_key=${product_key}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setMessages(data.messages || []);
        } else {
          Alert.alert('Error', data.error || 'Failed to fetch chat history');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error while fetching chat history');
      } finally {
        setLoading(false);
      }
    };
    fetchChatHistory();

    return () => {
      newSocket.disconnect();
      if (sound) sound.unloadAsync();
    };
  }, [token, product_key]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !product_key) return;
    try {
      const response = await fetch('http://192.168.1.7:3001/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ product_key, message: newMessage }),
      });
      const data = await response.json();
      if (response.ok) {
        setNewMessage('');
        playMessageSound();
      } else {
        Alert.alert('Error', data.error || 'Failed to send message');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the server');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat with {user_name || 'User'}</Text>
      <FlatList data={messages} renderItem={({ item }) => (
        <View style={item.is_admin ? styles.adminMessage : styles.userMessage}>
          <Text style={styles.messageText}>{item.message}</Text>
        </View>
      )} keyExtractor={(item) => item.created_at} />
      <View style={styles.inputContainer}>
        <TextInput style={styles.input} placeholder="Type a message" value={newMessage} onChangeText={setNewMessage} />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  inputContainer: { flexDirection: 'row', marginTop: 10 },
  input: { flex: 1, padding: 10, borderWidth: 1, borderRadius: 10, backgroundColor: '#fff' },
  sendButton: { backgroundColor: '#4caf50', padding: 15, borderRadius: 10 },
  sendButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  userMessage: { alignSelf: 'flex-start', padding: 10, backgroundColor: '#ddd', borderRadius: 8, marginBottom: 10 },
  adminMessage: { alignSelf: 'flex-end', padding: 10, backgroundColor: '#4caf50', borderRadius: 8, marginBottom: 10 },
  messageText: { fontSize: 16, color: '#fff' },
});
