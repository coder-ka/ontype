import { knottaAstTest } from "./knotta-ast.test";
import { knottaSemanticTokensTest } from "./knotta-semantic-tokens.test";
import { llParsingTest } from "./ll-parsing.test";

(async () => {
  await Promise.all(
    [knottaAstTest, knottaSemanticTokensTest, llParsingTest].map(
      async (test) => {
        console.log(`TESTSTART: ${test.description}`);
        await test.content();
        console.log(`TESTEND: ${test.description}`);
      }
    )
  );
})();
