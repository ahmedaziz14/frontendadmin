import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View } from 'react-native';
import Navigation from './screens/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        { <Navigation/> }
       
      </View>
    </GestureHandlerRootView>
  );
}

