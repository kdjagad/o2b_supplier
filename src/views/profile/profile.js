import React from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Text, View,FlatList, ScrollView, TouchableNativeFeedback } from "react-native";
// import styles from "../../global/style";
import { api_key, api_url, site_url, theme_color } from "../../global/variables";
// import { theme_color } from '../../global/colors';
import { Appbar, TextInput,Button } from "react-native-paper";
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { FontAwesome5,Entypo,FontAwesome } from '@expo/vector-icons';
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome";
import SearchableDropdown from "../../components/searchable_dropdown";
import * as Animatable from 'react-native-animatable';
import { _getCountries,_getStates,_getCities, _getUser, _storeUser, _setUser } from "../../global/auth";
import { Block } from "expo-ui-kit";
import ImageBrowserScreen from "../../components/ImageBrowseScreen";
import Snack from "../../components/snack";
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import mime from 'mime';
import { styles } from "../../global/style";
// import { _getUser, _logout, _storeUser } from '../auth';


export default class Profile extends React.Component{
    actions=()=>{
        return(
        <Block flex={0} row center>
            <Appbar.Action icon="logout" onPress={()=>{}} />
            {
                this.state.edit_state ?
                <Appbar.Action icon="check" onPress={()=>this.setState({edit_state:false},()=>{
                    this.props.navigation.setParams({actions:this.actions(),title:'My Profile'})
                    this.update_profile();
                    })} />:
                <Appbar.Action icon="pencil" onPress={()=>this.setState({edit_state:true},()=>this.props.navigation.setParams({actions:this.actions(),title:'My Profile'}))} />
            }
        </Block>
    )};

    constructor(props){
        super(props);
        this.state={
            countries:[],
            selectedCountry:null,
            states:[],
            selectedState:null,
            cities:[],
            selectedCity:null,
            profile_image:null,
            company_image:null,
            edit_state:false,
            user:[],
            me:[],
            loading:false,
        }
    }

    

    componentDidMount(){
        this.load_user();
        this.focus=this.props.navigation.addListener('focus',()=>{
            this.load_user();
        })
    }

    load_user=()=>{
        
        this.props.navigation.setParams({actions:this.actions(),title:'My Profile'})
        _getUser().then(user=>{
                console.log("load user",user);
                
                this.setState({user,me:user,profile_image:null,edit_state:false},()=>this.getCountries());
            })
    }

    componentWillUnmount(){
        return this.focus;
    }

