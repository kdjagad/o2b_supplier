import { Block } from "expo-ui-kit";
import React from "react";
import {  Image, KeyboardAvoidingView, Text, View,ScrollView,  TextInput, TouchableNativeFeedback } from "react-native";
import { Appbar, Button, List, Switch } from "react-native-paper";
import { RadioButton } from 'react-native-paper';
import { _getUser, _setUser } from "../../global/auth";
import { styles } from "../../global/style";
import { api_key, api_url, theme_color } from "../../global/variables";

export default class Settings extends React.Component{

    constructor(props){
        super(props)
        this.state={
            checked:false,
            user:{},
        }
    }

    componentDidMount(){
        _getUser().then(user=>{
            this.setState({user});
            if(user.hasOwnProperty('notification')){
                this.setState({checked:user.notification=='1'?true:false});
            }
        });
    }

    render(){
        let { checked,user } = this.state;
        return(
            <Block>
                <List.Item 
                        title="Notifications"
                        onPress={()=>{}}
                        right={()=>(<Block flex={0}>
                            <Switch
                                value={checked}
                                onValueChange={checked=>{
                                    this.setState({checked});
                                    let fd=new FormData();
                                    fd.append('notification',checked?1:0);
                                    fetch(`${api_url}update_supplier/${user.c_id}`,{
                                        method:'POST',
                                        body:fd,
                                        headers:{
                                            Authorization:api_key
                                        }
                                    })
                                    .then((response) => response.json())
                                    .then((json) => {
                                        user={
                                            ...user,
                                            notification:checked?1:0
                                        }
                                        _setUser(user);
                                    })
                                    .catch((error) => {
                                        this.setState({loading:false});
                                        console.error("Login Error",error);
                                    });
                                }}
                                color={theme_color}
                            />
                        </Block>)}
                    /> 
                {/* <List.Item 
                        title="Reset"
                        onPress={()=>{}}
                    />  */}
                <List.Item 
                        title="Change Password"
                        onPress={()=>this.props.navigation.navigate('ChangePassword')}
                    /> 
                
            </Block>
        );
    }
}