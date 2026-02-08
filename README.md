# README.md - CALCULADORA DE RECIBOS DOMÉSTICOS (Versión Refactorizada)

## 📋 RESUMEN EJECUTIVO

Se ha realizado una **refactorización completa y profesional** de la Calculadora de Recibos Domésticos.
La aplicación pasó de ser un código monolítico a una **arquitectura modular, escalable y mantenible**,
con mejoras significativas en:

- ✅ **Estructura**: Separación clara de responsabilidades
- ✅ **Calidad de Código**: Modular, documentado y didáctico
- ✅ **UX/UI**: Interfaz moderna, intuitiva y accesible
- ✅ **Internacionalización**: Soporte para Español e Inglés
- ✅ **Performance**: Optimización y gestión eficiente
- ✅ **Accesibilidad**: WCAG compliant, navegación por teclado, etiquetas ARIA

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
proyecto/
├── index.html                      # HTML semántico, accesible y bien estructurado
├── style.css                       # CSS moderno con tokens de diseño y responsivo
├── app.js                          # Controlador principal (orquestador)
├── modules/
│   ├── i18n.js                    # Internacionalización (Español/Inglés)
│   ├── storage.js                 # Persistencia de datos en localStorage
│   ├── calculator.js              # Lógica de cálculo de distribución de gastos
│   └── ui.js                      # Renderizado y manejo de eventos DOM
└── README.md                       # Documentación del proyecto
```

**Cambio importante**: El archivo `app.js` antiguo se dividió en 5 módulos especializados.

---

## 🏗️ ARQUITECTURA

### Patrón: Separación de Responsabilidades

```
┌─────────────────────────────────────────────────────────────┐
│                      APP.JS (Controlador)                   │
│                  Orquesta los módulos                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ↓                     ↓                     ↓
   ┌─────────┐        ┌──────────────┐      ┌────────────┐
   │ Storage │        │ Calculator   │      │ UI         │
   │ (Datos) │        │ (Lógica)     │      │(Interfaz)  │
   └─────────┘        └──────────────┘      └────────────┘
        ↓
   ┌─────────┐
   │ i18n    │
   │(Idioma) │
   └─────────┘
```

### Cada módulo tiene responsabilidades claras:

1. **i18n.js** - Internacionalización
   - Gestiona traducciones (ES, EN)
   - Centraliza todos los textos visibles
   - Permite cambiar idioma sin tocar código de lógica

2. **storage.js** - Persistencia
   - Guarda/carga datos en localStorage
   - Maneja versionado de esquema (migraciones)
   - Validación mínima de datos
   - NO toca el DOM, NO contiene lógica de negocio

3. **calculator.js** - Lógica de Negocio
   - Calcula distribución de gastos
   - Algoritmos para electricidad, agua y gas
   - Completamente independiente del DOM
   - Testeable sin UI
   - Puede reutilizarse en API backend

4. **ui.js** - Presentación
   - Renderiza componentes (unidades, tabla, resumen)
   - Maneja eventos del usuario
   - Orquesta llamadas a otros módulos
   - NO contiene lógica de negocio compleja

5. **app.js** - Controlador Principal
   - Clase `UtilityCalculatorApp` que conecta todo
   - Escucha eventos y dispara acciones
   - Mantiene sincronización estado ↔ UI

---

## 🎯 MEJORAS REALIZADAS

### 1. ESTRUCTURA JAVASCRIPT

**Antes** (Código Monolítico):

```javascript
// Todo mezclado en un archivo
function renderUnits() {
  /* ... */
}
function computeAllocations() {
  /* ... */
}
function save(data) {
  /* ... */
}
// 575 líneas en un solo archivo
```

**Después** (Modular):

```javascript
// Cada módulo con responsabilidad clara
// modules/calculator.js - SOLO cálculos
// modules/storage.js - SOLO persistencia
// modules/ui.js - SOLO presentación
// app.js - SOLO orquestación
```

**Beneficios**:

- Código más legible y mantenible
- Fácil de testear
- Cambios aislados (modificar calculador sin tocar UI)
- Reutilizable en diferentes contextos

---

### 2. MEJORAS EN HTML

**Antes**:

- Estructura genérica sin semántica
- Pocas etiquetas ARIA
- IDs inconsistentes
- Labels desconectados de inputs

**Después**:

- HTML semántico (`<header>`, `<footer>`, `<section>`, `<main>`)
- Atributos ARIA para accesibilidad
- `aria-label` en todos los inputs y botones
- `role="region"` con `aria-live` para actualizaciones dinámicas
- `fieldset` y `legend` para checkboxes
- Skip link para accesibilidad

**Ejemplo**:

```html
<!-- Antes -->
<input id="ea-total-kwh" type="number" />

