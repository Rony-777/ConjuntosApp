import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { confirm } from "@/lib/confirm";
import {
  useDeleteTorre,
  useTorres,
  useUpsertTorre,
} from "@/lib/queries";
import type { Torre } from "@/lib/types";

const schema = z.object({ nombre: z.string().min(1, "Requerido") });
type FormValues = z.infer<typeof schema>;

export default function TorresScreen() {
  const { data, isLoading, error } = useTorres();
  const upsert = useUpsertTorre();
  const remove = useDeleteTorre();
  const [editing, setEditing] = useState<Torre | null>(null);
  const [creating, setCreating] = useState(false);

  function openCreate() {
    setEditing(null);
    setCreating(true);
  }
  function openEdit(t: Torre) {
    setCreating(false);
    setEditing(t);
  }
  function close() {
    setCreating(false);
    setEditing(null);
  }
  async function confirmDelete(t: Torre) {
    const ok = await confirm({
      title: "Eliminar torre",
      message: `¿Eliminar "${t.nombre}"?`,
      confirmText: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(t.id, {
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
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="text-slate-500 text-center mt-10">
              Aún no hay torres. Toca el botón + para agregar.
            </Text>
          }
          renderItem={({ item }) => (
            <Card onPress={() => openEdit(item)}>
              <View className="flex-row items-center justify-between">
                <View>
                  <Text className="text-lg font-semibold text-slate-900">
                    {item.nombre}
                  </Text>
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
        onPress={openCreate}
        className="absolute bottom-6 right-6 bg-brand-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:opacity-80"
      >
        <Text className="text-white text-3xl">+</Text>
      </Pressable>

      <FormModal
        visible={creating || editing !== null}
        editing={editing}
        onClose={close}
        onSubmit={(values) =>
          upsert.mutate(
            { id: editing?.id, nombre: values.nombre },
            {
              onSuccess: close,
              onError: (e: any) =>
                Alert.alert("Error", e?.message ?? "No se pudo guardar"),
            }
          )
        }
        loading={upsert.isPending}
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
  editing: Torre | null;
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
    defaultValues: { nombre: editing?.nombre ?? "" },
    values: { nombre: editing?.nombre ?? "" },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <Pressable className="flex-1 bg-black/40" onPress={onClose} />
        <View className="bg-white rounded-t-2xl p-5 pb-8">
          <Text className="text-xl font-bold text-slate-900 mb-4">
            {editing ? "Editar torre" : "Nueva torre"}
          </Text>
          <Controller
            control={control}
            name="nombre"
            render={({ field: { onChange, value, onBlur } }) => (
              <Field
                label="Nombre"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                placeholder="Torre A"
                error={errors.nombre?.message}
                autoFocus
              />
            )}
          />
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
