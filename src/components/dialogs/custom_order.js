import { Block } from 'expo-ui-kit';
import React from 'react';
import Modal from 'react-native-modalbox';
import { Button, Text, TextInput } from 'react-native-paper';
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

export default class CustomOrderModal extends React.Component{
    constructor(props){
        super(props);
        this.state={
            product_description:'',
            price:'',
            p_images:[],
            selectedItem:null,
            customers:[],
            customersAll:[],
            selectedCustomer:null,
            user:[],
            loading:false,
        }
    }
    async componentDidMount(){
        const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA,Permissions.MEDIA_LIBRARY,Permissions.MEDIA_LIBRARY_WRITE_ONLY);
        if (status === 'granted') {
            // return Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        } else {
            // await Permissions.askAsync(Permissions.CAMERA,Permissions.MEDIA_LIBRARY,Permissions.MEDIA_LIBRARY_WRITE_ONLY);
            throw new Error('Location permission not granted');
        }
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }

    componentWillUnmount(){
        this._unsubscribe;
    }

    init=()=>{
        _getUser().then(user=>this.setState({user},()=>this.getSuppliers()));
    }

    getCustomers=()=>{
        const{user}=this.state;
        try {  
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('type','joined');
            fetch(`${api_url}customers/${user.c_id}`,{
                method:'POST',
                headers:{
                    Authorization:api_key
                },
                body:fd,
            })
            .then(response=>response.json())
            .then(json=>{
                this.setState({loading:false});
                
                this.setState({customers:json,customersAll:json,selectedCustomer:json[0]});
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }

    

    render(){
        const{onRef=null}=this.props;
        const{selectedSupplier}=this.state;
        return(
            <Modal
                ref={ref=>{onRef(ref);this.modal=ref}}
                coverScreen={true}
                backButtonClose={true}
                position="bottom"
                style={{flex:0.6}}
                onOpened={()=>this.init()}
                onClosed={()=>this.setState({
                    product_description:'',
                    price:'',
                    p_images:[],
                    selectedItem:null,
                    selectedSupplier:null,
                    loading:false,
                })}
            >
                <Block flex={0} padding color="#eee" center>
                    <Text>Add Order</Text>
                </Block>
                <Block>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1,padding:15}}>
                        <Animatable.View animation="slideInUp" duration={250}>
                            <Text style={styles.inputLabel}>Selected Client</Text>
                            <SearchableDropdown placeholder="Select Client" data={this.state.customers} labelKey="name" searchKey="name" onSelect={item=>this.setState({selectedCustomer:item})} defaultValue={selectedCustomer!=null?selectedCustomer.name:''} />
                        </Animatable.View>
                        <Animatable.View animation="slideInUp" duration={400}>
                            <Text style={styles.inputLabel}>Product Price *</Text>
                            <TextInput
                                value={this.state.price}
                                onChangeText={text => this.setState({price:text})}
                                placeholder="Price (Optional)"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                keyboardType="decimal-pad"                           
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="slideInUp" duration={400}>
                            <Text style={styles.inputLabel}>Product Description *</Text>
                            <TextInput
                                value={this.state.product_description}
                                onChangeText={text => this.setState({product_description:text})}
                                placeholder="Description"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                multiline
                                numberOfLines={3}
                                autoFocus={true}                            
                            /> 
                        </Animatable.View>                        
                    </ScrollView>
                </Block>
                <Block flex={0}>
                    <Button disabled={this.state.loading} mode="contained" theme={{roundness:0}} style={{height:50,justifyContent:'center'}} loading={this.state.loading} onPress={()=>this.validate()} >Order Now</Button>
                </Block>
                <Snack ref={ref=>this.snack=ref} />
                <ImageBrowserScreen ref={ref=>this.select_images=ref} onChange={data=>this.setState({p_images:data})} {...this.props} />
                
            </Modal>
        );
    }
}