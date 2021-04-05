import { Block,Text } from 'expo-ui-kit';
import React from 'react';
import { logOut, _getUser } from '../global/auth';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, IconButton } from 'react-native-paper';
import { TouchableNativeFeedback } from 'react-native';
import { site_url } from '../global/variables';
import { AsyncStorage } from 'react-native';

export default class DrawerHeader extends React.Component{
    constructor(props){
        super(props);
        this.state={
            user:null,
        }
    }
    componentDidMount(){
        _getUser().then(user=>this.setState({user}));
    }
    render(){
        const{user}=this.state;
        if(user==null) return null;
        return(
            <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('Profile')}>
            <Block row center padding>
                {
                    user.profile ?
                    <Avatar.Image source={{uri:`${site_url}${user.profile}`}} size={40} /> :
                    <Avatar.Text label={user.name[0]} size={40} labelStyle={{fontSize:22,fontFamily:'fontBold',color:'#525252'}} backgroundColor="#eee" />
                }
                <Block marginLeft>
                    <Text size={20} white style={{fontFamily:'fontBold'}}>{user.name}</Text>
                    {
                        user.email!='' &&
                        <Text size={14} white>{user.email}</Text>
                    }
                    <Text size={14} white>{user.phone_no}</Text>
                    <Text size={14} white>{parseInt(user.active_plan_id)>0?'Premium Member':'Free Member'}</Text>
                    
                </Block>
                <IconButton icon="power" size={28} color="white" onPress={()=>{
                    logOut(user.u_id).then(res=>{
                        AsyncStorage.clear();
                        this.props.navigation.navigate('Login');
                    });
                }}/>
            </Block>
            </TouchableNativeFeedback>
        );
    }
}