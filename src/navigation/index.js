import * as React from 'react';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { createStackNavigator } from '@react-navigation/stack';
import Login from '../views/auth/login';
import Signup from '../views/auth/signup';
import ForgotPassword from '../views/auth/forgot_password';
import Drawer from '../navigation/drawer';
import { Block } from 'expo-ui-kit';
import OTPLogin from '../views/auth/otp_login';
import AppInit from '../components/app_init';
import TermsAndCondition from '../views/terms_and_condition';
import HowToUse from '../components/dialogs/welcome';

const Stack = createStackNavigator();

const MyTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#fff',
  },
};

export default function MainNavigation() {
  return (
    <NavigationContainer theme={MyTheme} >
        <StatusBar backgroundColor="transparent" />
        <Stack.Navigator initialRouteName="AppInit" screenOptions={{headerShown:false}} >
            <Stack.Screen name="OTPLogin" component={OTPLogin}  />
            <Stack.Screen name="AppInit" component={AppInit}  />
            <Stack.Screen name="Login" component={OTPLogin}  />
            <Stack.Screen name="Signup" component={Signup}  />
            <Stack.Screen name="ForgotPassword" component={ForgotPassword}  />
            <Stack.Screen name="Dashboard" component={Drawer}  />
            <Stack.Screen name="TermsAndCondition" component={TermsAndCondition} options={({route})=>({title:'Terms And Condition'})}  />
            <Stack.Screen name="HowToUse" component={HowToUse} options={({route})=>({title:'How To Use',headerShown:true})}  />
        </Stack.Navigator>
    </NavigationContainer>
  );
}