import { type ReadStream } from "fs";
import type { Readable } from "stream";
import type { ReadableStream } from "stream/web";
import {
  createLLParser,
  parseError,
  ParseOptions,
  createSimpleLexer,
} from "@coder-ka/ll-parsing";

export type Decorator = {
  name: string;
  args: string[];
};
export type Type = {
  name: string;
  props: Prop[];
};
export type Enum = {
  name: string;
  items: EnumItem[];
};
export type EnumItem = {
  name: string;
  value: EnumValue;
};
export type EnumValue = number | string;
export type Prop = {
  name: string;
  type: PropType;
  decorators: Decorator[];
  optional: boolean;
};
export type PropType = {
  name: string;
  ref?: string;
  length?: number;
};

export type State = {
  enableSemanticTokens: boolean;
  semanticTokens: {
    type:
      | "type-keyword"
      | "type-name"
      | "prop-name"
      | "prop-type-name"
      | "prop-type-ref"
      | "prop-type-length"
      | "prop-decorator"
      | "prop-optional"
      | "enum-keyword"
      | "enum-name"
      | "enum-item-name";
    length: number;
    line: number;
    inlineIndex: number;
  }[];
};

export const S = Symbol("S");
export const MODEL = Symbol("MODEL");
export const TYPE_KEYWORD = Symbol("TYPE_KEYWORD");
export const TYPE_NAME = Symbol("TYPE_NAME");
export const TYPE_BODY_START = Symbol("TYPE_BODY_START");
export const TYPE_BODY = Symbol("TYPE_BODY");
export const TYPE_BODY_END = Symbol("TYPE_BODY_END");
export const PROP_NAME = Symbol("PROP_NAME");
export const PROP_NAME_OPTIONAL_MODIFIER = Symbol(
  "PROP_NAME_OPTIONAL_MODIFIER",
);
export const PROP_NAME_END = Symbol("PROP_NAME_END");
export const PROP_TYPE_NAME = Symbol("PROP_TYPE_NAME");
export const PROP_TYPE_END = Symbol("PROP_TYPE_END");
export const PROP_TYPE_REF_START = Symbol("PROP_TYPE_REF_START");
export const PROP_TYPE_REF = Symbol("PROP_TYPE_REF");
export const PROP_TYPE_REF_END = Symbol("PROP_TYPE_REF_END");
export const PROP_TYPE_LENGTH_START = Symbol("PROP_TYPE_LENGTH_START");
export const PROP_TYPE_LENGTH = Symbol("PROP_TYPE_LENGTH");
export const PROP_TYPE_LENGTH_END = Symbol("PROP_TYPE_LENGTH_END");
export const PROP_DECORATOR = Symbol("PROP_DECORATOR");
export const ENUM_KEYWORD = Symbol("ENUM_KEYWORD");
export const ENUM_NAME = Symbol("ENUM_NAME");
export const ENUM_BODY_START = Symbol("ENUM_BODY_START");
export const ENUM_BODY = Symbol("ENUM_BODY");
export const ENUM_BODY_END = Symbol("ENUM_BODY_END");
export const ENUM_ITEM_NAME = Symbol("ENUM_ITEM_NAME");
export const $ = Symbol("$");

