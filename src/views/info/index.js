import { Block } from "expo-ui-kit";
import React from "react";
import {  Image, KeyboardAvoidingView, Text, View,ScrollView,  TextInput, TouchableNativeFeedback } from "react-native";

import { Appbar, Button, List, Switch } from "react-native-paper";
import { RadioButton } from 'react-native-paper';
import { styles } from "../../global/style";
import { theme_color } from "../../global/variables";

export default class Info extends React.Component{

    constructor(props){
        super(props)
        this.state={
            checked:false,
        }
    }

    render(){
        const { checked } = this.state;
        return(
            <Block>

                    <List.Item 
                        title="Privacy Policy"
                        onPress={()=>this.props.navigation.navigate('Privacy')}
                    />

                    <List.Item 
                        title="About Us"
                        onPress={()=>this.props.navigation.navigate('AboutUs')}
                    />
                    
                    <List.Item 
                        title="Terms And Condition"
                        onPress={()=>this.props.navigation.navigate('TermsAndCondition')}
                    />
                    
            </Block>
        );
    }
}