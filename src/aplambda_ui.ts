import $ from 'jquery';
import Parser from './aplambda_parser';

const aplambdaCode = $('#aplambdaCode');
const aplambdaInput = $('#aplambdaInput');
const aplambdaOutput = $('#aplambdaOutput');
const aplambdaDebug = $('#aplambdaDebug');
const aplambdaRun = $('#aplambdaRun');

function textareaExtend() {
  const thisEl = $(this);
  const newlines = ((thisEl.val() as string).match(/\n/g) || []).length;
  thisEl.attr('rows', Math.min(newlines + 1, 20));
}
aplambdaCode.on('input', textareaExtend);
aplambdaInput.on('input', textareaExtend);

function run() {
  // Test: copy Code to Output
  const code = aplambdaCode.val() as string;
  aplambdaOutput.val(code);
  // Test: generate a parse tree of the code
  const parsed = Parser.Parser.parse(code);
  if (parsed.status) {
    aplambdaDebug.val(JSON.stringify(parsed.value, null, 2));
  } else {
    aplambdaDebug.val(JSON.stringify(parsed, null, 2));
  }
  textareaExtend.call(aplambdaOutput);
  textareaExtend.call(aplambdaDebug);
}
aplambdaRun.click(run);

// Mapping for two-char<tab> combo
const keymap = new Map<string, string>();
[
  ['GL', 'Λ'],
  ['gl', 'λ'],
  ['ga', 'α'],
  ['gw', 'ω'],
  ['--', '¯'],
  ['<>', '⋄'],
].forEach(([key, value]) => keymap.set(key, value));

function handleTabCombo(e : any) {
  if (e.which === 9) { // If the key is tab...
    // If the cursor is right after two-char combo, replace it with matching symbol
    // Insert literal tab otherwise
    const target = $(e.target);
    const text = target.val() as string;
    const cursor = e.target.selectionStart;
    const replaceFrom = text.slice(0, cursor).slice(-2);
    if (keymap.has(replaceFrom)) {
      target.val(text.slice(0, cursor - 2) + keymap.get(replaceFrom) + text.slice(cursor));
      const newCursorPos = cursor - 1;
      e.target.setSelectionRange(newCursorPos, newCursorPos);
    } else {
      target.val(`${text.slice(0, cursor)}\t${text.slice(cursor)}`);
      e.target.setSelectionRange(cursor + 1, cursor + 1);
    }
    // Cut propagation so the textarea retains focus and nothing is typed
    return false;
  }
  return true;
}

aplambdaCode.keydown(handleTabCombo);
aplambdaInput.keydown(handleTabCombo);
