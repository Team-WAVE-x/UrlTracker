import { resolve as path } from 'path'
import { readRecursively } from './utils/index.js'
import { Client, Message, MessageEmbed } from 'discord.js'
const client: Client = new Client()

interface parser {
  suffix: string[],
  fetch: (link: string, msg: Message) => Promise<MessageEmbed | null>
}
const parsers: parser[] = []
const parserpaths: string[] = readRecursively(path() + '/dist/parsers')
parserpaths.forEach(async (v, i) => {
  parsers[i] = await import(v)
})

client.login(process.env.token)

client.on('ready', () => {
  client.user?.setActivity('링크들을 읽어보고 있어요')
  console.log((client.user?.username || 'UrlTracker') + ' is now online!')
})

client.on('message', (msg) => {
  if (msg.author.bot) return
  if (msg.author.id === client.user?.id) return
  if (msg.channel.id !== '714384357648891924') return // for debug

  const splits = msg.content.split('\n').join(' ').split(' ')
  const links = splits.filter((v) => v.startsWith('http://') || v.startsWith('https://'))
  
  links.forEach(async (link) => {
    const parser = parsers.filter((v) => v.suffix.filter((v2) => link.startsWith(v2)).length > 0)[0]
    if (!parser) return
    
    const res: MessageEmbed | null = await parser.fetch(link, msg)
    if (!res) return

    msg.channel.send(res)
  })
})
