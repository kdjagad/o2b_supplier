import { Block } from "expo-ui-kit";
import React, { useEffect, useState } from "react";
import { Appbar, Button, Dialog, Divider, Modal, Portal, Text, TextInput } from "react-native-paper";
import ProductListCard from "../cards/product_list";
import * as Animatable from 'react-native-animatable';
import { styles } from "../../global/style";
import { theme_color } from "../../global/variables";
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';

export default function CancelOrderModal(props){
    const{selectedItem=null,onCancel=null,onDismiss=null,visible=false,loading=false}=props;
    // if(selectedItem==null) return null;
    console.log('selectedItem',selectedItem);
    const [reason, setReason] = useState('');

    return(
    <Portal>
        <Dialog  visible={visible} onDismiss={()=>onDismiss!=null?onDismiss():{}}>
            <Block row center justifyContent="space-between">
                <Dialog.Title>Cancel Order</Dialog.Title>
                {/* <Button labelStyle={{fontSize:20}} onPress={()=>this.setState({addToCartModal:false,selectedItem:null})}>x</Button> */}
                <Appbar.Action animated={false} icon={()=><MaterialCommunityIcons name="close-circle-outline" color={theme_color} size={25} />} onPress={()=>onDismiss!=null?onDismiss():{}} />                                
            </Block>
            {
                selectedItem!=null &&
                <ProductListCard isOrderButton={false} item={selectedItem} layout='list' />
            }
            <Divider style={{marginVertical:10}} />
            <Dialog.Content>
                <Animatable.View animation="slideInUp" duration={300}>
                    <Text style={styles.inputLabel}>Reason (Optional)</Text>
                    <TextInput
                        value={reason}
                        onChangeText={text => setReason(text)}
                        placeholder="Enter Genuine Reason For Cancel This Order"
                        underlineColor="#ccc"
                        style={styles.textInput}
                        dense={true}
                        multiline
                        numberOfLines={3}
                        autoFocus                            
                    /> 
                </Animatable.View>
                <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} style={{height:50,marginTop:20,justifyContent:'center'}} loading={loading} onPress={()=>onCancel!=null?onCancel(reason,selectedItem):{}} >Cancel Now</Button>
            </Dialog.Content>
        </Dialog>
    </Portal>
    );
}