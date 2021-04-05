import { Block, Text } from "expo-ui-kit";
import React from "react";
import { api_key, api_url, theme_color,site_url, theme_light_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import { Feather,MaterialCommunityIcons } from '@expo/vector-icons';
import { _getUser } from "../../global/auth";
import SearchableDropdown from "../../components/searchable_dropdown";
import { styles } from "../../global/style";
import { Button, TextInput } from "react-native-paper";
import { Image, KeyboardAvoidingView, ScrollView, View,FlatList,TouchableNativeFeedback } from "react-native";
import { ImageBrowser } from 'expo-image-picker-multiple';
import * as Animatable from 'react-native-animatable';
import ImageBrowserScreen from "../../components/ImageBrowseScreen";
import Snack from "../../components/snack";
import MultiSelect from "react-native-multiple-select";
import { MultiSelection } from "../../components/multi_selection";

import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as ImageManipulator from 'expo-image-manipulator';
import Modal from "react-native-modalbox";
import mime from 'mime';

export default class HelpDesk extends React.Component{
    constructor(props){
        super(props);
        this.state={
            help_title:'',
            help_description:'',
            image:null,
            loading:false,
        }

        this.baseState=this.state;
    }

    componentDidMount(){
        _getUser().then(user=>this.setState({user}));
    }

    imagePicker=async ()=>{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            // allowsEditing: true,
            // aspect: [4, 3],
            quality: 1,
        });
    
        console.log(result);
    
        if (!result.cancelled) {
            this.setState({image:result.uri});
        }
    }

    imagePicker=async (type)=>{   
        const { status } = await Permissions.askAsync(Permissions.CAMERA,Permissions.CAMERA_ROLL,Permissions.NOTIFICATIONS);
        console.log("status",status);
        let result=null;
        if(type=='gallery'){

            result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                // allowsEditing: true,
                // aspect: [4, 3],
                quality: 1,
            });
        }else{
            result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.All,
                // allowsEditing: true,
                // aspect: [4, 3],
                quality: 1,
            });
        }
    
        // console.log(result);
    
        if (!result.cancelled) {
            this.action_sheet.close();
            const manipResult = await ImageManipulator.manipulateAsync(
                result.localUri || result.uri,
                [{resize:{width:400}}],
                { compress: 1 }
            );
            console.log("manip result",manipResult);
            this.setState({image:manipResult.uri});
        }
    }

    validate=()=>{        
        let{image,help_title,help_description}=this.state;
        if(help_title==null || !help_title){
            alert('Please Insert Title');
        }else if(help_description==null || !help_description){
            alert('Please Insert Description');
        }
        else if(image==null || !image){
            alert('Please Insert Image');
        }
        else{
            this.add_help();
        }           
    }

    add_help=()=>{
        let{image,help_title,help_description,user}=this.state;
        // let item='';
        // if(this.props.route.params){
        //     item=this.props.route.params.item;
        // }
        this.setState({loading:true});
        let fd=new FormData();
        // fd.append('action','insert_help');
        // if(item){
        //     fd.append('is_update',true);
        //     fd.append('id',item.id);
        // }
        // fd.append('member_code',user.member_code);
        fd.append('help_title',help_title);
        fd.append('help_description',help_description);
        console.log('fd',fd,user.c_id);
        if(image!=null){
            const newImageUri =  "file:///" + image.split("file:/").join("");
            console.log("filename",newImageUri);
            fd.append("image",{
                uri : newImageUri,
                type: mime.getType(newImageUri),
                name: newImageUri.split("/").pop()
            });
        }
        fetch(`${api_url}help_desk/${user.c_id}`,{
            method:'POST',
            body:fd,
            headers:{
                Authorization:api_key
            }
        })
        .then((response) => response.json())
        .then((json) => {
            if(json.status==1){
                // this.props.navigation.pop();
                this.setState(this.baseState);
            }else{
                alert(json.message);
            }              
        })
        .catch((error) => {
            // this.setState(this.baseState,()=>{
            //     _getUser().then(user=>this.setState({user}));
            // });
            console.error("Login Error",error);
        });
    }

    render(){
        const{data}=this.state;
        return(
            <View style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}} >
                    <View style={{flex:1}}>
                        <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1,padding:20}} alwaysBounceVertical={true} bouncesZoom={true} bounces={true}>
                                <Animatable.View animation="slideInUp" duration={300}>
                                <Text style={styles.inputLabel}>Title</Text>
                                <TextInput
                                    value={this.state.help_title}
                                    onChangeText={value=>this.setState({help_title:value})}
                                    placeholder="Title"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    // secureTextEntry={true}
                                    denese={true}                            
                                /> 
                                </Animatable.View>

                                <Animatable.View animation="slideInUp" duration={300}>
                                <Text style={styles.inputLabel}>Description</Text>
                                <TextInput
                                    value={this.state.help_description}
                                    onChangeText={value=>this.setState({help_description:value})}
                                    placeholder="Description"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    // secureTextEntry={true}
                                    multiline={true}
                                    numberOfLines={5}
                                    dense={true}                            
                                /> 
                                </Animatable.View>

                                <Animatable.View animation="slideInUp" duration={300}>
                                <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('#ccc',false)} onPress={()=>this.action_sheet.open()}>
                                        <View style={{height:160,alignItems:"center",justifyContent:"center",backgroundColor:"#eee",borderRadius:10,alignSelf:"stretch",marginVertical:20,overflow:"hidden"}}>
                                        {
                                            this.state.image==null?
                                            <View style={{alignItems:"center"}}>
                                                <FontAwesomeIcon name="image" size={50} style={{marginBottom:10}} />
                                                <Text>Upload Image / Screenshot Here</Text>
                                            </View> :
                                            <Image source={{uri:this.state.image}} style={{width:'100%',flex:1,resizeMode:"contain"}} /> 
                                        }
                                        </View>
                                    </TouchableNativeFeedback>
                                </Animatable.View>
                            <Block marginVertical>
                                <Button mode="contained" labelStyle={{color:'white'}} style={{height:50,justifyContent:'center'}} loading={this.state.loading} onPress={()=>this.validate()} >Submit</Button>
                            </Block>
                        </ScrollView>
                    </View>  
                               
                    <Modal
                        
                        ref={ref=>this.action_sheet=ref}
                        position="bottom"
                        coverScreen={true}
                        backButtonClose={true} 
                        style={{flex:0.3,borderTopLeftRadius:30,borderTopRightRadius:30,overflow:"hidden",backdropColor:theme_light_color}}                   
                    >
                        <View style={{backgroundColor:theme_light_color}}>
                            <Text style={{padding:10,marginBottom:10,backgroundColor:theme_color,color:"white",fontSize:20,textAlign:"center"}}>Choose Image Option</Text>
                            <Text onPress={()=>this.imagePicker('camera')} style={{padding:10,paddingVertical:15,borderBottomWidth:0.5,fontSize:18}}>Camera</Text>
                            <Text onPress={()=>this.imagePicker('gallery')} style={{padding:10,paddingVertical:15,borderBottomWidth:0.5,fontSize:18}}>Gallery</Text>
                        </View>
                    </Modal>
                </KeyboardAvoidingView>
            </View>
        );
    }
}

