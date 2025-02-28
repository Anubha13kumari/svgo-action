import type { Outputter } from "../../src/types";

type OutputterMock = jest.Mocked<Outputter>;

const outputter: OutputterMock = {
  setOutput: jest.fn()
    .mockName("outputter.setOutput"),
};

export default outputter;
