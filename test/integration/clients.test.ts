import { when, resetAllWhenMocks } from "jest-when";

import inp from "../__common__/inputter.mock";

jest.mock("@actions/github");

import * as github from "@actions/github";

import clients from "../../src/clients";

describe("package clients", () => {
  function doMockGetInputRepoToken(fn: () => string): void {
    when(inp.getInput)
      .calledWith("repo-token", expect.anything())
      .mockImplementationOnce(fn);
  }

  beforeEach(() => {
    resetAllWhenMocks();
  });

  test("create client", () => {
    doMockGetInputRepoToken(() => "token");

    const [result, err] = clients.New({ github, inp });

    expect(err).toBeNull();
    expect(result).toBeDefined();
  });

  test.each(["foo", "bar"])("get repo-token (token: '%s')", (token) => {
    doMockGetInputRepoToken(() => token);

    const [, err] = clients.New({ github, inp });

    expect(err).toBeNull();
    expect(github.getOctokit).toHaveBeenCalledWith(token);
  });

  test("no repo-token", () => {
    doMockGetInputRepoToken(() => { throw new Error(); });

    const [, err] = clients.New({ github, inp });

    expect(err).not.toBeNull();
  });

  describe("Client", () => {
    let client;
    let octokit;

    beforeAll(() => {
      octokit = github.getOctokit("token");
    });

    beforeEach(() => {
      [client] = clients.New({ github, inp });
    });

    describe("::commits", () => {
      describe("::listFiles", () => {
        const owner = "pikachu";
        const repo = "pokédex";
        const ref = "commit-1";

        beforeEach(() => {
          octokit.rest.repos.getCommit.mockReset();
        });

        test.each([
          [[/* no files */]],
          [[{ filename: "foobar", status: "modified" }]],
        ])("request success, %#", async (files) => {
          octokit.rest.repos.getCommit.mockResolvedValueOnce({
            data: { files },
          });

          const [result, err] = await client.commits.listFiles({
            owner,
            repo,
            ref,
          });

          expect(err).toBeNull();
          expect(result).toEqual(files);
          expect(octokit.rest.repos.getCommit).toHaveBeenCalledWith({
            owner,
            repo,
            ref,
          });
        });

        test("request error", async () => {
          octokit.rest.repos.getCommit.mockRejectedValueOnce(new Error());

          const [, err] = await client.commits.listFiles({
            owner,
            repo,
            ref,
          });

          expect(err).not.toBeNull();
        });
      });
    });

    describe("::pulls", () => {
      describe("::listFiles", () => {
        const owner = "pikachu";
        const repo = "pokédex";
        const pullNumber = 42;
        const perPage = 10;
        const page = 1;

        beforeEach(() => {
          octokit.rest.pulls.listFiles.mockReset();
        });

        test.each([
          [[/* no files */]],
          [[{ filename: "foobar", status: "modified" }]],
        ])("request success, %#", async (files) => {
          octokit.rest.pulls.listFiles.mockResolvedValueOnce({
            data: files,
          });

          const [result, err] = await client.pulls.listFiles({
            owner,
            repo,
            pullNumber,
            perPage,
            page,
          });

          expect(err).toBeNull();
          expect(result).toEqual(files);
          expect(octokit.rest.pulls.listFiles).toHaveBeenCalledWith({
            owner,
            repo,
            pull_number: pullNumber,
            per_page: perPage,
            page,
          });
        });

        test("request error", async () => {
          octokit.rest.pulls.listFiles.mockRejectedValueOnce(new Error());

          const [, err] = await client.pulls.listFiles({
            owner,
            repo,
            pullNumber,
            perPage,
            page,
          });

          expect(err).not.toBeNull();
        });
      });
    });
  });
});
