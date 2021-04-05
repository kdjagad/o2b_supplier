import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, RefreshControl, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, site_url, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Avatar, Button, IconButton, Searchbar } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import Snack from "../../components/snack";
import { ButtonGroup } from "react-native-elements";
import * as Animatable from 'react-native-animatable';
import AppSearchBar from "../../components/searchbar";
import WebView from "react-native-webview";
import { ScrollView } from "react-native";
import { ActivityIndicator } from "react-native";
import HTMLView from "react-native-htmlview";
export default class Privacy extends React.Component{
    constructor(props){
        super(props);
        this.state={
            privacy:'',
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
        _getUser().then(user=>this.setState({user},()=>this.loadPrivacy()));
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    loadPrivacy=()=>{
        const{user}=this.state;
        try {  
            this.setState({loading:true});
            fetch(`${api_url}general_settings/privacy_policy`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('users',json);
                this.setState({loading:false});
                this.setState({privacy:json.data});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    render(){
        if(this.state.loading) return <Block center justifyContent="center"><ActivityIndicator size={30} color={theme_color} /></Block>;
        return(
            <Block>
                <Animatable.View duration={300} animation="slideInUp" style={{flex:1}}>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1}}>
                        <HTMLView
                            value={this.state.privacy}
                            stylesheet={{p:{marginBottom:-10,fontSize:20,padding:0,fontFamily:'font'}}}
                            style={{margin:15,flex:1}}
                            addLineBreaks={false}
                        />   
                    </ScrollView>
                </Animatable.View>
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}