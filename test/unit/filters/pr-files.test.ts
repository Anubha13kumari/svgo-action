import { _sampleClient as client } from "../../__mocks__/clients.mock";

import New from "../../../src/filters/pr-files";
import errors from "../../../src/errors";

describe("filters/pr-files.ts", () => {
  describe("::New", () => {
    let context;

    const pageSize = 100;

    function createFilesList(length: number): unknown[] {
      const result: unknown[] = [];
      for (let _ = 0; _ < length; _++) {
        result.push({
          status: "added",
          filename: "foo.bar",
        });
      }

      return result;
    }

    beforeEach(() => {
      context = {
        payload: {
          pull_request: {
            number: 42,
          },
        },
        repo: {
          owner: "pikachu",
          repo: "pokédex",
        },
      };

      client.pulls.listFiles.mockClear();
    });

    test("use client correctly", async () => {
      const [, err] = await New({ client, context });
      expect(err).toBeNull();
      expect(client.pulls.listFiles).toHaveBeenCalledWith({
        owner: context.repo.owner,
        repo: context.repo.repo,
        pullNumber: context.payload.pull_request.number,
        perPage: pageSize,
        page: 1,
      });
    });

    test.each([
      2,
      3,
    ])("paginate Pull Request files (%d pages)", async (pages) => {
      expect(pages).toBeGreaterThan(0);

      const lastPageSize = 2;
      expect(pageSize).toBeGreaterThan(lastPageSize);

      for (let _ = 0; _ < pages - 1; _++) {
        const files = createFilesList(pageSize);
        client.pulls.listFiles.mockResolvedValueOnce([files, null]);
      }

      const files = createFilesList(lastPageSize);
      client.pulls.listFiles.mockResolvedValueOnce([files, null]);

      const [, err] = await New({ client, context });
      expect(err).toBeNull();

      expect(client.pulls.listFiles).toHaveBeenCalledTimes(pages);
    });

    test("the filter", async () => {
      const addedFile = { filename: "foo.bar", status: "added" };
      const modifiedFile = { filename: "hello.world", status: "modified" };
      const removedFile = { filename: "lorem.ipsum", status: "removed" };
      const otherFile = { filename: "praise/the.sun", status: "removed" };

      const files = [addedFile, modifiedFile, removedFile];

      client.pulls.listFiles.mockResolvedValueOnce([files, null]);

      const [filter, err] = await New({ client, context });
      expect(err).toBeNull();
      expect(filter).not.toBeNull();

      expect(filter(addedFile.filename)).toBe(true);
      expect(filter(modifiedFile.filename)).toBe(true);
      expect(filter(removedFile.filename)).toBe(false);
      expect(filter(otherFile.filename)).toBe(false);
    });

    test("list Pull Request files error", async () => {
      client.pulls.listFiles.mockResolvedValueOnce([
        [],
        errors.New("could not list Pull Request files"),
      ]);

      const [filter, err] = await New({ client, context });
      expect(err).not.toBeNull();
      expect(filter).not.toBeNull();

      const result = filter("foo.bar");
      expect(result).toBe(false);
    });

    test("missing Pull Request number from context", async () => {
      delete context.payload.pull_request;

      const [filter, err] = await New({ client, context });
      expect(err).not.toBeNull();
      expect(filter).not.toBeNull();

      const result = filter("foo.bar");
      expect(result).toBe(false);
    });
  });
});
