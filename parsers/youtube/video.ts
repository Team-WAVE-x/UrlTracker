import { Message, MessageEmbed } from 'discord.js'
import yts, { VideoMetadataResult } from 'yt-search'

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
  let info: VideoMetadataResult | null = null
  try {
    info = await yts({ videoId: id })
  } catch (_) { return null }

  if (!info) return null

  const description = info.title + ' - ' + info.author.name
  const fields: field[] = []

  fields.push({ name: '조회수', value: info.views.toLocaleString('en-US', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).replace('€', '') + '회', inline: true })
  fields.push({ name: '길이', value: new Date(info.duration.seconds * 1000).toISOString().substr(11, 8), inline: true })
  fields.push({ name: '업로드일', value: info.uploadDate, inline: true })
  fields.push({ name: '분류', value: info.genre, inline: true })
  fields.push({ name: '설명', value: info.description.substr(0, 100) + (info.description.length > 100 ? '...' : ''), inline: true })

  await msg.react(':urlinfo:755765030267388014')
  await msg.awaitReactions((r) => r.emoji.id === '755765030267388014', { max: 1 })
  return new MessageEmbed({ title: '위 유튜브 링크에 대한 정보에요!', description, color: 0xff0000, fields }).setThumbnail(info.image)
}

export { suffix, fetch }