    imagePicker=async ()=>{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [1,1],
            quality: 1,
        });
    
        // console.log(result);
    
        if (!result.cancelled) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.localUri || result.uri,
                [{resize:{width:200,height:200}}],
                { compress: 0.8 }
            );
            console.log("manip result",manipResult);
            this.setState({profile_image:manipResult});
        }
    }
    logoPicker=async ()=>{
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            quality: 1,
        });
    
        // console.log(result);
    
        if (!result.cancelled) {
            const manipResult = await ImageManipulator.manipulateAsync(
                result.localUri || result.uri,
                [],
                { compress: 0.8 }
            );
            console.log("manip result",manipResult);
            this.setState({company_image:manipResult});
        }
    }

    update_profile=()=>{
        let{user,profile_image,company_image}=this.state;
        const includeKeys=[
            "address",
            "city",
            "company_description",
            "company_name",
            "company_profile",
            "country",
            "currency",
            "email",
            "gst_no",
            "name",
            "pan_no",
            "phone_no",
            "profile",
            "state",
        ];
        this.setState({loading:true});
        let fd=new FormData();
        fd.append("action","profile_update");
        if(profile_image!=null){
            let imageUri=profile_image.uri;
            const newImageUri =  "file:///" + imageUri.split("file:/").join("");
            console.log("filename",newImageUri);
            fd.append("profile_image",{
                uri : newImageUri,
                type: mime.getType(newImageUri),
                name: newImageUri.split("/").pop()
               });
        }
        if(company_image!=null){
            let imageUri=company_image.uri;
            const newImageUri =  "file:///" + imageUri.split("file:/").join("");
            console.log("company filename",newImageUri);
            fd.append("company_image",{
                uri : newImageUri,
                type: mime.getType(newImageUri),
                name: newImageUri.split("/").pop()
               });
        }
        for ( var key in user ) {
            if(includeKeys.includes(key)){
                fd.append(key, user[key]);
            }
        }
        console.log("form data",fd,user.c_id);
        fetch(`${api_url}supplier_update_profile/${user.c_id}`,{
            method:'POST',
            body:fd,
            headers:{
                Authorization:api_key
            }
        })
        .then((response) => response.json())
        .then((json) => {
            this.setState({edit_state:false,loading:false});
            if(json.status==1){
                user={
                    ...user,
                    ...json.user,
                }
                _setUser(user);     
                   
            }
            this.snack.show(
                json.message,
                json.status==1?'success':'danger'
            )
        })
        .catch((error) => {
            this.setState({loading:false});
            console.error("Login Error",error);
        });
    }


    getCountries=()=>{
        const{user}=this.state;
        _getCountries().then(countries=>{
            this.setState({countries});
            const selectedCountry=countries.filter(dt=>dt.id==user.country);
            if(selectedCountry.length>0){
                this.setState({selectedCountry:selectedCountry[0]},()=>this.getStates(selectedCountry[0].id));
            }
        })
    }
    getStates=(country_id)=>{
        const{user}=this.state;
        _getStates(country_id).then(states=>{
            this.setState({states});
            const selectedState=states.filter(dt=>dt.id==user.state);
            if(selectedState.length>0){
                this.setState({selectedState:selectedState[0]},()=>this.getCities(selectedState[0].id));
            }
        })
    }
    getCities=(state_id)=>{
        const{user}=this.state;
        _getCities(state_id).then(cities=>{
            this.setState({cities});
            const selectedCity=cities.filter(dt=>dt.id==user.city);
            if(selectedCity.length>0){
                this.setState({selectedCity:selectedCity[0]});
            }
        })
    }   

    render(){
        const{step,selectedCountry,selectedState,selectedCity,otp,otp_input}=this.state;

        let{user,profile_image,company_image,me,loading}=this.state;
        
        let profile='';
        if(user.profile){
            profile={uri:`${site_url}${user.profile}`};
            if(profile_image!=null){
                profile={uri:profile_image.uri};
            }
        }else{
            profile=null;
            if(profile_image!=null){
                profile={uri:profile_image.uri};
            }
        }
        return(        
            <Block>
                <Block flex={0} marginVertical>
                    <View style={{width:120,height:120}} alignSelf="center" color="red">
                        <TouchableNativeFeedback onPress={this.state.edit_state?this.imagePicker:null} >
                            <View style={{width:120,height:120,alignItems:"center",justifyContent:"center",backgroundColor:"#eee",borderRadius:150,alignSelf:"center",overflow:"hidden"}}>
                                <Image source={profile} style={{width:'100%',flex:1,resizeMode:"cover"}} />                                 
                            </View>
                        </TouchableNativeFeedback>
                    </View>
                </Block>
                
                <Block margin={20} borderRadius={10} shadow white>
                
                    <ScrollView contentContainerStyle={[{flexGrow:1}]} keyboardShouldPersistTaps="always">
                        <Animatable.View delay={10} duration={400} animation="fadeInUp">
                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Company Name</Text>
                                <TextInput
                                        underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                        value={user.company_name}
                                        //style={[styles.textInputFlex,{textAlign:"right",marginLeft:10}]}
                                        editable={this.state.edit_state}
                                        onChangeText={val=>{
                                            user={
                                                ...user,
                                                company_name:val
                                            }
                                            this.setState({user});
                                        }}
                                />
                            </View>
    
                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Company Description</Text>
                                <TextInput
                                        underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                        value={user.company_description}
                                        multiline={true}
                                        numberOfLines={1}
                                        
                                        editable={this.state.edit_state}
                                        onChangeText={val=>{
                                            user={
                                                ...user,
                                                company_description:val
                                            }
                                            this.setState({user});
                                        }}
                                />
                            </View>
    
                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Company Logo</Text>
                                <TouchableNativeFeedback onPress={this.state.edit_state?this.logoPicker:null}>
                                    {
                                        user.company_profile || company_image!=null ?
                                        <Image source={{uri:company_image!=null?company_image.uri:`${site_url}${user.company_profile}`}} style={{width:120,height:100,resizeMode:"contain"}} />
                                        :
                                        <View style={{alignItems:"center",padding:10,backgroundColor:"#eee",borderRadius:10,marginVertical:5,justifyContent:"center",alignSelf:"flex-end"}}>
                                            <FontAwesomeIcon name="image" size={30} color="#555" />
                                            <Text>Upload</Text>
                                        </View>
                                    }
                                </TouchableNativeFeedback>
                            </View>
                                            
                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Name</Text>
                                <TextInput
                                    underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                    value={user.name}
                                    //style={[styles.textInputFlex,{textAlign:"right",marginLeft:10}]}
                                    editable={this.state.edit_state}
                                    onChangeText={val=>{
                                        user={
                                            ...user,
                                            name:val
                                        }
                                        this.setState({user});
                                    }}
                                />
                            </View>
    
                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Email</Text>
                                <TextInput
                                    underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                    value={user.email}
                                    //style={[styles.textInputFlex,{textAlign:"right",marginLeft:10}]}
                                    editable={this.state.edit_state}
                                    onChangeText={val=>{
                                        user={
                                            ...user,
                                            email:val
                                        }
                                        this.setState({user});
                                    }}
                                />
                            </View>
                            {
                                user.email_verified!=undefined && user.email_verified=='0' && user.email!='' &&
                                <Button color="green" style={{alignSelf:'flex-end'}}  onPress={()=>this.props.navigation.navigate('EmailVerification')}>Verify Email</Button>
                            }
    
                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Phone</Text>
                                <TextInput
                                    underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                    value={user.phone_no}
                                    //style={[styles.textInputFlex,{textAlign:"right",marginLeft:10}]}
                                    editable={this.state.edit_state}
                                    onChangeText={val=>{
                                        user={
                                            ...user,
                                            phone_no:val
                                        }
                                        this.setState({user});
                                    }}
                                />
                            </View>
    
                            <View style={styles.profileRow}>
                                <Text style={[styles.textLabel,{alignSelf:"flex-start"}]}>Address</Text>
                                <TextInput
                                    underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                    value={user.address}
                                    multiline={true}
                                    numberOfLines={1}
                                    //style={[styles.textInputFlex,{textAlign:"right",textAlignVertical:"top",marginLeft:100}]}
                                    editable={this.state.edit_state}
                                    onChangeText={val=>{
                                        user={
                                            ...user,
                                            address:val
                                        }
                                        this.setState({user});
                                    }}
                                />
                            </View>
    
                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Location</Text>
                                <View style={{flex:1}}>
                                    <SearchableDropdown disabled={!this.state.edit_state} placeholder="Country"  data={this.state.countries} {...this.props} onSelect={item=>this.setState({selectedCountry:item,user:{...user,country:item.id}},()=>this.getStates(item.id))} defaultValue={selectedCountry!=null?selectedCountry.name:''}  />
                                    <SearchableDropdown disabled={!this.state.edit_state} placeholder="State" data={this.state.states} {...this.props} onSelect={item=>this.setState({selectedState:item,user:{...user,state:item.id}},()=>this.getCities(item.id))} defaultValue={selectedState!=null?selectedState.name:''} />
                                    <SearchableDropdown disabled={!this.state.edit_state} placeholder="City" data={this.state.cities} {...this.props} onSelect={item=>this.setState({selectedCity:item,user:{...user,city:item.id}})} defaultValue={selectedCity!=null?selectedCity.name:''} />
                                </View>
                            </View>

                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>GST Number</Text>
                                <TextInput
                                    underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                    value={user.gst_no}
                                    //style={[styles.textInputFlex,{textAlign:"right",marginLeft:10}]}
                                    editable={this.state.edit_state}
                                    onChangeText={val=>{
                                        user={
                                            ...user,
                                            gst_no:val
                                        }
                                        this.setState({user});
                                    }}
                                />
                            </View>
    
                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Pan No.</Text>
                                <TextInput
                                    underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                    value={user.pan_no}
                                    //style={[styles.textInputFlex,{textAlign:"right",marginLeft:10}]}
                                    editable={this.state.edit_state}
                                    onChangeText={val=>{
                                        user={
                                            ...user,
                                            pan_no:val
                                        }
                                        this.setState({user});
                                    }}
                                />
                            </View>

                            <View style={styles.profileRow}>
                                <Text style={styles.textLabel}>Currency</Text>
                                <TextInput
                                    underlineColor="#ccc"
                                        style={[styles.textInput,{flex:1}]}
                                        dense={true} 
                                        placeholder="-"
                                    value={user.currency}
                                    //style={[styles.textInputFlex,{textAlign:"right",marginLeft:10}]}
                                    editable={this.state.edit_state}
                                    onChangeText={val=>{
                                        user={
                                            ...user,
                                            currency:val
                                        }
                                        this.setState({user});
                                    }}
                                />
                            </View>
                        </Animatable.View>
                    </ScrollView>
                </Block>
                <Snack ref={ref=>this.snack=ref} />
            </Block>
        );
    }
}


                    