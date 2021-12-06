import * as SQLite from "expo-sqlite";

const db = SQLite.openDatabase("catDatabase.db"); 

db.transaction((tx) => {
  tx.executeSql(
    "create table if not exists favorites(id text primary key not null);"
  );
});

export default db;