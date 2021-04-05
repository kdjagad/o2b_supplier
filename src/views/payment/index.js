import { Block } from "expo-ui-kit";
import React from "react";
import { FlatList } from "react-native";
import {  Image, KeyboardAvoidingView, Text, View,ScrollView,  TextInput, TouchableNativeFeedback } from "react-native";
import { Appbar, Button, List, Switch } from "react-native-paper";
import { RadioButton } from 'react-native-paper';
import { _getUser } from "../../global/auth";
import { styles } from "../../global/style";
import { api_key, api_url, theme_color } from "../../global/variables";
import * as Icon from '@expo/vector-icons';
import * as Permissions from 'expo-permissions';
import { Alert } from "react-native";
import Snack from "../../components/snack";


export default class Plans extends React.Component{

    constructor(props){
        super(props)
        this.state={
            user:[],
            plans:[],
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
        this._unsubscribe();
    }

    init=async()=>{
        // await connectAsync();
        _getUser().then(user=>{
            this.setState({user},()=>this.getPlans());
        })
    }

    getPlans=async ()=>{
        this.setState({loading:true});
        const{user}=this.state;
        fetch(`${api_url}plans/${user.c_id}`,{
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            // console.log("cateogries",json);
            this.setState({loading:false,plans:json});
        })
        .catch(err=>{
            this.setState({cat_disable:false});
            console.log("json err",err);
            this.setState({loading:false});
        });
        // const items = Platform.select({
        //     ios: [],
        //     android: ['yearly_599', 'monthly_pbn40', 'o2bpro_month', 'o2bpro_year'],
        // });
        
        // // Retrieve product details
        // const { responseCode, results } = await getProductsAsync(items);
        // if (responseCode === IAPResponseCode.OK) {
        //     this.setState({loading:false,plans:results});
        // }
    }

    navigatePlan=(item)=>{
        let{user,plans}=this.state;
        if(user.active_plan_id!='0'){
            var cplan=plans.filter(dt=>dt.plan_id==user.active_plan_id);
            this.snack.show(
                `You Have Current Activate Plan Is ${cplan[0].plan_title} With Amount ${cplan[0].plan_amount*cplan[0].plan_duration} So Your This Plan Active After Ending Current Plan You Sure Want TO Proceed?`,
                'info',
                <Block row center>
                    <Button onPress={()=>{
                        this.snack.hide()
                    this.props.navigation.navigate('PlanSingle',{item})
                    }}>Yes</Button>
                    <Button onPress={()=>this.snack.hide()}>No</Button>
                </Block>,
                false
            )
            // Alert.alert(
            //     "Plan exists",
            //     `You Have Current Activate Plan Is ${cplan[0].plan_title} With Amount ${cplan[0].plan_amount*cplan[0].plan_duration} So Your This Plan Active After Ending Current Plan You Sure Want TO Proceed?`,
            //     [
            //         {
            //             text:"Yes",
            //             onPress:()=>this.props.navigation.navigate('PlanSingle',{item})
            //         },
            //         {
            //             text:"No",
            //             onPress:()=>{}
            //         }
            //     ]
            // )
        }else{
            this.props.navigation.navigate('PlanSingle',{item})
        }
    }

    _renderPlan=({item})=>{
        const{user}=this.state;
        return(
            <List.Item
                title={item.plan_title}
                titleNumberOfLines={2}
                titleStyle={{fontSize:20,fontFamily:'fontMedium'}}
                description={item.plan_description}
                style={{padding:20,borderBottomWidth:1,borderColor:'#ccc'}}
                right={()=>(
                    <Block flex={0} alignItems="flex-end">
                        <Text><Text style={{fontSize:30,color:theme_color,fontFamily:'fontBold'}}>{'\u20B9 '+item.plan_amount}</Text> / Per Month</Text>
                        <Text style={{textTransform:'uppercase',fontFamily:'fontMedium',color:'blue',fontSize:18}}>{item.plan_billed}</Text>
                        <Button disabled={user.active_plan_id==item.plan_id} onPress={()=>this.navigatePlan(item)} mode="outlined" style={{width:150,marginTop:15}}>{user.active_plan_id==item.plan_id?'Current Plan':'Get Started'}</Button>
                        {/* <Button onPress={async()=>{
                            const purchase=purchaseItemAsync(item.productId,user.payment_id);
                            if (!purchase.acknowledged) {
                                await finishTransactionAsync(purchase, false); // or true for consumables
                            }
                            const responseCode = await getBillingResponseCodeAsync();
                            if (responseCode === IAPResponseCode.OK) {
                                alert("Payment Success");
                            }else{
                                alert("Payment Fail");
                            }
                        }} mode="outlined" style={{width:150,marginTop:15}}>Get Started</Button> */}
                    </Block>
                )}
            />
        )
    }

    render(){
        return(
            <Block>
                <FlatList keyboardShouldPersistTaps="handled"
                    data={this.state.plans}
                    keyExtractor={(item, index)=>index.toString()}
                    contentContainerStyle={{flexGrow:1}}
                    renderItem={this._renderPlan}
                    ListEmptyComponent={(
                        <Block center paddingVertical={100} >
                            <Icon.MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                            <Text>No Plans Yet</Text>
                        </Block>
                    )}
               />   
               <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}