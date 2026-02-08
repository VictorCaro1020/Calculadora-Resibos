/**
 * app.js - Lógica principal de la aplicación
 * ============================================
 * 
 * ARQUITECTURA:
 * Este archivo actúa como "controlador" central que orquesta:
 * 1. Storage (persistencia de datos)
 * 2. Calculator (lógica de negocio)
 * 3. UI (interfaz de usuario)
 * 4. i18n (internacionalización)
 * 
 * SEPARACIÓN DE RESPONSABILIDADES:
 * - Storage: guarda/carga datos
 * - Calculator: calcula distribución de gastos
 * - UI: renderiza interfaces y maneja eventos DOM
 * - i18n: traducciones
 * 
 * Este patrón permite:
 * - Cambiar cualquier módulo sin afectar otros
 * - Testear lógica sin UI
 * - Reutilizar código en diferentes plataformas
 * - Mantener el código limpio y escalable
 */

// Helper global rápido para obtener elementos por id (sintaxis corta usada en el archivo)
const $i = (id) => document.getElementById(id);

class UtilityCalculatorApp {
  constructor() {
    // Carga datos guardados o usa esquema por defecto
    this.data = Storage.load() || Storage.getDefault();
    this.isInitialized = false;
  }

  /**
   * Inicializa la aplicación completamente
   * Se llama una sola vez al cargar la página
   */
  initialize() {
    if (this.isInitialized) return;

    console.log('Inicializando aplicación...');

    // Vincula eventos de UI
    this.bindUIEvents();

    // Renderiza estado inicial
    this.refresh();

    // Auto-guarda cuando cambian datos (evento beforeunload)
    window.addEventListener('beforeunload', () => this.save());

    // Cambio de idioma
    document.addEventListener('languageChanged', (e) => {
      console.log(`Idioma cambiado a: ${e.detail.lang}`);
      this.refresh();
    });

    this.isInitialized = true;
    console.log('Aplicación lista');
  }

  /**
   * Vincula todos los eventos de la UI a funciones de la aplicación
   */
  bindUIEvents() {
    UI.bindInputEvents({
      onInputChange: () => this.handleInputChange(),
      onAddUnit: () => this.handleAddUnit(),
      onAddExtra: () => this.handleAddExtra(),
      onUnitSummaryChange: () => this.handleUnitSummaryChange(),
      onIncludesChange: () => this.handleIncludesChange(),
      onMonthChange: () => this.handleMonthChange(),
      onExport: () => this.handleExport(),
      onImport: () => this.handleImportClick(),
      onImportFile: (e) => this.handleImportFile(e),
      onReset: () => this.handleReset(),
      onGenerateReceipt: () => this.handleGenerateReceipt()
    });

    // Event listener para cambiar tema (Light/Dark)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      // Restaurar tema guardado al cargar
      const savedTheme = localStorage.getItem('appTheme');
      if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
      }

      themeToggle.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('appTheme', newTheme);
        
