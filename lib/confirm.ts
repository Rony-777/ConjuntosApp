import { Alert, Platform } from "react-native";

/**
 * Diálogo de confirmación cross-platform.
 *
 * - En iOS / Android: usa `Alert.alert` con dos botones.
 * - En web: usa `window.confirm` (Alert.alert de react-native-web ignora
 *   el array de botones, así que esta es la única forma de obtener un
 *   callback fiable).
 *
 * Resuelve `true` si el usuario confirma, `false` si cancela o cierra.
 */
export function confirm(opts: {
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
}): Promise<boolean> {
  const {
    title,
    message,
    confirmText = "OK",
    cancelText = "Cancelar",
    destructive = false,
  } = opts;

  if (Platform.OS === "web") {
    if (typeof window === "undefined" || typeof window.confirm !== "function") {
      return Promise.resolve(false);
    }
    const text = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    Alert.alert(title, message, [
      {
        text: cancelText,
        style: "cancel",
        onPress: () => resolve(false),
      },
      {
        text: confirmText,
        style: destructive ? "destructive" : "default",
        onPress: () => resolve(true),
      },
    ]);
  });
}
