import React from "react";
import { TabView, SceneMap } from "react-native-tab-view";
import FavoritesView from "./FavoritesView";
import RandomImageView from "./RandomImageView";

const renderScene = SceneMap({
  first: RandomImageView, 
  second: FavoritesView, 
});

export default function App() { 
  const [index, setIndex] = React.useState(0);
  const routes = [
    { key: "first", title: "Random" },
    { key: "second", title: "Favorites" },
  ];

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
