import { Block } from "expo-ui-kit";
import React, { useState } from "react";
import { Appbar, Button, Dialog, Divider, Modal, Portal, Text, TextInput } from "react-native-paper";
import ProductListCard from "../cards/product_list";
import * as Animatable from 'react-native-animatable';
import { styles } from "../../global/style";
import { theme_color } from "../../global/variables";
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import SearchableDropdown from "../searchable_dropdown";
import { ScrollView } from "react-native";

export default function AddToCartModal(props){
    const{selectedItem=null,onAdd=null,onDismiss=null,visible=false,loading=false,customers=[],onAttChange=null}=props;
    if(selectedItem==null) return null;
    const [quantity, setQuantity] = useState('0');
    const [instructions, setInstructions] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    return(
    <Portal>
        <Dialog  visible={visible} style={{flex:1}} onDismiss={()=>onDismiss!=null?onDismiss():{}}>
            <Block row center justifyContent="space-between">
                <Dialog.Title>Add To Cart</Dialog.Title>
                {/* <Button labelStyle={{fontSize:20}} onPress={()=>this.setState({addToCartModal:false})}>x</Button> */}
                <Appbar.Action animated={false} icon={()=><MaterialCommunityIcons name="close-circle-outline" color={theme_color} size={25} />} onPress={()=>onDismiss!=null?onDismiss():{}} />                                
            </Block>
            <Block>
                <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1}}>
                    <ProductListCard isOrderButton={false} item={selectedItem} layout='list' />
                    <Divider style={{marginVertical:10}} />
                    {
                        selectedItem.attributes && selectedItem.attributes.length>0 && selectedItem.attributes.map((att,index)=>{
                            console.log('is array',att);
                            if(!att.a_value || att.a_value=="") return null;
                            return(
                                <Block row center padding>
                                    <Text style={{fontSize:16,color:'#898989',fontFamily:'fontBold',color:theme_color}} key={att.a_id.toString()} >{att.a_name} :</Text>
                                    {
                                        att.a_value.includes(',') ?
                                        (
                                            <Block row center marginLeft>
                                            {
                                                att.a_value.split(',').map(attr=>{
                                                    if(!attr) return null;
                                                    return(
                                                        <Button height={22} style={{justifyContent:'center',paddingHorizontal:0,marginRight:5}} theme={{roundness:100}} mode={att.selected==attr?'contained':'outlined'} onPress={()=>{
                                                            let ind=selectedItem.attributes.indexOf(att);
                                                            console.log("ind",ind);
                                                            att={
                                                                ...att,
                                                                selected:attr
                                                            }
                                                            selectedItem.attributes[ind]=att;
                                                            console.log("atts",selectedItem);
                                                            onAttChange(selectedItem);
                                                        }}>{attr}</Button>
                                                    )
                                                })  
                                            }
                                            </Block>
                                        ):
                                        (
                                            <Block marginLeft>
                                                <Text>{att.a_value}</Text>
                                            </Block>
                                        )
                                    }
                                </Block>
                            )
                        })
                    }
                    <Dialog.Content>
                        <Animatable.View animation="slideInUp" duration={300}>
                            <Block flex={0}>
                                <Text style={styles.inputLabel}>Selected Client</Text>
                                <SearchableDropdown placeholder="Select Client" data={customers} labelKey="name" searchKey="name" onSelect={item=>setSelectedCustomer(item)} defaultValue={selectedCustomer!=null?selectedCustomer.name:''} />
                            </Block>
                        </Animatable.View>
                        <Animatable.View animation="slideInUp" duration={300}>
                            <Text style={styles.inputLabel}>Quantity</Text>
                            <TextInput
                                value={quantity}
                                onChangeText={text => setQuantity(text)}
                                placeholder="Enter Quantity"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                keyboardType="numeric"
                                autoFocus={true}                         
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="slideInUp" duration={300}>
                            <Text style={styles.inputLabel}>Special Instruction</Text>
                            <TextInput
                                value={instructions}
                                onChangeText={text => setInstructions(text)}
                                placeholder="Special Instruction If Any For This Product"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                multiline
                                numberOfLines={3}                            
                            /> 
                        </Animatable.View>
                    </Dialog.Content>
                </ScrollView>
            </Block>            
            <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} style={{height:50,marginTop:20,justifyContent:'center'}} loading={loading} onPress={()=>onAdd!=null?onAdd(quantity,instructions,selectedItem,selectedCustomer):{}} >Order Now</Button>
        </Dialog>
    </Portal>
    );
}