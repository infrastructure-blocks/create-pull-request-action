import * as core from "@actions/core";
import { context } from "@actions/github";
import { createHandler } from "./handler.js";
import VError from "verror";
import { getInputs, stringInput } from "@infra-blocks/github";

async function main() {
  core.debug(`received env: ${JSON.stringify(process.env, null, 2)}`);
  core.debug(`received context: ${JSON.stringify(context, null, 2)}`);
  const inputs = getInputs({
    head: stringInput(),
    base: stringInput(),
    title: stringInput({ default: undefined }),
    body: stringInput({ default: undefined }),
    "github-token": stringInput(),
    repository: stringInput(),
  });
  const handler = createHandler({
    config: {
      head: inputs.head,
      base: inputs.base,
      title: inputs.title,
      body: inputs.body,
      gitHubToken: inputs["github-token"],
      repository: inputs.repository,
    },
  });
  const outputs = await handler.handle();
  for (const [key, value] of Object.entries(outputs)) {
    core.debug(`setting output ${key}=${value}`);
    core.setOutput(key, value);
  }
}

main().catch((err: Error) => core.setFailed(VError.fullStack(err)));
