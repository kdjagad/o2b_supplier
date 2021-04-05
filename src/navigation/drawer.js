import React, { useState } from "react";
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import Screens from "./screens";
import Animated from "react-native-reanimated";
import { Block, Text } from "expo-ui-kit";
import { theme_color } from "../global/variables";
import * as Icon from '@expo/vector-icons';
import { AsyncStorage } from "react-native";
import DrawerHeader from "../components/drawer_header";

const Drawer = createDrawerNavigator();

const DrawerContent = props => {
    const styls={
        labelStyle:{
            fontSize:18,color:'white',paddingVertical:0
        },
        style:{
            marginVertical:0,
            height:45,
            justifyContent:'center',
            borderBottomWidth:1,
            borderColor:'rgba(255,255,225,0.2)'
        }
    }

    const icon_style={
        size:20,
        color:'rgba(255,255,255,0.5)',
        style:{
            marginRight:-25
        }
    }
    return(
        <DrawerContentScrollView {...props}>
            <DrawerHeader {...props} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="format-list-text" {...icon_style} />} label="My Orders" onPress={()=>props.navigation.navigate('OrderDashboard')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="format-list-text" {...icon_style} />} label="My Products" onPress={()=>props.navigation.navigate('ProductDashboard')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="account-details-outline" {...icon_style} />} label="Clients" onPress={()=>props.navigation.navigate('ContactList')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialIcons name="inventory" {...icon_style} />} label="Manage Stock" onPress={()=>props.navigation.navigate('StockList')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="format-list-bulleted-type" {...icon_style} />} label="Manage Category" onPress={()=>props.navigation.navigate('Categories')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="scale-balance" {...icon_style} />} label="Manage Units" onPress={()=>props.navigation.navigate('Units')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="account" {...icon_style} />} label="Manage Users" onPress={()=>props.navigation.navigate('Users')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="currency-inr" {...icon_style} />} label="Price List" onPress={()=>props.navigation.navigate('PriceList')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="cog-outline" {...icon_style} />} label="Settings" onPress={()=>props.navigation.navigate('Settings')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialIcons name="live-help" {...icon_style} />} label="Help Desk" onPress={()=>props.navigation.navigate('HelpDesk')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialIcons name="live-help" {...icon_style} />} label="Upgrade To Pro" onPress={()=>props.navigation.navigate('Plans')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="information-outline" {...icon_style} />} label="info" onPress={()=>props.navigation.navigate('Info')} {...styls} />
            <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="file-find-outline" {...icon_style} />} label="How To Use" onPress={()=>props.navigation.navigate('HowToUse')} {...styls} />
            {/* <DrawerItem icon={()=><Icon.MaterialCommunityIcons name="logout-variant" {...icon_style} />} label="Logout" onPress={()=>{
                AsyncStorage.clear();
                props.navigation.navigate('Login');
            }} {...styls} /> */}
        </DrawerContentScrollView>
    );
}

export default function DrawerNav(){
    const [progress, setProgress] = useState(new Animated.Value(0));
    const scale=Animated.interpolate(progress,{
        inputRange:[0,1],
        outputRange:[1,0.8]
    });
    const borderRadius=Animated.interpolate(progress,{
        inputRange:[0,1],
        outputRange:[0,30]
    });
    const screenStyles={borderRadius,transform:[{scale}]};
    return (
        <Block color={theme_color}>
            <Drawer.Navigator 
                drawerContent={props => {
                    setProgress(props.progress);
                    return<DrawerContent {...props} />;
                }} 
                drawerType="slide" 
                overlayColor="transparent"
                contentContainerStyle={{flexGrow:1}} 
                drawerStyle={{width:'60%',backgroundColor:'transparent'}}
                sceneContainerStyle={{
                    backgroundColor:'transparent'
                }}      
                drawerContentOptions={{
                    activeBackgroundColor:'transparent'
                }}
                initialRouteName="Screens"
                backBehavior="history"
            >
                <Drawer.Screen name="Screens">
                {
                    props => <Screens {...props} style={screenStyles} />
                }
                </Drawer.Screen>
            </Drawer.Navigator>
        </Block>
    );
}