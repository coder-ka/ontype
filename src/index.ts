import type { ReadStream } from "fs";
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
  optional: boolean;
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
  enableSemanticTokens: boolean;
  semanticTokens: {
    type: string;
    length: number;
    line: number;
    inlineIndex: number;
  }[];
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
export const OPTIONAL_PROP_NAME_END = Symbol("OPTIONAL_PROP_NAME_END");
export const PROP_TYPE = Symbol("PROP_TYPE");
export const PROP_TYPE_NAME_END = Symbol("PROP_TYPE_NAME_END");
export const PROP_REF = Symbol("PROP_REF");
export const PROP_REF_END = Symbol("PROP_REF_END");
export const PROP_DECORATOR = Symbol("PROP_DECORATOR");
export const $ = Symbol("$");

const separatorRegex = /^[\s\t\[\],:{}\?]$/;
const newlineRegex = /^\r?\n$/;
const whitespaceRegex = /^[\s\t]$/;
const blankRegex = /^[ \t]$/;
const typeNameRegex = /^\w+$/;
const propNameRegex = /^\w+$/;
const propTypeNameRegex = /^\w+$/;
const ontypeParser = createLLParser<State>(
  {
    [START]([token], { index, line, inlineIndex }, state) {
      if (whitespaceRegex.test(token)) {
        return [token, START];
      }

      if (token === "import") {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "import",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }
        return [token, IMPORT_PATH];
      }

      if (token === "type") {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "type",
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
        }
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "string",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }
        return [token, START];
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
    [MODEL]([token], { index, line, inlineIndex }, state) {
      if (whitespaceRegex.test(token)) {
        return [token, MODEL];
      }

      if (token === "type") {
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "type",
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
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "type-name",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
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
    [TYPE_CONTENT_START]([token], { index, line, inlineIndex }) {
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
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "type-decorator",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
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
            optional: false,
          });
        }
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-name",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
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
    [PROP_NAME_END]([token], { index, line, inlineIndex }, state) {
      if (whitespaceRegex.test(token)) {
        return [token, PROP_NAME_END];
      }

      if (token.startsWith("?")) {
        if (state.enableAst) {
          state.ast.types[state.ast.types.length - 1].props[
            state.ast.types[state.ast.types.length - 1].props.length - 1
          ].optional = true;
        }
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-optional",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
        }
        return [token, OPTIONAL_PROP_NAME_END];
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
    [OPTIONAL_PROP_NAME_END]([token], { index, line, inlineIndex }) {
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
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-type-name",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
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
        if (state.enableSemanticTokens) {
          state.semanticTokens.push({
            type: "prop-ref",
            length: token.length,
            line,
            inlineIndex: inlineIndex - token.length,
          });
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
    [PROP_DECORATOR]([token], { line, inlineIndex }, state) {
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
  stream:
    | ReadStream
    | ReadableStream
    | Readable
    | AsyncIterable<string | Buffer>,
  initialState: State,
  options?: ParseOptions
) {
  return ontypeParser.parse(lexer(stream), initialState, options);
}

export const lexer = createSimpleLexer({
  separatorRegex,
  newlineRegex,
  useQuote: true,
  useEscape: true,
  escapeChar: "\\",
});
