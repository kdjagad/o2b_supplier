import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, RefreshControl, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, site_url, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Avatar, Button, IconButton, Searchbar } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import { _getUser, _setUser } from "../../global/auth";
import Snack from "../../components/snack";
import { ButtonGroup } from "react-native-elements";
import * as Animatable from 'react-native-animatable';
import AppSearchBar from "../../components/searchbar";
import WebView from "react-native-webview";
import HTMLView from "react-native-htmlview";
import { ScrollView } from "react-native";
import { ActivityIndicator } from "react-native";
export default class TermsAndCondition extends React.Component{
    constructor(props){
        super(props);
        this.state={
            terms:'',
            loading:false,
            user:[],
        }
    }
    
    componentDidMount(){
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        // ////return unsubscribe;
    }

    init=()=>{
        _getUser().then(user=>this.setState({user},()=>this.loadTerms()));
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    loadTerms=()=>{
        const{user}=this.state;
        try {  
            this.setState({loading:true});
            fetch(`${api_url}general_settings/terms_condition`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('users',json);
                this.setState({loading:false});
                this.setState({terms:json.data});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    onAgree=()=>{
        let{user}=this.state;
        this.setState({loading:true});
        let fd=new FormData();
        fd.append("is_agree",1);
        
        console.log("form data",fd,user.c_id);
        fetch(`${api_url}update_supplier/${user.c_id}`,{
            method:'POST',
            body:fd,
            headers:{
                Authorization:api_key
            }
        })
        .then((response) => response.json())
        .then((json) => {
            this.setState({edit_state:false,loading:false});
            if(json.status==1){
                user={
                    ...user,
                    is_agree:1,
                }
                _setUser(user);
                this.props.navigation.replace('AppInit');
            }
        })
        .catch((error) => {
            this.setState({loading:false});
            console.error("Login Error",error);
        });
    }

    render(){
        const{agree}=this.props.route.params?this.props.route.params:{};
        if(this.state.loading) return <Block center justifyContent="center"><ActivityIndicator size={30} color={theme_color} /></Block>;
        return(
            <Block paddingTop={30}>
                <Animatable.View duration={300} animation="slideInUp" style={{flex:1}}>
                    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1}}>
                        <HTMLView
                            value={this.state.terms}
                            stylesheet={{p:{marginBottom:-10,fontSize:20,padding:0,fontFamily:'font'},p:{marginBottom:-10,fontSize:20,padding:0,fontFamily:'font'},li:{marginBottom:-10,fontSize:20,padding:0,fontFamily:'font'}}}
                            style={{margin:15,flex:1}}
                            addLineBreaks={false}
                        />   
                    </ScrollView>
                    {
                        agree &&
                        <Block flex={0} marginVertical={15}>
                            <Button onPress={()=>this.onAgree()} labelStyle={{fontSize:23}}>Accept & Agree</Button>
                        </Block>
                    }
                </Animatable.View>
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}                                                                                                                                                                                                 
                                                                                                  
