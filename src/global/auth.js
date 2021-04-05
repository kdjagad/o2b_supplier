import * as React from 'react';
import { AsyncStorage } from "react-native";
import { api_key, api_url } from "./variables";

export function _getCountries(){
    return new Promise((resolve,reject)=>{
        try {
            fetch(`${api_url}countries`,{
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            })
        } catch (error) {
            reject(error);
        }
    });
}
export function _getStates(country_id){
    return new Promise((resolve,reject)=>{
        try {
            fetch(`${api_url}states/${country_id}`,{
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            })
        } catch (error) {
            reject(error);
        }
    });
}
export function _getCities(state_id){
    return new Promise((resolve,reject)=>{
        try {
            fetch(`${api_url}cities/${state_id}`,{
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            })
        } catch (error) {
            reject(error);
        }
    });
}
export function _setUser(user){
    return new Promise(async (resolve,reject)=>{
        try {
            await AsyncStorage.setItem('user',JSON.stringify(user));
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

export function _getUser(){
    return new Promise(async (resolve,reject)=>{
        try {
            let user=await AsyncStorage.getItem('user');
            user=user?JSON.parse(user):null;
            resolve(user);
        } catch (error) {
            reject(error);
        }
    });
}

export function logOut(uid=0){
    return new Promise((resolve,reject)=>{
        try {  
            fetch(`${api_url}customer_logout/${uid}`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            })
        } catch (error) {
            reject(error);
        }
    })
}

export function uniqArr(array,key){
    return [...new Map(array.map(item =>[item[key], item])).values()];
}

export function sendNotification(body){
    return new Promise(async (resolve,reject)=>{
        try {
            await fetch('https://exp.host/--/api/v2/push/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body:JSON.stringify(body)
            })
            .then(response=>response.json())
            .then(json=>{
                console.log("notification",json);
                resolve(json);
            })
            .catch(err=>{
                console.log("notification err",err);
                reject(err);
            });
        } catch (error) {
            console.log("notification error",error);
            reject(error);
        }
    });
    
}

export function get_notifications(user){
    return new Promise((resolve,reject)=>{
        try {  
            fetch(`${api_url}supplier_notifications/${user.c_id}`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            })
        } catch (error) {
            reject(error);
        }
    })
}

export function getUserFromDb(uid=0){
    return new Promise((resolve,reject)=>{
        try {  
            fetch(`${api_url}supplier/${uid}`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            })
        } catch (error) {
            reject(error);
        }
    })
}

export function read_all_notifications(user){
    return new Promise((resolve,reject)=>{
        try {  
            fetch(`${api_url}supplier_notifications_readall/${user.c_id}`,{
                headers:{
                    Authorization:api_key
                },
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            })
        } catch (error) {
            reject(error);
        }
    })
}

export function getOrdersItemsAll(uid=0){
    return new Promise((resolve,reject)=>{
        try {
            fetch(`${api_url}supplier_order/${uid}`, {
                method: 'GET',
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

export function getAllUnits(uid=0){
    return new Promise((resolve,reject)=>{
        try {
            fetch(`${api_url}units/${uid}`, {
                method: 'GET',
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};
export function getSettingValue(key=''){
    return new Promise((resolve,reject)=>{
        try {
            fetch(`${api_url}general_settings/${key}`, {
                method: 'GET',
                headers:{
                    Authorization:api_key
                }
            })
            .then(response=>response.json())
            .then(json=>{
                resolve(json);
            })
            .catch(err=>{
                reject(err);
            });
        } catch (error) {
            reject(error);
        }
    });
};

