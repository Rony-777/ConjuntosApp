import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

type Variant = "primary" | "secondary" | "danger" | "ghost";

type Props = PressableProps & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  fullWidth?: boolean;
};

const base =
  "flex-row items-center justify-center rounded-xl px-4 py-3 active:opacity-80";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600",
  secondary: "bg-slate-200",
  danger: "bg-red-600",
  ghost: "bg-transparent",
};

const text: Record<Variant, string> = {
  primary: "text-white font-semibold",
  secondary: "text-slate-900 font-semibold",
  danger: "text-white font-semibold",
  ghost: "text-brand-700 font-semibold",
};

export function Button({
  title,
  variant = "primary",
  loading,
  fullWidth,
  disabled,
  className,
  ...rest
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      {...rest}
      disabled={isDisabled}
      className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${
        isDisabled ? "opacity-60" : ""
      } ${className ?? ""}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "secondary" ? "#0f172a" : "#fff"} />
      ) : (
        <Text className={text[variant]}>{title}</Text>
      )}
    </Pressable>
  );
}
