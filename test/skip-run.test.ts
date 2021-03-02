import type { Context } from "@actions/github/lib/context";

import * as github from "./mocks/@actions/github.mock";
import * as githubAPI from "./mocks/github-api.mock";

jest.mock("../src/github-api", () => githubAPI);

import { EVENT_PULL_REQUEST, EVENT_PUSH, EVENT_SCHEDULE } from "../src/constants";
import { shouldSkipRun } from "../src/skip-run";


const client = github.getOctokit("token");


function newMockContext(
  eventName: string,
  commits: { message: string }[] = [],
): Context {
  return {
    eventName,
    payload: {
      commits,
      pull_request: {
        head: {
          ref: "ref",
        },
      },
    },
  } as unknown as Context;
}

describe("::shouldSkipRun", () => {

  test.each([
    EVENT_SCHEDULE,
    "nonsense",
  ])("non-skippable event types", async (eventName) => {
    const context = newMockContext(eventName);

    const result = await shouldSkipRun(client, context);
    expect(result.shouldSkip).toBe(false);
    expect(githubAPI.getCommitMessage).not.toHaveBeenCalled();
    expect(githubAPI.getPrComments).not.toHaveBeenCalled();
    expect(githubAPI.getPrNumber).not.toHaveBeenCalled();
  });

  describe("eventName: pull_request", () => {

    const eventName = EVENT_PULL_REQUEST;
    const stdCommitMessage = "Hello world!";

    beforeEach(() => {
      githubAPI.getCommitMessage.mockResolvedValue(stdCommitMessage);
    });

    test("disabled from commit", async () => {
      const context = newMockContext(eventName);

      githubAPI.getCommitMessage.mockResolvedValue("disable-svgo-action");

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(true);
      expect(githubAPI.getCommitMessage).toHaveBeenCalledTimes(1);
      expect(githubAPI.getPrComments).not.toHaveBeenCalled();
      expect(githubAPI.getPrNumber).not.toHaveBeenCalled();
    });

    test("no Pull Request comment", async () => {
      const context = newMockContext(eventName);
      const prNumber = 36;

      githubAPI.getPrNumber.mockReturnValue(prNumber);
      githubAPI.getPrComments.mockResolvedValue([]);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(false);
      expect(githubAPI.getCommitMessage).toHaveBeenCalledTimes(1);
      expect(githubAPI.getPrComments).toHaveBeenCalledWith(client, prNumber);
      expect(githubAPI.getPrNumber).toHaveBeenCalledTimes(1);
    });

    test.each([
      [["42"]],
      [["Hello", "world"]],
      [["praise", "the", "sun"]],
    ])("comments, neither enable nor disable", async (comments) => {
      const context = newMockContext(eventName);
      const prNumber = 42;

      githubAPI.getPrNumber.mockReturnValue(prNumber);
      githubAPI.getPrComments.mockResolvedValue(comments);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(false);
      expect(githubAPI.getCommitMessage).toHaveBeenCalledTimes(1);
      expect(githubAPI.getPrComments).toHaveBeenCalledWith(client, prNumber);
      expect(githubAPI.getPrNumber).toHaveBeenCalledTimes(1);
    });

    test.each([
      [["Hello disable-svgo-action", "world"]],
      [["foo", "disable-svgo-action bar"]],
    ])("disabled from Pull Request comment", async (comments) => {
      const context = newMockContext(eventName);
      const prNumber = 1997;

      githubAPI.getPrNumber.mockReturnValue(prNumber);
      githubAPI.getPrComments.mockResolvedValue(comments);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(true);
      expect(githubAPI.getCommitMessage).toHaveBeenCalledTimes(1);
      expect(githubAPI.getPrComments).toHaveBeenCalledWith(client, prNumber);
      expect(githubAPI.getPrNumber).toHaveBeenCalledTimes(1);
    });

    test.each([
      [["Hello enable-svgo-action", "world"]],
      [["foo", "enable-svgo-action bar"]],
    ])("enabled from Pull Request comment", async (comments) => {
      const context = newMockContext(eventName);
      const prNumber = 1997;

      githubAPI.getPrNumber.mockReturnValue(prNumber);
      githubAPI.getPrComments.mockResolvedValue(comments);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(false);
      expect(githubAPI.getCommitMessage).toHaveBeenCalledTimes(1);
      expect(githubAPI.getPrComments).toHaveBeenCalledWith(client, prNumber);
      expect(githubAPI.getPrNumber).toHaveBeenCalledTimes(1);
    });

    test.each([
      [["enable-svgo-action", "disable-svgo-action"], false],
      [["disable-svgo-action", "enable-svgo-action"], true],
    ])("enabled and disabled from Pull Request comment", async (comments, expected) => {
      const context = newMockContext(eventName);
      const prNumber = 1997;

      githubAPI.getPrNumber.mockReturnValue(prNumber);
      githubAPI.getPrComments.mockResolvedValue(comments);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(expected);
      expect(githubAPI.getCommitMessage).toHaveBeenCalledTimes(1);
      expect(githubAPI.getPrComments).toHaveBeenCalledWith(client, prNumber);
      expect(githubAPI.getPrNumber).toHaveBeenCalledTimes(1);
    });

    test("enabled from comment, disabled from Pull Request", async () => {
      const context = newMockContext(eventName);
      const prNumber = 1997;

      githubAPI.getPrNumber.mockReturnValue(prNumber);
      githubAPI.getPrComments.mockResolvedValue(["disable-svgo-action"]);
      githubAPI.getCommitMessage.mockResolvedValue("enable-svgo-action");

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(false);
      expect(githubAPI.getCommitMessage).toHaveBeenCalledTimes(1);
      expect(githubAPI.getPrComments).not.toHaveBeenCalled();
      expect(githubAPI.getPrNumber).not.toHaveBeenCalled();
    });

    test("head ref is missing", async () => {
      const prNumber = 36;
      const context = newMockContext(eventName);
      context.payload.pull_request = undefined;

      githubAPI.getPrNumber.mockReturnValue(prNumber);
      githubAPI.getPrComments.mockResolvedValue([]);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(false);
      expect(githubAPI.getCommitMessage).not.toHaveBeenCalled();
      expect(githubAPI.getPrComments).toHaveBeenCalledWith(client, prNumber);
      expect(githubAPI.getPrNumber).toHaveBeenCalledTimes(1);
    });

    afterEach(() => {
      githubAPI.getCommitMessage.mockClear();
      githubAPI.getPrComments.mockClear();
      githubAPI.getPrNumber.mockClear();
    });

  });

  describe("eventName: push", () => {

    const eventName = EVENT_PUSH;

    test("not disabled from commit", async () => {
      const commits = [
        { message: "Hello" },
        { message: "world!" },
      ];
      const context = newMockContext(eventName, commits);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(false);
    });

    test("disabled from commit", async () => {
      const commits = [
        { message: "disable-svgo-action" },
        { message: "Hello world!" },
      ];
      const context = newMockContext(eventName, commits);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(true);
    });

    test("disabled from older commit", async () => {
      const commits = [
        { message: "Hello world!" },
        { message: "disable-svgo-action" },
      ];
      const context = newMockContext(eventName, commits);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(false);
    });

    test("no commits", async () => {
      const context = newMockContext(eventName, []);

      const result = await shouldSkipRun(client, context);
      expect(result.shouldSkip).toBe(false);
    });

  });

});
