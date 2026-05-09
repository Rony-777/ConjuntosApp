# Conjuntos Manager

App móvil (iOS + Android) para gestionar conjuntos residenciales: torres, apartamentos, propietarios e inquilinos. Dos roles: **Administrador** (CRUD completo) y **Vigilante** (solo lectura). Llamadas directas a propietarios, inquilinos, vigilantes y administradores.

Stack: Expo + Expo Router + TypeScript + NativeWind + TanStack Query + React Hook Form + Zod + Supabase.

## 1. Requisitos

- Node.js 20+ (probado con 24).
- Cuenta gratuita en Supabase.
- Para correr en el celular: la app **Expo Go** (Android e iOS) o un *development build*.

## 2. Configurar Supabase

1. Sigue la guía paso a paso de `../supabase/SETUP.md`.
2. Ejecuta `../supabase/schema.sql` en el SQL Editor de Supabase.
3. Crea tu primer admin desde el dashboard de Supabase y cámbiale el rol a `admin` en `profiles`.

## 3. Configurar el .env

Copia el ejemplo y rellena los valores que sacaste de Supabase (Project Settings → API):

```bash
cp .env.example .env
# luego edita .env y pon EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY
```

## 4. Instalar dependencias

```bash
npm install
```

## 5. Ejecutar en desarrollo

```bash
npm run start
```

Esto abre el panel de Expo. Desde ahí:

- **Android**: presiona `a` (con un emulador abierto) **o** escanea el QR con la app Expo Go.
- **iOS**: presiona `i` (Mac con Xcode) **o** escanea el QR con la cámara y abre con Expo Go.

## 6. Estructura del proyecto

```
conjuntos-app/
├── app/                       # Pantallas (expo-router)
│   ├── _layout.tsx            # Providers (Auth, QueryClient) + redirect por rol
│   ├── index.tsx              # Splash mientras decide la ruta
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   └── login.tsx
│   ├── (admin)/               # CRUD completo
│   │   ├── _layout.tsx
│   │   ├── index.tsx          # Dashboard
│   │   ├── torres.tsx
│   │   ├── apartamentos.tsx
│   │   ├── propietarios.tsx
│   │   ├── inquilinos.tsx
│   │   └── usuarios.tsx
│   └── (vigilante)/           # Solo lectura
│       ├── _layout.tsx
│       ├── index.tsx          # Dashboard
│       ├── torres.tsx
│       ├── apartamentos.tsx
│       ├── propietarios.tsx
│       ├── inquilinos.tsx
│       └── administradores.tsx
├── components/ui/             # Botón, Input, Picker, Card, PhoneButton, etc.
├── lib/
│   ├── supabase.ts            # Cliente Supabase
│   ├── auth-context.tsx       # Provider de autenticación
│   ├── queries.ts             # Hooks de TanStack Query (CRUD)
│   └── types.ts
├── tailwind.config.js
├── babel.config.js
├── metro.config.js
└── global.css
```

## 7. Cómo funcionan los roles

- Al iniciar sesión, `lib/auth-context.tsx` carga el `profile` y `app/_layout.tsx` redirige:
  - `rol = "admin"`  → grupo de rutas `(admin)`
  - `rol = "vigilante"` → grupo de rutas `(vigilante)`
- Las **políticas RLS** de Supabase son la verdadera barrera: aunque alguien manipule el cliente, los `INSERT/UPDATE/DELETE` solo los acepta la base si `is_admin()` retorna `true`.

## 8. Cómo agregar usuarios

Por seguridad, los usuarios se crean en el dashboard de Supabase (Authentication → Users → Add user). El trigger `handle_new_user` les crea el `profile` automáticamente con rol `vigilante`. Luego el admin entra a la app a la pantalla **Usuarios** y puede:

- Cambiar el `nombre`, `teléfono` y `rol` de cada perfil.
- Llamar a cualquier usuario por su teléfono.

## 9. Llamadas

Cualquier botón de teléfono usa `expo-linking` con `tel:<número>`. Cuando lo presionas, se abre el marcador del sistema (no se hace la llamada automáticamente — el usuario confirma).

## 10. Comandos útiles

```bash
npm run start       # Inicia Expo
npm run android     # Abre en emulador Android
npm run ios         # Abre en simulador iOS (requiere Xcode)
npm run web         # Abre en el navegador
npm run lint        # ESLint
npx tsc --noEmit    # Type-check
npx expo-doctor     # Salud del proyecto
```
"# ConjuntosApp" 
