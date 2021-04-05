import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { api_key, api_url, theme_color,site_url, theme_light_color } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import * as Icon from '@expo/vector-icons';
import { getAllUnits, _getUser } from "../../global/auth";
import SearchableDropdown from "../../components/searchable_dropdown";
import { styles } from "../../global/style";
import { Button, IconButton, Switch, TextInput, Title } from "react-native-paper";
import { Image, KeyboardAvoidingView, ScrollView, View, FlatList } from "react-native";
import { ImageBrowser } from 'expo-image-picker-multiple';
import * as Permissions from 'expo-permissions';

import * as Animatable from 'react-native-animatable';
import ImageBrowserScreen from "../../components/ImageBrowseScreen";
import Snack from "../../components/snack";
import MultiSelect from "react-native-multiple-select";
import { MultiSelection } from "../../components/multi_selection";
import * as ImagePicker from 'expo-image-picker';
import * as Notifications from 'expo-notifications';
import { TouchableNativeFeedback } from "react-native";
import mime from 'mime';
const defaultAttribute={
    a_id:null,
    a_name:'',
    a_value:'',
    is_multiple:0,
};
export default class AddCategory extends React.Component{

    constructor(props){
        super(props);
        this.state={
            user:[],
            cat_name:'',
            cat_description:'',
            cat_image:null,
            attributes:[],
            loading:false,
        }
    }

    async componentDidMount(){
        Notifications.addNotificationReceivedListener(this.init);
        const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA,Permissions.MEDIA_LIBRARY);
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
        
