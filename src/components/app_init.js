import { Block } from "expo-ui-kit";
import * as React from 'react';
import { ImageBackground } from "react-native";
import { getUserFromDb, _getUser, _setUser } from "../global/auth";

export default class AppInit extends React.Component{
    constructor(props){
        super(props);
    }

    componentDidMount(){
        _getUser().then(user=>{
            if(user!=null){
                getUserFromDb(user.c_id).then(res=>{
                    if(res.status==1 && res.hasOwnProperty('user')){
                        var usr={
                            ...user,
                            ...res.user,
                        }
                        console.log("usrrrrrrrrrrrrrrrrrrrrrrr",usr);
                        _setUser(usr);
                        if(usr.hasOwnProperty('is_agree') && usr.is_agree=='1'){
                            if(user.hasOwnProperty('welcome_msg') && user.welcome_msg=='1')
                                this.props.navigation.replace('Dashboard')
                            else
                                this.props.navigation.replace('HowToUse')
                        }else{
                            this.props.navigation.replace('TermsAndCondition',{agree:true})
                        }
                    }else{
                        this.props.navigation.replace('Login')
                    }
                })
            }else{
                this.props.navigation.replace('Login')
            }
        })
        .catch(error=>{
            this.props.navigation.replace('Login')
        })
    }

    render(){
        return(
            <Block>
                <ImageBackground source={require('../../assets/splash.png')} style={{flex:1}} resizeMode="contain"></ImageBackground>
            </Block>
        )
    }
}