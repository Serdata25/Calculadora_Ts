import './style.css'
import { applyBinaryOp, applyUnaryOp, safeParse } from './calc'
import { updateDisplays as updateUIDisplays } from './ui'


let currentInput = '0';
let lastInput = '0';
let operation = '';
let clearDisplay = false;

document.addEventListener('DOMContentLoaded', () => {

  document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
    <div>
      <h1 class="brand">Aesthetic Calc</h1>
      <div class="title-accent"></div>
      <div class="subtitle-carousel">
        <span class="subtitle-text"></span>
      </div>
      <h2></h2>
      <div class="calculadora">
        <div class="display">
          <input type="text" class="display-input display-input-primary" value="0" disabled />
          <input type="text" class="display-input display-input-secondary" value="" disabled />
        </div>
        <div class="teclado">
          <button class="delete span-two">DEL</button>
          <button class="reset">C</button>
          <button class="negativo">+/-</button>

          <button class="operation2" data-action="1/x">1/x</button>
          <button class="operation2" data-action="x²">x²</button>
          <button class="operation2" data-action="x³">x³</button>
          <button class="operation" data-action="+">+</button>

          <button class="number" data-value="7">7</button>
          <button class="number" data-value="8">8</button>
          <button class="number" data-value="9">9</button>
          <button class="operation" data-action="-">-</button>

          <button class="number" data-value="4">4</button>
          <button class="number" data-value="5">5</button>
          <button class="number" data-value="6">6</button>
          <button class="operation" data-action="*">*</button>

          <button class="number" data-value="1">1</button>
          <button class="number" data-value="2">2</button>
          <button class="number" data-value="3">3</button>
          <button class="operation" data-action="/">/</button>    

          <button class="equals span-two">=</button>
          <button class="number" data-value="0">0</button>
          <button class="decimal">.</button>
        </div>
      </div>
    </div>
  `;

  const displayPrimary = document.querySelector('.display-input-primary') as HTMLInputElement;
  const displaySecondary = document.querySelector('.display-input-secondary') as HTMLInputElement;

  // Carrusel de subtítulos
  const carouselPhrases = [
    'Orden, Simetría, Definición. La belleza de lo exacto.',
    'Medida y Proporción. La belleza que no se cuestiona.',
    'El equilibrio es el secreto de una vida plena. Y de un cálculo perfecto.',
    'La Proporción es Belleza.',
    'Para mentes que buscan la armonía en cada cifra.',
    'Medida y Proporción. La belleza que no se cuestiona.',
    'Calcula con Razón. Vive con Estética.'
  ];
  const subtitleEl = document.querySelector('.subtitle-text') as HTMLSpanElement | null;
  if (subtitleEl) {
    let idx = 0;
    const updateSubtitle = () => {
      // efecto fade
      subtitleEl.style.opacity = '0';
      setTimeout(() => {
        subtitleEl.textContent = carouselPhrases[idx % carouselPhrases.length];
        subtitleEl.style.opacity = '1';
        idx++;
      }, 180);
    };
    updateSubtitle();
    setInterval(updateSubtitle, 5000);
  }

  function updateDisplays(): void {
    updateUIDisplays(currentInput, lastInput, operation, clearDisplay);
  }

  // Utilidades para pestañas laterales
  function closeAllSidePanels(): void {
    const panels = ['.eq-panel', '.ops-panel', '.trig-panel', '.ln-panel', '.pc-panel'];
    const tabs = ['.eq-tab', '.ops-tab', '.trig-tab', '.ln-tab', '.pc-tab'];
    panels.forEach(sel => document.querySelector(sel)?.classList.remove('open'));
    tabs.forEach(sel => document.querySelector(sel)?.classList.remove('active'));
  }

  // Cerrar al hacer clic fuera de paneles/pestañas
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const inside = target.closest('.eq-panel, .ops-panel, .trig-panel, .ln-panel, .pc-panel, .eq-tab, .ops-tab, .trig-tab, .ln-tab, .pc-tab');
    if (!inside) {
      closeAllSidePanels();
    }
  });

  const resetButton = document.querySelector('.reset'); //REINICIAR
  if (resetButton) {
    resetButton.addEventListener('click', () => {
      currentInput = '0';
      lastInput = '0';
      operation = '';
      clearDisplay = false;
      updateDisplays();
    });
  }


  const deleteButton = document.querySelector('.delete'); //BORRAR
  if (deleteButton) {
    deleteButton.addEventListener('click', () => {
      if (currentInput.length === 1) {
        currentInput = '0';
      } else {
        currentInput = currentInput.slice(0, -1);//elimina el ultimo caracter
      }
      updateDisplays();
    });
  }



  const negativoButton = document.querySelector('.negativo'); // +/-
  if (negativoButton) {
    negativoButton.addEventListener('click', () => {
      if (clearDisplay) {
        currentInput = '';
        clearDisplay = false;
      }
      if (currentInput !== '0') {
        if (currentInput.startsWith('-')) {//si el numero es negativo
          currentInput = currentInput.slice(1);//elimina el primer caracter
        } else {
          currentInput = '-' + currentInput;
        }
        updateDisplays();
      }
    });


    const operation2Buttons = document.getElementsByClassName('operation2');//OPERACIONES COMPLEJAS
    if (operation2Buttons) {
      Array.from(operation2Buttons).forEach((button) => {
        button.addEventListener('click', (event) => {
          const selectedOperation = (event.target as HTMLElement).dataset.action;
          if (selectedOperation && currentInput !== '0') {
            clearDisplay = true;

            const num = safeParse(currentInput);
            let result = num;
            switch (selectedOperation) {
              case '1/x':
                result = applyUnaryOp(num, '1/x');
                break;
              case 'x²':
                result = applyUnaryOp(num, 'x²');
                break;
              case 'x³':
                result = applyUnaryOp(num, 'x³');
                break;
              case '2√x':
                result = applyUnaryOp(num, '√x');
                break;
            }
            currentInput = result.toString();
            updateDisplays();
          }
        });
      });
    }


    const operationButtons = document.getElementsByClassName('operation'); //OPERACIONES SIMPLES
    if (operationButtons) {
      Array.from(operationButtons).forEach((button) => {
        button.addEventListener('click', (event) => {
          const selectedOperation = (event.target as HTMLElement).dataset.action; //OBTIENE LA OPERACION
          if (selectedOperation) {
            if (currentInput !== '0') {
              if (lastInput !== '0' && operation) {
                const result = evaluate();
                lastInput = result.toString();
                currentInput = lastInput; // mantener sincronizado antes de la siguiente operación
              } else {
                lastInput = currentInput;
              }
              clearDisplay = true;
              currentInput = '0';
            }
            operation = selectedOperation; //GUARDA LA OPERACION
            updateDisplays();
          }
        });
      });


      const equalsButton = document.querySelector('.equals'); //IGUAL
      if (equalsButton) {
        equalsButton.addEventListener('click', () => {
          if (operation && lastInput !== '0') {
            const result = evaluate();
            currentInput = result.toString();
            lastInput = '0';
            operation = '';
            clearDisplay = true;
            updateDisplays();
          }
        });
      }


      const decimalButton = document.querySelector('.decimal'); //DECIMAL
      if (decimalButton) {
        decimalButton.addEventListener('click', () => {
          if (!currentInput.includes('.')) {
            currentInput += '.';
            clearDisplay = false;
            updateDisplays();
          }
        });


        const elements = document.getElementsByClassName('number'); //NUMEROS
        if (elements) {
          Array.from(elements).forEach((element) => {
            element.addEventListener('click', (event) => {
              const value = (event.target as HTMLElement).dataset.value
              if (clearDisplay) {
                currentInput = '';
                clearDisplay = false;
              }
              if (currentInput === '0' && value === '0') return;
              if (currentInput === '0') currentInput = '';
              currentInput += value;
              updateDisplays();

            });
          });
        }
      }
    }

    // Pestaña única "Ecuaciones" con panel de opciones (1º, 2º, 3º)
    const calculadora = document.querySelector('.calculadora');
    if (calculadora && !document.querySelector('.eq-tab')) {
      const tab = document.createElement('button');
      tab.className = 'eq-tab';
      tab.textContent = 'Ecuaciones';

      const panel = document.createElement('div');
      panel.className = 'eq-panel';

      const title = document.createElement('div');
      title.className = 'eq-panel-title';
      title.textContent = 'Selecciona tipo';

      const btnEq1 = document.createElement('button');
      btnEq1.className = 'eq1';
      btnEq1.textContent = 'Ecuación 1º grado';

      const btnEq2 = document.createElement('button');
      btnEq2.className = 'eq2';
      btnEq2.textContent = 'Ecuación 2º grado';

      const btnEq3 = document.createElement('button');
      btnEq3.className = 'eq3';
      btnEq3.textContent = 'Ecuación 3º grado';

      panel.appendChild(title);
      panel.appendChild(btnEq1);
      panel.appendChild(btnEq2);
      panel.appendChild(btnEq3);

      calculadora.appendChild(tab);
      calculadora.appendChild(panel);

      tab.addEventListener('click', () => {
        const isOpen = panel.classList.contains('open');
        closeAllSidePanels();
        if (!isOpen) {
          panel.classList.add('open');
          tab.classList.add('active');
          (panel as HTMLElement).style.borderTopColor = '#ffd8e1';
          (panel as HTMLElement).style.background = '#3a3f45';
          (panel as HTMLElement).style.setProperty('--panel-btn-bg', '#ffd8e1');
          (panel as HTMLElement).style.setProperty('--panel-btn-fg', '#111');
        }
      });

      btnEq1.addEventListener('click', () => {
        const aStr = prompt('Resolver a·x + b = 0\nIntroduce a:', '1');
        const bStr = prompt('Introduce b:', '0');
        if (aStr === null || bStr === null) return;
        const a = parseFloat(aStr);
        const b = parseFloat(bStr);
        if (!isFinite(a) || !isFinite(b) || a === 0) {
          alert('Entrada inválida (a debe ser distinto de 0).');
          return;
        }
        const x = -b / a;
        const eq = `${a}x + ${b} = 0`;
        displayPrimary.value = eq;
        displaySecondary.value = String(x);
        currentInput = String(x);
        lastInput = '0';
        operation = '';
        clearDisplay = true;
      });

      btnEq2.addEventListener('click', () => {
        const aStr = prompt('Resolver a·x² + b·x + c = 0\nIntroduce a:', '1');
        const bStr = prompt('Introduce b:', '0');
        const cStr = prompt('Introduce c:', '0');
        if (aStr === null || bStr === null || cStr === null) return;
        const a = parseFloat(aStr);
        const b = parseFloat(bStr);
        const c = parseFloat(cStr);
        if (!isFinite(a) || !isFinite(b) || !isFinite(c) || a === 0) {
          alert('Entrada inválida (a debe ser distinto de 0).');
          return;
        }
        const disc = b * b - 4 * a * c;
        let resultText = '';
        if (disc > 0) {
          const x1 = (-b + Math.sqrt(disc)) / (2 * a);
          const x2 = (-b - Math.sqrt(disc)) / (2 * a);
          resultText = `x1=${x1}, x2=${x2}`;
        } else if (disc === 0) {
          const x = -b / (2 * a);
          resultText = `x=${x}`;
        } else {
          resultText = 'Sin soluciones reales';
        }
        const eq = `${a}x² + ${b}x + ${c} = 0`;
        displayPrimary.value = eq;
        displaySecondary.value = resultText;
        currentInput = resultText;
        lastInput = '0';
        operation = '';
        clearDisplay = true;
      });

      btnEq3.addEventListener('click', () => {
        const aStr = prompt('Resolver a·x³ + b·x² + c·x + d = 0\nIntroduce a:', '1');
        const bStr = prompt('Introduce b:', '0');
        const cStr = prompt('Introduce c:', '0');
        const dStr = prompt('Introduce d:', '0');
        if (aStr === null || bStr === null || cStr === null || dStr === null) return;
        const a = parseFloat(aStr);
        const b = parseFloat(bStr);
        const c = parseFloat(cStr);
        const d = parseFloat(dStr);
        if (!isFinite(a) || !isFinite(b) || !isFinite(c) || !isFinite(d) || a === 0) {
          alert('Entrada inválida (a debe ser distinto de 0).');
          return;
        }
        const resultText = solveCubicReal(a, b, c, d);
        const eq = `${a}x³ + ${b}x² + ${c}x + ${d} = 0`;
        displayPrimary.value = eq;
        displaySecondary.value = resultText;
        currentInput = resultText;
        lastInput = '0';
        operation = '';
        clearDisplay = true;
      });
    }

    // Pestaña derecha "Operaciones" con listado de operaciones complejas
    if (calculadora && !document.querySelector('.ops-tab')) {
      const opsTab = document.createElement('button');
      opsTab.className = 'ops-tab';
      opsTab.textContent = 'Operaciones';

      const opsPanel = document.createElement('div');
      opsPanel.className = 'ops-panel';

      const opsTitle = document.createElement('div');
      opsTitle.className = 'eq-panel-title';
      opsTitle.textContent = 'Operación rápida';

      const btnSqrt = document.createElement('button');
      btnSqrt.textContent = '√x';
      const btnFact = document.createElement('button');
      btnFact.textContent = 'n!';
      const btnPerc = document.createElement('button');
      btnPerc.textContent = '%';

      opsPanel.appendChild(opsTitle);
      opsPanel.appendChild(btnSqrt);
      opsPanel.appendChild(btnFact);
      opsPanel.appendChild(btnPerc);

      calculadora.appendChild(opsTab);
      calculadora.appendChild(opsPanel);

      opsTab.addEventListener('click', () => {
        const isOpen = opsPanel.classList.contains('open');
        closeAllSidePanels();
        if (!isOpen) {
          opsPanel.classList.add('open');
          opsTab.classList.add('active');
          (opsPanel as HTMLElement).style.borderTopColor = '#dff6ff';
          (opsPanel as HTMLElement).style.background = '#3a3f45';
          (opsPanel as HTMLElement).style.setProperty('--panel-btn-bg', '#dff6ff');
          (opsPanel as HTMLElement).style.setProperty('--panel-btn-fg', '#111');
        }
      });

      function setResult(value: number | string) {
        currentInput = String(value);
        clearDisplay = true;
        operation = '';
        lastInput = '0';
        updateDisplays();
      }

      btnSqrt.addEventListener('click', () => {
        const n = parseFloat(currentInput);
        if (n < 0) { alert('Raíz de número negativo no real'); return; }
        setResult(Math.sqrt(n));
      });
      btnFact.addEventListener('click', () => {
        const n = parseFloat(currentInput);
        if (!Number.isInteger(n) || n < 0 || n > 170) { // 170! ~ 7.26e306
          alert('n! requiere entero ≥ 0 y razonable (≤ 170)');
          return;
        }
        let acc = 1;
        for (let i = 2; i <= n; i++) acc *= i;
        setResult(acc);
      });
      btnPerc.addEventListener('click', () => {
        const n = parseFloat(currentInput || '0');
        setResult(n / 100);
      });
    }

    // Tab: Trigonométricas Inversas
    if (calculadora && !document.querySelector('.trig-tab')) {
      const trigTab = document.createElement('button');
      trigTab.className = 'trig-tab';
      trigTab.textContent = 'Trig. Inversas';

      const trigPanel = document.createElement('div');
      trigPanel.className = 'trig-panel';

      const trigTitle = document.createElement('div');
      trigTitle.className = 'eq-panel-title';
      trigTitle.textContent = 'Arcoseno, Arcocoseno, Arcotangente';

      const btnAsin = document.createElement('button'); btnAsin.textContent = 'arcsin(x)';
      const btnAcos = document.createElement('button'); btnAcos.textContent = 'arccos(x)';
      const btnAtan = document.createElement('button'); btnAtan.textContent = 'arctan(x)';

      trigPanel.appendChild(trigTitle);
      trigPanel.appendChild(btnAsin);
      trigPanel.appendChild(btnAcos);
      trigPanel.appendChild(btnAtan);

      calculadora.appendChild(trigTab);
      calculadora.appendChild(trigPanel);

      trigTab.addEventListener('click', () => {
        const isOpen = trigPanel.classList.contains('open');
        closeAllSidePanels();
        if (!isOpen) {
          trigPanel.classList.add('open');
          trigTab.classList.add('active');
          (trigPanel as HTMLElement).style.borderTopColor = '#e9dfff';
          (trigPanel as HTMLElement).style.background = '#3a3f45';
          (trigPanel as HTMLElement).style.setProperty('--panel-btn-bg', '#e9dfff');
          (trigPanel as HTMLElement).style.setProperty('--panel-btn-fg', '#111');
        }
      });

      const toDeg = (r:number) => r; // mantener en radianes; cambiar si quieres grados
      btnAsin.addEventListener('click', () => {
        const n = parseFloat(currentInput);
        if (n < -1 || n > 1) { alert('arcsin definido para -1 ≤ x ≤ 1'); return; }
        setQuick(Math.asin(n));
      });
      btnAcos.addEventListener('click', () => {
        const n = parseFloat(currentInput);
        if (n < -1 || n > 1) { alert('arccos definido para -1 ≤ x ≤ 1'); return; }
        setQuick(Math.acos(n));
      });
      btnAtan.addEventListener('click', () => {
        const n = parseFloat(currentInput);
        setQuick(Math.atan(n));
      });

      function setQuick(val:number){
        currentInput = String(val);
        clearDisplay = true;
        operation = '';
        lastInput = '0';
        updateDisplays();
      }
    }

    // Tab: Logaritmo Natural
    if (calculadora && !document.querySelector('.ln-tab')) {
      const lnTab = document.createElement('button');
      lnTab.className = 'ln-tab';
      lnTab.textContent = 'Log Natural';

      const lnPanel = document.createElement('div');
      lnPanel.className = 'ln-panel';

      const lnTitle = document.createElement('div');
      lnTitle.className = 'eq-panel-title';
      lnTitle.textContent = 'ln(x)';

      const btnLn = document.createElement('button'); btnLn.textContent = 'ln(x)';

      lnPanel.appendChild(lnTitle);
      lnPanel.appendChild(btnLn);

      calculadora.appendChild(lnTab);
      calculadora.appendChild(lnPanel);

      lnTab.addEventListener('click', () => {
        const isOpen = lnPanel.classList.contains('open');
        closeAllSidePanels();
        if (!isOpen) {
          lnPanel.classList.add('open');
          lnTab.classList.add('active');
          (lnPanel as HTMLElement).style.borderTopColor = '#def7e5';
          (lnPanel as HTMLElement).style.background = '#3a3f45';
          (lnPanel as HTMLElement).style.setProperty('--panel-btn-bg', '#def7e5');
          (lnPanel as HTMLElement).style.setProperty('--panel-btn-fg', '#111');
        }
      });

      btnLn.addEventListener('click', () => {
        const n = parseFloat(currentInput);
        if (!(n > 0)) { alert('ln(x) definido para x > 0'); return; }
        currentInput = String(Math.log(n));
        clearDisplay = true; operation = ''; lastInput = '0';
        updateDisplays();
      });
    }

    // Tab: Permutaciones y Combinaciones
    if (calculadora && !document.querySelector('.pc-tab')) {
      const pcTab = document.createElement('button');
      pcTab.className = 'pc-tab';
      pcTab.textContent = 'P & C';

      const pcPanel = document.createElement('div');
      pcPanel.className = 'pc-panel';

      const pcTitle = document.createElement('div');
      pcTitle.className = 'eq-panel-title';
      pcTitle.textContent = 'Permutación y Combinación';

      const btnP = document.createElement('button'); btnP.textContent = 'P(n, r)';
      const btnC = document.createElement('button'); btnC.textContent = 'C(n, r)';

      pcPanel.appendChild(pcTitle);
      pcPanel.appendChild(btnP);
      pcPanel.appendChild(btnC);

      calculadora.appendChild(pcTab);
      calculadora.appendChild(pcPanel);

      pcTab.addEventListener('click', () => {
        const isOpen = pcPanel.classList.contains('open');
        closeAllSidePanels();
        if (!isOpen) {
          pcPanel.classList.add('open');
          pcTab.classList.add('active');
          (pcPanel as HTMLElement).style.borderTopColor = '#ffe1e1';
          (pcPanel as HTMLElement).style.background = '#3a3f45';
          (pcPanel as HTMLElement).style.setProperty('--panel-btn-bg', '#ffe1e1');
          (pcPanel as HTMLElement).style.setProperty('--panel-btn-fg', '#111');
        }
      });

      const fact = (k:number) => {
        if (!Number.isInteger(k) || k < 0 || k > 170) return NaN;
        let a = 1; for (let i=2;i<=k;i++) a*=i; return a;
      };
      btnP.addEventListener('click', () => {
        const nStr = prompt('P(n, r)\nIntroduce n:', '5');
        const rStr = prompt('Introduce r:', '3');
        if (nStr===null||rStr===null) return;
        const n = parseInt(nStr,10), r = parseInt(rStr,10);
        if (!(Number.isInteger(n)&&Number.isInteger(r)&&n>=0&&r>=0&&n>=r)) { alert('Valores inválidos'); return; }
        const val = fact(n) / fact(n-r);
        setPC(val, `P(${n}, ${r})`);
      });
      btnC.addEventListener('click', () => {
        const nStr = prompt('C(n, r)\nIntroduce n:', '5');
        const rStr = prompt('Introduce r:', '3');
        if (nStr===null||rStr===null) return;
        const n = parseInt(nStr,10), r = parseInt(rStr,10);
        if (!(Number.isInteger(n)&&Number.isInteger(r)&&n>=0&&r>=0&&n>=r)) { alert('Valores inválidos'); return; }
        const val = fact(n) / (fact(r) * fact(n-r));
        setPC(val, `C(${n}, ${r})`);
      });

      function setPC(val:number, label:string){
        displayPrimary.value = label;
        displaySecondary.value = String(val);
        currentInput = String(val); lastInput='0'; operation=''; clearDisplay=true;
      }
    }
  }

  // Solver de cúbicas (raíces reales). Devuelve string descriptivo
  function solveCubicReal(a: number, b: number, c: number, d: number): string {
    // Normalizar: x = y - b/(3a) → y^3 + py + q = 0
    const ba = b / a;
    const ca = c / a;
    const da = d / a;
    const p = ca - (ba * ba) / 3;
    const q = (2 * Math.pow(ba, 3)) / 27 - (ba * ca) / 3 + da;
    const discriminant = Math.pow(q / 2, 2) + Math.pow(p / 3, 3);

    const shift = ba / 3;

    const toFixedIfNeeded = (x: number) => {
      const v = Math.abs(x) < 1e-12 ? 0 : x;
      return Number.isFinite(v) ? Number(v.toFixed(8)) : v;
    };

    if (discriminant > 1e-12) {
      // Una raíz real
      const sqrtD = Math.sqrt(discriminant);
      const u = Math.cbrt(-q / 2 + sqrtD);
      const v = Math.cbrt(-q / 2 - sqrtD);
      const y = u + v;
      const x = y - shift;
      return `x=${toFixedIfNeeded(x)}`;
    } else if (Math.abs(discriminant) <= 1e-12) {
      // Raíces múltiples reales
      const u = Math.cbrt(-q / 2);
      const y1 = 2 * u;
      const y2 = -u;
      const x1 = y1 - shift;
      const x2 = y2 - shift;
      if (Math.abs(x1 - x2) <= 1e-9) {
        return `x=${toFixedIfNeeded(x1)}`;
      }
      return `x1=${toFixedIfNeeded(x1)}, x2=${toFixedIfNeeded(x2)}`;
    } else {
      // Tres raíces reales distintas
      const phi = Math.acos(-q / (2 * Math.sqrt(-Math.pow(p / 3, 3))));
      const m = 2 * Math.sqrt(-p / 3);
      const y1 = m * Math.cos(phi / 3);
      const y2 = m * Math.cos((phi + 2 * Math.PI) / 3);
      const y3 = m * Math.cos((phi + 4 * Math.PI) / 3);
      const x1 = y1 - shift;
      const x2 = y2 - shift;
      const x3 = y3 - shift;
      return `x1=${toFixedIfNeeded(x1)}, x2=${toFixedIfNeeded(x2)}, x3=${toFixedIfNeeded(x3)}`;
    }
  }


  function evaluate(): number {
    const num1 = safeParse(lastInput);
    const num2 = safeParse(currentInput);
    if (operation === '+' || operation === '-' || operation === '*' || operation === '/') {
      return applyBinaryOp(num1, num2, operation);
    }
    return num2;
  }
});

