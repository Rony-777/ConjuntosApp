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
import {
  useCreateUser,
  useProfiles,
  useUpdateProfile,
} from "@/lib/queries";
import type { Profile, Rol } from "@/lib/types";

// ---------- Schemas ----------

const editSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  telefono: z.string().optional(),
  rol: z.enum(["admin", "vigilante"]),
});
type EditValues = z.infer<typeof editSchema>;

const createSchema = z.object({
  nombre: z.string().min(1, "Requerido"),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(72, "Máximo 72 caracteres"),
  telefono: z.string().optional(),
  rol: z.enum(["admin", "vigilante"]),
});
type CreateValues = z.infer<typeof createSchema>;

const ROL_OPTIONS = [
  { value: "vigilante", label: "Vigilante" },
  { value: "admin", label: "Administrador" },
];

// ---------- Screen ----------

export default function UsuariosScreen() {
  const { profile: me } = useAuth();
  const { data, isLoading, error } = useProfiles();
  const update = useUpdateProfile();
  const create = useCreateUser();
  const [editing, setEditing] = useState<Profile | null>(null);
  const [creating, setCreating] = useState(false);

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
        onPress={() => setCreating(true)}
        className="absolute bottom-6 right-6 bg-brand-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:opacity-80"
      >
        <Text className="text-white text-3xl">+</Text>
      </Pressable>

      <CreateModal
        visible={creating}
        onClose={() => setCreating(false)}
        loading={create.isPending}
        onSubmit={(v) =>
          create.mutate(
            {
              email: v.email.trim().toLowerCase(),
              password: v.password,
              nombre: v.nombre.trim(),
              telefono: v.telefono?.trim() || null,
              rol: v.rol as Rol,
            },
            {
              onSuccess: (res) => {
                setCreating(false);
                Alert.alert(
                  "Usuario creado",
                  `Cuenta creada para ${res.user.email} (${
                    res.user.rol === "admin" ? "Administrador" : "Vigilante"
                  }).\n\nComparte la contraseña con el usuario por un canal seguro. Recomiéndale cambiarla al iniciar sesión.`
                );
              },
              onError: (e: any) =>
                Alert.alert(
                  "No se pudo crear el usuario",
                  e?.message ?? "Error desconocido"
                ),
            }
          )
        }
      />

      <EditModal
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

// ---------- Create modal ----------

function CreateModal({
  visible,
  onClose,
  onSubmit,
  loading,
}: {
  visible: boolean;
  onClose: () => void;
  onSubmit: (v: CreateValues) => void;
  loading: boolean;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      nombre: "",
      email: "",
      password: "",
      telefono: "",
      rol: "vigilante",
    },
  });

  function close() {
    reset();
    onClose();
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/40" onPress={close} />
        <View className="bg-white rounded-t-2xl p-5 pb-8 max-h-[90%]">
          <Text className="text-xl font-bold text-slate-900 mb-1">
            Crear usuario
          </Text>
          <Text className="text-slate-500 text-sm mb-4">
            La cuenta queda activa al instante. Comparte la contraseña por un
            canal seguro.
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Nombre completo"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Juan Pérez"
                  error={errors.nombre?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="vigilante@conjunto.local"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  error={errors.email?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Contraseña temporal"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Mín. 8 caracteres"
                  secureTextEntry
                  autoCapitalize="none"
                  error={errors.password?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="telefono"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Teléfono (opcional)"
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
            <Text className="text-slate-500 text-xs">
              Recordatorio: solo crea administradores cuando sea estrictamente
              necesario. Los administradores pueden modificar todo el sistema.
            </Text>
          </ScrollView>
          <View className="flex-row gap-3 mt-3">
            <View className="flex-1">
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={close}
                fullWidth
              />
            </View>
            <View className="flex-1">
              <Button
                title="Crear"
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

// ---------- Edit modal ----------

function EditModal({
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
  onSubmit: (v: EditValues) => void;
  loading: boolean;
}) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditValues>({
    resolver: zodResolver(editSchema),
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
