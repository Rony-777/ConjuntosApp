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
  useDeleteInquilino,
  useInquilinos,
  useUpsertInquilino,
} from "@/lib/queries";
import type { InquilinoConApartamento } from "@/lib/types";

const schema = z.object({
  apartamento_id: z.string().min(1, "Selecciona un apartamento"),
  nombre: z.string().min(1, "Requerido"),
  cedula: z.string().min(1, "Requerido"),
  telefono: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function InquilinosScreen() {
  const inq = useInquilinos();
  const aptos = useApartamentos();
  const upsert = useUpsertInquilino();
  const remove = useDeleteInquilino();
  const [editing, setEditing] = useState<InquilinoConApartamento | null>(null);
  const [creating, setCreating] = useState(false);

  const apartamentoOptions = useMemo(
    () =>
      (aptos.data ?? []).map((a) => ({
        value: a.id,
        label: `${a.torre?.nombre ?? "Torre?"} · Apto ${a.numero}`,
        sublabel: a.propietario?.nombre
          ? `Propietario: ${a.propietario.nombre}`
          : undefined,
      })),
    [aptos.data]
  );

  function close() {
    setCreating(false);
    setEditing(null);
  }
  async function confirmDelete(i: InquilinoConApartamento) {
    const ok = await confirm({
      title: "Eliminar inquilino",
      message: `¿Eliminar a "${i.nombre}"?`,
      confirmText: "Eliminar",
      destructive: true,
    });
    if (!ok) return;
    remove.mutate(i.id, {
      onError: (e: any) =>
        Alert.alert("Error", e?.message ?? "No se pudo eliminar"),
    });
  }

  const isLoading = inq.isLoading || aptos.isLoading;
  const err = inq.error || aptos.error;

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
          data={inq.data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListEmptyComponent={
            <Text className="text-slate-500 text-center mt-10">
              Sin inquilinos. Toca + para agregar uno.
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
                  {item.apartamento ? (
                    <Text className="text-slate-500 text-sm">
                      {item.apartamento.torre?.nombre ?? ""} · Apto{" "}
                      {item.apartamento.numero}
                    </Text>
                  ) : null}
                  {item.telefono ? (
                    <View className="mt-2">
                      <PhoneButton phone={item.telefono} compact label="Llamar" />
                    </View>
                  ) : null}
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
          if (apartamentoOptions.length === 0) {
            Alert.alert(
              "Crea apartamentos primero",
              "No puedes registrar inquilinos sin apartamentos."
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
        apartamentoOptions={apartamentoOptions}
        onClose={close}
        loading={upsert.isPending}
        onSubmit={(v) =>
          upsert.mutate(
            {
              id: editing?.id,
              apartamento_id: v.apartamento_id,
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
  apartamentoOptions,
  onClose,
  onSubmit,
  loading,
}: {
  visible: boolean;
  editing: InquilinoConApartamento | null;
  apartamentoOptions: { value: string; label: string; sublabel?: string }[];
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
      apartamento_id: editing?.apartamento_id ?? "",
      nombre: editing?.nombre ?? "",
      cedula: editing?.cedula ?? "",
      telefono: editing?.telefono ?? "",
    },
    values: {
      apartamento_id: editing?.apartamento_id ?? "",
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
            {editing ? "Editar inquilino" : "Nuevo inquilino"}
          </Text>
          <ScrollView keyboardShouldPersistTaps="handled">
            <Controller
              control={control}
              name="apartamento_id"
              render={({ field: { onChange, value } }) => (
                <Picker
                  label="Apartamento"
                  value={value || null}
                  onChange={(v) => onChange(v ?? "")}
                  options={apartamentoOptions}
                  placeholder="Selecciona el apartamento"
                  error={errors.apartamento_id?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="nombre"
              render={({ field: { onChange, value, onBlur } }) => (
                <Field
                  label="Nombre"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="María Gómez"
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
