import * as Linking from "expo-linking";
import { Alert, Pressable, Text } from "react-native";

type Props = {
  phone: string | null | undefined;
  label?: string;
  compact?: boolean;
};

export function PhoneButton({ phone, label, compact }: Props) {
  if (!phone) return null;
  const display = label ?? phone;

  async function call() {
    const url = `tel:${phone}`;
    const can = await Linking.canOpenURL(url);
    if (!can) {
      Alert.alert(
        "No se puede llamar",
        "Este dispositivo no permite abrir el marcador telefónico."
      );
      return;
    }
    await Linking.openURL(url);
  }

  return (
    <Pressable
      onPress={call}
      className={`flex-row items-center bg-emerald-600 rounded-full ${
        compact ? "px-3 py-1.5" : "px-4 py-2"
      } active:opacity-80`}
    >
      <Text className={`text-white font-semibold ${compact ? "text-xs" : ""}`}>
        📞 {display}
      </Text>
    </Pressable>
  );
}
