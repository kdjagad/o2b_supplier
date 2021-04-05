import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList,  Image,  ImageBackground, RefreshControl, TouchableNativeFeedback, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, theme_color, theme_light_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { Avatar, Button, Card, Divider, IconButton, List, Paragraph, Title } from "react-native-paper";
import * as Contacts from 'expo-contacts';
import SearchBar from 'react-native-searchbar';
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import { styles } from "../../global/style";
import SearchableDropdown from "../../components/searchable_dropdown";
import ProductListCard from "../../components/cards/product_list";
import AppSearchBar from "../../components/searchbar";
import AddToCartModal from "../../components/dialogs/add_to_cart";
import { Alert } from "react-native";
import PopUp from "../../components/popupmenu";
import { MenuOption } from "react-native-popup-menu";
import * as IntentLauncher from 'expo-intent-launcher';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import mime from 'mime';
import moment from "moment";
import Snack from "../../components/snack";
const product_grid_width=(Dimensions.get('window').width-20)/3;
export default class ProductList extends React.Component{

    actions=(
        <Block row center flex={0}>
            {/* <PopUp element={<IconButton icon="file-excel" color="white" style={styles.circleIcon} />} >
                <MenuOption onSelect={() => this.downloadExcel()} >
                    <Block row center>
                        <MaterialCommunityIcons name="download" size={20} />
                        <Text style={{marginLeft:10}}>Download Excel</Text>
                    </Block>
                </MenuOption>
                <Divider />
                <MenuOption onSelect={() =>this.uploadExcel() } >
                    <Block row center>
                        <MaterialCommunityIcons name="upload" size={20} />
                        <Text style={{marginLeft:10}}>Upload Excel</Text>
                    </Block>
                </MenuOption>
            </PopUp> */}
            <IconButton icon="file-excel" size={30} onPress={()=>this.props.navigation.navigate('ProductInformation')} color="white" style={styles.circleIcon} />
            <IconButton icon="plus" size={30} onPress={()=>this.addProduct()} color="white" style={styles.circleIcon} />
        </Block>
    );
    

    

    constructor(props){
        super(props);
        this.state={
            products:[],
            productsAll:[],
            customers:[],
            categories:[],
            selectedCategory:null,
            user:[],
            loading:false,
            layout:'list',
            expandedId:0,
            selectedItem:null,
            addToCartModal:false,
            total_orders:0,
            excelFile:null,
            total:0,
        }
    }


    uploadExcel=()=>{
        const{excelFile,user}=this.state;
        if(user.active_plan_id==0){
            try {
                console.log("snack",this.snack);
                alert('This Feature Is Only Available For Premium Members If you want to use this feature upgrade to Premium');
            } catch (error) {
                
            }
        }else{
            DocumentPicker.getDocumentAsync().then(res=>{
                console.log("document",res);
                this.setState({excelFile:res});
                try {  
                    this.setState({loading:true});
                    let fd=new FormData();
                    // fd.append('fileURL',excelFile);
                    if(res!=null){
                        let imageUri=res.uri;
                        const newImageUri =  "file:///" + imageUri.split("file:/").join("");
                        console.log("fileURL filename",newImageUri);
                        fd.append("fileURL",{
                            uri : newImageUri,
                            type: mime.getType(newImageUri),
                            name: newImageUri.split("/").pop()
                        });
                    }
                    console.log("formdata",fd);
                    fetch(`${api_url}product_list_import/${user.c_id}`,{
                        method:'POST',
                        headers:{
                            Authorization:api_key
                        },
                        body:fd,
                    })
                    .then(response=>response.json())
                    .then(json=>{
                        console.log("price list",json);
                        this.setState({loading:false});
                        if(json.status==1){
                            this.snack.show(json.message,'success');
                            this.getProducts();
                        }else{
                            this.snack.show(json.message,'danger');
                        }
                    })
                    .catch(err=>{
                        console.log("json err",err);
                        this.setState({loading:false});
                    })
                } catch (error) {
                    
                }
            })
        }
    }

