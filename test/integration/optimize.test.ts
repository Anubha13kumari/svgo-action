import { when, resetAllWhenMocks } from "jest-when";

import optimize from "../../src/optimize";

describe("package optimize", () => {
  describe("::Files", () => {
    let fs;
    let optimizer;

    const testCases = [
      [[
        /* no files */
      ]],
      [[
        { path: "foobar.svg" },
      ]],
      [[
        { path: "foo.svg" },
        { path: "bar.svg" },
      ]],
    ];

    beforeAll(() => {
      fs = {
        listFiles: jest.fn()
          .mockReturnValue([])
          .mockName("fs.listFiles"),
        readFile: jest.fn()
          .mockResolvedValue(["", null])
          .mockName("fs.readFile"),
        writeFile: jest.fn()
          .mockResolvedValue(null)
          .mockName("fs.writeFile"),
      };

      optimizer = {
        optimize: jest.fn()
          .mockResolvedValue(["optimized SVG", null])
          .mockName("optimizer.optimize"),
      };
    });

    beforeEach(() => {
      fs.listFiles.mockClear();
      fs.readFile.mockClear();
      fs.writeFile.mockClear();

      optimizer.optimize.mockClear();

      resetAllWhenMocks();
    });

    test.each(testCases)("optimize files (%j)", async (files) => {
      const config = { isDryRun: false };

      fs.listFiles.mockReturnValue(files);
      files.forEach((file, i) => {
        when(fs.readFile)
          .calledWith(file)
          .mockReturnValue([`<svg>${i}</svg>`, null]);
      });

      const [stats, err] = await optimize.Files({ config, fs, optimizer });
      expect(err).toBeNull();

      expect(stats.svgCount).toEqual(files.length);
      expect(stats.optimizedCount).toEqual(files.length);

      expect(optimizer.optimize).toHaveBeenCalledTimes(files.length);
      expect(fs.readFile).toHaveBeenCalledTimes(files.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(files.length);
    });

    test.each(testCases)("dry run enabled (%j)", async (files) => {
      const config = { isDryRun: true };

      fs.listFiles.mockReturnValue(files);

      const [stats, err] = await optimize.Files({ config, fs, optimizer });
      expect(err).toBeNull();

      expect(stats.svgCount).toEqual(files.length);
      expect(stats.optimizedCount).toEqual(files.length);

      expect(optimizer.optimize).toHaveBeenCalledTimes(files.length);
      expect(fs.readFile).toHaveBeenCalledTimes(files.length);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});
