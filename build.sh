#eslint src/ --fix
#mkdir -p /tmp/out
#rollup src/aplambda_ui.js -o /tmp/out/aplambda_bundle.js -c
#terser /tmp/out/aplambda_bundle.js -c -m -o docs/aplambda_bundle.min.js

# Remove previous files
rm -rf docs/*

# Build the page
parcel build src/index.html -d docs

# Replace absolute path with relative one, so that it works on Gitpod AND GH pages
sed -i -e 's/src="\//src="/g' docs/index.html
