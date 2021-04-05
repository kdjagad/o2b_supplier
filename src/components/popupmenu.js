import React, { useState } from "react";
import { TouchableNativeFeedback } from "react-native";
import {
    Menu,
    MenuOptions,
    MenuOption,
    MenuTrigger,
  } from 'react-native-popup-menu';
import { theme_color } from "../global/variables";

export default function PopUp(props){
    const{element=null,disabled=false}=props;
    const [visible, setVisible] = useState(false);
    return( 
        <Menu>
            <MenuTrigger disabled={disabled}>
                <TouchableNativeFeedback style={{opacity:disabled?0.3:1}} onPress={()=>setVisible(true)}>{element}</TouchableNativeFeedback>
            </MenuTrigger>
            <MenuOptions optionsContainerStyle={{borderRadius:10,overflow:'hidden',borderWidth:1,borderColor:theme_color,marginTop:50}} customStyles={{optionWrapper:{padding:10,paddingVertical:15}}}>
                {
                    props.children
                }
            </MenuOptions>
        </Menu>
    )
}