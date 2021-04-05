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
import NotificationIcon from "../../components/notification_icon";

export default class ClientsDashboard extends React.Component{
    actions=(
        <NotificationIcon {...this.props} />
    );
    constructor(props){
        super(props);
        this.state={
            total:0,
            approved:0,
            requested:0,
            received:0,
            loading:false,
            user:[]
        }
    }

    componentDidMount(){
        this.init();
        Notifications.addNotificationReceivedListener(this.init);
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }
    componentWillUnmount(){
        this._unsubscribe;
    }

    init=()=>{  
        this.props.navigation.dangerouslyGetParent().setParams({actions:this.actions,title:'Clients'})      
        _getUser().then(user=>this.setState({user},()=>{
            this.getClientDashData();
        }));
    } 

    getClientDashData=()=>{
        const{user}=this.state;
        this.setState({loading:true});
        fetch(`${api_url}clients_dash_data/${user.c_id}`,{
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
                approved:json.data.approved,
                requested:json.data.requested,
                received:json.data.received,
                loading:false,
            })
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    render(){
        
        
        return(
            <Block>
                <ScrollView 
                    keyboardShouldPersistTaps="always" 
                    contentContainerStyle={{flexGrow:1}}
                    refreshControl={<RefreshControl onRefresh={()=>this.getClientDashData()} loading={this.state.loading} />}
                >
                    <Block row style={{flexWrap:'wrap'}} paddingVertical>
                    <Animatable.View animation="zoomIn" duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('Clients')}>
                            <Block {...dashBoxStyle} >
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={[styles.bigText]}>{this.state.total}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Total Clients</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={50} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('Clients',{filter:"approved"})}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.approved}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Approved Clients</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        <Animatable.View animation="zoomIn" delay={100} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('Clients',{filter:"requests"})}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{parseInt(this.state.requested)+parseInt(this.state.received)}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Client Requests</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                        {/* <Animatable.View animation="zoomIn" delay={150} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('Clients',{filter:"received"})}>
                            <Block {...dashBoxStyle}>
                                <Block color={theme_light_color} style={styles.curve}>
                                </Block>
                                <Text style={styles.bigText}>{this.state.received}</Text>
                                <Text style={[styles.dashText,{textAlign:'center'}]}>Received Clients</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View> */}
                        <Animatable.View animation="zoomIn" delay={200} duration={300}>
                        <TouchableNativeFeedback onPress={()=>this.props.navigation.navigate('ContactList')}>
                            <Block {...dashBoxStyle} color={theme_color}>
                                 <Text style={[styles.bigText,{color:'white',left:0,right:0,textAlign:'center',top:0,bottom:0,textAlignVertical:'center'}]}><Icon.MaterialCommunityIcons name="plus" size={60} /></Text>
                                <Text style={[styles.dashText,{textAlign:'center',color:'white'}]}>Invite New Client</Text>
                            </Block>
                        </TouchableNativeFeedback>
                        </Animatable.View>
                    </Block>
                </ScrollView>
            </Block>
        );
    }
}