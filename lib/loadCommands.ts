import fs from 'fs'
import path from 'path'

const tsFileRegex = /\.ts$/

const isDirectory = (p: string) => fs.statSync(p).isDirectory()

const getDirectories = (p: string) =>
  fs
    .readdirSync(p)
    .map(name => path.join(p, name))
    .filter(isDirectory)

const isTsFile = (p: string) => fs.statSync(p).isFile() && tsFileRegex.test(p)

const getTsFiles = (p: string) => {
  const res = fs
    .readdirSync(p)
    .map(name => path.join(p, name))
    .filter(isTsFile)

  return res
}

export const getLibs = (p: string): string[] => {
  const dirs = getDirectories(p)
  const files = dirs.map(dir => getLibs(dir)).flat()

  return files.concat(getTsFiles(p))
}

/**
 * @param {string[]} array with file paths.
 * @param {string} cwd current working directory.
 */
export const makeRelative = (arr: string[], cwd: string) =>
  arr.map(f => path.relative(cwd, f))
