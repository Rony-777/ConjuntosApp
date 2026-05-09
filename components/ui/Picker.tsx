import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

export type PickerOption = { value: string; label: string; sublabel?: string };

type Props = {
  label: string;
  value: string | null;
  options: PickerOption[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  error?: string;
  allowClear?: boolean;
};

export function Picker({
  label,
  value,
  options,
  onChange,
  placeholder = "Selecciona…",
  error,
  allowClear = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <View className="w-full mb-3">
      <Text className="text-slate-700 mb-1 font-medium">{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`border border-slate-300 rounded-xl px-3 py-3 bg-white ${
          error ? "border-red-500" : ""
        }`}
      >
        <Text className={current ? "text-slate-900" : "text-slate-400"}>
          {current ? current.label : placeholder}
        </Text>
      </Pressable>
      {error ? <Text className="text-red-600 mt-1 text-xs">{error}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable
          className="flex-1 bg-black/40"
          onPress={() => setOpen(false)}
        />
        <View className="bg-white rounded-t-2xl pt-3 pb-6 max-h-[70%]">
          <View className="px-5 pb-3 border-b border-slate-200">
            <Text className="text-lg font-semibold text-slate-900">
              {label}
            </Text>
          </View>
          {allowClear && (
            <Pressable
              onPress={() => {
                onChange(null);
                setOpen(false);
              }}
              className="px-5 py-3 border-b border-slate-100 active:bg-slate-50"
            >
              <Text className="text-slate-500 italic">— Sin asignar —</Text>
            </Pressable>
          )}
          <FlatList
            data={options}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`px-5 py-3 border-b border-slate-100 active:bg-slate-50 ${
                  item.value === value ? "bg-brand-50" : ""
                }`}
              >
                <Text className="text-slate-900">{item.label}</Text>
                {item.sublabel ? (
                  <Text className="text-slate-500 text-xs mt-0.5">
                    {item.sublabel}
                  </Text>
                ) : null}
              </Pressable>
            )}
            ListEmptyComponent={
              <Text className="px-5 py-8 text-center text-slate-500">
                Sin opciones disponibles
              </Text>
            }
          />
        </View>
      </Modal>
    </View>
  );
}
