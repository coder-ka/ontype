# ontype

Ontype is a simple schema language similar to TypeScript.

Below is a valid Ontype schema, highlighted using TypeScript syntax:

```ts
import "ontype/primitive.ontype"

type User {
    @hogehoge
    id: char
    password: string @hidden
    passwordSalt: string @hidden
}

type Todo {
    id: char
    title: string(10)
    deadline?: datetime @nullable
    authorId: User[id]
}

enum TodoStatus {
    READY: 0
    IN_PROGRESS: 1
    DONE: "done"
}
```

- `import "ontype/primitive.ontype"` imports another Ontype file.
- `type User {}` defines a `User` type.
- `@hogehoge` is a type decorator for `User`.
- `id: char` declares that the `id` property is of type `char`.
- `password: string @hidden` defines a property with a decorator `@hidden`.
- `deadline?: datetime @nullable` declares an optional property `deadline`.
- `authorId: User[id]` indicates that `authorId` references the `id` property of `User`.
- `enum TodoStatus` defines an enum named `TodoStatus`.
- `READY: 0` assigns the value `0` to the `READY` enum member.

## Parser

This repository includes an Ontype parser, available as an npm package.

```bash
npm i ontype
```

```ts
import { parse } from "ontype";

const readStream = fs.createReadStream('./example.ontype', "utf-8");

const { errors, result } = await parse(readStream, {
  enableAst: true,
  ast: {
    imports: [],
    types: [],
    enums: [],
  },
  enableSemanticTokens: true,
  semanticTokens: [],
});

console.log(result.ast);
console.log(result.semanticTokens);
console.log(errors);
```

## LSP

- [vscode](https://marketplace.visualstudio.com/items?itemName=coder-ka.vscode-ontype)
