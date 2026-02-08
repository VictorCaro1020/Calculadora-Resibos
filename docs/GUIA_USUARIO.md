# 📖 Guía del Usuario - Calculadora de Recibos

## ¿Qué es esta aplicación?

Es una **calculadora inteligente** que distribuye automáticamente los gastos de servicios domésticos (luz, agua, gas, arriendo y otros cargos) de forma **equitativa** entre diferentes apartamentos/unidades.

---

## 🚀 Inicio Rápido (5 minutos)

### 1. Abrir la aplicación

Ve a: **https://victorcaro1020.github.io/Calculadora-Resibos/**

### 2. Agregar Unidades

En la sección **"Unidades"**:

- Ingresa el nombre (ej: 201, 202, 401, etc.)
- Número de personas que viven ahí
- Monto de arriendo (opcional)
- Click en "+ Agregar Unidad"

**Ejemplo:**

```
Unidad: 201  |  Personas: 3  |  Arriendo: 500000  |  [Agregar]
Unidad: 202  |  Personas: 2  |  Arriendo: 400000  |  [Agregar]
```

### 3. Ingresar Gastos

En cada sección (Electricidad, Agua, Gas, etc.):

- Lee tu recibo
- Ingresa los valores
- La app calcula automáticamente

**Ejemplo - Electricidad A:**

```
Total kWh:      150
Precio total:   45.000
Lectura 202 (anterior): 100
Lectura 202 (actual):   130
Aseo:           5.000
```

### 4. Ver Resultados

Baja la página y ves:

- **Tabla de distribución**: Gasto por unidad
- **Modo Manual**: Edita si algo no coincide
- **Detalles**: Ver cómo se calculó cada cosa

### 5. Descargar Recibo

Selecciona una unidad y click en **"Descargar Recibo (PNG)"**

---

## 📊 Secciones de la App

### 🏠 **Unidades**

Aquí defines cuántas personas viven en cada apartamento y el arriendo.

**Por qué importa:** El agua y el gas se distribuyen por **cantidad de personas**.

---

### 💡 **Electricidad A (201-202)**

Recibo individual para estos dos apartamentos.

**Cómo funciona:**

- Si el apto 202 tiene medidor individual → ingresa sus lecturas
- El consumo del 201 se calcula: `Total - 202`
- Se multiplica por precio/kWh

---

### 💡 **Electricidad B (401-500)**

Recibo individual para estos apartamentos.

**Cómo funciona:** Igual que A, pero para otro grupo.

---

### 💧 **Agua**

Un recibo total para todos.

**Cómo funciona:**

```
Precio por persona = Total / Total de personas
Pago = Precio per cápita × Personas en la unidad
```

---

### 🔥 **Gas**

Dos recibos independientes (un grupo).

**Cómo funciona:** Igual que agua, pero agrupado.

---

### ➕ **Cargos Adicionales**

Deudas, parqueadero, mantenimiento, etc.

**Ejemplo:**

```
Deuda anterior:  100.000  →  Asignar a: 201
Reparación:      50.000   →  Asignar a: 202
```

---

### 📊 **Distribución de Gastos**

Tabla resumen con TODO (arriendo, luz, agua, gas, aseo, extras).

**Úsalo para:**

- Verificar los cálculos
- Ver qué paga cada unidad
- Comparar con recibos reales

---

### 🔧 **Modo Manual - Editar Valores**

Si algún cálculo no coincide con tu recibo.

**Ejemplo:**

- La app dice que 201 debe pagar $32.000 de luz
- Tu recibo dice $35.000
- Edita manualmente a $35.000
- Automáticamente se ajusta todo

---

### 📊 **Detalles de Cálculos**

Ver exactamente cómo se distribuyó cada gasto.

**Muestra:**

- ⚡ Electricidad: kWh por unidad, precio/kWh
- 💧 Agua: precio por persona
- 🔥 Gas: valor por cabeza en cada grupo

