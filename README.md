# APΛ (APLambda) - A functionally right APL

This project was inspired while chatting with [SE user @ngn](https://codegolf.stackexchange.com/users/24908/ngn), who pointed out that APL is *not* a truly functional language. The main reasoning was:

* APL treats a *function* and an *operator* as different entities.
* Functions can only take *arrays* as "arguments", and operators can only take *functions* and *arrays*.
* If we want something to take operators as arguments, we'd need hyperators.
* Then we'd need superators, ultrators, ... but all of this means we don't have the true "function" as in a functional language.
* (And we don't have a data structure to store functions.)

So I came up with an idea:

> I imagine, if we get away from the current "tacit" programs and the parsing rule dedicated to operators, and mark every (possibly higher-level) function as either monadic or dyadic, we could have a functional language that supports basic APL syntax.

## Concept

* Based on the APL language.
* No distinction between functions and operators (and higher-order functions).
* Unified evaluation rule (though that likely means more parentheses).
* True array of functions.

## Nice-to-have features

* Jelly-like tacit programming.
* Typed variant?

## Curent features

### v0.1.1

* Now allows multiple lines of expressions.

### v0.1.0

* Minimal interpreter is ready. Currently, it only accepts a single line of expression. No dfns, no assignment yet.
* Includes a minimal set of built-in data types, tokens, and primitives.
  * Data type: Every nilad is a single integer.
  * Token: One or more digits are recognized as a number literal; an alphanumeric sequence is recognized as an identifier (plus a small set of symbols).
  * Primitives
    * `+` (binary add), `-` (binary sub), `~` (unary minus)
    * `Flip` (`⍨` on dyad), `Comp` (atop)

Even without dfns, we can do more than traditional APL:

* `Flip` and `Comp` can take *any* monads and dyads, which are not restricted to traditional functions.
  * `1(~(Flip Comp Comp)-)2` evaluates to `1(Flip ~ Comp -)2`, which is `~ 2 - 1` or `¯1`.
