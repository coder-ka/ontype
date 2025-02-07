import fs from "fs";
import { test } from "@coder-ka/testing";
import { parse } from "../src";
import assert from "assert";

export const ontypeAstTest = test("ontype ast test").do(async () => {
  const readStream = fs.createReadStream(`${__dirname}/test.ontype`, "utf-8");
  const { errors, result } = await parse(readStream, {
    enableAst: true,
    ast: {
      baseModels: [],
      types: [],
      enums: [],
    },
    enableSemanticTokens: false,
    semanticTokens: [],
  });

  assert.deepStrictEqual(errors, []);
  assert.deepStrictEqual(result.ast, {
    baseModels: [{ path: "ontype/primitive.ontype" }],
    types: [
      {
        name: "User",
        props: [
          {
            name: "id",
            type: { name: "char" },
            decorators: [],
            optional: false,
          },
          {
            name: "password",
            type: { name: "string" },
            decorators: [{ name: "hidden", args: [] }],
            optional: false,
          },
          {
            name: "passwordSalt",
            type: { name: "string" },
            decorators: [{ name: "hidden", args: [] }],
            optional: false,
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
            optional: false,
          },
          {
            name: "firstName",
            type: { name: "string" },
            decorators: [],
            optional: false,
          },
          {
            name: "lastName",
            type: { name: "string" },
            decorators: [],
            optional: false,
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
            optional: false,
          },
          {
            name: "expiredAt",
            type: { name: "datetime" },
            decorators: [],
            optional: false,
          },
          {
            name: "userId",
            type: { name: "User", ref: "id" },
            decorators: [],
            optional: false,
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
            optional: false,
          },
          {
            name: "title",
            type: { name: "string", length: 10 },
            decorators: [],
            optional: false,
          },
          {
            name: "deadline",
            type: { name: "datetime" },
            decorators: [{ name: "nullable", args: [] }],
            optional: true,
          },
          {
            name: "authorId",
            type: { name: "User", ref: "id" },
            decorators: [],
            optional: false,
          },
        ],
        decorators: [],
      },
    ],
    enums: [
      {
        name: "TodoStatus",
        items: [
          {
            name: "READY",
            value: 0,
          },
          {
            name: "IN_PROGRESS",
            value: 1,
          },
          {
            name: "DONE",
            value: "done",
          },
        ],
      },
    ],
  });
});
