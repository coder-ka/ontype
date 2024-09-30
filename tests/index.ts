import { knottaTest } from "./knotta.test";
import { llParsingTest } from "./ll-parsing.test";

(async () => {
  await Promise.all(
    [knottaTest, llParsingTest].map(async (test) => {
      console.log(`TESTSTART: ${test.description}`);
      await test.content();
      console.log(`TESTEND: ${test.description}`);
    })
  );
})();
