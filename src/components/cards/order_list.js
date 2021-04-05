import { Block } from "expo-ui-kit";
import React from "react";
import { Dimensions, TouchableNativeFeedback } from "react-native";
import { Button, Card, Checkbox, Divider, IconButton, Paragraph, Text, Title } from "react-native-paper";
import { styles } from "../../global/style";
import { theme_color,light_text, theme_light_color } from "../../global/variables";
import StepIndicator from 'react-native-step-indicator';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import PopUp from "../popupmenu";
import { MenuOption } from "react-native-popup-menu";

const product_grid_width=(Dimensions.get('window').width-20)/3;
export default function OrderListCard(props){
    const{layout='list',onCheck=null,item=[],onPress=null,fltr=null,onActionPress=null,isOrderButton=true,onUpdateOrderStatus=null,loading=false,selectedItems=[]}=props;
    const preview = require('../../assets/images/o2b_placeholder.png');
    var uri = item.images.length>0?item.images[0]:null;
    const labels = ["Pending","In Process","In Transit","Delivered"];
    const customStyles = {
        stepIndicatorSize: 30,
        currentStepIndicatorSize:35,
        separatorStrokeWidth: 3,
        currentStepStrokeWidth: 3,
        stepStrokeCurrentColor: theme_light_color,
        stepStrokeWidth: 1,
        stepStrokeFinishedColor: theme_light_color,
        stepStrokeUnFinishedColor: '#aaaaaa',
        separatorFinishedColor: theme_light_color,
        separatorUnFinishedColor: '#aaaaaa',
        stepIndicatorFinishedColor: theme_light_color,
        stepIndicatorUnFinishedColor: '#ffffff',
        stepIndicatorCurrentColor: '#ffffff',
        stepIndicatorLabelFontSize: 15,
        currentStepIndicatorLabelFontSize: 15,
        stepIndicatorLabelCurrentColor: theme_light_color,
        stepIndicatorLabelFinishedColor: theme_color,
        stepIndicatorLabelUnFinishedColor: '#aaaaaa',
        labelColor: '#999999',
        labelSize: 13,
        currentStepLabelColor: theme_light_color
    }
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
    console.log("order",uri);
    const status=item.order_status=='0'
                ?'Pending'
                :item.order_status=='1'
                ?'In Process'
                :item.order_status=='1'
                ?'Ready For Dispatch'
                :item.order_status=='2'
                ?'In Transit'
                :item.order_status=='3'
                ?'Confirm Delivered'
                :'';
                let price=(item.c_price==null)?item.p_price:item.c_price;
                var st=selectedItems.findIndex(dt=>dt.order_id==item.order_id);
        return(
            <Block row marginTop={15}>
                {
                    fltr!=null && fltr!='completed' && fltr!='cancelled' &&
                    <Block flex={0} paddingLeft={15}>
                        <Checkbox.Android
                            status={st>=0?'checked':'unchecked'}
                            color={theme_color}
                            onPress={()=>{
                                console.log("sttttttttttt",st);
                                if(st<0){
                                    selectedItems.push(item);
                                }else{
                                    selectedItems.splice(st,1);
                                }
                                onCheck(selectedItems);
                            }}
                        />
                    </Block>
                }
                <Block>
                    <Card elevation={3} style={{width:layout=='grid'?product_grid_width:'auto',backgroundColor:'white',marginHorizontal:layout=='grid'?0:10,marginLeft:layout=='grid'?10:10,overflow:'hidden'}}>
                        <TouchableNativeFeedback onPress={()=>onPress!=null?onPress(item):{}} style={{flex:1}}>
                            <Block>
                            <Block row center justifyContent="space-between">
                                    <Block height={35} justifyContent="center">
                                        <Text style={{fontSize:18,fontFamily:'fontBold',paddingLeft:10}}>{item.order_no}</Text>
                                    </Block>
                                    
                                    {
                                        
                                        item.is_cancelled=='1' ?
                                        <Block flex={0} alignItems="flex-end">
                                            <Text style={{fontSize:18,color:'red',paddingHorizontal:10}}>Cancelled</Text>
                                            <Text style={{fontSize:18,color:'#525252',paddingHorizontal:10}} numberOfLines={2}>{item.reason}</Text>
                                        </Block>:
                                        (
                                            parseInt(item.order_status)<3?(
                                                item.order_status=='0' ?
                                                (
                                                    <Block row center>
                                                        <Button disabled={loading} icon="check" style={{borderWidth:1}} color={'green'} size={15} onPress={()=>onActionPress!=null?onActionPress('accept_order',item):{}} >Accept</Button>
                                                        <Button disabled={loading} icon="close" style={{borderWidth:1}} color={'red'} size={15} onPress={()=>onActionPress!=null?onActionPress('reject_order',item):{}} >Reject</Button>
                                                    </Block>
                                                )
                                                :(
                                                    item.order_status=='2'?(
                                                        <Block>
                                                            <Button disabled={loading} icon="check" style={{borderWidth:1}} color={'orange'} size={15} onPress={() => onUpdateOrderStatus!=null?onUpdateOrderStatus(6,item,'supplier'):{}} >Confirm Delivery</Button>
                                                        </Block>
                                                    ):(
                                                        <Block>
                                                            <Button disabled={loading} icon="close" style={{borderWidth:1}} color={'red'} size={15} onPress={()=>onActionPress!=null?onActionPress('reject_order',item):{}} >Reject</Button>
                                                        </Block>
                                                    )
                                                )
                                            ):(
                                                <Text style={{padding:10,fontFamily:'fontBold',color:'green'}}>Confirmed By {item.action_by=='supplier'?'Self':'Client'}</Text>
                                            )                                
                                        )
                                    }
                                </Block>
                                <Divider style={{marginBottom:10,backgroundColor:theme_color,height:2}}  />
                                <Block row={layout=='list'} column={layout=='grid'} style={{paddingLeft:10}}>
                                    {/* <Block flex={0}>
                                        <Card.Cover source={source} resizeMethod="scale" resizeMode="contain" style={{width:60,height:60}} />
                                    </Block>                         */}
                                    <Block>
                                        <Card.Content style={{paddingHorizontal:5}}>
                                            <Title numberOfLines={2} style={{fontSize:15,fontFamily:'fontBold',lineHeight:17,paddingRight:10}}>{item.p_title.trim()}</Title>
                                            <Title style={{fontSize:15,lineHeight:18,color:theme_color}}>{price?'\u20B9 '+price.trim():'Price Not Set'}</Title>
                                            {/* <Title style={{fontSize:13,lineHeight:15}}>{item.cat_name?item.cat_name.trim():''}</Title> */}
                                            {/* <Paragraph style={styles.lightText} numberOfLines={2}>{item.instructions?item.instructions.trim():''}</Paragraph> */}
                                            <Text style={{fontSize:14,fontFamily:'fontBold'}}>{status}</Text>
                                        </Card.Content>
                                    </Block>
                                    <Block flex={0} padding={5} justifyContent="space-between" alignItems="flex-end" style={{paddingRight:10}}>
                                        <Text style={{fontSize:14}}><Text style={{fontFamily:'fontBold'}}>Qty : </Text>{item.quantity}</Text>
                                        <Text style={{fontSize:17,color:theme_color}}><Text style={{fontFamily:'fontBold'}}>{'\u20B9'} </Text>{item.amount}</Text>
                                        {
                                            item.delivery_date!=null && item.delivery_date!='0000-00-00' &&
                                            <Text style={{fontSize:17,color:theme_color}}><Text style={{fontFamily:'fontBold'}}>Delivery Date :  </Text>{item.delivery_date}</Text>
                                        }
                                    </Block>
                                </Block>
                                {/* {
                                    item.is_cancelled=='0' &&
                                    <Block paddingTop>
                                        <StepIndicator
                                            customStyles={customStyles}
                                            currentPosition={parseInt(item.order_status)}
                                            labels={labels}
                                            stepCount={labels.length}
                                            renderLabel={({position,stepStatus,label,currentPosition})=>{
                                                return(
                                                    <Block >
                                                        <Text style={{fontSize:10,color:position==currentPosition?theme_color:light_text,textAlign:'center',flex:1}}>{label}</Text>
                                                    </Block>
                                                )
                                            }}
                                            renderStepIndicator={({position,stepStatus})=>{
                                                if(stepStatus=='unfinished') return null;
                                                return(
                                                    <MaterialCommunityIcons name={stepStatus=='current'?'dots-horizontal':'check'} size={20} color={stepStatus=='finished'?'green':'#ccc'} />
                                                )
                                            }}
                                        />
                                    </Block>
                                } */}
                                {/* <Divider style={{marginTop:10,backgroundColor:theme_color,height:1}}  /> */}
                               
                            </Block>
                        </TouchableNativeFeedback>
                    </Card>
                </Block>
            </Block>
    );
}