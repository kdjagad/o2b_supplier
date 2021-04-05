import { Block } from "expo-ui-kit";
import React from "react";
import { Alert, Dimensions, FlatList, Image, ImageBackground, RefreshControl, ScrollView, View } from "react-native";
import Carousel from "react-native-snap-carousel";
import { api_key, api_url, theme_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { Appbar, Avatar, Button, IconButton, Paragraph, Text, TextInput } from "react-native-paper";
import * as Contacts from 'expo-contacts';
import SearchBar from 'react-native-searchbar';
import FloatIcon from "../../components/float_icon";
import { _getUser } from "../../global/auth";
import { styles } from "../../global/style";
import SearchableDropdown from "../../components/searchable_dropdown";
import * as Animatable from 'react-native-animatable';
import CachedImage from 'react-native-expo-cached-image';
import AddToCartModal from "../../components/dialogs/add_to_cart";
import ProductListCard from "../../components/cards/product_list";
import { Picker } from "react-native";
import Snack from "../../components/snack";
const product_grid_width=(Dimensions.get('window').width-20)/3;
export default class SingleStock extends React.Component{
    
    actions =null;

    constructor(props){
        super(props);
        this.state={
            user:[],
            loading:false,
            quantity:'0',
            instructions:'',
            addToCartModal:false,
            stocks:[],
        }
    }

    componentDidMount() {
        let{item}=this.props.route?this.props.route.params:this.props;
        this.setState({stocks:item.stocks})
        // this.props.navigation.setOptions(this.navigationOptions);
        this.props.navigation.setParams({ actions:this.actions,title:item.p_title});
    }
    
    _renderStockRow=({item})=>{
        console.log('stock row',item);
        let{stocks}=this.state;
        return(
            <Block paddingHorizontal={20} paddingBottom borderBottomWidth={1} borderColor="#ccc">
                <Block row alignItems="flex-start">
                    {
                        item.stock_values!=undefined && item.stock_values.map((stock,index)=>{
                            return( 
                            <Block flex={1}>
                                <Text style={[styles.inputLabel,{marginTop:0}]}>{stock.name}</Text>
                                <Block color="#eee" marginRight>
                                    <Picker
                                        selectedValue={stock.selected}
                                        onValueChange={val=>{
                                            let vals=item.stock_values;
                                            let ind=vals.indexOf(stock);
                                            stock={
                                                ...stock,
                                                selected:val,
                                            }
                                            vals[ind]=stock;
                                            var indx=stocks.indexOf(item);
                                            item={
                                                ...item,
                                                stock_values:vals,
                                            }
                                            stocks[indx]=item;
                                            this.setState({stocks});
                                            // this.props.navigation.setParams({item:item});
                                        }}
                                        style={{borderBottomWidth:1,borderColor:'#ccc'}}
                                    >
                                        <Picker.Item label="All" value="all" />
                                        {
                                            stock.values && stock.values.map((stItem,ind)=>{
                                                return(
                                                    <Picker.Item label={stItem} value={stItem.toString()} />
                                                )
                                            })
                                        }
                                    </Picker>
                                </Block>
                            </Block>
                        )})
                    }
                    <Block flex={1}>
                        <Text style={[styles.inputLabel,{marginTop:0}]}>Quantity</Text>
                        <TextInput placeholderTextColor="#ccc"
                            value={item.qty}
                            onChangeText={text => {
                                var indx=stocks.indexOf(item);
                                item={
                                    ...item,
                                    qty:text,
                                }
                                stocks[indx]=item;
                                this.setState({stocks});
                            }}
                            placeholder="Quantity"
                            underlineColor={theme_color}
                            style={styles.textInput}
                            dense={true}         
                            keyboardType="decimal-pad"             
                        />
                    </Block>
                    {
                        stocks.length>1 &&
                        <Block flex={0}>
                            <IconButton icon="close" size={25} color="red" onPress={()=>{
                                var indx=stocks.indexOf(item);
                                stocks.splice(indx,1);
                                this.setState({stocks});
                            }} />
                        </Block>
                    }
                </Block>                
            </Block>
        )
    }

    updateStock=()=>{
        let{item}=this.props.route?this.props.route.params:this.props;
        let{stocks}=this.state;
        console.log("stcks",stocks);
        try {
            this.setState({loading:true});
            let fd=new FormData();
            stocks.map(dt=>{
                console.log("qty",dt.qty);
                if(parseInt(dt.qty)>0){
                    let values={};
                    dt.stock_values.map(stk=>{
                        var name=stk.name.toUpperCase().trim().replace(' ','');
                        // values.push({
                        //     [stk.name]:stk.selected
                        // });
                        values[stk.name]=stk.selected;
                    })
                    fd.append('quantity[]',dt.qty);
                    fd.append('values[]',JSON.stringify(values));
                }
            });
            console.log('fd',fd);
            fetch(`${api_url}stock_update/${item.p_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('product json',json);
                this.setState({loading:false});
                if(json.status==1)this.snack.show(json.message,'success');
                else this.snack.show(json.message,'danger');
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
        let{item}=this.props.route?this.props.route.params:this.props;
        return(
        <Block>  
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{flexGrow:1}}>              
                <ProductListCard item={item} />
                <Block row justifyContent="flex-end" center padding >
                    <Button mode="outlined" onPress={()=>{
                        let{stocks}=this.state;
                        var stk=stocks[0];
                        var stkvals=[];
                        stk.stock_values.map(st=>{
                            st={
                                ...st,
                                selected:''
                            }
                            stkvals.push(st);
                        });
                        stk={
                            ...stk,
                            qty:0,
                            stock_values:stkvals,
                        }                   
                        stocks.push(stk);
                        this.setState({stocks});
                    }}>Add Row</Button>
                    <Button mode="outlined" onPress={()=>this.updateStock()}>Save</Button>
                </Block>
                <FlatList keyboardShouldPersistTaps="always"
                    data={this.state.stocks}
                    keyExtractor={(item, index)=>index.toString()}
                    style={{flex:1}}
                    renderItem={this._renderStockRow}
                    refreshControl={<RefreshControl onRefresh={()=>{}} refreshing={this.state.loading} />}
               /> 
               <Snack ref={ref => this.snack = ref} />
            </ScrollView>
        </Block>
        );
    }
}