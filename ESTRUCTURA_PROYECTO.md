# 📁 Estructura del Proyecto - Guía Técnica

## 🎯 Descripción General

La **Calculadora de Recibos** es una aplicación web progresiva (PWA) que distribuye equitativamente los gastos de servicios domésticos (luz, agua, gas, arriendo, aseo) entre diferentes unidades/apartamentos.

---

## 📂 Árbol de Archivos

```
Calculadora-Resibos/
│
├── 📄 index.html                 # Estructura HTML semántica y accesible
├── 🎨 style.css                  # Estilos con tokens de diseño CSS
├── ⚙️  app.js                     # Controlador principal (orquestador)
├── 🔧 service-worker.js          # Service worker para funcionalidad offline
├── 📋 manifest.json              # Configuración PWA
│
├── 📁 modules/                   # Módulos especializados
│   ├── 🌍 i18n.js               # Internacionalización (Español/Inglés)
│   ├── 💾 storage.js            # Persistencia de datos (localStorage)
│   ├── 🧮 calculator.js         # Lógica de cálculos y distribución
│   └── 🎭 ui.js                 # Renderizado DOM y eventos
│
└── 📚 Documentación/
    ├── README.md                 # Resumen y uso general
    ├── ESTRUCTURA_PROYECTO.md    # Este archivo (guía técnica)
    ├── GUIA_USUARIO.md          # Manual para usuarios finales
    └── DESARROLLO.md            # Guía para desarrolladores
```

---

## 🏗️ Arquitectura de Capas

```
┌───────────────────────────────────────────────────────────────┐
│                    INDEX.HTML + STYLE.CSS                     │
│                    (Presentación / UI)                        │
└───────────────────┬───────────────────────────────────────────┘
                    │
┌───────────────────┴───────────────────────────────────────────┐
│                  APP.JS (Controlador)                         │
│  - Vincula eventos de UI                                      │
│  - Orquesta módulos                                           │
│  - Maneja el flujo de datos                                   │
└───────┬─────────────┬──────────────────┬──────────────────────┘
        │             │                  │
   ┌────▼────┐   ┌───▼──────┐    ┌──────▼─────┐   ┌────────────┐
   │ storage │   │Calculator│    │   UI       │   │  i18n      │
   │         │   │          │    │            │   │            │
   │ Datos   │   │ Cálculos │    │ Renderizado│   │ Traducciones
   │ local   │   │ Distribu-│    │ DOM        │   │            │
   │Storage  │   │ ción     │    │ Eventos    │   │(ES/EN)     │
   └─────────┘   └──────────┘    └────────────┘   └────────────┘
```

---

## 📦 Módulos - Responsabilidades

### 1️⃣ **app.js** (Controlador Principal)

**Responsabilidad:** Orquestar todos los módulos

```javascript
class UtilityCalculatorApp
  - initialize()           // Inicializa la app
  - bindUIEvents()         // Vincula eventos
  - refresh()              // Recalcula todo
  - handleInputChange()    // Eventos de cambio
  - handleAddUnit()        // Agregar unidad
  - handleGenerateReceipt()// Generar recibo
  - save()                 // Guardar datos
```

**¿Cuándo usarlo?**

- Para agregar nuevos handlers (eventos)
- Para cambiar el flujo de la aplicación
- Para conectar nuevos módulos

---

### 2️⃣ **modules/ui.js** (Interfaz de Usuario)

**Responsabilidad:** Renderizar elementos y manejar eventos DOM

```javascript
const UI = {
  renderUnits()              // Renderiza lista de unidades
  renderExtras()             // Renderiza cargos adicionales
  renderResults()            // Renderiza tabla de distribución
  renderUnitSummary()        // Renderiza resumen por unidad
  renderManualMode()         // Renderiza modo manual (NUEVO)
  renderCalculationDetails() // Renderiza detalles (NUEVO)
  bindInputEvents()          // Vincula todos los eventos
  getInputValues()           // Obtiene valores de inputs
  formatCurrency()           // Formatea números a moneda
  populateUnitSelector()     // Llena select de unidades (NUEVO)
}
```

**¿Cuándo usarlo?**

- Para cambiar cómo se ve algo en pantalla
- Para agregar nuevos inputs o elementos
- Para modificar formatos de presentación

---

### 3️⃣ **modules/calculator.js** (Lógica de Negocio)

**Responsabilidad:** Calcular distribución de gastos

```javascript
const Calculator = {
  calculateAllocations()      // Distribuye todos los gastos
  calculateElectricityA()     // Calcula elec. A (201-202)
  calculateElectricityB()     // Calcula elec. B (401-500)
  calculateWater()            // Calcula agua (por persona)
  calculateGas()              // Calcula gas (por grupos)
  calculateUnitSummary()      // Resumen de una unidad
}
```

**¿Cuándo usarlo?**

