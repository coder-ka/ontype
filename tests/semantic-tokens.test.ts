import fs from "node:fs";
import test from "node:test";
import { parse } from "../src";
import assert from "assert";

test("ontype semantic tokens test", async () => {
  const readStream = fs.createReadStream(`./tests/test.ontype`, "utf-8");

  const { errors, state } = await parse(readStream, {
    enableAst: false,
    ast: {
      types: [],
      enums: [],
    },
    enableSemanticTokens: true,
    semanticTokens: [],
  });

  assert.deepStrictEqual(errors, []);
  assert.deepStrictEqual(state.semanticTokens, [
    { type: "type", length: 4, line: 0, inlineIndex: 0 },
    { type: "type-name", length: 4, line: 0, inlineIndex: 5 },
    { type: "type-decorator", length: 9, line: 0, inlineIndex: 10 },
    { type: "prop-name", length: 2, line: 1, inlineIndex: 4 },
    { type: "prop-type-name", length: 4, line: 1, inlineIndex: 8 },
    { type: "prop-name", length: 8, line: 2, inlineIndex: 4 },
    { type: "prop-type-name", length: 6, line: 2, inlineIndex: 14 },
    { type: "prop-decorator", length: 7, line: 2, inlineIndex: 21 },
    { type: "prop-name", length: 12, line: 3, inlineIndex: 4 },
    { type: "prop-type-name", length: 6, line: 3, inlineIndex: 18 },
    { type: "prop-decorator", length: 7, line: 3, inlineIndex: 25 },
    { type: "type", length: 4, line: 6, inlineIndex: 0 },
    { type: "type-name", length: 7, line: 6, inlineIndex: 5 },
    { type: "prop-name", length: 2, line: 7, inlineIndex: 4 },
    { type: "prop-type-name", length: 4, line: 7, inlineIndex: 8 },
    { type: "prop-name", length: 9, line: 8, inlineIndex: 4 },
    { type: "prop-type-name", length: 6, line: 8, inlineIndex: 15 },
    { type: "prop-name", length: 8, line: 9, inlineIndex: 4 },
    { type: "prop-type-name", length: 6, line: 9, inlineIndex: 14 },
    { type: "type", length: 4, line: 12, inlineIndex: 0 },
    { type: "type-name", length: 5, line: 12, inlineIndex: 5 },
    { type: "prop-name", length: 2, line: 13, inlineIndex: 4 },
    { type: "prop-type-name", length: 4, line: 13, inlineIndex: 8 },
    { type: "prop-name", length: 9, line: 14, inlineIndex: 4 },
    { type: "prop-type-name", length: 8, line: 14, inlineIndex: 15 },
    { type: "prop-name", length: 6, line: 15, inlineIndex: 4 },
    { type: "prop-type-name", length: 4, line: 15, inlineIndex: 12 },
    { type: "prop-ref", length: 2, line: 15, inlineIndex: 17 },
    { type: "type", length: 4, line: 18, inlineIndex: 0 },
    { type: "type-name", length: 4, line: 18, inlineIndex: 5 },
    { type: "prop-name", length: 2, line: 19, inlineIndex: 4 },
    { type: "prop-type-name", length: 4, line: 19, inlineIndex: 8 },
    { type: "prop-name", length: 5, line: 20, inlineIndex: 4 },
    { type: "prop-type-name", length: 6, line: 20, inlineIndex: 11 },
    { type: "prop-length", length: 2, line: 20, inlineIndex: 18 },
    { type: "prop-name", length: 8, line: 21, inlineIndex: 4 },
    { type: "prop-optional", length: 1, line: 21, inlineIndex: 12 },
    { type: "prop-type-name", length: 8, line: 21, inlineIndex: 15 },
    { type: "prop-decorator", length: 9, line: 21, inlineIndex: 24 },
    { type: "prop-name", length: 8, line: 22, inlineIndex: 4 },
    { type: "prop-type-name", length: 4, line: 22, inlineIndex: 14 },
    { type: "prop-ref", length: 2, line: 22, inlineIndex: 19 },
    { type: "enum", length: 4, line: 25, inlineIndex: 0 },
    { type: "enum-name", length: 10, line: 25, inlineIndex: 5 },
    { type: "enum-item-name", length: 5, line: 26, inlineIndex: 4 },
    { type: "enum-item-integer-value", length: 1, line: 26, inlineIndex: 11 },
    { type: "enum-item-name", length: 11, line: 27, inlineIndex: 4 },
    { type: "enum-item-integer-value", length: 1, line: 27, inlineIndex: 17 },
    { type: "enum-item-name", length: 4, line: 28, inlineIndex: 4 },
    { type: "enum-item-string-value", length: 6, line: 28, inlineIndex: 10 },
  ]);
}
);
