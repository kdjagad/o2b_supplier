
import * as React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Animated from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { Block, Button, Text } from 'expo-ui-kit';
import { Image } from 'react-native';
import ContactList from '../views/customers/import_contactlist';
import { Appbar, Badge, Searchbar } from 'react-native-paper';
import { theme_color, theme_light_color } from '../global/variables';
import * as Animatable from 'react-native-animatable';
import AddProduct from '../views/products/add_product';
import ImageBrowserScreen from '../components/ImageBrowseScreen';
import SingleProduct from '../views/products/single_product';
import Users from '../views/users';
import AddUser from '../views/users/add_user';
import BottomTabs from './bottom_tabs';
import { get_notifications } from '../global/auth';
import CartIconHeader from '../components/cart_icon_header';
import Profile from '../views/profile/profile';
import SingleUser from '../views/customers/single_user';
import Category from '../views/category';
import AddCategory from '../views/category/add_category';
import Units from '../views/unit';
import PriceList from '../views/price_list';
import OrderList from '../views/orders';
import ProductList from '../views/products';
import Customers from '../views/customers';
import Stock from '../views/stock';
import SingleStock from '../views/stock/manage_stock';
import AddOrder from '../views/orders/add_order';
import Settings from '../views/settings';
import ChangePassword from '../views/change_password';
import Info from '../views/info';
import AboutUs from '../views/about';
import Privacy from '../views/privacy';
import TermsAndCondition from '../views/terms_and_condition';
import HelpDesk from '../views/helpdesk';
import Plans from '../views/payment';
import PlanSingle from '../views/payment/plan_single';
import Thankyou from '../views/payment/thankyou';
import DispatchOrders from '../views/orders/dispatch_order';
import TransitDetails from '../views/orders/transit_details';
import Notifications from '../views/notifications';
import NotificationIcon from '../components/notification_icon';
import TrackList from '../views/orders/track_list';
import EmailVerification from '../views/auth/email_verification';
import ProductInformation from '../components/dialogs/Product_information';
import PriceListInformation from '../components/dialogs/pricelist_information';
import StockInformation from '../components/dialogs/stock_information';
import OrderListIndex from '../views/orders/order_index';

const Stack = createStackNavigator();

