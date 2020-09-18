import { toReadableNumber } from '../../utils/index.js'
import { Message, MessageEmbed } from 'discord.js'
import superagent from 'superagent'
import moment from 'moment'

interface field {
  name: string,
  value: string,
  inline?: boolean
}

const suffix = ['http://github.com', 'https://github.com']
async function fetch (link: string, msg: Message): Promise<MessageEmbed | null> {
  const url = new URL(link)
  const res = await superagent.get('https://api.github.com/repos' + url.pathname).set('User-Agent', 'UrlTracker').catch(() => {})
  
  if (!res) return null
  const description = res.body.name + ' - ' + res.body.owner.login
  const fields: field[] = []
  
  fields.push({ name: '스타 개수', value: toReadableNumber(res.body.stargazers_count) + '회', inline: true })
  fields.push({ name: '포크 개수', value: toReadableNumber(res.body.forks) + '개', inline: true })
  fields.push({ name: '코드 크기', value: toReadableNumber(res.body.size) + 'KB', inline: true })
  fields.push({ name: '레포 개설일', value: moment(res.body.created_at).format('YYYY-M-D'), inline: true })
  
  const lastCommit = await superagent.get('https://api.github.com/repos' + url.pathname + '/commits?per_page=1&page=0').set('User-Agent', 'UrlTracker').catch(() => {})
  fields.push({ name: '최근 커밋일', value: lastCommit ? (lastCommit.body[0] ? moment(lastCommit.body[0].commit.committer.date).format('YYYY-M-D') : '불러오지 못했습니다') : '불러오지 못했습니다', inline: true })

  const firstCommit = await superagent.get(
    lastCommit ? (
      lastCommit.headers.link ?
        lastCommit.headers.link.split(',')[1].split(';')[0].split('<')[1].split('>')[0]
        : 'https://api.github.com/repos' + url.pathname + '/commits?per_page=1&page=0'
      ) : 'https://api.github.com/repos' + url.pathname + '/commits?per_page=1&page=0'
    ).set('User-Agent', 'UrlTracker').catch(() => {})

  fields.push({ name: '최초 커밋일', value: firstCommit ? moment(firstCommit.body[0].commit.committer.date).format('YYYY-M-D') : '불러오지 못했습니다', inline: true })

  fields.push({ name: '주 언어', value: res.body.language || '(알수없음)', inline: true })
  fields.push({ name: '라이센스', value: res.body.license?.name || '(알수없음)', inline: true })

  fields.push({ name: '설명', value: res.body.description || '(설명없음)' })
  fields.push({ name: '클론', value: '```sh\ngit clone ' + res.body.clone_url + '```' })

  await msg.react(':urlinfo:755765030267388014')
  await msg.awaitReactions((r) => r.emoji.id === '755765030267388014', { max: 1 })
  return new MessageEmbed({ title: '위 깃헙 레포에 대한 정보에요!', description, color: 0x000000, fields })
}

export { suffix, fetch }
