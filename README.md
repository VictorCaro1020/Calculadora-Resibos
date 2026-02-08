# ��� Calculadora de Recibos Domésticos

Una **aplicación web progresiva (PWA)** moderna, accesible y fácil de usar que distribuye automáticamente los gastos domésticos entre diferentes unidades.

**[��� Abrir Aplicación](https://victorcaro1020.github.io/Calculadora-Resibos/)** | **[��� Ver Documentación](./docs/)**

---

## ��� Estructura del Proyecto

```
Calculadora-Resibos/
│
├── README.md                       # Punto de entrada (este archivo)
├── .gitignore                      # Archivos ignorados por Git
│
├── ��� src/                         # CÓDIGO FUENTE
│   ├── index.html                  # HTML semántico
│   ├── style.css                   # CSS moderno
│   ├── app.js                      # Controlador principal
│   ├── manifest.json               # Configuración PWA
│   ├── service-worker.js           # Service Worker (offline)
│   └── ��� modules/                 # Módulos especializados
│       ├── i18n.js                 # Internacionalización
│       ├── storage.js              # Persistencia de datos
│       ├── calculator.js           # Lógica de cálculos
│       └── ui.js                   # Renderizado y eventos
│
└── ��� docs/                        # DOCUMENTACIÓN
    ├── README_NUEVO.md             # Resumen ejecutivo
    ├── GUIA_USUARIO.md             # Manual para usuarios
    ├── ESTRUCTURA_PROYECTO.md      # Arquitectura técnica
    └── DESARROLLO.md               # Guía para desarrolladores
```

---

## ⚡ Características Principales

✅ Distribución automática de gastos (luz, agua, gas, arriendo, aseo)  
✅ Modo Manual para editar valores  
✅ Detalles de Cálculos para verificar  
✅ Multiidioma (Español e Inglés)  
✅ Funciona Offline (PWA)  
✅ Responsivo (móvil, tablet, desktop)  
✅ Accesible (WCAG Level AA)  
✅ Exporta/Importa datos JSON  

---

## ��� Inicio Rápido

### En línea
```
https://victorcaro1020.github.io/Calculadora-Resibos/
```

### Localmente
```bash
git clone https://github.com/VictorCaro1020/Calculadora-Resibos.git
cd Calculadora-Resibos
python -m http.server 8000
# Abre http://localhost:8000/src/
```

---

## ��� Documentación Completa

| Documento | Audiencia | Contenido |
|-----------|-----------|----------|
| **[docs/README_NUEVO.md](docs/README_NUEVO.md)** | Todos | Resumen y características |
| **[docs/GUIA_USUARIO.md](docs/GUIA_USUARIO.md)** | Usuarios | Cómo usar la app |
| **[docs/ESTRUCTURA_PROYECTO.md](docs/ESTRUCTURA_PROYECTO.md)** | Devs | Arquitectura y módulos |
| **[docs/DESARROLLO.md](docs/DESARROLLO.md)** | Devs Senior | Debugging y nuevas features |

---

## ���️ Arquitectura (Resumen)

```
               app.js (Controlador)
                     │
    ┌────────────────┼────────────────┐
    ↓                ↓                ↓
STORAGE          CALCULATOR           UI
(Datos)          (Lógica)       (Interfaz)
                                  │
                                  + i18n
```

**Separación de responsabilidades** → código modular, testeable, escalable.

Ver [docs/ESTRUCTURA_PROYECTO.md](docs/ESTRUCTURA_PROYECTO.md) para detalles técnicos.

---

## ���️ Desarrollo

### Agregar una Feature
1. Lee [docs/ESTRUCTURA_PROYECTO.md](docs/ESTRUCTURA_PROYECTO.md)
2. Identifica el módulo correcto
3. Implementa y prueba
4. Commit y push

Para ejemplos detallados: [docs/DESARROLLO.md](docs/DESARROLLO.md)

---

## ��� Reportar Problemas

[Abre un Issue en GitHub](https://github.com/VictorCaro1020/Calculadora-Resibos/issues)

---

## ��� Contribuir

1. Fork del repositorio
2. Rama: `git checkout -b feature/mi-idea`
3. Commit: `git commit -m "Agregar feature X"`
4. Push: `git push origin feature/mi-idea`
5. Pull Request

---

## ��� Stack Teknológico

- HTML, CSS (Custom Properties), Vanilla JavaScript
- LocalStorage para persistencia
- Service Worker (offline)
- Custom i18n (Español/Inglés)
- WCAG Level AA accesible
- **Sin frameworks externos** (ligero y rápido)

---

## ��� PWA (Instalable)

✅ Funciona offline  
✅ Se instala como app nativa  
✅ Rápida y responsiva  

**Para instalar:** Menú ⋮ → "Instalar"

---

## ��� Licencia

Código abierto. Úsalo, modíficalo, comparte.

---

## ��� Enlaces

- **[App en línea](https://victorcaro1020.github.io/Calculadora-Resibos/)**
- **[GitHub](https://github.com/VictorCaro1020/Calculadora-Resibos)**
- **[Issues](https://github.com/VictorCaro1020/Calculadora-Resibos/issues)**

---

**v2.0 • Febrero 2026** • Refactorizado y documentado profesionalmente ✨
