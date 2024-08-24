import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import Router from './src/routes/Router';
import { StatusBar } from 'expo-status-bar';

const App = () => {
  return (
    <NavigationContainer>
      <StatusBar 
        barStyle="dark-content"
        backgroundColor="#8285f1"
      />
      <Router />
    </NavigationContainer>
  );
};

export default App;
