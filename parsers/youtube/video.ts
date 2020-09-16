import { Message, MessageEmbed } from 'discord.js'
import yts from 'yt-search'

interface field {
  name: string,
  value: string,
  inline?: boolean
}

const suffix = ['http://youtube.com/watch', 'https://youtube.com/watch', 'http://youtu.be', 'https://youtu.be']
async function fetch (link: string, msg: Message): Promise<MessageEmbed | null> {
  const url = new URL(link)
  let id: string | null = null
  switch (url.hostname) {
    case 'youtube.com': { id = url.searchParams.get('v'); break }
    case 'www.youtube.com': { id = url.searchParams.get('v'); break }
    case 'youtu.be': { id = url.pathname.split('/')[1]; break }
  }
  
  if (!id) return null
  const info = await yts({ videoId: id })

  if (!info) return null

  const fields: field[] = []
  fields.push({ name: '조회수', value: info.views.toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).replace('€', '') })

  await msg.react(':urlinfo:755765030267388014')
  await msg.awaitReactions((r) => r.emoji.id === '755765030267388014', { max: 1 })
  return new MessageEmbed({ title: '위 유튜브 링크에 대한 정보에요!', color: 0xff0000, fields })
}

export { suffix, fetch }
