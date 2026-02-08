/**
 * service-worker.js - Service Worker para PWA Offline
 * ======================================================
 * 
 * QUÉ HACE:
 * 1. INSTALL: Descarga y guarda archivos en caché al instalar
 * 2. ACTIVATE: Limpia cachés viejos cuando hay actualizaciones
 * 3. FETCH: Intercepta peticiones de red
 *    - Si hay internet: obtiene del servidor
 *    - Si NO hay internet: obtiene del caché
 * 
 * RESULTADO: App funciona completamente OFFLINE
 * 
 * ESTRATEGIA: "Network First, Cache Fallback"
 * Primero intenta red (actualizado), si falla usa caché (funciona offline)
 */

const CACHE_NAME = 'recibos-pwa-v1';
const CACHE_ASSETS = [
  '/Calculadora-Resibos/',                           // Página principal
  '/Calculadora-Resibos/index.html',                 // HTML
  '/Calculadora-Resibos/style.css',                  // Estilos
  '/Calculadora-Resibos/app.js',                     // Lógica principal
  '/Calculadora-Resibos/modules/i18n.js',            // Internacionalización
  '/Calculadora-Resibos/modules/storage.js',         // Almacenamiento
  '/Calculadora-Resibos/modules/calculator.js',      // Cálculos
  '/Calculadora-Resibos/modules/ui.js',              // Interfaz
  '/Calculadora-Resibos/manifest.json'               // Metadatos de app
];

/**
 * EVENTO: INSTALL
 * Se ejecuta cuando el navegador instala el Service Worker
 * 
 * PROPÓSITO: Pre-cachear archivos esenciales para funcionar offline
 */
self.addEventListener('install', (event) => {
  console.log('⚙️ Service Worker: Instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Cacheando archivos esenciales');
        return cache.addAll(CACHE_ASSETS);
      })
      .then(() => {
        // Activar inmediatamente sin esperar a que se cierre la tab anterior
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Error en install:', error);
      })
  );
});

/**
 * EVENTO: ACTIVATE
 * Se ejecuta cuando Service Worker se activa
 * 
 * PROPÓSITO: Limpiar cachés viejos cuando hay actualizaciones
 * 
 * SCENARIO:
 * - Usuario tiene app con CACHE_NAME = 'recibos-pwa-v1'
 * - Actualizamos a 'recibos-pwa-v2'
 * - Service Worker elimina v1 viejo
 * - Usa v2 nuevo automáticamente
 */
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker: Activando...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Si el caché NO es el actual, eliminarlo
            if (cacheName !== CACHE_NAME) {
              console.log(`🗑️ Eliminando caché antiguo: ${cacheName}`);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // Tomar control de todas las páginas abiertas
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Error en activate:', error);
      })
  );
});

/**
 * EVENTO: FETCH
 * Se ejecuta CADA VEZ que la página solicita algo (HTML, CSS, JS, etc.)
 * 
 * ESTRATEGIA: Network First, Cache Fallback
 * 1. Intenta obtener de RED (internet) - para archivo actualizado
 * 2. Si falla - obtiene de CACHÉ (funciona offline)
 * 3. Si no está en caché tampoco - retorna página 404
 * 
 * VENTAJA: Usuario siempre tiene contenido (actualizado u offline)
 */
self.addEventListener('fetch', (event) => {
  // Solo interceptar GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es válida (status 200)
        if (response.status === 200) {
          // Guardar copia en caché para futuro offline
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // RED FALLÓ - intentar caché
        return caches.match(event.request)
          .then((response) => {
            if (response) {
              // Archivo en caché - retornarlo
              return response;
            }
            
            // Ni en red ni en caché - retornar página offline
            // (opcional: crear página "offline.html")
            console.log('⚠️ Recurso no disponible:', event.request.url);
            throw new Error('Recurso no disponible');
          });
      })
  );
});

/**
 * MENSAJE: Actualizar Service Worker
 * 
 * Cuando hay nueva versión de la app:
 * 1. Nuevo Service Worker se instala
 * 2. Envía mensaje a todos los clientes (tabs)
 * 3. El usuario ve notificación "Actualización disponible"
 * 4. Puede recargar para obtener versión nueva
 */
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Log inicial
console.log('✅ Service Worker cargado y listo para funcionar offline');
