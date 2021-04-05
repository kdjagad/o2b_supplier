import { Block, Text } from "expo-ui-kit";
import React from "react";
import { Alert, Dimensions, FlatList, Image, ImageBackground, RefreshControl, StyleSheet, TouchableNativeFeedback, View } from "react-native";
import { api_key, api_url, site_url, theme_color, theme_light_color } from "../../global/variables";
import * as Icon from '@expo/vector-icons';
import { ActivityIndicator, Appbar, Avatar, Button, Card, Dialog, Divider, IconButton, List, Paragraph, Portal, ProgressBar, TextInput, Title } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import {  _getUser } from "../../global/auth";
import Snack from "../../components/snack";
import AddUnitModal from "../../components/dialogs/add_unit";
import { styles } from "../../global/style";
import SearchableDropdown from "../../components/searchable_dropdown";
import ProductViewModal from "../../components/dialogs/product_view";
import PopUp from "../../components/popupmenu";
import { MenuOption } from "react-native-popup-menu";
import ProductList from "../products";
import * as Notifications from 'expo-notifications';

export default class AddOrder extends React.Component {
    actions = null;
    constructor(props) {
        super(props);
        this.state = {
            products: [],
            productsAll: [],
            customers:[],
            customersAll:[],
            selectedCustomer:null,
            user: [],
            loading: false,
            editItem:'',
            selectedItem:null,
        }
    }

    componentDidMount() {
        Notifications.addNotificationReceivedListener(this.init);
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }
    componentWillUnmount() {
        this._unsubscribe;
    }

    init = () => {
        this.props.navigation.setParams({ actions: this.actions, title: 'Price List' })
        _getUser().then(user => this.setState({ user }, () => {
            this.getCustomers()
            // this.get_priceList()
        }));
    }

    

    _renderPriceList = ({ item }) => {
        const preview = require('../../assets/images/o2b_placeholder.png');
        var uri = item.images.length>0?item.images[0]:null;
        var source=preview;
        if(uri!=null){
            let filename = uri.split('/').pop();
            let fileparts=filename.split('.');
            let filenm=fileparts[0];
            let ext=fileparts[1];
            let thumbfile=filenm+'_thumb.'+ext;
            uri=uri.replace(filename,thumbfile);
            source={uri:uri,cache:'force-cache'};
        }
        return (
            <List.Item
                title={`${item.p_title}`}
                titleStyle={{ fontFamily: 'fontBold', fontSize: 13 }}
                description={`General Price - ${item.p_price?item.p_price:''}`}
                descriptionStyle={{color:theme_color,fontFamily:'fontLight',fontSize:17}}
                style={{ borderBottomWidth: 1, borderColor: '#ccc', paddingHorizontal: 15,paddingVertical:0 }}
                onPress={()=>this.setState({selectedItem:item},()=>this.product_view_modal.open())}
                right={() => (
                    <Block flex={0.5}>
                        <Text style={[styles.inputLabel,{fontSize:17}]}>Custom Price</Text>
                        <TextInput placeholderTextColor="#ccc"
                            value={item.c_price}
                            onChangeText={text => {
                                let {priceList}=this.state;
                                let ind=priceList.indexOf(item);
                                item={
                                    ...item,
                                    c_price:text,
                                }
                                priceList[ind]=item;
                                this.setState({priceList});
                            }}
                            placeholder={item.p_price}
                            underlineColor={theme_color}
                            style={styles.textInput}
                            dense={true}         
                            keyboardType="decimal-pad"     
                            onBlur={()=>{
                                if(item.c_price)
                                    this.save(item)
                            }}              
                        />
                    </Block>
                )}
                left={() => (
                    <Block flex={0} justifyContent="center">
                        <Card.Cover source={source} resizeMethod="scale" resizeMode="contain" style={{width:50,height:50,borderRadius:10}} />
                    </Block>
                )}
            />
        )
    }

    getCustomers=()=>{
        const{user}=this.state;
        try {  
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('type','joined');
            fetch(`${api_url}customers/${user.c_id}`,{
                method:'POST',
                headers:{
                    Authorization:api_key
                },
                body:fd,
            })
            .then(response=>response.json())
            .then(json=>{
                this.setState({loading:false});
                
                this.setState({customers:json,customersAll:json,selectedCustomer:json[0]});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    render() {
        const{selectedCustomer}=this.state;
        return (
            <Block>
                {
                    this.state.loading &&
                    <ProgressBar indeterminate={true} style={StyleSheet.absoluteFill} />
                }
                <ProductList {...this.props} is_add_order={true} onAddOrderPress={()=>{}} />               
                <Block paddingHorizontal={15} marginBottom shadow borderRadius={10} white row center color={theme_light_color}>
                    <Block>
                        <Text style={styles.inputLabel}>Selected Client</Text>
                        <SearchableDropdown placeholder="Select Client" data={this.state.customers} labelKey="name" searchKey="name" onSelect={item=>this.setState({selectedCustomer:item})} defaultValue={selectedCustomer!=null?selectedCustomer.name:''} />
                    </Block>
                </Block>
                
                <Snack ref={ref => this.snack = ref} />
            </Block>
        );
    }
}