import $ from 'jquery';
import Parser from './aplambda_parser';

const aplambdaCode = $('#aplambdaCode');
const aplambdaInput = $('#aplambdaInput');
const aplambdaOutput = $('#aplambdaOutput');
const aplambdaDebug = $('#aplambdaDebug');
const aplambdaRun = $('#aplambdaRun');

function textareaExtend() {
  const thisEl = $(this);
  const newlines = (thisEl.val().match(/\n/g) || []).length;
  thisEl.attr('rows', Math.min(newlines + 1, 20));
}
aplambdaCode.on('input', textareaExtend);
aplambdaInput.on('input', textareaExtend);

function run() {
  // Test: copy Code to Output
  const code = aplambdaCode.val();
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

// Mapping for backslash + name combo, triggered at <tab>
const keymap = {
  '\\L': 'Λ',
  '\\l': 'λ',
  '\\a': 'α',
  '\\w': 'ω',
  '\\-': '¯',
  '\\<>': '⋄',
};

function handleTabCombo(e) {
  if (e.which === 9) { // If the key is tab...
    // If the cursor is right after backslash + name combo, replace it with matching symbol
    // Insert literal tab otherwise
    const target = $(e.target);
    const text = target.val();
    const cursor = e.target.selectionStart;
    const backslashIdx = text.slice(0, cursor).lastIndexOf('\\');
    const replaceFrom = text.slice(backslashIdx, cursor);
    const replaceTo = keymap[replaceFrom];
    if (backslashIdx >= 0 && replaceTo) {
      target.val(text.slice(0, backslashIdx) + replaceTo + text.slice(cursor));
      const newCursorPos = cursor - (replaceFrom.length - replaceTo.length);
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
