import * as React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button,  TextInput } from "react-native-paper";
import { styles } from "../../global/style";
import { FontAwesome5,Entypo,FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
export default class ForgotPassword extends React.Component{
    constructor(props){
        super(props);
    }
    state={
        email:'',
        loading:false,
    }
    componentDidMount(){

    }
    validate=()=>{
        const{email}=this.state;
        if(!email){
            return;
        }else{
            
        }
    }
    render(){
        return(
            <View style={[styles.container,{paddingTop:20}]}>            
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}}>
                    <View style={{flex:1}}>
                        <Image source={require('../../assets/images/forgot.png')} style={{height:'30%',resizeMode:"contain",alignSelf:"center"}} />
                        <Animatable.Image source={require('../../assets/images/logo.png')} animation="fadeInUp" duration={200} style={{height:'10%',resizeMode:"contain",alignSelf:"center"}} />
                        <Animatable.View style={[styles.box,styles.shadow,{padding:10,marginHorizontal:30,marginVertical:15}]} delay={10} duration={400} animation="fadeInUp">
                            <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>Forgot Password</Text>
                            <TextInput placeholderTextColor="#ccc"
                                // label="Username"
                                value={this.state.email}
                                onChangeText={text => this.setState({email:text})}
                                placeholder="Email"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                            />
                            
                            <Text style={[styles.linkText,{textAlign:"right"}]}>Resend Otp</Text>
                            <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} style={{height:50,justifyContent:"center",marginHorizontal:30,marginTop:20,marginBottom:-30}} onPress={() => this.validate()} uppercase={false}>
                                Forgot Password
                            </Button>
                        </Animatable.View>
                        {/* <Text style={[styles.linkText,{textAlign:"center",marginVertical:20}]}>Or Sign In With</Text>
                        <View style={styles.row}>
                            <FontAwesome5 name="facebook" size={30} color="#8A8A8A" />
                            <Entypo name="google--with-circle" size={30} color="#8A8A8A" />
                            <FontAwesome name="apple" size={30} color="#8A8A8A" />
                        </View> */}
                        <View style={{flex:1,justifyContent:"flex-end"}}>
                            <Button mode="text" onPress={() => this.props.navigation.navigate('Login')} uppercase={false} style={{marginVertical:30}} labelStyle={{fontWeight:"normal",fontSize:14,}}>
                                Back To Login
                            </Button>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }
}