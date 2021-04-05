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
import WelcomeDialog from "../../components/dialogs/welcome";
import * as Notifications from 'expo-notifications';
import NotificationIcon from "../../components/notification_icon";

export default class OrderDashboard extends React.Component{
    actions=(
        <NotificationIcon {...this.props} />
    );
    constructor(props){
        super(props);
        this.state={
            total:0,
            pending:0,
            rejected:0,
            approved:0,
            in_process:0,
            in_transit:0,
            in_dispatch:0,
            delivered:0,
            completed:0,
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
        this.props.navigation.dangerouslyGetParent().setParams({actions:this.actions,title:'Order'})      
        _getUser().then(user=>this.setState({user},()=>{
            this.getOrderDashData();
        }));
    } 

    getOrderDashData=()=>{
        const{user}=this.state;
        this.setState({loading:true});
        fetch(`${api_url}order_dash_data/${user.c_id}`,{
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
                pending:json.data.pending,
                rejected:json.data.rejected,
                approved:json.data.approved,
                in_process:json.data.in_process,
                in_transit:json.data.in_transit,
                in_dispatch:json.data.in_dispatch,
                delivered:json.data.delivered,
                completed:json.data.completed,
                loading:false,
            })
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    render(){
        const width=(Dimensions.get('window').width-40)/3;
        
        return(
            <Block>
                <ScrollView 
                    keyboardShouldPersistTaps="always" 
                    contentContainerStyle={{flexGrow:1}}
                    refreshControl={<RefreshControl onRefresh={()=>this.getOrderDashData()} loading={this.state.loading} />}
                >
                    <Block row style={{flexWrap:'wrap'}} paddingVertical>
                        <Animatable.View animation="zoomIn" duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('OrderList')}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={[styles.bigText]}>{this.state.total}</Text>
                                
                                <Text style={[styles.dashText]}>Total Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={50} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('OrderList',{filter:"pending"})}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.pending}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Pending Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        {/* <Animatable.View animation="zoomIn" delay={100} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('OrderList',{filter:"approved"})}>
                            <Block {...dashBoxStyle}>
                            <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.approved}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Approved Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View> */}
                        <Animatable.View animation="zoomIn" delay={150} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('OrderList',{filter:"in_process"})}>
                            <Block {...dashBoxStyle}>
                            <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.in_process}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>In Process Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        
                        <Animatable.View animation="zoomIn" delay={250} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('TrackList',{filter:"in_transit"})}>
                            <Block {...dashBoxStyle}>
                            <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.in_transit}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>In Transit Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        {/* <Animatable.View animation="zoomIn" delay={300} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('OrderList',{filter:"delivered"})}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.delivered}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Delivered Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View> */}
                        <Animatable.View animation="zoomIn" delay={350} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('TrackList',{filter:"completed"})}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.completed}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Completed Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={400} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('OrderList',{filter:"cancelled"})}>
                            <Block {...dashBoxStyle}>
                            <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.rejected}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Cancelled Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={450} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('DispatchOrders')}>
                            <Block {...dashBoxStyle} color={theme_color}>
                                {/* <Text style={[styles.bigText,{color:'white'}]}>{this.state.in_dispatch}</Text> */}
                                <Text style={[styles.bigText,{color:'white',left:0,right:0,textAlign:'center',top:50,bottom:'auto',textAlignVertical:'center'}]}><Icon.MaterialCommunityIcons name="truck-delivery-outline" size={60} /></Text>
                                <Text style={[styles.dashText,{textAlign:'center',color:'white'}]}>Dispatch Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={450} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('ProductList')}>
                            <Block {...dashBoxStyle} color={theme_color}>
                                <Text style={[styles.bigText,{color:'white',left:0,right:0,textAlign:'center',top:30,bottom:'auto',textAlignVertical:'center'}]}><Icon.MaterialCommunityIcons name="plus" size={60} /></Text>
                                <Text style={[styles.dashText,{textAlign:'center',color:'white'}]}>Add Orders</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        
                    </Block>
                </ScrollView>
                {/* <WelcomeDialog visible={true} />                 */}
            </Block>
        );
    }
}