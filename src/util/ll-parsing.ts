export type LexedItem = {
  tokens: string[];
  index: number;
};
export type Lexed = AsyncIterable<LexedItem>;
export type Stack = (symbol | string | ParseError)[];
export function createLLParser<TResult, TStack extends Stack = Stack>(
  rules: Record<
    symbol,
    (token: string[], index: number, result: TResult) => TStack
  >,
  initStack: () => TStack
) {
  return {
    async parse(
      lexed: Lexed,
      result: TResult,
      options: {
        onError: "stop" | "throw" | "continue";
        debug?: boolean;
      } = {
        onError: "stop",
      }
    ): Promise<{
      stack: TStack;
      errors: ParseError[];
      result: TResult;
      index: number;
    }> {
      const stack = initStack();
      const errors: ParseError[] = [];
      let lastIndex = 0;
      try {
        for await (const { tokens, index } of lexed) {
          let tos;
          while ((tos = stack.shift()) && typeof tos === "symbol") {
            if (options.debug) {
              console.log(
                `${tos.toString()}: '${
                  tokens[0] === "\n"
                    ? "\\n"
                    : tokens[0] === "\r"
                    ? "\\r"
                    : tokens[0]
                }'`
              );
            }
            const rule = rules[tos];
            if (!rule) throw new Error(`No rule for ${tos.toString()}.`);
            stack.unshift(...rule(tokens, index, result));
          }

          if (typeof tos === "string") {
            if (tos !== tokens[0]) {
              const error = parseError({
                message: `Expected '${tos}' but got '${tokens[0]}'.`,
                index,
                token: tokens[0],
              });
              if (options.onError === "stop") {
                errors.push(error);
                return {
                  stack,
                  errors,
                  result,
                  index,
                };
              } else if (options.onError === "throw") {
                throw new Error(error.message);
              }
            }
          } else if (isParseError(tos)) {
            const error = tos;
            if (options.onError === "stop") {
              errors.push(error);
              return {
                stack,
                errors,
                result,
                index,
              };
            } else if (options.onError === "throw") {
              throw new Error(error.message);
            }
          }
          lastIndex = index;
        }

        return {
          stack,
          errors,
          result,
          index: lastIndex,
        };
      } catch (error) {
        console.error(errors);
        throw error;
      }
    },
  };
}

export const parseErrorSym = Symbol("parseError");
type ParseError = {
  [parseErrorSym]: true;
  message: string;
  token: string;
  index: number;
};

export function parseError(
  x: Omit<ParseError, typeof parseErrorSym>
): ParseError {
  return {
    [parseErrorSym]: true,
    ...x,
  };
}

export function isParseError(x: any): x is ParseError {
  return x && x[parseErrorSym];
}
