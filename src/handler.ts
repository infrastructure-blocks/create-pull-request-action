import VError from "verror";
import { Octokit } from "@octokit/core";

// TODO: move into lib?
export type Outputs = Record<string, string>;

export interface Handler<O extends Outputs = Outputs> {
  handle(): Promise<O>;
}

export interface Config {
  gitHubToken: string;
  repository: string;
  head: string;
  base: string;
  title?: string;
  body?: string;
}

export interface CreatePullRequestOutputs extends Outputs {
  ["pull-request"]: string;
}

export class CreatePullRequestHandler
  implements Handler<CreatePullRequestOutputs>
{
  private static ERROR_NAME = "CreatePullRequestHandlerError";

  private readonly octokit: Octokit;
  private readonly config: Config;

  constructor(params: { octokit: Octokit; config: Config }) {
    const { octokit, config } = params;
    this.octokit = octokit;
    this.config = config;
  }

  async handle(): Promise<CreatePullRequestOutputs> {
    const pullRequest = await this.createPullRequest();

    return {
      "pull-request": JSON.stringify(pullRequest),
    };
  }

  private async createPullRequest() {
    const [owner, repo] = this.config.repository.split("/");

    try {
      // TODO: github lib.
      const response = await this.octokit.request(
        "POST /repos/{owner}/{repo}/pulls",
        {
          owner,
          repo,
          head: this.config.head,
          base: this.config.base,
          title: this.config.title,
          body: this.config.body,
        }
      );

      return response.data;
    } catch (err) {
      throw new VError(
        { name: CreatePullRequestHandler.ERROR_NAME, cause: err as Error },
        `error creating pull request on ${this.config.repository} from ${this.config.head} to ${this.config.base}`
      );
    }
  }
}

export function createHandler(params: { config: Config }): Handler {
  const { config } = params;
  const octokit = new Octokit({ auth: config.gitHubToken });
  return new CreatePullRequestHandler({ octokit, config });
}
