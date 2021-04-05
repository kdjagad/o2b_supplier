import { Block } from 'expo-ui-kit';
import React from 'react';
import Modal from 'react-native-modalbox';
import { Appbar, Button, Text, TextInput } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';
import { styles } from '../../global/style';
import Snack from '../snack';
import { FlatList } from 'react-native';
import ImageBrowserScreen from '../ImageBrowseScreen';
import { Image } from 'react-native';
import { ScrollView } from 'react-native';
import AddToCartModal from './add_to_cart';
import { _getUser } from '../../global/auth';
import { api_key, api_url } from '../../global/variables';
import * as Permissions from 'expo-permissions';
import SearchableDropdown from '../searchable_dropdown';
import { KeyboardAvoidingView } from 'react-native';
import { Platform } from 'react-native';
import SingleProduct from '../../views/products/single_product';

export default class ProductViewModal extends React.Component{
    constructor(props){
        super(props);
        this.state={            
            loading:false,
        }
    }
    render(){
        const{onRef=null,onClose=null,item=null}=this.props;
        console.log("productView",item);
        return(
            <Modal
                ref={ref=>{onRef(ref);this.modal=ref}}
                coverScreen={true}
                backButtonClose={true}
                position="bottom"
                style={{flex:0.8}}                
            >
                <SingleProduct is_popup={true} {...this.props} />           
            </Modal>
        );
    }
}