- Para cambiar la lógica de distribución
- Para agregar nuevos tipos de gastos
- Para ajustar fórmulas matemáticas

---

### 4️⃣ **modules/storage.js** (Persistencia)

**Responsabilidad:** Guardar/cargar datos

```javascript
const Storage = {
  getDefault()      // Esquema por defecto
  save(data)        // Guarda en localStorage
  load()            // Carga desde localStorage
  clear()           // Limpia datos
  exportJSON()      // Exporta como JSON
  importJSON()      // Importa desde JSON
}
```

**¿Cuándo usarlo?**

- Para cambiar formato de datos
- Para agregar nuevos campos
- Para sincronizar con backend

---

### 5️⃣ **modules/i18n.js** (Internacionalización)

**Responsabilidad:** Traducciones (Español/Inglés)

```javascript
const i18n = {
  setLanguage(lang)  // Establece idioma
  t(key)            // Obtiene traducción
  locale            // Idioma actual
}
```

**¿Cuándo usarlo?**

- Para agregar nuevas traducciones
- Para soportar nuevos idiomas
- Para cambiar textos de la app

---

## 🔄 Flujo de Datos

```
Usuario ingresa datos
        ↓
UI.bindInputEvents() captura evento
        ↓
app.handleInputChange() procesa
        ↓
Storage.save() persiste datos
        ↓
Calculator.calculateAllocations() calcula
        ↓
UI.renderResults() muestra resultados
        ↓
UI.renderCalculationDetails() muestra breakdown
        ↓
UI.renderManualMode() permite editar
```

---

## 🎨 Nuevas Funcionalidades (Agregadas)

### ✨ Modo Manual

**Archivo:** `modules/ui.js` → `renderManualMode()`

- Permite editar valores de cada componente
- Útil cuando los cálculos no coinciden con el recibo

### 📊 Detalles de Cálculos

**Archivo:** `modules/ui.js` → `renderCalculationDetails()`

- Muestra el breakdown: kWh por unidad, precio/persona, etc.
- Facilita verificación de cálculos

### ✅ Select de Unidades Corregido

**Archivo:** `modules/ui.js` → `populateUnitSelector()`

- Llena automáticamente el selector
- Permite navegar entre unidades sin problemas

---

## 🎯 Para Desarrolladores

### Agregar una Nueva Funcionalidad

**Paso 1:** Determinar dónde va

- ¿Es presentación? → `modules/ui.js`
- ¿Es lógica? → `modules/calculator.js`
- ¿Es datos? → `modules/storage.js`
- ¿es HTML/CSS? → `index.html` / `style.css`

**Paso 2:** Crear la función

```javascript
// En el módulo correspondiente
const newFunction = (param) => {
  // Implementación
  return result;
};
```

**Paso 3:** Exportar en el return del módulo

```javascript
return {
  // ... funciones existentes
  newFunction,
};
```

**Paso 4:** Usar en app.js

```javascript
// En el método refresh() o manejador de eventos
UI.newFunction(data);
```

**Paso 5:** Subir a GitHub

```bash
git add .
git commit -m "Agregar nueva funcionalidad: [nombre]"
git push
```

---

## 📱 URLs y Acceso

- **En desarrollo:** `http://localhost:8000` (si usas un servidor local)
- **En GitHub Pages:** `https://victorcaro1020.github.io/Calculadora-Resibos/`
- **Repositorio:** `https://github.com/VictorCaro1020/Calculadora-Resibos`

---

## 🔧 Herramientas Útiles

### Para Debugging

```javascript
// En browser console
app.data; // Ver estado actual
Calculator; // Ver módulo de cálculos
UI; // Ver módulo de UI
localStorage; // Ver datos guardados
```

### Para Testing de Cálculos

```javascript
const testData = {
  units: [{ id: "201", people: 2, rent: 500000 }],
  electricityA: { totalKwh: 100, totalPrice: 50000 },
};
const result = Calculator.calculateAllocations(testData);
console.log(result);
```

---

## 📚 Archivos de Documentación

| Archivo                    | Para Quién       | Contenido                   |
| -------------------------- | ---------------- | --------------------------- |
| **README.md**              | Todos            | Resumen y características   |
| **ESTRUCTURA_PROYECTO.md** | Desarrolladores  | Este archivo (arquitectura) |
| **GUIA_USUARIO.md**        | Usuarios finales | Cómo usar la app            |
| **DESARROLLO.md**          | Desarrolladores  | Tips avanzados              |

---

## ✅ Checklist para Mantener Código Limpio

- [ ] Código comentado (especialmente lógica compleja)
- [ ] Nombres de funciones descriptivos
- [ ] Una responsabilidad por función
- [ ] Sin funciones > 50 líneas (refactorizar)
- [ ] Commits con mensajes claros
- [ ] README actualizado con cambios

---

**Última actualización:** Febrero 2026  
**Versión:** 2.0 (con Modo Manual y Detalles)
