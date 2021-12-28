import fs from 'fs'
import path from 'path'

const jsFileRegex = /\.ts$/

const isDirectory = (p: string) => fs.statSync(p).isDirectory()
const getDirectories = (p: string) =>
  fs
    .readdirSync(p)
    .map(name => path.join(p, name))
    .filter(isDirectory)

const isJsFile = (p: string) => fs.statSync(p).isFile() && jsFileRegex.test(p)

const getJsFiles = (p: string) => {
  const res = fs
    .readdirSync(p)
    .map(name => path.join(p, name))
    .filter(isJsFile)

  return res
}

export const getLibs = (p: string): Array<string> => {
  const dirs = getDirectories(p)
  const files = dirs.map(dir => getLibs(dir)).reduce((a, b) => a.concat(b), [])

  return files.concat(getJsFiles(p))
}

/**
 * @param {string} array with file paths.
 * @param {string} cwd current working directory.
 */
export const makeRelative = (arr = Array<string>(), cwd: string) =>
  arr.map(f => path.relative(cwd, f))
