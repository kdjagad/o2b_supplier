import { Block } from 'expo-ui-kit';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

export default function Step(props){
    const{onNext=null,onClose=null,position='topLeft'}=props;
    return(
        <Block style={[styles.tooltip,styles[position]]}>
            <Block padding>
                {props.children}
            </Block>
            <Block row center justifyContent="space-between">
                <Button height={32} style={{justifyContent:'center',padding:0}} labelStyle={{fontSize:12,padding:0}} mode="outlined" onPress={()=>onClose!=null?onClose():{}}>Close</Button>
                <Button height={32} style={{justifyContent:'center',padding:0}} labelStyle={{fontSize:12,padding:0}} mode="outlined" onPress={()=>onNext!=null?onNext():{}}>Next</Button>
            </Block>
        </Block>
    )
}

const styles=StyleSheet.create({
    tooltip:{
        position:'absolute',
        padding:5,
        borderRadius:10,
        backgroundColor:'white',
        maxWidth:200
    },
    bottomLeft:{
        left:5,
        bottom:5,
    },
    bottomRight:{
        right:0,
        left:-190,
        bottom:5,
    },
    topLeft:{
        left:10,
        top:50,
        right:0
    },
    topRight:{
        right:10,
        left:-190,
        top:50,
    },
})