import { Block } from "expo-ui-kit";
import React, { useEffect, useState } from "react";
import { Appbar, Button, Dialog, Divider, Modal, Portal, Text, TextInput } from "react-native-paper";
import ProductListCard from "../cards/product_list";
import * as Animatable from 'react-native-animatable';
import { styles } from "../../global/style";
import { theme_color } from "../../global/variables";
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import DTPicker from "../dtpicker";
import moment from 'moment';

export default function AcceptOrderModal(props){
    const{selectedItem=null,onAccept=null,onDismiss=null,visible=false,loading=false}=props;
    // if(selectedItem==null) return null;
    console.log('selectedItem',selectedItem);
    const [date, setDate] = useState(null);
    const [remarks, setRemakrs] = useState('');

    return(
    <Portal>
        <Dialog  visible={visible} onDismiss={()=>onDismiss!=null?onDismiss():{}}>
            <Block row center justifyContent="space-between">
                <Dialog.Title>Accept Order</Dialog.Title>
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
                    {/* <Text style={styles.inputLabel}>Delivery Date</Text> */}
                    <DTPicker defaultValue="Eg. 10-10-2021" minimumDate={new Date()} label="Delivery Date" onChangeDate={date=>setDate(date)} />
                </Animatable.View>
                <Animatable.View animation="slideInUp" duration={300}>
                    <Text style={styles.inputLabel}>Remarks</Text>
                    <TextInput
                        value={remarks}
                        onChangeText={text => setRemakrs(text)}
                        placeholder="Remarks If Any For This Order (Optional)"
                        underlineColor="#ccc"
                        style={styles.textInput}
                        dense={true}
                        multiline
                        numberOfLines={3}                            
                    /> 
                </Animatable.View>
                <Button mode="contained" labelStyle={{color:'white'}} minD labelStyle={{color:'white'}} style={{height:50,marginTop:20,justifyContent:'center'}} loading={loading} onPress={()=>onAccept!=null?onAccept(moment(date).format("YYYY-MM-DD"),selectedItem,remarks):{}} >Accept Now</Button>
            </Dialog.Content>
        </Dialog>
    </Portal>
    );
}