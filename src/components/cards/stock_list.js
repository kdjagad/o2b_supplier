import { Block } from "expo-ui-kit";
import React, { useState } from "react";
import { Dimensions, TouchableNativeFeedback } from "react-native";
import { Button, Card, Paragraph, Switch, Text, Title } from "react-native-paper";
import { styles } from "../../global/style";
import { api_key, api_url, theme_color, theme_light_color } from "../../global/variables";
const product_grid_width=(Dimensions.get('window').width-40)/3;
export default function StockListCard(props){
    const{layout='list',item=[],onPress=null,onOrderPress=null,isOrderButton=true,client=null}=props;
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
    console.log("order",uri);
    var switchVal=true;
    if(client!=null){
        var disval=item.disabled_for?item.disabled_for.split(','):[];
        switchVal=disval.includes(client.u_id)?false:true;
    }
    const [sw, setSw] = useState(switchVal);
    var statusSwitch=parseInt(item.status)?true:false;
    const [statusSw, setStatusSw] = useState(statusSwitch);

    const enableDisable=(status)=>{
        console.log("status",status);
        setSw(status);
        var action=!status?'add':'remove';
        var user_id=0;
        if(client!=null) user_id=client.u_id;
        try {
            // this.setState({loading:true});
            let fd = new FormData();
            fd.append('action',action);
            fd.append('user_id',user_id);
            console.log("fd",fd);
            fetch(`${api_url}product_enable_disable/${item.p_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("resp",json);
                // this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
                // var type=json.status==1?'success':'danger';
                // this.snack.show(json.message,type);
            })
            .catch(err=>{
                console.log("json err",err);
                // this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
            })
        } catch (error) {
            
        }
    }
    const showHide=(status)=>{
        console.log("status",status);
        setStatusSw(status);
        try {
            // this.setState({loading:true});
            let fd = new FormData();
            fd.append('status',status?1:0);
            console.log("fd",fd);
            fetch(`${api_url}product_show_hide/${item.p_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("resp",json);
                // this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
                // var type=json.status==1?'success':'danger';
                // this.snack.show(json.message,type);
            })
            .catch(err=>{
                console.log("json err",err);
                // this.setState({loading:false,cancelOrderModal:false,selectedItem:null},()=>this.getOrderItems());
            })
        } catch (error) {
            
        }
    }
    return(
        <Card elevation={3} style={{width:layout=='grid'?product_grid_width:'auto',backgroundColor:'white',marginHorizontal:layout=='grid'?0:10,marginLeft:layout=='grid'?10:10,marginTop:10,overflow:'hidden'}}>
            <TouchableNativeFeedback onPress={()=>onPress!=null?onPress(item):{}} style={{flex:1}}>
                <Block row={layout=='list'} column={layout=='grid'}>
                    <Block flex={0}>
                        <Card.Cover source={source} resizeMethod="scale" resizeMode="contain" style={{width:50,height:50,borderRadius:10}} />
                    </Block>
                    <Block>
                        <Card.Content style={{paddingHorizontal:5}}>
                            <Title numberOfLines={2} style={{fontSize:15,fontFamily:'fontBold',lineHeight:17}}>{item.p_title.trim()}</Title>
                            {/* <Paragraph style={styles.lightText} numberOfLines={2}>{item.p_description?item.p_description.trim():''}</Paragraph> */}
                            <Title style={{fontSize:15,lineHeight:18,color:theme_color}}>{item.p_price?'\u20B9 '+item.p_price.trim():'Price Not Set'}{item.unit_name?`/ Per ${item.unit_name}`:''}</Title>
                            {
                                item.u_description!='' && item.u_description!=undefined &&
                                <Title style={{fontSize:12,color:'#888',lineHeight:13}}>{item.u_description.toString().trim()}</Title>
                            }
                            <Title style={{fontSize:13,lineHeight:15}}>{item.cat_name?item.cat_name.trim():''}</Title>
                        </Card.Content>
                    </Block>
                    <Block flex={0} justifyContent="flex-end">
                    {
                        item.attributes!=undefined && item.attributes.length>0 &&
                        <Button onPress={()=>onPress!=null?onPress(item):{}} mode="outlined" style={{height:35,backgroundColor:theme_light_color,justifyContent:'center',borderBottomLeftRadius:0,borderTopRightRadius:0}}>Manage Stock</Button>
                    }
                    </Block>
                </Block>
            </TouchableNativeFeedback>
        </Card>
    );
}