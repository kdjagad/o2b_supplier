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

export default class AddUnitModal extends React.Component{
    constructor(props){
        super(props);
        this.state={
            unit_name:'',
            unit_description:'',
            user:[],
            loading:false,
        }
    }
    async componentDidMount(){
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
        const{item}=this.props;
        if(item){
            this.setState({
                unit_name:item.unit_name,
                unit_description:item.u_description,
            });
        }
        _getUser().then(user=>this.setState({user}));
    }

    validate=()=>{
        const{unit_name}=this.state;
        if(!unit_name){
            this.snack.show('Unit Name Required','danger');
        }
        else{
            this.save();
        }
    }

    save=()=>{
        console.log("unit insert");
        const{item}=this.props;
        const{unit_name,unit_description,user}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('unit_name',unit_name);
            fd.append('u_description',unit_description);
            if(item) fd.append('u_id',item.u_id);
            console.log('fd',fd,user.c_id);
            var action=item?'unit_upd':'unit';
            fetch(`${api_url}${action}/${user.c_id}`,{
                method:'POST',
                body:fd,
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                console.log('product json',json);
                this.setState({loading:false});
                if(json.status==1)this.snack.show(json.message,'success');
                else this.snack.show(json.message,'danger');
                setTimeout(() => {
                    this.modal.close();
                }, 500);
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            this.setState({loading:false});
            console.log("product_error",error);
        }        
    }

    render(){
        const{onRef=null,onClose=null}=this.props;
        return(
            <Modal
                ref={ref=>{onRef(ref);this.modal=ref}}
                coverScreen={true}
                backButtonClose={true}
                position="bottom"
                style={{flex:0.6}}
                onOpened={()=>this.init()}
                onClosed={()=>this.setState({
                    unit_name:'',
                    unit_description:'',
                    loading:false,
                },()=>{
                    onClose();
                })}
            >
            <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}} >
                <Block row center padding color="#eee" center>
                    <Appbar.BackAction onPress={()=>this.modal.close()} />
                    <Text>Add Unit</Text>
                </Block>
                <Block>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1,padding:15}}>
                        <Animatable.View animation="slideInUp" duration={400}>
                            <Text style={styles.inputLabel}>Unit Name</Text>
                            <TextInput
                                value={this.state.unit_name}
                                onChangeText={text => this.setState({unit_name:text})}
                                placeholder="Name"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                autoFocus={true}                            
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="slideInUp" duration={400}>
                            <Text style={styles.inputLabel}>Unit Description</Text>
                            <TextInput
                                value={this.state.unit_description}
                                onChangeText={text => this.setState({unit_description:text})}
                                placeholder="Description (Optional)"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                multiline
                                numberOfLines={3}                        
                            /> 
                        </Animatable.View>
                    </ScrollView>
                </Block>
                <Block flex={0}>
                    <Button disabled={this.state.loading} mode="contained" theme={{roundness:0}} style={{height:50,justifyContent:'center'}} loading={this.state.loading} onPress={()=>this.validate()} >Submit</Button>
                </Block>
                <Snack ref={ref=>this.snack=ref} />    
            </KeyboardAvoidingView>            
            </Modal>
        );
    }
}