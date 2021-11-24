import { StatusBar } from "expo-status-bar";
import React, { useCallback, useState, useEffect } from "react";
import {
  StyleSheet,
  Image,
  ScrollView,
  View,
  Button,
  StatusBar as ReactNativeStatusBar,
} from "react-native";
import { TabView, SceneMap } from "react-native-tab-view";
import * as SQLite from "expo-sqlite";
import { Audio } from "expo-av";

const db = SQLite.openDatabase("catDatabase.db");

db.transaction((tx) => {
  tx.executeSql(
    "create table if not exists favorites(id text primary key not null, );"
  );
});

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
      require("./assets/meow.mp3") // mp3 is from: https://mobcup.net/ringtone/message-cat-meow-al44ouj0
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

const renderScene = SceneMap({ 
  first: RandomImageView, 
  second: FavoritesView, 
});

export default function App() { 
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: "first", title: "Random" },
    { key: "second", title: "Favorites" },
  ]);

  return ( 
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: "100%" }}
      tabBarPosition="bottom"
    />
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
  deleteButton: {
    marginBottom: 20,
  },
  refreshButton: {
    margin: 50,
  },
});
