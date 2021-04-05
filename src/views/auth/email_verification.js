import * as React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { styles } from "../../global/style";
import { FontAwesome5,Entypo,FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { api_key, api_url, theme_color } from "../../global/variables";
import Snack from "../../components/snack";
import { Block } from "expo-ui-kit";
import SearchableDropdown from "../../components/searchable_dropdown";
import { _getCountries,_getStates,_getCities, _setUser, _getUser } from "../../global/auth";
import * as Notifications from 'expo-notifications';
import IntlPhoneInput from 'react-native-intl-phone-input';
import { State } from 'react-native-gesture-handler';
import { StackActions } from '@react-navigation/routers';

export default class EmailVerification extends React.Component{
    constructor(props){
        super(props);
        this.state={
            email:'',
            otp:'',
            otp_input:'',
            loading:false,
            signed_id:0,
            token:'',
            step:0,
            user:{},
        }
    }
    
    // validate=()=>{
    //     const{email}=this.state;
    //     if(!email){
    //         this.snack.show('Email Id Required','danger')
    //         return;
    //     }else{
    //         this.login();
    //     }
    // }

    componentDidMount(){
        this.init();
        this.focus=this.props.navigation.addListener('focus',()=>{
            this.init();
        })
    }

    init=()=>{
        _getUser().then(user=>this.setState({user,email:user.email}))
    }

    step1_validate=()=>{
        let{email}=this.state;
        if(!email){
            this.snack.show('Email Required','danger');
        }else{
            this.email_verification();
        }
    }

    back=()=>{
        let{step}=this.state;
        if(step>0){
            step-=1;
            this.setState({step});
        }
    }
    
    email_verification=()=>{
        const{
            email,
        }=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('email',email);    
            fetch(`${api_url}supplier_email_verify`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("json",json);
                this.setState({loading:false});
                if(json.status==1){
                    this.snack.show(json.message,'success');
                    this.setState({otp:json.otp,signed_id:json.uid,step:this.state.step+1});
                }else{
                    this.snack.show(json.message,'danger');
                }
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            console.log("signup error",error);
            this.setState({loading:false});
        }
    }
    otp_verify=()=>{
        let{
            otp_input,signed_id,token,user
        }=this.state;
        if(!otp_input){
            this.snack.show('Please Enter OTP','danger');
        }else{
            try {
                this.setState({loading:true});
                let fd=new FormData();
                fd.append('otp',otp_input);
                fd.append('uid',user.c_id);
                // fd.append('token',token);
                fd.append('email',true);
                console.log("fd",fd);
                fetch(`${api_url}supplier_otp_verify`,{
                    method:'POST',
                    body:fd,
                    headers:{
                        Authorization:api_key
                    }
                })
                .then(response=>response.json())
                .then(json=>{
                    console.log("json",json);
                    this.setState({loading:false});
                    if(json.status==1){
                        this.snack.show(json.message,'success');
                        user={
                            ...json.user,
                            ...user,
                            email_verified:1,
                        }
                        _setUser(user);
                        setTimeout(() => {
                            this.props.navigation.replace('Dashboard');
                        }, 300);
                    }else{
                        this.snack.show(json.message,'danger');
                    }
                })
                .catch(err=>{
                    console.log("json err",err);
                    this.setState({loading:false});
                })
            } catch (error) {
                console.log("signup error",error);
                this.setState({loading:false});
            }
        }
    }
    // Email_validate = (text) => {
    //     console.log(text);
    //     let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    //     if (reg.test(text) === false) {
    //       console.log("Email is Not Correct");
    //       this.setState({ email: text })
    //       return false;
    //     }
    //     else {
    //       this.setState({ email: text })
    //       console.log("Email is Correct");
    //     }
    //   }

    validation = (text) => {
        console.log(text);
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
            console.log("Email is Not Correct");
            this.setState({ email: text })
            return false;
        }
        else {
            this.setState({ email : text })
            console.log("Email Is Correct");
        }
    }
    render(){
        const{otp,otp_input,step}=this.state;
        return(
            <View style={[styles.container,{paddingTop:20}]}>            
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}}>
                    <View style={{flex:1}}>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1}}>
                        <View style={{flex:1,justifyContent:'center'}}>
                        {/* <Image source={require('../../assets/images/register.png')} style={{height:'30%',resizeMode:"contain",alignSelf:"center"}} /> */}
                        {/* <Animatable.Image source={require('../../assets/images/logo.png')} animation="fadeInUp" duration={200} style={styles.login_logo}  /> */}
                        <Animatable.Text animation="fadeInLeft" duration={100} style={{color:theme_color,textAlign:"center",fontSize:30,fontFamily:'fontBold'}}>Enter Your Email</Animatable.Text>
                        {
                            step==0 &&
                            <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInUp">
                                
                                <TextInput placeholderTextColor="#ccc"
                                    // label="Username"
                                    value={this.state.email}
                                    onChangeText={(text) => this.validation(text)}
                                    // onChangeText={text => this.setState({email:text})}
                                    placeholder="Email"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    dense={true}
                                />
                                <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} labelStyle={{color:'white'}} style={{height:50,justifyContent:"center",marginHorizontal:30,width:100,alignSelf:'center',marginTop:20,marginBottom:-30}} onPress={()=>this.step1_validate()} uppercase={false}>
                                    Next
                                </Button>
                            </Animatable.View>
                        }
                        {
                            step==1 && this.state.otp &&
                            <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInUp" >
                                <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>OTP verification</Text>
                                <TextInput placeholderTextColor="#ccc"
                                    value={this.state.otp_input}
                                    onChangeText={text => this.setState({otp_input:text})}
                                    placeholder="Enter 6 Digit OTP" 
                                    underlineColor="#ccc"
                                    style={[styles.textInput]}
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    secureTextEntry={true}
                                />

                                <Button mode="contained" labelStyle={{color:'white'}} theme={{roundness:10}} labelStyle={{color:'white'}} style={{height:50,justifyContent:"center",marginHorizontal:10,width:100,alignSelf:'center',marginTop:20,marginBottom:-33}} loading={this.state.loading} onPress={() => this.otp_verify()} uppercase={false}>
                                    Verify                 
                                </Button>
                            </Animatable.View>
                        }                
                        </View>
                        {/* <View style={{flex:0,justifyContent:"flex-end"}}>
                            <Button mode="text" onPress={() => this.props.navigation.navigate('Login')} uppercase={false} style={{marginVertical:30}} labelStyle={{fontWeight:"normal",fontSize:14,}}>
                                Already Have An Email Verified 
                            </Button>
                        </View> */}
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
                <Snack ref={ref=>this.snack=ref} />
            </View>
        );
    }
}