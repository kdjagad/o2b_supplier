import { Block, Text } from "expo-ui-kit";
import * as React from 'react';
import { api_key, api_url, theme_color,site_url, theme_light_color,sort_by_key } from "../../global/variables";
import { LinearGradient } from 'expo-linear-gradient';
import * as Icon from '@expo/vector-icons';
import { getAllUnits, _getUser } from "../../global/auth";
import SearchableDropdown from "../../components/searchable_dropdown";
import { styles } from "../../global/style";
import { Button, IconButton, TextInput } from "react-native-paper";
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
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import Loader from "../../components/loader";
import mime from 'mime';
export default class AddProduct extends React.Component{
    actions=(loading)=>{
        return(<Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} loading={loading} style={{marginHorizontal:5}} onPress={()=>this.validate()}>Save</Button>
    )};
    constructor(props){
        super(props);
        this.state={
            user:{},
            categories:[],
            selectedCategory:null,
            units:[],
            selectedUnit:null,
            product_code:'',
            product_title:'',
            product_description:'',
            product_images:[null,null,null,null,null,null],
            product_price:'',
            attributes:[],
            p_images:[],
            loading:false,
            cat_disable:false,
        }
    }

    componentDidMount(){
        
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }

    async checkPermissions(){
        Notifications.addNotificationReceivedListener(this.init);
        const { status, permissions } = await Permissions.askAsync(Permissions.CAMERA,Permissions.MEDIA_LIBRARY);
        if (status === 'granted') {
            // return Location.getCurrentPositionAsync({ enableHighAccuracy: true });
        } else {
            // await Permissions.askAsync(Permissions.CAMERA,Permissions.MEDIA_LIBRARY,Permissions.MEDIA_LIBRARY_WRITE_ONLY);
            throw new Error('Location permission not granted');
        }
    }

    componentWillUnmount(){
        this._unsubscribe();
    }

    init=()=>{
        this.props.navigation.setParams({actions:this.actions(this.state.loading)});
        console.log("edit product");
        this.checkPermissions();
        const{item}=this.props.route.params?this.props.route.params:this.props;
        if(item){
            console.log("item edit",item)
            let p_images=[];
            let product_images=[null,null,null,null,null,null];
            item.images.map(img=>{
                p_images.push({
                    uri:img
                })
                
            });
            product_images.splice(0,p_images.length);
            console.log("pimages",p_images.length);
            this.setState({
                // selectedCategory:selCat.length>0?selCat[0]:null,
                selectedUnit:null,
                product_code:item.pcode,
                product_title:item.p_title,
                product_description:item.p_description,
                p_images,
                product_images,
                product_price:item.p_price,
                cat_disable:true,
            });
        }
        _getUser().then(user=>this.setState({user},()=>{
            this.get_categories()
            this.get_units();
        }));
    }

    get_categories=()=>{
        this.setState({cat_disable:true});
        let{item}=this.props.route.params ?this.props.route.params:'';
        
        let{user}=this.state;
        fetch(`${api_url}categories/${user.c_id}`,{
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            this.setState({cat_disable:false});
            if(item){
                var selCat=json.filter(ct=>ct.cat_id==item.cat_id);
                console.log("selcat",selCat);
                this.setState({selectedCategory:selCat[0]},()=>this.get_attributes(item.cat_id));
            }
            this.setState({categories:json,selectedCategory:json[0]},()=>this.get_attributes(json[0].cat_id));
            
        })
        .catch(err=>{
            this.setState({cat_disable:false});
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    get_units=()=>{
        // this.setState({cat_disable:true});
        const{item}=this.props.route.params && this.props.route.params.item?this.props.route.params:'';
        const{user}=this.state;
        getAllUnits(user.c_id)
        .then(json=>{
            // console.log("cateogries",json);
            // this.setState({cat_disable:false});
            json=sort_by_key(json,'unit_name')
            if(item){
                var selUnit=json.filter(ct=>ct.u_id==item.u_id);
                console.log("selUnit",selUnit);
                this.setState({selectedUnit:selUnit[0]});
            }
            this.setState({units:json});
        })
        .catch(err=>{
            // this.setState({cat_disable:false});
            console.log("json err",err);
            this.setState({loading:false});
        })
    }

    get_attributes=(cat_id)=>{
        console.log("cat_id",cat_id);
        const{item}=this.props.route.params ?this.props.route.params:'';
        fetch(`${api_url}attributes/${cat_id}`,{
            headers:{
                Authorization:api_key
            }
        })
        .then(response=>response.json())
        .then(json=>{
            console.log("atts",json);

            this.setState({attributes:json});
            if(item){
                let attributes=[];
                json.map(attr=>{
                    let attrs=item.attributes.filter(at=>at.a_name==attr.ca_name);
                    if(attrs.length>0){
                        attr={
                            ...attr,
                            value:attrs[0].a_value,
                            id:attrs[0].a_id,
                        };
                    }
                    attributes.push(attr);
                })
                this.setState({attributes});
            }
        })
        .catch(err=>{
            console.log("json cat err",err);
            this.setState({loading:false});
        })
    }

    _renderOrder({item}){
        console.log("order",item);
        return(
            <Block padding paddingHorizontal={10} borderBottomWidth={1} borderColor="#ccc" row center>
                <Avatar.Icon style={{backgroundColor:'#fff'}} icon={()=><Icon.Feather name='list' size={20} color={theme_color} />} size={40} />
                <Block marginLeft>
                    <Text bold size={18}>Title</Text>
                    <Text size={14}>Sub Title</Text>
                </Block>
            </Block>
        )
    }

    validate=()=>{
        const{product_code,product_title,product_description,product_images,selectedCategory}=this.state;
        if(!product_title) this.snack.show('Product Title Required','danger');
        else if(!product_description) this.snack.show('Product Description Required','danger');
        // else if(product_images.length<=0) this.snack.show('Product Image Required','danger');
        else if(selectedCategory==null) this.snack.show('Product Category Required','danger');
        else this.save();
    }

    reset=()=>{
        this.setState({
            selectedCategory:null,
            selectedUnit:null,
            product_code:'',
            product_title:'',
            product_description:'',
            product_images:null,
            product_price:0,
            attributes:[],
        })
    }

    save=()=>{
        const{item}=this.props.route.params?this.props.route.params:'';
        let{product_code,product_title,product_description,product_images,p_images,selectedCategory,product_price,selectedUnit,attributes,user}=this.state;
        try {
            this.setState({loading:true});
            let fd=new FormData();
            fd.append('ptitle',product_title);
            fd.append('pcode',product_code);
            fd.append('pdes',product_description);
            fd.append('price',product_price);
            fd.append('cat_id',selectedCategory!=null?selectedCategory.cat_id:0);
            fd.append('unit',selectedUnit!=null?selectedUnit.u_id:0);
            fd.append('cust_id',user.c_id);
            // product_images=product_images.filter(dt=>dt!=null);
            product_images && product_images.length>0 && product_images.forEach((item, i) => {
                if(item!=null){
                    let imageUri=item.uri;
                    const newImageUri =  "file:///" + imageUri.split("file:/").join("");
                    console.log("filename",newImageUri);
                    fd.append("userfile[]",{
                        uri : newImageUri,
                        type: mime.getType(newImageUri),
                        name: newImageUri.split("/").pop()
                       });
                }
                // if(item!=null)
                // fd.append("userfile[]", {
                //   uri: item.uri,
                //   type: "image/jpeg",
                //   name: item.filename || `${Math.floor(Math.random() * 10000) + 1}-${i}.jpg`,
                // });
            });
            attributes.forEach((item, i) => {
                fd.append('att_name[]',item.ca_name);
                fd.append(item.ca_name.trim(),item.value);
            });
            let files_path='';
            let already_files=[];
            p_images.forEach((item,i)=>{
                already_files.push(item.uri.replace(site_url,''));
            })
            fd.append('files_path',already_files.join('||'));
            console.log('fd',fd);
            fetch(`${api_url}${item?'product_update/'+item.p_id:'product/'+user.c_id}`,{
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
                if(json.status==1){
                    this.snack.show(json.message,'success');
                    setTimeout(() => {
                        this.props.navigation.navigate('ProductList');
                    }, 200);
                }else{
                    this.snack.show(json.message,'danger');
                }
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

    imagePicker=async (index)=>{
        let{product_images}=this.state;
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
            // console.log("manip result",manipResult);
            product_images[index]=result;
            this.setState({product_images});
        }
    }

    render(){
        let{selectedCategory,selectedUnit,attributes,product_images,p_images}=this.state;
        return(
        <View style={[styles.container]}>            
            <KeyboardAvoidingView behavior={Platform.OS == 'ios' ? 'padding' : 'none'} style={{flex:1}} >
                <Block flex={0} row center  padding={5} color={theme_light_color} >
                    {/* {
                        product_images.map((dt,index)=>(
                            <Block marginRight marginLeft color="rgba(0,0,0,0.5)" borderRadius={5}  flex={0} width={60} height={60}>
                                <TouchableNativeFeedback onPress={()=>this.select_images.open()}>
                                    {
                                        dt==null ?
                                        (
                                            <Block center justifyContent="center">
                                                <Icon.MaterialCommunityIcons name="image-album" size={20} color="white" />
                                                <Text style={{textAlign:'center',fontSize:12,marginTop:7,color:'white'}}>Add Images</Text>
                                            </Block>
                                        ):
                                        (
                                            <Block center justifyContent="center">
                                                <Image source={{uri:dt.uri}} style={{flex:1,resizeMode:'cover'}} />
                                            </Block>
                                        )
                                    }
                                </TouchableNativeFeedback>
                            </Block>
                        ))
                    } */}
                    
                    <FlatList keyboardShouldPersistTaps="always"
                        data={[...p_images,...product_images]}
                        keyExtractor={(item,index)=>index.toString()}
                        horizontal={true}
                        style={{marginHorizontal:10}}
                        renderItem={({item,index})=>{
                            // console.log("images",item);
                            let indd=product_images.indexOf(item);
                            return(
                                <TouchableNativeFeedback onPress={()=>this.imagePicker(indd)}>
                                {
                                    item!=null ?
                                    (
                                        <Block marginRight width={60} height={60}>
                                            <Image source={{uri:item.uri}} style={{flex:1,resizeMode:'cover',borderRadius:10}} />
                                            <IconButton icon="close" color="white" size={10} onPress={()=>{
                                                // let{product_images,}=this.state;
                                                let ind=p_images.indexOf(item);
                                                let ind1=product_images.indexOf(item);
                                                if(ind>=0){
                                                    p_images.splice(ind,1);
                                                    product_images.push(null);
                                                }else{
                                                    product_images[ind1]=null;
                                                }
                                                this.setState({product_images,p_images});
                                            }} style={{position:'absolute',backgroundColor:'red',right:0}} />
                                        </Block>
                                    ):
                                    (
                                        <Block marginRight width={60} height={60} color="#ccc" borderRadius={10}>
                                            <Block center justifyContent="center">
                                                <Icon.MaterialCommunityIcons name="image-album" size={20} color="white" />
                                                <Text style={{textAlign:'center',fontSize:12,marginTop:7,color:'white'}}>Add Images</Text>
                                            </Block>
                                        </Block>
                                    )
                                }
                                </TouchableNativeFeedback>
                            )
                        }}
                    />
                </Block>
                <View style={{flex:1}}>
                    <ScrollView keyboardShouldPersistTaps="always" contentContainerStyle={{flexGrow:1,padding:20}}  >
                        <Animatable.View style={{flexDirection:'row',alignItems:'center'}} animation="fadeInUp" duration={250}>
                            <Text style={[styles.inputLabel,{flex:0}]}>Category</Text>
                            <View style={{flex:1,marginLeft:10}}>
                                <SearchableDropdown disabled={this.state.cat_disable} placeholder="Select Category" data={this.state.categories} labelKey="cat_name" searchKey="cat_name" onSelect={item=>this.setState({selectedCategory:item},()=>this.get_attributes(item.cat_id))} defaultValue={selectedCategory!=null?selectedCategory.cat_name:''} />                          
                            </View>
                        </Animatable.View>
                        <Animatable.View style={{flexDirection:'row',alignItems:'center'}} animation="fadeInUp" duration={300}>
                            <Text style={[styles.inputLabel,{flex:0}]}>Product Code</Text>
                            <View style={{flex:1,marginLeft:10}}>
                                <TextInput placeholderTextColor="#ccc"
                                    value={this.state.product_code}
                                    onChangeText={text => this.setState({product_code:text})}
                                    placeholder="EX. a5d4f58fd28 (Optional)"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    dense={true}                            
                                /> 
                            </View>
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={300}>
                        <Text style={styles.inputLabel}>Product Title</Text>
                        <TextInput placeholderTextColor="#ccc"
                            value={this.state.product_title}
                            onChangeText={text => this.setState({product_title:text})}
                            placeholder="Title"
                            underlineColor="#ccc"
                            style={styles.textInput}
                            dense={true}                            
                        /> 
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={400}>
                        <Text style={styles.inputLabel}>Product Description</Text>
                        <TextInput placeholderTextColor="#ccc"
                            value={this.state.product_description}
                            onChangeText={text => this.setState({product_description:text})}
                            placeholder="Description"
                            underlineColor="#ccc"
                            style={styles.textInput}
                            dense={true}
                            multiline
                            numberOfLines={3}                            
                        /> 
                        </Animatable.View>
                            
                        <Animatable.View animation="fadeInUp" duration={400}>
                        <Text style={styles.inputLabel}>Product Price Per Unit</Text>
                        <Block row center>
                            <Block flex={0} minWidth={100}>
                                <TextInput placeholderTextColor="#ccc"
                                    value={this.state.product_price.toString()}
                                    onChangeText={text => this.setState({product_price:text})}
                                    placeholder="Eg. 1000.00 (Optional)"
                                    underlineColor="#ccc"
                                    style={styles.textInput}
                                    dense={true}
                                    keyboardType="decimal-pad"                           
                                /> 
                            </Block>
                            <Block padding flex={0}>
                                <Text style={{fontSize:30}}>Per</Text>
                            </Block>
                            <Block>
                                <SearchableDropdown placeholder="Unit" data={this.state.units} labelKey="unit_name" searchKey="unit_name" onSelect={item=>this.setState({selectedUnit:item})} defaultValue={selectedUnit!=null?selectedUnit.unit_name:''} />
                            </Block>
                        </Block>
                        </Animatable.View>
                        <Animatable.View animation="fadeInUp" duration={500}>
                            {/* <Text style={styles.inputLabel}>Product Attributes</Text> */}
                            <FlatList keyboardShouldPersistTaps="always"
                                data={attributes}
                                keyExtractor={(item,index)=>item.ca_id.toString()}
                                renderItem={({item})=>{
                                    let vals=[];
                                    let cat_values=item.cat_value?item.cat_value.split(','):[];
                                    cat_values.forEach((item,i)=>{
                                        vals.push({name:item});
                                    });
                                    // console.log("vals",vals);
                                    return(
                                        <Block>
                                            <Text style={styles.inputLabel}>{item.ca_name}</Text>
                                            {
                                                item.is_multiple=="1" ?
                                                <MultiSelection
                                                    placeholder={`You can enter multiple ${item.ca_name}`}
                                                    data={vals}
                                                    labelKey="name"
                                                    searchKey="name"
                                                    selectedValues={item.value}
                                                    defaultValue={item.ca_name}
                                                    onChange={selectedValues=>{
                                                        console.log("sel val",selectedValues);
                                                        let ind=attributes.indexOf(item);
                                                        item={
                                                            ...item,
                                                            value:selectedValues,
                                                        }
                                                        attributes[ind]=item;
                                                        this.setState({attributes});
                                                    }}
                                                />
                                                :
                                                <TextInput placeholderTextColor="#ccc"
                                                    value={item.value}
                                                    onChangeText={text => {
                                                        let ind=attributes.indexOf(item);
                                                        item={
                                                            ...item,
                                                            value:text,
                                                        }
                                                        attributes[ind]=item;
                                                        this.setState({attributes});
                                                    }}
                                                    placeholder={`Enter ${item.ca_name}`}
                                                    underlineColor="#ccc"
                                                    style={styles.textInput}
                                                    dense={true}                            
                                                />
                                            }
                                        </Block>
                                    )
                                }}
                            />
                        </Animatable.View>
                        <Block marginVertical>
                        </Block>
                    </ScrollView>
                </View>
                {/* <Block flex={0}>
                    <Button mode="contained" labelStyle={{color:'white'}} labelStyle={{color:'white'}} theme={{roundness:0}} style={{height:50,justifyContent:'center'}} loading={this.state.loading} onPress={()=>this.validate()} >Save</Button>
                </Block> */}
            </KeyboardAvoidingView>
            <ImageBrowserScreen ref={ref=>this.select_images=ref} onChange={data=>this.setState({product_images:data})} {...this.props} />
            <Snack ref={ref=>this.snack=ref} />
            <Loader loading={this.state.loading} />
        </View>
        );
    }
}
