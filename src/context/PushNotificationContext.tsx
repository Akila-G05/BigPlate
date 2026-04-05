import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

interface PushNotificationContextType {
  expoPushToken: string | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<boolean>;
}

const PushNotificationContext = createContext<PushNotificationContextType | undefined>(undefined);

export function PushNotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
        setPermissionGranted(true);
        saveTokenToDatabase(token);
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
    });

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user && expoPushToken) {
      saveTokenToDatabase(expoPushToken);
    }
  }, [user, expoPushToken]);

  const saveTokenToDatabase = async (token: string) => {
    if (!user) return;
    try {
      await supabase
        .from('users')
        .update({ expo_push_token: token })
        .eq('id', user.id);
    } catch (error) {
      console.error('Failed to save push token:', error);
    }
  };

  const requestPermission = async () => {
    const granted = await registerForPushNotificationsAsync();
    if (granted) {
      setExpoPushToken(granted);
      setPermissionGranted(true);
      if (user) saveTokenToDatabase(granted);
    }
    return !!granted;
  };

  return (
    <PushNotificationContext.Provider value={{ expoPushToken, permissionGranted, requestPermission }}>
      {children}
    </PushNotificationContext.Provider>
  );
}

export function usePushNotifications() {
  const context = useContext(PushNotificationContext);
  if (!context) throw new Error('usePushNotifications must be used within PushNotificationProvider');
  return context;
}

async function registerForPushNotificationsAsync() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: '8f344f9c-61bd-4e8e-afe8-c885783cb831',
  })).data;

  return token;
}
