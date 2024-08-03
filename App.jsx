import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StyleSheet } from 'react-native';
import Router from './src/routes/Router';
import { apiConstant } from './constants/apiConstant';

const App = () => {
  const ws = new WebSocket(`ws://${apiConstant.ip}`);
  return (
    <NavigationContainer>
      <Router />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
});

export default App;
