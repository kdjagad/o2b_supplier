import { Block } from "expo-ui-kit";
import React from "react";
import { Dimensions, TouchableNativeFeedback } from "react-native";
import { Button, Card, Divider, IconButton, Paragraph, Text, Title } from "react-native-paper";
import { styles } from "../../global/style";
import { theme_color } from "../../global/variables";
const product_grid_width=(Dimensions.get('window').width-20)/3;
export default function CartListCard(props){
    const{layout='list',item=[],onPress=null,onActionPress=null,isOrderButton=true,loading=false}=props;
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
    console.log("source",source);
    return(
        <Card elevation={3} style={{width:layout=='grid'?product_grid_width:'auto',backgroundColor:'white',marginHorizontal:layout=='grid'?0:10,marginLeft:layout=='grid'?10:10,marginTop:10,overflow:'hidden'}}>
            <TouchableNativeFeedback onPress={()=>onPress!=null?onPress(item):{}} style={{flex:1}}>
                <Block>
                    <Block row={layout=='list'} column={layout=='grid'}>
                        <Block flex={0}>
                            <Card.Cover source={source} theme={{roundness:10}} style={layout=='list'?[styles.thumbnailImage,{flex:1}]:[styles.thumbnailImageGrid,{height:product_grid_width}]} />
                        </Block>
                        <Block>
                            <Card.Content style={{paddingHorizontal:5}}>
                                <Title numberOfLines={2} style={{fontSize:15,fontFamily:'fontBold',lineHeight:17}}>{item.p_title.trim()}</Title>
                                <Title style={{fontSize:15,lineHeight:18,color:theme_color}}>{item.p_price?'\u20B9 '+item.p_price.trim():'Price Not Set'}</Title>
                                <Title style={{fontSize:13,lineHeight:15}}>{item.cat_name?item.cat_name.trim():''}</Title>
                                <Paragraph style={styles.lightText} numberOfLines={2}>{item.instructions?item.instructions.trim():''}</Paragraph>
                            </Card.Content>
                        </Block>
                        <Block flex={0} padding={5} justifyContent="space-between" alignItems="flex-end">
                            <Text style={{fontSize:18}}><Text style={{fontFamily:'fontBold'}}>Qty : </Text>{item.quantity}</Text>
                            <Text style={{fontSize:20,color:theme_color}}><Text style={{fontFamily:'fontBold'}}>{'\u20B9'} </Text>{item.total}</Text>
                        </Block>
                    </Block>
                    <Divider style={{marginTop:10,backgroundColor:theme_color,height:1}}  />
                    <Block row center justifyContent="space-between">
                        <Button disabled={loading} icon="pencil" style={{borderWidth:1}} color={theme_color} size={15} onPress={()=>onActionPress!=null?onActionPress('edit',item):{}} >Edit</Button>
                        <Button disabled={loading} icon={item.is_favourite=='1'?'heart':'heart-outline'} style={{borderWidth:1}}  color={theme_color} size={15} onPress={()=>onActionPress!=null?onActionPress(item.is_favourite=='1'?'favouriteRemove':'favouriteAdd',item):{}} >Favourite</Button>
                        <Button disabled={loading} icon="close" style={{borderWidth:1}} color={'red'} size={15} onPress={()=>onActionPress!=null?onActionPress('delete',item):{}} >Cancel</Button>
                    </Block>
                </Block>
            </TouchableNativeFeedback>
        </Card>
    );
}