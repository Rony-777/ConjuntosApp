import { useMemo, useState } from "react";
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
import { confirm } from "@/lib/confirm";
import {
  useApartamentos,
  useDeleteApartamento,
  usePropietarios,
  useTorres,
  useUpsertApartamento,
} from "@/lib/queries";
import type { ApartamentoConRelaciones } from "@/lib/types";

const schema = z.object({
  torre_id: z.string().min(1, "Selecciona una torre"),
  numero: z.string().min(1, "Requerido"),
  propietario_id: z.string().nullable(),
});
type FormValues = z.infer<typeof schema>;

export default function ApartamentosScreen() {
  const aptos = useApartamentos();
  const torres = useTorres();
  const propietarios = usePropietarios();
  const upsert = useUpsertApartamento();
  const remove = useDeleteApartamento();

  const [editing, setEditing] = useState<ApartamentoConRelaciones | null>(null);
  const [creating, setCreating] = useState(false);

  const torreOptions = useMemo(
    () => (torres.data ?? []).map((t) => ({ value: t.id, label: t.nombre })),
    [torres.data]
  );
  const propietarioOptions = useMemo(
    () =>
      (propietarios.data ?? []).map((p) => ({
        value: p.id,
        label: p.nombre,
        sublabel: `Cédula: ${p.cedula}`,
      })),
    [propietarios.data]
  );

  function close() {
    setCreating(false);
    setEditing(null);
  }
  async function confirmDelete(a: ApartamentoConRelaciones) {
    const ok = await confirm({
      title: "Eliminar apartamento",
      message: `¿Eliminar ${a.torre?.nombre ?? ""} - ${a.numero}? Esto también eliminará a sus inquilinos.`,
      confirmText: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(a.id, {
      onError: (e: any) =>
        Alert.alert("Error", e?.message ?? "No se pudo eliminar"),
    });
  }

  const isLoading = aptos.isLoading || torres.isLoading || propietarios.isLoading;
  const err = aptos.error || torres.error || propietarios.error;

  return (
    <ScreenContainer>
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#155cf2" />
        </View>
      ) : err ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-red-600 text-center">{(err as Error).message}</Text>
        </View>
      ) : (
        <FlatList
          data={aptos.data}
          keyExtractor={(a) => a.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="text-slate-500 text-center mt-10">
              Sin apartamentos. Toca + para agregar uno.
            </Text>
          }
          renderItem={({ item }) => (
            <Card onPress={() => setEditing(item)}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 mr-3">
                  <Text className="text-lg font-semibold text-slate-900">
                    {item.torre?.nombre ?? "(sin torre)"} · Apto {item.numero}
                  </Text>
                  {item.propietario ? (
                    <View className="mt-1">
                      <Text className="text-slate-700 text-sm">
                        Propietario: {item.propietario.nombre}
                      </Text>
                      <Text className="text-slate-500 text-xs">
                        Cédula: {item.propietario.cedula}
                      </Text>
                      {item.propietario.telefono ? (
                        <View className="mt-2">
                          <PhoneButton
                            phone={item.propietario.telefono}
                            compact
                            label="Llamar propietario"
                          />
                        </View>
                      ) : null}
                    </View>
                  ) : (
                    <Text className="text-slate-400 italic text-sm mt-1">
                      Sin propietario asignado
                    </Text>
                  )}
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
        onPress={() => {
          if (torreOptions.length === 0) {
            Alert.alert(
              "Crea una torre primero",
              "No puedes crear apartamentos sin tener al menos una torre."
            );
            return;
          }
          setCreating(true);
        }}
        className="absolute bottom-6 right-6 bg-brand-600 w-16 h-16 rounded-full items-center justify-center shadow-lg active:opacity-80"
      >
        <Text className="text-white text-3xl">+</Text>
      </Pressable>

      <FormModal
        visible={creating || editing !== null}
        editing={editing}
        torreOptions={torreOptions}
        propietarioOptions={propietarioOptions}
        onClose={close}
        loading={upsert.isPending}
        onSubmit={(v) =>
          upsert.mutate(
            {
              id: editing?.id,
              torre_id: v.torre_id,
              numero: v.numero.trim(),
              propietario_id: v.propietario_id,
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
  torreOptions,
  propietarioOptions,
  onClose,
  onSubmit,
  loading,
}: {
  visible: boolean;
  editing: ApartamentoConRelaciones | null;
  torreOptions: { value: string; label: string }[];
  propietarioOptions: { value: string; label: string; sublabel?: string }[];
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
      torre_id: editing?.torre_id ?? "",
      numero: editing?.numero ?? "",
      propietario_id: editing?.propietario_id ?? null,
    },
    values: {
      torre_id: editing?.torre_id ?? "",
      numero: editing?.numero ?? "",
      propietario_id: editing?.propietario_id ?? null,
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
            {editing ? "Editar apartamento" : "Nuevo apartamento"}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="torre_id"
              render={({ field: { onChange, value } }) => (
                <Picker
                  label="Torre"
                  value={value || null}
                  onChange={(v) => onChange(v ?? "")}
                  options={torreOptions}
                  placeholder="Selecciona la torre"
                  error={errors.torre_id?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="numero"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Número de apartamento"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="101"
                  error={errors.numero?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="propietario_id"
              render={({ field: { onChange, value } }) => (
                <Picker
                  label="Propietario (opcional)"
                  value={value}
                  onChange={onChange}
                  options={propietarioOptions}
                  placeholder="Sin asignar"
                  allowClear
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
