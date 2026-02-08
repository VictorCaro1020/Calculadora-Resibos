# 🌙 DARK MODE & 🚀 PWA - GUÍA DE IMPLEMENTACIÓN

## ✅ DARK MODE - YA IMPLEMENTADO

### ¿QUÉ SE HIZO?

1. **Se agregó a `style.css`**:
   - Sección `@media (prefers-color-scheme: dark)`
   - Colores adaptados para tema oscuro
   - Sombras y contrastes ajustados

2. **Se agregó botón 🌙 en `index.html`**:
   - Botón en el header con emoji luna
   - Se cambia a ☀️ cuando está en dark mode

3. **Se agregó lógica en `app.js`**:
   - Detecta preferencia del sistema
   - Guarda preferencia en localStorage
   - Toggle manual con botón

### ¿CÓMO FUNCIONA?

**Automático**:

- Si tu Windows/Mac tiene modo oscuro → la app lo detecta automáticamente
- Si cambias el tema del sistema → la app se adapta

**Manual**:

- Haz clic en el botón 🌙 en el header
- Cambia entre tema claro y oscuro
- La preferencia se guarda y se aplica al volver

### PRUÉBALO AHORA

```bash
# Abre index.html en tu navegador
# 1. Verás botón 🌙 en el header superior derecho
# 2. Haz clic para cambiar tema
# 3. Recarga la página - tu preferencia se mantiene
```

### DETALLES TÉCNICOS

**Archivos modificados**:

```
1. style.css
   - Líneas 688-806 (nuevo dark mode media query)
   - Líneas 155-195 (estilos del botón theme-toggle)

2. index.html
   - Línea ~28-34 (botón theme-toggle en header-controls)

3. app.js
   - Líneas 62-85 (lógica theme toggle en bindUIEvents)
```

**Cómo se implementó**:

```javascript
// En bindUIEvents():
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("appTheme", newTheme);
});
```

---

## 🚀 PWA (Progressive Web App) - EXPLICACIÓN

### ¿QUÉ ES PWA?

PWA = Tu web se convierte en una app instalable que:

```
┌─────────────────────────────────────┐
│  ANTES (Web tradicional)            │
├─────────────────────────────────────┤
│ ❌ Debes abrir navegador             │
│ ❌ URL en barra de navegación       │
│ ❌ No funciona sin internet          │
│ ❌ No hay icono en home              │
└─────────────────────────────────────┘

        VS

┌─────────────────────────────────────┐
│  DESPUÉS (PWA)                      │
├─────────────────────────────────────┤
│ ✅ Icono en home/desktop            │
│ ✅ Se abre como app (pantalla llena)│
│ ✅ Funciona offline (sin internet)  │
│ ✅ Mucho más rápido                 │
│ ✅ Experiencia como app nativa      │
└─────────────────────────────────────┘
```

### VENTAJAS DE PWA PARA TI

1. **Funciona sin internet**
   - Datos cacheados automáticamente
   - Ideal para edificios sin WiFi en algunas áreas

2. **Instalable**
   - Click en "Instalar" en navegador
   - Aparece icono en home (Android) o Dock (Mac)

3. **Más rápido**
   - Carga desde caché (no desde servidor)
   - Sin esperas de conexión

4. **Profesional**
   - Parece una app verdadera
   - Excelente para portafolio

5. **Funciona offline**
   - Usuario agrega datos aunque no haya internet
   - Se sincroniza cuando vuelve la conexión (opcional)

### CÓMO FUNCIONA PWA

```
┌──────────────────────────────────────────────────────────┐
│                    3 COMPONENTES                         │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  1. manifest.json - METADATOS                           │
│     └─ Nombre, icono, colores, descripción             │
│                                                          │
│  2. service-worker.js - CACHÉ (offline)                 │
│     └─ Descarga archivos para trabajar sin internet     │
│                                                          │
│  3. index.html - REGISTER (activación)                  │
│     └─ Código que registra service worker              │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### EJEMPLO DE FLUJO PWA

```
1. Usuario abre app en navegador
   ↓
