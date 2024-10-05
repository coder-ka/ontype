import { ReadStream } from "fs";
import { ReadableStream } from "stream/web";
import { createLLParser, Lexed, parseError } from "./util/ll-parsing";

export type Decorator = {
  name: string;
  args: string[];
};
export type BaseModel = {
  path: string;
};
export type Type = {
  name: string;
  props: Prop[];
  decorators: Decorator[];
};
export type Prop = {
  name: string;
  type: PropType;
  decorators: Decorator[];
};
export type PropType = {
  name: string;
  ref?: string;
};
export type AST = {
  baseModels: BaseModel[];
  types: Type[];
};

const START = Symbol("START");
const IMPORT_PATH = Symbol("IMPORT_PATH");
const MODEL = Symbol("MODEL");
const TYPE_NAME = Symbol("TYPE_NAME");
const TYPE_CONTENT_START = Symbol("TYPE_CONTENT_START");
const TYPE_CONTENT = Symbol("TYPE_CONTENT");
const TYPE_DECORATOR = Symbol("TYPE_DECORATOR");
const PROP_NAME = Symbol("PROP_NAME");
const PROP_NAME_END = Symbol("PROP_NAME_END");
const PROP_TYPE = Symbol("PROP_TYPE");
const PROP_TYPE_NAME_END = Symbol("PROP_TYPE_NAME_END");
const PROP_REF = Symbol("PROP_REF");
const PROP_REF_END = Symbol("PROP_REF_END");
const PROP_DECORATOR = Symbol("PROP_DECORATOR");
const $ = Symbol("$");

const separatorRegex = /^[\s\t\[\],:{}]$/;
const whitespaceRegex = /^[\s\t]$/;
const blankRegex = /^[ \t]$/;
const propNameRegex = /^\w+$/;

