import fs from "fs";
import { test } from "@coder-ka/testing";
import { parse } from "../src";
import assert from "assert";

export const knottaSemanticTokensTest = test("knotta semantic tokens test").do(
  async () => {
    const readStream = fs.createReadStream(`${__dirname}/test.knotta`, "utf-8");
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
    console.log(result.semanticTokens);
    // assert.deepStrictEqual(result.semanticTokens, []);
  }
);
