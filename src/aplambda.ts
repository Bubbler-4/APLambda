import P, {
  optWhitespace as _,
} from 'parsimmon';

/* Grammar
Expr := Value+
Value :=
`LParen` Expr `RParen`
| `Ident`
| `Num`
*/

type Ident = string;

namespace T {
  export const LParen : P.Parser<undefined> = P.string('(').trim(_).result(undefined);
  export const RParen : P.Parser<undefined> = P.string(')').trim(_).result(undefined);
  export const Ident : P.Parser<string> = P.regexp(/[_a-z][_a-z0-9]*|[+*~-]/i).trim(_);
  export const Num : P.Parser<number> = P.regexp(/[0-9]+/).map(Number).trim(_);
}

type ExprNode = ValueNode[];
type ValueNodeParen = { nodetype : 'paren', child : ExprNode };
type ValueNodeIdent = { nodetype : 'ident', child : Ident };
type ValueNodeNum = { nodetype : 'num', child : number };
type ValueNode = ValueNodeParen | ValueNodeIdent | ValueNodeNum;

type APLRule = {
  expr : ExprNode;
  paren : ValueNodeParen;
  ident : ValueNodeIdent;
  num : ValueNodeNum;
  value : ValueNode;
};

const APLLanguage : P.TypedLanguage<APLRule> = P.createLanguage<APLRule>({
  expr: (L) => L.value.atLeast(1),
  paren: (L) => L.expr.wrap(T.LParen, T.RParen).map((e : ExprNode) => ({ nodetype: 'paren', child: e })),
  ident: () => T.Ident.map((s : Ident) => ({ nodetype: 'ident', child: s })),
  num: () => T.Num.map((n : number) => ({ nodetype: 'num', child: n })),
  value: (L) => P.alt(L.paren, L.ident, L.num),
});

export const parseAPL = (s : string) => APLLanguage.expr.tryParse(s);

type Value0 = { arity : 0, value : number };
const Value0 : (n : Value0['value']) => Value0 = (n) => ({ arity: 0, value: n });

type Value1 = { arity : 1, value : (y : Value, context : Context) => APLResult };
const Value1 : (func : Value1['value']) => Value1 = (func) => ({ arity: 1, value: func });

type Value2 = { arity : 2, value : (x : Value, y : Value, context : Context) => APLResult };
const Value2 : (func : Value2['value']) => Value2 = (func) => ({ arity: 2, value: func });

type Value = Value0 | Value1 | Value2;

type IdentMap = Map<Ident, Value>;
type Context = { identmap : IdentMap };
const Context : (im : IdentMap) => Context = (im) => ({ identmap: im });

type ValueNContext = { value : Value, context : Context };
const ValueNContext : (v : Value, c : Context) => ValueNContext = (v, c) => ({
  value: v, context: c,
});

type FailureInfo = { message : string };
const FailureInfo : (msg : string) => FailureInfo = (msg) => ({ message: msg });

type Failure<T> = { success : false, error : T };
type Success<T> = { success : true, value : T };
type Result<F, S> = Failure<F> | Success<S>;
type APLResult = Result<FailureInfo, ValueNContext>;

// utility functions
function chain<F, S1, S2>(prev : Result<F, S1>, func : (s1 : S1) => Result<F, S2>)
  : Result<F, S2> {
  if (prev.success === true) return func(prev.value);
  return prev;
}

function pure<F, S>(s : S) : Result<F, S> {
  return { success: true, value: s };
}

function fail<F, S>(f : F) : Result<F, S> {
  return { success: false, error: f };
}

function mapS<F, S1, S2>(prev : Result<F, S1>, func : (s1 : S1) => S2) : Result<F, S2> {
  if (prev.success === true) return pure(func(prev.value));
  return prev;
}

function mapF<F1, F2, S>(prev : Result<F1, S>, func : (f1 : F1) => F2) : Result<F2, S> {
  if (prev.success === true) return prev;
  return fail(func(prev.error));
}

function bimap<F1, S1, F2, S2>(
  prev : Result<F1, S1>, funcF : (f1 : F1) => F2, funcS : (s1 : S1) => S2,
) : Result<F2, S2> {
  return mapS(mapF(prev, funcF), funcS);
}

function pop<F, S>(arr : S[], f : F) : Result<F, S> {
  if (arr.length === 0) return fail(f);
  return pure(arr.pop());
}

function chainVNC(prev : APLResult, func : (value : Value, context : Context) => APLResult)
  : APLResult {
  return chain(prev, (vnc : ValueNContext) => func(vnc.value, vnc.context));
}

