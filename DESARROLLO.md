# 👨‍💻 Guía de Desarrollo

## Para desarrolladores que quieran mejorar o fortalecer el código.

---

## 🛠️ Configurar Entorno Local

### 1. Clonar repositorio

```bash
git clone https://github.com/VictorCaro1020/Calculadora-Resibos.git
cd Calculadora-Resibos
```

### 2. Abrir servidor local

```bash
# Python 3
python -m http.server 8000

# O Node.js
npx http-server
```

### 3. Acceder

```
http://localhost:8000
```

---

## 📝 Convenciones de Código

### Nombres de Variable

```javascript
// ❌ Evitar
let d = 500;
let calc = function (x) {};

// ✅ Correcto
let dailyRent = 500;
let calculateWaterPerPerson = (totalWater) => {};
```

### Comentarios

```javascript
/**
 * Descripción de qué hace
 * @param {type} name - Descripción del parámetro
 * @returns {type} Descripción del retorno
 */
const myFunction = (param1, param2) => {
  // Comentario de línea para lógica compleja
  return result;
};
```

### Formato

```javascript
// Usar arrow functions
const func = () => {};

// Usar const por defecto, let si cambia
const immutable = 100;
let mutableValue = 100;

// Destructuring
const { rent, people } = unit;
const [first, second] = array;
```

---

## 🎨 Agregar estilos nuevos

### 1. **Usar tokens de diseño**

```css
/* ✅ Correcto - Usa variables CSS */
.nuevo-elemento {
  background-color: var(--color-primary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  font-size: var(--font-size-base);
}

/* ❌ Evitar - Valores hardcodeados */
.elemento {
  background-color: #2b6cb0;
  padding: 16px;
  border-radius: 6px;
}
```

### 2. **Responsive design mobile-first**

```css
/* Base (mobile) */
.elemento {
  grid-template-columns: 1fr;
}

/* Desktop */
@media (min-width: 768px) {
  .elemento {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

### 3. **Accesibilidad**

```css
/* Asegurar contraste suficiente */
.elemento {
  color: var(--color-text); /* Dark text */
  background-color: var(--color-surface); /* Light bg */
}

/* Estados hover/focus visibles */
.elemento:hover {
  outline: 2px solid var(--color-primary);
}

.elemento:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

---

## 🧮 Agregar Nueva Lógica de Cálculo

### Ejemplo: Agregar "Mantenimiento"

**Paso 1:** Extender estructura de datos (storage.js)

```javascript
const getDefault = () => ({
  // ... campos existentes
  maintenance: {
    totalPrice: 0, // Nuevo campo
    notes: "",
  },
});
```

**Paso 2:** Agregar interfaz (index.html)

```html
<section class="panel" id="maintenance-section">
  <h2>Mantenimiento</h2>
  <div class="form-group">
    <label for="maintenance-price">Total</label>
    <input id="maintenance-price" type="number" min="0" step="0.01" />
  </div>
</section>
```

**Paso 3:** Implementar cálculo (modules/calculator.js)

```javascript
const calculateMaintenance = (maintenance, units) => {
  const result = {};
  const totalPrice = Number(maintenance.totalPrice) || 0;

  // Distribuir equitativamente entre todas las unidades
  const pricePerUnit = totalPrice / units.length;

  units.forEach((unit) => {
    result[unit.id] = pricePerUnit;
  });

  return { distribution: result };
};

// Agregar en calculateAllocations()
const maintenanceResult = calculateMaintenance(data.maintenance, data.units);
Object.keys(maintenanceResult.distribution).forEach((unitId) => {
  results[unitId].maintenance = maintenanceResult.distribution[unitId];
  results[unitId].total += results[unitId].maintenance;
});
```

**Paso 4:** Actualizar UI (modules/ui.js)

```javascript
// En renderResults()
html += `<th>Mantenimiento</th>`;
// ... en el loop
html += `<td>${i18n.t("currency")} ${formatCurrency(result.maintenance)}</td>`;

// En initializeInputsFromData()
const maintenanceInput = getElement("maintenance-price");
if (maintenanceInput)
  maintenanceInput.value = data.maintenance?.totalPrice || 0;
```