const separatorRegex = /^[\s\t\[\]\(\),:{}\?\"]$/;
const newlineRegex = /^\r?\n$/;
const whitespaceRegex = /^[\s\t]$/;
// const blankRegex = /^[ \t]$/;
const typeNameRegex = /^\w+$/;
const propNameRegex = /^\w+$/;
const propTypeNameRegex = /^\w+$/;
const propTypeRefRegex = /^\w+$/;
const propTypeLengthRegex = /^\d+$/;
const enumNameRegex = /^\w+$/;
const enumItemNameRegex = /^\w+$/;

function tryIgnoreWhiteSpace(token: string, sym: symbol) {
  if (whitespaceRegex.test(token)) {
    return [token, sym];
  } else {
    return false;
  }
}

const ontypeParser = createLLParser<State>(
  {
    [S]() {
      return [MODEL];
    },
    [MODEL]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, MODEL);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === "type") {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "type-keyword",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, TYPE_KEYWORD];
      }

      if (token === "enum") {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "enum-keyword",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, ENUM_KEYWORD];
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
    [TYPE_KEYWORD]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, TYPE_KEYWORD);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (typeNameRegex.test(token)) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "type-name",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

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
    [TYPE_NAME]([token], { index, line, inlineIndex }) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, TYPE_NAME);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === "{") {
        return [token, TYPE_BODY_START];
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
    [TYPE_BODY_START]() {
      return [TYPE_BODY];
    },
    [TYPE_BODY]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, TYPE_BODY);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (propNameRegex.test(token)) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-name",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, PROP_NAME];
      }

      if (token === "}") {
        return [token, TYPE_BODY_END];
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
        TYPE_BODY,
      ];
    },
    [TYPE_BODY_END]() {
      return [MODEL];
    },
    [PROP_NAME]([token], { index, line, inlineIndex }) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, PROP_NAME);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === "?") {
        return [token, PROP_NAME_OPTIONAL_MODIFIER];
      }

      if (token === ":") {
        return [token, PROP_NAME_END];
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
        TYPE_BODY,
      ];
    },
    [PROP_NAME_OPTIONAL_MODIFIER]([token], { index, line, inlineIndex }) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(
        token,
        PROP_NAME_OPTIONAL_MODIFIER,
      );
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === ":") {
        return [token, PROP_NAME_END];
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
        TYPE_BODY,
      ];
    },
    [PROP_NAME_END]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, PROP_NAME_END);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (propTypeNameRegex.test(token)) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-type-name",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, PROP_TYPE_NAME];
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
        TYPE_BODY,
      ];
    },
    [PROP_TYPE_NAME]([token]) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, PROP_TYPE_NAME);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === "[") {
        return [token, PROP_TYPE_REF_START];
      }

      if (token === "(") {
        return [token, PROP_TYPE_LENGTH_START];
      }

      return [PROP_TYPE_END];
    },
    [PROP_TYPE_END]([token], { line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, PROP_TYPE_END);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token.startsWith("@")) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-decorator",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, PROP_DECORATOR];
      }

      return [TYPE_BODY];
    },
    [PROP_TYPE_REF_START]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, PROP_TYPE_REF_START);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (propTypeRefRegex.test(token)) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-type-ref",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, PROP_TYPE_REF];
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
        TYPE_BODY,
      ];
    },
    [PROP_TYPE_REF]([token], { index, line, inlineIndex }) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, PROP_TYPE_REF);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === "]") {
        return [token, PROP_TYPE_REF_END];
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
        TYPE_BODY,
      ];
    },
    [PROP_TYPE_REF_END]() {
      return [PROP_TYPE_END];
    },
    [PROP_TYPE_LENGTH_START]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(
        token,
        PROP_TYPE_LENGTH_START,
      );
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (propTypeLengthRegex.test(token)) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-type-length",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, PROP_TYPE_LENGTH];
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
        TYPE_BODY,
      ];
    },
    [PROP_TYPE_LENGTH]([token], { index, line, inlineIndex }) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, PROP_TYPE_LENGTH);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === ")") {
        return [token, PROP_TYPE_LENGTH_END];
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
        TYPE_BODY,
      ];
    },
    [PROP_TYPE_LENGTH_END]() {
      return [PROP_TYPE_END];
    },
    [PROP_DECORATOR]() {
      return [TYPE_BODY];
    },
    [ENUM_KEYWORD]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, ENUM_KEYWORD);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (enumNameRegex.test(token)) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "enum-name",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, ENUM_NAME];
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
    [ENUM_NAME]([token], { index, line, inlineIndex }) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, ENUM_NAME);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === "{") {
        return [token, ENUM_BODY_START];
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
    [ENUM_BODY_START]() {
      return [ENUM_BODY];
    },
    [ENUM_BODY]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, ENUM_BODY);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (enumItemNameRegex.test(token)) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "enum-item-name",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, ENUM_ITEM_NAME];
      }

      if (token === "}") {
        return [token, ENUM_BODY_END];
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
        ENUM_BODY,
      ];
    },
    [ENUM_BODY_END]() {
      return [MODEL];
    },
    [ENUM_ITEM_NAME]([token]) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, ENUM_ITEM_NAME);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      return [ENUM_BODY];
    },
    [$]([token], { index, line, inlineIndex }) {
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
  () => [S, $],
);

export type InputStream =
  | ReadStream
  | ReadableStream
  | Readable
  | AsyncIterable<string | Buffer>;

export async function parse(
  stream: InputStream,
  initialState: State,
  options?: ParseOptions,
) {
  return ontypeParser.parse(lexer(stream), initialState, options);
}

export const lexer = createSimpleLexer({
  separatorRegex,
  newlineRegex,
});

// template literal tag for ontype
// Just an alias for String.raw enabling syntax highlighting in editors
export const ontype = String.raw;
