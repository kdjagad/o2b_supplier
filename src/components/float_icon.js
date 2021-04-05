import React from 'react';
import MaterialCommunityIconsIcon from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIconsIcon from "react-native-vector-icons/MaterialIcons";
import EntypoIcon from "react-native-vector-icons/Entypo";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import {  TouchableNativeFeedback, TouchableWithoutFeedback, View } from 'react-native';
import { theme_color } from '../global/variables';
import { styles } from '../global/style';
export default class FloatIcon extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        const{style='',onPress,icon=null,size=60}=this.props;
        return(
            <View style={[styles.float_icon,{...style,width:size,height:size,borderRadius:size,overflow:'hidden'}]}>
                <TouchableNativeFeedback onPress={onPress} style={{flex:1}}>
                    <View style={{width:size,height:size,alignItems:'center',justifyContent:'center'}}>
                    {
                        icon!=null?
                        icon:
                        <EntypoIcon name="plus" style={{fontSize:25,fontWeight:"100",color:"white"}} />
                    }
                    </View>
                </TouchableNativeFeedback>
            </View>
        );
    }
}