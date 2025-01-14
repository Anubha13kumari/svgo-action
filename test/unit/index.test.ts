import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("../../src/main");

import * as core from "@actions/core";
import * as github from "@actions/github";

import _main from  "../../src/main";

const main = mocked(_main);

import "../../src/index";

describe("index.ts", () => {
  test("action initialization", () => {
    expect(main).toHaveBeenCalledWith({
      core,
      github,
    });
  });
});
