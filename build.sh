eslint src/
mkdir -p /tmp/out
rollup src/aplambda_ui.js -o /tmp/out/aplambda_bundle.js -c
terser /tmp/out/aplambda_bundle.js -c -m -o docs/aplambda_bundle.min.js