        // Cambiar emoji del botón
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
      });
    }
  }

  /**
   * Se dispara cuando cualquier input cambia (electricidad, agua, gas, etc.)
   * Actualiza el estado y recalcula
   */
  handleInputChange() {
    const values = UI.getInputValues();

    // Actualiza el estado con los nuevos valores
    this.data.electricityA = values.electricityA;
    this.data.electricityB = values.electricityB;
    this.data.water = { totalPrice: values.water };
    this.data.gas = values.gas;
    this.data.cleaningFees = {
      receiptA: values.cleaningFeesA,
      receiptB: values.cleaningFeesB
    };

    // Guarda y refresca
    this.save();
    this.refresh();
  }

  /**
   * Se dispara cuando el usuario quiere agregar una unidad nueva
   */
  handleAddUnit() {
    const values = UI.getInputValues();
    const { name, people, rent } = values.newUnit;

    // Valida entrada
    if (!name) {
      UI.showMessage(i18n.t('alertUnitNameRequired'), 'error');
      return;
    }

    // Evita duplicados
    if (this.data.units.some(u => u.id === name)) {
      UI.showMessage(`Unidad ${name} ya existe`, 'error');
      return;
    }

    // Agrega nueva unidad
    this.data.units.push({
      id: name,
      people: Math.max(0, people),
      rent: Math.max(0, rent)
    });

    UI.clearNewUnitInputs();
    this.save();
    this.refresh();
    UI.showMessage(`Unidad ${name} agregada`, 'success');
  }

  /**
   * Se dispara cuando el usuario quiere agregar un cargo adicional
   */
  handleAddExtra() {
    const values = UI.getInputValues();
    const { name, amount, unitId } = values.newExtra;

    // Valida entrada
    if (!name) {
      UI.showMessage(i18n.t('alertExtraNameRequired'), 'error');
      return;
    }

    if (!unitId) {
      UI.showMessage(i18n.t('alertUnitRequired'), 'error');
      return;
    }

    // Valida que la unidad exista
    if (!this.data.units.some(u => u.id === unitId)) {
      UI.showMessage(i18n.t('alertUnitRequired'), 'error');
      return;
    }

    // Agrega nuevo extra
    this.data.extras.push({
      id: Date.now().toString(36),
      name,
      amount: Math.max(0, amount),
      unitId
    });

    UI.clearNewExtraInputs();
    this.save();
    this.refresh();
    UI.showMessage(`Cargo "${name}" agregado a ${unitId}`, 'success');
  }

  /**
   * Se dispara cuando cambia la selección de unidad en el resumen
   */
  handleUnitSummaryChange() {
    this.renderSummary();
  }

  /**
   * Se dispara cuando cambia algún checkbox de inclusión
   */
  handleIncludesChange() {
    this.renderSummary();
  }

  /**
   * Se dispara cuando cambia el mes seleccionado
   */
  handleMonthChange() {
    this.renderSummary();
  }

  /**
   * Exporta los datos actuales como JSON descargable
   */
  handleExport() {
    try {
      const jsonString = Storage.exportJSON(this.data);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `recibos-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      UI.showMessage('Datos exportados correctamente', 'success');
    } catch (error) {
      UI.showMessage(`Error al exportar: ${error.message}`, 'error');
    }
  }

  /**
   * Simula click en input file para importar
   */
  handleImportClick() {
    const fileInput = UI.getElement('import-file');
    if (fileInput) fileInput.click();
  }

  /**
   * Maneja la importación de archivo JSON
   */
  handleImportFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = Storage.importJSON(e.target.result);
        if (!importedData) {
          UI.showMessage(i18n.t('alertInvalidFormat'), 'error');
          return;
        }

        this.data = importedData;
        this.save();
        this.refresh();
        UI.showMessage(i18n.t('alertImportSuccess'), 'success');
      } catch (error) {
        UI.showMessage(i18n.t('alertImportError', { '%ERROR%': error.message }), 'error');
      }
    };

    reader.readAsText(file);

    // Limpia el input para permitir re-seleccionar el mismo archivo
    event.target.value = '';
  }

  /**
   * Borra todos los datos y resetea a valores por defecto
   */
  handleReset() {
    if (!confirm(i18n.t('confirmDeleteAll'))) {
      return;
    }

    this.data = Storage.getDefault();
    Storage.clear();
    this.refresh();
    UI.showMessage('Datos borrados', 'success');
  }

  /**
   * Elimina una unidad por índice
   */
  deleteUnit(index) {
    const unit = this.data.units[index];
    if (!unit) return;

    const confirmed = confirm(
      i18n.t('confirmDeleteUnit', { '%UNIT%': unit.id })
    );
    if (!confirmed) return;

    // Elimina unidad
    this.data.units.splice(index, 1);

    // Elimina extras asignados a esa unidad
    this.data.extras = this.data.extras.filter(e => e.unitId !== unit.id);

    this.save();
    this.refresh();
    UI.showMessage(`Unidad ${unit.id} eliminada`, 'success');
  }

  /**
   * Actualiza una unidad con nuevos valores
   */
  updateUnit(index, updatedUnit) {
    if (!this.data.units[index]) return;

    // Si cambió el ID, actualiza referencias en extras
    const oldId = this.data.units[index].id;
    if (oldId !== updatedUnit.id) {
      this.data.extras.forEach(e => {
        if (e.unitId === oldId) {
          e.unitId = updatedUnit.id;
        }
      });
    }

    this.data.units[index] = updatedUnit;
    this.save();
    this.refresh();
  }

  /**
   * Elimina un extra por índice
   */
  deleteExtra(index) {
    const extra = this.data.extras[index];
    if (!extra) return;

    const confirmed = confirm(
      i18n.t('confirmDeleteExtra', {
        '%EXTRA%': extra.name,
        '%AMOUNT%': UI.formatCurrency(extra.amount),
        '%UNIT%': extra.unitId
      })
    );
    if (!confirmed) return;

    this.data.extras.splice(index, 1);
    this.save();
    this.refresh();
    UI.showMessage(`Cargo eliminado`, 'success');
  }

  /**
   * Elimina un extra del resumen
   */
  deleteExtraFromSummary(extraId) {
    const index = this.data.extras.findIndex(e => e.id === extraId);
    if (index >= 0) {
      this.deleteExtra(index);
    }
  }

  /**
   * Genera recibo como imagen PNG
   */
  handleGenerateReceipt() {
    const unitId = UI.getInputValues().selectedUnit;
    if (!unitId) {
      UI.showMessage(i18n.t('alertSelectUnit'), 'error');
      return;
    }

    const includes = UI.getInputValues().summaryIncludes;
    const month = UI.getInputValues().selectedMonth;

    // Valida que html2canvas esté disponible
    if (typeof html2canvas === 'undefined') {
      UI.showMessage(i18n.t('alertLibraryNotLoaded'), 'error');
      return;
    }

    // Calcula resumen
    const summary = Calculator.calculateUnitSummary(this.data, unitId, includes);
    if (!summary) {
      UI.showMessage(i18n.t('alertUnitNotFound'), 'error');
      return;
    }

    // Construye HTML del recibo
    const unit = this.data.units.find(u => u.id === unitId);
    const receiptHTML = this.buildReceiptHTML(unitId, summary, month, unit, includes);

    // Renderiza fuera de pantalla
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.innerHTML = receiptHTML;
    document.body.appendChild(container);

    // Convierte a imagen
    html2canvas(container, { scale: 2, backgroundColor: '#ffffff' })
      .then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `recibo_${unitId}_${month}.png`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        container.remove();
      })
      .catch(error => {
        console.error('Error generando imagen:', error);
        UI.showMessage(i18n.t('alertGenerateError'), 'error');
        container.remove();
      });
  }

  /**
   * Construye el HTML de un recibo para exportar como imagen
   */
  buildReceiptHTML(unitId, summary, month, unit, includes) {
    const now = new Date();
    let extrasRows = '';

    if (summary.extrasList && summary.extrasList.length > 0) {
      summary.extrasList.forEach(extra => {
        extrasRows += `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e6edf3;">
              ${extra.name}
            </td>
            <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e6edf3;">
              ${i18n.t('currency')} ${UI.formatCurrency(extra.amount)}
            </td>
          </tr>
        `;
      });
    }

    return `
      <div style="
        padding: 30px;
        background: #fff;
        color: #0f172a;
        font-family: Inter, Arial, sans-serif;
        width: 520px;
        box-sizing: border-box;
      ">
        <div style="
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #2b6cb0;
          padding-bottom: 15px;
        ">
          <div>
            <h2 style="margin: 0 0 5px 0; color: #2b6cb0;">
              ${i18n.t('receipt')} - Unidad ${unitId}
            </h2>
            <div style="color: #6b7280; font-size: 14px;">
              ${i18n.t('month')}: ${month}
            </div>
          </div>
          <div style="font-size: 16px; font-weight: 600;">
            ${now.toLocaleDateString()}
          </div>
        </div>

        <div style="
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
        ">
          <div style="margin-bottom: 8px;">
            <strong>${i18n.t('people')}:</strong> ${unit?.people || 0}
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tbody>
            ${includes.rent ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('rent')}
                </td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('currency')} ${UI.formatCurrency(summary.rent)}
                </td>
              </tr>
            ` : ''}
            ${includes.electricity ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('electricity')}
                </td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('currency')} ${UI.formatCurrency(summary.electricity)}
                </td>
              </tr>
            ` : ''}
            ${includes.water ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('water')}
                </td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('currency')} ${UI.formatCurrency(summary.water)}
                </td>
              </tr>
            ` : ''}
            ${includes.gas ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('gas')}
                </td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('currency')} ${UI.formatCurrency(summary.gas)}
                </td>
              </tr>
            ` : ''}
            ${includes.cleaning ? `
              <tr>
                <td style="padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('aseo')}
                </td>
                <td style="text-align: right; padding: 8px; border-bottom: 1px solid #e6edf3;">
                  ${i18n.t('currency')} ${UI.formatCurrency(summary.cleaning)}
                </td>
              </tr>
            ` : ''}
            ${extrasRows}
            <tr>
              <td style="
                padding: 12px 8px;
                border-top: 3px solid #2b6cb0;
                font-weight: 700;
                font-size: 18px;
              ">
                ${i18n.t('total')}
              </td>
              <td style="
                text-align: right;
                padding: 12px 8px;
                border-top: 3px solid #2b6cb0;
                font-weight: 700;
                font-size: 18px;
              ">
                ${i18n.t('currency')} ${UI.formatCurrency(summary.total)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style="
          border-top: 1px solid #e6edf3;
          padding-top: 15px;
          color: #6b7280;
          font-size: 12px;
          text-align: center;
        ">
          Generado automáticamente por Calculadora de Recibos
        </div>
      </div>
    `;
  }

  /**
   * Renderiza el resumen de pago
   */
  renderSummary() {
    const unitId = UI.getInputValues().selectedUnit || (this.data.units[0]?.id);
    const includes = UI.getInputValues().summaryIncludes;
    const month = UI.getInputValues().selectedMonth || '';

    const summary = Calculator.calculateUnitSummary(this.data, unitId, includes);

    UI.renderUnitSummary(
      summary,
      unitId,
      month,
      (extraId) => this.deleteExtraFromSummary(extraId)
    );
  }

  /**
   * Guarda los datos en localStorage
   */
  save() {
    const saved = Storage.save(this.data);
    if (!saved) {
      console.error('Error al guardar datos');
    }
  }

  /**
   * Refresca toda la UI con el estado actual
   * Se llama después de cambios significativos
   */
  refresh() {
    // Inicializa inputs desde estado
    UI.initializeInputsFromData(this.data);

    // Renderiza lista de unidades
    UI.renderUnits(this.data.units, {
      onUpdate: (idx, unit) => this.updateUnit(idx, unit),
      onRemove: (idx) => this.deleteUnit(idx)
    });

    // Llena el select de unidades para el resumen
    UI.populateUnitSelector(this.data.units);

    // Renderiza lista de extras
    UI.renderExtras(this.data.extras, this.data.units, {
      onRemove: (idx) => this.deleteExtra(idx)
    });

    // Calcula y renderiza resultados
    let { results } = Calculator.calculateAllocations(this.data);

    // Aplica overrides manuales si el modo manual está activado
    if (this.data.manualModeActive && this.data.manualOverrides) {
      Object.entries(this.data.manualOverrides).forEach(([key, value]) => {
        const [unitId, field] = key.split('.');
        if (results[unitId]) {
          results[unitId][field] = value;
        }
      });
    }

    UI.renderResults(results, this.data.extras);

    // Renderiza modo manual (para editar valores)
    UI.renderManualMode(results, this.data.manualOverrides || {}, this.data.manualModeActive || false, (unitId, field, value) => {
      // Callback para cuando el usuario edita manualmente un valor
      
      if (unitId === '__toggle__' && field === '__manual_mode__') {
        // Toggle del modo manual (Activo/Inactivo)
        this.data.manualModeActive = value === 1;
        console.log(`Modo Manual ${this.data.manualModeActive ? 'ACTIVADO' : 'DESACTIVADO'}`);
        this.save();
        this.refresh();
        return;
      }

      // Establecer override para un valor específico
      const key = `${unitId}.${field}`;
      if (!this.data.manualOverrides) {
        this.data.manualOverrides = {};
      }

      this.data.manualOverrides[key] = value;
      console.log(`Modo Manual: ${key} = ${value}`);
      
      this.save();
      this.refresh();
    });

    // Renderiza detalles de cálculos
    UI.renderCalculationDetails(this.data, results);

    // Renderiza resumen
    this.renderSummary();
  }
}

// Inicia la aplicación cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  const app = new UtilityCalculatorApp();
  app.initialize();

  // Expone app globalmente para debugging (opcional)
  window.app = app;

  // Event delegation para botones colapsables (funciona incluso con contenido dinámico)
  document.addEventListener('click', (e) => {
    const header = e.target.closest('.collapse-header');
    if (header) {
      const toggleId = header.getAttribute('data-toggle');
      const content = document.getElementById(toggleId);
      const icon = header.querySelector('.collapse-icon');
      
      if (content && icon) {
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        icon.textContent = isOpen ? '▶' : '▼';
        header.classList.toggle('active', !isOpen);
      }
    }
  });

  // Event delegation para botones de acordeón dentro de detalles de cálculos
  document.addEventListener('click', (e) => {
    const accordionHeader = e.target.closest('.accordion-header');
    if (accordionHeader) {
      const toggleId = accordionHeader.getAttribute('data-toggle');
      const content = document.getElementById(toggleId);
      const icon = accordionHeader.querySelector('.accordion-icon');
      
      if (content && icon) {
        const isOpen = content.style.display !== 'none';
        content.style.display = isOpen ? 'none' : 'block';
        icon.textContent = isOpen ? '▶' : '▼';
        accordionHeader.classList.toggle('active', !isOpen);
      }
    }
  });
});

// ---------- Utilidades de formato ----------
/**
 * Formatea un número como moneda con separador de miles
 * Ejemplo: 1000000.5 → "1.000.000,5"
 * Solo muestra decimales si son necesarios
 */
function formatMoney(value) {
  const n = Number(value || 0);
  const fixed = n.toFixed(2);
  const [intPart, decPart] = fixed.split('.');
  // Agregar puntos como separador de miles
  const intWithDots = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  // Remover ceros al final
  const decTrimmed = decPart.replace(/0+$/, '');
  // Si no hay decimales, devolver sin coma
  if (decTrimmed === '') return intWithDots;
  // Si hay decimales, usar coma
  return `${intWithDots},${decTrimmed}`;
}

// ---------- DOM helpers ----------
function renderUnits(){
  const container = $i('units-list');
  container.innerHTML = '';
  state.units.forEach((u, idx) => {
    const row = document.createElement('div'); row.className = 'unit-row';
    const nameInput = document.createElement('input'); nameInput.value = u.id; nameInput.type='text';
    nameInput.addEventListener('change', ()=>{ u.id = nameInput.value.trim() || u.id; syncAndSave(); renderUnits(); renderExtrasEditor(); computeAndRender(); });
    const peopleInput = document.createElement('input'); peopleInput.type='number'; peopleInput.min=0; peopleInput.value = u.people;
    peopleInput.addEventListener('change', ()=>{ u.people = Math.max(0, Number(peopleInput.value) || 0); syncAndSave(); computeAndRender(); });
    const rentInput = document.createElement('input'); rentInput.type='number'; rentInput.min=0; rentInput.value = u.rent || 0; rentInput.style.width='100px';
    rentInput.placeholder = 'Arriendo';
    rentInput.addEventListener('change', ()=>{ u.rent = Math.max(0, Number(rentInput.value) || 0); syncAndSave(); computeAndRender(); });
    const removeBtn = document.createElement('button'); removeBtn.className='small-btn'; removeBtn.textContent='Eliminar';
    removeBtn.addEventListener('click', ()=>{
      if(!confirm(`¿Eliminar la unidad ${u.id}? Esta acción quitará también sus extras.`)) return;
      state.units.splice(idx,1);
      // also remove extras assigned to this unit
      state.extras = state.extras.filter(e => e.unitId !== u.id);
      syncAndSave(); renderUnits(); renderExtrasEditor(); computeAndRender();
    });
    row.appendChild(nameInput);
    row.appendChild(peopleInput);
    row.appendChild(rentInput);
    row.appendChild(removeBtn);
    container.appendChild(row);
  });
  // populate extra-unit-select
  renderExtrasEditor();
  // populate summary select
  const s = $i('unit-summary-select'); if(s){ s.innerHTML = ''; state.units.forEach(u=>{ const opt=document.createElement('option'); opt.value=u.id; opt.textContent=u.id; s.appendChild(opt); }); }
}

function renderExtrasEditor(){
  const select = $i('extra-unit-select');
  select.innerHTML = '';
  state.units.forEach(u=>{
    const opt = document.createElement('option'); opt.value = u.id; opt.textContent = u.id;
    select.appendChild(opt);
  });
  // render extras list
  const list = $i('extras-list'); list.innerHTML = '';
  state.extras.forEach((ex, idx)=>{
    const row = document.createElement('div'); row.className='extra-row';
    const text = document.createElement('div'); text.style.flex='1'; text.innerHTML = `<strong>${ex.name}</strong> — ${formatMoney(ex.amount)} — → ${ex.unitId}`;
    const del = document.createElement('button'); del.className='small-btn'; del.textContent='Eliminar';
    del.addEventListener('click', ()=>{
      if(!confirm(`¿Eliminar el extra "${ex.name}" (${formatMoney(ex.amount)}) de la unidad ${ex.unitId}?`)) return;
      state.extras.splice(idx,1);
      syncAndSave(); renderExtrasEditor(); computeAndRender();
    });
    row.appendChild(text); row.appendChild(del);
    list.appendChild(row);
  });
}

// ---------- Inputs binding ----------
function bindInputs(){
  // Units add
  $i('add-unit').addEventListener('click', ()=>{
    const name = $i('new-unit-name').value.trim();
    const people = Math.max(0, Number($i('new-unit-people').value) || 0);
    const rent = Math.max(0, Number($i('new-unit-rent').value) || 0);
    if(!name) return alert('Ingresa nombre de unidad');
    state.units.push({ id: name, people, rent });
    $i('new-unit-name').value='';
    $i('new-unit-people').value='1';
    $i('new-unit-rent').value='0';
    syncAndSave(); renderUnits(); computeAndRender();
  });

  // Electricity EA
  $i('ea-total-kwh').addEventListener('input', e=>{ state.ea.totalKwh = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('ea-total-price').addEventListener('input', e=>{ state.ea.totalPrice = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('ea-prev-202').addEventListener('input', e=>{ state.ea.prev202 = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('ea-curr-202').addEventListener('input', e=>{ state.ea.curr202 = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  const eaAseo = $i('ea-aseo'); if(eaAseo) eaAseo.addEventListener('input', e=>{ state.ea_aseo = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  // Electricity EB
  $i('eb-total-kwh').addEventListener('input', e=>{ state.eb.totalKwh = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('eb-total-price').addEventListener('input', e=>{ state.eb.totalPrice = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('eb-prev-401').addEventListener('input', e=>{ state.eb.prev401 = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('eb-curr-401').addEventListener('input', e=>{ state.eb.curr401 = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('eb-prev-500').addEventListener('input', e=>{ state.eb.prev500 = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('eb-curr-500').addEventListener('input', e=>{ state.eb.curr500 = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  const ebAseo = $i('eb-aseo'); if(ebAseo) ebAseo.addEventListener('input', e=>{ state.eb_aseo = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });

  // Water
  $i('water-total-price').addEventListener('input', e=>{ state.water.totalPrice = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });

  // Gas
  $i('gas-201-202-price').addEventListener('input', e=>{ state.gas.price201_202 = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });
  $i('gas-401-402-price').addEventListener('input', e=>{ state.gas.price401_402 = Number(e.target.value)||0; syncAndSave(); computeAndRender(); });

  // Extras add (per unit)
  $i('add-extra').addEventListener('click', ()=>{
    const name = $i('extra-name').value.trim(); const amount = Number($i('extra-amount').value) || 0;
    const unitId = $i('extra-unit-select').value;
    if(!name) return alert('Nombre del extra requerido');
    if(!unitId) return alert('Selecciona una unidad para asignar el extra');
    const id = Date.now().toString(36);
    state.extras.push({ id, name, amount, unitId });
    $i('extra-name').value=''; $i('extra-amount').value='';
    syncAndSave(); renderExtrasEditor(); computeAndRender();
  });

  // Reset
  $i('reset-all').addEventListener('click', ()=>{
    if(!confirm('¿Borrar todos los datos guardados?')) return;
    localStorage.removeItem(STORAGE_KEY);
    state = JSON.parse(JSON.stringify(defaultData));
    initializeUIFromState();
    syncAndSave();
    computeAndRender();
  });

  // Export / Import
  $i('export-json').addEventListener('click', ()=>{
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'utility-data.json'; document.body.appendChild(a);
    a.click(); a.remove(); URL.revokeObjectURL(url);
  });
  $i('import-json').addEventListener('click', ()=>{ $i('import-file').click(); });
  $i('import-file').addEventListener('change', (ev)=>{
    const f = ev.target.files[0]; if(!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        // minimal validation
        if(!imported.units) throw new Error('Formato inválido');
        state = imported;
        syncAndSave(); initializeUIFromState(); renderUnits(); computeAndRender();
        alert('Datos importados correctamente');
      } catch(e){
        alert('Error al importar: ' + e.message);
      }
    };
    reader.readAsText(f);
  });

  // Summary controls listeners (if present)
  const sel = $i('unit-summary-select'); if(sel) sel.addEventListener('change', renderUnitSummary);
  ['include-electricity','include-water','include-gas','include-extras','include-rent'].forEach(id=>{
    const el = $i(id); if(el) el.addEventListener('change', renderUnitSummary);
  });
  const elAseo = $i('include-aseo'); if(elAseo) elAseo.addEventListener('change', renderUnitSummary);
  const monthSel = $i('summary-month-select'); if(monthSel){ monthSel.addEventListener('change', renderUnitSummary); }
  // PDF/print receipt removed; image-only generation handled below
  const genImgBtn = $i('generate-receipt-img'); if(genImgBtn) genImgBtn.addEventListener('click', ()=>{
    const selUnit = $i('unit-summary-select'); if(!selUnit) return alert('Selecciona la unidad primero');
    const unitId = selUnit.value;
    const includes = {
      electricity: !!$i('include-electricity')?.checked,
      water: !!$i('include-water')?.checked,
      gas: !!$i('include-gas')?.checked,
      extras: !!$i('include-extras')?.checked,
      rent: !!$i('include-rent')?.checked,
      aseo: !!$i('include-aseo')?.checked
    };
    const month = $i('summary-month-select')?.value || '';
    generateReceiptImage(unitId, includes, month);
  });
}

// ---------- COMPUTATION ----------
// Based on the user's description:
// - Recibo A: total kWh + precio total -> precio/kWh.
//   - 202 consumo = curr202 - prev202
//   - 201 consumo = totalKwhA - consumo202
// - Recibo B: total kWh + precio total -> precio/kWh.
//   - 401 consumo = curr401 - prev401
//   - 500 consumo = curr500 - prev500
//   - 402 consumo = totalKwhB - consumo401 - consumo500
//
// Water: price per head = totalWater / totalPeople(all units). Each unit pays peopleUnit * pricePerHead.
//
// Gas: two recibos: one for (201+202) and another for (401+402). Each recibo price divided by people in the group, multiplied by people in each unit of the group.
//
// Extras: can be equal-share among all units or assigned to a specific unit.

function computeAllocations(){
  const units = state.units.map(u => ({ id: u.id, people: Number(u.people)||0, rent: Number(u.rent)||0 }));
  // Initialize results map
  const results = {}; units.forEach(u => results[u.id] = { electricity: 0, water: 0, gas: 0, extras: 0, aseo: 0, rent: Number(u.rent)||0, breakdown: {} });

  // --- ELECTRICITY A ---
  const ea = state.ea;
  const ea_totalKwh = Number(ea.totalKwh)||0;
  const ea_totalPrice = Number(ea.totalPrice)||0;
  const ea_pricePerKwh = ea_totalKwh > 0 ? (ea_totalPrice / ea_totalKwh) : 0;
  const consumption202 = Math.max(0, (Number(ea.curr202)||0) - (Number(ea.prev202)||0));
  // find unit ids 201 and 202 in current units
  const id201 = findUnitIdLike(units, '201');
  const id202 = findUnitIdLike(units, '202');
  // consumption201 = remaining kwh of receipt A
  const consumption201 = Math.max(0, ea_totalKwh - consumption202);

  if(id202) results[id202].electricity += consumption202 * ea_pricePerKwh;
  if(id201) results[id201].electricity += consumption201 * ea_pricePerKwh;

  // --- ELECTRICITY B ---
  const eb = state.eb;
  const eb_totalKwh = Number(eb.totalKwh)||0;
  const eb_totalPrice = Number(eb.totalPrice)||0;
  const eb_pricePerKwh = eb_totalKwh > 0 ? (eb_totalPrice / eb_totalKwh) : 0;

  const consumption401 = Math.max(0, (Number(eb.curr401)||0) - (Number(eb.prev401)||0));
  const consumption500 = Math.max(0, (Number(eb.curr500)||0) - (Number(eb.prev500)||0));
  const id401 = findUnitIdLike(units, '401');
  const id500 = findUnitIdLike(units, '500');
  const id402 = findUnitIdLike(units, '402');
  // 402 = total - 401 - 500
  let consumption402 = Math.max(0, eb_totalKwh - consumption401 - consumption500);

  if(id401) results[id401].electricity += consumption401 * eb_pricePerKwh;
  if(id500) results[id500].electricity += consumption500 * eb_pricePerKwh;
  if(id402) results[id402].electricity += consumption402 * eb_pricePerKwh;

  // --- WATER ---
  const waterTotal = Number(state.water.totalPrice)||0;
  const totalPeople = units.reduce((s,u)=>s + (Number(u.people)||0), 0);
  const pricePerHead = totalPeople > 0 ? (waterTotal / totalPeople) : 0;
  units.forEach(u => {
    const val = (Number(u.people)||0) * pricePerHead;
    results[u.id].water += val;
  });

  // --- GAS ---
  // Receipt for 201+202
  const gasA = Number(state.gas.price201_202)||0;
  const groupA_units = ['201','202'].map(x => findUnitIdLike(units,x)).filter(Boolean);
  const groupA_people = groupA_units.reduce((s,id)=> s + (units.find(u=>u.id===id).people||0), 0);
  const gasA_perHead = groupA_people > 0 ? (gasA / groupA_people) : 0;
  groupA_units.forEach(id=>{
    const people = units.find(u=>u.id===id).people||0;
    results[id].gas += people * gasA_perHead;
  });

  // Receipt for 401+402
  const gasB = Number(state.gas.price401_402)||0;
  const groupB_units = ['401','402'].map(x => findUnitIdLike(units,x)).filter(Boolean);
  const groupB_people = groupB_units.reduce((s,id)=> s + (units.find(u=>u.id===id).people||0), 0);
  const gasB_perHead = groupB_people > 0 ? (gasB / groupB_people) : 0;
  groupB_units.forEach(id=>{
    const people = units.find(u=>u.id===id).people||0;
    results[id].gas += people * gasB_perHead;
  });

  // --- EXTRAS (todos asignados por unidad) ---
  state.extras.forEach(ex=>{
    if(results[ex.unitId]){
      const amt = Number(ex.amount) || 0;
      results[ex.unitId].extras += amt;
      // ensure breakdown extrasList and extrasMap exist
      results[ex.unitId].breakdown.extrasList = results[ex.unitId].breakdown.extrasList || [];
      results[ex.unitId].breakdown.extrasList.push({ id: ex.id, name: ex.name, amount: amt });
      results[ex.unitId].breakdown.extrasMap = results[ex.unitId].breakdown.extrasMap || {};
      results[ex.unitId].breakdown.extrasMap[ex.name] = (results[ex.unitId].breakdown.extrasMap[ex.name] || 0) + amt;
    }
  });

  // --- ASEO ---
  // Recibo A -> units 201 & 202
  const eaAseo = Number(state.ea_aseo) || 0;
  const eaUnitIds = ['201','202'].map(x=> findUnitIdLike(units,x)).filter(Boolean);
  const eaOccupied = eaUnitIds.filter(id => (units.find(u=>u.id===id).people || 0) > 0);
  if(eaAseo > 0 && eaOccupied.length > 0){
    const per = eaAseo / eaOccupied.length;
    eaOccupied.forEach(id => { results[id].aseo += per; results[id].breakdown.aseo = (results[id].breakdown.aseo||0) + per; });
  }

  // Recibo B -> units 401,402,500
  const ebAseo = Number(state.eb_aseo) || 0;
  const ebUnitIds = ['401','402','500'].map(x=> findUnitIdLike(units,x)).filter(Boolean);
  const ebOccupied = ebUnitIds.filter(id => (units.find(u=>u.id===id).people || 0) > 0);
  if(ebAseo > 0 && ebOccupied.length > 0){
    const per = ebAseo / ebOccupied.length;
    ebOccupied.forEach(id => { results[id].aseo += per; results[id].breakdown.aseo = (results[id].breakdown.aseo||0) + per; });
  }

  // rounding and totals
  units.forEach(u=>{
    const r = results[u.id];
    r.electricity = Number((r.electricity||0).toFixed(2));
    r.water = Number((r.water||0).toFixed(2));
    r.gas = Number((r.gas||0).toFixed(2));
    r.extras = Number((r.extras||0).toFixed(2));
    r.aseo = Number((r.aseo||0).toFixed(2));
    r.rent = Number((r.rent||0).toFixed(2));
    r.total = Number((r.electricity + r.water + r.gas + r.extras + r.aseo + r.rent).toFixed(2));
  });

  return { results, debug: { ea_pricePerKwh, eb_pricePerKwh, consumption202, consumption201, consumption401, consumption500, consumption402, pricePerHead, gasA_perHead, gasB_perHead } };
}

// Compute a per-unit summary with optional includes
function computeUnitSummary(unitId, includes){
  const { results } = computeAllocations();
  const r = results[unitId];
  if(!r) return null;
  const breakdown = {};
  breakdown.electricity = includes.electricity ? r.electricity : 0;
  breakdown.water = includes.water ? r.water : 0;
  breakdown.gas = includes.gas ? r.gas : 0;
  // include detailed extras list when requested
  breakdown.extrasList = includes.extras ? (r.breakdown.extrasList || []) : [];
  breakdown.extras = breakdown.extrasList.reduce((s,it)=>s + (Number(it.amount)||0), 0);
  breakdown.aseo = includes.aseo ? (Number(r.aseo)||0) : 0;
  breakdown.rent = includes.rent ? r.rent : 0;
  breakdown.total = Number((breakdown.electricity + breakdown.water + breakdown.gas + breakdown.extras + breakdown.aseo + breakdown.rent).toFixed(2));
  return breakdown;
}

function renderUnitSummary(){
  const sel = $i('unit-summary-select'); if(!sel) return;
  const unitId = sel.value || (state.units[0] && state.units[0].id);
  const includes = {
    electricity: !!$i('include-electricity')?.checked,
    water: !!$i('include-water')?.checked,
    gas: !!$i('include-gas')?.checked,
    extras: !!$i('include-extras')?.checked,
    rent: !!$i('include-rent')?.checked,
    aseo: !!$i('include-aseo')?.checked
  };
  const s = computeUnitSummary(unitId, includes);
  const card = $i('unit-summary-card');
  if(!s){ card.innerHTML = '<p>Selecciona una unidad válida.</p>'; return; }
  // Render summary as a neat table with rows per concept and per-extra rows (Arriendo first)
  const month = $i('summary-month-select')?.value || '';
  const generatedAt = new Date();
  let rows = '';
  if(includes.rent) rows += `<tr><td>Arriendo</td><td style="text-align:right">$ ${formatMoney(s.rent)}</td></tr>`;
  if(includes.electricity) rows += `<tr><td>Luz</td><td style="text-align:right">$ ${formatMoney(s.electricity)}</td></tr>`;
  if(includes.water) rows += `<tr><td>Agua</td><td style="text-align:right">$ ${formatMoney(s.water)}</td></tr>`;
  if(includes.gas) rows += `<tr><td>Gas</td><td style="text-align:right">$ ${formatMoney(s.gas)}</td></tr>`;
  if(includes.aseo) rows += `<tr><td>Aseo</td><td style="text-align:right">$ ${formatMoney(s.aseo)}</td></tr>`;
  if(includes.extras){
    if(s.extrasList && s.extrasList.length){
      s.extrasList.forEach(ex => {
        rows += `<tr class="extra-row-item"><td style="text-align:left">${ex.name}</td><td style="text-align:right">$ ${formatMoney(ex.amount)} <button class="small-btn extra-remove" data-extra-id="${ex.id}" style="margin-left:.5rem">Quitar</button></td></tr>`;
      });
    } else {
      rows += `<tr><td>Extras</td><td style="text-align:right">$ ${formatMoney(0)}</td></tr>`;
    }
  }
  rows += `<tr class="summary-total"><td style="font-weight:700">Total</td><td style="text-align:right;font-weight:700">$ ${formatMoney(s.total)}</td></tr>`;

  card.innerHTML = `<div class="summary-panel"><div style="margin-bottom:.5rem"><strong>${unitId}</strong><div style="color:var(--muted);font-size:.9rem">Mes: ${month} — Generado: ${generatedAt.toLocaleDateString()}</div></div><table class="summary-table"><tbody>${rows}</tbody></table></div>`;

  // attach remove listeners for extras inside the card (with confirmation)
  const remBtns = card.querySelectorAll('.extra-remove');
  remBtns.forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const eid = btn.getAttribute('data-extra-id');
      const ex = state.extras.find(e=>e.id===eid);
      if(!ex) return;
      if(!confirm(`¿Eliminar el extra "${ex.name}" (${formatMoney(ex.amount)}) de la unidad ${ex.unitId}?`)) return;
      state.extras = state.extras.filter(e => e.id !== eid);
      syncAndSave();
      renderExtrasEditor();
      computeAndRender();
      renderUnitSummary();
    });
  });
}

// Generate a printable receipt for a unit (opens new window and prints)
// PDF/print receipt removed per request.

// Generate receipt as PNG image using html2canvas (requires html2canvas loaded)
function generateReceiptImage(unitId, includes, month){
  const breakdown = computeUnitSummary(unitId, { electricity: includes.electricity, water: includes.water, gas: includes.gas, extras: includes.extras, rent: includes.rent, aseo: includes.aseo });
  if(!breakdown) return alert('Unidad no encontrada');
  const unit = state.units.find(u=>u.id===unitId) || { people: 0 };
  const dateStr = new Date().toLocaleDateString();
  let extrasHtml = '';
  if(breakdown.extrasList && breakdown.extrasList.length){
    breakdown.extrasList.forEach(ex => { extrasHtml += `<tr><td>${ex.name}</td><td style="text-align:right">$ ${formatMoney(ex.amount)}</td></tr>`; });
  }
  const container = document.createElement('div');
  container.style.padding = '20px';
  container.style.background = '#fff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'Inter, Arial, Helvetica, sans-serif';
  container.style.width = '520px';
  container.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center"><div><h2 style=\"margin:0\">Recibo - Unidad ${unitId}</h2><div style=\"color:#6b7280;font-size:.9rem\">Mes: ${month || ''}</div></div><div>${dateStr}</div></div>
    <div style=\"border:1px solid #e6edf3;padding:12px;border-radius:8px;margin-top:12px\">\n      <div>Personas: ${unit.people || 0}</div>\n      <table style=\"width:100%;border-collapse:collapse;margin-top:8px\">\n        <tbody>\n          ${includes.rent ? `<tr><td>Arriendo</td><td style=\"text-align:right\">$ ${formatMoney(breakdown.rent)}</td></tr>` : ''}\n          ${includes.electricity ? `<tr><td>Luz</td><td style=\"text-align:right\">$ ${formatMoney(breakdown.electricity)}</td></tr>` : ''}\n          ${includes.water ? `<tr><td>Agua</td><td style=\"text-align:right\">$ ${formatMoney(breakdown.water)}</td></tr>` : ''}\n          ${includes.gas ? `<tr><td>Gas</td><td style=\"text-align:right\">$ ${formatMoney(breakdown.gas)}</td></tr>` : ''}\n          ${includes.aseo ? `<tr><td>Aseo</td><td style=\"text-align:right\">$ ${formatMoney(breakdown.aseo)}</td></tr>` : ''}\n          ${extrasHtml}\n          <tr><td style=\"font-weight:700\">Total</td><td style=\"text-align:right;font-weight:700\">$ ${formatMoney(breakdown.total)}</td></tr>\n        </tbody>\n      </table>\n    </div>`;

  // Render image and embed into the unit summary card
  const card = $i('unit-summary-card');
  if(!card){ alert('Detalle de pago no disponible para mostrar la imagen.'); container.remove(); return; }
  const targetWrapper = card.querySelector('.receipt-image-wrapper') || document.createElement('div');
  targetWrapper.className = 'receipt-image-wrapper';
  // clear previous image
  targetWrapper.innerHTML = '<div style="color:var(--muted);font-size:.9rem">Generando imagen...</div>';
  card.appendChild(targetWrapper);
  if(typeof html2canvas === 'undefined'){
    targetWrapper.innerHTML = '<div style="color:var(--danger)">La librería html2canvas no está cargada.</div>';
    container.remove();
    return;
  }
  // append container off-screen so html2canvas can render it
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  document.body.appendChild(container);
  html2canvas(container, { scale:2, backgroundColor: '#ffffff' }).then(canvas => {
    const data = canvas.toDataURL('image/png');
    // auto-download the image (no preview)
    try{
      const autoA = document.createElement('a'); autoA.href = data; autoA.download = `recibo_${unitId}.png`;
      document.body.appendChild(autoA); autoA.click(); autoA.remove();
    }catch(e){ /* ignore download errors */ }
    // clear any previous wrapper content
    if(targetWrapper && targetWrapper.parentNode) targetWrapper.parentNode.removeChild(targetWrapper);
    container.remove();
  }).catch(err => { container.remove(); if(targetWrapper) targetWrapper.innerHTML = '<div style="color:var(--danger)">Error al generar imagen.</div>'; });
}

