import $ from 'jquery';

const aplambdaCode = $('#aplambdaCode');
const aplambdaOutput = $('#aplambdaOutput');
const aplambdaRun = $('#aplambdaRun');

function run() {
  // Test: copy Code to Output
  aplambdaOutput.val(aplambdaCode.val());
}

aplambdaRun.click(run);
