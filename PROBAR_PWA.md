# 🧪 GUÍA PASO A PASO - PROBAR PWA

## ⚡ INICIO RÁPIDO (5 minutos)

### PASO 1: Abre la App

```
1. Abre index.html en Chrome, Edge, o Brave
2. En la barra de URL (donde pone "http://...")
   Deberías ver un icono de instalación:

   🔗 □ http://localhost:8000   ⬜ (este icono)

   Si NO lo ves, sigue al Paso 2
```

### PASO 2: Abre DevTools (si no ves icono)

```
1. Presiona F12 (o Ctrl+Shift+I)
2. Pestaña: "Application" (arriba)
3. Lado izquierdo: "Service Workers"

Deberías ver:
  ✅ Service Worker: http://localhost:8000/service-worker.js
  ✅ Status: activated and running (verde)
  ✅ Scope: http://localhost:8000/
```

### PASO 3: Instalar App

**En Chrome:**

```
Icono en barra URL → "Instalar app" → "Instalar"
      ↓
App se instala
      ↓
Icono aparece en escritorio/Inicio
```

**En Mac:**

```
Chrome → Menú (⋮) → "Instalar app 'Recibos'"
      ↓
Aparece en Dock
```

**En iPhone/iPad (Safari):**

```
Compartir → "Agregar a Inicio"
      ↓
Aparece en home screen
```

### PASO 4: Abre desde Icono

```
Busca "Recibos" en:
  • Windows: Presiona Win+S, escribe "Recibos"
  • Mac: Launchpad o Dock
  • iPhone: Home screen

Haz clic → Se abre como APP (sin barra de navegador)
```

### PASO 5: Funciona Igual

```
✅ Botón 🌙 para dark mode
✅ Selector de idioma
✅ Agregar unidades
✅ Calcular gastos
✅ Todo funciona igual
```

---

## 🔌 PROBAR OFFLINE (LA MAGIA)

### PASO 1: Desactiva Internet

**Windows/Mac (Fácil):**

```
1. Desconecta WiFi
   O
2. Apaga datos móviles
   O
3. DevTools → Network → Offline (casilla)
```

**Opción DevTools (Recomendada):**

```
1. F12 (DevTools)
2. Pestaña: "Network"
3. Dropdown: "No throttling" → "Offline"
4. ✓ Offline
```

### PASO 2: Abre la App

```
Abre la app desde icono
      ↓
Aún sin internet
      ↓
✅ App FUNCIONA PERFECTAMENTE
```

### PASO 3: Prueba Funcionalidades

```
Mientras estás OFFLINE:
  ✅ Puedo agregar unidades
  ✅ Puedo ver lista de unidades
  ✅ Puedo calcular gastos
  ✅ Los datos se guardan
  ✅ Todo igual a con internet
```

### PASO 4: Vuelve Online

```
1. Conecta WiFi de nuevo
   O
2. En DevTools → Network → "Online"

Resultado:
  ✅ App sigue funcionando
  ✅ Datos están intactos
  ✅ Transición sin problemas
```

---

## 📊 VERIFICAR CACHÉ

### En DevTools

```
F12 → Application → Cache Storage

Deberías ver:
  📁 recibos-pwa-v1
    ├─ index.html
    ├─ style.css
    ├─ app.js
    ├─ modules/i18n.js
    ├─ modules/storage.js
    ├─ modules/calculator.js
    ├─ modules/ui.js
    └─ manifest.json
```

**Hacer clic en cada archivo**:

- Puedes ver su contenido
- Ver tamaño
- Ver cuándo se cacheó

---

## 🔄 PROBAR ACTUALIZACIÓN

### Cambiar Código

```
1. Abre service-worker.js
2. Busca: const CACHE_NAME = 'recibos-pwa-v1';
3. Cambia a: const CACHE_NAME = 'recibos-pwa-v2';
4. Guarda archivo
```

### En Navegador

```
1. Recarga página (F5 o Ctrl+R)
2. DevTools → Service Workers
3. Verás "New service worker available"
4. Click: "Skip waiting"
5. En Cache Storage → ves nueva carpeta v2
```

---

## 🐛 PROBLEMAS Y SOLUCIONES

### ❌ No aparece icono "Instalar"

**Checklist:**

```
[ ] ¿Estoy en HTTP o HTTPS? (localhost:8000 es OK)
[ ] ¿manifest.json existe? (verifica en DevTools)
[ ] ¿Service Worker está "running"? (verde en DevTools)
[ ] ¿Recargué la página después de cambios?
```

**Solución:**

```
1. Abre DevTools (F12)
2. Console tab
3. Busca errores (texto rojo)
4. Si dice "manifest.json 404" → archivo no está en carpeta
5. Si hay otro error → copiar error aquí para ayudarte
```

