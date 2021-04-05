import * as React from 'react';
import { ActivityIndicator, Dialog, IconButton, Paragraph, Portal, Snackbar } from "react-native-paper";
import * as Icon from '@expo/vector-icons';
import { Block } from 'expo-ui-kit';

export default class Loader extends React.Component{
    constructor(props){
        super(props);
    }
    render(){
        const{loading=false}=this.props;
        return(
            <Portal>
                <Dialog visible={loading} style={{width:50,height:50,alignItems:'center',justifyContent:'center',alignSelf:'center',backgroundColor:'transparent',elevation:0}}>
                    <ActivityIndicator size={50} />
                </Dialog>
            </Portal>
        );
    }
}