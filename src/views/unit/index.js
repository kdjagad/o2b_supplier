import { Block, Text } from "expo-ui-kit";
import React from "react";
import { Alert, Dimensions, FlatList, Image, ImageBackground, RefreshControl, StyleSheet, TouchableNativeFeedback, View } from "react-native";
import { api_key, api_url, site_url, sort_by_key, theme_color } from "../../global/variables";
import * as Icon from '@expo/vector-icons';
import { ActivityIndicator, Appbar, Avatar, Button, Card, Dialog, Divider, IconButton, List, Paragraph, Portal, ProgressBar, TextInput, Title } from "react-native-paper";
import FloatIcon from "../../components/float_icon";
import { getAllUnits, _getUser } from "../../global/auth";
import Snack from "../../components/snack";
import AddUnitModal from "../../components/dialogs/add_unit";
import { styles } from "../../global/style";

export default class Units extends React.Component {
    actions = (
        <Block flex={0}>
            <IconButton icon="plus" size={30} color="white" style={styles.circleIcon} onPress={() => this.add_unit.open()} />
        </Block>
    );
    constructor(props) {
        super(props);
        this.state = {
            units: [],
            unitsAll: [],
            user: [],
            loading: false,
            editItem:'',
        }
    }

    componentDidMount() {
        this.init();
        this._unsubscribe = this.props.navigation.addListener('focus', () => {
            this.init();
        });
        //return unsubscribe;
    }
    componentWillUnmount() {
        this._unsubscribe;
    }

    init = () => {
        this.props.navigation.setParams({ actions: this.actions, title: 'Units' })
        _getUser().then(user => this.setState({ user }, () => {
            this.getUnits()
            // this.get_units()
        }));
    }

    _renderUnit = ({ item }) => {
        return (
            <List.Item
                title={`${item.unit_name}`}
                titleStyle={{ fontFamily: 'fontBold', fontSize: 20 }}
                description={item.u_description}
                style={{ borderBottomWidth: 1, borderColor: '#ccc', paddingHorizontal: 15 }}
                right={() => (
                    parseInt(item.cust_id) > 0 &&
                    <Block row center flex={0}>
                        <IconButton icon="pencil" color="gray" onPress={() => {
                            this.setState({editItem:item},()=>{
                                this.add_unit.open();
                            })
                        }} />
                        {
                            parseInt(item.total_products)==0 || item.total_products==null &&
                            <IconButton icon="delete" color="red" onPress={()=>this.askDelete(item)} />
                        }
                    </Block>
                )}
                // left={() => (
                //     <Block flex={0}>
                //         <Avatar.Image style={{ backgroundColor: '#eee', borderRadius: 10 }} source={item.cat_image ? { uri: `${site_url}${item.cat_image}` } : require('../../assets/images/o2b_placeholder.png')} size={60} />
                //     </Block>
                // )}
            />
        )
    }

    askDelete = (item) => {
        Alert.alert(
            "Delete Unit",
            "Are You Sure You Want To Delete This Unit?",
            [
                {
                    text: 'Yes',
                    onPress: () => this.deleteUnit(item)
                },
                {
                    text: 'No',
                    onPress: () => {

                    }
                }
            ]
        )
    }

    deleteUnit = (item) => {
        fetch(`${api_url}unit/${item.u_id}`, {
            method: 'DELETE',
            headers: {
                Authorization: api_key
            }
        })
        .then(response => response.json())
        .then(json => {
            var st = json.status == 1 ? 'success' : 'danger';
            this.snack.show(json.message, st);
            this.getUnits();
        })
        .catch(err => {
            console.log("json err", err);
            this.setState({ loading: false });
        })
    }

    getUnits = () => {
        const { user } = this.state;
        getAllUnits(user.c_id)
            .then(json => {
                json=sort_by_key(json,'unit_name')
                console.log("units", json);
                this.setState({ units: json, unitsAll: json });
            })
            .catch(err => {
                console.log("json err", err);
                this.setState({ loading: false });
            })
    }

    render() {
        return (
            <Block>
                {
                    this.state.loading &&
                    <ProgressBar indeterminate={true} style={StyleSheet.absoluteFill} />
                }
                <FlatList keyboardShouldPersistTaps="handled"
                    data={this.state.units}
                    keyExtractor={(item, index) => index.toString()}
                    contentContainerStyle={{ flexGrow: 1,  }}
                    renderItem={this._renderUnit}
                    ListEmptyComponent={(
                        <Block center paddingVertical={100} >
                            <Icon.MaterialCommunityIcons name="format-list-text" size={100} color="#ccc" />
                            <Text>No Units Found</Text>
                        </Block>
                    )}
                    refreshControl={<RefreshControl onRefresh={() => this.getUnits()} refreshing={this.state.loading} />}
                    maxToRenderPerBatch={15}
                    initialNumToRender={20}
                />
                <Snack ref={ref => this.snack = ref} />
                <AddUnitModal onRef={ref=>this.add_unit=ref} onClose={()=>this.setState({editItem:''},()=>this.getUnits())} item={this.state.editItem} {...this.props} />
            </Block>
        );
    }
}