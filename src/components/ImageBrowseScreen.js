import React, { Component } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { AssetsSelector } from 'expo-images-picker';
import { Ionicons } from '@expo/vector-icons';
import { Block } from 'expo-ui-kit';
import { theme_color } from '../global/variables';

export default class ImageBrowserScreen extends Component { 
    constructor(props){
        super(props);
        this.state={
            visible:false,
        }
    }

    open=()=>{
        this.setState({visible:true});
    }

    close=()=>{
        this.setState({visible:false});
    }

  render() {
    const emptyStayComponent = () => <Text>No Images Found</Text>;

    return (
    <Modal visible={this.state.visible} animationType="fade" onRequestClose={()=>this.close()} statusBarTranslucent={true}>
        <Block paddingTop={40}>
        <AssetsSelector
        
            options={{
                manipulate: {
                    width: 512,
                    compress: 0.7,
                    base64: false,
                    saveTo: 'jpeg',
                },
                assetsType: ['photo'],
                maxSelections: 6,
                margin: 3,
                portraitCols: 4,
                landscapeCols: 5,
                widgetWidth: 100,
                widgetBgColor: 'white',
                selectedBgColor: 'rgba(0,0,0,0.5)',
                videoIcon: {
                    Component: Ionicons,
                    iconName: 'ios-videocam',
                    color: 'white',
                    size: 20,
                },
                selectedIcon: {
                    Component: Ionicons,
                    iconName: 'ios-checkmark-circle-outline',
                    color: 'white',
                    bg: 'rgba(0,0,0,0.5)',
                    size: 20,
                },
                defaultTopNavigator: {
                    continueText: 'Done',
                    goBackText: 'Back',
                    backFunction: ()=>this.close(),
                    doneFunction: (data) => {
                        this.close();
                        this.props.onChange(data);
                    },
                },
                noAssets: {
                    Component: emptyStayComponent,
                },
            }}
        />
        </Block>
     </Modal>
    );
  }
}

