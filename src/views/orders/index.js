import { Block, Text } from "expo-ui-kit";
import React from "react";
import { Alert, Dimensions, FlatList,  Image,  ImageBackground, RefreshControl, StyleSheet, TouchableNativeFeedback, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, site_url, sum_column, sum_column_with_mul, theme_color, theme_light_color } from "../../global/variables";
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
import PopUp from "../../components/popupmenu";
import { MenuOption } from "react-native-popup-menu";
import CancelOrderModal from "../../components/dialogs/cancel_order";
import CartIconHeader from "../../components/cart_icon_header";
import NotificationIcon from "../../components/notification_icon";
import CustomOrderModal from "../../components/dialogs/custom_order";
import AcceptOrderModal from "../../components/dialogs/accept_order";

export default class OrderList extends React.Component{
    actions = (
        null
    );
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
        this.props.navigation.setParams({actions:this.actions,title:'Total Orders'})      
        _getUser().then(user=>this.setState({user},()=>{
            this.getCustomers();
        }));
    }

    getOrderItems=()=>{
        const{user,selectedCustomer}=this.state;
        console.log("user",user);
        try {
            this.setState({loading:true});
            getOrdersItemsAll(user.c_id)
            .then(json=>{
                this.setState({loading:false});
                console.log("products",json);
                if(this.props.route.params)
                {
                    let{filter}=this.props.route.params;                    
                    if(filter!=undefined){
                        console.log("filter",filter);
                        switch (filter) {
                            case 'pending':
                                this.props.navigation.setParams({title:'Pending Orders'});
                                json=json.filter(dt=>dt.order_status=='0' && dt.is_cancelled=='0');                            
                                break;
                            case 'cancelled':
                                this.props.navigation.setParams({title:'Cancelled Orders'});
                                json=json.filter(dt=>dt.is_cancelled=='1');                            
                                break;                        
                            case 'approved':
                                this.props.navigation.setParams({title:'Approved Orders'});
                                json=json.filter(dt=>dt.order_status=='1' && dt.is_cancelled=='0');                            
                                break;                        
                            case 'in_process':
                                this.props.navigation.setParams({title:'In Process Orders'});
                                json=json.filter(dt=>dt.order_status=='1' && dt.is_cancelled=='0');                            
                                break;                        
                            case 'in_transit':
                                this.props.navigation.setParams({title:'In Transit Orders'});
                                json=json.filter(dt=>dt.order_status=='2' && dt.is_cancelled=='0');                            
                                break;                         
                            case 'completed':
                                this.props.navigation.setParams({title:'Completed Orders'});
                                json=json.filter(dt=>dt.order_status=='3' && dt.is_cancelled=='0');                            
                                break;                         
                            default:
                                break;
                        }
                    }
                }
                var products=json;
                if(this.props.route.params){
                    let{item}=this.props.route.params;
                    
                    if(item)
                    products=products.filter(dt=>dt.user_id==item.u_id);
                    
                }else{
                    if(json.length<=0 && !this.state.mounted){
                        this.setState({mounted:true},()=>{
                            this.props.navigation.navigate('Products');
                        })
                    }
                }

                if(selectedCustomer!=null && selectedCustomer.name!="All") products=products.filter(dt=>dt.user_id==selectedCustomer.u_id);
                // var expandedId=this.state.expandedId?this.state.expandedId:products.length>0?products[0].cust_id:'';
                this.setState({orderItems:products,orderItemsAll:json,supplierCount:products.length,totalItems:json.length,selectedItems:[]});
            })
            .catch(err=>{
                console.log("get order err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
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
                json=json.filter(dt=>parseInt(dt.total_orders)>0);
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
        const{user,selectedCustomer,selectedItems}=this.state;
        try {
            this.setState({loading:true});
            let fd = new FormData();
            fd.append('reason',reason);
            fd.append('cust_id',selectedCustomer.u_id);
            if(selectedItems.length>0){
                selectedItems.map(dt=>{
                    fd.append('order_id[]',dt.order_id);
                    fd.append('order_no[]',dt.order_no);
                })
            }else{
                fd.append('order_id[]',item.order_id);
            }
            fetch(`${api_url}cancel_order/${user.c_id}`,{
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
    acceptOrder=(date,item,remarks)=>{
        const{user,selectedCustomer,selectedItems}=this.state;
        try {
            this.setState({loading:true});
            let fd = new FormData();
            fd.append('delivery_date',date);
            fd.append('remarks',remarks);
            fd.append('cust_id',selectedCustomer.u_id);
            if(selectedItems.length>0){
                selectedItems.map(dt=>{
                    fd.append('order_id[]',dt.order_id);
                    fd.append('order_no[]',dt.order_no);
                })
            }else{
                fd.append('order_id[]',item.order_id);
            }
            fetch(`${api_url}accept_order/${user.c_id}`,{
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
        const{user,selectedCustomer,selectedItems}=this.state;
        try {
            this.setState({loading:true});
            let fd = new FormData();
            fd.append('status',status);
            fd.append('action_by',action_by);
            fd.append('cust_id',selectedCustomer.u_id);
            if(selectedItems.length>0){
                selectedItems.map(dt=>{
                    fd.append('order_id[]',dt.order_id);
                    fd.append('order_no[]',dt.order_no);
                })
            }else{
                fd.append('order_id[]',item.order_id);
            }
            fetch(`${api_url}update_order/${user.c_id}`,{
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

    // _renderCustomerWise=({item,index})=>{
    //     console.log("index",index);
    //     const{layout,selectedItems}=this.state;
    //     let fltr=this.props.route.params?this.props.route.params.filter:null;
    //     return(<OrderListCard selectedItems={selectedItems} fltr={fltr} onCheck={items=>this.setState({selectedItems:items})} onUpdateOrderStatus={this.onUpdateOrderStatus} loading={this.state.loading} item={item} layout={layout} onPress={item=>this.props.navigation.navigate('SingleProduct',{item,isOrder:true})} onActionPress={(type,item)=>this.onActionPress(type,item)} />);
    //     // return(
    //     //     <List.Accordion title={`${item.user_name} `} titleStyle={{fontSize:20,fontFamily:'fontBold',color:theme_color}} style={{padding:0,backgroundColor:theme_light_color,marginHorizontal:10,borderRadius:7,marginTop:5}} expanded={true}>
    //     //         <FlatList keyboardShouldPersistTaps="handled"
    //     //             data={item.products}
    //     //             key={(layout=='list' ? 'v' : 'h')}
    //     //             keyExtractor={(item, index)=>index.toString()}
    //     //             contentContainerStyle={{flexGrow:1}}
    //     //             renderItem={({item})=><OrderListCard selectedItems={selectedItems} fltr={fltr} onCheck={items=>this.setState({selectedItems:items})} onUpdateOrderStatus={this.onUpdateOrderStatus} loading={this.state.loading} item={item} layout={layout} onPress={item=>this.props.navigation.navigate('SingleProduct',{item,isOrder:true})} onActionPress={(type,item)=>this.onActionPress(type,item)}  />}
    //     //             numColumns={layout=='list'?1:3}
    //     //             ListEmptyComponent={(
    //     //                 <Block center paddingVertical={100} >
    //     //                     <MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
    //     //                     <Text>No Products Yet</Text>
    //     //                 </Block>
    //     //             )}
    //     //        />    
    //     //     </List.Accordion>
    //     // )
    // }    

    _renderCustomerWise=({item})=>{
        const{layout}=this.state;
        return(
            <List.Item
            title={`${item.name}`}
            titleNumberOfLines={2}
            titleStyle={{fontSize:20,fontFamily:'fontBold',color:theme_color}}
            onPress={()=>this.props.navigation.navigate('OrderListIndex',{item})}
            left={props=>{
                return(
                <Block flex={0} justifyContent="center">
                {
                    item.company_profile ?
                    <Avatar.Image source={{uri:`${site_url}${item.company_profile}`}} size={40} /> :
                    <Avatar.Text label={item.name[0]} size={40} backgroundColor="#eee" color={theme_color} />
                }
                </Block>
            )}}
            right={()=>(
                <Block flex={0}>
                    <Text>Total Orders</Text>
                    <Text>{item.total_orders}</Text>
                </Block>
            )}
            
        />
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

    onAcceptSelected=()=>{
        this.setState({acceptOrderModal:true,selectedItem:null});
    }

    onRejectedSelected=()=>{
        this.setState({cancelOrderModal:true,selectedItem:null});
    }

    render(){
        let{selectedCategory,layout,selectedCustomer,selectedItems}=this.state;
        let fltr=this.props.route.params?this.props.route.params.filter:null;
        // if(selectedCustomer==null) return null;
        return(
            <Block>
                {
                    this.state.loading &&
                    <ProgressBar indeterminate={true} style={StyleSheet.absoluteFill} />
                }
                {/* <List.AccordionGroup expandedId={this.state.expandedId} onAccordionPress={expandedId=>this.setState({expandedId})}>              */}
                    <FlatList keyboardShouldPersistTaps="handled"
                        data={this.state.customers}
                        keyExtractor={(item, index)=>index.toString()}
                        contentContainerStyle={{flexGrow:1,paddingBottom:15}}
                        renderItem={this._renderCustomerWise}
                        ListEmptyComponent={(
                            <Block center paddingVertical={100} >
                                <MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                                <Text>No Orders Found For Customer {selectedCustomer!=null?selectedCustomer.name:'All'}</Text>
                            </Block>
                        )}
                        refreshControl={<RefreshControl onRefresh={()=>this.getOrderItems()} refreshing={this.state.loading} />}
                        maxToRenderPerBatch={15}
                        initialNumToRender={20}
                        ListHeaderComponent={()=>(
                            <Block paddingHorizontal={15} shadow borderRadius={10} white row center color={theme_light_color}>
                                <Block>
                                    <Block row>
                                        {
                                            fltr!=null && fltr!='completed' && fltr!='cancelled' &&
                                            <Block flex={0} marginRight justifyContent="flex-start">
                                                <Text style={[styles.inputLabel,{maxWidth:50,fontSize:16,marginBottom:10,textAlign:'center'}]} numOfLines={2}>All</Text>
                                                <Checkbox.Android
                                                    status={this.state.selectAll?'checked':'unchecked'}
                                                    color={theme_color}
                                                    onPress={()=>{
                                                        let sts=this.state.selectAll;
                                                        console.log("stsssssssss",sts);
                                                        this.setState({selectAll:!sts});
                                                        if(!sts){
                                                            this.setState({selectedItems:this.state.orderItems});
                                                        }else{
                                                            this.setState({selectedItems:[]});
                                                        }
                                                    }}
                                                />
                                            </Block>
                                        }
                                        {/* <Block>
                                            <Text style={styles.inputLabel}>Selected Client</Text>
                                            <SearchableDropdown  placeholder="Select Client" data={this.state.customers} labelKey="name" searchKey="name" onSelect={item=>this.setState({selectedCustomer:item},()=>this.getOrderItems())} defaultValue={selectedCustomer!=null?selectedCustomer.name:'All'} />
                                        </Block> */}
                                    </Block>
                                </Block>
                            </Block>
                        )}
                        stickyHeaderIndices={[0]}
                    />
                {/* </List.AccordionGroup>   */}
                {/* <FloatIcon onPress={()=>this.custom_order_modal.open()} attach_name="add_order" />  */}
                {
                    fltr!=null && fltr!='completed' && fltr!='cancelled' &&
                    <Block row center padding paddingLeft={15} color={theme_light_color}>
                        <Block>
                            {/* <Text style={{color:'white'}}>Selected Products <Text size={18} color={theme_color}>{selectedItems.length}</Text></Text> */}
                            <Block row center>
                                <Text style={{color:'black'}}><Text style={{fontFamily:'fontBold'}}>Total :</Text> Orders <Text size={18} color={theme_color}>{selectedItems.length}</Text></Text>
                                <Text style={{color:'black',marginLeft:15}}>Quantity <Text size={18} color={theme_color}>{sum_column(selectedItems,'quantity')}</Text></Text>
                            </Block>
                            <Text size={25} color={theme_color}>{'\u20B9 '+sum_column_with_mul(selectedItems,'quantity','p_price')}</Text>
                        </Block>
                        <Block flex={0}>
                            {
                                fltr=='pending' ?
                                (
                                    <Block flex={0}>
                                        <Button icon="check" disabled={selectedItems.length<=0} color="green" onPress={()=>this.onAcceptSelected()}>Accept</Button>
                                        <Button icon="close" disabled={selectedItems.length<=0} color="red" onPress={()=>this.onRejectedSelected()}>Reject</Button>
                                    </Block>
                                ):
                                (
                                    <PopUp disabled={selectedItems.length<=0} element={<Block padding flex={0}><Text>{fltr.toUpperCase()}</Text></Block>} >
                                        <MenuOption onSelect={() => this.onUpdateOrderStatus(2,null)} text="In Process" />
                                        <Divider />
                                        <MenuOption onSelect={() => this.onUpdateOrderStatus(3,null)} text="Ready For Dispatch" />
                                        <Divider />
                                        <MenuOption onSelect={() => this.onRejectedSelected()} text="Reject" />
                                        <Divider />
                                    </PopUp>
                                )
                            }
                        </Block>
                    </Block>
                }
                <CancelOrderModal loading={this.state.loading} onCancel={(reason,item)=>this.cancelOrder(reason,item)} selectedItem={this.state.selectedItem} visible={this.state.cancelOrderModal} onDismiss={()=>this.setState({cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems())} />              
                <AcceptOrderModal loading={this.state.loading} onAccept={(reason,item)=>this.acceptOrder(reason,item)} selectedItem={this.state.selectedItem} visible={this.state.acceptOrderModal} onDismiss={()=>this.setState({acceptOrderModal:false,selectedItem:null},()=>this.getOrderItems())} />              
                <Snack ref={ref=>this.snack=ref} />
                <AddToCartModal loading={this.state.loading} onAttChange={selectedItem=>this.setState({selectedItem})} selectedItem={this.state.selectedItem} visible={this.state.addToCartModal} onDismiss={()=>this.setState({addToCartModal:false,selectedItem:null})} onAdd={(qty,instructions,item)=>this.save(qty,instructions,item)} />
            </Block>
        );
    }
}