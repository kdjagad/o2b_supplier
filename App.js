import React, { useEffect, useRef, useState } from 'react';
import MainNavigation from './src/navigation';
import { configureFonts, DefaultTheme, Provider as PaperProvider } from 'react-native-paper';
import { theme_color, theme_light_color } from './src/global/variables';
import { initialWindowMetrics, SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { Block } from 'expo-ui-kit';
import { MenuProvider } from 'react-native-popup-menu';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});
const fontConfig = {
  ios: {}, android: {}, web: {},
  default: {
    regular: {
      fontFamily: 'font',
      fontWeight: 'normal',
    },
    medium: {
      fontFamily: 'fontMedium',
      fontWeight: 'normal',
    },
    light: {
      fontFamily: 'fontLight',
      fontWeight: 'normal',
    },
    thin: {
      fontFamily: 'fontThin',
      fontWeight: 'normal',
    },
  },
};

fontConfig.ios = fontConfig.default;
fontConfig.android = fontConfig.default;
fontConfig.web = fontConfig.default;
const theme = {
  ...DefaultTheme,
  roundness: 10,
  colors: {
    ...DefaultTheme.colors,
    primary: theme_color,
    background:theme_light_color,
  },
  fonts: configureFonts(fontConfig),
};
export default function App() {
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();
  useEffect(() => {

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      console.log("notification",notification);
      setNotification(notification);
    });

    // This listener is fired whenever a user taps on or interacts with a notification (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);
  LogBox.ignoreAllLogs();
  const [loaded] = useFonts({
    font: require('./assets/fonts/TitilliumWeb-Regular.ttf'),
    fontMedium: require('./assets/fonts/TitilliumWeb-SemiBold.ttf'),
    fontBold: require('./assets/fonts/TitilliumWeb-Bold.ttf'),
    fontLight: require('./assets/fonts/TitilliumWeb-Light.ttf'),
    fontThin: require('./assets/fonts/TitilliumWeb-ExtraLight.ttf'),
  });

  if (!loaded) {
    return null;
  }
  
  return(
    
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <PaperProvider theme={theme}>
          <MenuProvider>
            <MainNavigation />
          </MenuProvider>
        </PaperProvider>
      </SafeAreaProvider>
  );
}