### ❌ App se queda en blanco

**Causa**: Service Worker corrupto

**Solución:**

```
1. DevTools → Application → Service Workers
2. Click: "Unregister"
3. Cierra navegador completamente
4. Abre index.html nuevamente
5. Espera 3-5 segundos (instalando SW)
6. Recarga página
```

### ❌ Cambié código pero no se ve

**Causa**: Caché viejo

**Solución:**

```
1. En service-worker.js, cambia:
   const CACHE_NAME = 'recibos-pwa-v2';
   (era v1, ahora es v2)

2. En navegador:
   - Recarga con Ctrl+Shift+R (fuerza limpieza)
   - O borra caché manualmente en DevTools

3. Service Worker detecta cambio
4. Descarga archivos nuevos
```

### ❌ En iPhone no funciona

**Razón**: Safari es lentísimo con PWA

**Soluciones:**

```
1. Usa Chrome en iPhone (mejor que Safari)
2. O agrega a Home, pero espera 10+ segundos
3. Si no funciona, limpia caché de navegador
4. Prueba de nuevo
```

---

## 📱 TESTEAR EN VARIOS NAVEGADORES

### Chrome ✅ (MEJOR)

```
1. Abre index.html
2. Icono "Instalar" aparece rápido
3. Funciona perfecto offline
4. DevTools más completo
```

### Edge ✅ (IGUAL QUE CHROME)

```
Mismo código que Chrome, así que igual de bueno
```

### Firefox ✅ (BUENO)

```
1. Abre index.html
2. Menú (≡) → Instalar app
3. Funciona bien offline
```

### Safari ⚠️ (LENTO)

```
1. Compartir → "Agregar a Inicio"
2. Aparece en home pero funciona mal offline
3. Mejor usar Chrome en iPhone
```

---

## 🎯 CHECKLIST FINAL

Marca todo lo que FUNCIONE:

- [ ] Botón 🌙 (Dark Mode) funciona
- [ ] Selector de idioma funciona
- [ ] Agrego unidades sin error
- [ ] Los números se calculan correctamente
- [ ] Los datos se guardan (cierre y abre = datos siguen)
- [ ] Veo icono "Instalar" en navegador
- [ ] Instalé app correctamente
- [ ] App se abre a pantalla completa
- [ ] En offline, app aún funciona
- [ ] Puedo agregar datos mientras estoy offline
- [ ] En DevTools veo Service Worker "running"
- [ ] En Cache Storage veo archivos cacheados

**Si todo tiene ✅**: 🎉 **PWA está perfecta**

---

## 🚀 PRÓXIMAS PRUEBAS (AVANZADO)

### 1. Probar en Teléfono Real

```
1. Conecta teléfono a WiFi del computador
2. Obtén IP: ipconfig getifaddr en1 (Mac) o ipconfig (Windows)
3. En teléfono: http://[IP]:8000
4. Sigue pasos de instalación
5. Desconecta WiFi y prueba offline
```

### 2. Enviar a Amigo

```
1. Sube archivos a un servidor (Vercel, Netlify, etc.)
2. Comparte URL
3. Tu amigo puede instalar y probar
```

### 3. Lighthouse Audit

```
1. DevTools → Lighthouse (pestaña)
2. Click: "Analyze page load"
3. Verifica:
   ✅ PWA checkmarks
   ✅ Performance
   ✅ Accessibility
```

---

## 💾 REFERENCIA RÁPIDA

### Archivos Creados

```
manifest.json        → Metadatos de app
service-worker.js    → Caché y offline
index.html           → (actualizado con links)
```

### Comandos Útiles

```
# Fuerza actualización (limpia caché)
Ctrl+Shift+R (o Cmd+Shift+R en Mac)

# Abre DevTools
F12

# Simula offline
DevTools → Network → dropdown "Offline"
```

### DevTools Path

```
F12 → Application →
  ├─ Service Workers (verificar si está running)
  ├─ Cache Storage (ver archivos cacheados)
  └─ Manifest (ver información de app)
```

---

## 📞 RESUMEN

**Ahora tu app es una PWA**:

1. ✅ Se instala como app nativa
2. ✅ Funciona offline completamente
3. ✅ Archivos se cachean automáticamente
4. ✅ Actualizaciones automáticas
5. ✅ Profesional para portafolio

**Prueba ahora**:

1. Abre index.html
2. Haz clic en "Instalar"
3. Desconecta WiFi
4. ¡Voilà! Funciona offline 🎉

---

## 🎓 APRENDER MÁS

Si quieres profundizar:

- Google PWA: https://web.dev/progressive-web-apps/
- MDN Service Worker: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- manifest.json: https://developer.mozilla.org/en-US/docs/Web/Manifest

¡Ahora eres experto en PWA! 🚀
