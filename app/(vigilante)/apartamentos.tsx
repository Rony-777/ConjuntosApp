import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { PhoneButton } from "@/components/ui/PhoneButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useApartamentos } from "@/lib/queries";

export default function VigilanteApartamentos() {
  const { data, isLoading, error } = useApartamentos();

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
        keyExtractor={(a) => a.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-slate-500 text-center mt-10">
            No hay apartamentos registrados.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Text className="text-lg font-semibold text-slate-900">
              {item.torre?.nombre ?? "(sin torre)"} · Apto {item.numero}
            </Text>
            {item.propietario ? (
              <View className="mt-1">
                <Text className="text-slate-700 text-sm">
                  Propietario: {item.propietario.nombre}
                </Text>
                <Text className="text-slate-500 text-xs">
                  Cédula: {item.propietario.cedula}
                </Text>
                {item.propietario.telefono ? (
                  <View className="mt-2 flex-row">
                    <PhoneButton
                      phone={item.propietario.telefono}
                      compact
                      label="Llamar propietario"
                    />
                  </View>
                ) : null}
              </View>
            ) : (
              <Text className="text-slate-400 italic text-xs mt-1">
                Sin propietario asignado
              </Text>
            )}
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
