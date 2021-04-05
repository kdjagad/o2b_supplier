import { Block, Text } from "expo-ui-kit";
import React from "react";
import { Alert, Dimensions, FlatList,  Image,  ImageBackground, RefreshControl, StyleSheet, TouchableNativeFeedback, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, sum_column, sum_column_with_mul, theme_color, theme_light_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { ActivityIndicator, Appbar, Avatar, Button, Card, Checkbox, Dialog, Divider, IconButton, List, Paragraph, Portal, ProgressBar, TextInput, Title } from "react-native-paper";
import * as Contacts from 'expo-contacts';
import SearchBar from 'react-native-searchbar';
import FloatIcon from "../../components/float_icon";
import { _getUser,getOrderItemsAll, getOrdersItemsAll } from "../../global/auth";
import { styles } from "../../global/style";
import SearchableDropdown from "../../components/searchable_dropdown";
import AppSearchBar from "../../components/searchbar";
import * as Animatable from 'react-native-animatable';
import ProductListCard from "../../components/cards/product_list";
import AddToCartModal from "../../components/dialogs/add_to_cart";
import CartListCard from "../../components/cards/cart_list";
import Snack from "../../components/snack";
import OrderListCard from "../../components/cards/order_list";
import * as Icon from '@expo/vector-icons';
import PopUp from "../../components/popupmenu";
import { MenuOption } from "react-native-popup-menu";
import CancelOrderModal from "../../components/dialogs/cancel_order";
import CartIconHeader from "../../components/cart_icon_header";
import NotificationIcon from "../../components/notification_icon";
import CustomOrderModal from "../../components/dialogs/custom_order";
import AcceptOrderModal from "../../components/dialogs/accept_order";
import ProductViewModal from "../../components/dialogs/product_view";
import moment from 'moment';

export default class TrackList extends React.Component{
    actions = null;
    constructor(props){
        super(props);
        this.state={
            orderItems:[],
            orderItemsAll:[],
            user:[],
            loading:false,
            layout:'list',
            cancelOrderModal:false,
            selectedItem:null,
            quantity:'0',
            instructions:'',
            expandedId:0,
            grandTotal:0,
            supplierCount:0,
            totalItems:0,
            mounted:false,
            addToCartModal:false,
            acceptOrderModal:false,
            customers:[],
            customersAll:[],
            selectedCustomer:null,
            selectAll:false,
            selectedItems:[],
        }
    }

    componentDidMount(){
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
        this.props.navigation.setParams({title:'In Transit Orders'})      
        _getUser().then(user=>this.setState({user},()=>{
            this.getCustomers();
        }));
    }

    getCustomers=()=>{
        const{user,selectedCustomer}=this.state;
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
                if(selectedCustomer==null) this.setState({selectedCustomer:json[0]});
                this.setState({customers:json,customersAll:json},()=>this.getOrderItems());
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    getOrderItems=()=>{
        const{user,selectedCustomer}=this.state;
        console.log("usertttttttttt",user);
        try {
            this.setState({loading:true});
            fetch(`${api_url}track_list/${user.c_id}`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                this.setState({loading:false});
                console.log("products",json);
                let{data}=json;
                if(this.props.route.params)
                {
                    let{filter}=this.props.route.params;                    
                    if(filter!=undefined){
                        console.log("filter",filter);
                        switch (filter) {                                                    
                            case 'in_transit':
                                this.props.navigation.setParams({title:'In Transit Orders'});
                                data=data.filter(dt=>dt.confirm_received=='0');                            
                                break;                         
                            case 'completed':
                                this.props.navigation.setParams({title:'Completed Orders'});
                                data=data.filter(dt=>dt.confirm_received=='1');                            
                                break;                         
                            default:
                                break;
                        }
                    }
                }
                data=data.filter(dt=>dt.cust_id==selectedCustomer.u_id);
                this.setState({orderItems:data,orderItemsAll:data});
            })
            .catch(err=>{
                console.log("get order err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    onActionPress=(type,item)=>{
        console.log("item type",item);
        switch (type) {
            case 'reject_order':
                this.setState({cancelOrderModal:true,selectedItem:item})
                break;       
            case 'accept_order':
                this.setState({acceptOrderModal:true,selectedItem:item})
                break;       
            default:
                break;
        }
    }

    cancelOrder=(reason,item)=>{
        const{user}=this.state;
        try {
            this.setState({loading:true});
            let fd = new FormData();
            fd.append('reason',reason);
            fd.append('cust_id',item.user_id);
            fd.append('sup_id',item.cust_id);
            fetch(`${api_url}cancel_order/${item.order_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("resp",json);
                this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
                // var type=json.status==1?'success':'danger';
                // this.snack.show(json.message,type);
            })
            .catch(err=>{
                console.log("cancel order err",err);
                this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
            })
        } catch (error) {
            
        }
    }
    acceptOrder=(date,item)=>{
        const{user}=this.state;
        try {
            this.setState({loading:true});
            let fd = new FormData();
            fd.append('delivery_date',date);
            fd.append('cust_id',item.user_id);
            fd.append('sup_id',item.cust_id);
            fetch(`${api_url}accept_order/${item.order_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("resp",json);
                this.setState({loading:false,acceptOrderModal:false,selectedItem:null},()=>this.getOrderItems());
                // var type=json.status==1?'success':'danger';
                // this.snack.show(json.message,type);
            })
            .catch(err=>{
                console.log("accept order err",err);
                this.setState({loading:false,acceptOrderModal:false,selectedItem:null},()=>this.getOrderItems());
            })
        } catch (error) {
            
        }
    }

    onUpdateOrderStatus=(status,item,action_by="supplier")=>{
        const{user}=this.state;
        try {
            this.setState({loading:true});
            let fd = new FormData();
            fd.append('status',status);
            fd.append('action_by',action_by);
            fd.append('cust_id',item.user_id);
            fd.append('sup_id',item.cust_id);
            fetch(`${api_url}update_order/${item.order_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("resp",json);
                this.setState({loading:false,acceptOrderModal:false,selectedItem:null},()=>this.getOrderItems());
                // var type=json.status==1?'success':'danger';
                // this.snack.show(json.message,type);
            })
            .catch(err=>{
                console.log("update order status err",err);
                this.setState({loading:false,acceptOrderModal:false,selectedItem:null},()=>this.getOrderItems());
            })
        } catch (error) {
            
        }
    }

    deleteCartItem=(item)=>{
        Alert.alert(
            'Remove Item',
            'Are You Sure To Want Remove This Product From Cart?',
            [
                {
                    text:'Yes',
                    onPress:()=>{
                        try {
                            this.setState({loading:true});
                            fetch(`${api_url}cart_item_remove/${item.cart_id}`,{
                                headers:{
                                    Authorization:api_key
                                }
                            })
                            .then(response=>response.json())
                            .then(json=>{
                                this.setState({loading:false},()=>this.getOrderItems());
                                var type=json.status==1?'success':'danger';
                                this.snack.show(json.message,type);
                                console.log("products",json);
                            })
                            .catch(err=>{
                                console.log("delete cart item err",err);
                                this.setState({loading:false},()=>this.getOrderItems());
                            })
                        } catch (error) {
                            console.log("delete cart item try catch err",error);
                            this.setState({loading:false},()=>this.getOrderItems());
                        }
                    }
                },
                {
                    text:'No',
                    onPress:()=>{}
                }
            ]
        )
    }

    formatProducts=(data)=>{
        let newProducts = Object.values(data.reduce((acc, item) => {
            if (!acc[item.user_id]) acc[item.user_id] = {
                user_id: item.user_id,
                user_name:item.user_name,
                products: []
            };
            acc[item.user_id].products.push(item);
            return acc;
        }, {}))
        return newProducts;
    }

    _renderCustomerWise=({item,index})=>{
        console.log("index",index);
        const{layout}=this.state;
        return(
            <List.Accordion title={`${item.user_name} (${item.products.length})`} titleStyle={{fontSize:20,fontFamily:'fontBold',color:theme_color}} style={{padding:0,backgroundColor:theme_light_color,marginHorizontal:10,borderRadius:7,marginTop:5}} expanded={true}>
                <FlatList keyboardShouldPersistTaps="handled"
                    data={item.products}
                    key={(layout=='list' ? 'v' : 'h')}
                    keyExtractor={(item, index)=>index.toString()}
                    contentContainerStyle={{flexGrow:1}}
                    renderItem={({item})=><OrderListCard onUpdateOrderStatus={this.onUpdateOrderStatus} loading={this.state.loading} item={item} layout={layout} onPress={item=>this.props.navigation.navigate('SingleProduct',{item,isOrder:true})} onActionPress={(type,item)=>this.onActionPress(type,item)} />}
                    numColumns={layout=='list'?1:3}
                    ListEmptyComponent={(
                        <Block center paddingVertical={100} >
                            <MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                            <Text>No Products Yet</Text>
                        </Block>
                    )}
               />    
            </List.Accordion>
        )
    }    

    onFavourite=(item,type)=>{
        const{user}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('p_id',item.p_id);
            fd.append('type',type);
            console.log("fd",fd);
            fetch(`${api_url}favourite/${user.c_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("resp",json);
                this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
                var type=json.status==1?'success':'danger';
                this.snack.show(json.message,type);
            })
            .catch(err=>{
                console.log("on favourite err",err);
                this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
            })
        } catch (error) {
            
        }
    }

    onPlaceOrder=()=>{
        const{orderItemsAll,user}=this.state;
        console.log("cart items",orderItemsAll)
        try {
            this.setState({loading:true});
            let fd=new FormData();
            orderItemsAll.forEach((cart, i) => {
                fd.append('cart_id[]',cart.cart_id);
                fd.append('p_id[]',cart.p_id);
                fd.append('cust_id[]',cart.cust_id);
                fd.append('additional_notes[]',cart.instructions);
                fd.append('amount[]',cart.total);
            });
            console.log("fd",fd);
            fetch(`${api_url}place_order/${user.c_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("resp",json);
                this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
                var type=json.status==1?'success':'danger';
                this.snack.show(json.message,type);
            })
            .catch(err=>{
                console.log("on palce order err",err);
                this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
            })
        } catch (error) {
            
        }
    }

    filter=(status)=>{
        const{orderItemsAll}=this.state;
        let data=orderItemsAll;
        // if(status>0)
        data=orderItemsAll.filter(dt=>parseInt(dt.order_status)==status);

        let orderItems=this.formatProducts(data);
        this.setState({orderItems,expandedId:orderItems.length>0?orderItems[0].cust_id:0});
    }

    save=(quantity,instructions,selectedItem)=>{
        // const{item}=this.props.route.params && this.props.route.params.item?this.props.route.params:'';
        const{user}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('ptitle',selectedItem.p_description);
            fd.append('pcode','');
            fd.append('pdes',selectedItem.p_description);
            fd.append('price',selectedItem.p_price);
            fd.append('sup_id',selectedItem.cust_id);
            fd.append('unit',0);
            fd.append('quantity',quantity);
            fd.append('order_description',instructions);

            selectedItem.images && selectedItem.images.forEach((item, i) => {
                fd.append("userfile[]", {
                  uri: item.uri,
                  type: "image/jpeg",
                  name: item.filename || `${Math.floor(Math.random() * 10000) + 1}-${i}.jpg`,
                });
            });
            // selectedItem.attributes && selectedItem.attributes.forEach((item, i) => {
            //     fd.append('att_name[]',item.ca_name);
            //     fd.append(item.ca_name.trim(),item.value);
            // });
            // let files_path='';
            // let already_files=[];
            // p_images.forEach((item,i)=>{
            //     already_files.push(item.uri.replace(site_url,''));
            // })
            fd.append('files_path','');
            console.log('fd',fd);
            fetch(`${api_url}custom_order/${user.c_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('product json',json);
                this.setState({loading:false,addToCartModal:false});
                if(json.status==1)this.snack.show(json.message,'success');
                else this.snack.show(json.message,'danger');
            })
            .catch(err=>{
                console.log("on save order err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            this.setState({loading:false});
            console.log("product_error",error);
        }
    }

    _renderTrackList = ({ item }) => {
        let{selectedItems}=this.state;
        let fltr=this.props.route.params?this.props.route.params.filter:null;
        // const preview = require('../../assets/images/o2b_placeholder.png');
        // var uri = item.images.length>0?item.images[0]:null;
        // var source=preview;
        // if(uri!=null){
        //     let filename = uri.split('/').pop();
        //     let fileparts=filename.split('.');
        //     let filenm=fileparts[0];
        //     let ext=fileparts[1];
        //     let thumbfile=filenm+'_thumb.'+ext;
        //     uri=uri.replace(filename,thumbfile);
        //     source={uri:uri,cache:'force-cache'};
        // }
        // var st=selectedItems.findIndex(dt=>dt.order_id==item.order_id);
        // if(item.dispatch_qty==undefined) item.dispatch_qty=item.pending_qty;
        var st=selectedItems.findIndex(dt=>dt.t_id==item.t_id);
        return (
            <List.Item
                title={`Transit On - ${moment(item.created).format('DD/MM/YYYY hh:mm a')}`}
                titleStyle={{ fontFamily: 'fontBold', fontSize: 18,color:theme_color }}
                description={()=>(
                    <Block>
                        <Block row center>
                            <Block flex={0.4}><Text bold style={{fontSize:11}}>Order No</Text></Block>
                            <Block flex={0.3}><Text bold style={{fontSize:11}}>Total Qty</Text></Block>
                            {/* <Block flex={0.2}><Text bold style={{fontSize:11}}>Pending Qty</Text></Block> */}
                            <Block flex={0.3}><Text bold style={{fontSize:11}}>Dispatch Qty</Text></Block>
                        </Block>
                        {
                            item.order_data && item.order_data.map(dt=>{
                                return(
                                    <Block row center marginBottom={5}>
                                        <Block flex={0.4}><Text>{dt.order_no}</Text></Block>
                                        <Block flex={0.3}><Text>{dt.quantity}</Text></Block>
                                        {/* <Block flex={0.2}><Text>{dt.quantity-dt.dispatch_qty}</Text></Block> */}
                                        <Block flex={0.3}><Text>{dt.dispatch_qty}</Text></Block>
                                    </Block>
                                )
                            })
                        }
                    </Block>
                )}
                descriptionStyle={{color:theme_color,fontFamily:'fontLight',fontSize:17}}
                style={{ borderBottomWidth: 1, borderColor: '#ccc', paddingHorizontal: 15,paddingVertical:0 }}
                // onPress={()=>this.setState({selectedItem:item},()=>this.product_view_modal.open())}
                left={()=>
                    {
                        fltr!='completed' ?
                        (<Block flex={0}>
                            <Checkbox.Android
                                status={st>=0?'checked':'unchecked'}
                                color={theme_color}
                                onPress={()=>{
                                    console.log("sttttttttttt",st);
                                    if(st<0){
                                        selectedItems.push(item);
                                    }else{
                                        selectedItems.splice(st,1);
                                    }
                                    // onCheck(selectedItems);
                                    this.setState({selectedItems});
                                }}
                            />
                        </Block>):
                        null
                    }
                }
                // right={() => (
                //     <Block flex={0.3}>
                //         <Text style={[styles.inputLabel,{fontSize:13}]}>Dispatch QTY</Text>
                //         <TextInput placeholderTextColor="#ccc"
                //             value={item.dispatch_qty}
                //             onChangeText={text => {
                //                 if(parseInt(text)>item.pending_qty){
                //                     alert(`Entered Quantity Is more than pending quantity : ${item.pending_qty}`);
                //                 }
                //                 let {orderItems}=this.state;
                //                 let ind=orderItems.indexOf(item);
                //                 let ind1=selectedItems.findIndex(dt=>dt.order_id==item.order_id);
                //                 item={
                //                     ...item,
                //                     dispatch_qty:text,
                //                 }
                //                 orderItems[ind]=item;
                //                 selectedItems[ind1]=item;
                //                 this.setState({orderItems,selectedItems});
                //                 console.log("selectedItem",this.state.selectedItems);                                
                //             }}
                //             placeholder={'Eg. 100'}
                //             underlineColor={theme_color}
                //             style={[styles.textInput,{textAlign:'right'}]}
                //             dense={true}         
                //             keyboardType="decimal-pad"     
                //             onBlur={()=>{
                //                 if(item.c_price)
                //                     this.save(item)
                //             }}   
                //             selectTextOnFocus={true} 
                //             disabled={st<0}          
                //         />
                //     </Block>
                // )}
                // left={() => (
                //     <Block flex={0} justifyContent="center">
                //         <Checkbox.Android
                //             status={st>=0?'checked':'unchecked'}
                //             color={theme_color}
                //             onPress={()=>{
                //                 console.log("sttttttttttt",st);
                //                 if(st<0){
                //                     selectedItems.push(item);
                //                 }else{
                //                     selectedItems.splice(st,1);
                //                 }
                //                 this.setState({selectedItems});
                //             }}
                //         />
                //     </Block>
                // )}
            />
        )
    }

    confirmDelivery=()=>{
        let{selectedItems,user}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            selectedItems.forEach((orderTrack, i) => {
                fd.append('t_id[]',orderTrack.t_id);
                fd.append('order_data[]',JSON.stringify(orderTrack.order_data));
            });
            fd.append('confirm_by','supplier');
            console.log("fd",fd);
            fetch(`${api_url}confirm_delivery/${user.c_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("resp",json);
                this.setState({loading:false,cancelOrderModal:false,selectedItem:null,selectedItems:[]},()=>this.getOrderItems());
                var type=json.status==1?'success':'danger';
                this.snack.show(json.message,type);
            })
            .catch(err=>{
                console.log("on palce order err",err);
                this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
            })
        } catch (error) {
            
        }
    }

    render(){
        let{selectedCategory,layout,selectedCustomer,orderItems,selectedItems}=this.state;
        let fltr=this.props.route.params?this.props.route.params.filter:null;
        return(
            <Block>
                {
                    this.state.loading &&
                    <ProgressBar indeterminate={true} style={StyleSheet.absoluteFill} />
                }
                <FlatList keyboardShouldPersistTaps="handled"
                    data={orderItems}
                    bouncesZoom={true}
                    zoomScale={1}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ flexGrow: 1,}}
                    renderItem={this._renderTrackList}
                    ListEmptyComponent={(
                        <Block center paddingVertical={100} >
                            <Icon.MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                            <Text>No Orders Found</Text>
                        </Block>
                    )}
                    refreshControl={<RefreshControl onRefresh={() => this.getPriceList()} refreshing={this.state.loading} />}
                    maxToRenderPerBatch={15}
                    initialNumToRender={20}
                    ListHeaderComponent={()=>(
                        <Block paddingHorizontal={15} marginBottom shadow borderRadius={10} white row center color={theme_light_color}>
                            <Block>
                                <Block row center>
                                    {
                                        fltr!='completed' &&
                                        <Block flex={0} marginRight>
                                            <Text style={[styles.inputLabel,{maxWidth:50,fontSize:16,textAlign:'center'}]} numOfLines={2}>Select All</Text>
                                            <Checkbox.Android
                                                status={this.state.selectAll?'checked':'unchecked'}
                                                color={theme_color}
                                                onPress={()=>{
                                                    let sts=this.state.selectAll;
                                                    console.log("stsssssssss",sts);
                                                    this.setState({selectAll:!sts});
                                                    if(!sts){
                                                        this.setState({selectedItems:orderItems});
                                                    }else{
                                                        this.setState({selectedItems:[]});
                                                    }
                                                }}
                                            />
                                        </Block>
                                    }
                                    <Block>
                                        <Text style={styles.inputLabel}>Selected Client</Text>
                                        <SearchableDropdown placeholder="Select Client" data={this.state.customers} labelKey="name" searchKey="name" onSelect={item=>this.setState({selectedCustomer:item},()=>this.getOrderItems())} defaultValue={selectedCustomer!=null?selectedCustomer.name:''} />
                                    </Block>
                                </Block>
                            </Block>
                        </Block>
                    )}
                    stickyHeaderIndices={[0]}
                />
                {
                    fltr!='completed' &&
                    <Block row center padding paddingLeft={15} color={theme_light_color}>
                        <Block>
                            {/* <Text style={{color:'white'}}>Selected Products <Text size={18} color={theme_color}>{selectedItems.length}</Text></Text> */}
                            <Block row center>
                                <Text style={{color:'black'}}><Text style={{fontFamily:'fontBold'}}>Total :</Text> Transit <Text size={18} color={theme_color}>{selectedItems.length}</Text></Text>
                                {/* <Text style={{color:'black',marginLeft:15}}>Quantity <Text size={18} color={theme_color}>{sum_column(selectedItems,'dispatch_qty')}</Text></Text> */}
                            </Block>
                            {/* <Text size={25} color={theme_color}>{'\u20B9 '+sum_column_with_mul(selectedItems,'dispatch_qty','p_price')}</Text> */}
                        </Block>
                        <Block flex={0}>
                            <Button disabled={selectedItems.length<=0} onPress={()=>this.confirmDelivery()}>Confirm Deliver</Button>
                        </Block>
                    </Block>
                }
                <Snack ref={ref => this.snack = ref} />
                <ProductViewModal item={this.state.selectedItem} onRef={ref=>this.product_view_modal=ref} {...this.props} />
            </Block>
        );
    }
}