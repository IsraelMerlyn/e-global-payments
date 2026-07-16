# E-Global Payments

Aplicación web para la gestión simulada de operaciones financieras, desarrollada como prueba técnica Front End con Vue 3 y TypeScript.

El sistema implementa autenticación mediante JWT, navegación protegida por roles, registro de ventas, consulta de transacciones, cancelaciones y devoluciones. El backend se simula mediante Mockoon y la información sensible de pago se cifra con AES-GCM antes de enviarse.

---

## Características principales

* Inicio de sesión mediante JWT.
* Acceso a funcionalidades según el rol del usuario.
* Persistencia temporal de sesión mediante `sessionStorage`.
* Protección de rutas con Vue Router.
* Registro de ventas mediante `POST`.
* Consulta de transacciones mediante `GET`.
* Cancelaciones y devoluciones mediante `PATCH`.
* Cifrado AES-GCM de datos sensibles.
* Validaciones financieras con Zod.
* Validación de tarjetas mediante algoritmo de Luhn.
* Notificaciones diferenciadas para respuestas HTTP exitosas y de error.
* Interfaz responsive.
* Pruebas unitarias con Vitest.
* Pruebas end-to-end con Playwright.
* Backend simulado y compartido mediante Mockoon.

---

## Roles disponibles

### Operador

Puede acceder a:

* Resumen operativo.
* Registro de nuevas ventas.
* Consulta de transacciones.

### Supervisor

Puede acceder a:

* Resumen de supervisión.
* Cancelaciones.
* Devoluciones.

El acceso a las rutas se valida mediante el rol contenido en el JWT.

---

## Credenciales de demostración

### Operador

```text
Usuario: operador
Contraseña: Operador123
```

### Supervisor

```text
Usuario: supervisor
Contraseña: Supervisor123
```

Estas credenciales son exclusivamente para fines de evaluación técnica.

---

## Tecnologías utilizadas

### Frontend

* Vue 3
* TypeScript
* Vite
* Composition API
* Vue Router
* Pinia
* Tailwind CSS
* Axios
* Zod
* jwt-decode
* Lucide Icons

### Pruebas

* Vitest
* Vue Test Utils
* Playwright

### Backend simulado

* Mockoon
* Mockoon CLI

### Seguridad

* Web Crypto API
* AES-GCM de 256 bits
* IV aleatorio de 12 bytes
* Tag de autenticación de 128 bits

---

## Decisión de arquitectura

El proyecto utiliza Vue 3 con Vite en lugar de Nuxt porque se trata de una SPA autenticada sin requerimientos de SEO, renderizado del lado servidor o generación estática.

La estructura sigue un enfoque Feature-Sliced Design pragmático:

```text
src/
├── app/
│   ├── router/
│   └── styles/
├── pages/
├── widgets/
├── features/
├── entities/
└── shared/
```

### Responsabilidades

* `app`: inicialización, router y configuración global.
* `pages`: pantallas asociadas con rutas.
* `widgets`: bloques complejos de interfaz.
* `features`: acciones del usuario y casos de uso.
* `entities`: modelos y reglas relacionadas con entidades del dominio.
* `shared`: infraestructura, componentes y utilidades reutilizables.

El estado de autenticación se gestiona con Pinia. Los formularios transaccionales mantienen estado local para evitar almacenar datos sensibles globalmente.

---

## Requisitos

Antes de ejecutar el proyecto se necesita:

* Node.js 22 o superior.
* npm.
* Mockoon Desktop o Mockoon CLI.
* Git.

Verificar las versiones:

```bash
node --version
npm --version
git --version
```

---

## Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
cd e-global-payments
```

Instalar las dependencias:

```bash
npm install
```

---

## Variables de entorno

Crear un archivo `.env.local` a partir del ejemplo:

```bash
cp .env.example .env.local
```

Contenido esperado:

```env
VITE_APP_NAME=E-Global Payments
VITE_API_BASE_URL=http://localhost:3001/api
VITE_AES_KEY_BASE64=REEMPLAZAR_CON_CLAVE_BASE64_DE_32_BYTES
```

### Generar la clave AES

Generar una clave aleatoria de 32 bytes:

```bash
openssl rand -base64 32
```

Copiar el resultado en:

```env
VITE_AES_KEY_BASE64=
```

Ejemplo:

```env
VITE_AES_KEY_BASE64=CLAVE_GENERADA_CON_OPENSSL
```

Después de modificar las variables de entorno se debe reiniciar Vite.

> Las variables con prefijo `VITE_` son incluidas en el bundle del frontend y pueden inspeccionarse desde el navegador. La clave utilizada en este proyecto existe únicamente para demostrar el cifrado solicitado en la evaluación técnica. En un sistema productivo, la protección real debe complementarse con HTTPS, tokenización y controles del lado servidor.

El archivo `.env.local` no debe agregarse al repositorio.

---

## Ejecutar el frontend

Iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible en:

```text
http://localhost:5173
```

---

## Backend simulado con Mockoon

El environment de Mockoon se encuentra en:

```text
mockoon/e-global-payments-api.json
```

### Opción 1: Mockoon Desktop

1. Abrir Mockoon.
2. Seleccionar `File`.
3. Seleccionar `Open environment`.
4. Abrir:

```text
mockoon/e-global-payments-api.json
```

5. Iniciar el environment.

Configuración esperada:

```text
Puerto: 3001
Prefijo: /api
```

### Opción 2: Mockoon CLI

Ejecutar:

```bash
npx @mockoon/cli start \
  --data ./mockoon/e-global-payments-api.json
