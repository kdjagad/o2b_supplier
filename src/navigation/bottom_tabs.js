import React from 'react';
import { AnimatedTabBarNavigator } from "react-native-animated-nav-tab-bar";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { theme_color, theme_light_color } from '../global/variables';
import { Feather,MaterialCommunityIcons,MaterialIcons,Entypo } from '@expo/vector-icons';
import OrderDashboard from '../views/order_dashboard';
import ProductDashboard from '../views/product_dashboard';
import ClientsDashboard from '../views/clients_dashboard';
import { Block } from 'expo-ui-kit';
import WelcomeDialog from '../components/dialogs/welcome';

const TabsBT = AnimatedTabBarNavigator();
 
export default function BottomTabs(){
    return(
        <Block>
            <TabsBT.Navigator         
                tabBarOptions={{
                    inactiveTintColor: theme_color,
                    activeTintColor: "#fff",
                    activeBackgroundColor:theme_color,
                    tabStyle:{
                        backgroundColor:theme_light_color,
                        
                    },
                    labelPosition:"beside-icon"
                }}
                initialRouteName="Dashboard"
            >
                <TabsBT.Screen 
                    name="OrderDashboard" 
                    component={OrderDashboard} 
                    options={{
                        tabBarIcon: ({ focused, color, size }) => (
                            <Entypo
                                name="box"
                                size={size ? size : 24}
                                color={focused ? color : "#fff"}
                                focused={focused}
                                color={color}
                            />
                        ),
                        title:"Orders"
                    }} 
                /> 
                <TabsBT.Screen 
                    name="ProductDashboard" 
                    component={ProductDashboard} 
                    options={{
                        tabBarIcon: ({ focused, color, size }) => (
                            <MaterialCommunityIcons
                                name="format-list-text"
                                size={size ? size : 24}
                                color={focused ? color : "#fff"}
                                focused={focused}
                                color={color}
                            />
                        ),
                        title:"Products"
                    }} 
                /> 
                
                <TabsBT.Screen 
                    name="ClientsDashboard" 
                    component={ClientsDashboard} 
                    options={{
                        tabBarIcon: ({ focused, color, size }) => (
                            <Feather
                                name="users"
                                size={size ? size : 24}
                                color={focused ? color : "#fff"}
                                focused={focused}
                                color={color}
                            />
                        ),
                        title:"Clients"
                    }} 
                /> 
            </TabsBT.Navigator>
            {/* <WelcomeDialog /> */}
        </Block>
    )
}