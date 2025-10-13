import { applyBinaryOp, safeParse } from './calc'

export function updateDisplays(
  currentInput: string,
  lastInput: string,
  operation: string,
  clearDisplay: boolean
): void {
  const displayPrimary = document.querySelector('.display-input-primary') as HTMLInputElement | null;
  const displaySecondary = document.querySelector('.display-input-secondary') as HTMLInputElement | null;
  if (!displayPrimary || !displaySecondary) return;

  function getOperationPreview(): string {
    if (operation) {
      const right = clearDisplay ? '' : (currentInput !== '0' ? currentInput : '');
      return `${lastInput} ${operation} ${right}`.trim();
    }
    return currentInput !== '0' ? `${currentInput}` : '';
  }

  const hasOperation = Boolean(operation) && lastInput !== '0';
  if (hasOperation && (operation === '+' || operation === '-' || operation === '*' || operation === '/')) {
    const num1 = safeParse(lastInput);
    const num2 = safeParse(currentInput || '0');
    const live = applyBinaryOp(num1, num2, operation);
    displayPrimary.value = String(live);
  } else {
    displayPrimary.value = currentInput;
  }
  displaySecondary.value = getOperationPreview();
}


