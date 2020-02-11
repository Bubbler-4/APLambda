# APΛ (APLambda) - A functionally right APL

This project was inspired while chatting with [SE user @ngn](https://codegolf.stackexchange.com/users/24908/ngn), who pointed out that APL is *not* a truly functional language. The main reasoning was:

* APL treats a *function* and an *operator* as different entities.
* Functions can only take *arrays* as "arguments", and operators can only take *functions* and *arrays*.
* If we want something to take operators as arguments, we'd need hyperators.
* Then we'd need superators, ultrators, ... but all of this means we don't have the true "function" as in a functional language.
* (And we don't have a data structure to store functions.)

So I came up with an idea:

> I imagine, if we get away from the current "tacit" programs and the parsing rule dedicated to operators, and mark every (possibly higher-level) function as either monadic or dyadic, we could have a functional language that supports basic APL syntax.

## Planned features

* Based on the APL language.
* No distinction between functions and operators (and higher-order functions).
* Unified evaluation rule (though that likely means more parentheses).
* True array of functions.

## Nice-to-have features

* Jelly-like tacit programming.
* Typed variant?

Currently, [this HackMD page](https://hackmd.io/@Bubbler/BkbHYIUZU) contains an outline of language features and a list of design decisions. Most of them are subject to change.