2. Service Worker descarga y cachea:
   - index.html
   - style.css
   - app.js
   - modules/*.js
   ↓
3. Navegador muestra "Instalar" (Android) o "Añadir a home" (iOS)
   ↓
4. Usuario hace clic en instalar
   ↓
5. Icono aparece en home/desktop
   ↓
6. Cuando abre la app:
   - Se abre a pantalla completa (sin barra de navegador)
   - Si no hay internet → usa archivos cacheados
   - Funciona perfectamente igual
```

### PARA TU APP ESPECÍFICA

Con PWA en tu Calculadora de Recibos:

```
SCENARIO 1: Usuario con internet
├─ Abre app → Funciona normalmente
├─ Agrega unidades → Se guardan en localStorage
└─ Cierra app → Todo se mantiene

SCENARIO 2: Usuario sin internet (construcción sin WiFi)
├─ App ya estaba instalada
├─ Abre app desde icono home
├─ Puede agregar unidades (datos guardados localmente)
├─ Cuando vuelve a casa con WiFi
├─ Puede hacer backup/export
└─ Totalmente funcional offline
```

---

## 📋 COMPONENTES NECESARIOS PARA PWA

### 1. **manifest.json** (Metadatos)

```json
{
  "name": "Calculadora de Recibos Domésticos",
  "short_name": "Recibos",
  "description": "Calcula y distribuye gastos de servicios domésticos",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#2b6cb0",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 2. **service-worker.js** (Caché/Offline)

```javascript
// Descarga y cachea archivos al instalar
self.addEventListener("install", (event) => {
  // Guarda archivos offline
});

// Actualiza caché cuando hay cambios
self.addEventListener("activate", (event) => {
  // Limpia cachés antiguos
});

// Estrategia Network-first: internet si hay, caché si no
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request)),
  );
});
```

### 3. **Actualización a index.html**

```html
<link rel="manifest" href="manifest.json" />
<meta name="theme-color" content="#2b6cb0" />
<link rel="apple-touch-icon" href="icon-192.png" />

<script>
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/service-worker.js");
  }
</script>
```

---

## 🎯 PRÓXIMOS PASOS

### OPCIÓN A: Implementar PWA ahora (recomendado)

1. Crear `manifest.json`
2. Crear `service-worker.js`
3. Actualizar `index.html`
4. Generar iconos (192x512)
5. Probar en navegador

**Tiempo**: 3-4 horas
**Resultado**: App instalable, funciona offline

### OPCIÓN B: Implementar Tests (alternativa)

1. Instalar Jest
2. Escribir tests para calculator.js
3. Ejecutar npm test
4. Portafolio profesional

**Tiempo**: 4-6 horas
**Resultado**: Código validado, confiable

### OPCIÓN C: Backend API (futuro)

1. Crear servidor Node.js
2. Endpoints para guardar/cargar datos
3. Base de datos
4. Multi-usuario

**Tiempo**: 1-2 semanas
**Resultado**: App en nube, compartir datos

---

## 📞 RESUMIENDO

| Mejora        | Estado     | Cómo usar                      |
| ------------- | ---------- | ------------------------------ |
| **Dark Mode** | ✅ HECHO   | Haz clic en 🌙 en header       |
| **PWA**       | 📋 LISTO   | Te digo cómo en siguiente paso |
| **Tests**     | ⏳ PRÓXIMO | Si quieres validar código      |
| **Backend**   | 🔄 FUTURO  | Cuando escales la app          |

---

## 🚀 ¿QUIERES QUE IMPLEMENTE PWA AHORA?

Si dices que sí, haré:

1. ✅ Archivo `manifest.json`
2. ✅ Archivo `service-worker.js`
3. ✅ Actualización a `index.html`
4. ✅ Instrucciones para generar iconos
5. ✅ Guía para instalar y probar

**¿Vamos con PWA?** 🚀
