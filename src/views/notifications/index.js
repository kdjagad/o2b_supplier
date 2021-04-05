import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, RefreshControl, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, site_url, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import * as Icon from '@expo/vector-icons';
import { Avatar, Button, IconButton, List, Searchbar } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import { read_all_notifications, _getUser } from "../../global/auth";
import Snack from "../../components/snack";
import { ButtonGroup } from "react-native-elements";
import * as Animatable from 'react-native-animatable';
import AppSearchBar from "../../components/searchbar";
export default class Notifications extends React.Component{
    constructor(props){
        super(props);
        this.state={
            notifications:[],
            notificationsAll:[],
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
        _getUser().then(user=>this.setState({user},()=>this.getNotifications()));
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    readAllNotifications=()=>{
        const{user}=this.state;
        read_all_notifications(user).then(notifications=>{
            // this.getNotifications();
        });
    }

    getNotifications=()=>{
        const{user}=this.state;
        try {  
            this.setState({loading:true});
            fetch(`${api_url}supplier_notifications/${user.c_id}`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('notifications',json);
                this.setState({loading:false});
                this.setState({notifications:json.data,notificationsAll:json.data},()=>this.readAllNotifications());
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    _renderNotification=({item})=>{
        const{user}=this.state;
        let reads=item.sup_read_status?item.sup_read_status.split(','):[];
        let is_read=reads.includes(user.c_id);
        return(
            <List.Item
                title={item.log_text}
                titleStyle={{color:!is_read?theme_color:'#525252',fontSize:18}}
                titleNumberOfLines={3}
                description={item.created_at}
                style={{borderBottomWidth:1,borderColor:"#ccc"}}
                onPress={()=>this.props.navigation.navigate(item.navigation)}
            />
        );
    }

    render(){
        return(
            <Block>
                <Animatable.View duration={300} animation="slideInUp" style={{flex:1}}>
                    <FlatList keyboardShouldPersistTaps="always"
                        data={this.state.notifications}
                        keyExtractor={(item,index)=>index.toString()}
                        contentContainerStyle={{flexGrow:1}}
                        ListEmptyComponent={(
                            <Block center paddingVertical={100} >
                                <Icon.MaterialCommunityIcons name="bell" size={100} color="#ccc" />
                                <Text>No Notifications Found</Text>
                            </Block>
                        )}
                        renderItem={this._renderNotification}
                        refreshControl={<RefreshControl onRefresh={()=>this.getNotifications()} refreshing={this.state.loading} />}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={15}
                        initialNumToRender={20}
                        disableVirtualization={true}
                    />
                </Animatable.View>
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}