---

### 📋 **Resumen por Unidad**

Desglose completo de una unidad.

**Cómo usarlo:**

1. Selecciona la unidad (dropdown)
2. Selecciona el mes
3. Ve el detalle completo
4. Click "Descargar Recibo" para una imagen PNG

---

### 💾 **Gestión de Datos**

#### Exportar (Backup)

- Click en "Exportar Datos (JSON)"
- Se descarga un archivo con todos tus datos
- **Guárdalo en un lugar seguro**

#### Importar (Restaurar)

- Click en "Importar Datos (JSON)"
- Selecciona un archivo descargado antes
- Tus datos se restauran

#### Borrar Todo

- **⚠️ CUIDADO:** Esto borra TODOS los datos
- No se puede deshacer
- Úsalo solo si quieres empezar de cero

---

## 💡 Tips y Trucos

### 📱 Usar en el teléfono/tablet

- La app se adapta automáticamente
- Puedes **instalarla como app nativa**
- Funciona **sin internet** (offline)

### 🌙 Cambiar tema (claro/oscuro)

- Click en el icono ☀️/🌙 arriba a la derecha

### 🌍 Cambiar idioma

- Dropdown arriba a la izquierda
- Soporta Español e Inglés

### 📊 Verificar cálculos

1. Ve a "Detalles de Cálculos"
2. Verifica kWh, personas, etc.
3. Si está bien, los resultados son correctos

### 👨‍💻 Editar manualmente

1. Ve a "Modo Manual"
2. Edita los valores que quieras
3. Se actualiza automáticamente

---

## ❓ Preguntas Frecuentes

**P: ¿Dónde se guardan mis datos?**
R: En tu navegador (localStorage). Si limpias el caché, **se borran**.  
**Solución:** Exporta regularmente como backup.

**P: ¿Funciona sin internet?**
R: ✅ Sí. Una vez cargada, funciona offline.

**P: ¿Puedo usar en múltiples dispositivos?**
R: Sí, con Exportar/Importar. Exporta en PC, descarga el JSON, luego cárgalo en el teléfono.

**P: ¿Es seguro ingresar números grandes (millones)?**
R: ✅ Sí, maneja cualquier cantidad sin problemas.

**P: ¿Cómo calcula si hay medidores mixtos?**
R: Si tienes medidores individuales en algunos aptos, ingresa las lecturas. Los demás se calculan automáticamente.

**P: ¿Y si cometo un error?**
R: Usa "Modo Manual" para editar el valor problemático. O exporta un backup anterior y reimporta.

---

## 🎯 Flujo Típico (Paso a Paso)

```
1. Abrir app
   ↓
2. Agregar 4 unidades (201, 202, 401, 402)
   ↓
3. Ingresa datos de 4 recibos (luz A, luz B, agua, gas)
   ↓
4. App calcula automáticamente
   ↓
5. Verificas en "Detalles de Cálculos"
   ↓
6. Si hay discrepancias, editas en "Modo Manual"
   ↓
7. Descargas recibo PNG para cada unidad
   ↓
8. Exportas datos como backup
```

---

## 🚨 Errores Comunes

| Error                    | Causa                    | Solución                    |
| ------------------------ | ------------------------ | --------------------------- |
| "404 al instalar"        | Caché viejo              | Limpia caché (Ctrl+Shift+R) |
| No se guardan datos      | localStorage desactivado | Habilita en navegador       |
| Números sin formato      | Caché viejo              | Recarga página              |
| Select de unidades vacío | Bug                      | Agrega una unidad primero   |

---

## 📞 Soporte

- **Código fuente:** https://github.com/VictorCaro1020/Calculadora-Resibos
- **Reportar bug:** Abre un Issue en GitHub
- **Sugerencias:** Forks o Pull Requests bienvenidos

---

**Última actualización:** Febrero 2026  
**Versión:** 2.0
