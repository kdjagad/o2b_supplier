import { Block, Text } from "expo-ui-kit";
import React from "react";
import { api_key, api_url, theme_color,site_url } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { _getUser } from "../../global/auth";
import SearchableDropdown from "../../components/searchable_dropdown";
import { styles } from "../../global/style";
import { Button, TextInput } from "react-native-paper";
import { Image, KeyboardAvoidingView, ScrollView, View,FlatList } from "react-native";
import { ImageBrowser } from 'expo-image-picker-multiple';
import * as Permissions from 'expo-permissions';

import * as Animatable from 'react-native-animatable';
import ImageBrowserScreen from "../../components/ImageBrowseScreen";
import Snack from "../../components/snack";
import MultiSelect from "react-native-multiple-select";
import { MultiSelection } from "../../components/multi_selection";

export default class ChangePassword extends React.Component{
    constructor(props){
        super(props);
        this.state={
            old_pwd:'',
            new_password:'',
            confirm_pwd:'',
            user:[],
            loading:false,
        }
    }

    componentDidMount(){
        _getUser().then(user=>this.setState({user}));
    }

    validate=()=>{        
        let{old_pwd,new_password,confirm_pwd,user}=this.state;
        if(old_pwd==null || !old_pwd){
            this.snack.show('Please Enter Old Password','danger');
        }else if(new_password==null || !new_password){
            this.snack.show('Please Enter New Password','danger');
        }else if(confirm_pwd==null || !confirm_pwd){
            this.snack.show('Please Enter Confirm Password','danger');
        }
        else if(confirm_pwd!=new_password){
            this.snack.show('Password Does Not Match','danger');
        }
        else{
            this.change_password();
        }           
    }

    change_password=()=>{
        let{old_pwd,new_password,confirm_pwd,user}=this.state;
        this.setState({loading:true});
        let fd=new FormData();
        fd.append('old_pwd',old_pwd);
        fd.append('new_password',new_password);
        console.log("form data",fd);
        fetch(`${api_url}change_password/${user.c_id}`,{
            method:'POST',
            body:fd,
            headers:{
                Authorization:api_key
            }
        })
        .then((response) => response.json())
        .then((json) => {
            var stat=json.status==1?'success':'danger';
            this.snack.show(json.message,stat);
            this.setState({loading:false});
            if(json.status==1)
                this.reset_form();
        })
        .catch((error) => {
            // this.setState(this.baseState,()=>{
            //     _getUser().then(user=>this.setState({user}));
            // });
            console.error("Login Error",error);
            this.setState({loading:false});
        });
    }
    reset_form=()=>{
        this.setState({old_pwd:'',new_password:'',confirm_pwd:''});
    }

    render(){
        return(
            <View style={[styles.container]}>            
            <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}} >
                <View style={{flex:1}}>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1,padding:20}} alwaysBounceVertical={true} bouncesZoom={true} bounces={true}>
                        
                        <Animatable.View animation="slideInUp" duration={300}>
                        <Text style={styles.inputLabel}>Old Password</Text>
                        <TextInput
                            value={this.state.old_pwd}
                            onChangeText={value=>this.setState({old_pwd:value})}
                            placeholder="Old Password"
                            underlineColor="#ccc"
                            style={styles.textInput}
                            secureTextEntry={true}
                            dense={true}                            
                        /> 
                        </Animatable.View>
                        <Animatable.View animation="slideInUp" duration={300}>
                        <Text style={styles.inputLabel}>New Password</Text>
                        <TextInput
                            value={this.state.new_password}
                            onChangeText={value=>this.setState({new_password:value})}
                            placeholder="New Password"
                            underlineColor="#ccc"
                            style={styles.textInput}
                            secureTextEntry={true}
                            dense={true}                            
                        /> 
                        </Animatable.View>
                                    
                        <Animatable.View animation="slideInUp" duration={400}>
                        <Text style={styles.inputLabel}>Confirm New Password</Text>
                        <TextInput
                            value={this.state.confirm_pwd}
                            onChangeText={value=>this.setState({confirm_pwd:value})}
                            placeholder="Confirm New Password"
                            underlineColor="#ccc"
                            style={styles.textInput}
                            secureTextEntry={true}
                            dense={true}                            
                        /> 
                        </Animatable.View>
                        
                        <Block marginVertical={20}>
                            <Button mode="contained" labelStyle={{color:'white'}} style={{height:50,justifyContent:'center'}} theme={{roundness:0}} loading={this.state.loading} onPress={()=>this.validate()} >Save</Button>
                        </Block>
                    </ScrollView>
                </View>
            </KeyboardAvoidingView>
            
            <Snack ref={ref=>this.snack=ref} />
        </View>
        );
    }
}