<!-- Después -->
<div class="form-group">
  <label for="ea-total-kwh" class="form-label">Total kWh</label>
  <input
    id="ea-total-kwh"
    type="number"
    min="0"
    step="0.01"
    aria-label="Total de kilovatios-hora del recibo A"
    class="form-input"
  />
</div>
```

---

### 3. MEJORAS EN CSS

**Antes**:

- Pocos tokens reutilizables
- Estilos repetidos
- No muy accesible (contraste, focus states)
- Responsive medio

**Después**:

- **CSS Custom Properties** (tokens de diseño)
- **Sistema de diseño coherente**
- **Mobile-first responsive**
- **Componentes reutilizables** (.btn, .form-input, .panel)
- **Accesibilidad**: contraste WCAG AA, focus visible, reduced-motion support
- **Modern CSS**: Grid, Flexbox, Gradientes

**Tokens de Diseño** (variables CSS):

```css
:root {
  /* Colores */
  --color-primary: #2b6cb0;
  --color-primary-dark: #1e4e7a;
  --color-danger: #ef4444;

  /* Espaciado */
  --space-md: 1rem; /* 16px */
  --space-lg: 1.5rem; /* 24px */

  /* Tipografía */
  --font-size-base: 1rem;
  --font-weight-semibold: 600;

  /* Sombras y radios */
  --shadow-md: 0 4px 6px...;
  --radius-lg: 8px;

  /* Transiciones */
  --transition-base: 200ms ease-in-out;
}
```

**Beneficios**:

- Cambio de tema centralizando variables
- Consistencia visual
- Fácil mantenimiento
- Responsivo desde móvil

---

### 4. MULTIIDIOMA (i18n)

**Soporte completo para Español e Inglés**:

```javascript
// Uso simple
i18n.t("appTitle"); // Retorna título en idioma actual
i18n.t("confirmDelete", { "%UNIT%": "101" }); // Con variables

// Cambiar idioma
i18n.setLanguage("en"); // Cambia a inglés

// Todas las claves documentadas
const translations = {
  es: {
    appTitle: "Calculadora de Recibos",
    alertUnitNameRequired: "Ingresa nombre de unidad",
    // ...
  },
  en: {
    appTitle: "Receipt Calculator",
    alertUnitNameRequired: "Enter unit name",
    // ...
  },
};
```

---

### 5. MEJORAS DE UX/UI

| Aspecto           | Antes    | Después                                  |
| ----------------- | -------- | ---------------------------------------- |
| **Header**        | Simple   | Gradiente moderno con selector de idioma |
| **Layout**        | Disperso | Organizado en secciones claras           |
| **Colores**       | Básicos  | Sistema de diseño coherente              |
| **Botones**       | Simples  | Con hover effects, estados               |
| **Tipografía**    | Genérica | Escala tipográfica coherente             |
| **Responsivo**    | Básico   | Mobile-first, optimizado                 |
| **Accesibilidad** | Mínima   | WCAG Level AA                            |
| **Feedback**      | Alerts   | Mensajes contextuales                    |

---

### 6. EJEMPLO DE FLUJO COMPLETO

**Usuario agrega unidad "103"** →

1. UI captura el evento en botón `#add-unit-btn`
2. `app.js` → `handleAddUnit()` es llamado
3. Se valida entrada
4. Se agrega a `this.data.units[]`
5. `Storage.save()` persiste en localStorage
6. `this.refresh()` redibuja:
   - Lista de unidades
   - Tabla de resultados
   - Resumen
7. **Resultado**: Todo sincronizado sin recargar página

**Ventaja**: Lógica centralizada, fácil de debuguear, testeable.

---

## 💡 CONCEPTOS EDUCATIVOS

### 1. Modularización

Dividir código en módulos pequeños y especializados.
**Beneficio**: Cada módulo puede entenderse, modificarse y testearse independientemente.

### 2. Separación de Responsabilidades

Cada función/módulo hace UNA cosa bien.
**Beneficio**: Código mantenible, cambios aislados.

### 3. Patrón MVC Ligero

- **Model** = Storage + Calculator (datos y lógica)
- **View** = UI (presentación)
- **Controller** = App (orquestación)

### 4. Tokens de Diseño

Variables CSS centralizadas para colores, espacios, tipografía.
**Beneficio**: Cambios globales con una línea de CSS.

### 5. Accesibilidad desde el Inicio

ARIA labels, focus states, navegación por teclado.
**Beneficio**: La app es usable por TODOS.

### 6. Internacionalización (i18n)

Traducción centralizada sin modificar código lógico.
**Beneficio**: Llegar a usuarios en diferentes idiomas.

---

## 🔧 CÓMO USAR

### Agregar Nueva Funcionalidad

