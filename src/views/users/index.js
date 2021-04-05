import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { Dimensions, FlatList, Image, ImageBackground, RefreshControl, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, site_url, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Avatar, Button, IconButton, Searchbar } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import Snack from "../../components/snack";
import { ButtonGroup } from "react-native-elements";
import * as Animatable from 'react-native-animatable';
import AppSearchBar from "../../components/searchbar";
export default class Users extends React.Component{
    constructor(props){
        super(props);
        this.state={
            users:[],
            usersAll:[],
            loading:false,
            user:[],
        }
    }
    
    componentDidMount(){
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        // //return unsubscribe;
    }

    init=()=>{
        _getUser().then(user=>this.setState({user},()=>this.getUsers()));
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    getUsers=()=>{
        const{user}=this.state;
        try {  
            this.setState({loading:true});
            fetch(`${api_url}sub_customers/${user.c_id}`,{
                method:'POST',
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('users',json);
                this.setState({loading:false});
                this.setState({users:json,usersAll:json});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    _renderUser=({item})=>{
        return(
            <Block row center padding marginHorizontal marginTop shadow borderRadius={10} color="#fff" >
                {
                    item.profile ?
                    <Avatar.Image source={{uri:`${site_url}${item.profile}`}} size={40} /> :
                    <Avatar.Text label={item.name[0]} size={40} backgroundColor="#eee" />
                }
                <Block marginLeft>
                    <Text bold size={18}>{item.name}</Text>
                    <Text size={15} color="#858585">{item.email}</Text>
                    <Text size={15} color="#858585">{item.phone_no}</Text>
                </Block>
            </Block>
        );
    }

    searchUser=(val)=>{
        val=val.toLowerCase();
        const{usersAll}=this.state;
        let users=usersAll;
        if(val.length>0){
            users=usersAll.filter(cnt=>{
                return cnt.phone_no.match(val) || cnt.name.toLowerCase().match(val) || cnt.email.toLowerCase().match(val);
            })
        }
        this.setState({users});
    }

    render(){
        return(
            <Block>
                <Animatable.View duration={300} animation="slideInUp" style={{flex:1}}>
                    <Block flex={0}>
                        <AppSearchBar placeholder="Search Users" onChangeText={val=>this.searchUser(val)} onClear={()=>this.searchUser('')} />
                    </Block>
                    <FlatList keyboardShouldPersistTaps="always"
                        data={this.state.users}
                        keyExtractor={(item,index)=>index.toString()}
                        contentContainerStyle={{flexGrow:1}}
                        ListEmptyComponent={(
                            <Block center paddingVertical={100} >
                                <Feather name="users" size={100} color="#ccc" />
                                <Text>No Users Found</Text>
                                <Button  onPress={()=>this.props.navigation.navigate('AddUser')} style={{marginVertical:20}}>+ Add New User</Button>
                            </Block>
                        )}
                        renderItem={this._renderUser}
                        refreshControl={<RefreshControl onRefresh={()=>this.getUsers()} refreshing={this.state.loading} />}
                        removeClippedSubviews={true}
                        maxToRenderPerBatch={15}
                        initialNumToRender={20}
                        disableVirtualization={true}
                    />
                </Animatable.View>
                <FloatIcon onPress={()=>this.props.navigation.navigate('AddUser')} /> 
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}