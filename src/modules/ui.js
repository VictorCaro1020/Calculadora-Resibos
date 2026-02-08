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
  const renderManualMode = (results, manualOverrides, manualModeActive, onUpdate) => {
    const container = getElement('manual-mode-container');
    if (!container) return;

    const unitIds = Object.keys(results);
    if (unitIds.length === 0) {
      container.innerHTML = '<p class="text-info">No hay unidades para editar.</p>';
      return;
    }

    const services = ['rent', 'electricity', 'water', 'gas', 'cleaning'];
    const serviceLabels = {
      rent: 'Arriendo',
      electricity: 'Electricidad',
      water: 'Agua',
      gas: 'Gas',
      cleaning: 'Aseo'
    };

    let html = `
      <div class="manual-mode-wrapper ${manualModeActive ? 'manual-mode-active' : ''}">
        <div class="manual-controls">
          <div class="control-group">
            <label for="manual-unit-select" class="form-label">Seleccionar Unidad</label>
            <select id="manual-unit-select" class="form-input">
              <option value="">-- Elige una unidad --</option>
              ${unitIds.map(uid => `<option value="${uid}">${uid}</option>`).join('')}
            </select>
          </div>

          <div class="control-group">
            <label for="manual-service-select" class="form-label">Servicio a Cambiar</label>
            <select id="manual-service-select" class="form-input">
              <option value="">-- Elige un servicio --</option>
              ${services.map(svc => `<option value="${svc}">${serviceLabels[svc]}</option>`).join('')}
            </select>
          </div>

          <div class="control-group">
            <label for="manual-value-input" class="form-label">Nuevo Valor</label>
            <input 
              id="manual-value-input" 
              type="number" 
              min="0" 
              step="0.01" 
              placeholder="0.00"
              class="form-input"
            />
          </div>

          <button id="manual-apply-btn" class="btn btn-primary" aria-label="Aplicar cambio manual">
            ✓ Aplicar Cambio
          </button>
        </div>

        <div class="manual-toggle-section">
          <div class="manual-toggle-wrapper">
            <label class="toggle-label">
              Modo Manual:
              <input type="checkbox" id="manual-mode-toggle" class="manual-toggle-input" ${manualModeActive ? 'checked' : ''} />
              <span class="toggle-status active">🔴 ACTIVO</span>
              <span class="toggle-status inactive">⚪ INACTIVO</span>
            </label>
          </div>
          <p class="text-info">✓ Activo = aplica solo cambios editados (resaltados) | ✗ Inactivo = vuelve a automático</p>
        </div>

        <div id="manual-changes-list" class="manual-changes-list"></div>
      </div>
    `;

    container.innerHTML = html;

    // Renderizar lista de cambios realizados
    const changesList = getElement('manual-changes-list');
    if (manualOverrides && Object.keys(manualOverrides).length > 0) {
      let changesHtml = '<div class="changes-header"><strong>📝 Cambios Realizados:</strong></div>';
      Object.entries(manualOverrides).forEach(([key, value]) => {
        const [unitId, field] = key.split('.');
        const serviceLabel = serviceLabels[field] || field;
        changesHtml += `
          <div class="manual-change-item ${manualModeActive ? 'active' : ''}">
            <span class="manual-change-text">
              <strong>${unitId}</strong> - ${serviceLabel}: <strong>$${formatCurrency(value)}</strong>
            </span>
          </div>
        `;
      });
      changesList.innerHTML = changesHtml;
    } else {
      changesList.innerHTML = '<p class="text-info">Sin cambios manuales realizados.</p>';
    }

    // Eventos
    const unitSelect = getElement('manual-unit-select');
    const serviceSelect = getElement('manual-service-select');
    const valueInput = getElement('manual-value-input');
    const applyBtn = getElement('manual-apply-btn');
    const toggleBtn = getElement('manual-mode-toggle');

    applyBtn?.addEventListener('click', () => {
      const unit = unitSelect?.value;
      const service = serviceSelect?.value;
      const value = Number(valueInput?.value) || 0;

      if (!unit || !service) {
        alert('Por favor selecciona una unidad y un servicio');
        return;
      }

      if (onUpdate) {
        onUpdate(unit, service, value);
      }

      // Limpiar formulario
      valueInput.value = '';
      unitSelect.value = '';
      serviceSelect.value = '';
    });

    toggleBtn?.addEventListener('change', (e) => {
      const isActive = e.target.checked;
      container.classList.toggle('manual-mode-active', isActive);
      if (onUpdate) {
        onUpdate('__toggle__', '__manual_mode__', isActive ? 1 : 0);
      }
    });
  };

  /**
   * Renderiza los detalles/breakdown de cálculos por unidad
   * @param {object} data - Datos de entrada (units, electricity, water, etc)
   * @param {object} results - Resultados calculados por unidad
   */
  const renderCalculationDetails = (data, results) => {
    const container = getElement('calculation-details-container');
    if (!container) return;

    const units = data.units || [];
    if (units.length === 0) {
      container.innerHTML = '<p class="text-info">No hay unidades para mostrar detalles.</p>';
      return;
    }

    let html = `<div class="details-accordion">`;

    // Información general de servicios
    html += `
      <div class="accordion-item">
        <button class="accordion-header" data-toggle="details-general">
          <span class="accordion-title">📋 Información General de Servicios</span>
          <span class="accordion-icon">▼</span>
        </button>
        <div id="details-general" class="accordion-content" style="display: none;">
          <div class="general-info">
    `;

    if (data.electricityA && data.electricityA.totalPrice > 0) {
      const pricePerKwh = data.electricityA.totalPrice / (data.electricityA.totalKwh || 1);
      html += `
        <div class="info-section">
          <h4>⚡ Electricidad A (201-202)</h4>
          <div class="info-row">
            <span>Total kWh:</span>
            <strong>${data.electricityA.totalKwh || 0}</strong>
          </div>
          <div class="info-row">
            <span>Precio total:</span>
            <strong>$${formatCurrency(data.electricityA.totalPrice)}</strong>
          </div>
          <div class="info-row">
            <span>Precio/kWh:</span>
            <strong>$${formatCurrency(pricePerKwh)}</strong>
          </div>
        </div>
      `;
    }

    if (data.electricityB && data.electricityB.totalPrice > 0) {
      const pricePerKwhB = data.electricityB.totalPrice / (data.electricityB.totalKwh || 1);
      html += `
        <div class="info-section">
          <h4>⚡ Electricidad B (401-402-500)</h4>
          <div class="info-row">
            <span>Total kWh:</span>
            <strong>${data.electricityB.totalKwh || 0}</strong>
          </div>
          <div class="info-row">
            <span>Precio total:</span>
            <strong>$${formatCurrency(data.electricityB.totalPrice)}</strong>
          </div>
          <div class="info-row">
            <span>Precio/kWh:</span>
            <strong>$${formatCurrency(pricePerKwhB)}</strong>
          </div>
        </div>
      `;
    }

    if (data.water && data.water.totalPrice > 0) {
      const totalPeople = units.reduce((sum, u) => sum + (Number(u.people) || 0), 0);
      const pricePerHead = totalPeople > 0 ? data.water.totalPrice / totalPeople : 0;
      html += `
        <div class="info-section">
          <h4>💧 Agua</h4>
          <div class="info-row">
            <span>Total factura:</span>
            <strong>$${formatCurrency(data.water.totalPrice)}</strong>
          </div>
          <div class="info-row">
            <span>Total personas:</span>
            <strong>${totalPeople}</strong>
          </div>
          <div class="info-row">
            <span>Precio por persona:</span>
            <strong>$${formatCurrency(pricePerHead)}</strong>
          </div>
        </div>
      `;
    }

    if ((data.gas?.group1 || 0) > 0 || (data.gas?.group2 || 0) > 0) {
      html += `
        <div class="info-section">
          <h4>🔥 Gas</h4>
      `;
      if ((data.gas?.group1 || 0) > 0) {
        const group1Units = units.filter(u => u.id.includes('201') || u.id.includes('202'));
        const group1People = group1Units.reduce((sum, u) => sum + (Number(u.people) || 0), 0);
        const pricePerPersonG1 = group1People > 0 ? data.gas.group1 / group1People : 0;
        html += `
          <div class="info-row">
            <span>Grupo 1 (201+202): Factura</span>
            <strong>$${formatCurrency(data.gas.group1)}</strong>
          </div>
          <div class="info-row">
            <span>  → Personas:</span>
            <strong>${group1People}</strong>
          </div>
          <div class="info-row">
            <span>  → Por persona:</span>
            <strong>$${formatCurrency(pricePerPersonG1)}</strong>
          </div>
        `;
      }
      if ((data.gas?.group2 || 0) > 0) {
        const group2Units = units.filter(u => u.id.includes('401') || u.id.includes('402'));
        const group2People = group2Units.reduce((sum, u) => sum + (Number(u.people) || 0), 0);
        const pricePerPersonG2 = group2People > 0 ? data.gas.group2 / group2People : 0;
        html += `
          <div class="info-row">
            <span>Grupo 2 (401+402): Factura</span>
            <strong>$${formatCurrency(data.gas.group2)}</strong>
          </div>
          <div class="info-row">
            <span>  → Personas:</span>
            <strong>${group2People}</strong>
          </div>
          <div class="info-row">
            <span>  → Por persona:</span>
            <strong>$${formatCurrency(pricePerPersonG2)}</strong>
          </div>
        `;
      }
      html += `</div>`;
    }

    html += `</div></div></div>`;

    // Detalles por unidad
    units.forEach((unit, idx) => {
      const result = results[unit.id] || {};
      
      // Calcular kWh consumido por esta unidad
      let kwhInfo = '';
      const consumption202 = Math.max(0, (data.electricityA?.unit202?.currentReading || 0) - (data.electricityA?.unit202?.previousReading || 0));
      const totalKwhA = data.electricityA?.totalKwh || 0;
      const consumption201 = Math.max(0, totalKwhA - consumption202);
      
      const consumption401 = Math.max(0, (data.electricityB?.unit401?.currentReading || 0) - (data.electricityB?.unit401?.previousReading || 0));
      const consumption500 = Math.max(0, (data.electricityB?.unit500?.currentReading || 0) - (data.electricityB?.unit500?.previousReading || 0));
      const totalKwhB = data.electricityB?.totalKwh || 0;
      const consumption402 = Math.max(0, totalKwhB - consumption401 - consumption500);
      
      if (unit.id.includes('202')) kwhInfo = `<div class="kwh-info">⚡ ${consumption202} kWh (Electricidad A)</div>`;
      else if (unit.id.includes('201')) kwhInfo = `<div class="kwh-info">⚡ ${consumption201} kWh (Electricidad A)</div>`;
      else if (unit.id.includes('401')) kwhInfo = `<div class="kwh-info">⚡ ${consumption401} kWh (Electricidad B)</div>`;
      else if (unit.id.includes('402')) kwhInfo = `<div class="kwh-info">⚡ ${consumption402} kWh (Electricidad B)</div>`;
      else if (unit.id.includes('500')) kwhInfo = `<div class="kwh-info">⚡ ${consumption500} kWh (Electricidad B)</div>`;
      
      html += `
        <div class="accordion-item">
          <button class="accordion-header" data-toggle="unit-${idx}">
            <span class="accordion-title">🏠 ${unit.id} (${unit.people} personas)</span>
            <span class="accordion-icon">▼</span>
          </button>
          <div id="unit-${idx}" class="accordion-content" style="display: none;">
            <div class="unit-details">
              ${kwhInfo}
              <div class="detail-row">
                <span>Arriendo:</span>
                <strong>$${formatCurrency(result.rent || 0)}</strong>
              </div>
              <div class="detail-row">
                <span>Electricidad:</span>
                <strong>$${formatCurrency(result.electricity || 0)}</strong>
              </div>
              <div class="detail-row">
                <span>Agua:</span>
                <strong>$${formatCurrency(result.water || 0)}</strong>
              </div>
              <div class="detail-row">
                <span>Gas:</span>
                <strong>$${formatCurrency(result.gas || 0)}</strong>
              </div>
              <div class="detail-row">
                <span>Aseo/Limpieza:</span>
                <strong>$${formatCurrency(result.cleaning || 0)}</strong>
              </div>
              <div class="detail-row total">
                <span>TOTAL:</span>
                <strong>$${formatCurrency((result.rent || 0) + (result.electricity || 0) + (result.water || 0) + (result.gas || 0) + (result.cleaning || 0))}</strong>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;

    // Agregar funcionalidad de acordeón
    container.querySelectorAll('.accordion-header').forEach(header => {
      header.addEventListener('click', () => {
        const toggleId = header.getAttribute('data-toggle');
        const content = getElement(toggleId);
        const icon = header.querySelector('.accordion-icon');
        
        if (content) {
          const isOpen = content.style.display !== 'none';
          content.style.display = isOpen ? 'none' : 'block';
          icon.textContent = isOpen ? '▶' : '▼';
          header.classList.toggle('active', !isOpen);
        }
      });
    });
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
