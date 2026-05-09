import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/lib/auth-context";
import { confirm } from "@/lib/confirm";

const ITEMS: { title: string; emoji: string; route: string; subtitle: string }[] = [
  { title: "Torres", emoji: "🏢", route: "/(vigilante)/torres", subtitle: "Ver torres" },
  { title: "Apartamentos", emoji: "🚪", route: "/(vigilante)/apartamentos", subtitle: "Ver apartamentos" },
  { title: "Propietarios", emoji: "👤", route: "/(vigilante)/propietarios", subtitle: "Ver y llamar a propietarios" },
  { title: "Inquilinos", emoji: "🧑‍🤝‍🧑", route: "/(vigilante)/inquilinos", subtitle: "Ver y llamar a inquilinos" },
  { title: "Administradores", emoji: "🛡️", route: "/(vigilante)/administradores", subtitle: "Llamar al administrador" },
];

export default function VigilanteDashboard() {
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
          Hola, {profile?.nombre ?? "Vigilante"}
        </Text>
        <Text className="text-slate-500 mb-6">
          Modo solo lectura. Puedes consultar y llamar.
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
