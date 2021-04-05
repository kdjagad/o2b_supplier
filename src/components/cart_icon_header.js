import { Block } from "expo-ui-kit";
import React from "react";
import { Appbar, Badge } from "react-native-paper";
import { get_notifications } from "../global/auth";

export default class CartIconHeader extends React.Component{
    constructor(props){
        super(props);
        this.state={
            notification_count:0
        }
    }

    componentDidMount(){
        get_notifications().then(count=>this.setState({notification_count:count}));
    }

    render(){
        const{notification_count}=this.state;
        const{onPress=null}=this.props;
        return(
            <Block flex={0}>
                <Appbar.Action animated={false} icon="bell" onPress={()=>onPress!=null?onPress():{}} />
                <Badge visible={notification_count>0} style={{position:'absolute'}}>{notification_count}</Badge>
            </Block>
        )
    }
}