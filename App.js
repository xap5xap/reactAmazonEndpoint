/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
// import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import AWS from 'aws-sdk';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';
import { AsyncStorage } from 'react-native';
import PushNotification from 'react-native-push-notification'
import { CognitoUserPool, CognitoUserAttribute, CognitoUser, AuthenticationDetails } from 'react-native-aws-cognito-js';



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

  async borra() {
    console.log('borra')
    await AsyncStorage.removeItem('endpoint-arn')
  }

  createEndpoint(token) {
    endpointArn = null;
    console.log('create endpint')
    let sns = new AWS.SNS();
    var params = {
      PlatformApplicationArn: 'arn:aws:sns:us-east-1:099190213557:app/GCM/kowalaTest',
      Token: token,
      CustomUserData: 'STRING_VALUE2'
    };
    sns.createPlatformEndpoint(params, function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
      }
      else console.log('data', data);           // successful response
    });

  }

  async registerWithSNS(token) {
    console.log('registerWithSNS - TOKEN 2:', token);
    let endpointArn = await this.retrieveEndPointArn();
    console.log('endpointArn', endpointArn)
    let updateNeeded = false;
    let createNeeded = !endpointArn;

    console.log('createNeeded', createNeeded)
    if (createNeeded) {
      // No platform endpoint ARN is stored; need to call createEndpoint.
      endpointArn = await this.createEndpoint(token.token);
      createNeeded = false;
    }
  }

  async retrieveEndPointArn() {
    return await AsyncStorage.getItem('endpoint-arn');
  }

  getCognitoCredentials(session) {
    const loginCred = `cognito-idp.us-east-1.amazonaws.com/us-east-1_qIXIWe28m`;

    const cognitoParams = {
      IdentityPoolId: 'us-east-1:a6817977-bd37-4b78-bf5c-d234bce319e5',
      Logins: {
        [loginCred]: session.getIdToken().getJwtToken(),
      },
    };

    return new AWS.CognitoIdentityCredentials(cognitoParams);
  };

  setCredentials(credentials) {
    return new Promise((resolve, reject) => {
      AWS.config.credentials = credentials;

      AWS.config.credentials.get((error) => {
        if (error) {
          console.log('ocurrio error')
          console.error(error);
          reject(error);
          return;
        }

        const { accessKeyId, secretAccessKey, sessionToken } = AWS.config.credentials;
        const awsCredentials = {
          accessKeyId,
          secretAccessKey,
          sessionToken,
        };
        AsyncStorage.setItem('awsCredentials', JSON.stringify(awsCredentials));
        console.log('setCredentials resolve', awsCredentials)
        resolve(awsCredentials);
      });
    });
  };

  signIn() {
    return new Promise((resolve, reject) => {
      console.log('Signin')
      let userPool = new CognitoUserPool({
        UserPoolId: 'us-east-1_qIXIWe28m',
        ClientId: '5up7imaricrh14a2i0qmiu6dv9'
      })
      let username = 'xap5xap@gmail.com'

      const authenticationDetails = new AuthenticationDetails({
        Username: username,
        Password: 'Pa$$w0rd'
      });
      const cognitoUser = new CognitoUser({
        Username: username,
        Pool: userPool
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (session) => {
          console.log('onSuccess', session)
          AsyncStorage.setItem('currSession', JSON.stringify(session))
          // AWS.config.credentials = this.getCognitoCredentials(session);
          await this.setCredentials(this.getCognitoCredentials(session));
          console.log('va a reolver')
          resolve()
        },

        onFailure: (err) => {
          console.log('onFailure', err)
          reject();
        },
        mfaRequired: (codeDeliveryDetails) => {
          console.log('mfaRequired', codeDeliveryDetails)
        }
      });
    });

  }

  async componentDidMount() {
    console.log('Did mount')
    AWS.config.region = 'us-east-1'
    await this.signIn();
    console.log('despues de signin')
    PushNotification.configure({
      // (optional) Called when Token is generated (iOS and Android)
      onRegister: this.registerWithSNS.bind(this),
      // (required) Called when a remote or local notification is opened or received
      onNotification: (notification) => {
        console.log('NOTIFICATION:', notification);
      },
      // ANDROID ONLY: GCM Sender ID (optional — not required for local notifications, but is need to receive remote push notifications)
      senderID: "570990909833"
    });
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
        <Button title="pone" onPress={this.pone.bind(this)} />
        <Button title="borra" onPress={this.borra.bind(this)} />
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
