export type Rol = "admin" | "vigilante";

export type Profile = {
  id: string;
  rol: Rol;
  nombre: string;
  telefono: string | null;
  created_at: string;
  updated_at: string;
};

export type Torre = {
  id: string;
  nombre: string;
  created_at: string;
  updated_at: string;
};

export type Propietario = {
  id: string;
  nombre: string;
  cedula: string;
  telefono: string | null;
  created_at: string;
  updated_at: string;
};

export type Apartamento = {
  id: string;
  torre_id: string;
  numero: string;
  propietario_id: string | null;
  created_at: string;
  updated_at: string;
};

export type Inquilino = {
  id: string;
  apartamento_id: string;
  nombre: string;
  cedula: string;
  telefono: string | null;
  created_at: string;
  updated_at: string;
};

export type ApartamentoConRelaciones = Apartamento & {
  torre: Pick<Torre, "id" | "nombre"> | null;
  propietario: Pick<Propietario, "id" | "nombre" | "cedula" | "telefono"> | null;
};

export type InquilinoConApartamento = Inquilino & {
  apartamento:
    | (Pick<Apartamento, "id" | "numero" | "torre_id"> & {
        torre: Pick<Torre, "id" | "nombre"> | null;
      })
    | null;
};
