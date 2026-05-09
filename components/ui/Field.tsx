import { Text, TextInput, View, type TextInputProps } from "react-native";

type Props = TextInputProps & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, ...rest }: Props) {
  return (
    <View className="w-full mb-3">
      <Text className="text-slate-700 mb-1 font-medium">{label}</Text>
      <TextInput
        {...rest}
        placeholderTextColor="#94a3b8"
        className={`border border-slate-300 rounded-xl px-3 py-3 bg-white text-slate-900 ${
          error ? "border-red-500" : ""
        } ${className ?? ""}`}
      />
      {error ? <Text className="text-red-600 mt-1 text-xs">{error}</Text> : null}
    </View>
  );
}
