import { Stack } from "expo-router";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#155cf2" },
        headerTintColor: "#fff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Administrador" }} />
      <Stack.Screen name="torres" options={{ title: "Torres" }} />
      <Stack.Screen name="apartamentos" options={{ title: "Apartamentos" }} />
      <Stack.Screen name="propietarios" options={{ title: "Propietarios" }} />
      <Stack.Screen name="inquilinos" options={{ title: "Inquilinos" }} />
      <Stack.Screen name="usuarios" options={{ title: "Usuarios" }} />
    </Stack>
  );
}
