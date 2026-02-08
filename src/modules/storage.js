/**
 * módulo storage.js - Gestión de almacenamiento persistente
 * ============================================================
 * 
 * Centraliza toda la lógica de guardado/carga de datos en localStorage.
 * Beneficios:
 * - Fácil de cambiar a IndexedDB o una API backend sin afectar el resto del código
 * - Validación centralizada de datos
 * - Versionado de esquema de datos
 */

const Storage = (() => {
  // Constante de versión para controlar migraciones futuras
  const STORAGE_KEY = 'utilityCalcData_v2';
  const SCHEMA_VERSION = 2;

  /**
   * Esquema por defecto (estructura inicial de datos)
   * Se documenta aquí para que sea fácil entender qué datos guarda la app
   */
  const defaultSchema = {
    schemaVersion: SCHEMA_VERSION,
    
    // Array de unidades/apartamentos
    units: [
      { id: '101', people: 1, rent: 0 },
      { id: '201', people: 1, rent: 0 },
      { id: '202', people: 1, rent: 0 },
      { id: '300', people: 1, rent: 0 },
      { id: '401', people: 1, rent: 0 },
      { id: '402', people: 1, rent: 0 },
      { id: '500', people: 1, rent: 0 }
    ],
    
    // Electricidad - Recibo A (cubre unidades 201 y 202)
    // El campo 'consumption' se calcula como: curr - prev
    electricityA: {
      totalKwh: 0,      // Total de kWh en el recibo
      totalPrice: 0,    // Precio total del recibo
      unit202: {
        previousReading: 0,
        currentReading: 0
      }
    },
    
    // Electricidad - Recibo B (cubre unidades 401, 402 y 500)
    electricityB: {
      totalKwh: 0,
      totalPrice: 0,
      unit401: {
        previousReading: 0,
        currentReading: 0
      },
      unit500: {
        previousReading: 0,
        currentReading: 0
      }
    },
    
    // Cargos de aseo por recibo
    cleaningFees: {
      receiptA: 0,  // Se divide entre ocupantes de recibo A
      receiptB: 0   // Se divide entre ocupantes de recibo B
    },
    
    // Agua - se divide por persona
    water: {
      totalPrice: 0
    },
    
    // Gas - dos recibos independientes
    gas: {
      group1: 0,  // Unidades 201 + 202
      group2: 0   // Unidades 401 + 402
    },
    
    // Cargos adicionales (deuda, parqueadero, etc.) asignados a unidades específicas
    extras: [],

    // Modo Manual - ediciones personalizadas de valores
    manualOverrides: {},  // { "unitId.field": value }
    manualModeActive: false  // Si el modo manual está activado
  };

  /**
   * Guarda los datos en localStorage
   * @param {object} data - Objeto de datos a guardar
   * @returns {boolean} true si se guardó exitosamente
   */
  const save = (data) => {
    try {
      const dataToStore = {
        schemaVersion: SCHEMA_VERSION,
        ...data
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
      return true;
    } catch (error) {
      console.error('Error guardando datos:', error);
      return false;
    }
  };

  /**
   * Carga los datos desde localStorage
   * @returns {object|null} Datos cargados o null si no existen
   */
  const load = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Valida compatibilidad de versión y migra si es necesario
      if (data.schemaVersion < SCHEMA_VERSION) {
        console.warn('Esquema desactualizado, migrando...');
        return migrateSchema(data);
      }
      
      return data;
    } catch (error) {
      console.error('Error cargando datos:', error);
      return null;
    }
  };

  /**
   * Maneja migraciones de esquema entre versiones
   * Permite cambiar estructura de datos sin perder información
   * @param {object} oldData - Datos con esquema antiguo
   * @returns {object} Datos con esquema nuevo
   */
  const migrateSchema = (oldData) => {
    // Ejemplo: si hay cambios en la estructura, convertir aquí
    // Esto permite actualizar la app sin que usuarios pierdan datos
    
    if (oldData.schemaVersion === 1) {
      // Migración de v1 a v2: cambiar nombres de campos antigüos
      // Mapea propiedades del esquema antiguo al nuevo
      return {
        schemaVersion: SCHEMA_VERSION,
        units: oldData.units || defaultSchema.units,
        electricityA: oldData.ea ? {
          totalKwh: oldData.ea.totalKwh,
          totalPrice: oldData.ea.totalPrice,
          unit202: {
            previousReading: oldData.ea.prev202,
            currentReading: oldData.ea.curr202
          }
        } : defaultSchema.electricityA,
        electricityB: oldData.eb ? {
          totalKwh: oldData.eb.totalKwh,
          totalPrice: oldData.eb.totalPrice,
          unit401: {
            previousReading: oldData.eb.prev401,
            currentReading: oldData.eb.curr401
          },
          unit500: {
            previousReading: oldData.eb.prev500,
            currentReading: oldData.eb.curr500
          }
        } : defaultSchema.electricityB,
        cleaningFees: {
          receiptA: oldData.ea_aseo || 0,
          receiptB: oldData.eb_aseo || 0
        },
        water: oldData.water || defaultSchema.water,
        gas: {
          group1: oldData.gas?.price201_202 || 0,
          group2: oldData.gas?.price401_402 || 0
        },
        extras: oldData.extras || []
      };
    }
    
    return oldData;
  };

  /**
   * Obtiene el esquema por defecto completo
   * @returns {object} Copia profunda del esquema por defecto
   */
  const getDefault = () => {
    return JSON.parse(JSON.stringify(defaultSchema));
  };

  /**
   * Borra completamente los datos guardados
   * @returns {boolean} true si se borró exitosamente
   */
  const clear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error borrando datos:', error);
      return false;
    }
  };

  /**
   * Exporta datos como JSON (para descargar)
   * @param {object} data - Datos a exportar
   * @returns {string} JSON stringificado
   */
  const exportJSON = (data) => {
    return JSON.stringify(data, null, 2);
  };

  /**
   * Importa datos desde JSON
   * @param {string} jsonString - String JSON válido
   * @returns {object|null} Datos parseados o null si error
   */
  const importJSON = (jsonString) => {
    try {
      const data = JSON.parse(jsonString);
      
      // Validación mínima
      if (!data.units || !Array.isArray(data.units)) {
        throw new Error('Estructura de datos inválida');
      }
      
      return data;
    } catch (error) {
      console.error('Error importando JSON:', error);
      return null;
    }
  };

  // API pública (pattern de módulo revelador)
  return {
    save,
    load,
    getDefault,
    clear,
    exportJSON,
    importJSON
  };
})();

// Exporta para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
