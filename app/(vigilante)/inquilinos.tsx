import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PhoneButton } from "@/components/ui/PhoneButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useInquilinos } from "@/lib/queries";

export default function VigilanteInquilinos() {
  const { data, isLoading, error } = useInquilinos();

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
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-slate-500 text-center mt-10">
            No hay inquilinos registrados.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Text className="text-lg font-semibold text-slate-900">
              {item.nombre}
            </Text>
            <Text className="text-slate-500 text-sm">Cédula: {item.cedula}</Text>
            {item.apartamento ? (
              <Text className="text-slate-500 text-sm">
                {item.apartamento.torre?.nombre ?? ""} · Apto{" "}
                {item.apartamento.numero}
              </Text>
            ) : null}
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
