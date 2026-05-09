import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Picker } from "@/components/ui/Picker";
import { PhoneButton } from "@/components/ui/PhoneButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/lib/auth-context";
import { useProfiles, useUpdateProfile } from "@/lib/queries";
import type { Profile, Rol } from "@/lib/types";

const schema = z.object({
  nombre: z.string().min(1, "Requerido"),
  telefono: z.string().optional(),
  rol: z.enum(["admin", "vigilante"]),
});
type FormValues = z.infer<typeof schema>;

const ROL_OPTIONS = [
  { value: "admin", label: "Administrador" },
  { value: "vigilante", label: "Vigilante" },
];

export default function UsuariosScreen() {
  const { profile: me } = useAuth();
  const { data, isLoading, error } = useProfiles();
  const update = useUpdateProfile();
  const [editing, setEditing] = useState<Profile | null>(null);

  function openInfoCreate() {
    Alert.alert(
      "Crear usuario nuevo",
      "Por seguridad, los usuarios se crean desde el panel de Supabase " +
        "(Authentication → Users). Una vez creados, aparecerán aquí y podrás " +
        "asignarles el rol de Administrador o Vigilante."
    );
  }

  return (
    <ScreenContainer>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#155cf2" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center">
            {(error as Error).message}
          </Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="text-slate-500 text-center mt-10">
              No hay usuarios registrados.
            </Text>
          }
          renderItem={({ item }) => {
            const isMe = me?.id === item.id;
            return (
              <Card onPress={() => setEditing(item)}>
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-0.5">
                      <Text className="text-lg font-semibold text-slate-900">
                        {item.nombre}
                      </Text>
                      {isMe ? (
                        <Text className="text-xs text-brand-700 ml-2 font-semibold">
                          (tú)
                        </Text>
                      ) : null}
                    </View>
                    <Text
                      className={`text-xs font-semibold ${
                        item.rol === "admin"
                          ? "text-brand-700"
                          : "text-emerald-700"
                      }`}
                    >
                      {item.rol === "admin" ? "ADMINISTRADOR" : "VIGILANTE"}
                    </Text>
                    {item.telefono ? (
                      <View className="mt-2">
                        <PhoneButton
                          phone={item.telefono}
                          compact
                          label="Llamar"
                        />
                      </View>
                    ) : (
                      <Text className="text-slate-400 italic text-xs mt-1">
                        Sin teléfono
                      </Text>
                    )}
                  </View>
                </View>
              </Card>
            );
          }}
        />
      )}

      <Pressable
        onPress={openInfoCreate}
        className="absolute bottom-6 right-6 bg-brand-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:opacity-80"
      >
        <Text className="text-white text-3xl">+</Text>
      </Pressable>

      <FormModal
        visible={editing !== null}
        editing={editing}
        currentUserId={me?.id ?? null}
        onClose={() => setEditing(null)}
        loading={update.isPending}
        onSubmit={(v) =>
          editing &&
          update.mutate(
            {
              id: editing.id,
              nombre: v.nombre.trim(),
              telefono: v.telefono?.trim() || null,
              rol: v.rol as Rol,
            },
            {
              onSuccess: () => setEditing(null),
              onError: (e: any) =>
                Alert.alert("Error", e?.message ?? "No se pudo guardar"),
            }
          )
        }
      />
    </ScreenContainer>
  );
}

function FormModal({
  visible,
  editing,
  currentUserId,
  onClose,
  onSubmit,
  loading,
}: {
  visible: boolean;
  editing: Profile | null;
  currentUserId: string | null;
  onClose: () => void;
  onSubmit: (v: FormValues) => void;
  loading: boolean;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      nombre: editing?.nombre ?? "",
      telefono: editing?.telefono ?? "",
      rol: editing?.rol ?? "vigilante",
    },
    values: {
      nombre: editing?.nombre ?? "",
      telefono: editing?.telefono ?? "",
      rol: editing?.rol ?? "vigilante",
    },
  });

  const isSelf = editing && currentUserId === editing.id;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />
        <View className="bg-white rounded-t-2xl p-5 pb-8 max-h-[85%]">
          <Text className="text-xl font-bold text-slate-900 mb-4">
            Editar usuario
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Nombre"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.nombre?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Teléfono"
                  value={value ?? ""}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="+573001234567"
                  keyboardType="phone-pad"
                  error={errors.telefono?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="rol"
              render={({ field: { onChange, value } }) => (
                <Picker
                  label="Rol"
                  value={value}
                  onChange={(v) => v && onChange(v)}
                  options={ROL_OPTIONS}
                  error={errors.rol?.message}
                />
              )}
            />
            {isSelf ? (
              <Text className="text-amber-700 text-xs mt-1 mb-2">
                ⚠️ Estás editando tu propio usuario. Si cambias tu rol a
                "vigilante", perderás el acceso de administrador.
              </Text>
            ) : null}
          </ScrollView>
          <View className="flex-row gap-3 mt-2">
            <View className="flex-1">
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => {
                  reset();
                  onClose();
                }}
                fullWidth
              />
            </View>
            <View className="flex-1">
              <Button
                title="Guardar"
                onPress={handleSubmit(onSubmit)}
                loading={loading}
                fullWidth
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
