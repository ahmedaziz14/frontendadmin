import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import UsersScreen from './UserScreen';
import SignInScreen from './loginScreen';
import SignUpScreen from './SignupScreen';
import ChatScreen from './ChatScreen';
import SplashScreen from './SplashScreen';
import GetStartedScreen from './GetStartedScreen';
import ProductScreen from './ProductsScreen' ; 
const Stack = createStackNavigator();

export default function Navigation() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash" // Set SplashScreen as the first screen
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />        
        <Stack.Screen name="SignInScreen" component={SignInScreen} />
        <Stack.Screen name="UsersScreen" component={UsersScreen} />
        <Stack.Screen name="ChatScreen" component={ChatScreen} />
        <Stack.Screen name="ProductScreen" component={ProductScreen} />
        
                   

      </Stack.Navigator>
    </NavigationContainer>
  );
}
