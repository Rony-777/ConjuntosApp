import "../global.css";
import "react-native-reanimated";

import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Slot, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AuthProvider, useAuth } from "@/lib/auth-context";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

function RouteGate() {
  const { loading, session, profile } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const group = segments[0];
    const isAuthGroup = group === "(auth)";
    const isAdmin = group === "(admin)";
    const isVigilante = group === "(vigilante)";

    if (!session) {
      if (!isAuthGroup) router.replace("/(auth)/login");
      return;
    }

    // Logged in but profile not yet loaded — keep current screen.
    if (!profile) return;

    if (profile.rol === "admin" && !isAdmin) {
      router.replace("/(admin)");
    } else if (profile.rol === "vigilante" && !isVigilante) {
      router.replace("/(vigilante)");
    }
  }, [loading, session, profile, segments, router]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#155cf2" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouteGate />
            <StatusBar style="dark" />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
