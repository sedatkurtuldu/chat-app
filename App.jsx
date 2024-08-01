import { NavigationContainer } from '@react-navigation/native';
import React, {  } from 'react';
import { StyleSheet } from 'react-native';
import Router from './src/routes/Router';

const App = () => {
  return (
    <NavigationContainer>
      <Router />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
});

export default App;
