import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { supabase } from "./supabase";
import type {
  Apartamento,
  ApartamentoConRelaciones,
  Inquilino,
  InquilinoConApartamento,
  Profile,
  Propietario,
  Rol,
  Torre,
} from "./types";

// ---------- Torres ----------

export function useTorres() {
  return useQuery({
    queryKey: ["torres"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("torres")
        .select("*")
        .order("nombre");
      if (error) throw error;
      return data as Torre[];
    },
  });
}

export function useUpsertTorre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { id?: string; nombre: string }) => {
      if (input.id) {
        const { error } = await supabase
          .from("torres")
          .update({ nombre: input.nombre })
          .eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("torres")
          .insert({ nombre: input.nombre });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["torres"] });
      qc.invalidateQueries({ queryKey: ["apartamentos"] });
    },
  });
}

export function useDeleteTorre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("torres").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["torres"] }),
  });
}

// ---------- Propietarios ----------

export function usePropietarios() {
  return useQuery({
    queryKey: ["propietarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("propietarios")
        .select("*")
        .order("nombre");
      if (error) throw error;
      return data as Propietario[];
    },
  });
}

export function useUpsertPropietario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      nombre: string;
      cedula: string;
      telefono: string | null;
    }) => {
      const payload = {
        nombre: input.nombre,
        cedula: input.cedula,
        telefono: input.telefono,
      };
      if (input.id) {
        const { error } = await supabase
          .from("propietarios")
          .update(payload)
          .eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("propietarios").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["propietarios"] });
      qc.invalidateQueries({ queryKey: ["apartamentos"] });
    },
  });
}

export function useDeletePropietario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("propietarios")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["propietarios"] });
      qc.invalidateQueries({ queryKey: ["apartamentos"] });
    },
  });
}

// ---------- Apartamentos ----------

export function useApartamentos() {
  return useQuery({
    queryKey: ["apartamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("apartamentos")
        .select(
          "*, torre:torres(id, nombre), propietario:propietarios(id, nombre, cedula, telefono)"
        )
        .order("numero");
      if (error) throw error;
      return data as ApartamentoConRelaciones[];
    },
  });
}

export function useUpsertApartamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      torre_id: string;
      numero: string;
      propietario_id: string | null;
    }) => {
      const payload = {
        torre_id: input.torre_id,
        numero: input.numero,
        propietario_id: input.propietario_id,
      };
      if (input.id) {
        const { error } = await supabase
          .from("apartamentos")
          .update(payload)
          .eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("apartamentos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apartamentos"] });
      qc.invalidateQueries({ queryKey: ["inquilinos"] });
    },
  });
}

export function useDeleteApartamento() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("apartamentos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["apartamentos"] });
      qc.invalidateQueries({ queryKey: ["inquilinos"] });
    },
  });
}

// ---------- Inquilinos ----------

export function useInquilinos() {
  return useQuery({
    queryKey: ["inquilinos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inquilinos")
        .select(
          "*, apartamento:apartamentos(id, numero, torre_id, torre:torres(id, nombre))"
        )
        .order("nombre");
      if (error) throw error;
      return data as InquilinoConApartamento[];
    },
  });
}

export function useUpsertInquilino() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id?: string;
      apartamento_id: string;
      nombre: string;
      cedula: string;
      telefono: string | null;
    }) => {
      const payload = {
        apartamento_id: input.apartamento_id,
        nombre: input.nombre,
        cedula: input.cedula,
        telefono: input.telefono,
      };
      if (input.id) {
        const { error } = await supabase
          .from("inquilinos")
          .update(payload)
          .eq("id", input.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("inquilinos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquilinos"] }),
  });
}

export function useDeleteInquilino() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("inquilinos")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["inquilinos"] }),
  });
}

// ---------- Usuarios (profiles) ----------

export function useProfiles() {
  return useQuery({
    queryKey: ["profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("nombre");
      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      id: string;
      rol?: Rol;
      nombre?: string;
      telefono?: string | null;
    }) => {
      const { id, ...patch } = input;
      const { error } = await supabase
        .from("profiles")
        .update(patch)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["profiles"] }),
  });
}
