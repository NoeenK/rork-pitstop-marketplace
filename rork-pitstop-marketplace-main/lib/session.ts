import AsyncStorage from "@react-native-async-storage/async-storage";

let sessionTokenCache: string | null = null;
const STORAGE_KEY = "auth_session_token";

export const setSessionToken = async (token: string | null) => {
  sessionTokenCache = token;
  if (token) {
    await AsyncStorage.setItem(STORAGE_KEY, token);
  } else {
    await AsyncStorage.removeItem(STORAGE_KEY);
  }
};

export const getSessionToken = () => sessionTokenCache;

export const loadSessionTokenFromStorage = async () => {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  sessionTokenCache = stored;
  return stored;
};
