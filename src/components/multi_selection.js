import React, { useEffect, useRef, useState } from 'react';
import { FontAwesome5,Entypo,FontAwesome } from '@expo/vector-icons';
import {  FlatList, KeyboardAvoidingView, Modal, ScrollView, TouchableNativeFeedback, TouchableWithoutFeedback, View } from 'react-native';
import { theme_color } from '../global/variables';
import { styles } from '../global/style';
import { Block, Text } from 'expo-ui-kit';
import { Appbar, Button, IconButton, TextInput } from 'react-native-paper';

export function MultiSelection(props){
    let{defaultValue='',placeholder='Select',data=[],labelKey='name',selectedValues='',searchKey='name',onChange={}}=props;
    // const [value, setValue] = useState(defaultValue);
    // var selvals=selectedValues?selectedValues.split(','):[''];
    const [listData, setListData] = useState(['']);
    const [visible, setVisible] = useState(false);
    const itemsRef = useRef([]);
    // const [selected, setSelected] = useState(selectedValues);
    const onSelect=(item)=>{
        let dt=selectedValues?selectedValues.split(','):[];
        dt.push(item[labelKey]);
        onChange(dt.join(','));
    }
    console.log("selected values",selectedValues);

    useEffect(() => {
        var selvals=selectedValues?selectedValues.split(','):[''];
        setListData(selvals);
    }, [selectedValues])
    
    return(
        <Block>
            <Block row style={{flexWrap:'wrap'}}>
                {
                    listData && listData.map((dt,index)=>{
                        if(!dt) return null;
                        return(
                            <Block row padding={2} margin={2} paddingHorizontal={2} flex={0} borderWidth={1} borderRadius={50}>
                                <Text paddingHorizontal>{dt}</Text>
                                <TouchableNativeFeedback onPress={()=>{
                                    const newData=[...listData];
                                    newData.splice(index,1);
                                    setListData(newData);
                                    onChange(newData.join(','));
                                }}>
                                <Block width={20} flex={0} height={20} borderRadius={20} center color="red"><Text color="white">x</Text></Block>
                                </TouchableNativeFeedback>
                            </Block>
                        )
                    })
                }
            </Block>
            <TouchableNativeFeedback onPress={()=>setVisible(true)}>
                <Block paddingVertical={10} borderBottomWidth={1} borderColor="#ccc">
                    <Text color="#999">{placeholder}</Text>
                </Block>
            </TouchableNativeFeedback>
            <Modal 
                visible={visible} 
                onDismiss={()=>setVisible(false)} 
                statusBarTranslucent={true} 
                onRequestClose={()=>setVisible(false)}
                animationType="fade"
                transparent={true}
                // onShow={()=>setFdata(data)}
            >
            <Block color="rgba(0,0,0,0.5)">
                <Block margin={50} marginVertical={100} shadow borderRadius={10} color="white">
                <Appbar.Header style={{backgroundColor:'rgba(0,0,0,0.02)',elevation:0}} statusBarHeight={0}>
                        {/* <Appbar.BackAction onPress={()=>setVisible(false)} color="#252525"  /> */}
                            <Block paddingHorizontal>
                                <Text>Set {defaultValue}</Text>
                            </Block>
                        <Appbar.Action animated={false} icon={()=><FontAwesome name="check" size={20} color="black" />}  onPress={()=>setVisible(false)} />
                </Appbar.Header>
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}} >
                <View style={{flex:1}}>
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}}>
                <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1}}>
                {
                    listData.map((ldt,index)=>{
                        return(
                            <Block paddingHorizontal={15} flex={0} row center>
                                <Block>
                                    <TextInput placeholderTextColor="#ccc"
                                        value={listData[index].toString()}
                                        ref={el => itemsRef.current[index] = el}
                                        onChangeText={text => {
                                            const newData=[...listData];
                                            newData[index]=text;
                                            if(!newData[index+1] && text.length>0)newData[index+1]='';
                                            
                                            setListData(newData);
                                            onChange(newData.join(','));
                                        }}
                                        underlineColor="#ccc"
                                        style={styles.textInput}
                                        dense={true}
                                        onSubmitEditing={()=>itemsRef.current[index+1].focus()} 
                                        returnKeyType="next" 
                                        autoFocus={index==0?true:false}   
                                        placeholder={`Enter ${defaultValue}`}   
                                        blurOnSubmit={false}                   
                                    />
                                </Block>
                                {
                                    listData.length>1 &&
                                    <IconButton
                                        icon="close"
                                        color="red"                                        
                                        size={15}
                                        onPress={() =>{
                                            const newData=[...listData];
                                            newData.splice(index,1);
                                            setListData(newData);
                                            onChange(newData.join(','));
                                        }}
                                    />
                                }
                            </Block>
                        )
                    })
                }
                </ScrollView>
                </KeyboardAvoidingView>
                    </View>
                </KeyboardAvoidingView>
                </Block>
                </Block>
            </Modal>
        </Block>
    );
}