// Node evaluators
function evalNum(node : ValueNodeNum, context : Context) : APLResult {
  return pure(ValueNContext(Value0(node.child), context));
}

function evalIdent(node : ValueNodeIdent, context : Context) : APLResult {
  const { identmap } = context;
  const ident = node.child;
  if (identmap.has(ident)) {
    return pure(ValueNContext(identmap.get(ident), context));
  }
  return fail(FailureInfo(`Unknown identifier "${ident}"`));
}

function evalParen(node : ValueNodeParen, context : Context) : APLResult {
  return evalExpr(node.child, context);
}

function evalValue(node : ValueNode, context : Context) : APLResult {
  if (node.nodetype === 'ident') return evalIdent(node, context);
  if (node.nodetype === 'num') return evalNum(node, context);
  return evalParen(node, context);
}

export function evalExpr(expr : ExprNode, context : Context) : APLResult {
  const nodes = expr.slice();
  let y : APLResult = chain(
    pop(nodes, FailureInfo('Empty expression')),
    (node : ValueNode) => evalValue(node, context),
  );
  while (nodes.length !== 0 && y.success === true) {
    y = chainVNC(y, (yValue, yContext) => {
      const nextNode = nodes.pop();
      const f : APLResult = evalValue(nextNode, yContext);
      return chainVNC(f, (fValue, fContext) => {
        if (fValue.arity === 1) {
          return fValue.value(yValue, fContext);
        } if (fValue.arity === 2) {
          const x : APLResult = chain(
            pop(nodes, FailureInfo('No left arg supplied for a dyad')),
            (node : ValueNode) => evalValue(node, fContext),
          );
          return chainVNC(x, (xValue, xContext) => fValue.value(xValue, yValue, xContext));
        }
        return fail(FailureInfo('Illegal position for a nilad'));
      });
    });
  }
  return y;
}

/* Builtins
(Notation: x, y = nilad, x1, y1 = monad, x2, y2 = dyad)
x + y -> Addition
x - y -> Subtraction
~ y -> Unary negation
Flip y2 -> Flip two args to y2
x1 Comp y2 -> x1 (x y2 y)
*/

export const builtins : IdentMap = new Map()
  .set('+', Value2((x, y, context) => {
    if (x.arity === 0 && y.arity === 0) {
      return pure(ValueNContext(Value0(x.value + y.value), context));
    }
    return fail(FailureInfo('Function "+" takes only nilads for both arguments'));
  }))
  .set('-', Value2((x, y, context) => {
    if (x.arity === 0 && y.arity === 0) {
      return pure(ValueNContext(Value0(x.value - y.value), context));
    }
    return fail(FailureInfo('Function "-" takes only nilads for both arguments'));
  }))
  .set('~', Value1((y, context) => {
    if (y.arity === 0) {
      return pure(ValueNContext(Value0(-y.value), context));
    }
    return fail(FailureInfo('Function "~" takes only a nilad for its right argument'));
  }))
  .set('Flip', Value1((y2, context) => {
    if (y2.arity === 2) {
      return pure(ValueNContext(Value2((x, y, ctx) => y2.value(y, x, ctx)), context));
    }
    return fail(FailureInfo('function "Flip" takes only a dyad for its right argument'));
  }))
  .set('Comp', Value2((x2, y2, context) => {
    if (x2.arity === 1 && y2.arity === 2) {
      const composed = (x : Value, y : Value, ctx : Context) => {
        const y2Result : APLResult = y2.value(x, y, ctx);
        return chainVNC(y2Result, x2.value);
      };
      return pure(ValueNContext(Value2(composed), context));
    }
    return fail(FailureInfo('invalid arity for function "Comp"'));
  }));

export const builtinContext : Context = { identmap: builtins };

function format(value : Value) : string {
  if (value.arity === 0) {
    // format negative number to use high minus
    const numString = value.value.toString();
    return numString.replace(/-/g, '¯');
  } if (value.arity === 1) {
    return '[Monad]';
  }
  return '[Dyad]';
}

export function evalAPL(s : string) : Result<string, string> {
  const parsed = APLLanguage.expr.parse(s);
  const ast : Result<FailureInfo, ExprNode> = parsed.status === true
    ? pure(parsed.value) : fail(FailureInfo('Syntax error'));
  const result = chain(ast, (expr) => evalExpr(expr, builtinContext));
  return bimap(result, (f1) => f1.message, (s1) => format(s1.value));
}
