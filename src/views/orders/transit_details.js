import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { api_key, api_url, theme_color,site_url, theme_light_color, sum_column, sum_column_with_mul } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import * as Icon from '@expo/vector-icons';
import { getAllUnits, _getUser } from "../../global/auth";
import SearchableDropdown from "../../components/searchable_dropdown";
import { styles } from "../../global/style";
import { Button, IconButton, Switch, TextInput, Title } from "react-native-paper";
import { Image, KeyboardAvoidingView, ScrollView, View,FlatList } from "react-native";
import { ImageBrowser } from 'expo-image-picker-multiple';
import * as Permissions from 'expo-permissions';

import * as Animatable from 'react-native-animatable';
import ImageBrowserScreen from "../../components/ImageBrowseScreen";
import Snack from "../../components/snack";
import MultiSelect from "react-native-multiple-select";
import { MultiSelection } from "../../components/multi_selection";
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { TouchableNativeFeedback } from "react-native";
import mime from 'mime';
import DTPicker from "../../components/dtpicker";
import moment from "moment";
export default class TransitDetails extends React.Component{

    constructor(props){
        super(props);
        this.state={
            user:[],
            challan_no:'',
            challan_date:'',
            lr_no:'',
            lr_date:'',
            transport_details:'',
            package_details:'',
            dispatch_address:'',
            loading:false,
        }
    }

    componentDidMount(){
        
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }

    loadNotification=async()=>{
        Notifications.addNotificationReceivedListener(this.init);
        const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA,Permissions.MEDIA_LIBRARY);
        if (status === 'granted') {
            // return Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        } else {
            // await Permissions.askAsync(Permissions.CAMERA,Permissions.MEDIA_LIBRARY,Permissions.MEDIA_LIBRARY_WRITE_ONLY);
            throw new Error('Location permission not granted');
        }
    }

    componentWillUnmount(){
        
        this._unsubscribe();
    }

    init=()=>{
        this.props.navigation.setParams({title:'Dispatch Details'});
        this.loadNotification();
        let {selectedCustomer}=this.props.route.params;
        if(selectedCustomer && !this.state.dispatch_address){
            this.setState({dispatch_address:selectedCustomer.address});
        }
        _getUser().then(user=>this.setState({user}));
    }

    reset=()=>{
        this.setState({
            challan_no:'',
            challan_date:'',
            lr_no:'',
            lr_date:'',
            transport_details:'',
            package_details:'',
            dispatch_address:'',
        })
    }

    save=()=>{
        let selectedItems=this.props.route.params.items;
        let {selectedCustomer}=this.props.route.params;
        const{challan_no,challan_date,lr_no,lr_date,transport_details,package_details,dispatch_address,user}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('challan_no',challan_no);
            fd.append('challan_date',moment(challan_date).format("YYYY-MM-DD HH:mm:ss"));
            fd.append('lr_no',lr_no);
            fd.append('lr_date',moment(lr_date).format("YYYY-MM-DD HH:mm:ss"));
            fd.append('transport_details',transport_details);
            fd.append('package_details',package_details);
            fd.append('dispatch_address',dispatch_address);
            fd.append('cust_id',selectedCustomer.u_id);
            let order_data=[];
            selectedItems.forEach((item, i) => {
                if(item.dispatch_qty){
                    order_data.push({order_no:item.order_no,qty:item.dispatch_qty});
                }
                // fd.append(item.ca_name.trim(),item.value);
            });
            if(order_data.length>0) fd.append('orders',JSON.stringify(order_data));
            console.log('fd',fd);
            fetch(`${api_url}transit/${user.c_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('trnsit json',json);
                this.setState({loading:false});
                if(json.status==1)this.snack.show(json.message,'success');
                else this.snack.show(json.message,'danger');
                setTimeout(() => {
                    this.reset();
                    this.props.navigation.navigate('OrderDashboard');
                }, 500);
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            this.setState({loading:false});
            console.log("product_error",error);
        }
    }    

    render(){
        let selectedItems=this.props.route.params.items;
        let {selectedCustomer}=this.props.route.params;
        return(
        <View style={[styles.container]}>            
            <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}} >
                <View style={{flex:1}}>
                    <Block padding paddingHorizontal={15} color="#eee" marginBottom flex={0} alignItems="flex-end">
                        <Text style={{fontFamily:'fontBold'}}>To Customer :</Text>
                        <Text>{selectedCustomer.name}</Text>
                        <Text>{selectedCustomer.email}</Text>
                        <Text>{selectedCustomer.address}</Text>
                    </Block>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1,padding:20,paddingTop:0}} alwaysBounceVertical={true} bouncesZoom={true} bounces={true}>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Invoice / Challan No.</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.challan_no}
                                onChangeText={text => this.setState({challan_no:text})}
                                placeholder="Eg. 100542VD52"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}                            
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={400}>
                            <Text style={styles.inputLabel}>Invoice/Challan Date</Text>
                            <DTPicker defaultValue="Eg. 10-10-2021" minimumDate={new Date()}  onChangeDate={date=>this.setState({challan_date:date})} />
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>LR No.</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.lr_no}
                                onChangeText={text => this.setState({lr_no:text})}
                                placeholder="Eg. 100AB54252"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}                            
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={400}>
                            <Text style={styles.inputLabel}>LR Date</Text>
                            <DTPicker defaultValue="Eg. 10-10-2021" minimumDate={new Date()} onChangeDate={date=>this.setState({lr_date:date})} />
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Transport Details</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.transport_details}
                                onChangeText={text => this.setState({transport_details:text})}
                                placeholder="Eg. Transport By Truck/Car By Road/Air"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}      
                                multiline={true}
                                numberOfLines={3}                      
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Packaging Details</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.package_details}
                                onChangeText={text => this.setState({package_details:text})}
                                placeholder="Eg. 10 Boxes"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}      
                                multiline={true}
                                numberOfLines={3}                      
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Packaging Details</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.package_details}
                                onChangeText={text => this.setState({package_details:text})}
                                placeholder="Eg. 10 Boxes"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}      
                                multiline={true}
                                numberOfLines={3}                      
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Dispatch Address</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.dispatch_address}
                                onChangeText={text => this.setState({dispatch_address:text})}
                                placeholder="Dispatch To Customer Address"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}      
                                multiline={true}
                                numberOfLines={3}                      
                            /> 
                        </Animatable.View>
                    </ScrollView>
                    <Block row center padding paddingLeft={15} color={theme_light_color}>
                        <Block>
                            {/* <Text style={{color:'white'}}>Selected Products <Text size={18} color={theme_color}>{selectedItems.length}</Text></Text> */}
                            <Block row center>
                                <Text style={{color:'black'}}><Text style={{fontFamily:'fontBold'}}>Total :</Text> Orders <Text size={18} color={theme_color}>{selectedItems.length}</Text></Text>
                                <Text style={{color:'black',marginLeft:15}}>Quantity <Text size={18} color={theme_color}>{sum_column(selectedItems,'dispatch_qty')}</Text></Text>
                            </Block>
                            <Text size={25} color={theme_color}>{'\u20B9 '+sum_column_with_mul(selectedItems,'dispatch_qty','p_price')}</Text>
                        </Block>
                        <Block flex={0}>
                            <Button onPress={()=>this.save()} loading={this.state.loading}>Confirm</Button>
                        </Block>
                    </Block>
                </View>
            </KeyboardAvoidingView>
            <Snack ref={ref=>this.snack=ref} />
        </View>
        );
    }
}