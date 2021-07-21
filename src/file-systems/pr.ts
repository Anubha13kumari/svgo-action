import type { error } from "../types";
import type { GitHubClient } from "../clients";
import type { FileInfo, FileSystem, ListFilesFn } from "./types";

import errors from "../errors";

interface Context {
  readonly payload: {
    readonly pull_request: {
      readonly number: number;
    };
  };
  readonly repo: {
    readonly owner: string;
    readonly repo: string;
  };
}

async function getPrFiles(
  client: GitHubClient,
  context: Context,
): Promise<[string[], error]> {
  const perPage = 100;

  const result: string[] = [];
  let err: error = null;

  let curPage = 0;
  while (++curPage) {
    const [{ data }, err0] = await client.pulls.listFiles({
      ...context.repo,
      pullNumber: context.payload.pull_request.number,
      page: curPage,
      perPage,
    });

    if (err0 !== null) {
      err = errors.New(`Could not get Pull Request files (${err0})`);
      break;
    }

    const files = data
      .filter((entry) => entry.status !== "removed")
      .map((entry) => entry.filename);
    result.push(...files);

    if (data.length < perPage) {
      break;
    }
  }

  return [result, err];
}

function createListFiles(
  fs: FileSystem,
  files: string[],
): ListFilesFn {
  return function*(fileOrFolder: string): Iterable<FileInfo> {
    for (const entry of fs.listFiles(fileOrFolder)) {
      if (files.includes(entry.path)) {
        yield entry;
      }
    }
  };
}

interface Params {
  readonly fs: FileSystem;
  readonly path: {
    resolve(...args: string[]): string;
  };
}

export function createPrFileSystemBuilder({ fs, path }: Params) {
  return async function(
    client: GitHubClient,
    context: Context,
  ): Promise<[FileSystem, error]> {
    const [prFiles, err] = await getPrFiles(client, context);
    if (err !== null) {
      return [fs, err];
    }

    const prFilePaths = prFiles.map((file) => path.resolve(".", file));

    return [
      {
        listFiles: createListFiles(fs, prFilePaths),
        readFile: fs.readFile,
        writeFile: fs.writeFile,
      },
      null,
    ];
  };
}

export type {
  Context as PrContext,
};