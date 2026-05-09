import { ActivityIndicator, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-50">
      <ActivityIndicator size="large" color="#155cf2" />
    </View>
  );
}
