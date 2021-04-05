import * as React from 'react';
import { Dialog, IconButton, Paragraph, Portal, Snackbar } from "react-native-paper";
import * as Icon from '@expo/vector-icons';
import { Block } from 'expo-ui-kit';

export default class Snack extends React.Component{
    constructor(props){
        super(props);
        this.state={
            visible:false,
            message:'',
            type:'',
            color:'black',
            actions:null,
        }
    }
    show=(message='',type='default',actions=null,autoClose=true)=>{
        console.log("msg",message);
        this.setState({visible:true,message,type,actions},()=>{
            if(autoClose)
                setTimeout(() => {
                    this.setState({visible:false});
                }, 3000);
        });
    }
    hide=()=>{
        this.setState({visible:false,message:''});
    }
    onDismissSnackBar=()=>{
        this.setState({visible:false,message:''});
    }
    render(){
        let{type='',color,duration=2000}=this.state;
        let icon="information-outline";
        if(type=="danger"){
            icon="close-circle-outline";
            color='#D45757';
        }else if(type=="success"){
            icon="check-circle-outline";
            color='#668014';
        }else if(type=="info"){
            icon="information-outline";
            color='#FF7722';
        }

        return(
            // <Snackbar
            //     visible={this.state.visible}
            //     onDismiss={()=>this.onDismissSnackBar()}
            //     duration={duration}
            //     style={{backgroundColor:color}}
            // >
            //     {this.state.message}
            // </Snackbar>
            <Portal>
                <Dialog visible={this.state.visible} onDismiss={()=>this.onDismissSnackBar()}>
                    <IconButton icon="close" color="black" onPress={()=>this.onDismissSnackBar()} style={{alignSelf:'flex-end'}} />
                    <Dialog.Content>
                        <Block center flex={0}>
                            <Icon.MaterialCommunityIcons name={icon} size={50} color={color} />
                            <Paragraph style={{marginVertical:15,fontSize:18}}>{this.state.message}</Paragraph>
                        </Block>
                    </Dialog.Content>
                    {
                        this.state.actions!=null &&
                        <Dialog.Actions>
                            {this.state.actions}
                        </Dialog.Actions>
                    }
                </Dialog>
            </Portal>
        );
    }
}