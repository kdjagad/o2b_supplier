import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, RefreshControl, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, site_url, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Avatar, Button, Divider, IconButton, List } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import { sendNotification, _getUser } from "../../global/auth";
import Snack from "../../components/snack";
import { ButtonGroup } from "react-native-elements";
import * as Animatable from 'react-native-animatable';
import AppSearchBar from "../../components/searchbar";
import PopUp from "../../components/popupmenu";
import { MenuOption } from "react-native-popup-menu";
import * as Notifications from 'expo-notifications';
export default class Customers extends React.Component{
    actions = (
        <Block flex={0}>
            <PopUp element={<IconButton icon="filter" color="#585858" />} >
                <MenuOption onSelect={() => this.filter('all')} text="All" />
                <Divider />
                <MenuOption onSelect={() => this.filter('requested')} text="Requested" />
                <Divider />
                <MenuOption onSelect={() => this.filter('received')} text="Received" />
                <Divider />
                <MenuOption onSelect={() => this.filter('approved')} text="Approved" />
            </PopUp>
        </Block>
    );
    constructor(props){
        super(props);
        this.state={
            customers:[],
            customersAll:[],
            loading:false,
            user:[],
            selectedIndex:0,
            mounted:false,
        }
    }
    
    componentDidMount(){
        this.init();
        Notifications.addNotificationReceivedListener(this.init);
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    init=()=>{
        this.props.navigation.setParams({actions:this.actions,title:'Clients'})
        _getUser().then(user=>this.setState({user},()=>this.getCustomers()));
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
                if(this.props.route.params)
                {
                    let{filter}=this.props.route.params;                    
                    if(filter!=undefined){
                        switch (filter) {
                            case 'approved':
                                this.props.navigation.setParams({title:'Approved Clients'});
                                json=json.filter(dt=>dt.status=='approved');                            
                                break;
                            case 'requests':
                                this.props.navigation.setParams({title:'Requests Clients'});
                                json=json.filter(dt=>dt.status=='requested' || dt.status=='received');                            
                                break;                                                
                            // case 'received':
                            //     this.props.navigation.setParams({title:'Received Clients'});
                            //     json=json.filter(dt=>dt.status=='received');                            
                            //     break;                                                
                            default:
                                break;
                        }
                    }
                }else{
                    if(json.length<=0 && !this.state.mounted){
                        this.setState({mounted:true},()=>{
                            this.props.navigation.navigate('ContactList');
                        })
                    }
                }                
                this.setState({customers:json,customersAll:json});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    _renderCustomer=({item})=>{
        return(
            <List.Item
                title={item.name}
                description={item.phone_no}                    
                titleStyle={{fontFamily:'fontBold',fontSize:18,fontFamily:'font',alignSelf:'baseline'}}
                descriptionNumberOfLines={2}
                titleNumberOfLines={2}
                titleEllipsizeMode="tail"
                descriptionEllipsizeMode="tail"
                descriptionStyle={{fontSize:14,fontFamily:'font'}}
                onPress={()=>this.props.navigation.navigate('SingleUser',{item})}
                left={props=>{
                    return(
                    <Block flex={0} justifyContent="center">
                    {
                        item.profile ?
                        <Avatar.Image source={{uri:`${site_url}${item.profile}`}} size={40} /> :
                        <Avatar.Text label={item.name[0]} size={40} backgroundColor="#eee" color={theme_color} />
                    }
                    </Block>
                )}}
                right={props=>{
                    return(
                    <Block flex={0} justifyContent="center">
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
                    </Block>
                )}}
            />
        );
    }

    request_remove=(item)=>{
        console.log("item token",item);
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
                this.getCustomers();
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
                this.getCustomers();
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({sendLoading:false});
            })
        } catch (error) {
            
        }
    }

    filter=(status)=>{
        const{customersAll}=this.state;
        let data=customersAll;
        if(status!='all')
            data=customersAll.filter(dt=>dt.status==status);

        this.setState({customers:data});
    }

    render(){
        return(
            <Block>
                <Block row center padding>
                    <Block>
                        <AppSearchBar
                            placeholder="Search Here"
                        />
                    </Block>                    
                </Block>
                <Animatable.View duration={300} animation="slideInUp" style={{flex:1}}>
                    <FlatList keyboardShouldPersistTaps="always"
                        data={this.state.customers}
                        keyExtractor={(item,index)=>index.toString()}
                        contentContainerStyle={{flexGrow:1}}
                        ListEmptyComponent={(
                            <Block center paddingVertical={100} >
                                <Feather name="users" size={100} color="#ccc" />
                                <Text>No Clients Found</Text>
                                <Button  onPress={()=>this.props.navigation.navigate('ContactList')} style={{marginVertical:20}}>+ Import Form Your Contact List</Button>
                            </Block>
                        )}
                        renderItem={this._renderCustomer}
                        refreshControl={<RefreshControl onRefresh={()=>this.getCustomers()} refreshing={this.state.loading} />}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={15}
                        initialNumToRender={20}
                        disableVirtualization={true}
                    />
                </Animatable.View>
                {/* <FloatIcon onPress={()=>this.props.navigation.navigate('ContactList')} />  */}
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}