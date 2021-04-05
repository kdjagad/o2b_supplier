import { Block } from "expo-ui-kit";
import React from "react";
import { FlatList } from "react-native";
import {  Image, KeyboardAvoidingView, Text, View,ScrollView,  TextInput, TouchableNativeFeedback } from "react-native";

import { Appbar, Button, List, Switch } from "react-native-paper";
import { RadioButton } from 'react-native-paper';
import { _getUser } from "../../global/auth";
import { styles } from "../../global/style";
import { api_key, api_url, theme_color, theme_light_color } from "../../global/variables";
import * as Icon from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { color } from "react-native-reanimated";
import moment from "moment";

export default class Thankyou extends React.Component{

    constructor(props){
        super(props)
        this.state={
            user:[],
        }
    }

    componentDidMount(){        
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    init=()=>{
        _getUser().then(user=>{
            this.setState({user});
        })
    }

    render(){
        let{item}=this.props.route.params?this.props.route.params:null;
        return(
            <Block justifyContent="center" padding={20}>
                <Animatable.Image source={require('../../assets/images/logo.png')} animation="fadeInUp" duration={200} style={styles.login_logo}  />
                <Text style={{marginVertical:30,fontSize:20,color:'green',textAlign:'center'}}>Thank You, We Received Your Payment Successfully. You Are Now Premium Member Of Order To book</Text>
                <Block padding={20}>
                    <Text style={{color:theme_color,fontSize:20}}><Text style={{fontFamily:'fontMedium',color:'black'}}>Payment ID : </Text>{item.payment_id}</Text>
                    <Text style={{color:theme_color,fontSize:20}}><Text style={{fontFamily:'fontMedium',color:'black'}}>Amount : </Text>{'\u20B9 '+item.final_amount}</Text>
                    <Text style={{color:theme_color,fontSize:20}}><Text style={{fontFamily:'fontMedium',color:'black'}}>Activation : </Text>{item.active_date}</Text>
                    <Text style={{color:theme_color,fontSize:20}}><Text style={{fontFamily:'fontMedium',color:'black'}}>Expiration : </Text>{item.expire_date}</Text>
                </Block>
                <Button mode="contained" labelStyle={{color:'white'}} onPress={()=>this.props.navigation.replace('Dashboard')} >Go To Dashboard</Button>
            </Block>
        );
    }
}
