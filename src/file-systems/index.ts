import type { FileFilter, FileHandle, FileSystem } from "./types";

import * as fs from "fs";
import * as path from "path";

import NewBaseFileSystem from "./base";
import NewFilteredFileSystem from "./filtered";

interface Params {
  readonly filters: FileFilter[];
}

function New({ filters }: Params): FileSystem {
  const baseFs = NewBaseFileSystem({ fs, path });
  const newFs = NewFilteredFileSystem({ fs: baseFs, filters });
  return newFs;
}

export default {
  New,
};

export type {
  FileHandle,
  FileSystem,
};