const knottaParser = createLLParser<{
  ast: AST;
}>(
  {
    [START]([token], index, _state) {
      if (whitespaceRegex.test(token)) {
        return [token, START];
      }

      if (token === "import") {
        return [token, IMPORT_PATH];
      }

      if (token === "type") {
        return [token, TYPE_NAME];
      }

      return [
        parseError({
          message: `Unexpected token: '${token}'.`,
          token,
          index: index - token.length,
        }),
        token,
        START,
      ];
    },
    [IMPORT_PATH]([token], index, state) {
      if (blankRegex.test(token)) {
        return [token, IMPORT_PATH];
      }

      if (token.startsWith('"') && token.endsWith('"')) {
        state.ast.baseModels.push({ path: token.slice(1, -1) });
        return [token, START];
      }

      return [
        parseError({
          message: `Expected a quoted string after 'import'.`,
          token,
          index: index - token.length,
        }),
        token,
        START,
      ];
    },
    [MODEL]([token], index, _state) {
      if (whitespaceRegex.test(token)) {
        return [token, MODEL];
      }

      if (token === "type") {
        return [token, TYPE_NAME];
      }

      return [
        parseError({
          message: `Unexpected token: '${token}'.`,
          token,
          index: index - token.length,
        }),
        token,
        MODEL,
      ];
    },
    [TYPE_NAME]([token], index, state) {
      if (whitespaceRegex.test(token)) {
        return [token, TYPE_NAME];
      }

      if (/^\w+$/.test(token)) {
        state.ast.types.push({
          name: token,
          props: [],
          decorators: [],
        });
        return [token, TYPE_CONTENT_START];
      }

      return [
        parseError({
          message: `Invalid type name: '${token}'.`,
          token: token,
          index: index - token.length,
        }),
        token,
        TYPE_CONTENT_START,
      ];
    },
    [TYPE_CONTENT_START]([token], index, _state) {
      if (whitespaceRegex.test(token)) {
        return [token, TYPE_CONTENT_START];
      }

      if (token === "{") {
        return [token, TYPE_CONTENT];
      }

      return [
        parseError({
          message: `Expected '{' after type name.`,
          token,
          index: index - token.length,
        }),
        token,
        START,
      ];
    },
    [TYPE_CONTENT]([token], index) {
      if (whitespaceRegex.test(token)) {
        return [token, TYPE_CONTENT];
      }

      if (token.startsWith("@")) {
        return [TYPE_DECORATOR];
      }

      if (/^\w+$/.test(token)) {
        return [PROP_NAME];
      }

      if (token === "}") {
        return [token, MODEL];
      }

      return [
        parseError({
          message: `Unexpected token: '${token}'.`,
          token,
          index,
        }),
        token,
        TYPE_CONTENT,
      ];
    },
    [TYPE_DECORATOR]([token], index, state) {
      if (/^@\w+$/.test(token)) {
        state.ast.types[state.ast.types.length - 1].decorators.push({
          name: token.slice(1),
          args: [],
        });
        return [token, TYPE_CONTENT];
      }

      return [
        parseError({
          message: `Invalid type decorator name: '${token}'.`,
          token,
          index: index - token.length,
        }),
        token,
        TYPE_CONTENT,
      ];
    },
    [PROP_NAME]([token], index, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_NAME];
      }

      if (propNameRegex.test(token)) {
        state.ast.types[state.ast.types.length - 1].props.push({
          name: token,
          type: undefined as unknown as PropType,
          decorators: [],
        });
        return [token, PROP_NAME_END];
      }

      return [
        parseError({
          message: `Invalid property name: '${token}'.`,
          token,
          index: index - token.length,
        }),
        token,
        PROP_NAME,
      ];
    },
    [PROP_NAME_END]([token], index) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_NAME_END];
      }

      if (token.startsWith(":")) {
        return [token, PROP_TYPE];
      }

      return [
        parseError({
          message: `Unexpected token: '${token}'.`,
          token,
          index,
        }),
        token,
        PROP_NAME_END,
      ];
    },
    [PROP_TYPE]([token], index, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_TYPE];
      }

      if (/^\w+$/.test(token)) {
        state.ast.types[state.ast.types.length - 1].props[
          state.ast.types[state.ast.types.length - 1].props.length - 1
        ].type = { name: token };
        return [token, PROP_TYPE_NAME_END];
      }

      return [
        parseError({
          message: `Invalid property type: '${token}'.`,
          token,
          index: index - token.length,
        }),
        token,
        PROP_TYPE,
      ];
    },
    [PROP_TYPE_NAME_END]([token], _index) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_TYPE_NAME_END];
      }

      if (token === "[") {
        return [token, PROP_REF];
      }

      return [PROP_DECORATOR];
    },
    [PROP_REF]([token], index, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_REF];
      }

      if (propNameRegex.test(token)) {
        state.ast.types[state.ast.types.length - 1].props[
          state.ast.types[state.ast.types.length - 1].props.length - 1
        ].type.ref = token;
        return [token, PROP_REF_END];
      }

      return [
        parseError({
          message: `Invalid property reference: '${token}'.`,
          token,
          index: index - token.length,
        }),
        token,
        PROP_DECORATOR,
      ];
    },
    [PROP_REF_END]([token], index) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_REF_END];
      }

      if (token === "]") {
        return [token, TYPE_CONTENT];
      }

      return [
        parseError({
          message: `Unexpected end of property reference: '${token}'.`,
          token,
          index: index - token.length,
        }),
        token,
        PROP_DECORATOR,
      ];
    },
    [PROP_DECORATOR]([token], _index, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_DECORATOR];
      }

      if (token.startsWith("@")) {
        state.ast.types[state.ast.types.length - 1].props[
          state.ast.types[state.ast.types.length - 1].props.length - 1
        ].decorators.push({
          name: token.slice(1),
          args: [],
        });
        return [token, PROP_DECORATOR];
      }

      return [TYPE_CONTENT];
    },
    [$]([token], index, _) {
      return [
        token,
        parseError({
          message: `Unexpected token: '${token}'.`,
          token,
          index,
        }),
      ];
    },
  },
  () => [START, $]
);

export async function parse(stream: ReadStream | ReadableStream) {
  return knottaParser.parse(lexer(stream), {
    ast: {
      baseModels: [],
      types: [],
    },
  });
}

export async function* lexer(stream: ReadStream | ReadableStream): Lexed {
  let token = "";
  let isQuoting = false;
  let isEscaping = false;
  let index = 0;

  for await (const buf of stream) {
    const chunk: string = buf.toString("utf-8");
    for (let i = 0, imax = chunk.length; i < imax; i++) {
      index++;
      const char = chunk[i];
      if (char === ":")
        if (isEscaping) {
          token += char;
          isEscaping = false;
          continue;
        }

      if (char === "\\") {
        isEscaping = true;
        continue;
      }

      if (isQuoting) {
        if (char === '"') {
          isQuoting = false;
          token += '"';
          continue;
        } else {
          token += char;
          continue;
        }
      }

      if (separatorRegex.test(char)) {
        if (token !== "") {
          yield { tokens: [token], index: index - 1 };
          token = "";
        }

        yield { tokens: [char], index };
        continue;
      } else {
        token += char;
        continue;
      }
    }

    if (token !== "") {
      yield { tokens: [token], index };
    }
  }
}