function findUnitIdLike(units, pattern){
  // Try exact match first
  const exact = units.find(u => u.id === pattern);
  if(exact) return exact.id;
  // else try includes pattern
  const incl = units.find(u => u.id && u.id.toString().includes(pattern));
  return incl ? incl.id : null;
}

// ---------- RENDER RESULTS ----------
function computeAndRender(){
  const { results, debug } = computeAllocations();
  const resultsDiv = $i('results');
  const ids = Object.keys(results);
  if(ids.length === 0){
    resultsDiv.innerHTML = '<p>No hay unidades registradas.</p>'; return;
  }
  // Build list of unique extra names (preserve order)
  const extraNames = [];
  state.extras.forEach(ex=>{ if(!extraNames.includes(ex.name)) extraNames.push(ex.name); });

  // table header (dynamic extras columns)
  let html = `<table class="results-table"><thead><tr><th>Unidad</th><th>Arriendo</th><th>Luz</th><th>Agua</th><th>Gas</th><th>Aseo</th>`;
  extraNames.forEach(n => { html += `<th style="min-width:120px">${n}</th>`; });
  html += `<th>Total</th></tr></thead><tbody>`;

  ids.forEach(id=>{
    const r = results[id];
    html += `<tr><td style="text-align:left">${id}</td><td>$ ${formatMoney(r.rent)}</td><td>$ ${formatMoney(r.electricity)}</td><td>$ ${formatMoney(r.water)}</td><td>$ ${formatMoney(r.gas)}</td><td>$ ${formatMoney(r.aseo)}</td>`;
    extraNames.forEach(n => {
      const v = (r.breakdown.extrasMap && r.breakdown.extrasMap[n]) ? formatMoney(r.breakdown.extrasMap[n]) : '';
      html += `<td>${v ? '$ ' + v : ''}</td>`;
    });
    html += `<td><strong>$ ${formatMoney(r.total)}</strong></td></tr>`;
  });
  html += `</tbody></table>`;

  // debug (hidden unless needed)
  html += `<details style="margin-top:.5rem"><summary>Ver cálculos detallados (debug)</summary>
  <pre style="white-space:pre-wrap">Precio kWh (recibo A): ${formatMoney(debug.ea_pricePerKwh)}
Precio kWh (recibo B): ${formatMoney(debug.eb_pricePerKwh)}
Consumo 202: ${formatMoney(debug.consumption202)} kWh
Consumo 201: ${formatMoney(debug.consumption201)} kWh
Consumo 401: ${formatMoney(debug.consumption401)} kWh
Consumo 500: ${formatMoney(debug.consumption500)} kWh
Consumo 402: ${formatMoney(debug.consumption402)} kWh
Precio: ${formatMoney(debug.pricePerHead)}
Precio gas (201+202) por cabeza: ${formatMoney(debug.gasA_perHead)}
Precio gas (401+402) por cabeza: ${formatMoney(debug.gasB_perHead)}</pre></details>`;

  resultsDiv.innerHTML = html;
}

