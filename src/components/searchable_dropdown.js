import { Block, Text } from "expo-ui-kit";
import React, { useEffect, useState } from "react";
import { FlatList, Modal, TouchableOpacity,TouchableNativeFeedback } from "react-native";
import {  Appbar, Searchbar, TextInput } from "react-native-paper";
import { styles } from "../global/style";
import { FontAwesome5,Entypo,FontAwesome,MaterialCommunityIcons } from '@expo/vector-icons';
import { theme_color } from "../global/variables";
export default function SearchableDropdown(props){
    const{placeholder="Select",data,searchKey='name',labelKey='name',onSelect={},defaultValue='',disabled=false,allLabel=false}=props;
    if(data[0] && data[0][labelKey]!='All' && allLabel)
        data.unshift({[labelKey]:'All'});
    // const [value, setValue] = useState('');
    if(data[0] && data[0][labelKey]!='None')
        data.unshift({[labelKey]:'None'});
    const [search_value, setSearch_value] = useState('');
    const [visible, setVisible] = useState(false);
    const [fdata, setFdata] = useState(data);

    const renderItem=(item)=>{
        return(
            <TouchableNativeFeedback style={{flex:1}} onPress={()=>{
                item=item[labelKey]=="All"?null:item;
                onSelect(item);
                setVisible(false);
                setSearch_value('');
                setFdata(data);
            }}>
            <Block>
                <Block padding paddingHorizontal={20} borderBottomWidth={1} borderColor="#ccc">
                    <Text size={18}>{item[labelKey]}</Text>
                </Block>
            </Block>
            </TouchableNativeFeedback>
        );
    }

    const search=(val)=>{
        setSearch_value(val);
        val=val.toLowerCase();
        let dt=data;
        if(val.length>0){
            dt=data.filter(dt=>dt[searchKey].toLowerCase().match(val));
        }
        setFdata(dt);
    }
    return(
        <Block flex={0} height={50} opacity={disabled?0.6:1}>
            <Block>
                <TouchableNativeFeedback onPress={()=>disabled?{}:setVisible(true)}>
                    <Block style={{flexDirection:'row',alignItems:'center'}}>
                        <Block style={{flex:1}}>
                            {/* <TextInput
                                value={defaultValue}
                                // onChangeText={text => this.setState({email:text})}
                                placeholder={placeholder}
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                // disabled={true}
                                editable={false}
                                shouldRasterizeIOS={false}
                                
                            /> */}
                            <Block height={40} justifyContent="center" borderBottomWidth={1} borderColor="#ccc">
                                <Text size={22}>{defaultValue?defaultValue:placeholder}</Text>
                            </Block>
                        </Block>
                        <Block style={{position:'absolute',height:'100%',width:20,right:0,alignItems:'center',justifyContent:'center'}}>
                            <FontAwesome name="angle-down" size={20} style={{color:'#888'}} />
                        </Block>
                    </Block>
                </TouchableNativeFeedback>
            </Block>
            <Modal 
            visible={visible} 
            onDismiss={()=>setVisible(false)} 
            statusBarTranslucent={true} 
            onRequestClose={()=>setVisible(false)}
            animationType="fade"
            onShow={()=>setFdata(data)}
            transparent={true}
            >
                <Block color="rgba(0,0,0,0.5)">
                    <Block margin={50} marginVertical={100} flex={0.6} shadow borderRadius={10} color="white">
                        <Appbar.Header style={{backgroundColor:'rgba(0,0,0,0.02)',elevation:0}} statusBarHeight={0}>
                                <Block row center>
                                    <Block>
                                        <Searchbar
                                            value={search_value}
                                            onChangeText={text => search(text)}
                                            placeholder="Search Here"
                                            style={{elevation:0,backgroundColor:'transparent'}}
                                            autoFocus={true}
                                            enablesReturnKeyAutomatically={true}
                                        />
                                    </Block>
                                    <Appbar.Action animated={false} icon={()=><MaterialCommunityIcons name="close-circle-outline" color={theme_color} size={25} />} onPress={()=>setVisible(false)} animated={false} />                                
                                </Block>
                        </Appbar.Header>
                        <FlatList keyboardShouldPersistTaps="always"
                        data={fdata}
                        keyExtractor={(item,index)=>index.toString()}
                        renderItem={({item})=>renderItem(item)}
                        style={{flex:1}}
                        />
                    </Block>
                </Block>
            </Modal>
        </Block>
    );
}