**Paso 5:** Capturar evento (app.js en handleInputChange)

```javascript
this.data.maintenance = {
  totalPrice: values.maintenance || 0,
};
```

**Paso 6:** Agregar traducción (modules/i18n.js)

```javascript
const translations = {
  es: {
    // ... existentes
    maintenance: "Mantenimiento",
  },
  en: {
    // ... existentes
    maintenance: "Maintenance",
  },
};
```

---

## 🐛 Debugging y Testing

### Usar DevTools del navegador

```javascript
// Abrir Console (F12) e ingresa:
app.data; // Ver estado actual
app.data.units; // Ver solo unidades
localStorage; // Ver datos guardados
JSON.stringify(app.data); // Ver JSON formateado
```

### Test manual de cálculos

```javascript
// En console:
const testData = {
  units: [
    { id: "201", people: 2, rent: 500000 },
    { id: "202", people: 3, rent: 400000 },
  ],
  electricityA: {
    totalKwh: 100,
    totalPrice: 50000,
    unit202: { currentReading: 130, previousReading: 100 },
  },
  water: { totalPrice: 100000 },
  gas: { group1: 50000, group2: 30000 },
};

const result = Calculator.calculateAllocations(testData);
console.table(result.results); // Ver tabla bonita
```

### Verificar que se guardó

```javascript
const saved = Storage.load();
console.log(saved === app.data); // Debe ser true
```

---

## 📦 Versionado y Commits

### Mensaje de commit claro

```bash
# ✅ Correcto
git commit -m "Agregar calculadora de mantenimiento"
git commit -m "Arreglar bug en distribución de agua cuando no hay personas"
git commit -m "Mejorar UX: agregar confirmación antes de borrar"

# ❌ Evitar
git commit -m "cambios"
git commit -m "fix"
git commit -m "asd"
```

### Versionado semántico

```
MAJOR.MINOR.PATCH
2.0.0  ← Cambio importante (nueva sección)
2.1.0  ← Nueva funcionalidad (Modo Manual)
2.1.1  ← Bug fix (Select de unidades)
```

---

## 🚀 Optimizaciones Posibles

### Performance

- [ ] Lazy loading de módulos
- [ ] Minificar CSS/JS en producción
- [ ] Caché HTTP headers
- [ ] Comprimir imágenes

### Funcionalidad

- [ ] Exportar a Excel
- [ ] Gráficos de gasto por tiempo
- [ ] Sincronización en cloud
- [ ] App nativa (Electron/Flutter)

### Accesibilidad

- [ ] Screen reader testing
- [ ] Navegación por teclado completa
- [ ] Modo alto contraste

---

## 🔄 Integración Continua (CI/CD)

### GitHub Actions (opcional)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: npm test # Si agregas tests
```

---

## 📚 Recursos Útiles

| Tema               | Recurso                                              |
| ------------------ | ---------------------------------------------------- |
| JavaScript moderno | [MDN Web Docs](https://developer.mozilla.org/es/)    |
| CSS Grid/Flexbox   | [CSS-Tricks](https://css-tricks.com/)                |
| PWA                | [Web.dev PWA](https://web.dev/progressive-web-apps/) |
| Accesibilidad      | [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/)         |
| Git workflow       | [Atlassian Git](https://www.atlassian.com/git)       |

---

## ✅ Checklist Antes de Deploy

- [ ] Código comentado
- [ ] Sin console.log() de debug
- [ ] Sin variables sin usar
- [ ] Funciones tienen un solo propósito
- [ ] Nombres descriptivos
- [ ] CSS organizado
- [ ] Responsive en mobile
- [ ] Accesible (Alt text, ARIA labels, etc.)
- [ ] Tested manualmente
- [ ] README actualizado
- [ ] Commit con mensaje claro
- [ ] Push a GitHub

---

## 🎯 Próximos Pasos Sugeridos

1. **Agregar tests unitarios** (Jest)
2. **Mejorar documentación** de APIs
3. **Agregar animaciones** sutiles (CSS transitions)
4. **Crear componentes reutilizables**
5. **Migrar a TypeScript** (para type safety)
6. **Integrar con backend** para respaldo en cloud

---

**Última actualización:** Febrero 2026