// ---------- SYNC UI <-> STATE ----------
function initializeUIFromState(){
  // units rendered separately
  renderUnits();

  // EA
  $i('ea-total-kwh').value = state.ea.totalKwh || 0;
  $i('ea-total-price').value = state.ea.totalPrice || 0;
  $i('ea-prev-202').value = state.ea.prev202 || 0;
  $i('ea-curr-202').value = state.ea.curr202 || 0;
  $i('ea-aseo').value = state.ea_aseo || 0;

  // EB
  $i('eb-total-kwh').value = state.eb.totalKwh || 0;
  $i('eb-total-price').value = state.eb.totalPrice || 0;
  $i('eb-prev-401').value = state.eb.prev401 || 0;
  $i('eb-curr-401').value = state.eb.curr401 || 0;
  $i('eb-prev-500').value = state.eb.prev500 || 0;
  $i('eb-curr-500').value = state.eb.curr500 || 0;
  $i('eb-aseo').value = state.eb_aseo || 0;

  // Water
  $i('water-total-price').value = state.water.totalPrice || 0;

  // Gas
  $i('gas-201-202-price').value = state.gas.price201_202 || 0;
  $i('gas-401-402-price').value = state.gas.price401_402 || 0;

  // extras editor
  renderExtrasEditor();
  // populate months select
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const msel = $i('summary-month-select'); if(msel){ msel.innerHTML=''; const now=new Date(); months.forEach((m,i)=>{ const o=document.createElement('option'); o.value=m; o.textContent=m; if(i===now.getMonth()) o.selected=true; msel.appendChild(o); }); }
  // render summary controls initially
  renderUnitSummary();
}

function syncAndSave(){
  save(state);
}

// ---------- START ----------
function start(){
  bindInputs();
  initializeUIFromState();
  computeAndRender();
  // autosave on page unload
  window.addEventListener('beforeunload', ()=> save(state));
}

start();