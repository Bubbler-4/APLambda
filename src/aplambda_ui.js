import $ from 'jquery';

const aplambdaCode = $('#aplambdaCode');
const aplambdaInput = $('#aplambdaInput');
const aplambdaOutput = $('#aplambdaOutput');
const aplambdaDebug = $('#aplambdaDebug');
const aplambdaRun = $('#aplambdaRun');

function run() {
  // Test: copy Code to Output
  aplambdaOutput.val(aplambdaCode.val());
}

// Mapping for backslash + name combo, triggered at <tab>
const keymap = {
  '\\L': '\u039b', // capital lambda
  '\\l': '\u03bb', // small lambda
  '\\a': '\u03b1', // small alpha
  '\\w': '\u03c9', // small omega
};

function key(e) {
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

aplambdaRun.click(run);
aplambdaCode.keydown(key);
aplambdaInput.keydown(key);
