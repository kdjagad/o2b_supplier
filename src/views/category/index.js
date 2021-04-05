import { Block, Text } from "expo-ui-kit";
import React from "react";
import { Alert, Dimensions, FlatList,  Image,  ImageBackground, RefreshControl, StyleSheet, TouchableNativeFeedback, View } from "react-native";
import { api_key, api_url, site_url, theme_color } from "../../global/variables";
import * as Icon from '@expo/vector-icons';
import { ActivityIndicator, Appbar, Avatar, Button, Card, Dialog, Divider, IconButton, List, Paragraph, Portal, ProgressBar, TextInput, Title } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import Snack from "../../components/snack";

export default class Category extends React.Component{
    actions = (
        <Block flex={0}>
            <IconButton icon="plus" size={30} onPress={()=>this.props.navigation.navigate('AddCategory')} />
        </Block>
    );
    constructor(props){
        super(props);
        this.state={
            categories:[],
            categoriesAll:[],
            user:[],
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
    componentWillUnmount(){
        this._unsubscribe;
    }

    init=()=>{  
        this.props.navigation.setParams({actions:this.actions,title:'Categories'});      
        _getUser().then(user=>this.setState({user},()=>{
            this.getCategories()
            // this.get_categories()
        }));
    } 

    _renderCategory=({item})=>{
        return(
            <List.Item
                title={`${item.cat_name} (${item.total_products!=null?item.total_products:0})`}
                titleStyle={{fontFamily:'fontBold',fontSize:20}}
                description={item.description}
                style={{borderBottomWidth:1,borderColor:'#ccc',paddingHorizontal:15}}
                right={()=>(
                    <Block row center flex={0}>
                        <IconButton icon="pencil" color="gray" onPress={()=>this.props.navigation.navigate('AddCategory',{item})} />
                        {
                            parseInt(item.total_products)==0 || item.total_products==null &&
                            <IconButton icon="delete" color="red" onPress={()=>this.askDelete(item)} />
                        }
                    </Block>
                )}
                left={()=>(
                    <Block flex={0}>
                        <Avatar.Image style={{backgroundColor:'#eee',borderRadius:10}} source={item.cat_image?{uri:`${site_url}${item.cat_image}`}:require('../../assets/images/o2b_placeholder.png')} size={60} />
                    </Block>
                )}
            />
        )
    }

    askDelete = (item) =>{
        Alert.alert(
            "Delete Category",
            "Are You Sure You Want To Delete This Category?",
            [
                {
                    text:'Yes',
                    onPress:()=>this.deleteCategory(item)
                },
                {
                    text:'No',
                    onPress:()=>{
                        
                    }
                }
            ]
        )
    }

    deleteCategory=(item)=>{
        fetch(`${api_url}category/${item.cat_id}`,{
            method:'DELETE',
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            var st=json.status==1?'success':'danger';   
            this.snack.show(json.message,st); 
            this.getCategories();        
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }
    
    getCategories=()=>{
        const{user}=this.state;
        fetch(`${api_url}categories/${user.c_id}`,{
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            console.log("cateogries",json);
            this.setState({categories:json,categoriesAll:json});
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    render(){
        return(
            <Block>
                {
                    this.state.loading &&
                    <ProgressBar indeterminate={true} style={StyleSheet.absoluteFill} />
                }
                <FlatList keyboardShouldPersistTaps="handled"
                    data={this.state.categories}
                    keyExtractor={(item, index)=>index.toString()}
                    contentContainerStyle={{flexGrow:1,paddingBottom:80}}
                    renderItem={this._renderCategory}
                    ListEmptyComponent={(
                        <Block center paddingVertical={100} >
                            <Icon.MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                            <Text>No Categories Found</Text>
                        </Block>
                    )}
                    refreshControl={<RefreshControl onRefresh={()=>this.getCategories()} refreshing={this.state.loading} />}
                    maxToRenderPerBatch={15}
                    initialNumToRender={20}
                />
                <Snack ref={ref=>this.snack=ref} />
                {/* <FloatIcon onPress={()=>this.props.navigation.navigate('AddCategory')} attach_name="add_category" />  */}
            </Block>
        );
    }
}