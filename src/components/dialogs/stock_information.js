import { Block, Text } from "expo-ui-kit";
import React from "react";
import {Alert,Dimensions,FlatList,Image,ImageBackground,Linking,Platform,RefreshControl,Share,View,ScrollView,} from "react-native";
import Carousel from "react-native-snap-carousel";
import {api_key,api_url,theme_color,ios_app_sup_url,android_app_sup_url,theme_light_color,} from "../../global/variables";
import { LinearGradient } from "expo-linear-gradient";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import {Appbar,Avatar,Button,Card,Checkbox,Dialog,IconButton,List,Paragraph,Portal,Searchbar,Title,} from "react-native-paper";
import * as Contacts from "expo-contacts";
import { ButtonGroup } from "react-native-elements";
import * as Animatable from "react-native-animatable";
import {sendNotification,uniqArr,_getUser,_setUser,} from "../../global/auth";
import * as SMS from "expo-sms";
import * as Permissions from "expo-permissions";
import { TouchableNativeFeedback } from "react-native-gesture-handler";
import Snack from "../snack";
import AppSearchBar from "../searchbar";
import Emoji from "react-native-emoji";
import { Value } from "react-native-reanimated";
import { styles } from "../../global/style";
import * as IntentLauncher from 'expo-intent-launcher';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import mime from 'mime';
import moment from "moment";
const sliderWidth=Dimensions.get('window').width-110;
export default class StockInformation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      // user:[],
      user: [],
      everyTimeChecked: true,
      activeSlide:0,
      visible:false,
      // visible:false,
    };
  }

//   componentDidMount() {
//     _getUser().then((user) => {
//         if(user.hasOwnProperty('welcome_msg')){
//             this.setState({visible:user.welcome_msg});
//         }else{
//             this.setState({visible:true});            
//         }
//         this.setState({ user });
//     });
//   }

  uploadExcel=()=>{
    const{excelFile,user}=this.state;
    if(user.active_plan_id==0){
        try {
            console.log("snack",this.snack);
            alert('This Feature Is Only Available For Premium Members If you want to use this feature upgrade to Premium');
        } catch (error) {
            
        }
    }else{
        DocumentPicker.getDocumentAsync().then(res=>{
            console.log("document",res);
            this.setState({excelFile:res});
            try {  
                this.setState({loading:true});
                let fd=new FormData();
                // fd.append('fileURL',excelFile);
                if(res!=null){
                    let imageUri=res.uri;
                    const newImageUri =  "file:///" + imageUri.split("file:/").join("");
                    console.log("fileURL filename",newImageUri);
                    fd.append("fileURL",{
                        uri : newImageUri,
                        type: mime.getType(newImageUri),
                        name: newImageUri.split("/").pop()
                    });
                }
                console.log("formdata",fd);
                fetch(`${api_url}product_list_import/${user.c_id}`,{
                    method:'POST',
                    headers:{
                        Authorization:api_key
                    },
                    body:fd,
                })
                .then(response=>response.json())
                .then(json=>{
                    console.log("price list",json);
                    this.setState({loading:false});
                    if(json.status==1){
                        this.snack.show(json.message,'success');
                        this.getProducts();
                    }else{
                        this.snack.show(json.message,'danger');
                    }
                })
                .catch(err=>{
                    console.log("json err",err);
                    this.setState({loading:false});
                })
            } catch (error) {
                
            }
        })
    }
}

