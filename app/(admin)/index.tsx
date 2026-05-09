import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/lib/auth-context";
import { confirm } from "@/lib/confirm";

const ITEMS: { title: string; emoji: string; route: string; subtitle: string }[] = [
  { title: "Torres", emoji: "🏢", route: "/(admin)/torres", subtitle: "Gestionar torres del conjunto" },
  { title: "Apartamentos", emoji: "🚪", route: "/(admin)/apartamentos", subtitle: "Gestionar apartamentos" },
  { title: "Propietarios", emoji: "👤", route: "/(admin)/propietarios", subtitle: "Gestionar propietarios" },
  { title: "Inquilinos", emoji: "🧑‍🤝‍🧑", route: "/(admin)/inquilinos", subtitle: "Gestionar inquilinos" },
  { title: "Usuarios", emoji: "🛡️", route: "/(admin)/usuarios", subtitle: "Administradores y vigilantes" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { profile, signOut } = useAuth();

  async function logout() {
    const ok = await confirm({
      title: "Cerrar sesión",
      message: "¿Seguro que quieres salir?",
      confirmText: "Salir",
      destructive: true,
    });
    if (ok) await signOut();
  }

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-2xl font-bold text-slate-900 mb-1">
          Hola, {profile?.nombre ?? "Administrador"}
        </Text>
        <Text className="text-slate-500 mb-6">
          Tienes acceso completo de administración.
        </Text>

        {ITEMS.map((item) => (
          <Card key={item.route} onPress={() => router.push(item.route as any)}>
            <View className="flex-row items-center">
              <Text className="text-3xl mr-3">{item.emoji}</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-slate-900">
                  {item.title}
                </Text>
                <Text className="text-slate-500 text-sm">{item.subtitle}</Text>
              </View>
              <Text className="text-slate-400 text-xl">›</Text>
            </View>
          </Card>
        ))}

        <View className="mt-4">
          <Button title="Cerrar sesión" variant="secondary" onPress={logout} />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
