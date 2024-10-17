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

export type State = {
  enableAst: boolean;
  ast: AST;
};

export const START = Symbol("START");
export const IMPORT_PATH = Symbol("IMPORT_PATH");
export const MODEL = Symbol("MODEL");
export const TYPE_NAME = Symbol("TYPE_NAME");
export const TYPE_CONTENT_START = Symbol("TYPE_CONTENT_START");
export const TYPE_CONTENT = Symbol("TYPE_CONTENT");
export const TYPE_DECORATOR = Symbol("TYPE_DECORATOR");
export const PROP_NAME = Symbol("PROP_NAME");
export const PROP_NAME_END = Symbol("PROP_NAME_END");
export const PROP_TYPE = Symbol("PROP_TYPE");
export const PROP_TYPE_NAME_END = Symbol("PROP_TYPE_NAME_END");
export const PROP_REF = Symbol("PROP_REF");
export const PROP_REF_END = Symbol("PROP_REF_END");
export const PROP_DECORATOR = Symbol("PROP_DECORATOR");
export const $ = Symbol("$");

const separatorRegex = /^[\s\t\[\],:{}]$/;
const whitespaceRegex = /^[\s\t]$/;
const blankRegex = /^[ \t]$/;
const typeNameRegex = /^\w+$/;
const propNameRegex = /^\w+$/;
const propTypeNameRegex = /^\w+$/;
const knottaParser = createLLParser<State>(
  {
    [START]([token], { index, line, inlineIndex }, _state) {
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
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        START,
      ];
    },
    [IMPORT_PATH]([token], { index, line, inlineIndex }, state) {
      if (blankRegex.test(token)) {
        return [token, IMPORT_PATH];
      }

      if (token.startsWith('"') && token.endsWith('"')) {
        if (state.enableAst) {
          state.ast.baseModels.push({ path: token.slice(1, -1) });
          return [token, START];
        }
      }

      return [
        parseError({
          message: `Expected a quoted string after 'import'.`,
          token,
          index: index - token.length,
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        START,
      ];
    },
    [MODEL]([token], { index, line, inlineIndex }, _state) {
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
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        MODEL,
      ];
    },
    [TYPE_NAME]([token], { index, line, inlineIndex }, state) {
      if (whitespaceRegex.test(token)) {
        return [token, TYPE_NAME];
      }

      if (typeNameRegex.test(token)) {
        if (state.enableAst) {
          state.ast.types.push({
            name: token,
            props: [],
            decorators: [],
          });
        }

        return [token, TYPE_CONTENT_START];
      }

      return [
        parseError({
          message: `Invalid type name: '${token}'.`,
          token: token,
          index: index - token.length,
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        TYPE_CONTENT_START,
      ];
    },
    [TYPE_CONTENT_START]([token], { index, line, inlineIndex }, _state) {
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
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        START,
      ];
    },
    [TYPE_CONTENT]([token], { index, line, inlineIndex }) {
      if (whitespaceRegex.test(token)) {
        return [token, TYPE_CONTENT];
      }

      if (token.startsWith("@")) {
        return [TYPE_DECORATOR];
      }

      if (propNameRegex.test(token)) {
        return [PROP_NAME];
      }

      if (token === "}") {
        return [token, MODEL];
      }

      return [
        parseError({
          message: `Unexpected token: '${token}'.`,
          token,
          index: index - token.length,
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        TYPE_CONTENT,
      ];
    },
    [TYPE_DECORATOR]([token], { index, line, inlineIndex }, state) {
      if (/^@\w+$/.test(token)) {
        if (state.enableAst) {
          state.ast.types[state.ast.types.length - 1].decorators.push({
            name: token.slice(1),
            args: [],
          });
        }
        return [token, TYPE_CONTENT];
      }

      return [
        parseError({
          message: `Invalid type decorator name: '${token}'.`,
          token,
          index: index - token.length,
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        TYPE_CONTENT,
      ];
    },
    [PROP_NAME]([token], { index, line, inlineIndex }, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_NAME];
      }

      if (propNameRegex.test(token)) {
        if (state.enableAst) {
          state.ast.types[state.ast.types.length - 1].props.push({
            name: token,
            type: undefined as unknown as PropType,
            decorators: [],
          });
        }
        return [token, PROP_NAME_END];
      }

      return [
        parseError({
          message: `Invalid property name: '${token}'.`,
          token,
          index: index - token.length,
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        PROP_NAME,
      ];
    },
    [PROP_NAME_END]([token], { index, line, inlineIndex }) {
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
          line,
          inlineIndex,
        }),
        token,
        PROP_NAME_END,
      ];
    },
    [PROP_TYPE]([token], { index, line, inlineIndex }, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_TYPE];
      }

      if (propTypeNameRegex.test(token)) {
        if (state.enableAst) {
          state.ast.types[state.ast.types.length - 1].props[
            state.ast.types[state.ast.types.length - 1].props.length - 1
          ].type = { name: token };
        }
        return [token, PROP_TYPE_NAME_END];
      }

      return [
        parseError({
          message: `Invalid property type: '${token}'.`,
          token,
          index: index - token.length,
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        PROP_TYPE,
      ];
    },
    [PROP_TYPE_NAME_END]([token], _position) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_TYPE_NAME_END];
      }

      if (token === "[") {
        return [token, PROP_REF];
      }

      return [PROP_DECORATOR];
    },
    [PROP_REF]([token], { index, line, inlineIndex }, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_REF];
      }

      if (propTypeNameRegex.test(token)) {
        if (state.enableAst) {
          state.ast.types[state.ast.types.length - 1].props[
            state.ast.types[state.ast.types.length - 1].props.length - 1
          ].type.ref = token;
        }
        return [token, PROP_REF_END];
      }

      return [
        parseError({
          message: `Invalid property reference: '${token}'.`,
          token,
          index: index - token.length,
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        PROP_DECORATOR,
      ];
    },
    [PROP_REF_END]([token], { index, line, inlineIndex }) {
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
          line,
          inlineIndex: inlineIndex - token.length,
        }),
        token,
        PROP_DECORATOR,
      ];
    },
    [PROP_DECORATOR]([token], _position, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_DECORATOR];
      }

      if (token.startsWith("@")) {
        if (state.enableAst) {
          state.ast.types[state.ast.types.length - 1].props[
            state.ast.types[state.ast.types.length - 1].props.length - 1
          ].decorators.push({
            name: token.slice(1),
            args: [],
          });
        }
        return [token, PROP_DECORATOR];
      }

      return [TYPE_CONTENT];
    },
    [$]([token], { index, line, inlineIndex }, _) {
      return [
        token,
        parseError({
          message: `Unexpected token: '${token}'.`,
          token,
          index,
          inlineIndex,
          line,
        }),
      ];
    },
  },
  () => [START, $]
);

export async function parse(
  stream: ReadStream | ReadableStream,
  initialState: State
) {
  return knottaParser.parse(lexer(stream), initialState);
}

export async function* lexer(stream: ReadStream | ReadableStream): Lexed {
  let token = "";
  let isQuoting = false;
  let isEscaping = false;
  let index = 0;
  let line = 0;
  let inlineIndex = 0;

  for await (const buf of stream) {
    const chunk: string = buf.toString("utf-8");
    for (let i = 0, imax = chunk.length; i < imax; i++) {
      index++;
      inlineIndex++;

      const char = chunk[i];

      if (/\r?\n/.test(char)) {
        line++;
        inlineIndex = 0;
      } else if (char === ":")
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
          yield {
            tokens: [token],
            index: index - 1,
            line,
            inlineIndex: inlineIndex - 1,
          };
          token = "";
        }

        yield { tokens: [char], index, line, inlineIndex };
        continue;
      } else {
        token += char;
        continue;
      }
    }

    if (token !== "") {
      yield { tokens: [token], index, line, inlineIndex };
    }
  }
}
