import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Alert, Dimensions, FlatList, Image, ImageBackground, Linking, RefreshControl, Share, TouchableNativeFeedback, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { android_app_url, api_key, api_url, phoneInputFormat, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, Avatar, Button, Checkbox, Dialog, IconButton, List, Paragraph, Portal, Searchbar } from "react-native-paper";
import * as Contacts from 'expo-contacts';
import SearchBar from 'react-native-searchbar';
import { ButtonGroup } from "react-native-elements";
import * as Animatable from 'react-native-animatable';
import { _getUser, _setUser, uniqArr, sendNotification, getSettingValue } from "../../global/auth";
import * as SMS from 'expo-sms';
import * as Permissions from 'expo-permissions';
import Snack from "../../components/snack";
import * as Notifications from 'expo-notifications';
import { Platform } from "react-native";

// const invite_msg=`{user_name} Invited You To join Order To Book. Download App ${android_app_url}`;

export default class ContactList extends React.Component{
    actions=(
        <Appbar.Action icon="share-variant" onPress={()=>this.onShare()} />
    );
    constructor(props){
        super(props);
        this.state={
            request:[],
            requestAll:[],
            contacts:[],
            contactsAll:[],
            customers:[],
            customersAll:[],
            loading:false,
            selectedIndex:0,
            user:[],
            everyTimeChecked:true,
            every_alert_visible:false,
            sendLoading:false,
            invite_msg:'',
        }
    }

