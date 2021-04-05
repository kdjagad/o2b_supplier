import React from 'react';
import { Button, Searchbar } from 'react-native-paper';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';

export default class AppSearchBar extends React.Component{
    render(){
        const{onClear=null}=this.props;
        return(
            <Searchbar ref={ref=>this.search=ref} clearButtonMode="unless-editing" clearIcon={()=><Button color="#444" onPress={()=>{this.search.clear();onClear!=null?onClear():null}}><MaterialCommunityIcons name="close" size={18}  /></Button>} {...this.props} />
        );
    }
}