```

También puede instalarse globalmente:

```bash
npm install --global @mockoon/cli
```

Después:

```bash
mockoon-cli start \
  --data ./mockoon/e-global-payments-api.json
```

El backend simulado estará disponible en:

```text
http://localhost:3001/api
```

---

## Endpoints

### Autenticación

```http
POST /api/auth/login
```

Request:

```json
{
  "username": "operador",
  "password": "Operador123"
}
```

Respuesta exitosa:

```json
{
  "accessToken": "JWT",
  "tokenType": "Bearer"
}
```

Respuesta de error:

```json
{
  "status": 400,
  "code": "INVALID_CREDENTIALS",
  "message": "Usuario o contraseña incorrectos"
}
```

---

### Registrar venta

```http
POST /api/sales
```

Request:

```json
{
  "amount": 2500.5,
  "customerName": "Ana López",
  "maskedCard": "4111********1111",
  "paymentData": {
    "algorithm": "AES-GCM",
    "iv": "BASE64_IV",
    "ciphertext": "BASE64_CIPHERTEXT"
  }
}
```

Respuesta exitosa:

```json
{
  "approvalNumber": "938271",
  "financialReference": "48291037",
  "maskedCard": "4111********1111",
  "status": "APPROVED"
}
```

Respuesta de error:

```json
{
  "status": 400,
  "code": "SALE_REJECTED",
  "message": "La operación fue rechazada por el procesador"
}
```

Para simular un rechazo se puede utilizar:

```text
Importe: 9999.99
```

---

### Consultar transacciones

```http
GET /api/transactions
```

Respuesta:

```json
{
  "items": [
    {
      "id": "TX-001",
      "approvalNumber": "938271",
      "financialReference": "48291037",
      "maskedCard": "4111********1111",
      "customerName": "Ana López",
      "amount": 2500.5,
      "date": "2026-07-16T14:30:00Z",
      "status": "APPROVED"
    }
  ],
  "total": 10
}
```

Estados posibles:

```text
APPROVED
CANCELLED
REFUNDED
```

Para simular un error directamente desde el endpoint:

```http
GET /api/transactions?scenario=error
```

---

### Cancelar transacción

```http
PATCH /api/transactions/cancellation
```

Request:

```json
{
  "financialReference": "48291037",
  "cardNumber": "4111111111111111"
}
```

Respuesta exitosa:

```json
{
  "approvalNumber": "675201",
  "financialReference": "48291037",
  "maskedCard": "4111********1111",
  "status": "CANCELLED"
}
```

Para simular un rechazo:

```text
Referencia financiera: 00000000
```

---

### Aplicar devolución

```http
PATCH /api/transactions/refund
```

Request:

```json
{
  "financialReference": "48291037",
  "cardNumber": "4111111111111111"
}
```

Respuesta exitosa:

```json
{
  "approvalNumber": "128943",
  "financialReference": "48291037",
  "maskedCard": "4111********1111",
  "status": "REFUNDED"
}
```

Para simular un rechazo:

```text
Referencia financiera: 00000000
```

---

## Rutas de la aplicación

### Públicas

```text
/login
```

### Operador

```text
/operador
/operador/ventas
/operador/transacciones
```

### Supervisor

```text
/supervisor
/supervisor/cancelaciones
/supervisor/devoluciones
```

### Control de errores

```text
/forbidden
/:pathMatch(.*)*
```

Un usuario que intente acceder a una ruta no permitida para su rol será enviado a `/forbidden`.

---

## Flujo de venta

El flujo de una venta es:

```text
Captura del formulario
→ Validación con Zod
→ Validación Luhn
→ Formato y enmascaramiento
→ Cifrado AES-GCM
→ POST /sales
→ Notificación HTTP
→ Comprobante
```

Los datos sensibles cifrados son:

```json
{
  "cardNumber": "4111111111111111",
  "expirationDate": "12/29",
  "cvv": "123"
}
```

Estos datos se serializan y cifran conjuntamente mediante AES-GCM.

El request únicamente incluye:

* Tarjeta enmascarada.
* IV.
* Ciphertext.
* Algoritmo utilizado.

La tarjeta completa, la expiración y el CVV no deben enviarse en texto plano.

---

## Seguridad

El proyecto implementa las siguientes medidas:

* JWT para representar la sesión.
* Guardas de navegación por rol.
* Persistencia del token únicamente en `sessionStorage`.
* Limpieza de la sesión al cerrar sesión.
* Cifrado AES-GCM para datos de pago.
* IV único para cada operación.
* Validación de longitud de la clave AES.
* Enmascaramiento del número de tarjeta.
* Limpieza de campos sensibles después de una operación exitosa.
* Prevención de doble envío.
* No almacenamiento de CVV.
* No almacenamiento de tarjeta completa.
* No registro de datos sensibles en consola.
* Validación de contratos HTTP mediante Zod.

### Consideraciones

La decodificación del JWT en el frontend no sustituye la validación de firma del lado servidor.

La autorización implementada en Vue protege la navegación de la interfaz, pero un sistema productivo también debe validar permisos en cada endpoint del backend.

AES en frontend cumple con el alcance de la evaluación, pero no sustituye:

* HTTPS.
* Tokenización.
* PCI DSS.
* Gestión segura de claves.
* Autorización del backend.
* Protección contra manipulación del cliente.

---

## Datos de prueba

Utilizar exclusivamente datos simulados.

### Tarjeta válida para pruebas

```text
4111111111111111
```

### Venta aprobada

```text
Importe: 2500.50
Nombre: Ana López
Tarjeta: 4111111111111111
Expiración: 12/29
CVV: 123
```

### Venta rechazada

```text
Importe: 9999.99
Nombre: Venta Rechazada
Tarjeta: 4111111111111111
Expiración: 12/29
CVV: 123
```

### Cancelación o devolución exitosa

```text
Referencia financiera: 48291037
Tarjeta: 4111111111111111
```

### Cancelación o devolución rechazada

```text
Referencia financiera: 00000000
Tarjeta: 4111111111111111
```

Nunca deben utilizarse tarjetas bancarias reales.

---

## Scripts disponibles

### Desarrollo

```bash
npm run dev
```

### Verificación de tipos

```bash
npm run type-check
```

### ESLint

```bash
npm run lint
```

### Formato

```bash
npm run format
```

### Pruebas unitarias

```bash
npm run test:unit
```

Ejecución única:

```bash
npm run test:unit:run
```

### Pruebas E2E

```bash
npm run test:e2e
```

Modo visual:

```bash
npm run test:e2e:ui
```

Modo con navegador visible:

```bash
npm run test:e2e:headed
```

### Build de producción

```bash
npm run build
```

### Vista previa del build

```bash
npm run preview
```

---

## Instalar navegadores de Playwright

Antes de ejecutar las pruebas E2E:

```bash
npx playwright install chromium
```

En Linux, si faltan dependencias del sistema:

```bash
npx playwright install --with-deps chromium
```

---

## Ejecutar todas las validaciones

```bash
git diff --check
npm run type-check
npm run lint
npm run test:unit:run
npm run build
npm run test:e2e
```

Las pruebas unitarias y E2E utilizan mocks de API cuando corresponde, por lo que no deben depender exclusivamente de Mockoon.

---

## Pruebas implementadas

### Pruebas unitarias

* Validación de algoritmo de Luhn.
* Tarjetas válidas e inválidas.
* Formato del número de tarjeta.
* Enmascaramiento de tarjeta.
* Validación de expiración.
* Detección de fechas vencidas.
* Validación de CVV.
* Validación de importe.
* Validación de nombre.
* Generación de IV.
* Cifrado AES-GCM.
* Rechazo de claves inválidas.
* Ausencia de datos sensibles en el ciphertext visible.
* Validación de respuestas HTTP con Zod.
* Decodificación del rol desde el JWT.

### Pruebas de componentes

* Errores de formulario.
* Prevención de envíos inválidos.
* Estado de carga.
* Rehabilitación del botón.
* Limpieza de datos sensibles.
* Comprobante con tarjeta enmascarada.
* Confirmación de cancelaciones.
* Confirmación de devoluciones.
* Tabla de transacciones.
* Estado vacío.
* Reintento después de error.

### Pruebas E2E

* Login como Operador.
* Login como Supervisor.
* Redirección por rol.
* Registro de venta.
* Respuesta HTTP 200.
* Respuesta HTTP 400.
* Consulta de transacciones.
* Cancelación.
* Devolución.
* Protección de rutas.
* Logout.
* Visualización responsive básica.

---

## Diseño de interfaz

La aplicación utiliza una identidad visual financiera basada en colores sólidos.

Paleta principal:

```text
Fondo: slate-950
Superficies: slate-900
Primario: blue-600
Hover: blue-500
Éxito: emerald-500
Advertencia: amber-500
Error: red-500
Supervisor: violet-500
```

No se utilizan degradados.

La interfaz incluye:

* Navegación por rol.
* Indicador de ruta activa.
* Formularios accesibles.
* Estados de carga.
* Skeletons.
* Tabla responsive.
* Tarjetas para dispositivos móviles.
* Comprobantes de operación.
* Notificaciones con código HTTP.
* Diálogos de confirmación.
* Estados vacíos.
* Página 403.
* Página 404.

---

## Accesibilidad

Se implementan prácticas como:

* Labels asociados a los campos.
* Mensajes de error vinculados.
* `aria-invalid`.
* `aria-describedby`.
* Regiones `aria-live`.
* Nombres accesibles para botones.
* Foco visible.
* Navegación mediante teclado.
* Manejo de foco en diálogos.
* Soporte para `prefers-reduced-motion`.
* Estados representados mediante texto e iconos, no únicamente mediante color.

---

## Responsive design

La aplicación está diseñada para funcionar en:

```text
375 px
768 px
1024 px
1440 px
```

En dispositivos pequeños:

* La navegación se adapta a un menú móvil.
* Las tablas cambian a una presentación basada en tarjetas.
* Los formularios utilizan el ancho disponible.
* Se evita el scroll horizontal innecesario.

---

## Verificación manual recomendada

### Autenticación

* Iniciar sesión como Operador.
* Iniciar sesión como Supervisor.
* Probar credenciales incorrectas.
* Recargar la aplicación y verificar la sesión.
* Cerrar sesión.
* Intentar abrir rutas privadas sin autenticación.

### Seguridad por roles

Como Operador intentar abrir:

```text
/supervisor
/supervisor/cancelaciones
/supervisor/devoluciones
```

Como Supervisor intentar abrir:

```text
/operador
/operador/ventas
/operador/transacciones
```

El sistema debe redirigir a:

```text
/forbidden
```

### Venta

* Probar una venta aprobada.
* Probar una venta rechazada.
* Revisar en los logs de Mockoon que no aparezcan tarjeta, expiración o CVV en texto plano.
* Verificar que el botón vuelva a habilitarse después de un error.
* Verificar que los datos sensibles se limpien después del éxito.

### Consulta

* Verificar al menos 10 transacciones.
* Probar filtros.
* Probar ordenamiento.
* Verificar tarjetas enmascaradas.
* Revisar la vista móvil.

### Supervisor

* Probar cancelación exitosa.
* Probar cancelación rechazada.
* Probar devolución exitosa.
* Probar devolución rechazada.
* Confirmar que los diálogos no muestran la tarjeta completa.

---

## Build para producción

Generar el build:

```bash
npm run build
```

El resultado se almacenará en:

```text
dist/
```

Probarlo localmente:

```bash
npm run preview
```

---

## Entrega del proyecto

El repositorio incluye:

```text
e-global-payments/
├── mockoon/
│   └── e-global-payments-api.json
├── src/
├── e2e/
├── public/
├── .env.example
├── playwright.config.ts
├── vitest.config.ts
├── vite.config.ts
├── package.json
└── README.md
```

No se incluyen:

* `.env.local`
* claves reales
* datos bancarios reales
* `node_modules`
* reportes generados
* logs
* archivos temporales

---

## Historial de cambios

El desarrollo utiliza Conventional Commits.

Ejemplos:

```text
chore: bootstrap Vue 3 application
feat(auth): add typed authentication foundation
feat(routing): protect dashboards by user role
chore(mock): add authentication API environment
feat(sales): add payment validation utilities
feat(security): encrypt payment data with AES-GCM
feat(sales): implement operator sale workflow
feat(transactions): implement transaction query
feat(supervisor): implement cancellation and refund workflows
feat(feedback): add HTTP status notifications
test(sales): cover payment validation and encryption
test(e2e): cover role-based financial workflows
```

---

## Limitaciones conocidas

* Mockoon simula el backend y no persiste operaciones reales.
* Los números de aprobación y referencias son datos de demostración.
* La autorización definitiva debería aplicarse en el backend.
* La clave AES incluida en una SPA puede inspeccionarse desde el cliente.
* No existe integración con un procesador de pagos real.
* No se utilizan datos bancarios reales.
* El sistema no pretende cumplir por sí solo con PCI DSS.
* La sesión utiliza `sessionStorage` exclusivamente para el alcance de la evaluación.

---

## Autor

Desarrollado como evaluación técnica Front End utilizando Vue 3, TypeScript, arquitectura modular y prácticas de ingeniería orientadas a seguridad, mantenibilidad y experiencia de usuario.
