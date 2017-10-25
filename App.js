/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';
import { AsyncStorage } from 'react-native';


const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' +
  'Cmd+D or shake for dev menu',
  android: 'Double tap R on your keyboard to reload,\n' +
  'Shake or press menu button for dev menu',
});

export default class App extends Component<{}> {
 async pone() {
   console.log('pone')
    await AsyncStorage.setItem('endpoint-arn', 'bla')
  }

  async registerWithSNS() {
    let enpointArn = await this.retrieveEndPointArn();
    console.log('enpointArn', enpointArn)
  }

  async retrieveEndPointArn() {
    await AsyncStorage.getItem('endpoint-arn');
  }

  
  render() {
    return (
      <View style={styles.container} >
        <Text style={styles.welcome}>
          Welcome to React Native!
        </Text>
        <Text style={styles.instructions}>
          To get started, edit App.js
        </Text>
        <Text style={styles.instructions}>
          {instructions}
        </Text>
        <Button title="prueba" onPress={this.registerWithSNS.bind(this)} />
        <Button title="pone" onPress={this.pone.bind(this)} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});
