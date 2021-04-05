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
import * as Notifications from 'expo-notifications';
import * as FileSystem from 'expo-file-system';
import * as Permissions from 'expo-permissions';
import { Linking } from "react-native";
import * as IntentLauncher from 'expo-intent-launcher';
import * as DocumentPicker from 'expo-document-picker';
import mime from 'mime';
import moment from "moment";


export default class PriceList extends React.Component {
    actions = (
        <Block row center flex={0}>
            {/* <PopUp element={<IconButton icon="file-excel" color="white" style={styles.circleIcon} />} >
                <MenuOption onSelect={() => this.downloadExcel()} >
                    <Block row center>
                        <Icon.MaterialCommunityIcons name="download" size={20} />
                        <Text style={{marginLeft:10}}>Download Excel</Text>
                    </Block>
                </MenuOption>
                <Divider />
                <MenuOption onSelect={() =>this.uploadExcel() } >
                    <Block row center>
                        <Icon.MaterialCommunityIcons name="upload" size={20} />
                        <Text style={{marginLeft:10}}>Upload Excel</Text>
                    </Block>
                </MenuOption>
            </PopUp> */}
            <IconButton icon="file-excel" size={30} onPress={()=>this.props.navigation.navigate('PriceListInformation')} color="white" style={styles.circleIcon} />
            <PopUp element={<IconButton icon="filter" color="white" style={styles.circleIcon} />} >
                <MenuOption onSelect={() => this.filter('all')} text="All" />
                <Divider />
                <MenuOption onSelect={() => this.filter('general')} text="General" />
                <Divider />
                <MenuOption onSelect={() => this.filter('custom')} text="Custom Price" />
            </PopUp>
        </Block>
        
    );
    constructor(props) {
        super(props);
        this.state = {
            priceList: [],
            priceListAll: [],
            customers:[],
            customersAll:[],
            selectedCustomer:null,
            user: [],
            loading: false,
            editItem:'',
            selectedItem:null,
            downloadProgress:0,
            excelFile:null,
        }
    }

    uploadExcel=()=>{
        const{excelFile,selectedCustomer,user}=this.state;
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
                    if(excelFile!=null){
                        let imageUri=excelFile.uri;
                        const newImageUri =  "file:///" + imageUri.split("file:/").join("");
                        console.log("fileURL filename",newImageUri);
                        fd.append("fileURL",{
                            uri : newImageUri,
                            type: mime.getType(newImageUri),
                            name: newImageUri.split("/").pop()
                        });
                    }
                    // fd.append('fileURL',excelFile);
                    fetch(`${api_url}price_list_import/${user.c_id}`,{
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
                            this.getPriceList();
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
        const{user,selectedCustomer}=this.state;
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
                fetch(`${api_url}price_list_export/${user.c_id}`,{
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
                            FileSystem.cacheDirectory + `customer_${selectedCustomer.name}_price_list_${moment(new Date()).format('DD-MM-YYYY')}.xlsx`,
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

    save=(item)=>{
        const{selectedCustomer,user}=this.state;
        if(item.has_order=='1'){
            Alert.alert(
                "Price List",
                "This Product Have Orders You really Want to change price for this. it will change order price also. are you sure want to do this?",
                [
                    {
                        text:'Yes',
                        onPress:()=>{
                            let fd=new FormData();
                            fd.append('user_id',selectedCustomer.u_id);
                            fd.append('price',item.c_price);
                            fetch(`${api_url}price_list_update/${item.p_id}`, {
                                method: 'POST',
                                body:fd,
                                headers: {
                                    Authorization: api_key
                                }
                            })
                            .then(response => response.json())
                            .then(json => {
                                var st = json.status == 1 ? 'success' : 'danger';
                                this.snack.show(json.message, st);
                                // this.getPriceList();
                            })
                            .catch(err => {
                                console.log("json err", err);
                                this.setState({ loading: false });
                            })
                        }
                    },
                    {
                        text:'No',
                        onPress:()=>{}
                    }
                ]
            )
        }
        
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
                
                this.setState({customers:json,customersAll:json,selectedCustomer:json[0]},()=>this.getPriceList());
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    getPriceList = () => {
        const { user,selectedCustomer } = this.state;
        this.setState({loading:true});
        let fd=new FormData();
        fd.append('user_id',selectedCustomer!=null?selectedCustomer.u_id:0);
        fetch(`${api_url}price_list/${user.c_id}`,{
            method:'POST',
            body:fd,
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json => {
            this.setState({ loading: false });
            console.log("priceList", json);
            this.setState({ priceList: json, priceListAll: json });
        })
        .catch(err => {
            console.log("json err", err);
            this.setState({ loading: false });
        })
    }

    filter=(action)=>{
        const{priceListAll}=this.state;
        let priceList=priceListAll;
        switch (action) {
            case 'general':
                priceList=priceListAll.filter(dt=>dt.c_price==null);
                break;
            case 'custom':
                priceList=priceListAll.filter(dt=>dt.c_price!=null);
                break;        
            default:
                priceList=priceListAll;
                break;
        }
        this.setState({priceList});
    }

    render() {
        const{selectedCustomer,user,downloadProgress}=this.state;
        console.log("download progress",downloadProgress);
        if(user.active_plan_id==0){
            return(
                <Block center justifyContent="center" padding={30}>
                    <Icon.MaterialCommunityIcons name="information-outline" size={100} color="#ccc" />
                    <Title style={{textAlign:'center'}}>This Feature Is Only Available For Premium Members If you want to use this feature upgrade to Premium.</Title>
                    <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white',fontSize:18}} style={{height:50,justifyContent:'center',marginVertical:20}}  onPress={()=>this.props.navigation.navigate('Plans')}>Upgrade To Pro</Button>
                </Block>
            )
        }
        return (
            <Block>
                {
                    this.state.loading &&
                    <ProgressBar indeterminate={true} style={StyleSheet.absoluteFill} />
                }
                <FlatList keyboardShouldPersistTaps="handled"
                    data={this.state.priceList}
                    bouncesZoom={true}
                    zoomScale={1}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ flexGrow: 1,}}
                    renderItem={this._renderPriceList}
                    ListEmptyComponent={(
                        <Block center paddingVertical={100} >
                            <Icon.MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                            <Text>No Price List Found</Text>
                        </Block>
                    )}
                    refreshControl={<RefreshControl onRefresh={() => this.getPriceList()} refreshing={this.state.loading} />}
                    maxToRenderPerBatch={15}
                    initialNumToRender={20}
                    ListHeaderComponent={()=>(
                        <Block paddingHorizontal={15} marginBottom shadow borderRadius={10} white row center color={theme_light_color}>
                            <Block>
                                <Text style={styles.inputLabel}>Selected Client</Text>
                                <SearchableDropdown placeholder="Select Client" data={this.state.customers} labelKey="name" searchKey="name" onSelect={item=>this.setState({selectedCustomer:item},()=>this.getPriceList())} defaultValue={selectedCustomer!=null?selectedCustomer.name:''} />
                            </Block>
                        </Block>
                    )}
                    stickyHeaderIndices={[0]}
                />
                <Snack ref={ref => this.snack = ref} />
                <ProductViewModal item={this.state.selectedItem} onRef={ref=>this.product_view_modal=ref} {...this.props} />
            </Block>
        );
    }
}