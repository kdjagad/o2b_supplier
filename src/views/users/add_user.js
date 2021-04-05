import { Block,  Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, KeyboardAvoidingView, RefreshControl, ScrollView, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, site_url, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Avatar, Button, IconButton, Searchbar, TextInput } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import Snack from "../../components/snack";
import { ButtonGroup } from "react-native-elements";
import * as Animatable from 'react-native-animatable';
import AppSearchBar from "../../components/searchbar";
import { styles } from "../../global/style";
import * as Notifications from 'expo-notifications';
export default class AddUser extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loading:false,
            username:'',
            email:'',
            phone:'',
            user:[],
        }
    }
    
    componentDidMount(){
        Notifications.addNotificationReceivedListener(this.init);
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    init=()=>{
        _getUser().then(user=>this.setState({user}));
    }

    validate=()=>{
        const{username,email,phone}=this.state;
        if(!username) this.snack.show('User Name Required','danger');
        if(!email) this.snack.show('Email Required','danger');
        // else if(product_images.length<=0) this.snack.show('Product Image Required','danger');
        else if(!phone) this.snack.show('Phone Required','danger');
        else this.save();
    }

    save=()=>{
        const{username,email,phone,user}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('full_name',username);
            fd.append('email',email);
            fd.append('phone',phone);
            console.log('fd',fd);
            fetch(`${api_url}add_supplier/${user.c_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('product json',json);
                this.setState({loading:false});
                if(json.status==1)this.snack.show(json.message,'success');
                else this.snack.show(json.message,'danger');
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            this.setState({loading:false});
            console.log("product_error",error);
        }
    }

    render(){
        return(
            <Block>
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}} >
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1,padding:20}} alwaysBounceVertical={true} bouncesZoom={true} bounces={true}>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Name</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.username}
                                onChangeText={text => this.setState({username:text})}
                                placeholder="Enter User Name"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                autoFocus={true}
                                onSubmitEditing={()=>this.email.focus()}
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Email</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.email}
                                ref={ref=>this.email=ref}
                                onChangeText={text => this.setState({email:text})}
                                placeholder="Enter User Email"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}  
                                onSubmitEditing={()=>this.phone.focus()}                          
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Phone</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.phone}
                                ref={ref=>this.phone=ref}
                                onChangeText={text => this.setState({phone:text})}
                                placeholder="Enter User Phone"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                keyboardType="number-pad"
                                maxLength={10}                      
                            /> 
                        </Animatable.View>
                        <Block marginVertical={20}>
                            <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} style={{height:50,justifyContent:'center'}} loading={this.state.loading} onPress={()=>this.validate()} >Save</Button>
                        </Block>
                    </ScrollView>
                </KeyboardAvoidingView>
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}