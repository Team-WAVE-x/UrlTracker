import { readdirSync, statSync } from 'fs'

function toReadableNumber (num: number): string {
  return num.toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).replace('€', '')
}

// from https://gist.github.com/kethinov/6658166
function readRecursively (dir: string, filelist: string[] = []) {
  const files = readdirSync(dir)
  files.forEach((file) => {
    if (file.endsWith('.map')) return
    if (statSync(dir + '/' + file).isDirectory()) filelist = readRecursively(dir + '/' + file, filelist)
    else filelist.push(dir + '/' + file)
  })

  return filelist
}

export { toReadableNumber, readRecursively }
