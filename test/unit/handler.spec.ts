import { createHandler } from "../../src/handler.js";
import { expect } from "@infra-blocks/test";

describe("handler", function () {
  describe(createHandler.name, function () {
    it("should create handler", function () {
      const handler = createHandler({
        config: {
          base: "master",
          head: "feature/shut-the-hell-up",
          title: "Hello?",
          gitHubToken: "123456789",
          repository: "big/repo",
        },
      });
      expect(handler).to.not.be.null;
    });
  });
});