    downloadExcel=()=>{
        const{user}=this.state;
        if(user.active_plan_id==0){
            try {
                // console.log("snack",);
                alert('This Feature Is Only Available For Premium Members If you want to use this feature upgrade to Premium');
            } catch (error) {
                
            }
        }else{
            try {  
                this.setState({loading:true});
                // let fd=new FormData();
                fetch(`${api_url}product_list_export/${user.c_id}`,{
                    headers:{
                        Authorization:api_key
                    },
                })
                .then(response=>response.json())
                .then(async json=>{
                    console.log("price list",json);
                    this.setState({loading:false});
                    if(json.status==1){
                        const callback = downloadProgress => {
                            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                            this.setState({
                                downloadProgress: progress,
                            });
                        };
                        
                        const downloadResumable = FileSystem.createDownloadResumable(
                            json.url,
                            FileSystem.cacheDirectory + `product_list_${moment(new Date()).format('DD-MM-YYYY')}.xlsx`,
                            {},
                            callback
                        );
    
                        try {
                            const { uri } = await downloadResumable.downloadAsync();
                            console.log('Finished downloading to ', uri);
                            this.snack.show("Import Successful If you want to open file you can open from here",'success',<Button onPress={()=>{
                                FileSystem.getContentUriAsync(uri).then(cUri => {
                                    console.log(cUri);
                                    IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                                      data: cUri,
                                      flags: 1,
                                    });
                                });
                            }}>Open Now</Button>)
                        } catch (e) {
                            console.error(e);
                        }
                    }
                })
                .catch(err=>{
                    console.log("json err",err);
                    this.setState({loading:false});
                })
            } catch (error) {
                
            }
        }
    }

    addProduct=()=>{
        const{total,user}=this.state;
        console.log("total",parseInt(total));
        if((parseInt(total)<=10 && parseInt(user.active_plan_id)==0) || parseInt(user.active_plan_id)>0){
            this.props.navigation.navigate('AddProduct')
        }else{
            Alert.alert("Upgrade To Pro","Your Free Products Limit Reached Please Upgrade To Premium For More Products");
        }
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
                total_orders:json.data.total,
            })
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    componentDidMount(){
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }

    formatProducts=(data)=>{
        let newProducts = Object.values(data.reduce((acc, item) => {
            if (!acc[item.cat_id]) acc[item.cat_id] = {
                cat_id: item.cat_id,
                cat_name:item.cat_name,
                products: []
            };
            acc[item.cat_id].products.push(item);
            return acc;
        }, {}))
        return newProducts;
    }

    componentWillUnmount(){
        this._unsubscribe();
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
                
                this.setState({customers:json});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
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
        this.props.navigation.setParams({actions:this.actions,title:'Total Products'})     
        _getUser().then(user=>this.setState({user},()=>{
            this.getProducts()
            this.get_categories()
            this.getCustomers();
            this.getOrderDashData();
        }));
    }

    onPlaceOrder=(qty,instructions,item,user)=>{
        console.log("cart",item);
        var atts=item.attributes.filter(att=>att.a_value.includes(','));
        var attrs=item.attributes.filter(att=>att.selected!=undefined);
        console.log('attrs',attrs);
        if(user==null || !user){
            alert("Please Select Client");
        }else if(qty<=0){
            alert("Please Enter At Least 1 Quantity");
        }else if(attrs.length<atts.length){
            alert("Please select at lease one value from all attributes");
        }else{
            // const{user}=this.state;
            let price=(item.c_price==null)?item.p_price:item.c_price;
            try {
                this.setState({loading:true});
                let fd=new FormData();
                fd.append('cart_id[]',0);
                fd.append('p_id[]',item.p_id);
                fd.append('cust_id[]',item.cust_id);
                fd.append('additional_notes[]',instructions);
                fd.append('amount[]',price*qty);
                fd.append('quantity[]',qty);
                fd.append('attributes[]',JSON.stringify(item.attributes));
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
                    this.setState({loading:false,addToCartModal:false,selectedItem:null});
                    // var type=json.status==1?'success':'danger';
                    // this.snack.show(json.message,type);
                    this.props.navigation.navigate('MyOrders');
                })
                .catch(err=>{
                    console.log("json err",err);
                    this.setState({loading:false,addToCartModal:false,selectedItem:null});
                })
            } catch (error) {
                
            }
        }
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
                if(this.props.route.params)
                {
                    let{filter}=this.props.route.params;                    
                    if(filter!=undefined){
                        switch (filter) {
                            case 'enabled':
                                this.props.navigation.setParams({title:'Enabled Products'});
                                json=json.filter(dt=>dt.status=='1');                            
                                break;
                            case 'disabled':
                                this.props.navigation.setParams({title:'Disabled Products'});
                                json=json.filter(dt=>dt.status=='0');                            
                                break;                                                
                            default:
                                break;
                        }
                    }
                }
                var products=this.formatProducts(json);                
                this.setState({total:json.length,products,productsAll:json,expandedId:this.state.expandedId>0?this.state.expandedId:products.length>0?products[0].cat_id:0});
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

    onOrderPress=(item)=>{
        const{total_orders,user}=this.state;
        if((user.active_plan_id==0 && parseInt(total_orders).length<=50) || user.active_plan_id>0)
        {
            this.setState({selectedItem:item,addToCartModal:true});
        }else{
            Alert.alert("Upgrade To Pro","You Have Reached Your Free Order place limit if you want to add more orders you need to upgrade to premium.");
        }
    }

    renderCategoryWise=(pitem)=>{
        //console.log("index",index);
        pitem=pitem.item;
        if(pitem==null)return null;
        const{layout,selectedCategory}=this.state;
        let client=null;
        if(this.props.route.params){
            client=this.props.route.params.client;
        }
        return(
            <List.AccordionGroup>
            <List.Accordion title={`${pitem.cat_name} (${pitem.products.length})`} titleStyle={{fontSize:20,fontFamily:'fontBold',color:theme_color}} style={{padding:0,backgroundColor:theme_light_color,marginHorizontal:10,borderRadius:7,marginTop:5}} id={pitem.cat_id}>
                <FlatList keyboardShouldPersistTaps="handled"
                    data={pitem.products}
                    key={(layout=='list' ? 'v' : 'h')}
                    keyExtractor={(item, index)=>index.toString()}
                    contentContainerStyle={{flexGrow:1}}
                    renderItem={({item})=><ProductListCard onShowHide={()=>this.getProducts()} client={client} item={item} {...this.props} onWishPress={(item,type)=>this.onFavourite(item,type)} layout={layout} onPress={item=>{
                        console.log("single product",item);
                        this.props.navigation.navigate('SingleProduct',{item:item});
                    }} onOrderPress={item=>this.onOrderPress(item)} />}
                    numColumns={layout=='list'?1:3}
                    ListEmptyComponent={(
                        <Block center paddingVertical={100} >
                            <MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                            <Text>No Product Yet</Text>
                        </Block>
                    )}
                />    
            </List.Accordion>
            </List.AccordionGroup>
        )
    }

    onSearch=(val)=>{
        const{productsAll}=this.state;
        val=val.toLowerCase();
        var data=productsAll;
        if(val.length>0){
            data=productsAll.filter(dt=>{
                return  dt.p_title.toLowerCase().match(val) ||
                        dt.cat_name.toLowerCase().match(val) ||
                        dt.p_description.toLowerCase().match(val);
            })
        }
        var products=this.formatProducts(data);
        this.setState({products});
    }

    render(){
        let{selectedCategory,layout}=this.state;
        let client=null;
        if(this.props.route.params){
            let{item}=this.props.route.params;
            client=item?item:null;
        }
        return(
            <Block> 
               <Block margin row center white>
                    <Block>
                        <AppSearchBar placeholder="Search Products" onChangeText={val=>this.onSearch(val)} />
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
               <List.AccordionGroup expandedId={this.state.expandedId} onAccordionPress={expandedId=>this.setState({expandedId})} >
               <FlatList keyboardShouldPersistTaps="handled"
                        data={this.state.products}
                        // key={(layout=='list' ? 'v' : 'h')}
                        keyExtractor={(item, index)=>index.toString()}
                        contentContainerStyle={{flexGrow:1,paddingBottom:80}}
                        // contentContainerStyle={{flexGrow:1}}
                        renderItem={this.renderCategoryWise}
                        // numColumns={layout=='list'?1:3}
                        ListEmptyComponent={(
                            <Block center paddingVertical={100} >
                                <MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                                <Text>No Products Yet</Text>
                            </Block>
                        )}
                        refreshControl={<RefreshControl onRefresh={()=>this.init()} refreshing={this.state.loading} />}
                        maxToRenderPerBatch={15}
                        initialNumToRender={20}
                />
                </List.AccordionGroup>
                <Snack ref={ref => this.snack = ref} />
                <AddToCartModal customers={this.state.customers} onAttChange={selectedItem=>this.setState({selectedItem})} loading={this.state.loading} onAdd={(qty,instructions,item,user)=>this.onPlaceOrder(qty,instructions,item,user)} selectedItem={this.state.selectedItem} visible={this.state.addToCartModal} onDismiss={()=>this.setState({addToCartModal:false,selectedItem:null},()=>this.init())} />
               {/* <FloatIcon onPress={()=>this.props.navigation.navigate('AddProduct')} /> */}
            </Block>
        );
    }
}