import { Block, Text } from "expo-ui-kit";
import React from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Linking,
  Platform,
  RefreshControl,
  Share,
  View,
} from "react-native";
import Carousel from "react-native-snap-carousel";
import {
  api_key,
  api_url,
  theme_color,
  ios_app_sup_url,
  android_app_sup_url,
  theme_light_color,
} from "../../global/variables";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {
  Appbar,
  Avatar,
  Button,
  Checkbox,
  Dialog,
  IconButton,
  List,
  Paragraph,
  Portal,
  Searchbar,
  Title,
} from "react-native-paper";
import * as Contacts from "expo-contacts";
import { ButtonGroup } from "react-native-elements";
import * as Animatable from "react-native-animatable";
import {
  sendNotification,
  uniqArr,
  _getUser,
  _setUser,
} from "../../global/auth";
import * as SMS from "expo-sms";
import * as Permissions from "expo-permissions";
import { TouchableNativeFeedback } from "react-native-gesture-handler";
import Snack from "../snack";
import AppSearchBar from "../searchbar";
import Emoji from "react-native-emoji";
import { Value } from "react-native-reanimated";
const sliderWidth=Dimensions.get('window').width-110;
export default class HowToUse extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      // user:[],
      user: [],
      everyTimeChecked: true,
      activeSlide:0,
      visible:false,
      // visible:false,
    };
  }

  componentDidMount() {
    _getUser().then((user) => {
        if(user.hasOwnProperty('welcome_msg')){
            this.setState({visible:user.welcome_msg});
        }else{
            this.setState({visible:true});            
        }
        this.setState({ user });
    });
  }

  _renderSlide=({item,index})=>{
      return(
          <Block flex={0} paddingHorizontal>
            <Image source={item.image} style={{height:400,width:300,resizeMode:'contain',alignSelf:'center',marginBottom:15}} />
            <Text bold style={{fontSize:30,textAlign:'center',fontFamily:'fontBold',textDecorationLine:'underline',marginBottom:15,color:theme_color}}>{item.Title}</Text>
            <Paragraph style={{fontSize:18,textAlign:'center'}}>{item.text}</Paragraph>
          </Block>
      )
  }

  onDontShow=()=>{
      let{user}=this.state;
      user={
          ...user,
          welcome_msg:false,  
      };
      _setUser(user);
      this.setState({user,visible:false});
  }

  onGetStarted=()=>{
    let{user}=this.state;
    user={
        ...user,
        welcome_msg:1,  
    };
    _setUser(user);
    this.setState({user},()=>this.props.navigation.replace('Dashboard'));
  }

  render() {
    const { user,visible } = this.state;
    
    const steps=[
      {
        Title:'Invited',
        text:'Invite Customer.',
        image:require('../../assets/welcome/Invite.png')
      },
      {
        Title:'See Products',
        text:'On Accept By Customer They Able To See Their Products.',
        image:require('../../assets/welcome/see_products.png')
      },
      {
        Title:'Add Products',
        text:'See Entire Products From Products Tab.',
        image:require('../../assets/welcome/add_products.png'),
      },
      {
        Title:'Place Orders',
        text:'You can Place Order For your customer also',
        image:require('../../assets/welcome/place_order.png')
      },
      {
        Title:'Managed Orders',
        text:'Managing Incoming Orders',
        image:require('../../assets/welcome/order_managed.png')
      },
      {
        Title:'Managed Products',
        text:'Manage Products Access customer wise',
        image:require('../../assets/welcome/product_managed.png')
      },
      {
        Title:'Managed Price List',
        text:'Manage Price List Customer Wise',
        image:require('../../assets/welcome/pricelist_managed.png')
      },
    ];
    return (
      // <Portal>
        <Block
          visible={visible}
          onDismiss={() => (onDismiss == null ? {} : onDismiss())}
          style={{flex:1,marginHorizontal:0,marginVertical:0,borderRadius:0,justifyContent:'center'}}      
        >
          {/* <Title style={{fontSize:25,color:theme_color,textAlign:'center'}}>How To Use?</Title> */}
          <Block style={{flex:0,marginHorizontal:0,marginVertical:0,borderRadius:0}}>
            <Block flex={0} marginBottom={20}>
              <Carousel
                  ref={(c) => { this._carousel = c; }}
                  data={steps}
                  renderItem={this._renderSlide}
                  enableMomentum={true}
                  sliderWidth={Dimensions.get('window').width}
                  itemWidth={Dimensions.get('window').width}
                  indicatorStyle="black"
                  autoplay={true}
                  autoplayInterval={2000}
                  onSnapToItem={(index)=>this.setState({activeSlide:index})}
              />
            </Block>
            {
                steps.length>0 && 
                <Block row center justifyContent="center" flex={0}>
                    {
                        steps.map((dt,index)=>(
                            <Block flex={0} style={{width:10,height:10,borderRadius:10}} color={index==this.state.activeSlide?theme_color:"#eee"} marginRight></Block>
                        ))
                    }
                </Block>
            }
          </Block>
          <Dialog.Actions style={{justifyContent:'center',marginVertical:20}} >
              {/* <Button mode="contained" labelStyle={{color:'#eee'}} onPress={()=>this.onDontShow()}>Don't Show Again</Button> */}
              <Button mode="contained" style={{flex:1,marginHorizontal:30,height:50,justifyContent:'center'}} labelStyle={{color:'#eee'}} onPress={()=>this.onGetStarted()}>Get Started</Button>
          </Dialog.Actions>
        </Block>
      // </Portal>
    );
  }
}