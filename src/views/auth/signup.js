import * as React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button, TextInput } from "react-native-paper";
import { styles } from "../../global/style";
import { FontAwesome5,Entypo,FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { api_key, api_url, theme_color,validateEmail } from "../../global/variables";
import Snack from "../../components/snack";
import { Block } from "expo-ui-kit";
import SearchableDropdown from "../../components/searchable_dropdown";
import { _getCountries,_getStates,_getCities, _setUser } from "../../global/auth";
import * as Notifications from 'expo-notifications';
import IntlPhoneInput from 'react-native-intl-phone-input';
import { StackActions } from '@react-navigation/routers';

export default class Signup extends React.Component{
    constructor(props){
        super(props);
        this.state={
            step:0,
            countries:[],
            selectedCountry:null,
            states:[],
            selectedState:null,
            cities:[],
            selectedCity:null,
            full_name:'',
            email:'',
            phone:'',
            password:'',
            confirm_password:'',
            address:'',
            gst_no:'',
            pan_no:'',
            otp:'',
            otp_input:'',
            loading:false,
            signed_id:0,
            token:'',
            country:'IN',
            maskedPhone:'',
            selCountry:null,
            defaultCountry:{
                code:"IN",
                mask:"99999 99999",
            },
            dialCode:'',
        }
    }
    componentDidMount(){        
        if(this.props.route.params){
            let country=this.props.route.params.selectedCountry;
            let {maskedPhone,phone,dialCode}=this.props.route.params;
            this.setState({selCountry:country,maskedPhone,phone,dialCode});
        }else{
            this.setState({selCountry:this.state.defaultCountry});
        }
        this.loadNotification();
        this.getCountries();        
    }
    loadNotification=async()=>{
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

    getCountries=()=>{
        _getCountries().then(countries=>{
            this.setState({countries});
            if(this.props.route.params){
                let country=this.props.route.params.selectedCountry;
                let selectedCnt=countries.filter(dt=>dt.sortname==country.code);
                if(selectedCnt.length>0) this.setState({selectedCountry:selectedCnt[0]},()=>this.getStates(selectedCnt[0].id));
            }
        })
    }
    getStates=(country_id)=>{
        _getStates(country_id).then(states=>{
            this.setState({states});
        })
    }
    getCities=(state_id)=>{
        _getCities(state_id).then(cities=>{
            this.setState({cities});
        })
    }

    step1_validate=()=>{
        let{full_name,phone,email,password,confirm_password,step,maskedPhone,selCountry}=this.state;
        let countryselect=this.props.route.params?this.props.route.params.selectedCountry:selCountry;
        if(!full_name) this.snack.show('Full Name Required','danger');
        else if(!phone) this.snack.show('Mobile No. Required','danger');
        else if(email && !validateEmail(email)) this.snack.show('Email Format Invalid','danger');
        else if(maskedPhone.length!=countryselect.mask.length) this.snack.show('Mobile No. Incorrect','danger');
        // else if(!password) this.snack.show('Password Required','danger');
        // else if(!confirm_password) this.snack.show('Confirm Password Required','danger');
        // else if(confirm_password!=password) this.snack.show('Confirm Password Does Not Match','danger');
        else step+=1;
        this.setState({step});
    }
    step2_validate=()=>{
        let{selectedCity,selectedState,selectedCountry,address,step}=this.state;
        if(selectedCountry==null) this.snack.show('Country Required','danger');
        else if(selectedState==null) this.snack.show('State Required','danger');
        else if(selectedCity==null) this.snack.show('City Required','danger');
        else if(!address) this.snack.show('Address Required','danger');
        else step+=1;
        this.setState({step});
    }
    back=()=>{
        let{step}=this.state;
        if(step>0){
            step-=1;
            this.setState({step});
        }
    }
    signup=()=>{
        
        const{
            full_name,
            email,
            phone,
            password,
            selectedCountry,
            selectedState,
            selectedCity,
            address,
            gst_no,
            pan_no,
            dialCode
        }=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('full_name',full_name);
            fd.append('email',email);
            fd.append('phone',dialCode+phone);
            // fd.append('password',password);
            fd.append('country',selectedCountry.id);
            fd.append('state',selectedState.id);
            fd.append('city',selectedCity.id);
            fd.append('address',address);
            // fd.append('gst_no',gst_no);
            // fd.append('pan_no',pan_no);
    
            fetch(`${api_url}signup`,{
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
        const{
            otp_input,signed_id,token
        }=this.state;
        if(!otp_input){
            this.snack.show('Please Enter OTP','danger');
        }else{
            try {
                this.setState({loading:true});
                let fd=new FormData();
                fd.append('otp',otp_input);    
                fd.append('uid',signed_id);
                fd.append('token',token);
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
                        _setUser(json.user);
                        setTimeout(() => {
                            this.props.navigation.dispatch({
                                ...StackActions.replace('Dashboard'),
                                source: this.props.route.key,
                                target: this.props.navigation.dangerouslyGetState().key,
                            });
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
    Email_validate = (text) => {
        console.log(text);
        let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (reg.test(text) === false) {
          console.log("Email is Not Correct");
          this.setState({ email: text })
          return false;
        }
        else {
          this.setState({ email: text })
          console.log("Email is Correct");
        }
    }
    render(){
        const{step,selectedState,selectedCountry,selectedCity,otp,otp_input,selCountry,defaultCountry}=this.state;
        console.log("selcountry",selCountry);
        return(
            <View style={[styles.container,{paddingTop:20}]}>            
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}}>
                    <View style={{flex:1}}>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1}}>
                        <View style={{flex:1,justifyContent:'center'}}>
                        {/* <Image source={require('../../assets/images/register.png')} style={{height:'30%',resizeMode:"contain",alignSelf:"center"}} /> */}
                        <Animatable.Image source={require('../../assets/images/logo.png')} animation="fadeInUp" duration={200} style={styles.login_logo}  />
                        <Animatable.Text animation="fadeInLeft" duration={100} style={{color:theme_color,textAlign:"center",fontSize:30,fontFamily:'fontBold'}}>Order To Book</Animatable.Text>
                        {
                            step==0 &&
                            <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInUp">
                                <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>Sign Up</Text>
                                <TextInput placeholderTextColor="#ccc"
                                    value={this.state.full_name}
                                    onChangeText={text => this.setState({full_name:text})}
                                    placeholder="Full Name"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    dense={true}
                                    autoFocus={true}
                                />
                                <TextInput placeholderTextColor="#ccc"
                                    // label="Username"
                                    value={this.state.email}
                                    onChangeText={(text) => this.Email_validate(text)}
                                    // onChangeText={text => this.setState({email:text})}
                                    placeholder="Email"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    dense={true}
                                />
                                {
                                    selCountry!=null &&
                                    <IntlPhoneInput defaultValue={this.state.maskedPhone} onChangeText={data=>this.setState({phone:data.unmaskedPhoneNumber,maskedPhone:data.phoneNumber,dialCode:data.dialCode})}  defaultCountry={selCountry.code} dialCodeTextStyle={{fontSize:22,paddingLeft:0}} phoneInputStyle={{borderWidth:0,height:45,fontSize:22}} placeholder="Enter Mobile Number" />
                                }
                                {/* <TextInput placeholderTextColor="#ccc"
                                    // label="Username"
                                    value={this.state.phone}
                                    onChangeText={text => this.setState({phone:text})}
                                    placeholder="Phone Eg. +91xxxxxxxxxx"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    dense={true}
                                /> */}
                                {/* <TextInput placeholderTextColor="#ccc"
                                    // label="Password"
                                    value={this.state.password}
                                    onChangeText={text => this.setState({password:text})}
                                    placeholder="Password"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    secureTextEntry={true}
                                    right={()=><Text>Show</Text>}
                                    dense={true}
                                />
                                <TextInput placeholderTextColor="#ccc"
                                    // label="Password"
                                    value={this.state.confirm_password}
                                    onChangeText={text => this.setState({confirm_password:text})}
                                    placeholder="Confirm Password"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    secureTextEntry={true}
                                    right={()=><Text>Show</Text>}
                                    dense={true}
                                /> */}
                                <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} labelStyle={{color:'white'}} style={{height:50,justifyContent:"center",marginHorizontal:30,width:100,alignSelf:'center',marginTop:20,marginBottom:-30}} onPress={()=>this.step1_validate()} uppercase={false}>
                                    Next
                                </Button>
                            </Animatable.View>
                        }
                        {
                            step==1 &&
                            <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInRight">
                                <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>Location</Text>
                                <SearchableDropdown placeholder="Country" data={this.state.countries} {...this.props} onSelect={item=>this.setState({selectedCountry:item},()=>this.getStates(item.id))} defaultValue={selectedCountry!=null?selectedCountry.name:''} />
                                <SearchableDropdown placeholder="State" data={this.state.states} {...this.props} onSelect={item=>this.setState({selectedState:item},()=>this.getCities(item.id))} defaultValue={selectedState!=null?selectedState.name:''} />
                                <SearchableDropdown placeholder="City" data={this.state.cities} {...this.props} onSelect={item=>this.setState({selectedCity:item})} defaultValue={selectedCity!=null?selectedCity.name:''} />
                                <TextInput placeholderTextColor="#ccc"
                                    // label="Username"
                                    value={this.state.address}
                                    onChangeText={text => this.setState({address:text})}
                                    placeholder="Address"
                                    underlineColor="#ccc"
                                    style={[styles.textInput]}
                                    multiline={true}
                                />
                                <Block row justifyContent="space-between">
                                    <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} labelStyle={{color:'white'}} style={{height:50,justifyContent:"center",marginHorizontal:10,width:100,alignSelf:'center',marginTop:20,marginBottom:-33}} onPress={this.back} uppercase={false}>
                                        Back
                                    </Button>
                                    <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} labelStyle={{color:'white'}} style={{height:50,justifyContent:"center",marginHorizontal:10,width:100,alignSelf:'center',marginTop:20,marginBottom:-33}} loading={this.state.loading} onPress={() => this.signup()} uppercase={false}>
                                        Signup
                                    </Button>
                                </Block>
                            </Animatable.View>
                        }
                        {/* {
                            step==2 && 
                            <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInRight">
                                <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>Business Details</Text>
                                <TextInput placeholderTextColor="#ccc"
                                    // label="Username"
                                    value={this.state.gst_no}
                                    onChangeText={text => this.setState({gst_no:text})}
                                    placeholder="GST No."
                                    underlineColor="#ccc"
                                    style={[styles.textInput]}
                                    dense={true}
                                />
                                <TextInput placeholderTextColor="#ccc"
                                    // label="Username"
                                    value={this.state.pan_no}
                                    onChangeText={text => this.setState({pan_no:text})}
                                    placeholder="PAN No."
                                    underlineColor="#ccc"
                                    style={[styles.textInput]}
                                    dense={true}
                                />
                                <Block row justifyContent="space-between">
                                    <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} labelStyle={{color:'white'}} style={{height:50,justifyContent:"center",marginHorizontal:10,width:100,alignSelf:'center',marginTop:20,marginBottom:-33}} onPress={this.back} uppercase={false}>
                                        Back
                                    </Button>
                                    <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} labelStyle={{color:'white'}} style={{height:50,justifyContent:"center",marginHorizontal:10,width:100,alignSelf:'center',marginTop:20,marginBottom:-33}} loading={this.state.loading} onPress={() => this.signup()} uppercase={false}>
                                        Submit
                                    </Button>
                                </Block>
                            </Animatable.View>
                        } */}
                        {
                            step==2 && this.state.otp && 
                            <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInRight">
                                <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>OTP Verification</Text>
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
                                
                                <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} labelStyle={{color:'white'}} style={{height:50,justifyContent:"center",marginHorizontal:10,width:100,alignSelf:'center',marginTop:20,marginBottom:-33}} loading={this.state.loading} onPress={() => this.otp_verify()} uppercase={false}>
                                    Verify
                                </Button>
                            </Animatable.View>
                        }
                        </View>
                        <View style={{flex:0,justifyContent:"flex-end"}}>
                            <Button mode="text" onPress={() => this.props.navigation.navigate('Login')} uppercase={false} style={{marginVertical:30}} labelStyle={{fontWeight:"normal",fontSize:14,}}>
                                Already Have An Account? Sign In Here
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