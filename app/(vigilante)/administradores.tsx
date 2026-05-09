import { useMemo } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PhoneButton } from "@/components/ui/PhoneButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useProfiles } from "@/lib/queries";

export default function VigilanteAdministradores() {
  const { data, isLoading, error } = useProfiles();
  const admins = useMemo(
    () => (data ?? []).filter((p) => p.rol === "admin"),
    [data]
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#047857" />
        </View>
      </ScreenContainer>
    );
  }
  if (error) {
    return (
      <ScreenContainer>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center">
            {(error as Error).message}
          </Text>
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <FlatList
        data={admins}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-slate-500 text-center mt-10">
            No hay administradores registrados.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Text className="text-lg font-semibold text-slate-900">
              {item.nombre}
            </Text>
            <Text className="text-xs text-brand-700 font-semibold">
              ADMINISTRADOR
            </Text>
            {item.telefono ? (
              <View className="mt-2 flex-row">
                <PhoneButton phone={item.telefono} compact label="Llamar" />
              </View>
            ) : (
              <Text className="text-slate-400 italic text-xs mt-1">
                Sin teléfono
              </Text>
            )}
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