        this._unsubscribe();
    }

    init=()=>{
        this.props.navigation.setParams({title:'Add Category'});
        const{item}=this.props.route.params && this.props.route.params.item?this.props.route.params:'';
        console.log("edit category",item);
        if(item){
            
            this.setState({
                cat_name:item.cat_name,
                cat_description:item.description,
                attributes:item.attributes
            });
        }
        _getUser().then(user=>this.setState({user},()=>{
            if(!item)
                this.get_default_attributes();
        }));
    }

    get_default_attributes=()=>{
        this.setState({loading:true});
        fetch(`${api_url}default_attributes`,{
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            // console.log("cateogries",json);
            json.push(defaultAttribute);
            this.setState({attributes:json,loading:false});
        })
        .catch(err=>{
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    validate=()=>{
        const{cat_name,cat_image,cat_description}=this.state;
        if(!cat_name) this.snack.show('Category Title Required','danger');
        else this.save();
    }



    reset=()=>{
        this.setState({
            cat_name:'',
            cat_description:'',
            cat_image:'',
            attributes:[],
        })
    }

    save=()=>{
        const{item}=this.props.route.params && this.props.route.params.item?this.props.route.params:'';
        const{cat_name,cat_description,cat_image,attributes,user}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('cat_name',cat_name);
            fd.append('description',cat_description);
            if(cat_image!=null){
                let imageUri=cat_image.uri;
                const newImageUri =  "file:///" + imageUri.split("file:/").join("");
                console.log("filename",newImageUri);
                fd.append("catfile",{
                    uri : newImageUri,
                    type: mime.getType(newImageUri),
                    name: newImageUri.split("/").pop()
                   });
            }
            attributes.forEach((item, i) => {
                if(item.a_name){
                    fd.append('attribute[]',item.a_name);
                    fd.append('is_multiple[]',item.is_multiple);
                }
                // fd.append(item.ca_name.trim(),item.value);
            });
            if(item) fd.append('cat_id',item.cat_id);
            console.log('fd',fd,user.c_id);
            var action=item?'category_update':'category';
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
                    this.props.navigation.pop();
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

    imagePicker=async ()=>{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            // allowsEditing: true,
            // aspect: [1,1],
            // quality: 1,
        });
    
        // console.log(result);
    
        if (!result.cancelled) {
            // const manipResult = await ImageManipulator.manipulateAsync(
            //     result.localUri || result.uri,
            //     [{resize:{width:200,height:200}}],
            //     { compress: 0.8 }
            // );
            console.log("manip result",result);
            this.setState({cat_image:result});
        }
    }

    render(){
        const cat_item=this.props.route.params && this.props.route.params.item?this.props.route.params.item:'';
        let{attributes,user}=this.state;
        if(user.active_plan_id==0){
            return(
                <Block center justifyContent="center" padding={30}>
                    <Icon.MaterialCommunityIcons name="information-outline" size={100} color="#ccc" />
                    <Title style={{textAlign:'center'}}>This Feature Is Only Available For Premium Members If you want to use this feature upgrade to Premium.</Title>
                    <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white',fontSize:18}} style={{height:50,justifyContent:'center',marginVertical:20}}  onPress={()=>this.props.navigation.navigate('Plans')}>Upgrade To Pro</Button>
                </Block>
            )
        }
        return(
        <View style={[styles.container]}>            
            <KeyboardAvoidingView behavior={Platform.OS=="ios"?"padding":"none"} style={{flex:1}} >
                <View style={{flex:1}}>
                    <Block flex={0} row center  padding={5} color={theme_light_color} >
                        {
                            cat_item==null ?
                            (
                                <Block marginRight marginLeft color="rgba(0,0,0,0.5)" borderRadius={5} height={100}>
                                    <TouchableNativeFeedback onPress={()=>this.imagePicker()}>
                                        <Block center justifyContent="center">
                                            <Icon.MaterialCommunityIcons name="image-album" size={20} color="white" />
                                            <Text style={{textAlign:'center',fontSize:12,marginTop:7,color:'white'}}>Add Images</Text>
                                        </Block>
                                    </TouchableNativeFeedback>
                                </Block>
                            ):
                            (
                                <Block marginRight marginLeft color="rgba(0,0,0,0.5)" borderRadius={5} height={100}>
                                    <TouchableNativeFeedback onPress={()=>this.imagePicker()}>
                                        <Image source={{uri:this.state.cat_image==null?`${site_url}${cat_item.cat_image}`:this.state.cat_image.uri}} style={{width:'100%',height:'100%',resizeMode:'contain'}} />
                                    </TouchableNativeFeedback>
                                </Block>
                            )
                        }
                    </Block>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1,padding:20}} alwaysBounceVertical={true} bouncesZoom={true} bounces={true}>
                        <Animatable.View animation="fadeInUp" duration={300}>
                            <Text style={styles.inputLabel}>Category Title</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.cat_name}
                                onChangeText={text => this.setState({cat_name:text})}
                                placeholder="Title"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}                            
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={400}>
                            <Text style={styles.inputLabel}>Category Description</Text>
                            <TextInput placeholderTextColor="#ccc"
                                value={this.state.cat_description}
                                onChangeText={text => this.setState({cat_description:text})}
                                placeholder="Description"
                                underlineColor="#ccc"
                                style={styles.textInput}
                                dense={true}
                                multiline
                                numberOfLines={3}                            
                            /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={500}>
                            <Block row center justifyContent="space-between">
                                <Text style={[styles.inputLabel,{color:theme_color}]}>Attribute Name</Text>
                                {/* <IconButton icon="plus" color={theme_color} onPress={()=>{
                                    attributes.push({
                                        a_id:'',
                                        a_name:'',
                                        a_value:'',
                                        is_multiple:0,
                                    });
                                    this.setState({attributes});
                                }} /> */}
                                <Block flex={0} marginRight={30}>
                                    <Text style={[styles.inputLabel,{textAlign:'center',color:theme_color}]}>Is Multiple</Text>
                                    <Text style={[styles.inputLabel,{marginTop:0,textAlign:'center',color:theme_color}]}>(Eg. Color,Size)</Text>
                                </Block>
                            </Block>
                            <FlatList keyboardShouldPersistTaps="always"
                                data={attributes}
                                keyExtractor={(item,index)=>index.toString()}
                                renderItem={({item,index})=>{
                                    return(
                                        <Block row center>
                                            <Block>                                              
                                                <TextInput 
                                                    placeholderTextColor="#ccc"
                                                    value={item.a_name}
                                                    disabled={item.a_id>0 && !cat_item}
                                                    placeholder={`Enter ${item.a_name}`}
                                                    underlineColor="#ccc"
                                                    style={styles.textInput}
                                                    dense={true}
                                                    onChangeText={text => {
                                                        let ind=attributes.indexOf(item);
                                                        if(!attributes[ind+1] && text.length>0){
                                                            attributes.push(defaultAttribute);
                                                        }
                                                        item={
                                                            ...item,
                                                            a_name:text,
                                                        }
                                                        attributes[ind]=item;
                                                        this.setState({attributes});
                                                    }} 
                                                    // autoFocus={true}                           
                                                />
                                            </Block>
                                            <Block flex={0}>
                                                <Switch
                                                    color={theme_color}
                                                    value={item.is_multiple=="1"?true:false}
                                                    onValueChange={state => {
                                                        let ind=attributes.indexOf(item);
                                                        item={
                                                            ...item,
                                                            is_multiple:state?1:0,
                                                        }
                                                        attributes[ind]=item;
                                                        this.setState({attributes}); 
                                                    }}
                                                />
                                            </Block>
                                            <Block flex={0} row center>
                                            {
                                                attributes.length>1 && (index+1)<attributes.length &&
                                                <IconButton icon="close" color="red" onPress={() => {
                                                        let ind=attributes.indexOf(item);
                                                        attributes.splice(ind,1);
                                                        this.setState({attributes});
                                                }} />
                                            }
                                            </Block>                                            
                                        </Block>
                                    )
                                }}
                            />
                        </Animatable.View>
                        <Block marginVertical>
                        </Block>
                    </ScrollView>
                            <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:0}} style={{height:50,justifyContent:'center'}} loading={this.state.loading} onPress={()=>this.validate()} >Submit</Button>
                </View>
            </KeyboardAvoidingView>
            <Snack ref={ref=>this.snack=ref} />
        </View>
        );
    }
}