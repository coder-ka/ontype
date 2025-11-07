import fs from "fs";
import { test } from "@coder-ka/testing";
import { parse } from "../src";
import assert from "assert";

export const ontypeSemanticTokensTest = test("ontype semantic tokens test").do(
  async () => {
    const readStream = fs.createReadStream(`${__dirname}/test.ontype`, "utf-8");
    const { errors, result } = await parse(readStream, {
      enableAst: false,
      ast: {
        imports: [],
        types: [],
        enums: [],
      },
      enableSemanticTokens: true,
      semanticTokens: [],
    });

    assert.deepStrictEqual(errors, []);
    // console.log(result.semanticTokens);
    assert.deepStrictEqual(result.semanticTokens, [
      { type: "import", length: 6, line: 0, inlineIndex: 0 },
      { type: "import-alias", length: 9, line: 0, inlineIndex: 7 },
      { type: "import-from", length: 4, line: 0, inlineIndex: 17 },
      { type: "string", length: 25, line: 0, inlineIndex: 22 },
      { type: "type", length: 4, line: 2, inlineIndex: 0 },
      { type: "type-name", length: 4, line: 2, inlineIndex: 5 },
      { type: "type-decorator", length: 9, line: 2, inlineIndex: 10 },
      { type: "prop-name", length: 2, line: 3, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 3, inlineIndex: 8 },
      { type: "prop-name", length: 8, line: 4, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 4, inlineIndex: 14 },
      { type: "prop-decorator", length: 7, line: 4, inlineIndex: 21 },
      { type: "prop-name", length: 12, line: 5, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 5, inlineIndex: 18 },
      { type: "prop-decorator", length: 7, line: 5, inlineIndex: 25 },
      { type: "type", length: 4, line: 8, inlineIndex: 0 },
      { type: "type-name", length: 7, line: 8, inlineIndex: 5 },
      { type: "prop-name", length: 2, line: 9, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 9, inlineIndex: 8 },
      { type: "prop-name", length: 9, line: 10, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 10, inlineIndex: 15 },
      { type: "prop-name", length: 8, line: 11, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 11, inlineIndex: 14 },
      { type: "type", length: 4, line: 14, inlineIndex: 0 },
      { type: "type-name", length: 5, line: 14, inlineIndex: 5 },
      { type: "prop-name", length: 2, line: 15, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 15, inlineIndex: 8 },
      { type: "prop-name", length: 9, line: 16, inlineIndex: 4 },
      { type: "prop-type-name", length: 8, line: 16, inlineIndex: 15 },
      { type: "prop-name", length: 6, line: 17, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 17, inlineIndex: 12 },
      { type: "prop-ref", length: 2, line: 17, inlineIndex: 17 },
      { type: "type", length: 4, line: 20, inlineIndex: 0 },
      { type: "type-name", length: 4, line: 20, inlineIndex: 5 },
      { type: "prop-name", length: 2, line: 21, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 21, inlineIndex: 8 },
      { type: "prop-name", length: 5, line: 22, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 22, inlineIndex: 11 },
      { type: "prop-length", length: 2, line: 22, inlineIndex: 18 },
      { type: "prop-name", length: 8, line: 23, inlineIndex: 4 },
      { type: "prop-optional", length: 1, line: 23, inlineIndex: 12 },
      { type: "prop-type-name", length: 8, line: 23, inlineIndex: 15 },
      { type: "prop-decorator", length: 9, line: 23, inlineIndex: 24 },
      { type: "prop-name", length: 8, line: 24, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 24, inlineIndex: 14 },
      { type: "prop-ref", length: 2, line: 24, inlineIndex: 19 },
      { type: "enum", length: 4, line: 27, inlineIndex: 0 },
      { type: "enum-name", length: 10, line: 27, inlineIndex: 5 },
      { type: "enum-item-name", length: 5, line: 28, inlineIndex: 4 },
      { type: "enum-item-integer-value", length: 1, line: 28, inlineIndex: 11 },
      { type: "enum-item-name", length: 11, line: 29, inlineIndex: 4 },
      { type: "enum-item-integer-value", length: 1, line: 29, inlineIndex: 17 },
      { type: "enum-item-name", length: 4, line: 30, inlineIndex: 4 },
      { type: "enum-item-string-value", length: 6, line: 30, inlineIndex: 10 },
    ]);
  }
);
