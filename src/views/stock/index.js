import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList,  Image,  ImageBackground, RefreshControl, TouchableNativeFeedback, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, theme_color, theme_light_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, Card, IconButton, Paragraph, Title } from "react-native-paper";
import * as Contacts from 'expo-contacts';
import SearchBar from 'react-native-searchbar';
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import { styles } from "../../global/style";
import SearchableDropdown from "../../components/searchable_dropdown";
import ProductListCard from "../../components/cards/product_list";
import StockListCard from "../../components/cards/stock_list";
import * as Notifications from 'expo-notifications';
const product_grid_width=(Dimensions.get('window').width-20)/3;
export default class Stock extends React.Component{

    actions = (
        <Block row center flex={0}>
            
            <IconButton icon="file-excel" size={30} onPress={()=>this.props.navigation.navigate('StockInformation')} color="white" style={styles.circleIcon} />
            
        </Block>
        
    );

    constructor(props){
        super(props);
        this.state={
            products:[],
            productsAll:[],
            categories:[],
            selectedCategory:null,
            user:[],
            loading:false,
            layout:'list',
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
        this._unsubscribe();
    }

    get_categories=()=>{
        const{user}=this.state;
        fetch(`${api_url}categories/${user.c_id}`,{
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            // console.log("cateogries",json);
            this.setState({categories:json});
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    init=()=>{   
        this.props.navigation.setParams({actions:this.actions,title:'Stock Management'})     
        _getUser().then(user=>this.setState({user},()=>{
            this.getProducts()
            this.get_categories()
        }));
    }

    getProducts=()=>{
        const{user}=this.state;
        console.log("user",user);
        try {
            this.setState({loading:true});
            fetch(`${api_url}products/${user.c_id}`,{
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                this.setState({loading:false});
                console.log("products",json);
                this.setState({products:json,productsAll:json});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    filter=()=>{
        const{productsAll,selectedCategory}=this.state;
        var data=[];
        if(selectedCategory!=null){
            data=productsAll.filter(dt=>dt.cat_id==selectedCategory.cat_id);
        }else{
            data=productsAll;
        }
        console.log("filtered data",data);
        this.setState({products:data});
    }

    render(){
        let{selectedCategory,layout}=this.state;
        return(
            <Block>                
               <FlatList keyboardShouldPersistTaps="always"
                    data={this.state.products}
                    key={(layout=='list' ? 'v' : 'h')}
                    keyExtractor={(item, index)=>index.toString()}
                    style={{flex:1}}
                    renderItem={({item})=><StockListCard isOrderButton={false} item={item} layout={layout} onPress={item=>this.props.navigation.navigate('SingleStock',{item})}  />}
                    numColumns={layout=='list'?1:3}
                    ListEmptyComponent={(
                        <Block center paddingVertical={100} >
                            <MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                            <Text>No Products Yet</Text>
                        </Block>
                    )}
                    refreshControl={<RefreshControl onRefresh={()=>{}} refreshing={this.state.loading} />}
                    maxToRenderPerBatch={15}
                    initialNumToRender={20}
                    stickyHeaderIndices={[0]}
                    ListHeaderComponent={()=>{
                        return(
                            <Block paddingHorizontal={15} row center color={theme_light_color}>
                                <Block>
                                    <SearchableDropdown placeholder="Select Category" data={this.state.categories} labelKey="cat_name" searchKey="cat_name" onSelect={item=>this.setState({selectedCategory:item},()=>this.filter())} defaultValue={selectedCategory!=null?selectedCategory.cat_name:''} />
                                </Block>
                                <IconButton
                                    icon="view-grid"
                                    size={20}
                                    onPress={()=>this.setState({layout:'grid'})}
                                    color={layout=='grid'?theme_color:'#585858'}
                                />
                                <IconButton
                                    icon="format-list-text"
                                    size={20}
                                    onPress={()=>this.setState({layout:'list'})}
                                    color={layout=='list'?theme_color:'#585858'}
                                />
                            </Block>
                        )
                    }}
               /> 
               {/* <FloatIcon onPress={()=>this.props.navigation.navigate('AddProduct')} /> */}
            </Block>
        );
    }
}