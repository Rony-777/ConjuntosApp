import { Stack } from "expo-router";

export default function VigilanteLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#047857" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Vigilante" }} />
      <Stack.Screen name="torres" options={{ title: "Torres" }} />
      <Stack.Screen name="apartamentos" options={{ title: "Apartamentos" }} />
      <Stack.Screen name="propietarios" options={{ title: "Propietarios" }} />
      <Stack.Screen name="inquilinos" options={{ title: "Inquilinos" }} />
      <Stack.Screen name="administradores" options={{ title: "Administradores" }} />
    </Stack>
  );
}
