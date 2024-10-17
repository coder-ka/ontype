import fs from "fs";
import { test } from "@coder-ka/testing";
import { parse } from "../src";
import assert from "assert";

export const knottaTest = test("knotta test").do(async () => {
  const readStream = fs.createReadStream(`${__dirname}/test.knotta`, "utf-8");
  const { errors, result } = await parse(readStream, {
    enableAst: true,
    ast: {
      baseModels: [],
      types: [],
    },
    enableSemanticTokens: false,
    semanticTokens: [],
  });

  assert.deepStrictEqual(errors, []);
  assert.deepStrictEqual(result.ast, {
    baseModels: [{ path: "knotta/primitive.knotta" }],
    types: [
      {
        name: "User",
        props: [
          {
            name: "id",
            type: { name: "char" },
            decorators: [],
          },
          {
            name: "password",
            type: { name: "string" },
            decorators: [{ name: "hidden", args: [] }],
          },
          {
            name: "passwordSalt",
            type: { name: "string" },
            decorators: [{ name: "hidden", args: [] }],
          },
        ],
        decorators: [{ name: "hogehoge", args: [] }],
      },
      {
        name: "Profile",
        props: [
          {
            name: "id",
            type: { name: "char" },
            decorators: [],
          },
          {
            name: "firstName",
            type: { name: "string" },
            decorators: [],
          },
          {
            name: "lastName",
            type: { name: "string" },
            decorators: [],
          },
        ],
        decorators: [],
      },
      {
        name: "Login",
        props: [
          {
            name: "id",
            type: { name: "char" },
            decorators: [],
          },
          {
            name: "expiredAt",
            type: { name: "datetime" },
            decorators: [],
          },
          {
            name: "userId",
            type: { name: "User", ref: "id" },
            decorators: [],
          },
        ],
        decorators: [],
      },
      {
        name: "Todo",
        props: [
          {
            name: "id",
            type: { name: "char" },
            decorators: [],
          },
          {
            name: "title",
            type: { name: "string" },
            decorators: [],
          },
          {
            name: "deadline",
            type: { name: "datetime" },
            decorators: [{ name: "nullable", args: [] }],
          },
          {
            name: "authorId",
            type: { name: "User", ref: "id" },
            decorators: [],
          },
        ],
        decorators: [],
      },
    ],
  });
});
