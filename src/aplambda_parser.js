import Parsimmon from 'parsimmon';

const P = Parsimmon;

const wrapType = (type) => (value) => ({ type, value });

const aplambdaParser = P.createLanguage({
  main: (L) => L.stmt.sepBy(L.stmt_sep),
  stmt_sep: () => P.oneOf('\n⋄'),
  stmt: (L) => L.value.sepBy(L._).trim(L._),
  value: (L) => P.alt(L.paren, L.dfn, L.num, L.ident),
  paren: (L) => L.stmt.wrap(P.string('('), P.string(')')).map(wrapType('paren')),
  dfn: (L) => L.main.wrap(P.string('{'), P.string('}')).map(wrapType('dfn')),
  num: () => P.regexp(/(?:¯?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)[ \t]*)+/)
    .map((s) => {
      const numTokens = s.match(/¯?(?:[0-9]+(?:\.[0-9]*)?|\.[0-9]+)/g);
      const numbers = numTokens.map((n) => (n[0] === '¯' ? -n.slice(1) : +n));
      return wrapType('num')(numbers);
    }),
  ident: () => P.regexp(/[a-zA-Z_][a-zA-Z0-9_]*/).map(wrapType('ident')),
  _: () => P.oneOf(' \t').many(),
});

/*
main = stmt (sepby \n or <>)*
stmt = value (sepby optwhitespace)*
value = ( stmt ) | { stmt* } | num | ident
*/

/*
const example = ' \n asdf (ghjk) ⋄ \n 2 ¯2 2.9 5.5.5 2. .9 ident ⋄ {{\n\n2.abc⋄az}(what.1)}';
const exParse = aplambdaParser.main.parse(example);

console.log(JSON.stringify(exParse, null, 2));
*/

export default {
  Parser: aplambdaParser.main,
};
