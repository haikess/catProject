import React from "react";
import { TabView, SceneMap } from "react-native-tab-view";
import * as SQLite from "expo-sqlite";
import FavoritesView from "./FavoritesView";
import RandomImageView from "./RandomImageView";

// code has been split

const db = SQLite.openDatabase("catDatabase.db"); // käytetäään db:tä siihen et alustetaan tietokanta

db.transaction((tx) => {
  tx.executeSql(
    "create table if not exists favorites(id text primary key not null, );"
  );
});

const renderScene = SceneMap({ // päänäkymä
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
