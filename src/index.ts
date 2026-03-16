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
      | "enum-item-name"
      | "enum-item-integer-value"
      | "enum-item-string-value";
    length: number;
    line: number;
    inlineIndex: number;
  }[];
  stringBuffer: string;
  stringBufferStartInlineIndex: number | null;
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
export const ENUM_ITEM_NAME_END = Symbol("ENUM_ITEM_NAME_END");
export const ENUM_ITEM_VALUE = Symbol("ENUM_ITEM_VALUE");
export const ENUM_ITEM_INTEGER_VALUE = Symbol("ENUM_ITEM_INTEGER_VALUE");
export const ENUM_ITEM_STRING_VALUE_START = Symbol(
  "ENUM_ITEM_STRING_VALUE_START",
);
export const ENUM_ITEM_STRING_VALUE = Symbol("ENUM_ITEM_STRING_VALUE");
export const ENUM_ITEM_STRING_VALUE_END = Symbol("ENUM_ITEM_STRING_VALUE_END");
export const ENUM_ITEM_VALUE_END = Symbol("ENUM_ITEM_VALUE_END");
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
const enumItemIntegerValueRegex = /^\d+$/;
const enumItemStringValueRegex = /^[^"]+$/;

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
    [ENUM_ITEM_NAME]([token], { index, line, inlineIndex }) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, ENUM_ITEM_NAME);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (token === ":") {
        return [token, ENUM_ITEM_NAME_END];
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
    [ENUM_ITEM_NAME_END]([token], { index, line, inlineIndex }, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, ENUM_ITEM_NAME_END);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      if (enumItemIntegerValueRegex.test(token)) {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "enum-item-integer-value",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }

        return [token, ENUM_ITEM_INTEGER_VALUE];
      }

      if (token === '"') {
        return [token, ENUM_ITEM_STRING_VALUE_START];
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
    [ENUM_ITEM_INTEGER_VALUE]([token]) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(
        token,
        ENUM_ITEM_INTEGER_VALUE,
      );
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      return [ENUM_ITEM_VALUE_END];
    },
    [ENUM_ITEM_STRING_VALUE_START](
      [token],
      { index, line, inlineIndex },
      state,
    ) {
      state.stringBuffer = "";
      state.stringBufferStartInlineIndex = inlineIndex - token.length - 1;
      if (enumItemStringValueRegex.test(token)) {
        return [ENUM_ITEM_STRING_VALUE];
      }

      if (token === '"') {
        return [token, ENUM_ITEM_STRING_VALUE_END];
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
    [ENUM_ITEM_STRING_VALUE]([token], { index, line, inlineIndex }, state) {
      if (enumItemStringValueRegex.test(token)) {
        state.stringBuffer += token;

        return [token, ENUM_ITEM_STRING_VALUE];
      }

      if (token === '"') {
        if (
          state.enableSemanticTokens &&
          state.stringBuffer !== "" &&
          state.stringBufferStartInlineIndex !== null
        ) {
          const lines = state.stringBuffer.split(/\r?\n/);
          if (lines.length === 1) {
            state.semanticTokens.push({
              type: "enum-item-string-value",
              length: state.stringBuffer.length + 2,
              line,
              inlineIndex: inlineIndex - state.stringBuffer.length - 2,
            });
          } else {
            const stringBufferStartInlineIndex =
              state.stringBufferStartInlineIndex;

            lines.forEach((row, i) => {
              const lineIndex = line - (lines.length - 1) + i;
              const isLast = i === lines.length - 1;
              const length = row.length + (i === 0 || isLast ? 1 : 0);

              state.semanticTokens.push({
                type: "enum-item-string-value",
                length,
                line: lineIndex,
                inlineIndex: i === 0 ? stringBufferStartInlineIndex : 0,
              });
            });
          }
        }

        return [token, ENUM_ITEM_STRING_VALUE_END];
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
    [ENUM_ITEM_STRING_VALUE_END]([token], _, state) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, ENUM_ITEM_VALUE_END);
      if (ignoreWhiteSpace) return ignoreWhiteSpace;

      state.stringBuffer = "";
      state.stringBufferStartInlineIndex = null;

      return [ENUM_ITEM_VALUE_END];
    },
    [ENUM_ITEM_VALUE_END]([token]) {
      const ignoreWhiteSpace = tryIgnoreWhiteSpace(token, ENUM_ITEM_VALUE_END);
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