    componentDidMount(){
        Notifications.addNotificationReceivedListener(this.init);
        _getUser().then(user=>{
            console.log("user user",user);
            // if(user.contact_everytime)
            if(user.hasOwnProperty('contact_everytime')){
                this.setState({every_alert_visible:user.contact_everytime});
                if(!user.contact_everytime){
                    this.getContactList();
                }
            }else{
                this.setState({every_alert_visible:true});
            }
        });
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    init=async()=>{        
        this.props.navigation.setParams({actions:this.actions});
        const urlParam=Platform.OS=='ios'?'customer_ios_url':'customer_android_url';
        const msg=await getSettingValue('invite_message');
        const url=await getSettingValue(urlParam);
        this.setState({invite_msg:msg.data+' '+url.data});
        _getUser().then(user=>{
            if(user.hasOwnProperty('contact_everytime') && !user.contact_everytime){
                this.getContactList();
            }

            if(user.hasOwnProperty('contact_everytime'))
            this.setState({every_alert_visible:user.contact_everytime});
            else
            this.setState({every_alert_visible:true});

            this.setState({user})
            
        });
    }

    getCustomers=(contactData=[])=>{
        const{user}=this.state;
        try {  
            fetch(`${api_url}customers/${user.c_id}`,{
                method:'POST',
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("customers",json);
                let data=json.filter(dt=>dt.status!='approved');
                data=data.filter(dt=>{                    
                    if(dt.phone_no){
                        // console.log("dt number",dt.phone_no);
                        var cnt=contactData.filter(dt1=>{
                            let numbers=dt1.phoneNumbers?dt1.phoneNumbers:[];
                            var numExists=numbers.filter(element => {
                                let finalNumber=element.number;
                                finalNumber=phoneInputFormat(finalNumber);
                                if(finalNumber){
                                    var dbPhoneNo=phoneInputFormat(dt.phone_no);
                                    // return dbPhoneNo.toString().includes(finalNumber);
                                    return dbPhoneNo==finalNumber && dbPhoneNo!=user.phone_no;
                                }else{
                                    return false;
                                }
                            });
                            if(numExists.length>0){
                                return true;
                            }else{
                                return false;
                            }
                        })
                        console.log("finded contact",cnt); 
                        
                        if(cnt.length>0){
                            return true;
                        }else{
                            return false;
                        }
                    }else{
                        return false;
                    }
                })
                this.setState({customers:data,customersAll:data});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    getContactList=async ()=>{
        const {customers,user}=this.state;
        const { status } = await Contacts.requestPermissionsAsync();
        if (status === 'granted') {
            this.setState({loading:true});
            const { data } = await Contacts.getContactsAsync({
                fields: [Contacts.Fields.PhoneNumbers],
            });
            // console.log('data contact',data);
            if (data.length > 0) {
                let contacts=data;
                // contacts = uniqArr(contacts,'number');
                this.setState({contacts,contactsAll:contacts,loading:false},()=>this.getCustomers(data));
            }else{
                this.setState({contacts:[],contactsAll:[],loading:false});
            }
        }
    }

    onShare = async () => {
        const{user}=this.state;
        try {
          const result = await Share.share({
            message: this.state.invite_msg.replace('{user_name}',user.name),
          });
          if (result.action === Share.sharedAction) {
            if (result.activityType) {
              // shared with activity type of result.activityType
            } else {
              // shared
            }
          } else if (result.action === Share.dismissedAction) {
            // dismissed
          }
        } catch (error) {
          alert(error.message);
        }
    }

    _renderContact=({item})=>{
        console.log("contact",item);
        const{user}=this.state;
        if(!item.firstName && !item.phoneNumbers) return null;
        return(
            <List.Item
                title={item.firstName?item.firstName.trim():''}
                description={item.phoneNumbers?item.phoneNumbers[0].number.trim().replace(/-|\s+/g, ''):''}                    
                titleStyle={{fontFamily:'fontBold',fontSize:18,fontFamily:'font',alignSelf:'baseline'}}
                descriptionNumberOfLines={2}
                titleNumberOfLines={2}
                titleEllipsizeMode="tail"
                descriptionEllipsizeMode="tail"
                descriptionStyle={{fontSize:14,fontFamily:'font'}}
                left={props=>{
                    return(
                    <Block flex={0} justifyContent="center">
                        <Avatar.Text label={item.firstName?item.firstName[0]:''} size={40} backgroundColor="#eee" color={theme_color} />
                    </Block>
                )}}
                right={props=>{
                    return(
                    <Block flex={0} justifyContent="center">
                        <Block row>                        
                            <IconButton style={{marginHorizontal:0,width:30}} color="#747474" icon="message-outline" onPress={async ()=>{
                                const isAvailable = await SMS.isAvailableAsync();
                                if (isAvailable) {
                                    const { result } = await SMS.sendSMSAsync(
                                        // item.phoneNumbers?item.phoneNumbers:[],
                                        [item.phoneNumbers?item.phoneNumbers[0].number.trim().replace(/-|\s+/g, ''):''],
                                        this.state.invite_msg.replace('{user_name}',user.name),
                                        // {
                                        //     attachments: {
                                        //     uri: 'path/myfile.png',
                                        //     mimeType: 'image/png',
                                        //     filename: 'myfile.png',
                                        //     },
                                        // }
                                    );
                                } else {
                                // misfortune... there's no SMS available on this device
                                    alert('You Have Not Enough Messages');
                                }
                            }} />
                            <IconButton style={{marginHorizontal:0,width:30}} color="#747474" icon="whatsapp" onPress={()=>{
                                Linking.openURL(`whatsapp://send?text=${this.state.invite_msg.replace('{user_name}',user.name)}&phone=${item.phoneNumbers?item.phoneNumbers[0].number.trim().replace(/-|\s+/g, ''):''}`);
                            }} />
                            
                        </Block>                  
                    </Block>
                )}}
            />
        )
    }

    _renderCustomer=({item})=>{
        return(
            <List.Item
                title={item.name}
                description={item.phone_no}
                left={props=>{
                    return(
                    <Block flex={0} justifyContent="center">
                        <Avatar.Text label={item.name?item.name[0]:''} size={40} backgroundColor="#eee" color={theme_color} />
                    </Block>
                )}}
                right={props=>{
                    return(
                    <Block flex={0} justifyContent="center">
                        <Block marginLeft flex={0}>
                            {
                                item.status=='requested' &&
                                <View>
                                    <Button mode="outlined" icon="close" color="red" labelStyle={{fontSize:12,padding:0,margin:0}} onPress={()=>this.request_remove(item)} disabled={this.state.sendLoading} >Cancel</Button>
                                </View>
                            }
                            {
                                item.status=='received' &&
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Button mode="outlined" icon="check" color="green" labelStyle={{fontSize:12,padding:0,margin:0}} onPress={()=>this.approve_request(item)} >Accept</Button>
                                    <Button mode="outlined" icon="close" color="red" labelStyle={{fontSize:12,padding:0,margin:0}} onPress={()=>this.request_remove(item)} >Reject</Button>
                                </View>
                            }
                            {
                                item.status==null &&
                                <Button mode="outlined" style={{
                                    backgroundColor:'white',
                                    shadowColor: "#000",
                                    shadowOffset: {
                                        width: 0,
                                        height: 2,
                                    },
                                    shadowOpacity: 0.25,
                                    shadowRadius: 3.84,
                                    elevation: 5,
                                }} onPress={()=>this.request(item)} disabled={this.state.sendLoading} >Send Request</Button>
                            }
                        </Block>                    
                    </Block>
                )}}
            />
        )
    }

    searchContact=(val)=>{
        val=val.toLowerCase();
        const{contactsAll}=this.state;
        let contacts=contactsAll;
        if(val.length>0){
            contacts=contactsAll.filter(cnt=>{
                if(cnt.phoneNumbers && cnt.firstName)
                return cnt.phoneNumbers[0].number.match(val) || cnt.firstName.toLowerCase().match(val);
            })
        }
        this.setState({contacts});
    }
    searchCustomers=(val)=>{
        val=val.toLowerCase();
        const{customersAll}=this.state;
        let customers=customersAll;
        if(val.length>0){
            customers=customersAll.filter(cnt=>{
                if(cnt.phone_no && cnt.name)
                return cnt.phone_no.match(val) || cnt.name.toLowerCase().match(val);
            })
        }
        this.setState({customers});
    }

    request=(item)=>{
        // console.log("cust id",cust);
        const{user}=this.state;
        try {    
            this.setState({sendLoading:true});
            let fd = new FormData();
            fd.append('cust_id',item.u_id);
            fetch(`${api_url}request_customer/${user.c_id}`,{
                method:'POST',
                headers:{
                    Authorization:api_key
                },
                body:fd,
            })
            .then(response=>response.json())
            .then(json=>{
                this.setState({sendLoading:false});
                // sendNotification({
                //     to:item.push_token,
                //     title:"Order To Book Request",
                //     body:`${user.name} Sent You Request For Work With You`,
                //     priority:'high'
                // }).then(resp=>console.log("noti",resp)).catch(err=>console.log('noti err',err));
                var stralert=json.status==1?'success':'danger';
                this.snack.show(json.message,stralert);
                this.getContactList();
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({sendLoading:false});
            })
        } catch (error) {
            
        }
    }
    request_remove=(item)=>{
        // console.log("cust id",cust);
        const{user}=this.state;
        try {    
            this.setState({sendLoading:true});
            let fd = new FormData();
            fd.append('cust_id',item.u_id);
            fetch(`${api_url}request_remove_customer/${user.c_id}`,{
                method:'POST',
                headers:{
                    Authorization:api_key
                },
                body:fd,
            })
            .then(response=>response.json())
            .then(json=>{
                this.setState({sendLoading:false});
                // sendNotification({
                //     to:item.push_token,
                //     title:"Order To Book Request",
                //     body:`${user.name} Cancelled Request`,
                //     priority:'high'
                // });
                var stralert=json.status==1?'success':'danger';
                this.snack.show(json.message,stralert);
                this.getContactList();
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({sendLoading:false});
            })
        } catch (error) {
            
        }
    }
    approve_request=(item)=>{
        // console.log("cust id",cust);
        const{user}=this.state;
        try {    
            this.setState({sendLoading:true});
            let fd = new FormData();
            fd.append('cust_id',item.u_id);
            fetch(`${api_url}approve_customer/${user.c_id}`,{
                method:'POST',
                headers:{
                    Authorization:api_key
                },
                body:fd,
            })
            .then(response=>response.json())
            .then(json=>{
                this.setState({sendLoading:false});
                // sendNotification({
                //     to:item.push_token,
                //     title:"Order To Book Request",
                //     body:`${user.name} Approved Your Request`,
                //     priority:'high'
                // });
                var stralert=json.status==1?'success':'danger';
                this.snack.show(json.message,stralert);
                this.getContactList();
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({sendLoading:false});
            })
        } catch (error) {
            
        }
    }

    
    render(){
        const buttons = ['Request', 'Share'];
        let{selectedIndex,user}=this.state;
        return(
            <Block>
                <ButtonGroup
                    onPress={index=>this.setState({selectedIndex:index})}
                    selectedIndex={selectedIndex}
                    buttons={buttons}
                    containerStyle={{height: 40,borderRadius:10,overflow:"hidden"}}
                    selectedButtonStyle={{backgroundColor:theme_color}}
                    selectedTextStyle={{fontSize:20,fontWeight:"bold"}}
                />
                
                {
                    selectedIndex==0 &&
                    <Block>
                    <Block flex={0}>
                        <Searchbar placeholder="Search Contacts" onChangeText={val=>this.searchCustomers(val)} />
                    </Block>
                    <FlatList keyboardShouldPersistTaps="always"
                            data={this.state.customers}
                            keyExtractor={(item,index)=>index.toString()}
                            contentContainerStyle={{flexGrow:1}}
                            renderItem={this._renderCustomer}
                            ListEmptyComponent={(
                                <Block center paddingVertical={100} >
                                    <Feather name="users" size={100} color="#ccc" />
                                    <Text>No Contacts</Text>
                                    {/* <Button  onPress={()=>{}} style={{marginVertical:20}}>+ Import Form Your Contact List</Button> */}
                                </Block>
                            )}
                            refreshControl={<RefreshControl onRefresh={()=>this.getContactList()} refreshing={this.state.loading} />}
                            
                            maxToRenderPerBatch={15}
                            initialNumToRender={20}
                    /> 
                    </Block>
                }
                {
                    selectedIndex==1 &&
                    <Block>
                    <Block row center>
                        <Block>
                            <Searchbar placeholder="Search Contacts" onChangeText={val=>this.searchContact(val)} />                            
                        </Block>
                                                
                    </Block>
                    <FlatList keyboardShouldPersistTaps="always"
                            data={this.state.contacts}
                            keyExtractor={(item,index)=>index.toString()}
                            contentContainerStyle={{flexGrow:1}}
                            renderItem={this._renderContact}
                            ListEmptyComponent={(
                                <Block center paddingVertical={100} >
                                    <Feather name="users" size={100} color="#ccc" />
                                    <Text>No Contacts</Text>
                                    {/* <Button  onPress={()=>{}} style={{marginVertical:20}}>+ Import Form Your Contact List</Button> */}
                                </Block>
                            )}
                            refreshControl={<RefreshControl onRefresh={()=>this.getContactList()} refreshing={this.state.loading} />}
                            
                            maxToRenderPerBatch={15}
                            initialNumToRender={20}
                    /> 
                    </Block>
                }
                <Portal>
                    <Dialog visible={this.state.every_alert_visible} onDismiss={()=>this.setState({every_alert_visible:false},()=>this.getContactList())}>
                    <Block row center justifyContent="space-between">
                        <Dialog.Title>Info</Dialog.Title>
                        {/* <Button labelStyle={{fontSize:20}} onPress={()=>this.setState({every_alert_visible:false})}>x</Button> */}
                        <Appbar.Action animated={false} icon={()=><MaterialCommunityIcons name="close-circle-outline" color={theme_color} size={25} />} onPress={()=>this.setState({every_alert_visible:false},()=>this.getContactList())} animated={false} />                                
                    </Block>
                    <Dialog.Content>
                        <Text bold color={theme_color}>Request : </Text>
                        <Paragraph>
                            In Request You Can send request to client for access your products through O2B platform.
                        </Paragraph>
                        <Text bold color={theme_color}>Share : </Text>
                        <Paragraph>
                            In Share You can invite from your contact to download O2B platform. On register by them you can request by your registered contact number
                        </Paragraph>
                        <TouchableNativeFeedback
                        onPress={() => {
                            let status=!this.state.everyTimeChecked;
                            this.setState({everyTimeChecked:status});
                            user={
                                ...user,
                                contact_everytime:status,
                            }
                            this.setState({user},()=>_setUser(user));
                        }}
                        >
                        <Block row center  marginTop={30} flex={0} alignSelf="center">
                            <Checkbox.Android
                            status={this.state.everyTimeChecked ? 'checked' : 'unchecked'}
                            color={theme_color}
                            onPress={() => {
                                let status=!this.state.everyTimeChecked;
                                console.log("status",status);
                                this.setState({everyTimeChecked:status});
                                user={
                                    ...user,
                                    contact_everytime:status,
                                }
                                this.setState({user},()=>_setUser(user));
                            }}
                            />
                            <Text marginLeft>Every Time Open This Info</Text>
                        </Block>
                        </TouchableNativeFeedback>
                    </Dialog.Content>
                    </Dialog>
                </Portal>
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}