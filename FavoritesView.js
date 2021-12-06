import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  Image,
  ScrollView,
  View,
  Button,
} from "react-native";
import * as SQLite from "expo-sqlite";
import { Audio } from "expo-av";

const db = SQLite.openDatabase("catDatabase.db");

function FavoritesView() {
    const [favoritesList, setFavoritesList] = useState([]); 
    const [sound, setSound] = React.useState(); 
  
    const fetchFavorites = useCallback(() => {
      db.transaction((tx) => {
        tx.executeSql(
          "select * from favorites order by rowId desc;", 
          [],
          (_, { rows }) => {
            setFavoritesList(rows._array); 
          }
        );
      });
    });
  
    const removeFavorite = useCallback((favoriteId) => {
      db.transaction((tx) => {
        tx.executeSql(
          "delete from favorites where id = $1",
          [favoriteId],
          fetchFavorites 
        );
      });
    });
  
    useEffect(() => {
      fetchFavorites(); 
    }, []);
  
    async function playSound() { 
      console.log("Loading Sound");
      const { sound } = await Audio.Sound.createAsync(
        require("./assets/meow.mp3")
      );
      setSound(sound);
  
      console.log("Playing Sound");
      await sound.playAsync();
    }
  
    React.useEffect(() => {
      return sound
        ? () => {
            console.log("Unloading Sound");
            sound.unloadAsync();
          }
        : undefined;
    }, [sound]);
  
    return (
      <ScrollView
        contentContainerStyle={{ padding: 10, margintop: 20 }}
        style={{ flex: 1, height: "100%", backgroundColor: "#f4f4f4" }}
      >
        <View style={styles.refreshButton}>
          <Button
            title="REFRESH"
            onPress={() => {
              fetchFavorites();
            }}
          />
        </View>
        {favoritesList.map((favorite) => { 
          return ( 
            <View key={favorite.id}>
              <Image
                style={{ width: "100%", height: 300 }}
                source={{
                  uri: favorite.id,
                }}
              />
              <View style={styles.deleteButton}>
                <Button
                  title="Delete from favorites"
                  onPress={() => {
                    removeFavorite(favorite.id);
                    playSound();
                  }}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    );
  }
  
  const styles = StyleSheet.create({ 
    deleteButton: {
      marginBottom: 20,
    },
    refreshButton: {
      margin: 50,
    },
  });  

  export default FavoritesView;