downloadExcel=()=>{
    const{user}=this.state;
    if(user.active_plan_id==0){
        try {
            // console.log("snack",);
            alert('This Feature Is Only Available For Premium Members If you want to use this feature upgrade to Premium');
        } catch (error) {
            
        }
    }else{
        try {  
            this.setState({loading:true});
            // let fd=new FormData();
            fetch(`${api_url}product_list_export/${user.c_id}`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(async json=>{
                console.log("price list",json);
                this.setState({loading:false});
                if(json.status==1){
                    const callback = downloadProgress => {
                        const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
                        this.setState({
                            downloadProgress: progress,
                        });
                    };
                    
                    const downloadResumable = FileSystem.createDownloadResumable(
                        json.url,
                        FileSystem.cacheDirectory + `product_list_${moment(new Date()).format('DD-MM-YYYY')}.xlsx`,
                        {},
                        callback
                    );

                    try {
                        const { uri } = await downloadResumable.downloadAsync();
                        console.log('Finished downloading to ', uri);
                        this.snack.show("Import Successful If you want to open file you can open from here",'success',<Button onPress={()=>{
                            FileSystem.getContentUriAsync(uri).then(cUri => {
                                console.log(cUri);
                                IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                                  data: cUri,
                                  flags: 1,
                                });
                            });
                        }}>Open Now</Button>)
                    } catch (e) {
                        console.error(e);
                    }
                }
            })
            .catch(err=>{
                console.log("json err",err);
                this.setState({loading:false});
            })
        } catch (error) {
            
        }
    }
}


  render() {
    const { user,visible } = this.state;
    
    return (
    <Block>
        {/* <Block flex={0} marginVertical>
            <View style={{width:120,height:120}} alignSelf="center" color="red">
                <TouchableNativeFeedback onPress={this.state.edit_state?this.imagePicker:null} >
                    <View style={{width:120,height:120,alignItems:"center",justifyContent:"center",backgroundColor:"#eee",borderRadius:150,alignSelf:"center",overflow:"hidden"}}>
                        <Image source={profile} style={{width:'100%',flex:1,resizeMode:"cover"}} />                                 
                    </View>
                </TouchableNativeFeedback>
            </View>
        </Block> */}
        
        {/* <Block margin={20} marginTop={150} borderRadius={10} shadow white row center justifyContent="center">
        
            <ScrollView contentContainerStyle={[{flexGrow:1}]} keyboardShouldPersistTaps="always">
                <Animatable.View delay={10} duration={400} animation="fadeInUp">
                    <View style={styles.profileRow}>
                        <Text bold style={{fontSize:22}}> -> Download Excel</Text>
                    </View>
                </Animatable.View>
                <Animatable.View delay={10} duration={400} animation="fadeInUp">
                    <View style={styles.profileRow}>
                        <Text bold style={{fontSize:22}}> -> Changes Excel Files</Text>
                    </View>
                </Animatable.View>
                <Animatable.View delay={10} duration={400} animation="fadeInUp">
                    <View style={styles.profileRow}>
                        <Text bold style={{fontSize:22}}> -> Changes Excel Files</Text>
                    </View>
                </Animatable.View>

                <Block row center justifyContent="space-between">
                <Button style={{alignSelf:'flex-start',fontSize:22}} mode="outlined" onPress={()=>this.downloadExcel()}>Download Excel</Button>
                <Button style={{alignSelf:'flex-end',fontSize:22}} mode="outlined" onPress={()=>this.uploadExcel()}>Upload Excel</Button>
                </Block>
            </ScrollView>
        </Block> */}
    <Block flex={0}>
    <ScrollView contentContainerStyle={[{flexGrow:1}]} keyboardShouldPersistTaps="always">
        <Card margin={20} marginVertical={5} style={{backgroundColor:theme_light_color}}>
            <Card.Content>
            <Title>Download Excel :</Title>
            <Paragraph>Download Excel file in O2B</Paragraph>
            </Card.Content>
        </Card>
        <Card margin={20} marginVertical={5} style={{backgroundColor:theme_light_color}}>
            <Card.Content>
            <Title>Upload Excel :</Title>
            <Paragraph>Upload Excel file in O2B</Paragraph>
            </Card.Content>
        </Card>
        <Card margin={20} marginVertical={5} style={{backgroundColor:theme_light_color}}>
            <Card.Content>
            <Title>Notes :</Title>
            <Paragraph>Update Stock</Paragraph>
            <Paragraph>Stock Managed</Paragraph>
            </Card.Content>
        </Card>
        </ScrollView>
    </Block>
        <Block row center justifyContent="space-between" margin={20} marginTop={5} >
            <Button style={{alignSelf:'flex-start',backgroundColor:'white',shadowColor: "#000",shadowOffset: {width: 0,height: 2,},shadowOpacity: 0.58,shadowRadius: 16.00,borderColor:"#eee",borderWidth:1,elevation: 5,width:150,marginTop:15}}  mode="outlined" onPress={()=>this.downloadExcel()}>Download Excel</Button>
            <Button style={{alignSelf:'flex-end',backgroundColor:'white',shadowColor: "#000",shadowOffset: {width: 0,height: 2,},shadowOpacity: 0.58,shadowRadius: 16.00,borderColor:"#eee",borderWidth:1,elevation: 5,width:150,marginTop:15}} mode="outlined" onPress={()=>this.uploadExcel()}>Upload Excel</Button>
        </Block>
        <Snack ref={ref=>this.snack=ref} />
        
        </Block>
    );
  }
}



