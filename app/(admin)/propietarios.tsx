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
import { PhoneButton } from "@/components/ui/PhoneButton";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { confirm } from "@/lib/confirm";
import {
  useDeletePropietario,
  usePropietarios,
  useUpsertPropietario,
} from "@/lib/queries";
import type { Propietario } from "@/lib/types";

const schema = z.object({
  nombre: z.string().min(1, "Requerido"),
  cedula: z.string().min(1, "Requerido"),
  telefono: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function PropietariosScreen() {
  const { data, isLoading, error } = usePropietarios();
  const upsert = useUpsertPropietario();
  const remove = useDeletePropietario();
  const [editing, setEditing] = useState<Propietario | null>(null);
  const [creating, setCreating] = useState(false);

  function close() {
    setCreating(false);
    setEditing(null);
  }
  async function confirmDelete(p: Propietario) {
    const ok = await confirm({
      title: "Eliminar propietario",
      message: `¿Eliminar a "${p.nombre}"?`,
      confirmText: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(p.id, {
      onError: (e: any) =>
        Alert.alert("Error", e?.message ?? "No se pudo eliminar"),
    });
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
              Sin propietarios. Toca + para agregar uno.
            </Text>
          }
          renderItem={({ item }) => (
            <Card onPress={() => setEditing(item)}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-semibold text-slate-900">
                    {item.nombre}
                  </Text>
                  <Text className="text-slate-500 text-sm">
                    Cédula: {item.cedula}
                  </Text>
                  {item.telefono ? (
                    <Text className="text-slate-500 text-sm">
                      Tel: {item.telefono}
                    </Text>
                  ) : null}
                  <View className="flex-row gap-2 mt-2">
                    <PhoneButton phone={item.telefono} compact label="Llamar" />
                  </View>
                </View>
                <Pressable
                  onPress={() => confirmDelete(item)}
                  hitSlop={12}
                  className="px-3 py-1.5 rounded-full bg-red-50 active:opacity-70"
                >
                  <Text className="text-red-600 font-semibold">Eliminar</Text>
                </Pressable>
              </View>
            </Card>
          )}
        />
      )}

      <Pressable
        onPress={() => setCreating(true)}
        className="absolute bottom-6 right-6 bg-brand-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:opacity-80"
      >
        <Text className="text-white text-3xl">+</Text>
      </Pressable>

      <FormModal
        visible={creating || editing !== null}
        editing={editing}
        onClose={close}
        loading={upsert.isPending}
        onSubmit={(v) =>
          upsert.mutate(
            {
              id: editing?.id,
              nombre: v.nombre.trim(),
              cedula: v.cedula.trim(),
              telefono: v.telefono?.trim() || null,
            },
            {
              onSuccess: close,
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
  onClose,
  onSubmit,
  loading,
}: {
  visible: boolean;
  editing: Propietario | null;
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
      cedula: editing?.cedula ?? "",
      telefono: editing?.telefono ?? "",
    },
    values: {
      nombre: editing?.nombre ?? "",
      cedula: editing?.cedula ?? "",
      telefono: editing?.telefono ?? "",
    },
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />
        <View className="bg-white rounded-t-2xl p-5 pb-8 max-h-[85%]">
          <Text className="text-xl font-bold text-slate-900 mb-4">
            {editing ? "Editar propietario" : "Nuevo propietario"}
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
                  placeholder="Juan Pérez"
                  error={errors.nombre?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="cedula"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Cédula"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="1234567890"
                  keyboardType="number-pad"
                  error={errors.cedula?.message}
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
