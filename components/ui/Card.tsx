import type { ReactNode } from "react";
import { Pressable, View, type PressableProps } from "react-native";

type Props = PressableProps & {
  children: ReactNode;
  onPress?: () => void;
};

export function Card({ children, onPress, className, ...rest }: Props) {
  if (!onPress) {
    return (
      <View className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 ${className ?? ""}`}>
        {children}
      </View>
    );
  }
  return (
    <Pressable
      {...rest}
      onPress={onPress}
      className={`bg-white rounded-2xl p-4 mb-3 shadow-sm border border-slate-100 active:bg-slate-50 ${className ?? ""}`}
    >
      {children}
    </Pressable>
  );
}
