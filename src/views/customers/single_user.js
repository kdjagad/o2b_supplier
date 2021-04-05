import { Block } from "expo-ui-kit";
import React from "react";
import { Alert, Dimensions, FlatList, Image, ImageBackground, RefreshControl, ScrollView, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, site_url, theme_color, sanitizeString } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, Avatar, Button, IconButton, List, Paragraph, Text, TextInput } from "react-native-paper";
import * as Contacts from 'expo-contacts';
import SearchBar from 'react-native-searchbar';
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import { styles } from "../../global/style";
import SearchableDropdown from "../../components/searchable_dropdown";
import * as Animatable from 'react-native-animatable';
import CachedImage from 'react-native-expo-cached-image';
import AddToCartModal from "../../components/dialogs/add_to_cart";
import ProductList from "../products";
import { ButtonGroup } from "react-native-elements";
import CartIconHeader from "../../components/cart_icon_header";
import NotificationIcon from "../../components/notification_icon";
import OrderList from "../orders";
const product_grid_width=(Dimensions.get('window').width-20)/3;
export default class SingleUser extends React.Component{
    
    actions = (
        <Block flex={0} row center>
            {/* <CartIconHeader onPress={()=>this.props.navigation.navigate('CartList')} {...this.props} />
            <NotificationIcon {...this.props} /> */}
        </Block>
    );

    constructor(props){
        super(props);
        this.state={
            user:[],
            loading:false,
            selectedIndex:0,
        }
    }

    componentDidMount(){
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
    }
    componentWillUnmount(){
        this._unsubscribe;
    }        
    init=()=>{
        let{item}=this.props.route.params;
        this.props.navigation.setParams({actions:this.actions,title:item.name+' Profile'})
        _getUser().then(user=>this.setState({user}));
    }
    
    render(){
        const buttons = ['Profile Info', 'Products','Orders'];
        let{item}=this.props.route.params;
        let{selectedIndex,user}=this.state;
        const profile_fields=['name','email','phone_no','address','gst_no','pan_no','Country','State','City'];
        return(
        <Block>  
            <Block row center shadow white padding>
                <Block flex={0} padding>
                    {
                        item.profile ?
                        <Avatar.Image source={{uri:`${site_url}${item.profile}`}} size={60} /> :
                        <Avatar.Text label={item.name[0]} size={60} />
                    }
                </Block>
                <Block padding>
                    <Text style={{fontFamily:'fontMedium',fontSize:25,color:theme_color}}>{item.name}</Text>
                    <Text style={{fontFamily:'fontMedium',fontSize:15}}>{item.email}</Text>
                    <Text style={{fontFamily:'fontMedium',fontSize:15}}>{item.phone_no}</Text>
                </Block>
            </Block>
            <ButtonGroup
                onPress={index=>this.setState({selectedIndex:index})}
                selectedIndex={selectedIndex}
                buttons={buttons}
                containerStyle={{height: 45,overflow:"hidden",marginHorizontal:0,marginVertical:0}}
                selectedButtonStyle={{backgroundColor:theme_color}}
            />
            <Block>
                {
                    selectedIndex==0 &&
                    (
                        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1}}>
                        {
                            Object.keys(item).map(dt=>{
                                if(!profile_fields.includes(dt)) return null;
                                return(
                                    <List.Item
                                        title={sanitizeString(dt)}
                                        right={()=>(
                                            <Block paddingRight flex={0} justifyContent="center">
                                                <Text style={{fontSize:18}}>{item[dt]?item[dt].trim():'----'}</Text>
                                            </Block>
                                        )}
                                        titleStyle={{fontFamily:'fontBold',fontSize:18}}
                                        style={{padding:5,borderBottomWidth:1,borderColor:'#eee'}}
                                    />
                            )})
                        }
                        </ScrollView>
                    )
                }
                {
                    selectedIndex==1 &&
                    <ProductList client={item} {...this.props} />
                }
                {
                    selectedIndex==2 &&
                    <OrderList item={item} {...this.props} />
                }
            </Block>   
        </Block>
        );
    }
}