/**
 * módulo ui.js - Gestión de interfaz de usuario (DOM manipulation)
 * ==================================================================
 * 
 * Responsabilidades:
 * - Renderizar componentes UI
 * - Manejar eventos del usuario
 * - Sincronizar estado con la vista
 * - Comunicar con otros módulos (Calculator, Storage, i18n)
 * 
 * PRINCIPIO: Esta capa es un "orquestador" que conecta eventos con lógica,
 * pero no contiene lógica de negocio compleja.
 */

const UI = (() => {
  /**
   * Helper para obtener elemento del DOM de forma segura
   * @param {string} id - ID del elemento
   * @returns {HTMLElement|null} Elemento o null
   */
  const getElement = (id) => document.getElementById(id);

  /**
   * Debounce helper: evita ejecutar funciones demasiadas veces
   * Útil para eventos 'input' que ocurren muy frecuentemente
   * @param {function} fn - Función a ejecutar
   * @param {number} delay - Milisegundos de espera
   * @returns {function} Función debounceada
   */
  const debounce = (fn, delay = 300) => {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  };

  /**
   * Formatea un número como moneda
   * Ejemplo: 1234.50 → "1.234,50"
   * @param {number} value - Valor a formatear
   * @returns {string} Valor formateado
   */
  const formatCurrency = (value) => {
    const n = Number(value || 0);
    const fixed = n.toFixed(2);
    const [intPart, decPart] = fixed.split('.');
    const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    const decTrimmed = decPart.replace(/0+$/, '');
    if (decTrimmed === '') return intWithDots;
    return `${intWithDots},${decTrimmed}`;
  };

  /**
   * Renderiza la lista de unidades en la interfaz
   * @param {array} units - Lista de unidades
   * @param {function} callbacks - {onUpdate, onRemove}
   */
  const renderUnits = (units, callbacks) => {
    const container = getElement('units-list');
    if (!container) return;

    container.innerHTML = '';

    units.forEach((unit, index) => {
      const row = document.createElement('div');
      row.className = 'unit-row';
      row.setAttribute('data-unit-id', unit.id);

      // Input para nombre de unidad
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = unit.id;
      nameInput.setAttribute('aria-label', `${i18n.t('unitName')} - ${unit.id}`);
      nameInput.addEventListener('change', (e) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(index, { ...unit, id: e.target.value.trim() || unit.id });
        }
      });

      // Input para cantidad de personas
      const peopleInput = document.createElement('input');
      peopleInput.type = 'number';
      peopleInput.min = '0';
      peopleInput.value = unit.people;
      peopleInput.setAttribute('aria-label', `${i18n.t('people')} - ${unit.id}`);
      peopleInput.addEventListener('change', (e) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(index, { ...unit, people: Math.max(0, Number(e.target.value) || 0) });
        }
      });

      // Input para arriendo
      const rentInput = document.createElement('input');
      rentInput.type = 'number';
      rentInput.min = '0';
      rentInput.value = unit.rent || 0;
      rentInput.placeholder = i18n.t('rent');
      rentInput.setAttribute('aria-label', `${i18n.t('rent')} - ${unit.id}`);
      rentInput.addEventListener('change', (e) => {
        if (callbacks.onUpdate) {
          callbacks.onUpdate(index, { ...unit, rent: Math.max(0, Number(e.target.value) || 0) });
        }
      });

      // Botón eliminar
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-small btn-danger';
      removeBtn.textContent = i18n.t('removeUnit');
      removeBtn.setAttribute('aria-label', `${i18n.t('removeUnit')} ${unit.id}`);
      removeBtn.addEventListener('click', () => {
        if (callbacks.onRemove) {
          callbacks.onRemove(index);
        }
      });

      row.appendChild(nameInput);
      row.appendChild(peopleInput);
      row.appendChild(rentInput);
      row.appendChild(removeBtn);
      container.appendChild(row);
    });
  };

  /**
   * Renderiza la lista de cargos adicionales (extras)
   * @param {array} extras - Lista de extras
   * @param {array} units - Lista de unidades (para mostrar asignación)
   * @param {function} callbacks - {onRemove}
   */
  const renderExtras = (extras, units, callbacks) => {
    const container = getElement('extras-list');
    if (!container) return;

    container.innerHTML = '';

    extras.forEach((extra, index) => {
      const row = document.createElement('div');
      row.className = 'extra-row';
      row.setAttribute('data-extra-id', extra.id);

      const textDiv = document.createElement('div');
      textDiv.style.flex = '1';
      textDiv.innerHTML = `
        <strong>${extra.name}</strong>
        <span class="text-muted"> — ${i18n.t('currency')} ${formatCurrency(extra.amount)}</span>
        <span class="text-muted"> → ${extra.unitId}</span>
      `;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn-small btn-danger';
      deleteBtn.textContent = i18n.t('removeExtra');
      deleteBtn.setAttribute('aria-label', `${i18n.t('removeExtra')} ${extra.name}`);
      deleteBtn.addEventListener('click', () => {
        if (callbacks.onRemove) {
          callbacks.onRemove(index);
        }
      });

      row.appendChild(textDiv);
      row.appendChild(deleteBtn);
      container.appendChild(row);
    });

    // Actualiza el select de unidades para asignar extras
    const unitSelect = getElement('extra-unit-select');
    if (unitSelect) {
      unitSelect.innerHTML = '';
      units.forEach(unit => {
        const option = document.createElement('option');
        option.value = unit.id;
        option.textContent = unit.id;
        unitSelect.appendChild(option);
      });
    }
  };

  /**
   * Renderiza la tabla de resultados (distribución de gastos)
   * @param {object} results - Resultado de calcular distribución
   * @param {array} extras - Lista de todos los extras (para saber nombres únicos)
   */
  const renderResults = (results, extras) => {
    const container = getElement('results');
    if (!container) return;

    const unitIds = Object.keys(results);
    if (unitIds.length === 0) {
      container.innerHTML = `<p class="text-info">${i18n.t('noUnitsRegistered')}</p>`;
      return;
    }

    // Obtiene lista única de nombres de extras
    const extraNames = [...new Set(extras.map(e => e.name))];

    // Construye tabla dinámicamente
    let html = '<table class="results-table"><thead><tr>';
    html += `<th>${i18n.t('unit')}</th>`;
    html += `<th>${i18n.t('rent')}</th>`;
    html += `<th>${i18n.t('electricity')}</th>`;
    html += `<th>${i18n.t('water')}</th>`;
    html += `<th>${i18n.t('gas')}</th>`;
    html += `<th>${i18n.t('aseo')}</th>`;

    extraNames.forEach(name => {
      html += `<th>${name}</th>`;
    });

    html += `<th>${i18n.t('total')}</th>`;
    html += '</tr></thead><tbody>';

    unitIds.forEach(unitId => {
      const result = results[unitId];
      html += '<tr>';
      html += `<td class="text-left"><strong>${unitId}</strong></td>`;
      html += `<td>${i18n.t('currency')} ${formatCurrency(result.rent)}</td>`;
      html += `<td>${i18n.t('currency')} ${formatCurrency(result.electricity)}</td>`;
      html += `<td>${i18n.t('currency')} ${formatCurrency(result.water)}</td>`;
      html += `<td>${i18n.t('currency')} ${formatCurrency(result.gas)}</td>`;
      html += `<td>${i18n.t('currency')} ${formatCurrency(result.cleaning)}</td>`;

      extraNames.forEach(name => {
        const value = result.breakdown.extrasMap?.[name] || 0;
        const display = value > 0 ? `${i18n.t('currency')} ${formatCurrency(value)}` : '';
        html += `<td>${display}</td>`;
      });

      html += `<td><strong>${i18n.t('currency')} ${formatCurrency(result.total)}</strong></td>`;
      html += '</tr>';
    });

    html += '</tbody></table>';

    container.innerHTML = html;
  };

  /**
   * Renderiza el resumen de pago para una unidad específica
   * @param {object} summary - Resultado de calculateUnitSummary
   * @param {string} unitId - ID de la unidad
   * @param {string} month - Mes facturado
   * @param {function} onRemoveExtra - Callback cuando elimina un extra del resumen
   */
  const renderUnitSummary = (summary, unitId, month = '', onRemoveExtra = null) => {
    const container = getElement('unit-summary-card');
    if (!container || !summary) {
      if (container) {
        container.innerHTML = `<p class="text-info">${i18n.t('noUnitSelected')}</p>`;
      }
      return;
    }

    const now = new Date();
    const generatedDate = now.toLocaleDateString();

    let rows = '';

    // Arriendo (si está incluido)
    if (summary.rent > 0) {
      rows += `<tr><td>${i18n.t('rent')}</td><td class="text-right">${i18n.t('currency')} ${formatCurrency(summary.rent)}</td></tr>`;
    }

    // Electricidad
    if (summary.electricity > 0) {
      rows += `<tr><td>${i18n.t('electricity')}</td><td class="text-right">${i18n.t('currency')} ${formatCurrency(summary.electricity)}</td></tr>`;
    }

    // Agua
    if (summary.water > 0) {
      rows += `<tr><td>${i18n.t('water')}</td><td class="text-right">${i18n.t('currency')} ${formatCurrency(summary.water)}</td></tr>`;
    }

    // Gas
    if (summary.gas > 0) {
      rows += `<tr><td>${i18n.t('gas')}</td><td class="text-right">${i18n.t('currency')} ${formatCurrency(summary.gas)}</td></tr>`;
    }

    // Aseo
    if (summary.cleaning > 0) {
      rows += `<tr><td>${i18n.t('aseo')}</td><td class="text-right">${i18n.t('currency')} ${formatCurrency(summary.cleaning)}</td></tr>`;
    }

    // Extras detallados
    if (summary.extrasList && summary.extrasList.length > 0) {
      summary.extrasList.forEach(extra => {
        rows += `
          <tr class="extra-item">
            <td>${extra.name}</td>
            <td class="text-right">
              ${i18n.t('currency')} ${formatCurrency(extra.amount)}
              <button class="btn-tiny btn-danger" data-extra-id="${extra.id}" aria-label="Remover ${extra.name}">
                ✕
              </button>
            </td>
          </tr>
        `;
      });
    }

    // Total
    rows += `
      <tr class="summary-total">
        <td><strong>${i18n.t('total')}</strong></td>
        <td class="text-right"><strong>${i18n.t('currency')} ${formatCurrency(summary.total)}</strong></td>
      </tr>
    `;

    const html = `
      <div class="summary-panel">
        <div class="summary-header">
          <h3>${unitId}</h3>
          <div class="text-muted text-small">
            ${i18n.t('month')}: ${month} — ${i18n.t('generatedAt')}: ${generatedDate}
          </div>
        </div>
        <table class="summary-table">
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    container.innerHTML = html;

    // Attacha listeners para eliminar extras del resumen
    if (onRemoveExtra) {
      container.querySelectorAll('[data-extra-id]').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const extraId = e.target.getAttribute('data-extra-id');
          onRemoveExtra(extraId);
        });
      });
    }
  };

  /**
   * Vincula los eventos de input a funciones de actualización
   * @param {object} handlers - {onInputChange, onAddUnit, onAddExtra, etc}
   */
  const bindInputEvents = (handlers) => {
    // Electricidad A
    ['ea-total-kwh', 'ea-total-price', 'ea-prev-202', 'ea-curr-202'].forEach(id => {
      const el = getElement(id);
      if (el) {
        el.addEventListener('input', debounce(() => {
          if (handlers.onInputChange) handlers.onInputChange();
        }));
      }
    });

    // Cleaning A
    const eaAseo = getElement('ea-cleaning');
    if (eaAseo) {
      eaAseo.addEventListener('input', debounce(() => {
        if (handlers.onInputChange) handlers.onInputChange();
      }));
    }

    // Electricidad B
    ['eb-total-kwh', 'eb-total-price', 'eb-prev-401', 'eb-curr-401', 'eb-prev-500', 'eb-curr-500'].forEach(id => {
      const el = getElement(id);
      if (el) {
        el.addEventListener('input', debounce(() => {
          if (handlers.onInputChange) handlers.onInputChange();
        }));
      }
    });

    // Cleaning B
    const ebAseo = getElement('eb-cleaning');
    if (ebAseo) {
      ebAseo.addEventListener('input', debounce(() => {
        if (handlers.onInputChange) handlers.onInputChange();
      }));
    }

    // Water
    const waterPrice = getElement('water-total-price');
    if (waterPrice) {
      waterPrice.addEventListener('input', debounce(() => {
        if (handlers.onInputChange) handlers.onInputChange();
      }));
    }

    // Gas
    ['gas-group1', 'gas-group2'].forEach(id => {
      const el = getElement(id);
      if (el) {
        el.addEventListener('input', debounce(() => {
          if (handlers.onInputChange) handlers.onInputChange();
        }));
      }
    });

    // Botón agregar unidad
    const addUnitBtn = getElement('add-unit-btn');
    if (addUnitBtn) {
      addUnitBtn.addEventListener('click', () => {
        if (handlers.onAddUnit) handlers.onAddUnit();
      });
    }

    // Botón agregar extra
    const addExtraBtn = getElement('add-extra-btn');
    if (addExtraBtn) {
      addExtraBtn.addEventListener('click', () => {
        if (handlers.onAddExtra) handlers.onAddExtra();
      });
    }

    // Selección de unidad para resumen
    const unitSummarySelect = getElement('unit-summary-select');
    if (unitSummarySelect) {
      unitSummarySelect.addEventListener('change', () => {
        if (handlers.onUnitSummaryChange) handlers.onUnitSummaryChange();
      });
    }

    // Checkboxes de inclusión
    ['include-electricity', 'include-water', 'include-gas', 'include-cleaning', 'include-extras', 'include-rent'].forEach(id => {
      const el = getElement(id);
      if (el) {
        el.addEventListener('change', () => {
          if (handlers.onIncludesChange) handlers.onIncludesChange();
        });
      }
    });

    // Selección de mes
    const monthSelect = getElement('summary-month-select');
    if (monthSelect) {
      monthSelect.addEventListener('change', () => {
        if (handlers.onMonthChange) handlers.onMonthChange();
      });
    }

    // Exportar
    const exportBtn = getElement('export-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        if (handlers.onExport) handlers.onExport();
      });
    }

    // Importar
    const importBtn = getElement('import-btn');
    if (importBtn) {
      importBtn.addEventListener('click', () => {
        if (handlers.onImport) handlers.onImport();
      });
    }

    // Archivo importado
    const importFile = getElement('import-file');
    if (importFile) {
      importFile.addEventListener('change', (e) => {
        if (handlers.onImportFile) handlers.onImportFile(e);
      });
    }

    // Reset
    const resetBtn = getElement('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (handlers.onReset) handlers.onReset();
      });
    }

    // Generar recibo imagen
    const genReceiptBtn = getElement('generate-receipt-img');
    if (genReceiptBtn) {
      genReceiptBtn.addEventListener('click', () => {
        if (handlers.onGenerateReceipt) handlers.onGenerateReceipt();
      });
    }
  };

  /**
   * Inicializa los valores de inputs desde el estado
   * @param {object} data - Datos del estado
   */
  const initializeInputsFromData = (data) => {
    // Electricidad A
    const eaTotalKwh = getElement('ea-total-kwh');
    if (eaTotalKwh) eaTotalKwh.value = data.electricityA?.totalKwh || 0;

    const eaTotalPrice = getElement('ea-total-price');
    if (eaTotalPrice) eaTotalPrice.value = data.electricityA?.totalPrice || 0;

    const eaPrev202 = getElement('ea-prev-202');
    if (eaPrev202) eaPrev202.value = data.electricityA?.unit202?.previousReading || 0;

    const eaCurr202 = getElement('ea-curr-202');
    if (eaCurr202) eaCurr202.value = data.electricityA?.unit202?.currentReading || 0;

    const eaCleaning = getElement('ea-cleaning');
    if (eaCleaning) eaCleaning.value = data.cleaningFees?.receiptA || 0;

    // Electricidad B
    const ebTotalKwh = getElement('eb-total-kwh');
    if (ebTotalKwh) ebTotalKwh.value = data.electricityB?.totalKwh || 0;

    const ebTotalPrice = getElement('eb-total-price');
    if (ebTotalPrice) ebTotalPrice.value = data.electricityB?.totalPrice || 0;

    const ebPrev401 = getElement('eb-prev-401');
    if (ebPrev401) ebPrev401.value = data.electricityB?.unit401?.previousReading || 0;

    const ebCurr401 = getElement('eb-curr-401');
    if (ebCurr401) ebCurr401.value = data.electricityB?.unit401?.currentReading || 0;

    const ebPrev500 = getElement('eb-prev-500');
    if (ebPrev500) ebPrev500.value = data.electricityB?.unit500?.previousReading || 0;

    const ebCurr500 = getElement('eb-curr-500');
    if (ebCurr500) ebCurr500.value = data.electricityB?.unit500?.currentReading || 0;

    const ebCleaning = getElement('eb-cleaning');
    if (ebCleaning) ebCleaning.value = data.cleaningFees?.receiptB || 0;

    // Water
    const waterPrice = getElement('water-total-price');
    if (waterPrice) waterPrice.value = data.water?.totalPrice || 0;

    // Gas
    const gasGroup1 = getElement('gas-group1');
    if (gasGroup1) gasGroup1.value = data.gas?.group1 || 0;

    const gasGroup2 = getElement('gas-group2');
    if (gasGroup2) gasGroup2.value = data.gas?.group2 || 0;

    // Inicializa select de meses
    const monthSelect = getElement('summary-month-select');
    if (monthSelect) {
      const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                     'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      monthSelect.innerHTML = '';
      const now = new Date();
      months.forEach((month, idx) => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        if (idx === now.getMonth()) option.selected = true;
        monthSelect.appendChild(option);
      });
    }
  };

  /**
   * Muestra un mensaje de error/información
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - 'error', 'success', 'info'
   */
  const showMessage = (message, type = 'info') => {
    // En una app real, usarías un toast/snackbar
    // Por ahora usamos alert para mantenerlo simple
    if (type === 'error') {
      console.error(message);
      alert(`❌ ${message}`);
    } else if (type === 'success') {
      console.log(message);
      alert(`✅ ${message}`);
    } else {
      console.info(message);
    }
  };

  /**
   * Obtiene valores de inputs
   * @returns {object} Valores actuales de inputs
   */
  const getInputValues = () => {
    return {
      // Electricidad A
      electricityA: {
        totalKwh: Number(getElement('ea-total-kwh')?.value || 0),
        totalPrice: Number(getElement('ea-total-price')?.value || 0),
        unit202: {
          previousReading: Number(getElement('ea-prev-202')?.value || 0),
          currentReading: Number(getElement('ea-curr-202')?.value || 0)
        }
      },
      cleaningFeesA: Number(getElement('ea-cleaning')?.value || 0),

      // Electricidad B
      electricityB: {
        totalKwh: Number(getElement('eb-total-kwh')?.value || 0),
        totalPrice: Number(getElement('eb-total-price')?.value || 0),
        unit401: {
          previousReading: Number(getElement('eb-prev-401')?.value || 0),
          currentReading: Number(getElement('eb-curr-401')?.value || 0)
        },
        unit500: {
          previousReading: Number(getElement('eb-prev-500')?.value || 0),
          currentReading: Number(getElement('eb-curr-500')?.value || 0)
        }
      },
      cleaningFeesB: Number(getElement('eb-cleaning')?.value || 0),

      // Water
      water: Number(getElement('water-total-price')?.value || 0),

      // Gas
      gas: {
        group1: Number(getElement('gas-group1')?.value || 0),
        group2: Number(getElement('gas-group2')?.value || 0)
      },

      // New unit form
      newUnit: {
        name: getElement('new-unit-name')?.value.trim() || '',
        people: Number(getElement('new-unit-people')?.value || 1),
        rent: Number(getElement('new-unit-rent')?.value || 0)
      },

      // New extra form
      newExtra: {
        name: getElement('extra-name')?.value.trim() || '',
        amount: Number(getElement('extra-amount')?.value || 0),
        unitId: getElement('extra-unit-select')?.value || ''
      },

      // Summary includes
      summaryIncludes: {
        electricity: getElement('include-electricity')?.checked ?? true,
        water: getElement('include-water')?.checked ?? true,
        gas: getElement('include-gas')?.checked ?? true,
        extras: getElement('include-extras')?.checked ?? true,
        rent: getElement('include-rent')?.checked ?? true,
        cleaning: getElement('include-cleaning')?.checked ?? true
      },

      // Selected unit and month
      selectedUnit: getElement('unit-summary-select')?.value || '',
      selectedMonth: getElement('summary-month-select')?.value || ''
    };
  };

  /**
   * Limpia los inputs de agregar unidad
   */
  const clearNewUnitInputs = () => {
    const nameInput = getElement('new-unit-name');
    if (nameInput) nameInput.value = '';
    const peopleInput = getElement('new-unit-people');
    if (peopleInput) peopleInput.value = '1';
    const rentInput = getElement('new-unit-rent');
    if (rentInput) rentInput.value = '0';
  };

  /**
   * Limpia los inputs de agregar extra
   */
  const clearNewExtraInputs = () => {
    const nameInput = getElement('extra-name');
    if (nameInput) nameInput.value = '';
    const amountInput = getElement('extra-amount');
    if (amountInput) amountInput.value = '';
  };

  /**
   * Habilita o deshabilita componentes de entrada
   * @param {boolean} enabled - true para habilitar
   */
  const setInputsEnabled = (enabled) => {
    document.querySelectorAll('input, select, button:not(.btn-icon)').forEach(el => {
      el.disabled = !enabled;
    });
  };

  /**
   * Llena el select de unidades para el resumen
   * @param {array} units - Lista de unidades disponibles
   */
  const populateUnitSelector = (units) => {
    const select = getElement('unit-summary-select');
    if (!select) return;

    // Limpiar opciones previas
    select.innerHTML = '<option value="">-- Selecciona una unidad --</option>';

    // Agregar cada unidad como opción
    units.forEach(unit => {
      const option = document.createElement('option');
      option.value = unit.id;
      option.textContent = unit.id;
      select.appendChild(option);
    });

    // Preseleccionar la primera unidad si existe
    if (units.length > 0) {
      select.value = units[0].id;
    }
  };

  /**
   * Renderiza la sección de Modo Manual para editar valores
   * @param {object} results - Resultados actuales {unitId: {rent, electricity, ...}}
   * @param {function} onUpdate - Callback cuando se actualiza un valor
   */
  const renderManualMode = (results, onUpdate) => {
    const container = getElement('manual-mode-container');
    if (!container) return;

    const unitIds = Object.keys(results);
    if (unitIds.length === 0) {
      container.innerHTML = '<p class="text-info">No hay unidades para editar.</p>';
      return;
    }

    let html = '<div class="manual-mode-grid">';

    unitIds.forEach(unitId => {
      const result = results[unitId];
      html += `
        <div class="manual-card">
          <h4>${unitId}</h4>
          <div class="manual-inputs">
            <div class="form-group">
              <label>Arriendo:</label>
              <input type="number" min="0" step="0.01" value="${result.rent}" 
                     data-unit="${unitId}" data-field="rent" class="manual-input" />
            </div>
            <div class="form-group">
              <label>Electricidad:</label>
              <input type="number" min="0" step="0.01" value="${result.electricity}" 
                     data-unit="${unitId}" data-field="electricity" class="manual-input" />
            </div>
            <div class="form-group">
              <label>Agua:</label>
              <input type="number" min="0" step="0.01" value="${result.water}" 
                     data-unit="${unitId}" data-field="water" class="manual-input" />
            </div>
            <div class="form-group">
              <label>Gas:</label>
              <input type="number" min="0" step="0.01" value="${result.gas}" 
                     data-unit="${unitId}" data-field="gas" class="manual-input" />
            </div>
            <div class="form-group">
              <label>Aseo:</label>
              <input type="number" min="0" step="0.01" value="${result.cleaning}" 
                     data-unit="${unitId}" data-field="cleaning" class="manual-input" />
            </div>
          </div>
        </div>
      `;
    });

    html += '</div>';
    container.innerHTML = html;

    // Agregar listeners a los inputs
    container.querySelectorAll('.manual-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const unitId = e.target.dataset.unit;
        const field = e.target.dataset.field;
        const value = Number(e.target.value) || 0;
        if (onUpdate) {
          onUpdate(unitId, field, value);
        }
      });
    });
  };

  /**
   * Renderiza los detalles/breakdown de cálculos
   * @param {object} data - Datos de entrada (units, electricity, water, etc)
   * @param {object} results - Resultados calculados
   */
  const renderCalculationDetails = (data, results) => {
    const container = getElement('calculation-details-container');
    if (!container) return;

    let html = '<div class="details-grid">';

    // ===== DETALLES DE ELECTRICIDAD =====
    if (data.electricityA && data.electricityA.totalPrice > 0) {
      html += `
        <div class="detail-card">
          <h4>📊 Electricidad A (201-202)</h4>
          <table class="detail-table">
            <tr><td>Total kWh:</td><td><strong>${data.electricityA.totalKwh || 0}</strong></td></tr>
            <tr><td>Precio total:</td><td><strong>$${formatCurrency(data.electricityA.totalPrice)}</strong></td></tr>
            <tr><td>Precio/kWh:</td><td><strong>$${formatCurrency((data.electricityA.totalPrice / (data.electricityA.totalKwh || 1)))}</strong></td></tr>
            <tr class="detail-separator"><td colspan="2">Consumo por unidad:</td></tr>
            <tr><td>+ Medidor 202:</td><td>${(data.electricityA.unit202?.currentReading || 0) - (data.electricityA.unit202?.previousReading || 0)} kWh</td></tr>
            <tr><td>+ Medidor 201:</td><td>${Math.max(0, (data.electricityA.totalKwh || 0) - ((data.electricityA.unit202?.currentReading || 0) - (data.electricityA.unit202?.previousReading || 0)))} kWh</td></tr>
          </table>
        </div>
      `;
    }

    // ===== DETALLES DE AGUA =====
    if (data.water && data.water.totalPrice > 0) {
      const totalPeople = (data.units || []).reduce((sum, u) => sum + (Number(u.people) || 0), 0);
      const pricePerHead = totalPeople > 0 ? data.water.totalPrice / totalPeople : 0;
      html += `
        <div class="detail-card">
          <h4>💧 Agua</h4>
          <table class="detail-table">
            <tr><td>Total factura:</td><td><strong>$${formatCurrency(data.water.totalPrice)}</strong></td></tr>
            <tr><td>Total personas:</td><td><strong>${totalPeople}</strong></td></tr>
            <tr><td>Precio por persona:</td><td><strong>$${formatCurrency(pricePerHead)}</strong></td></tr>
          </table>
        </div>
      `;
    }

    // ===== DETALLES DE GAS =====
    if ((data.gas?.group1 > 0) || (data.gas?.group2 > 0)) {
      const group1People = ((data.units || []).filter(u => ['201', '202'].some(id => u.id.includes(id)))).reduce((sum, u) => sum + (Number(u.people) || 0), 0);
      const group2People = ((data.units || []).filter(u => ['401', '402'].some(id => u.id.includes(id)))).reduce((sum, u) => sum + (Number(u.people) || 0), 0);
      
      html += `
        <div class="detail-card">
          <h4>🔥 Gas</h4>
          <table class="detail-table">
            <tr><td>Grupo 1 (201+202):</td><td><strong>$${formatCurrency(data.gas?.group1 || 0)}</strong></td></tr>
            <tr><td>  → Personas:</td><td>${group1People}</td></tr>
            <tr><td>  → Por persona:</td><td>$${formatCurrency(group1People > 0 ? (data.gas?.group1 || 0) / group1People : 0)}</td></tr>
            <tr class="detail-separator"><td colspan="2"></td></tr>
            <tr><td>Grupo 2 (401+402):</td><td><strong>$${formatCurrency(data.gas?.group2 || 0)}</strong></td></tr>
            <tr><td>  → Personas:</td><td>${group2People}</td></tr>
            <tr><td>  → Por persona:</td><td>$${formatCurrency(group2People > 0 ? (data.gas?.group2 || 0) / group2People : 0)}</td></tr>
          </table>
        </div>
      `;
    }

    html += '</div>';
    container.innerHTML = html;
  };

  return {
    // Rendering
    renderUnits,
    renderExtras,
    renderResults,
    renderUnitSummary,
    renderManualMode,
    renderCalculationDetails,
    initializeInputsFromData,

    // Events
    bindInputEvents,

    // Input/Output
    getInputValues,
    clearNewUnitInputs,
    clearNewExtraInputs,
    getElement,

    // Utilities
    showMessage,
    formatCurrency,
    setInputsEnabled,
    populateUnitSelector
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = UI;
}
