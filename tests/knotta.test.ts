import fs from "fs";
import { test } from "@coder-ka/testing";
import { parse } from "../src";
import assert from "assert";

export const knottaTest = test("knotta test").do(async () => {
  const readStream = fs.createReadStream(`${__dirname}/test.knotta`, "utf-8");
  const { errors, result } = await parse(readStream);

  assert.deepStrictEqual(errors, []);
  assert.deepStrictEqual(result.ast, {
    baseModels: [{ path: "knotta/primitive.knotta" }],
    types: [
      {
        name: "User",
        props: [
          {
            name: "id",
            type: { type: "belongs-to", name: "char" },
            decorators: [],
          },
          {
            name: "password",
            type: { type: "belongs-to", name: "string" },
            decorators: [{ name: "hidden", args: [] }],
          },
          {
            name: "passwordSalt",
            type: { type: "belongs-to", name: "string" },
            decorators: [{ name: "hidden", args: [] }],
          },
          {
            name: "todos",
            type: { type: "has", name: "Todo", min: undefined, max: undefined },
            decorators: [],
          },
          {
            name: "profile",
            type: { type: "has", name: "Profile", min: undefined, max: 1 },
            decorators: [],
          },
        ],
        decorators: [{ name: "hogehoge", args: [] }],
      },
      {
        name: "Profile",
        props: [
          {
            name: "id",
            type: { type: "belongs-to", name: "char" },
            decorators: [],
          },
          {
            name: "firstName",
            type: { type: "belongs-to", name: "string" },
            decorators: [],
          },
          {
            name: "lastName",
            type: { type: "belongs-to", name: "string" },
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
            type: { type: "belongs-to", name: "char" },
            decorators: [],
          },
          {
            name: "expiredAt",
            type: { type: "belongs-to", name: "datetime" },
            decorators: [],
          },
          {
            name: "userId",
            type: { type: "belongs-to", name: "string" },
            decorators: [],
          },
          {
            name: "user",
            type: { type: "belongs-to", name: "User" },
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
            type: { type: "belongs-to", name: "char" },
            decorators: [],
          },
          {
            name: "title",
            type: { type: "belongs-to", name: "string" },
            decorators: [],
          },
          {
            name: "deadline",
            type: { type: "belongs-to", name: "datetime" },
            decorators: [{ name: "nullable", args: [] }],
          },
          {
            name: "authorId",
            type: { type: "belongs-to", name: "string" },
            decorators: [],
          },
          {
            name: "author",
            type: { type: "belongs-to", name: "User" },
            decorators: [],
          },
        ],
        decorators: [],
      },
    ],
  });
});
