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
        baseModels: [],
        types: [],
      },
      enableSemanticTokens: true,
      semanticTokens: [],
    });

    assert.deepStrictEqual(errors, []);
    // console.log(result.semanticTokens);
    assert.deepStrictEqual(result.semanticTokens, [
      { type: "import", length: 6, line: 0, inlineIndex: 0 },
      { type: "string", length: 25, line: 0, inlineIndex: 7 },
      { type: "type", length: 4, line: 2, inlineIndex: 0 },
      { type: "type-name", length: 4, line: 2, inlineIndex: 5 },
      { type: "type-decorator", length: 9, line: 3, inlineIndex: 4 },
      { type: "prop-name", length: 2, line: 4, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 4, inlineIndex: 8 },
      { type: "prop-name", length: 8, line: 5, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 5, inlineIndex: 14 },
      { type: "prop-decorator", length: 7, line: 5, inlineIndex: 21 },
      { type: "prop-name", length: 12, line: 6, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 6, inlineIndex: 18 },
      { type: "prop-decorator", length: 7, line: 6, inlineIndex: 25 },
      { type: "type", length: 4, line: 9, inlineIndex: 0 },
      { type: "type-name", length: 7, line: 9, inlineIndex: 5 },
      { type: "prop-name", length: 2, line: 10, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 10, inlineIndex: 8 },
      { type: "prop-name", length: 9, line: 11, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 11, inlineIndex: 15 },
      { type: "prop-name", length: 8, line: 12, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 12, inlineIndex: 14 },
      { type: "type", length: 4, line: 15, inlineIndex: 0 },
      { type: "type-name", length: 5, line: 15, inlineIndex: 5 },
      { type: "prop-name", length: 2, line: 16, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 16, inlineIndex: 8 },
      { type: "prop-name", length: 9, line: 17, inlineIndex: 4 },
      { type: "prop-type-name", length: 8, line: 17, inlineIndex: 15 },
      { type: "prop-name", length: 6, line: 18, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 18, inlineIndex: 12 },
      { type: "prop-ref", length: 2, line: 18, inlineIndex: 17 },
      { type: "type", length: 4, line: 21, inlineIndex: 0 },
      { type: "type-name", length: 4, line: 21, inlineIndex: 5 },
      { type: "prop-name", length: 2, line: 22, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 22, inlineIndex: 8 },
      { type: "prop-name", length: 5, line: 23, inlineIndex: 4 },
      { type: "prop-type-name", length: 6, line: 23, inlineIndex: 11 },
      { type: "prop-name", length: 8, line: 24, inlineIndex: 4 },
      { type: "prop-optional", length: 1, line: 24, inlineIndex: 12 },
      { type: "prop-type-name", length: 8, line: 24, inlineIndex: 15 },
      { type: "prop-decorator", length: 9, line: 24, inlineIndex: 24 },
      { type: "prop-name", length: 8, line: 25, inlineIndex: 4 },
      { type: "prop-type-name", length: 4, line: 25, inlineIndex: 14 },
      { type: "prop-ref", length: 2, line: 25, inlineIndex: 19 },
    ]);
  }
);
