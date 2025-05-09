import React from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { lightTheme } from './src/theme/theme';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <View style={styles.container}>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: lightTheme.colors.background,
              },
              headerTintColor: lightTheme.colors.text,
            }}
          >
            {/* Здесь будут ваши экраны */}
          </Stack.Navigator>
        </View>
      </NavigationContainer>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: lightTheme.colors.background,
    flex: 1,
  },
});

export default App;
