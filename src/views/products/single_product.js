import { Block } from "expo-ui-kit";
import React from "react";
import { Alert, Dimensions, FlatList, Image, ImageBackground, RefreshControl, ScrollView, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, Avatar, Button, IconButton, Paragraph, Text, TextInput } from "react-native-paper";
import * as Contacts from 'expo-contacts';
import SearchBar from 'react-native-searchbar';
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import { styles } from "../../global/style";
import SearchableDropdown from "../../components/searchable_dropdown";
import * as Animatable from 'react-native-animatable';
import CachedImage from 'react-native-expo-cached-image';
import AddToCartModal from "../../components/dialogs/add_to_cart";
const product_grid_width=(Dimensions.get('window').width-20)/3;

export default class SingleProduct extends React.Component{
    
    actions =(
        <Block row center>
            <Appbar.Action animated={false} icon="pencil" color="white" style={styles.circleIcon} onPress={()=>this.edit()} />
            <Appbar.Action animated={false} icon="delete" color="white" style={styles.circleIcon} onPress={()=>this.askDelete()} />
        </Block>
    )
    constructor(props){
        super(props);
        this.state={
            user:[],
            loading:false,
            quantity:'0',
            instructions:'',
            addToCartModal:false,
        }
    }

    componentDidMount() {
        // this.props.navigation.setOptions(this.navigationOptions);
        const{is_popup}=this.props;
        if(!is_popup) this.props.navigation.setParams({ actions:this.actions});
    }

    edit = () => {
        const{item}=this.props.route?this.props.route.params:this.props;
        this.props.navigation.navigate('AddProduct',{item});
    }

    askDelete = () =>{
        Alert.alert(
            "Delete Product",
            "Are You Sure You Want To Delete This Product?",
            [
                {
                    text:'Yes',
                    onPress:()=>this.deleteProduct()
                },
                {
                    text:'No',
                    onPress:()=>{
                        
                    }
                }
            ]
        )
    }

    deleteProduct=()=>{
        const{item}=this.props.route?this.props.route.params:this.props;
        fetch(`${api_url}product/${item.p_id}`,{
            method:'DELETE',
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            this.props.navigation.goBack();
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }
    
    render(){
        let{item}=this.props.route.params?this.props.route.params:null;
        
        if(item==null) item=this.props.item;
        let price=(item.c_price==null || item.c_price==undefined)?item.p_price:item.c_price;
        // let price=item.p_price;
        return(
        <Block>  
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1}}>              
                <Block flex={0} paddingVertical>
                    {
                        item.images && item.images.length>0 ?
                        (

                            <Carousel
                                layout="default"
                                loop={true}
                                data={item.images}
                                renderItem={({item,index})=>{ 
                                    const preview = require('../../assets/images/o2b_placeholder.png');
                                    const uri = item;
                                    return(
                                        <Block paddingHorizontal={20}>
                                            <Image defaultSource={preview} source={{uri:item,cache:'force-cache'}} style={{flex:1,resizeMode:'contain'}} />
                                        </Block>
                                    );
                                }}
                                sliderWidth={Dimensions.get('window').width}
                                itemWidth={Dimensions.get('window').width}
                                slideStyle={{height:Dimensions.get('window').height/2.5}}
                                pagingEnabled={true}
                                autoplay={true}
                                // itemHeight={200}
                            />
                        ):
                        (
                            <Image source={require('../../assets/images/o2b_placeholder.png')} style={{width:'80%',height:200,alignSelf:'center',resizeMode:'contain'}} />
                        )
                    }
                </Block>
                <Block>
                    <Block padding>
                        <Text style={{fontFamily:'fontBold',fontSize:20,marginLeft:10}}>{item.p_title}</Text>
                        <Block row  padding>
                            <Text style={{fontSize:16,color:'#898989',fontFamily:'fontBold',color:theme_color}}>Description : </Text>
                            <Block marginLeft>
                                <Text>
                                    {item.p_description?item.p_description.trim():''}
                                </Text>
                            </Block>
                        </Block>
                        <Block row  padding>
                            <Text style={{fontSize:16,color:'#898989',fontFamily:'fontBold',color:theme_color}}>Price : </Text>
                            <Block marginLeft>
                                <Text>
                                    {price?'\u20B9 '+price.trim():'Price Not Set'}{item.unit_name?`/ Per ${item.unit_name}`:''}
                                </Text>
                                {
                                    item.u_description!='' && item.u_description!=undefined &&
                                    <Text style={{fontSize:12,color:'#888',lineHeight:13}}>{item.u_description.toString().trim()}</Text>
                                }
                            </Block>
                        </Block>
                        <Block row  padding>
                            <Text style={{fontSize:16,color:'#898989',fontFamily:'fontBold',color:theme_color}}>Category : </Text>
                            <Block marginLeft>
                                <Text>
                                    {item.cat_name?item.cat_name.trim():''}
                                </Text>
                            </Block>
                        </Block>
                        {
                            item.attributes!=undefined && item.attributes.length>0 && item.attributes.map((att,index)=>{
                                console.log('is array',att);
                                if(!att.a_value || att.a_value=="") return null;
                                return(
                                    <Block row  padding>
                                        <Text style={{fontSize:16,color:'#898989',fontFamily:'fontBold',color:theme_color}} key={att.a_id.toString()} >{att.a_name} :</Text>
                                        {
                                            att.a_value.includes(',') ?
                                            (
                                                <Block row center marginLeft key={index.toString()}>
                                                {
                                                    att.a_value.split(',').map(attr=>{
                                                        if(!attr) return null;
                                                        return(
                                                            <Block alignSelf="center" padding={1} paddingHorizontal marginRight flex={0} borderWidth={1} borderRadius={10}>
                                                            <Text style={styles.pill}>{attr}</Text>
                                                            </Block>
                                                        )
                                                    })  
                                                }
                                                </Block>
                                            ):
                                            (
                                                <Block marginLeft>
                                                    <Text>{att.a_value}</Text>
                                                </Block>
                                            )
                                        }
                                    </Block>
                                )
                            })
                        }
                        
                    </Block>
                </Block>   
            </ScrollView>
        </Block>
        );
    }
}