export default function Screens(props) { 
    const horizontalAnimation = {
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                // {
                //   scale: current.progress.interpolate({
                //     inputRange: [0,1],
                //     outputRange: [0, 1],
                //   }),
                // },
                {
                    translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width,0],
                    }),
                }
              ],
            },
          };
        },
      };
    return (
        <Animated.View style={[{flex:1,overflow:'hidden'},props.style]}>
            <Stack.Navigator 
                screenOptions={{
                    header:({ scene, previous, navigation })=>{
                        // console.log("actions",scene.route.state.routes[3].params,scene.route);
                        const { options } = scene.descriptor;
                        const title =
                            options.headerTitle !== undefined
                            ? options.headerTitle
                            : options.title !== undefined
                            ? options.title
                            : scene.route.params !== undefined
                            ? scene.route.params.title
                            :'';
                        const actions=scene.route.params?scene.route.params.actions:null;
                        return(
                        <Appbar.Header style={{backgroundColor:theme_light_color,elevation:0}}>                            
                            {/* <Animatable.View animation="slideInLeft" duration={200} style={{flex:1}}>                                     */}
                                <Block row center>
                                {
                                    navigation.canGoBack() ?
                                    <Appbar.BackAction onPress={()=>navigation.goBack(null)}  />:
                                    <Appbar.Action icon="menu" onPress={()=>navigation.openDrawer()}  />
                                }
                                    <Block>
                                    {
                                        title ?
                                        <Text style={{fontSize:22,fontFamily:'fontBold'}} numberOfLines={1}>{title}</Text>:
                                        <Image source={require('../assets/images/logo.png')} style={{alignSelf:'center',width:100,height:50,resizeMode:'contain'}} />
                                    }
                                    </Block>
                                    {/* <NotificationIcon navigation={navigation} /> */}
                                    {
                                        actions
                                    }
                                    {/* <Appbar.Action icon="magnify" onPress={()=>scene.route.params.updatePassword()} /> */}
                                </Block>                                
                            {/* </Animatable.View> */}
                        </Appbar.Header>
                    )},
                    ...horizontalAnimation
                }}
                initialRouteName="Dash"
            >
                <Stack.Screen name="Dash" component={BottomTabs}  />
                <Stack.Screen name="ContactList" component={ContactList} options={{title:'Contacts'}}  />
                <Stack.Screen name="AddProduct" component={AddProduct} options={({route})=>({title:'Add Product'})}  />
                <Stack.Screen name="ImageBrowser" component={ImageBrowserScreen} options={{title:'Selected 0',headerShown:false}}  />
                <Stack.Screen name="SingleProduct" component={SingleProduct}  />
                <Stack.Screen name="Users" component={Users} options={({route})=>({title:'Users'})}  />
                <Stack.Screen name="AddUser" component={AddUser} options={({route})=>({title:'Add User'})}  />
                <Stack.Screen name="Profile" component={Profile} options={({route})=>({title:'My Profile'})}  />
                <Stack.Screen name="SingleUser" component={SingleUser} options={({route})=>({})}  />
                <Stack.Screen name="Categories" component={Category} options={({route})=>({})}  />
                <Stack.Screen name="AddCategory" component={AddCategory} options={({route})=>({})}  />
                <Stack.Screen name="Units" component={Units} options={({route})=>({})}  />
                <Stack.Screen name="PriceList" component={PriceList} options={({route})=>({})}  />
                <Stack.Screen name="OrderList" component={OrderList} options={({route})=>({})}  />
                <Stack.Screen name="OrderListIndex" component={OrderListIndex} options={({route})=>({})}  />
                <Stack.Screen name="DispatchOrders" component={DispatchOrders}   />
                <Stack.Screen name="ProductList" component={ProductList} options={({route})=>({})}  />
                <Stack.Screen name="Clients" component={Customers} options={({route})=>({})}  />
                <Stack.Screen name="StockList" component={Stock} options={({route})=>({})}  />
                <Stack.Screen name="SingleStock" component={SingleStock} options={({route})=>({})}  />
                <Stack.Screen name="AddOrder" component={AddOrder} options={({route})=>({})}  />
                <Stack.Screen name="Settings" component={Settings} options={({route})=>({title:'Settings'})}  />
                <Stack.Screen name="ChangePassword" component={ChangePassword} options={({route})=>({title:'Change Password'})}  />
                <Stack.Screen name="Info" component={Info} options={({route})=>({title:'About O2B'})}  />
                <Stack.Screen name="AboutUs" component={AboutUs} options={({route})=>({title:'About Us'})}  />
                <Stack.Screen name="TermsAndCondition" component={TermsAndCondition} options={({route})=>({title:'Terms And Condition'})}  />
                <Stack.Screen name="Privacy" component={Privacy} options={({route})=>({title:'Privacy Policy'})}  />
                <Stack.Screen name="HelpDesk" component={HelpDesk} options={({route})=>({title:'Help Desk'})}  />
                <Stack.Screen name="Plans" component={Plans} options={({route})=>({title:'Upgrade To Premium'})}  />
                <Stack.Screen name="PlanSingle" component={PlanSingle}  />
                <Stack.Screen name="Notifications" component={Notifications} options={({route})=>({title:'Notifications'})}  />
                <Stack.Screen name="Thankyou" component={Thankyou} options={({route})=>({title:'Payment Success'})}  />
                <Stack.Screen name="TransitDetails" component={TransitDetails} options={({route})=>({title:'Transit Details'})}  />
                <Stack.Screen name="TrackList" component={TrackList}  />
                <Stack.Screen name="EmailVerification" component={EmailVerification} options={({route})=>({title:'Verify Your Mail'})}  />
                <Stack.Screen name="ProductInformation" component={ProductInformation} options={({route})=>({title:'Products Information'})}  />
                <Stack.Screen name="PriceListInformation" component={PriceListInformation} options={({route})=>({title:'PriceList Information'})}  />
                <Stack.Screen name="StockInformation" component={StockInformation} options={({route})=>({title:'Stock Information'})}  />
                
            </Stack.Navigator>
        </Animated.View>
    );
}