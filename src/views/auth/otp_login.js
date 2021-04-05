import * as React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button,  TextInput } from "react-native-paper";
import { styles } from "../../global/style";
import { FontAwesome5,Entypo,FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Snack from "../../components/snack";
import { api_key, api_url, theme_color, theme_light_color } from "../../global/variables";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import * as firebase from "firebase";
import IntlPhoneInput from 'react-native-intl-phone-input';
import { _setUser } from '../../global/auth';
import { StackActions } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';
export default class OTPLogin extends React.Component{
    constructor(props){
        super(props);
        this.state={
            phone:'',
            selectedCountry:{
                mask:"99999 99999",
                code:"IN",
            },
            token:'',
            code:'',
            otp:'',
            dialCode:'',
            received_otp:'',
            otp_sent:false,
            loading:false,
            verificationId:'',
            user:[],
            maskedPhone:'',
            // pickerData: this.phone.getPickerData()
        }
        this.recaptchaVerifier = React.createRef();
    } 
    async componentDidMount(){
        // firebase.initializeApp(this.state.firebaseConfig);
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        }
        if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
        }
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        console.log(token);
        this.setState({ token: token });
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
            });
        }
        
    }
    onPressFlag(){
        this.myCountryPicker.open()
    }
    
    selectCountry(country){
        this.phone.selectCountry(country.iso2)
    }
    validate=async ()=>{
        let{phone,dialCode,selectedCountry,maskedPhone}=this.state;
        phone=dialCode+phone;
        console.log("phone",phone);
        if(!phone){
            this.snack.show('Mobile No. Required','danger')
            return;
        }else if(maskedPhone.length!=selectedCountry.mask.length){
            this.snack.show('Mobile No. Incorrect','danger')
            return;
        }else{
            this.login();  
        }
    }

    login=()=>{
        const{phone,token,dialCode,maskedPhone,selectedCountry}=this.state;
        try {
            this.setState({loading:true});            
            let fd=new FormData();
            fd.append('phone',dialCode+phone);
            fd.append('token',token);
            console.log("fd",fd);
            fetch(`${api_url}supplier_otp_login`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(async json=>{
                this.setState({loading:false});
                console.log("login resp",json);
                if(json.status==1){
                    this.setState({user:json.user,received_otp:json.otp,otp_sent:true});
                }else if(json.status==2){
                    _setUser(json.user);
                    this.snack.show('Login Successfully','success');
                    setTimeout(() => {
                        if(json.user.hasOwnProperty('is_agree') && json.user.is_agree=='1'){
                            this.props.navigation.dispatch({
                                ...StackActions.replace('Dashboard'),
                                source: this.props.route.key,
                                target: this.props.navigation.dangerouslyGetState().key,
                            });
                        }else{
                            this.props.navigation.dispatch({
                                ...StackActions.replace('TermsAndCondition',{agree:true}),
                                source: this.props.route.key,
                                target: this.props.navigation.dangerouslyGetState().key,
                            });
                        }
                    }, 300);
                }else{
                    Alert.alert(
                        "Signup",
                        "Your Phone no is not registered in Order To Book do you want to create new account?",
                        [
                            {
                                text:'Yes',
                                onPress:()=>this.props.navigation.navigate('Signup',{phone,maskedPhone,selectedCountry,dialCode})
                            },
                            {
                                text:'No',
                                onPress:()=>{}
                            }
                        ]
                    )
                }
            })
            .catch(err=>{
                this.setState({loading:false});
                console.log("login err",err);
            });
        } catch (error) {
            this.setState({loading:false});
            console.log("login err",error);
        }
    }

    verify=async ()=>{
        const{user,otp,received_otp}=this.state;
        try {
            if(otp==received_otp){
                this.setState({loading:true});
                let fd=new FormData();
                fd.append('verified',1);
                fd.append('otp','');
                fd.append('otp_date','');
                // fd.append('token',token);
                fetch(`${api_url}update_supplier/${user.c_id}`,{
                    method:'POST',
                    body:fd,
                    headers:{
                        Authorization:api_key
                    }
                })
                .then(response=>response.json())
                .then(async json=>{
                    this.setState({loading:false});
                    if(json.status==1){
                        _setUser(user);
                        this.snack.show('OTP Verified Successfully','success');
                        setTimeout(() => {
                            if(user.hasOwnProperty('is_agree') && user.is_agree=='1'){
                                this.props.navigation.dispatch({
                                    ...StackActions.replace('Dashboard'),
                                    source: this.props.route.key,
                                    target: this.props.navigation.dangerouslyGetState().key,
                                });
                            }else{
                                this.props.navigation.dispatch({
                                    ...StackActions.replace('TermsAndCondition',{agree:true}),
                                    source: this.props.route.key,
                                    target: this.props.navigation.dangerouslyGetState().key,
                                });
                            }
                        }, 300);
                    }
                })
                .catch(err=>{
                    this.setState({loading:false});
                    console.log("login err",err);
                });
            }else{
                this.snack.show('OTP Does Not Match','danger');
            }
            // showMessage({ text: "Phone authentication successful ðŸ‘" });
        } catch (err) {
            this.snack.show('OTP Does Not Match','danger');
            // showMessage({ text: `Error: ${err.message}`, color: "red" });
        }
    }

    resendOtp=()=>{
        const{user,otp,received_otp,dialCode,phone}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('phone',dialCode+phone);
            fetch(`${api_url}supplier_resend_otp/${user.c_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(async json=>{
                this.setState({loading:false});
                if(json.status==1){
                    this.snack.show('OTP Sent','success');
                    // setTimeout(() => {
                    //     this.props.navigation.dispatch({
                    //         ...StackActions.replace('Dashboard'),
                    //         source: this.props.route.key,
                    //         target: this.props.navigation.dangerouslyGetState().key,
                    //     });
                    // }, 300);
                }
            })
            .catch(err=>{
                this.setState({loading:false});
                console.log("login err",err);
            });
            
            // showMessage({ text: "Phone authentication successful ðŸ‘" });
        } catch (err) {
            this.snack.show('OTP Does Not Match','danger');
            // showMessage({ text: `Error: ${err.message}`, color: "red" });
        }
    }

    render(){
        return(
            <View style={[styles.container,{paddingTop:20,backgroundColor:'white'}]}>            
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}}>
                    <View style={{flex:1}}>
                        <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1}}>
                        <View style={{flex:1,justifyContent:'center'}}>
                            {/* <Image source={require('../../assets/images/login.png')} style={{height:'30%',resizeMode:"contain",alignSelf:"center"}} /> */}
                            <Animatable.Image source={require('../../assets/images/logo.png')} animation="fadeInUp" duration={200} style={styles.login_logo}  />
                            <Animatable.Text animation="fadeInLeft" duration={100} style={{color:theme_color,textAlign:"center",fontSize:30,fontFamily:'fontBold'}}>Order To Book</Animatable.Text>
                            {
                                !this.state.otp_sent ?
                                <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInUp">
                                    <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>Sign In With Mobile Number</Text>
                                    {/* <TextInput placeholderTextColor="#ccc"
                                        value={this.state.phone}
                                        onChangeText={text => this.setState({phone:text})}
                                        placeholder="Enter Your Phone No."
                                        underlineColor="#ccc"
                                        style={styles.textInput}
                                        dense={true}
                                        autoCompleteType="tel"
                                        keyboardType="phone-pad"
                                        textContentType="telephoneNumber"
                                    />                                     */}
                                    <IntlPhoneInput onChangeText={data=>{
                                        console.log("data",data);
                                        this.setState({phone:data.unmaskedPhoneNumber,maskedPhone:data.phoneNumber,dialCode:data.dialCode,selectedCountry:data.selectedCountry})
                                    }} defaultCountry={this.state.selectedCountry.code} dialCodeTextStyle={{fontSize:22,paddingLeft:0}} phoneInputStyle={{borderWidth:0,height:45,fontSize:22}} placeholder="Enter Mobile Number" />
                                    <Button mode="contained" labelStyle={{color:'white'}} theme={{roundness:10}} style={{height:50,justifyContent:"center",marginHorizontal:30,marginTop:20,marginBottom:-30}} onPress={() => this.validate()} uppercase={false} loading={this.state.loading}>
                                        Sign In
                                    </Button>
                                </Animatable.View>:
                                <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInUp">
                                    <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>OTP Verify</Text>
                                    <TextInput placeholderTextColor="#ccc"
                                        value={this.state.otp}
                                        onChangeText={text => this.setState({otp:text})}
                                        placeholder="Enter Your OTP"
                                        underlineColor="#ccc"
                                        style={styles.textInput}
                                        dense={true}
                                        keyboardType="number-pad"
                                        maxLength={6}
                                    />
                                    <Button mode="contained" labelStyle={{color:'white'}} theme={{roundness:10}} style={{height:50,justifyContent:"center",marginHorizontal:30,marginTop:20,marginBottom:-30}} onPress={() => this.verify()} uppercase={false} loading={this.state.loading}>
                                        Verify
                                    </Button>
                                </Animatable.View>
                            }
                            {/* <Text style={[styles.linkText,{textAlign:"center",marginVertical:20}]}>Or Sign In With</Text>
                            <View style={styles.row}>
                                <FontAwesome5 name="facebook" size={30} color="#8A8A8A" />
                                <Entypo name="google--with-circle" size={30} color="#8A8A8A" />
                                <FontAwesome name="apple" size={30} color="#8A8A8A" />
                            </View> */}
                        </View>
                        <View style={{flex:0,justifyContent:"flex-end"}}>
                            <Button mode="text" onPress={() => this.props.navigation.navigate('Signup')} uppercase={false} style={{marginVertical:20}} labelStyle={{fontWeight:"normal",fontSize:14,}}>
                                Not Have An Account? Sign Up Here
                            </Button>
                        </View>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
                <Snack ref={ref=>this.snack=ref} />
            </View>
        );
    }
}