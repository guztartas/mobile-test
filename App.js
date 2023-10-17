import React, { useRef, useState, useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Device from 'expo-device';
import { getApps, initializeApp } from 'firebase/app';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { doc, onSnapshot } from "firebase/firestore";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const firebaseConfig = {
  apiKey: "AIzaSyD4Pj5MYJQxquf8TwP-1ugoY2YXfSlYNWk",
  authDomain: "notification-demo-f544f.firebaseapp.com",
  projectId: "notification-demo-f544f",
  storageBucket: "notification-demo-f544f.appspot.com",
  messagingSenderId: "266777200878",
  appId: "1:266777200878:web:f9415972a8e8d7ec528bff",
  measurementId: "G-ZDP38CTBGD"
};

export const sendPushNotification = async (
  expoPushToken,
  title,
  content
) => {
  const message = {
    to: expoPushToken,
    sound: 'default',
    title: title,
    body: content
  };

  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-encoding': 'gzip, deflate',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(message)
  })
    .then((response) => response.json())
    .then((data) => console.log('sendPushNotification', data));
};

export const registerForPushNotificationsAsync = async () => {
  let token;
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    console.log(existingStatus, 'status')
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
    }
    token = (await Notifications.getExpoPushTokenAsync(
      {
        projectId: Constants.expoConfig.extra.eas.projectId,
      }
    )).data;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250]
    });
  }
  console.log(token, 'token')
  return token;
};

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotificationsAsync().then(token => console.log(token));

    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  if (!getApps().length) {
    console.log(getApps().length, 'app length')
    initializeApp(firebaseConfig);
  }

  async function schedulePushNotification() {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "You've got mail! 📬",
        body: 'Here is the notification body',
        sound: true,
        data: { data: 'goes here' },
      },
      trigger: { seconds: 2 },
    });
  }

  // const unsub = onSnapshot(doc(db, "cities", "SF"), (doc) => {
  //   console.log("Current data: ", doc.data());
  // });

  return (
    <View style={styles.container}>
      <Text>Teste notificação firebase</Text>
      <Button
        title="Pressione para testar notificação"
        onPress={async () => {
          await schedulePushNotification();
        }}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
