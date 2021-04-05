import { Block } from "expo-ui-kit";
import React from "react";
import { Appbar, Badge } from "react-native-paper";
import { get_notifications, read_all_notifications, _getUser } from "../global/auth";
import * as Notifications from 'expo-notifications';

export default class NotificationIcon extends React.Component{
    constructor(props){
        super(props);
        this.state={
            notification_count:0,
            user:[],
        }
    }

    componentDidMount(){
        Notifications.addNotificationReceivedListener(this.init);
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
        _getUser().then(user=>this.setState({user},()=>this.getNotifications()));
    }

    getNotifications=()=>{
        const{user}=this.state;
        get_notifications(user).then(res=>{
            let{data}=res;
            data=data.filter(dt=>{
                var reads=dt.sup_read_status?dt.sup_read_status.split(','):[];
                return !reads.includes(user.c_id);
            })
            this.setState({notification_count:data.length})
        });
    }
    

    render(){
        const{notification_count}=this.state;
        const{onPress=null}=this.props;
        return(
            <Block flex={0}>
                <Appbar.Action animated={false} icon="bell" onPress={()=>this.props.navigation.navigate('Notifications')} />
                <Badge visible={notification_count>0} style={{position:'absolute'}}>{notification_count}</Badge>
            </Block>
        )
    }
}