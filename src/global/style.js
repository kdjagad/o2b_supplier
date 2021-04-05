import { StyleSheet } from "react-native";
import { theme_color } from "./variables";

export const styles=StyleSheet.create({
    container:{
        flex:1,
    },
    box:{
        backgroundColor:"white",
        borderRadius:10,
    },
    shadow:{
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

        elevation: 5,
    },
    linkText:{
        color:"#565656",
        fontSize:16,
        marginVertical:5
    },
    row:{
        flexDirection:"row",
        alignItems:"center",
        justifyContent:"space-around",
        width:'30%',
        alignSelf:"center",
    },
    textInput:{backgroundColor:"transparent",fontSize:22,paddingHorizontal:0},
    login_logo:{height:'20%',resizeMode:"contain",alignSelf:"center"},
    float_icon:{
        alignItems:"center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.34,
        shadowRadius: 3,
        elevation: 3,
        justifyContent:"center",
        zIndex:9999,
        backgroundColor:theme_color,
        position:"absolute",
        right:10,
        bottom:10,
    },
    inputLabel:{
        fontSize:16,
        marginTop:10,
        // fontFamily:'fontBold',
        color:'#747474',
        textTransform:'uppercase'
    },
    thumbnailImage:{
        width:80,
        height:80,
        resizeMode:'cover'
    },
    thumbnailImageGrid:{
        width:'100%',
        height:100,
        resizeMode:'cover'
    },
    
    profileRow:{
        flexDirection:'row',
        alignItems:'center',
        paddingVertical:5,
        paddingHorizontal:10,
        borderBottomWidth:1,
        borderColor:'#eee'
    },
    textLabel:{
        flex:1,
        fontSize:16,
        fontFamily:'font',
        color:theme_color
    },
    dashText:{
        color:'#252525',
        fontSize:16,
        textAlignVertical:'center',
        textAlign:'center',position:'absolute',bottom:5,left:0,right:0,
        paddingHorizontal:10
    },
    bigText:{
        fontSize:35,
        textAlign:'center',
        color:theme_color,textAlign:'left',position:'absolute',left:10,top:10,
    },
    curve:{
        position:'absolute',left:-80,top:-100,width:200,height:200,borderRadius:100
    },
    circleIcon:{
        width:35,
        height:35,
        backgroundColor:theme_color,
        borderRadius:40,
        justifyContent:'center',
        alignItems:'center'
    }
});