import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "redux";
import { persistReducer } from "redux-persist";
import auth from "./auth";
import loading from "./loading";

const authPersistConfig = {
  key: "auth",
  storage: AsyncStorage,
  whitelist: ["isLogin", "tokenInfo"],
  version: 1.0,
};

export default combineReducers({
  auth: persistReducer(authPersistConfig, auth),
  loading,
});
