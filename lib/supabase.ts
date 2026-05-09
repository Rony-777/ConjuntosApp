import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anon = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !anon) {
  throw new Error(
    "Faltan EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY en .env. " +
      "Copia .env.example a .env y completa los valores del proyecto Supabase."
  );
}

// En web, AsyncStorage usa window.localStorage internamente. Durante el
// pre-render SSR de Expo Router, `window` no existe y revienta. Usamos un
// adapter que:
//   - en nativo: usa AsyncStorage
//   - en web (navegador): usa localStorage
//   - en SSR (sin window): es un no-op (la sesión se recupera al hidratar)
const isBrowser =
  typeof window !== "undefined" &&
  typeof window.localStorage !== "undefined";

const webStorage = {
  getItem: async (key: string) =>
    isBrowser ? window.localStorage.getItem(key) : null,
  setItem: async (key: string, value: string) => {
    if (isBrowser) window.localStorage.setItem(key, value);
  },
  removeItem: async (key: string) => {
    if (isBrowser) window.localStorage.removeItem(key);
  },
};

export const supabase = createClient(url, anon, {
  auth: {
    storage: Platform.OS === "web" ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === "web",
  },
});
