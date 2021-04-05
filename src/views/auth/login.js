import * as React from 'react';
import { Image, KeyboardAvoidingView, Platform, ScrollView, Text, View } from "react-native";
import { Button,  TextInput } from "react-native-paper";
import { styles } from "../../global/style";
import { FontAwesome5,Entypo,FontAwesome } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import Snack from "../../components/snack";
import { api_key, api_url, theme_color } from "../../global/variables";
import { _setUser } from "../../global/auth";
import * as Notifications from 'expo-notifications';
export default class Login extends React.Component{
    constructor(props){
        super(props);
    }
    state={
        username:'',
        password:'',
        loading:false,
        token:'',
    }
    async componentDidMount(){
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
    validate=()=>{
        const{username,password}=this.state;
        if(!username && !password){
            this.snack.show('Username And Password Required','danger')
            return;
        }else{
            this.login();
        }
    }

    login=()=>{
        const{username,password,token}=this.state;
        try {
            this.setState({loading:true});            
            let fd=new FormData();
            fd.append('username',username);
            fd.append('password',password);
            fd.append('token',token);
            fetch(`${api_url}login`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                this.setState({loading:false});
                console.log("login resp",json);
                if(json.status==1){
                    this.snack.show(json.message,'success');
                    _setUser(json.user);
                    setTimeout(() => {
                        this.props.navigation.replace('Dashboard');                        
                    }, 500);
                }else{
                    this.snack.show(json.message,'danger');
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

    render(){
        return(
            <View style={[styles.container,{paddingTop:20,backgroundColor:'white'}]}>            
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}}>
                    <View style={{flex:1}}>
                        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1}}  >
                        <View style={{flex:1,justifyContent:'center'}}>
                            {/* <Image source={require('../../assets/images/login.png')} style={{height:'30%',resizeMode:"contain",alignSelf:"center"}} /> */}
                            <Animatable.Image source={require('../../assets/images/logo.png')} animation="fadeInUp" duration={200} style={styles.login_logo}  />
                            <Animatable.Text animation="fadeInLeft" duration={100} style={{color:theme_color,textAlign:"center",fontSize:30,fontFamily:'fontBold'}}>Order To Book</Animatable.Text>
                            <Animatable.View style={[styles.box,{padding:10,paddingTop:0,marginHorizontal:30,marginVertical:15,borderWidth:1,borderColor:theme_color}]} delay={10} duration={400} animation="fadeInUp">
                                <Text style={[styles.linkText,{textAlign:"center",fontSize:20}]}>Sign In</Text>
                                <TextInput placeholderTextColor="#ccc"
                                    value={this.state.username}
                                    onChangeText={text => this.setState({username:text})}
                                    placeholder="Username"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    dense={true}
                                />
                                <TextInput placeholderTextColor="#ccc"
                                    // label="Password"
                                    value={this.state.password}
                                    onChangeText={text => this.setState({password:text})}
                                    placeholder="Password"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    secureTextEntry={true}
                                    right={()=><Text>Show</Text>}
                                />
                                <Button mode="text" onPress={() => this.props.navigation.navigate('ForgotPassword')} uppercase={false} style={{alignSelf:"flex-end"}} labelStyle={{fontWeight:"normal",fontSize:14,}}>Forgot Password?</Button>
                                <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:10}} style={{height:50,justifyContent:"center",marginHorizontal:30,marginTop:20,marginBottom:-30}} onPress={() => this.validate()} uppercase={false} loading={this.state.loading}>
                                    Sign In
                                </Button>
                            </Animatable.View>
                            {/* <Text style={[styles.linkText,{textAlign:"center",marginVertical:10}]}>Or Sign In With</Text>
                            <View style={styles.row}>
                                <FontAwesome5 name="facebook" size={30} color="#8A8A8A" />
                                <Entypo name="google--with-circle" size={30} color="#8A8A8A" />
                                <FontAwesome name="apple" size={30} color="#8A8A8A" />
                            </View> */}
                            <Text style={[styles.linkText,{textAlign:"center",marginVertical:10}]}>Or Sign In With</Text>
                            <Button mode="text" onPress={() => this.props.navigation.navigate('OTPLogin')} uppercase={false} style={{alignSelf:"center"}} labelStyle={{fontWeight:"normal",fontSize:14,}}>Login With OTP</Button>
                            
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