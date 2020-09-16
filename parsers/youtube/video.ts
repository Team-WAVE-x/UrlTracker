import { MessageEmbed } from 'discord.js'
import yts from 'yt-search'

interface field {
  name: string,
  value: string,
  inline?: boolean
}

const suffix = ['http://youtube.com', 'https://youtube.com', 'http://youtu.be', 'https://youtu.be']
async function fetch (link: string): Promise<MessageEmbed | null> {
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
  fields.push({ name: '조회수', value: String(info.views) })
  return new MessageEmbed({ color: 0xff0000, fields })
}

export { suffix, fetch }
