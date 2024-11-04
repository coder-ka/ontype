import { ontypeAstTest } from "./ast.test";
import { ontypeSemanticTokensTest } from "./semantic-tokens.test";

(async () => {
  await Promise.all(
    [ontypeAstTest, ontypeSemanticTokensTest].map(async (test) => {
      console.log(`TESTSTART: ${test.description}`);
      await test.content();
      console.log(`TESTEND: ${test.description}`);
    })
  );
})();
