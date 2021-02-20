import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NAME_REPO_TOKEN,
} from "./constants";
import { ActionConfig } from "./inputs";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { RawActionConfig } from "./types";

import prEventMain from "./events/pull-request";
import pushEventMain from "./events/push";
import scheduleEventMain from "./events/schedule";

import { fetchJsFile } from "./utils/fetch-js";
import { fetchYamlFile } from "./utils/fetch-yaml";


function getConfigFilePath(): string {
  return core.getInput(INPUT_NAME_CONFIG_PATH, { required: false });
}

function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
}

async function getSvgoConfigFile(
  client: Octokit,
  contextRef: string,
  path: string,
): SVGOptions {
  if (path.endsWith(".js")) {
    return await fetchJsFile(client, contextRef, path);
  } else {
    return await fetchYamlFile(client, contextRef, path);
  }

  return { };
}

async function run(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  try {
    const event = github.context.eventName;
    core.info(`Running SVGO Action in '${event}' context`);
    switch (event) {
      case EVENT_PULL_REQUEST:
        await prEventMain(client, config, svgo);
        break;
      case EVENT_PUSH:
        await pushEventMain(client, config, svgo);
        break;
      case EVENT_SCHEDULE:
        await scheduleEventMain(client, config, svgo);
        break;
      default:
        throw new Error(`Event '${event}' not supported`);
    }
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
  }
}


export default async function main(): Promise<void> {
  const contextRef: string = github.context.sha;
  const token: string = getRepoToken();
  const client: Octokit = github.getOctokit(token);

  const configFilePath: string = getConfigFilePath();
  const rawConfig: RawActionConfig = await fetchYamlFile(
    client,
    contextRef,
    configFilePath,
  );

  const config: ActionConfig = new ActionConfig(core, rawConfig);
  if (config.isDryRun) {
    core.info("Dry mode enabled, no changes will be committed");
  }

  core.info(`Using SVGO major version ${config.svgoVersion}`);
  const svgoOptions: SVGOptions = await getSvgoConfigFile(
    client,
    contextRef,
    config.svgoOptionsPath,
  );
  const svgo: SVGOptimizer = new SVGOptimizer(config.svgoVersion, svgoOptions);

  run(client, config, svgo);
}

main();
