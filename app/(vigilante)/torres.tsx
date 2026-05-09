import { ActivityIndicator, FlatList, Text, View } from "react-native";

import { Card } from "@/components/ui/Card";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useTorres } from "@/lib/queries";

export default function VigilanteTorres() {
  const { data, isLoading, error } = useTorres();

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
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text className="text-slate-500 text-center mt-10">
            No hay torres registradas.
          </Text>
        }
        renderItem={({ item }) => (
          <Card>
            <Text className="text-lg font-semibold text-slate-900">
              {item.nombre}
            </Text>
          </Card>
        )}
      />
    </ScreenContainer>
  );
}
