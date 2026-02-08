/**
 * módulo calculator.js - Lógica de cálculo de distribución de gastos
 * ====================================================================
 * 
 * Contiene toda la inteligencia de negocio para distribuir:
 * - Electricidad (dos recibos con medidores individuales)
 * - Agua (por persona)
 * - Gas (por grupos)
 * - Aseo (por recibo)
 * - Cargos adicionales (por unidad)
 * - Arriendo (por unidad)
 * 
 * IMPORTANTE: Esta capa no toca el DOM, solo hace cálculos.
 * Esto permite testear la lógica sin UI y reutilizar en otras plataformas.
 */

const Calculator = (() => {
  /**
   * Busca una unidad por coincidencia exacta o parcial
   * Ejemplo: findUnitByPattern(units, '201') → '201' o '201-A'
   * 
   * @param {array} units - Lista de unidades
   * @param {string} pattern - Patrón a buscar (ej: '201')
   * @returns {string|null} ID de la unidad encontrada o null
   */
  const findUnitByPattern = (units, pattern) => {
    // Primero intenta coincidencia exacta
    const exactMatch = units.find(u => u.id === pattern);
    if (exactMatch) return exactMatch.id;

    // Si no hay coincidencia exacta, busca que incluya el patrón
    const partialMatch = units.find(u => u.id && u.id.toString().includes(pattern));
    return partialMatch ? partialMatch.id : null;
  };

  /**
   * Calcula la distribución de electricidad del Recibo A
   * Basado en lecturas de medidor para la unidad 202
   * El resto se asigna a unidad 201
   * 
   * @param {object} electricityA - Datos del recibo A
   * @param {array} units - Lista de unidades
   * @returns {object} Distribución por unidad {unitId: kWh}
   */
  const calculateElectricityA = (electricityA, units) => {
    const result = {};
    const totalKwh = Number(electricityA.totalKwh) || 0;
    const totalPrice = Number(electricityA.totalPrice) || 0;
    const pricePerKwh = totalKwh > 0 ? (totalPrice / totalKwh) : 0;

    // Calcula consumo de unidad 202 basado en su medidor
    const consumption202 = Math.max(
      0,
      (Number(electricityA.unit202.currentReading) || 0) -
      (Number(electricityA.unit202.previousReading) || 0)
    );

    // El resto es consumo de unidad 201
    const consumption201 = Math.max(0, totalKwh - consumption202);

    // Busca y asigna a cada unidad
    const unit202Id = findUnitByPattern(units, '202');
    if (unit202Id) {
      result[unit202Id] = consumption202 * pricePerKwh;
    }

    const unit201Id = findUnitByPattern(units, '201');
    if (unit201Id) {
      result[unit201Id] = consumption201 * pricePerKwh;
    }

    return {
      distribution: result,
      debug: { pricePerKwh, consumption202, consumption201 }
    };
  };

  /**
   * Calcula la distribución de electricidad del Recibo B
   * Basado en lecturas para unidades 401 y 500
   * El resto se asigna a unidad 402
   * 
   * @param {object} electricityB - Datos del recibo B
   * @param {array} units - Lista de unidades
   * @returns {object} Distribución por unidad {unitId: kWh}
   */
  const calculateElectricityB = (electricityB, units) => {
    const result = {};
    const totalKwh = Number(electricityB.totalKwh) || 0;
    const totalPrice = Number(electricityB.totalPrice) || 0;
    const pricePerKwh = totalKwh > 0 ? (totalPrice / totalKwh) : 0;

    // Consumo individual de 401
    const consumption401 = Math.max(
      0,
      (Number(electricityB.unit401.currentReading) || 0) -
      (Number(electricityB.unit401.previousReading) || 0)
    );

    // Consumo individual de 500
    const consumption500 = Math.max(
      0,
      (Number(electricityB.unit500.currentReading) || 0) -
      (Number(electricityB.unit500.previousReading) || 0)
    );

    // El resto es consumo de 402
    const consumption402 = Math.max(0, totalKwh - consumption401 - consumption500);

    // Asigna a cada unidad
    const unit401Id = findUnitByPattern(units, '401');
    if (unit401Id) {
      result[unit401Id] = consumption401 * pricePerKwh;
    }

    const unit500Id = findUnitByPattern(units, '500');
    if (unit500Id) {
      result[unit500Id] = consumption500 * pricePerKwh;
    }

    const unit402Id = findUnitByPattern(units, '402');
    if (unit402Id) {
      result[unit402Id] = consumption402 * pricePerKwh;
    }

    return {
      distribution: result,
      debug: { pricePerKwh, consumption401, consumption500, consumption402 }
    };
  };

  /**
   * Calcula agua dividida equitativamente entre todas las personas
   * Precio = (total / totalPersonas) * personasUnidad
   * 
   * @param {object} water - Datos de agua
   * @param {array} units - Lista de unidades
   * @returns {object} Distribución por unidad
   */
  const calculateWater = (water, units) => {
    const result = {};
    const totalPrice = Number(water.totalPrice) || 0;
    
    // Suma total de personas en todo el edificio
    const totalPeople = units.reduce((sum, u) => sum + (Number(u.people) || 0), 0);
    
    if (totalPeople === 0) return { distribution: result, debug: { pricePerHead: 0 } };

    const pricePerHead = totalPrice / totalPeople;

    // Asigna a cada unidad según sus habitantes
    units.forEach(unit => {
      const people = Number(unit.people) || 0;
      result[unit.id] = people * pricePerHead;
    });

    return {
      distribution: result,
      debug: { pricePerHead, totalPeople }
    };
  };

  /**
   * Calcula gas en dos grupos: (201+202) y (401+402)
   * Cada grupo se divide por personas en ese grupo
   * 
   * @param {object} gas - Datos de gas
   * @param {array} units - Lista de unidades
   * @returns {object} Distribución por unidad
   */
  const calculateGas = (gas, units) => {
    const result = {};

    // GRUPO 1: Unidades 201 y 202
    const group1Price = Number(gas.group1) || 0;
    const group1Ids = ['201', '202']
      .map(pattern => findUnitByPattern(units, pattern))
      .filter(Boolean);

    const group1People = group1Ids.reduce((sum, id) => {
      const unit = units.find(u => u.id === id);
      return sum + (Number(unit?.people) || 0);
    }, 0);

    const group1PricePerHead = group1People > 0 ? (group1Price / group1People) : 0;

    group1Ids.forEach(id => {
      const unit = units.find(u => u.id === id);
      const people = Number(unit?.people) || 0;
      result[id] = people * group1PricePerHead;
    });

    // GRUPO 2: Unidades 401 y 402
    const group2Price = Number(gas.group2) || 0;
    const group2Ids = ['401', '402']
      .map(pattern => findUnitByPattern(units, pattern))
      .filter(Boolean);

    const group2People = group2Ids.reduce((sum, id) => {
      const unit = units.find(u => u.id === id);
      return sum + (Number(unit?.people) || 0);
    }, 0);

    const group2PricePerHead = group2People > 0 ? (group2Price / group2People) : 0;

    group2Ids.forEach(id => {
      const unit = units.find(u => u.id === id);
      const people = Number(unit?.people) || 0;
      result[id] = people * group2PricePerHead;
    });

    return {
      distribution: result,
      debug: { 
        group1PricePerHead, 
        group1People,
        group2PricePerHead,
        group2People
      }
    };
  };

  /**
   * Calcula distribución de aseo (cleaning fees)
   * Se divide entre las unidades OCUPADAS del recibo
   * 
   * @param {object} cleaningFees - {receiptA, receiptB}
   * @param {array} units - Lista de unidades
   * @returns {object} Distribución por unidad
   */
  const calculateCleaning = (cleaningFees, units) => {
    const result = {};

    // RECIBO A: Unidades 201 y 202
    const receiptAPrice = Number(cleaningFees.receiptA) || 0;
    const receiptAIds = ['201', '202']
      .map(pattern => findUnitByPattern(units, pattern))
      .filter(Boolean);

    // Solo divide entre unidades OCUPADAS (people > 0)
    const receiptAOccupied = receiptAIds.filter(id => {
      const unit = units.find(u => u.id === id);
      return (Number(unit?.people) || 0) > 0;
    });

    if (receiptAPrice > 0 && receiptAOccupied.length > 0) {
      const perUnit = receiptAPrice / receiptAOccupied.length;
      receiptAOccupied.forEach(id => {
        result[id] = (result[id] || 0) + perUnit;
      });
    }

    // RECIBO B: Unidades 401, 402 y 500
    const receiptBPrice = Number(cleaningFees.receiptB) || 0;
    const receiptBIds = ['401', '402', '500']
      .map(pattern => findUnitByPattern(units, pattern))
      .filter(Boolean);

    const receiptBOccupied = receiptBIds.filter(id => {
      const unit = units.find(u => u.id === id);
      return (Number(unit?.people) || 0) > 0;
    });

    if (receiptBPrice > 0 && receiptBOccupied.length > 0) {
      const perUnit = receiptBPrice / receiptBOccupied.length;
      receiptBOccupied.forEach(id => {
        result[id] = (result[id] || 0) + perUnit;
      });
    }

    return { distribution: result };
  };

  /**
   * Calcula la distribución completa de todos los gastos
   * 
   * @param {object} data - Objeto con toda la información (units, electricity, water, etc)
   * @returns {object} Distribución completa con breakdown por concepto
   */
  const calculateAllocations = (data) => {
    const units = data.units || [];
    
    // Inicializa objeto de resultados para cada unidad
    const results = {};
    units.forEach(u => {
      results[u.id] = {
        electricity: 0,
        water: 0,
        gas: 0,
        cleaning: 0,
        rent: Number(u.rent) || 0,
        extras: 0,
        total: 0,
        breakdown: {
          extrasList: [],
          extrasMap: {}
        }
      };
    });

    // Acumula cada componente de gasto
    const debugInfo = {};

    // Electricidad A
    const eaResult = calculateElectricityA(data.electricityA, units);
    debugInfo.electricityA = eaResult.debug;
    Object.keys(eaResult.distribution).forEach(unitId => {
      results[unitId].electricity = (results[unitId].electricity || 0) + eaResult.distribution[unitId];
    });

    // Electricidad B
    const ebResult = calculateElectricityB(data.electricityB, units);
    debugInfo.electricityB = ebResult.debug;
    Object.keys(ebResult.distribution).forEach(unitId => {
      results[unitId].electricity = (results[unitId].electricity || 0) + ebResult.distribution[unitId];
    });

    // Agua
    const waterResult = calculateWater(data.water, units);
    debugInfo.water = waterResult.debug;
    Object.keys(waterResult.distribution).forEach(unitId => {
      results[unitId].water = waterResult.distribution[unitId];
    });

    // Gas
    const gasResult = calculateGas(data.gas, units);
    debugInfo.gas = gasResult.debug;
    Object.keys(gasResult.distribution).forEach(unitId => {
      results[unitId].gas = gasResult.distribution[unitId];
    });

    // Aseo
    const cleaningResult = calculateCleaning(data.cleaningFees, units);
    Object.keys(cleaningResult.distribution).forEach(unitId => {
      results[unitId].cleaning = cleaningResult.distribution[unitId];
    });

    // Extras (cargos adicionales asignados a unidades específicas)
    (data.extras || []).forEach(extra => {
      if (results[extra.unitId]) {
        const amount = Number(extra.amount) || 0;
        results[extra.unitId].extras += amount;
        
        // Guarda breakdown detallado de extras
        results[extra.unitId].breakdown.extrasList.push({
          id: extra.id,
          name: extra.name,
          amount: amount
        });
        results[extra.unitId].breakdown.extrasMap[extra.name] =
          (results[extra.unitId].breakdown.extrasMap[extra.name] || 0) + amount;
      }
    });

    // Redondea y calcula totales finales
    units.forEach(u => {
      const r = results[u.id];
      r.electricity = Number((r.electricity || 0).toFixed(2));
      r.water = Number((r.water || 0).toFixed(2));
      r.gas = Number((r.gas || 0).toFixed(2));
      r.cleaning = Number((r.cleaning || 0).toFixed(2));
      r.extras = Number((r.extras || 0).toFixed(2));
      r.rent = Number((r.rent || 0).toFixed(2));
      r.total = Number((r.electricity + r.water + r.gas + r.cleaning + r.extras + r.rent).toFixed(2));
    });

    return { results, debug: debugInfo };
  };

  /**
   * Calcula un resumen por unidad con conceptos selectivos
   * Permite generar recibos incluyendo/excluyendo ciertos gastos
   * 
   * @param {object} data - Datos completos
   * @param {string} unitId - ID de la unidad
   * @param {object} includes - {electricity, water, gas, extras, rent, cleaning}
   * @returns {object} Breakdown de gastos para esa unidad
   */
  const calculateUnitSummary = (data, unitId, includes = {}) => {
    const { results } = calculateAllocations(data);
    const unitResult = results[unitId];
    
    if (!unitResult) return null;

    const breakdown = {
      electricity: includes.electricity ? unitResult.electricity : 0,
      water: includes.water ? unitResult.water : 0,
      gas: includes.gas ? unitResult.gas : 0,
      cleaning: includes.cleaning ? unitResult.cleaning : 0,
      rent: includes.rent ? unitResult.rent : 0,
      extrasList: includes.extras ? (unitResult.breakdown.extrasList || []) : [],
      total: 0
    };

    // Suma los extras
    breakdown.extras = breakdown.extrasList.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);

    // Total final
    breakdown.total = Number(
      (breakdown.electricity + breakdown.water + breakdown.gas + breakdown.cleaning + breakdown.extras + breakdown.rent).toFixed(2)
    );

    return breakdown;
  };

  /**
   * Valida que los datos tengan integridad mínima
   * @param {object} data - Datos a validar
   * @returns {boolean} true si son válidos
   */
  const isDataValid = (data) => {
    return data && 
           Array.isArray(data.units) && 
           data.units.length > 0 &&
           data.electricityA &&
           data.electricityB &&
           data.water &&
           data.gas;
  };

  // API pública
  return {
    calculateAllocations,
    calculateUnitSummary,
    isDataValid,
    findUnitByPattern
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Calculator;
}
