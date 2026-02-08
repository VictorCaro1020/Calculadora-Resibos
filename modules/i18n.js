/**
 * módulo i18n.js - Gestión de internacionalización (multiidioma)
 * ============================================================
 * 
 * Este módulo centraliza toda la traducción de la aplicación.
 * Permite cambiar entre idiomas sin modificar HTML ni lógica.
 * 
 * Patrón: Objeto con estructura { idioma: { clave: valor } }
 * Ventaja: Fácil de expandir, mantener y buscar textos.
 */

const i18n = {
  // Idioma activo actual
  currentLanguage: 'es',

  // Diccionario de traducciones
  translations: {
    es: {
      // Títulos principales
      appTitle: 'Calculadora de Recibos — Luz, Agua y Gas',
      appSubtitle: 'Distribuye gastos domésticos entre unidades de manera equitativa',
      
      // Secciones
      unitsSection: 'Unidades y Habitantes',
      electricityASection: 'Electricidad A (201 / 202)',
      electricityBSection: 'Electricidad B (401, 500 y 402)',
      waterSection: 'Agua',
      gasSection: 'Gas',
      extrasSection: 'Cargos Adicionales',
      summarySection: 'Resumen por Unidad',
      
      // Descripciones
      unitsDescription: 'Agrega o edita cada unidad. Puedes indicar cuántas personas y el arriendo mensual por unidad.',
      extrasDescription: 'Agrega cargos por unidad. Cada cargo debe asignarse a una unidad específica (deuda, parqueadero, etc.).',
      
      // Labels generales
      unitName: 'Nombre unidad',
      unitNamePlaceholder: 'ej. 101',
      people: 'Personas',
      rent: 'Arriendo',
      amount: 'Monto',
      addUnit: 'Agregar unidad',
      removeUnit: 'Eliminar',
      selectUnit: 'Seleccionar unidad',
      
      // Electricidad
      totalKwh: 'Total kWh',
      totalPrice: 'Precio total',
      previousReading: 'Lectura anterior',
      currentReading: 'Lectura actual',
      cleaning: 'Aseo',
      cleaningPlaceholder: 'Monto aseo',
      
      // Agua
      waterTotal: 'Total factura agua',
      
      // Gas
      gasPriceGroup1: 'Total factura gas (201+202)',
      gasPriceGroup2: 'Total factura gas (401+402)',
      
      // Extras
      extraName: 'Nombre extra',
      extraNamePlaceholder: 'ej. Parqueadero',
      addExtra: 'Agregar extra',
      removeExtra: 'Eliminar',
      
      // Resumen
      month: 'Mes facturado',
      includeElectricity: 'Luz',
      includeWater: 'Agua',
      includeGas: 'Gas',
      includeExtras: 'Cargos adicionales',
      includeRent: 'Arriendo',
      includeCleaning: 'Aseo',
      generateReceiptImage: 'Generar imagen (PNG)',
      
      // Encabezados tabla
      unit: 'Unidad',
      electricity: 'Luz',
      water: 'Agua',
      gas: 'Gas',
      aseo: 'Aseo',
      total: 'Total',
      
      // Acciones
      resetAllData: 'Borrar todos los datos guardados',
      exportData: 'Exportar datos (JSON)',
      importData: 'Importar datos (JSON)',
      
      // Mensajes
      confirmDeleteUnit: '¿Eliminar la unidad %UNIT%? Esta acción quitará también sus cargos adicionales.',
      confirmDeleteExtra: '¿Eliminar el cargo "%EXTRA%" (%AMOUNT%) de la unidad %UNIT%?',
      confirmDeleteAll: '¿Borrar todos los datos guardados?',
      alertUnitNameRequired: 'Ingresa nombre de unidad',
      alertExtraNameRequired: 'Nombre del cargo requerido',
      alertUnitRequired: 'Selecciona una unidad para asignar el cargo',
      alertInvalidFormat: 'Formato inválido',
      alertImportSuccess: 'Datos importados correctamente',
      alertImportError: 'Error al importar: %ERROR%',
      alertLibraryNotLoaded: 'La librería html2canvas no está cargada.',
      alertGenerateError: 'Error al generar imagen.',
      alertUnitNotFound: 'Unidad no encontrada',
      alertSelectUnit: 'Selecciona la unidad primero',
      
      // Recibo
      receipt: 'Recibo',
      people: 'Personas',
      month: 'Mes',
      generatedAt: 'Generado',
      noUnitsRegistered: 'No hay unidades registradas.',
      noUnitSelected: 'Selecciona una unidad válida.',
      detailsNotAvailable: 'Detalle de pago no disponible para mostrar la imagen.',
      generatingImage: 'Generando imagen...',
      
      // Almacenamiento
      storageFooter: 'Guardado localmente en tu navegador. Si quieres compartir o usar entre dispositivos, exporta el JSON y luego impórtalo.',
      
      // Tabla de cálculos
      debugTitle: 'Ver cálculos detallados (debug)',
      pricePerKwhReceiptA: 'Precio kWh (recibo A)',
      pricePerKwhReceiptB: 'Precio kWh (recibo B)',
      consumption202: 'Consumo 202',
      consumption201: 'Consumo 201',
      consumption401: 'Consumo 401',
      consumption500: 'Consumo 500',
      consumption402: 'Consumo 402',
      pricePerHead: 'Precio por persona (agua)',
      gasPricePerHeadGroupA: 'Precio gas (201+202) por cabeza',
      gasPricePerHeadGroupB: 'Precio gas (401+402) por cabeza',
      
      // Validación
      kwh: 'kWh',
      price: 'Precio',
      currency: '$'
    },
    en: {
      appTitle: 'Receipt Calculator — Electricity, Water & Gas',
      appSubtitle: 'Distribute household expenses fairly among units',
      
      unitsSection: 'Units and Residents',
      electricityASection: 'Electricity A (201 / 202)',
      electricityBSection: 'Electricity B (401, 500 and 402)',
      waterSection: 'Water',
      gasSection: 'Gas',
      extrasSection: 'Additional Charges',
      summarySection: 'Unit Summary',
      
      unitsDescription: 'Add or edit each unit. Specify number of residents and monthly rent.',
      extrasDescription: 'Add charges per unit. Assign each charge to a specific unit (debt, parking, etc.).',
      
      unitName: 'Unit name',
      unitNamePlaceholder: 'e.g. 101',
      people: 'People',
      rent: 'Rent',
      amount: 'Amount',
      addUnit: 'Add Unit',
      removeUnit: 'Delete',
      selectUnit: 'Select unit',
      
      totalKwh: 'Total kWh',
      totalPrice: 'Total price',
      previousReading: 'Previous reading',
      currentReading: 'Current reading',
      cleaning: 'Cleaning',
      cleaningPlaceholder: 'Cleaning amount',
      
      waterTotal: 'Total water bill',
      
      gasPriceGroup1: 'Total gas bill (201+202)',
      gasPriceGroup2: 'Total gas bill (401+402)',
      
      extraName: 'Charge name',
      extraNamePlaceholder: 'e.g. Parking',
      addExtra: 'Add Charge',
      removeExtra: 'Delete',
      
      month: 'Billing month',
      includeElectricity: 'Electricity',
      includeWater: 'Water',
      includeGas: 'Gas',
      includeExtras: 'Additional charges',
      includeRent: 'Rent',
      includeCleaning: 'Cleaning',
      generateReceiptImage: 'Generate image (PNG)',
      
      unit: 'Unit',
      electricity: 'Electricity',
      water: 'Water',
      gas: 'Gas',
      aseo: 'Cleaning',
      total: 'Total',
      
      resetAllData: 'Delete all saved data',
      exportData: 'Export data (JSON)',
      importData: 'Import data (JSON)',
      
      confirmDeleteUnit: 'Delete unit %UNIT%? This will also remove its charges.',
      confirmDeleteExtra: 'Delete charge "%EXTRA%" (%AMOUNT%) from unit %UNIT%?',
      confirmDeleteAll: 'Delete all saved data?',
      alertUnitNameRequired: 'Enter unit name',
      alertExtraNameRequired: 'Charge name required',
      alertUnitRequired: 'Select a unit to assign the charge',
      alertInvalidFormat: 'Invalid format',
      alertImportSuccess: 'Data imported successfully',
      alertImportError: 'Import error: %ERROR%',
      alertLibraryNotLoaded: 'The html2canvas library is not loaded.',
      alertGenerateError: 'Error generating image.',
      alertUnitNotFound: 'Unit not found',
      alertSelectUnit: 'Select the unit first',
      
      receipt: 'Receipt',
      people: 'People',
      month: 'Month',
      generatedAt: 'Generated',
      noUnitsRegistered: 'No units registered.',
      noUnitSelected: 'Select a valid unit.',
      detailsNotAvailable: 'Payment details not available to display image.',
      generatingImage: 'Generating image...',
      
      storageFooter: 'Saved locally in your browser. To share or use on other devices, export as JSON and then import.',
      
      debugTitle: 'View detailed calculations (debug)',
      pricePerKwhReceiptA: 'Price per kWh (receipt A)',
      pricePerKwhReceiptB: 'Price per kWh (receipt B)',
      consumption202: 'Consumption 202',
      consumption201: 'Consumption 201',
      consumption401: 'Consumption 401',
      consumption500: 'Consumption 500',
      consumption402: 'Consumption 402',
      pricePerHead: 'Price per person (water)',
      gasPricePerHeadGroupA: 'Gas price (201+202) per person',
      gasPricePerHeadGroupB: 'Gas price (401+402) per person',
      
      kwh: 'kWh',
      price: 'Price',
      currency: '$'
    }
  },

  /**
   * Obtiene la traducción de una clave
   * @param {string} key - Clave de traducción (ej: 'appTitle')
   * @param {object} replacements - Objeto con reemplazos ({"%UNIT%": "101"})
   * @returns {string} Texto traducido
   */
  t(key, replacements = {}) {
    // Obtén el texto del idioma actual
    let text = this.translations[this.currentLanguage]?.[key];
    
    // Si no existe la clave en el idioma actual, intenta con español (fallback)
    if (!text) {
      text = this.translations['es']?.[key] || key;
    }

    // Reemplaza las variables en el texto (ej: %UNIT% → "101")
    Object.keys(replacements).forEach(key => {
      text = text.replace(key, replacements[key]);
    });

    return text;
  },

  /**
   * Cambia el idioma actual
   * @param {string} lang - Código de idioma ('es', 'en')
   */
  setLanguage(lang) {
    if (this.translations[lang]) {
      this.currentLanguage = lang;
      // Dispara un evento para que la UI se actualice
      document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
  },

  /**
   * Obtiene los idiomas disponibles
   * @returns {array} Lista de códigos de idioma
   */
  getAvailableLanguages() {
    return Object.keys(this.translations);
  }
};

// Exporta para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = i18n;
}
