import moment from 'moment';
import React, { useState } from 'react';
import { View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import Modal from 'react-native-modalbox';
import { Dimensions } from 'react-native';
import { TouchableNativeFeedback } from 'react-native';
import { theme_color } from '../global/variables';
import { styles } from '../global/style';
import { Button, Text } from 'react-native-paper';

export default function DTPicker(props){
    const{defaultValue='',onChangeDate={},label=""}=props;
    const [value, setValue] = useState(defaultValue);
    const [show, setShow] = useState(false);
    const [date, setDate] = useState(new Date());
    const[dtPickerModal, setdtPickerModal] = useState(null);
    const onChange = (event, selectedDate) => {
        if(selectedDate!=undefined){
            const currentDate = selectedDate || date;
            setShow(false);
            setDate(currentDate);
            // dtPickerModal.close();
            setValue(moment(currentDate).format('DD-MM-YYYY'));
            onChangeDate(currentDate);
        }
        else{
            setShow(false);
        }
    };
    return(
        <View style={{flex:0}}>
            <TouchableNativeFeedback onPress={()=>Platform.OS=='ios'?dtPickerModal.open():setShow(true)}>
                <View style={[{borderBottomWidth:2,borderColor:value==defaultValue?"#bbb":theme_color,height:50,justifyContent:'center'}]}>
                    {
                        label!='' &&
                        <Text style={[styles.textInput,{flex:1,fontSize:16,color:"#888",paddingTop:3,marginVertical:0}]}>{label}</Text>
                    }
                    <Text style={[styles.textInput,{fontSize:20,color:value==defaultValue?"#bbb":"#000"}]}>{value}</Text>
                </View>
                
            </TouchableNativeFeedback>
            {
                Platform.OS=='android' ?
                <View>
                    {show && (
                        <DateTimePicker
                            value={date}
                            mode='date'
                            display={"spinner"}
                            onChange={onChange}
                            onTouchCancel={()=>{
                                this.setShow(false)
                                
                            }}
                            {...props}
                        />
                    )}
                </View>:
                <View>
                    <Modal position="center" animationDuration={250} style={{height:"auto",borderRadius:20,padding:15,width:Dimensions.get('window').width-60}} ref={ref=>setdtPickerModal(ref)} coverScreen={true} backButtonClose={true} useNativeDriver={true}>
                        <DateTimePicker
                            value={date}
                            mode='date'
                            display={"inline"}
                            onChange={onChange}
                            {...props}
                            // onTouchCancel={()=>this.setShow(false)}
                        />
                        <Button onPress={()=>dtPickerModal.close()}>OK</Button>
                    </Modal>
                </View>
            }
        </View>
    );
}