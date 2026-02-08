# 🧮 Calculadora de Recibos Domésticos

Una **aplicación web progresiva (PWA)** que distribuye automáticamente y de forma equitativa los gastos de servicios domésticos entre diferentes unidades/apartamentos.

---

## ⚡ Características

✅ Calcula distribución automática de:

- 💡 Electricidad (2 recibos independientes)
- 💧 Agua (por cantidad de personas)
- 🔥 Gas (por grupos)
- 🏠 Arriendo
- 🧹 Aseo
- ➕ Cargos adicionales (deudas, parqueadero, etc.)

✅ **Modo Manual** para editar valores si hay discrepancias  
✅ **Detalles de Cálculos** para verificar el breakdown  
✅ **Descarga PDF** con recibo personalizado  
✅ **Exporta/Importa** datos como JSON  
✅ **Multiidioma**: Español e Inglés  
✅ **Funciona offline** (PWA)  
✅ **Responsive**: Mobile, tablet, desktop  
✅ **Accesible**: WCAG Level AA

---

## 🚀 Acceso Rápido

**App en línea:** https://victorcaro1020.github.io/Calculadora-Resibos/

**Repositorio:** https://github.com/VictorCaro1020/Calculadora-Resibos

---

## 📚 Documentación

| Documento                                            | Para               | Contenido                         |
| ---------------------------------------------------- | ------------------ | --------------------------------- |
| **[GUIA_USUARIO.md](GUIA_USUARIO.md)**               | 👥 Usuarios        | Cómo usar la app (paso a paso)    |
| **[ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md)** | 👨‍💻 Desarrolladores | Arquitectura y módulos            |
| **[DESARROLLO.md](DESARROLLO.md)**                   | 👨‍💻 Devs avanzados  | Tips, aggegar features, debugging |

---

## 📁 Estructura

```
Calculadora-Resibos/
├── index.html                  # HTML semántico
├── style.css                   # CSS con tokens de diseño
├── app.js                      # Controlador (orquestador)
├── manifest.json               # Configuración PWA
├── service-worker.js           # Funcionalidad offline
└── modules/                    # Lógica separada en módulos
    ├── calculator.js           # Cálculos de distribución
    ├── storage.js              # Persistencia de datos
    ├── ui.js                   # Renderizado y eventos
    └── i18n.js                 # Internacionalización
```

---

## 🎯 Inicio Rápido (3 pasos)

### 1. Agregar Unidades

Ve a la sección **"Unidades"** e ingresa cada apartamento:

```
Unidad: 201 | Personas: 3 | Arriendo: 500.000 | [+ Agregar]
Unidad: 202 | Personas: 2 | Arriendo: 400.000 | [+ Agregar]
```

### 2. Ingresar Gastos

En cada sección (Luz, Agua, Gas), copia los datos de tu recibo.

### 3. Ver Resultados

La app calcula automáticamente. Verás:

- Tabla de distribución
- Modo manual para editar
- Detalles de cómo se calculó

---

## 🏗️ Arquitectura (Resumen)

```
          APP.JS (Controlador)
              │
    ┌─────────┼─────────────────┐
    ↓         ↓                 ↓
STORAGE   CALCULATOR           UI
(Datos)   (Lógica)      (Presentación)

                      i18n
                   (Idiomas)
```

**Cada módulo tiene una responsabilidad clara** → código mantenible y testeable.

Ver [ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md) para detalles.

---

## 💡 Nuevas Funcionalidades (v2.0)

### 🔧 Modo Manual

Edita directamente los valores si algo no coincide con tu recibo.

**Ubicación:** Sección "Modo Manual - Editar Valores"

### 📊 Detalles de Cálculos

Ve exactamente cómo se distribuyó:

- kWh por unidad en electricidad
- Precio por persona en agua
- Valor por cabeza en gas

**Ubicación:** Sección "Detalles de Cálculos"

### ✅ Select de Unidades Arreglado

El selector de unidades ahora se llena correctamente.

---

## 🛠️ Desarrollo Local

```bash
# Clonar
git clone https://github.com/VictorCaro1020/Calculadora-Resibos.git

# Servidor local (Python)
python -m http.server 8000

# Acceder
http://localhost:8000
```

Ver [DESARROLLO.md](DESARROLLO.md) para debugging y agregar features.

---

## 🔐 Datos y Privacidad

- ✅ Los datos se guardan **localmente en tu navegador**
- ✅ No se envía nada a servidores externos
- ✅ Función "Exportar" para hacer backup
- ✅ Función "Importar" para restaurar desde backup

**Si limpias caché del navegador, se borran los datos.**

---

## 🌍 Idiomas Soportados

- 🇪🇸 Español
- 🇺🇸 Inglés

Cambiar idioma con el dropdown en la esquina superior.

---

## 📱 Usar en Móvil

La app se adapta a cualquier tamaño de pantalla.

**Instalar como app nativa:**

1. Abre en tu navegador
2. Click en el menú (⋮)
3. "Instalar" o "Agregar a pantalla de inicio"

Funciona offline una vez instalada.

---

## ❓ FAQ

**P: ¿Donde se guardan los datos?**  
R: En localStorage del navegador. Nada se envía a servidores.

**P: ¿Funciona sin internet?**  
R: Sí, es una PWA. Una vez cargada, funciona offline.

**P: ¿Puedo usar en múltiples dispositivos?**  
R: Sí. Usa "Exportar/Importar" para llevar datos entre dispositivos.

**P: ¿Cómo se calcula el agua?**  
R: `Precio por persona = Total / Total de personas`  
`Pago unidad = Precio por persona × Personas en unidad`

**P: ¿Y si hay medidores individuales?**  
R: Ingresa las lecturas en Electricidad. El resto se calcula automáticamente.

Ver [GUIA_USUARIO.md](GUIA_USUARIO.md) para más preguntas.

---

## 🐛 Reportar Problemas

¿Encontraste un bug?

1. Ve a: https://github.com/VictorCaro1020/Calculadora-Resibos/issues
2. Click "New Issue"
3. Describe el problema
4. Adjunta screenshot si es posible

---

## 🤝 Contribuir

¿Ideas para mejorar?

1. Haz un **Fork** del repositorio
2. Crea una rama (`git checkout -b feature/mi-idea`)
3. Haz cambios
4. Commit (`git commit -m "Agregar feature X"`)
5. Push (`git push origin feature/mi-idea`)
6. Abre un **Pull Request**

Ver [DESARROLLO.md](DESARROLLO.md) para convenciones de código.

---

## 📄 Licencia

Proyecto de código abierto. Úsalo, modíficalo, comparte.

---

## 📞 Contacto

- **GitHub:** https://github.com/VictorCaro1020
- **App:** https://victorcaro1020.github.io/Calculadora-Resibos/

---

## 📈 Histórico de Versiones

| v   | Cambios                                                |
| --- | ------------------------------------------------------ |
| 2.0 | + Modo Manual, Detalles de Cálculos, Arreglo de select |
| 1.5 | + Formato de moneda con puntos y comas                 |
| 1.0 | Refactorización a arquitectura modular                 |

---

**Última actualización:** Febrero 2026  
**Próximo:** Agregar exportación a Excel, gráficos, sincronización cloud
