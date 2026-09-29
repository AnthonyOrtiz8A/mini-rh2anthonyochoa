# Mini Sistema de RRHH

Proyecto práctico del curso **Desarrollo Web (036)** — UMG, Ingeniería en Sistemas,
Centro Universitario de Chiquimulilla. Se construye de forma incremental, clase a
clase, a lo largo del Módulo I: Fundamentos de React + TypeScript.

## Stack

- [Vite](https://vitejs.dev) — build tool y servidor de desarrollo con HMR.
- [React 18](https://react.dev) — librería de UI.
- [TypeScript](https://www.typescriptlang.org) — tipado estático.
- [ESLint](https://eslint.org) (`typescript-eslint` + `eslint-plugin-react-hooks` +
  `eslint-plugin-react-refresh`) — el linter del proyecto. El scaffold de Vite trae
  Oxlint por defecto, pero este proyecto lo reemplazó por ESLint para que coincida con
  la extensión de VS Code que se instala en la Clase 1.

## Cómo correrlo

```bash
npm install       # instala las dependencias listadas en package.json
npm run dev        # levanta el servidor de desarrollo en http://localhost:5173
npm run build       # compila TypeScript (tsc -b) y genera el build de producción con Vite
npm run lint       # corre ESLint sobre todo el proyecto
npm run preview      # sirve el build de producción localmente, para verificarlo
```

## Estructura del proyecto

```
src/
├── components/    # Componentes reutilizables (EmployeeCard, etc.)
├── pages/       # Páginas completas (Login, Dashboard, Empleados) — desde clases futuras
├── layouts/     # Estructuras de página (Header, Sidebar)
├── hooks/       # Custom hooks — desde clases futuras
├── store/       # Zustand stores (estado global) — desde clases futuras
├── services/     # Llamadas a la API — desde clases futuras
├── types/      # Interfaces y types de TypeScript compartidos
└── utils/      # Funciones utilitarias y datos de ejemplo (mockData)
```

## Avance del curso

- **Clase 1 — Ecosistema Frontend Moderno:** sesión de fundamentos y preparación del
  entorno (Node.js, VS Code, Git, GitHub). No se escribió código de la aplicación.
- **Clase 2 — TypeScript Esencial para React:** nace este proyecto.
  - Scaffold inicial con `npm create vite -- --template react-ts` y la arquitectura de
    carpetas de arriba.
  - `src/types/index.ts` — todos los tipos base del dominio (`Department`,
    `EmployeeRole`, `EmployeeStatus`, `Employee`, DTOs, `User`, `LoginCredentials`,
    respuestas de API, `NavItem`).
  - `src/components/EmployeeCard.tsx` — primer componente tipado, con props,
    diccionarios `Record<string, string>` para colores/etiquetas de estado, y su JSX
    completo (avatar, nombre/puesto, badges de departamento y estado).
  - `src/utils/mockData.ts` — datos de ejemplo (`mockEmployees`) tipados como
    `Employee[]`.
  - `src/layouts/Header.tsx` — componente de layout con props opcionales (`user`,
    `onLogout`) y renderizado condicional del bloque de bienvenida.
  - `src/App.tsx` — ensambla todo: renderiza `Header` y una grilla de `EmployeeCard`
    a partir de `mockEmployees`.

Cada clase se desarrolla en su propia rama `feature_clase_NN` (branch desde `develop`)
y se integra a `develop` una vez verificada (build sin errores + confirmación visual en
el navegador). `main` y `stage` solo avanzan cuando el instructor lo indica
explícitamente.
