import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, ScrollView, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, dashBoxStyle, theme_color, theme_light_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { _getUser } from "../../global/auth";
import { styles } from "../../global/style";
import * as Icon from '@expo/vector-icons';
import { TouchableNativeFeedback } from "react-native";
import { RefreshControl } from "react-native";
import * as Animatable from 'react-native-animatable';
import * as Notifications from 'expo-notifications';
import { Alert } from "react-native";
import NotificationIcon from "../../components/notification_icon";

export default class ProductDashboard extends React.Component{
    actions=(
        <NotificationIcon {...this.props} />
    );
    constructor(props){
        super(props);
        this.state={
            total:0,
            enabled:0,
            disabled:0,
            loading:false,
            user:[]
        }
    }

    componentDidMount(){
        Notifications.addNotificationReceivedListener(this.init);
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }
    componentWillUnmount(){
        this._unsubscribe;
    }

    init=()=>{  
        this.props.navigation.dangerouslyGetParent().setParams({actions:this.actions,title:'Products'})      
        _getUser().then(user=>this.setState({user},()=>{
            this.getProductDashData();
        }));
    } 

    getProductDashData=()=>{
        const{user}=this.state;
        this.setState({loading:true});
        fetch(`${api_url}product_dash_data/${user.c_id}`,{
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            console.log("dash data",json);
            this.setState({loading:false});
            this.setState({
                total:json.data.total,
                enabled:json.data.enabled,
                disabled:json.data.disabled,
                loading:false,
            })
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    addProduct=()=>{
        const{total,user}=this.state;
        console.log("total",user.active_plan_id);
        if((parseInt(total)<=10 && parseInt(user.active_plan_id)==0) || parseInt(user.active_plan_id)>0){
            this.props.navigation.navigate('AddProduct')
        }else{
            Alert.alert("Upgrade To Pro","Your Free Products Limit Reached Please Upgrade To Premium For More Products");
        }
    }

    render(){
        
        return(
            <Block>
                <ScrollView 
                    keyboardShouldPersistTaps="always" 
                    contentContainerStyle={{flexGrow:1}}
                    refreshControl={<RefreshControl onRefresh={()=>this.getProductDashData()} loading={this.state.loading} />}
                >
                    <Block row style={{flexWrap:'wrap'}} paddingVertical>
                        <Animatable.View animation="zoomIn" duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('ProductList')}>
                            <Block {...dashBoxStyle} >
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={[styles.bigText]}>{this.state.total}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Total Products</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={50} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('ProductList',{filter:"enabled"})}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.enabled}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Active Products</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={100} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('ProductList',{filter:"disabled"})}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.disabled}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Hide Products</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={150} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.addProduct()}>
                            <Block {...dashBoxStyle} color={theme_color}>
                                 <Text style={[styles.bigText,{color:'white',left:0,right:0,textAlign:'center',top:0,bottom:0,textAlignVertical:'center'}]}><Icon.MaterialCommunityIcons name="plus" size={60} /></Text>
                                <Text style={[styles.dashText,{textAlign:'center',color:'white'}]}>Add Product</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={200} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('PriceList')}>
                            <Block {...dashBoxStyle} color={theme_color}>
                                 <Text style={[styles.bigText,{color:'white',left:0,right:0,textAlign:'center',top:0,bottom:0,textAlignVertical:'center'}]}><Icon.MaterialCommunityIcons name="currency-inr" size={60} /></Text>
                                <Text style={[styles.dashText,{textAlign:'center',color:'white'}]}>Price List</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                    </Block>
                </ScrollView>
            </Block>
        );
    }
}