**Ejemplo: Agregar soporte para SMS**

1. Crear `modules/sms.js`:

```javascript
const SMS = (() => {
  const sendSms = (number, message) => {
    // Implementar lógica SMS
  };
  return { sendSms };
})();
```

2. Integrar en `app.js`:

```javascript
handleExportAsSMS() {
  const data = JSON.stringify(this.data);
  SMS.sendSms(userPhone, data);
}
```

**Ventaja**: Cambio aislado, no afecta otros módulos.

---

### Cambiar Tema de Colores

En `style.css`, cambiar variables:

```css
:root {
  --color-primary: #your-color;
  --color-primary-dark: #darker-shade;
  /* Los cambios se aplican automáticamente */
}
```

---

### Agregar Nuevo Idioma

En `modules/i18n.js`:

```javascript
translations: {
  es: { /* ... */ },
  en: { /* ... */ },
  fr: {  // Nuevo idioma francés
    appTitle: 'Calculatrice de Reçus',
    // ... completar todas las claves
  }
}
```

---

## 📊 COMPARACIÓN ANTES vs DESPUÉS

### Tamaño del Código

- **Antes**: app.js = 575 líneas (todo junto)
- **Después**:
  - app.js = ~350 líneas (orquestador limpio)
  - modules/\*.js = ~1000 líneas (modularizado, documentado)
  - **Total**: Más líneas, pero MUCHO más mantenible

### Legibilidad

- **Antes**: Buscar función entre 575 líneas
- **Después**: Cada módulo es independiente, fácil de encontrar

### Testabilidad

- **Antes**: Difícil testear sin UI
- **Después**: `calculator.js` se puede testear sin DOM

### Mantenibilidad

- **Antes**: Cambio = riesgo de romper algo
- **Después**: Cambios aislados, más seguros

---

## 🎓 LECCIONES APRENDIDAS

### ✅ Lo que se hizo bien en el código original

- Funcionalidad completa y correcta
- Almacenamiento en localStorage
- Interfaz funcional
- Cálculos precisos

### ⚠️ Problemas identificados y solucionados

- ❌ **Monolítico** → ✅ **Modular**
- ❌ **Sin documentación** → ✅ **Comentarios educativos**
- ❌ **UX básica** → ✅ **UI moderna y accesible**
- ❌ **Sin multiidioma** → ✅ **i18n integrado**
- ❌ **Poco escalable** → ✅ **Arquitectura profesional**

---

## 📚 ARCHIVOS DOCUMENTADOS

Cada archivo tiene comentarios educativos explicando:

- QUÉ hace cada sección
- POR QUÉ se tomó esa decisión técnica
- CÓMO funciona el código
- DÓNDE extender/modificar

**Ejemplo de documentación**:

```javascript
/**
 * Calcula la distribución de agua dividida equitativamente
 * Precio = (total / totalPersonas) * personasUnidad
 *
 * LÓGICA:
 * 1. Obtiene precio total del recibo de agua
 * 2. Divide entre total de personas en el edificio
 * 3. Asigna a cada unidad: (personas * precio/persona)
 *
 * @param {object} water - Datos de agua
 * @param {array} units - Lista de unidades
 * @returns {object} Distribución por unidad
 */
const calculateWater = (water, units) => {
  /* ... */
};
```

---

## 🚀 PRÓXIMAS MEJORAS SUGERIDAS

1. **Backend API**
   - Guardar en servidor en lugar de localStorage
   - Reutilizar `calculator.js` en API Node.js

2. **Más Idiomas**
   - Agregar portugués, francés, alemán
   - Sistema i18n ya está listo

3. **PWA (Progressive Web App)**
   - Trabajar offline
   - Instalar como app

4. **Tests Automatizados**
   - Unit tests para `calculator.js`
   - Integration tests para flujos

5. **Dark Mode**
   - Agregar tema oscuro usando media query

6. **Gráficos**
   - Visualización de distribución con Chart.js

---

## 📞 SOPORTE Y DUDAS

Cada módulo está documentado con:

- Propósito claro
- Funciones públicas
- Ejemplos de uso
- Consideraciones técnicas

**Para aprender**: Lee los comentarios en los archivos.
Están diseñados para ser educativos.

---

## ✨ CONCLUSIÓN

Esta refactorización transforma un proyecto funcional pero desordenado
en una **aplicación web profesional, escalable y mantenible**,
siguiendo mejores prácticas modernas de desarrollo web.

El código ahora sirve como:

- ✅ Aplicación funcional para calcular recibos
- ✅ Material educativo para aprender arquitectura web
- ✅ Base para proyectos futuros
- ✅ Ejemplo de calidad de código profesional

**¡Usa esta como referencia para tus próximos proyectos!** 🚀
