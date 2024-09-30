import assert from "assert";
import { test } from "@coder-ka/testing";
import { createLLParser, parseError } from "../src/util/ll-parsing";

export const llParsingTest = test("ll-parsing").do(async () => {
  const S = Symbol("S");
  const $ = Symbol("$");
  const llparser = createLLParser<{ value: string }>(
    {
      [S]: ([token], index, result) => {
        if (token === "a") {
          result.value = "a" + result.value;
          return ["a", S];
        } else if (token === "b") {
          return ["b", S];
        } else if (token === "c") {
          result.value = "c" + result.value;
          return ["c"];
        } else {
          return [
            parseError({
              message: `Unexpected token: '${token}'.`,
              token,
              index,
            }),
          ];
        }
      },
    },
    () => [S, $]
  );
  const parsed = await llparser.parse(
    (async function* () {
      yield {
        tokens: ["a"],
        index: 1,
      };
      yield {
        tokens: ["b"],
        index: 2,
      };
      yield {
        tokens: ["c"],
        index: 3,
      };
    })(),
    { value: "" }
  );
  assert.deepStrictEqual(parsed.stack, [$]);
  assert.deepStrictEqual(parsed.errors, []);
  assert.strictEqual(parsed.result.value, "ca");
});