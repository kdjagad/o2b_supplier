import { Block } from "expo-ui-kit";
import React from "react";
import { FlatList } from "react-native";
import {  Image, KeyboardAvoidingView, Text, View,ScrollView,  TouchableNativeFeedback } from "react-native";
import { Appbar, Button, List, Paragraph, Switch, TextInput } from "react-native-paper";
import { RadioButton } from 'react-native-paper';
import { _getUser, _setUser } from "../../global/auth";
import { styles } from "../../global/style";
import { api_key, api_url, encrypt, jsonToQueryString, makeid, pay_url, site_url, theme_color, theme_light_color } from "../../global/variables";
import * as Icon from '@expo/vector-icons';
import moment from 'moment';
import WebView from "react-native-webview";
import Modal from "react-native-modalbox";
import Snack from "../../components/snack";
import { Linking } from "react-native";
import CryptoJS from "react-native-crypto-js";

const access_code="AVFO04IC95BP72OFPB";
const working_key="A3FE1474A2847C8C53FDB83784801F7D";
const merchant_id="351983";
export default class PlanSingle extends React.Component{

    constructor(props){
        super(props)
        this.state={
            user:[],
            offer_code:'',
            offer_price:'',
            offers:[],
            loading:false,
            websource:'',
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

    init=()=>{
        let{item}=this.props.route.params?this.props.route.params:null;
        this.props.navigation.setParams({title:item!=null?item.plan_title:''});
        _getUser().then(user=>{
            this.setState({user},()=>this.getOffers());
        })
    }

    getOffers=()=>{
        let{item}=this.props.route.params?this.props.route.params:null;
        this.setState({loading:true});
        const{user}=this.state;
        fetch(`${api_url}offers/${item.plan_id}`,{
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            console.log("offers",json);
            this.setState({loading:false,offers:json});
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    pay_now=()=>{
        const{offer_price,user}=this.state;
        let{item}=this.props.route.params?this.props.route.params:null;
        var amount=offer_price?offer_price:item.plan_amount;
        var final_amount=amount*item.plan_duration;
        
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append("merchant_id",merchant_id);
            fd.append("language","EN");
            fd.append("currency","INR");
            fd.append("amount",final_amount);
            fd.append("redirect_url","https://ordertobook.com/payment_response");
            fd.append("cancel_url","https://ordertobook.com/payment_response");
            fd.append("billing_name",user.name);
            fd.append("billing_address",user.address);
            fd.append("billing_city",user.city_name);
            fd.append("billing_state",user.state_name);
            fd.append("billing_zip","");
            fd.append("billing_country",user.country_name);
            fd.append("billing_tel",user.phone_no);
            fd.append("billing_email",user.email);
            fd.append("merchant_param1","");
            
            fetch(`${api_url}encrypt_data`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then((response) => response.json())
            .then((json) => {
                this.setState({websource:`${pay_url}?encodedString=${json.data}`},()=>this.pay_modal.open());
            })
            .catch((error) => {
                this.setState({loading:false});
                console.error("Login Error",error);
            });

        } catch (error) {
            this.setState({loading:false});
            console.log("error",error);
        }
    }
    
    pay_now_old=()=>{
        this.setState({loading:true});
        const{offer_price,user}=this.state;
        let{item}=this.props.route.params?this.props.route.params:null;
        var amount=offer_price?offer_price:item.plan_amount;
        var final_amount=amount*item.plan_duration;

        this.pay_modal.open();

        // const html_data=`
        // <html>
        // <head>
        //     <meta charset="UTF-8">
        //     <meta name="viewport" content="width=device-width, initial-scale=1.0">
        // </head>
        // <body style="display:flex;min-height:100vh;align-items:center;justify-content:center;">
        //     <div style="padding:20px;text-align:center;">
        //         <img src="${site_url}samples/logo.png" width="150" />
        //         <h2 style="color:${theme_color}">Payment Confirmation</h2>
        //         <h3>${item.plan_title}</h3>
        //         <h1 style="color:${theme_color};">${'\u20B9 '+amount}<span style="color:black;font-size:12px;">/Per Month</span></h1>
        //         <h3 style="color:blue;text-transform:uppercase;">${item.plan_billed}</h3>
        //         <p>${item.plan_description}</p>
        //         <h2>Total Payable Amount : ${'\u20B9 '+final_amount}</h2>
        //         <button id="rzp-button1" style="padding:15px;width:100%;background-color:${theme_color};font-size:18px;color:white;border:0;border-radius:10px;">Pay ${'\u20B9 '+final_amount}</button>
        //     </div>
        //     <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        //     <script>
        //         var options = {
        //             "key": "rzp_test_PvQKqyLDEGzKew", 
        //             "amount": ${final_amount*100}, 
        //             "currency": "INR",
        //             "name": "${item.plan_title}",
        //             "description": "${item.plan_description}",
        //             "image": "${site_url}samples/logo.png",
        //             // "handler": response=>this.callResponse(response),
        //             "callback_url":"${site_url}assets/payment/callback.php?amount=${final_amount}",
        //             "redirect":true,
        //             "prefill": {
        //                 "name": "${user.name}",
        //                 "email": "${user.email}",
        //                 "contact": "${user.phone_no}"
        //             },
        //             "notes": {
        //                 "address": "${user.address}"
        //             },
        //             "theme": {
        //                 "color": "${theme_color}"
        //             }
        //         };
        //         var rzp1 = new Razorpay(options);
        //         rzp1.on('payment.failed', function (response){
        //             window.ReactNativeWebView.postMessage(JSON.stringify(response));   
        //         });
        //         // rzp1.open();
        //         document.getElementById('rzp-button1').onclick = function(e){
        //             rzp1.open();
        //             e.preventDefault();
        //         }
        //         function callResponse(response){
        //             window.ReactNativeWebView.postMessage(JSON.stringify(response));
        //         }
        //     </script> 
              
        // </body>
        // </html>`;

        // const html_data=`
        //     <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        //     <script>
        //         var options = {
        //             "key": "rzp_test_PvQKqyLDEGzKew", 
        //             "amount": ${final_amount*100}, 
        //             "currency": "INR",
        //             "name": "${item.plan_title}",
        //             "description": "${item.plan_description}",
        //             "image": "${site_url}samples/logo.png",
        //             // "handler": response=>this.callResponse(response),
        //             "callback_url":"${site_url}assets/payment/callback.php?amount=${final_amount}",
        //             "redirect":true,
        //             "prefill": {
        //                 "name": "${user.name}",
        //                 "email": "${user.email}",
        //                 "contact": "${user.phone_no}"
        //             },
        //             "notes": {
        //                 "address": "${user.address}"
        //             },
        //             "theme": {
        //                 "color": "${theme_color}"
        //             }
        //         };
        //         var rzp1 = new Razorpay(options);
        //         rzp1.on('payment.failed', function (response){
        //             window.ReactNativeWebView.postMessage(JSON.stringify(response));   
        //         });
        //         rzp1.open();
        //         // document.getElementById('rzp-button1').onclick = function(e){
        //         //     rzp1.open();
        //         //     e.preventDefault();
        //         // }
        //         function callResponse(response){
        //             window.ReactNativeWebView.postMessage(JSON.stringify(response));
        //         }
        //     </script>    
        // `;

        const jsonData={
            merchant_id:merchant_id,
            language:"EN",
            currency:"INR",
            amount:final_amount,
            redirect_url:"https://business.ordertobook.com/api/payment_response",
            cancel_url:"https://ordertobook.com/test",
            billing_name:"Keyur Jagad",
            billing_address:"Rajkot",
            billing_state:"Gujarat",
            billing_zip:"360005",
            billing_country:"India",
            billing_tel:"9033601724",
            billing_email:"kdjagad29@gmail.com",
            merchant_param1:"aa",
        }

        var queryString=jsonToQueryString(jsonData);

        console.log("query string",queryString);
        
        // queryString=encodeURI(queryString);
        // console.log("encode query string",queryString);

        let encodedString = encrypt(queryString, working_key);

        console.log("encoded String",encodedString);

        // const html_data=`
        //     <form method="post" name="redirect" action="https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction">
        //         <input type="hidden" name="encRequest" value="${encodedString}">
        //         <input type="hidden" name="access_code" value="${access_code}">
        //     </form>
        //     <script language='javascript'>document.redirect.submit();</script>
        // `;

        this.setState({websource:`${pay_url}?encodedString=${encodedString}`});

        // console.log('final amount',final_amount);
        // var options = {
        //     description: item.plan_description,
        //     // image: 'https://i.imgur.com/3g7nmJC.png',
        //     currency: 'INR',
        //     key: 'rzp_test_PvQKqyLDEGzKew', // Your api key
        //     amount: final_amount,
        //     name: '20382',
        //     amount: final_amount*100,
        //     name: 'Order To Book',
        //     prefill: {
        //       email: user.email,
        //       contact: user.phone_no,
        //       name: user.name
        //     },
        //     theme: {color: theme_color}
        // }
        // // RazorpayCheckout.open(options).then().catch();
        // RazorpayCheckout.open(options).then((data) => {
        //     // handle success
        //     this.updateUser(data.razorpay_payment_id);
        // }).catch((error) => {
        //     console.log("error",error);
        //     // handle failure
        //     // alert(`Error: ${error} | ${error.description}`);
        // });

        // // var options = {
        // //     description: 'Credits towards consultation',
        // //     image: 'https://i.imgur.com/3g7nmJC.png',
        // //     currency: 'INR',
        // //     key: 'rzp_test_PvQKqyLDEGzKew', // Your api key
        // //     amount: '5000',
        // //     name: 'foo',
        // //     prefill: {
        // //       email: 'void@razorpay.com',
        // //       contact: '9191919191',
        // //       name: 'Razorpay Software'
        // //     },
        // //     theme: {color: '#F37254'}
        // //   }
        // //   RazorpayCheckout.open(options).then((data) => {
        // //     // handle success
        // //     alert(`Success: ${data.razorpay_payment_id}`);
        // //   }).catch((error) => {
        // //     // handle failure
        // //     alert(`Error: ${error.code} | ${error.description}`);
        // //   });
    }

    updateUser=(payment_id)=>{
        let{user,offer_price}=this.state;
        let{item}=this.props.route.params?this.props.route.params:null;
        var amount=offer_price?offer_price:item.plan_amount;
        var final_amount=amount*item.plan_duration;
        var date=new Date();
        var active_date=moment(date).format("YYYY-MM-DD HH:mm:ss");
        date.setMonth(date.getMonth()+parseInt(item.plan_duration));
        var expire_date=moment(date).format("YYYY-MM-DD HH:mm:ss");
        let fd=new FormData();        
        if(user.active_plan_id!='0'){
            var current_end_date=new Date(moment.utc(user.plan_expire_date));
            console.log("current date",current_end_date);
            var renewel_start_date=new Date();
            renewel_start_date.setDate(current_end_date.getDate()+1);
            var renewel_end_date=new Date();
            renewel_end_date.setMonth(renewel_start_date.getMonth()+parseInt(item.plan_duration));
            fd.append('renewel_plan_id',item.plan_id);
            fd.append('renewel_payment_id',payment_id);
            fd.append('renewel_end_date',moment(renewel_end_date).format("YYYY-MM-DD HH:mm:ss"));
            fd.append('renewel_start_date',moment(renewel_start_date).format("YYYY-MM-DD HH:mm:ss"));
            fd.append('renewel_date',moment(date).format("YYYY-MM-DD HH:mm:ss"));
        }else{
            fd.append('active_plan_id',item.plan_id);
            fd.append('payment_id',payment_id);
            fd.append('plan_expire_date',expire_date);
            fd.append('plan_active_date',active_date);
        }
        
        fetch(`${api_url}supplier_update_profile/${user.c_id}`,{
            method:'POST',
            body:fd,
            headers:{
                Authorization:api_key
            }
        })
        .then((response) => response.json())
        .then((json) => {
            console.log("user json",json);
            this.setState({loading:false});
            if(json.status==1){
                user={
                    ...user,
                    ...json.user,
                };
                _setUser(user);   
                let item={
                    payment_id:payment_id,
                    final_amount:final_amount,
                    active_date:active_date,
                    expire_date:expire_date,
                };

                this.props.navigation.navigate('Thankyou',{item});
            }
        })
        .catch((error) => {
            this.setState({loading:false});
            console.error("Login Error",error);
        });
    }

    apply_offer=()=>{
        
        let{item}=this.props.route.params?this.props.route.params:null;
        const{offer_code,offers}=this.state;
        var offer=offers.filter(dt=>dt.plan_id==item.plan_id && dt.offer_code.toUpperCase()==offer_code.toUpperCase());
        if(offer.length>0){
            this.setState({offer_price:offer[0].amount});
        }else{
            alert("Sorry No Offer Available On This Offer Code");
        }
    }

    onResponse=(event)=>{
        var resp=JSON.parse(event.nativeEvent.data);
        resp=JSON.parse(resp);
        console.log("resp",resp.order_status);
        this.pay_modal.close();
        if(resp.order_status=="Success"){
            this.updateUser(resp.tracking_id);            
        }else{
            this.snack.show("Payment Failed Please Try Again",'danger');
            this.setState({loading:false});
        }
    }

    render(){
        let{offer_price}=this.state;
        let{item}=this.props.route.params?this.props.route.params:null;
        if(item==null) return null;
        var amount=offer_price?offer_price:item.plan_amount;
        var final_amount=amount*item.plan_duration;
        return(
            <Block>
                <Block center padding={15} marginTop={30} marginHorizontal={30} borderRadius={10} shadow color={theme_light_color} flex={0}>
                    <Text><Text style={{fontSize:40,color:theme_color,fontFamily:'fontBold'}}>{'\u20B9 '+item.plan_amount}</Text> / Per Month</Text>
                    <Text style={{textTransform:'uppercase',fontFamily:'fontMedium',color:'blue',fontSize:18}}>{item.plan_billed}</Text>
                    <Paragraph>{item.plan_description}</Paragraph>
                </Block>
                <Block center padding={15} marginTop={30} marginHorizontal={30} borderRadius={10} shadow color={theme_light_color} flex={0}>
                    {
                        this.state.offer_price!='' ?
                        (
                            <Block flex={0}>
                                <Text style={{color:'green',fontSize:17}}>Offer Applier Successful <Text style={{fontFamily:'fontMedium'}}>{this.state.offer_code.toUpperCase()}</Text></Text>
                                <Text>Your Offer Price Is : <Text style={{fontSize:20,fontFamily:'fontBold',color:theme_color}}>{'\u20B9 '+this.state.offer_price}</Text>/Per Month</Text>
                            </Block>
                        ):
                        (
                            <Block flex={0}>
                                <Text style={{fontFamily:'fontMedium',color:theme_color,fontSize:18}}>Enter Offer Code If You Have</Text>
                                <Block row center marginVertical>
                                    <Block>
                                        <TextInput 
                                            placeholderTextColor="#ccc"
                                            value={this.state.offer_code}
                                            onChangeText={text => {
                                                if(text.length>0){
                                                    if(/^(?:[A-Z0-9]+|\d+)$/.test(text))
                                                        this.setState({offer_code:text})
                                                }
                                            }}
                                            placeholder="Eg. XXXABC"
                                            style={[styles.textInput,{textTransform:'uppercase'}]}
                                            dense={true}
                                            maxLength={12}
                                            autoCapitalize="characters"
                                        /> 
                                    </Block>
                                    <Block flex={0}>
                                        <Button onPress={()=>this.apply_offer()} mode="contained">Apply</Button>
                                    </Block>
                                </Block>
                            </Block>
                        )
                    }
                </Block>
                <Block center padding={15} marginTop={30} marginHorizontal={30} borderRadius={10} shadow color={theme_light_color} flex={0}>
                    <Text style={{fontFamily:'fontBold',fontSize:20}}>Total Amount : <Text style={{fontFamily:'fontBold',fontSize:30,color:theme_color}}>{'\u20B9 '+final_amount}</Text></Text>
                </Block>
                <Block center marginTop={30} marginHorizontal={30} borderRadius={10} shadow color="#eee" flex={0}>
                    <Button onPress={()=>this.pay_now()} loading={this.state.loading} mode="contained" labelStyle={{color:'white',fontSize:18}} style={{width:'100%',height:50,justifyContent:'center'}}>Pay {'\u20B9 '+final_amount}</Button>
                </Block>
                <Modal
                    style={{flex:1}}
                    ref={ref=>this.pay_modal=ref}
                    coverScreen={true}
                    position="bottom"
                    backButtonClose={true}
                    swipeToClose={false}
                >
                    <Block padding>
                        <WebView 
                            onMessage={event => this.onResponse(event)} 
                            scalesPageToFit={true} 
                            style={{flex:1}}
                            source={{uri:this.state.websource}} 
                            javaScriptCanOpenWindowsAutomatically={true}
                            javaScriptEnabled={true}                            
                        />
                    </Block>
                </Modal>
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}