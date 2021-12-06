import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  Image,
  View,
  Button,
  StatusBar as ReactNativeStatusBar,
} from "react-native";
import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("catDatabase.db");

function RandomImageView() { 
    const [imageUrl, setImageUrl] = useState(null); 
    const [isLoading, setIsLoading] = useState(false);
    const [isFavorited, setIsFavorited] = useState(false); 
  
    const fetchNewImage = useCallback(() => { 
      setIsLoading(true); 
      fetch("https://thatcopy.pw/catapi/rest/") 
        .then((response) => {
          return response.json(); 
        })
        .then((json) => {
          setImageUrl(json.url); 
        })
        .finally(() => {
          setIsLoading(false); 
        });
    });
  
    useEffect(() => { 
      fetchNewImage();
    }, []); 
  
    const checkIsImageFavorited = useCallback(() => {
      db.transaction((tx) => {
        tx.executeSql( 
          "select * from favorites where id = ? limit 1;",
          [imageUrl],
          (_, { rows }) => {
            setIsFavorited(!!rows.length); 
          }
        );
      });
    });
  
    const addToFavorites = useCallback((id) => {
      db.transaction(
        (tx) => {
          tx.executeSql("insert into favorites (id) values (?);", [id]);
        },
        null, 
        checkIsImageFavorited 
      );
    });
  
    useEffect(() => {
      checkIsImageFavorited(); 
    }, [imageUrl]); 
  
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.image}
            source={{
              uri: imageUrl,
            }}
          />
        </View>
        <View style={styles.buttonsContainer}>
          <Button
            disabled={isFavorited}
            title="Add to favorites"
            onPress={() => {
              addToFavorites(imageUrl);
            }}
          />
          <Button
            disabled={isLoading}
            title="New cat"
            onPress={fetchNewImage}
          />
        </View> 
        <StatusBar style="auto" /> 
      </View>
    ); 
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "flex-start",
      padding: 25,
      paddingTop: ReactNativeStatusBar.currentHeight,
      backgroundColor: "#f4f4f4",
    },
    imageContainer: {
      width: "100%",
      height: "50%",
      padding: 8,
      backgroundColor: "white",
      shadowColor: "#000",
      shadowOpacity: 0.23,
      shadowRadius: 2.62,
      elevation: 4,
      marginBottom: 25,
    },
    image: {
      width: "100%",
      height: "100%",
    },
    buttonsContainer: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      width: "100%",
      justifyContent: "space-around",
    },
  });

  export default RandomImageView;