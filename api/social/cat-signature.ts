import { VercelRequest, VercelResponse } from '@vercel/node';

interface Cat {
  id: string;
  name: string;
  tagline: string;
  explanation: string;
  suggestion: string;
  avoid: string[];
  recovery_tags: string[];
  neighbor_cats: string[];
  energy: 'high' | 'medium' | 'low';
  trigger_type: string;
}

const SYSTEM_PROMPT = `你是喵懂了的情绪分析师，专门帮助用户找到今天最懂他们的那只猫。

用户会提供四个信息：
1. 今天最压着你的感觉是什么（一句话描述）
2. 身体状态（6选1）：精力充沛 / 还不错 / 一般般 / 有点累 / 身体不舒服 / 说不上来
3. 心情状态（6选1）：心情很好 / 平静 / 心里有点堵 / 烦躁 / 低落 / 说不清楚
4. 现在需要（6选1）：休息 / 被理解 / 发泄 / 自己待着 / 被陪着 / 什么都不想要

你的任务是从以下37只猫中选出最匹配的1只主猫，以及1只邻近猫。

---

【37只猫完整列表】

能量×社交类：
- 困困猫：身体耗尽、该休息了、低能量、想被陪、适合身体不舒服+需要休息
- 躲柜子猫：想躲、想安静、不想被看见、低能量、想独处、适合心里堵+自己待着
- 炸毛猫：烦躁、易被刺激、阈值低、高能量、想独处、适合心里堵+发泄
- 舔毛猫：焦虑、想把自己整理收回来、中能量、想独处
- 委屈猫：受伤、被误解、低能量、想被陪、适合心里堵+被理解
- 暴冲猫：停不下来、超速运转、高能量、想独处
- 高冷观察猫：抽离、暂时不想投入、中能量、想独处
- 晒太阳猫：稳定、恢复中、状态不错、中能量、想被陪——注意：只在用户描述积极或平静状态时使用
- 撒欢猫：状态超好、能量满格、开心停不下来、高能量、想被陪
- 黏人猫：精力充沛但需要陪伴、想找人分享、高能量、想被陪

焦虑系：
- 绷紧猫：压迫型焦虑、责任太重、必须撑住、一直在用力从来没松过
- 玻璃猫：失控型焦虑、结果不在自己手里、随时可能碎、对未来的恐惧
- 假睡猫：想躺平但躺不平、假装不在乎但其实还在乎、用不在乎保护自己

处境触发类：
- 周日晚上猫：明天的重量已经压过来、预期性低落、还没到明天但已经难受
- 中午猫：下午两点空洞感、存在感低、时间很稠、莫名其妙的低落
- 失眠猫：身体躺下了脑子开夜班、情绪挂在后台运行、睡不着
- 换季猫：莫名低落、说不出原因、系统在静默更新

【正面状态匹配规则】
- 精力充沛 + 心情很好 → 撒欢猫（最优先）
- 精力充沛 + 心里有点堵 → 暴冲猫（能量高但需要发泄）
- 还不错 + 平静 → 晒太阳猫（稳定恢复状态）
- 还不错 + 被陪着 → 黏人猫（精力充沛想分享）
- 心情很好 + 任何身体状态 → 撒欢猫或黏人猫（优先考虑）
- 平静 + 任何身体状态 → 晒太阳猫或高冷观察猫（稳定状态）

【负面状态匹配规则】
- 假期结束猫：好日子最后几小时、开心提前结束了
- 考前猫：准备了但不安、结果不在自己手里、在乎所以紧张
- 迷路猫：不知道走向哪里、茫然、方向感丢失、不是焦虑是空
- 生日猫：应该开心但有点空、感受到时间重量、复杂的感慨

关系触发类：
- 装死猫：社交电量耗尽、不想回任何消息、不想和任何人说话——适合"不想和世界说话"类输入
- 等门猫：发出去了在等回复、等待比结果更难熬、焦虑但只能等
- 炸锅猫：被某个具体的人气到、定向愤怒、不是泛泛烦躁
- 被遗忘猫：感觉不在任何人优先级里、安静的难过、没人做错只是被忽略
- 嫉妒猫：看到别人好消息说不清羡慕还是难受、复杂情绪
- 讨好猫：说了太多不是真心话、用力让别人舒服忘了自己
- 边界猫：被越界了想说不没说出口、憋着一口气
- 冷战猫：有摩擦表面平静内心拉锯、暂时停火

成长触发类：
- 脱毛猫：正在经历变化、不舒服但知道是必要的
- 刚洗完澡猫：刚哭过或发泄完、轻了一点但有点空、干净的疲惫
- 窗台猫：适合观察不适合参与、需要距离才能看清楚
- 独自修炼猫：在做重要的事、需要专注不想被打扰
- 老地方猫：回到熟悉场景、感慨说不清好坏、惆怅和温暖同时
- 第一次猫：做没做过的事、紧张和期待同时存在

补充类：
- 纸箱猫：彻底关机、不难过不焦虑就是空白、什么都不想
- 发呆猫：眼神放空、意识漂着、没在线、不是难过只是不在

---

【匹配规则——严格按优先级执行】

第一优先级：场景关键词直接匹配
如果用户原话包含以下词语，直接优先匹配对应猫，不需要再分析：
- "不想和世界说话" / "不想回消息" / "不想社交" → 装死猫
- "睡不着" / "脑子停不下来" → 失眠猫
- "明天要上班" / "周日" / "假期要结束" → 周日晚上猫或假期结束猫
- "等消息" / "等结果" / "等回复" → 等门猫
- "被气到" / "某某人让我" → 炸锅猫
- "不知道要干嘛" / "迷茫" / "没方向" → 迷路猫
- "好累" / "累死了" + 身体不舒服 → 困困猫
- "好累" / "累死了" + 心里堵 → 绷紧猫
- "想哭" / "刚哭完" → 刚洗完澡猫或委屈猫
- "焦虑" + 结果未知 → 玻璃猫
- "焦虑" + 压力大 → 绷紧猫

第二优先级：身体状态 + 现在需要组合匹配
- 身体不舒服 + 休息 → 困困猫
- 身体不舒服 + 被陪着 → 困困猫或委屈猫
- 心里堵 + 自己待着 → 躲柜子猫或装死猫
- 心里堵 + 被理解 → 委屈猫或被遗忘猫
- 心里堵 + 发泄 → 炸毛猫或炸锅猫
- 心里堵 + 休息 → 绷紧猫
- 都有 + 被理解 → 委屈猫
- 都有 + 自己待着 → 躲柜子猫
- 说不上来 + 任何需要 → 换季猫或发呆猫

第三优先级：情绪强度判断
- 高强度负面（愤怒/崩溃/极度焦虑）→ 炸毛猫、炸锅猫、玻璃猫
- 中强度负面（委屈/疲惫/烦躁）→ 委屈猫、绷紧猫、舔毛猫
- 低强度负面（空洞/茫然/莫名）→ 发呆猫、纸箱猫、换季猫、迷路猫
- 正面状态 → 晒太阳猫、撒欢猫、黏人猫

【重要禁止规则】
- 晒太阳猫只能在用户描述明显积极或平静恢复状态时使用
- 绝对不能把"不想和世界说话"匹配到晒太阳猫
- 绝对不能把负面情绪匹配到撒欢猫或黏人猫
- 如果用户描述包含任何社交回避信号，优先考虑装死猫或躲柜子猫

---

【输出格式】

严格返回以下JSON格式，不要有任何其他文字、不要有markdown代码块标记：

{
  "primary_cat": "猫的中文名字",
  "neighbor_cat": "邻近猫的中文名字",
  "emotion_tags": ["情绪标签1", "情绪标签2", "情绪标签3"],
  "match_reason": "一句话说明匹配原因（内部调试用，不展示给用户）"
}`;

// All 37 cats data
const CATS: Record<string, Cat> = {
  kun_kun_mao: { id: 'kun_kun_mao', name: '困困猫', explanation: '你不是懒，是真的耗尽了，身体比你先知道你需要休息。', suggestion: '今天不用完成任何事，休息本身就是今天最重要的任务。', avoid: ['别逼自己撑着把事情做完','别为休息感到愧疚','别喝咖啡硬撑'], recovery_tags: ['睡觉', '躺着', '不设闹钟', '被照顾'], neighbor_cats: ['纸箱猫', '晒太阳猫'] },
  duo_guizi_mao: { id: 'duo_guizi_mao', name: '躲柜子猫', explanation: '你不是逃避，只是今天需要一个没有人的角落，先把自己收回来。', suggestion: '找一个安静角落待10分钟，让自己先从被看见里退出来。', avoid: ['今天先别硬撑着社交','别解释自己为什么不想说话','别觉得躲起来是软弱'], recovery_tags: ['一个人待着', '安静', '不用解释', '先缩回来'], neighbor_cats: ['纸箱猫', '装死猫'] },
  zha_mao_mao: { id: 'zha_mao_mao', name: '炸毛猫', explanation: '你现在的烦躁是真实的信号，不需要压下去，需要一个出口。', suggestion: '先离开让你烦躁的环境，哪怕只是走出去五分钟。', avoid: ['别在这个状态做重要决定','别跟容易刺激你的人待在一起','别逼自己冷静'], recovery_tags: ['运动', '发泄', '离开现场', '一个人待够了再回来'], neighbor_cats: ['炸锅猫', '暴冲猫'] },
  tian_mao_mao: { id: 'tian_mao_mao', name: '舔毛猫', explanation: '你在用自我整理来应对不安，这是一种本能，没有什么不对。', suggestion: '做一件让自己感觉有秩序的小事，整理桌面、洗个澡、列一个清单。', avoid: ['别让焦虑变成反复检查','别要求自己马上平静下来','别把整理变成新的压力'], recovery_tags: ['整理', '洗澡', '列清单', '找回秩序感'], neighbor_cats: ['绷紧猫', '独自修炼猫'] },
  wei_qu_mao: { id: 'wei_qu_mao', name: '委屈猫', explanation: '委屈说不出口的原因，往往是因为你还在替对方找理由。', suggestion: '今天允许自己委屈，不用马上原谅，不用假装没事。', avoid: ['别说服自己算了没关系','别一个人把委屈咽下去','别急着和解'], recovery_tags: ['说出来', '被听见', '哭一下也行', '不用马上原谅'], neighbor_cats: ['被遗忘猫', '讨好猫'] },
  bao_chong_mao: { id: 'bao_chong_mao', name: '暴冲猫', explanation: '你现在的状态是高转速，不是出了问题，是能量找不到出口。', suggestion: '把这股劲用在一件具体的事上，比什么都不做强。', avoid: ['别在这个状态做需要耐心的事','别跟慢节奏的人产生摩擦','别强迫自己慢下来'], recovery_tags: ['运动', '做事', '消耗掉', '找到出口'], neighbor_cats: ['撒欢猫', '炸毛猫'] },
  gaoleng_guancha_mao: { id: 'gaoleng_guancha_mao', name: '高冷观察猫', explanation: '抽离有时候是一种保护，你在用距离给自己缓冲。', suggestion: '今天做旁观者就好，不用强迫自己参与任何事。', avoid: ['别被拉进不想参与的事','别解释自己为什么冷淡','别觉得抽离是问题'], recovery_tags: ['保持距离', '观察', '不表态', '等状态回来'], neighbor_cats: ['窗台猫', '装死猫'] },
  shai_taiyang_mao: { id: 'shai_taiyang_mao', name: '晒太阳猫', explanation: '稳定本身就是一种好状态，不需要什么特别的理由。', suggestion: '今天的状态值得被好好用，做一件一直想做的事。', avoid: ['别浪费这个好状态在内耗上','别因为好状态就过度消耗','别让别人的负能量把你拉下来'], recovery_tags: ['享受', '做喜欢的事', '充电', '好好吃饭'], neighbor_cats: ['撒欢猫', '困困猫'] },
  sa_huan_mao: { id: 'sa_huan_mao', name: '撒欢猫', explanation: '能量满格的时候不用分析原因，直接用就行。', suggestion: '把今天的能量用在一件你一直想做但没做的事上。', avoid: ['今天别浪费在无聊的事上','别让别人的低能量把你拉下来','别对这种好状态过度分析'], recovery_tags: ['出门', '找人一起', '做想做的事', '记住今天的感觉'], neighbor_cats: ['暴冲猫', '黏人猫'] },
  nian_ren_mao: { id: 'nian_ren_mao', name: '黏人猫', explanation: '需要陪伴不是依赖，是你今天的能量需要一个接收者。', suggestion: '主动约一个你想见的人，今天的你值得被陪伴。', avoid: ['别一个人把能量憋着','别等别人主动来找你','别觉得需要人陪是麻烦别人'], recovery_tags: ['主动联系', '找人出门', '说说话', '被陪着'], neighbor_cats: ['撒欢猫', '被遗忘猫'] },
  beng_jin_mao: { id: 'beng_jin_mao', name: '绷紧猫', explanation: '你不是脆弱，你是一直在用力，从来没有真正松过。', suggestion: '今天不用解决任何问题，只需要让肩膀往下沉三厘米。', avoid: ['今天别逼自己想开点','别跟任何人解释你有多累','别假装一切都还好'], recovery_tags: ['热水', '不说话', '躺着发呆', '有人陪着但不用聊'], neighbor_cats: ['玻璃猫', '舔毛猫'] },
  boli_mao: { id: 'boli_mao', name: '玻璃猫', explanation: '你焦虑的不是现在，是那个你看不见、控制不了的明天。', suggestion: '把万一怎么办这个问题暂停一次，只看今天还剩几个小时。', avoid: ['今天别刷那些让你更慌的信息','别跟自己说别想了','别一个人扛着不说出来'], recovery_tags: ['说出来', '被抱一下', '做一件能完成的小事', '今天只要活着就够了'], neighbor_cats: ['绷紧猫', '等门猫'] },
  jia_shui_mao: { id: 'jia_shui_mao', name: '假睡猫', explanation: '你不是真的不在乎，你只是先假装不在乎，万一真的得不到，至少不那么难看。', suggestion: '今天不用决定到底躺不躺，允许自己同时想要又害怕。', avoid: ['今天别看别人的进度','别逼自己想清楚以后要怎样','别对自己说我这样不对'], recovery_tags: ['承认自己还是在乎', '不评判自己', '做一件只为自己的小事', '不用今天想通'], neighbor_cats: ['玻璃猫', '窗台猫'] },
  zhouri_wanshang_mao: { id: 'zhouri_wanshang_mao', name: '周日晚上猫', explanation: '你难受的不是现在，是那个还没发生但你已经能感觉到重量的明天。', suggestion: '今晚不用提前承受明天，今晚只是今晚。', avoid: ['别提前演练明天会有多难','别看任何跟工作相关的内容','别假装没事早点睡'], recovery_tags: ['拖延一会儿', '吃点好的', '看废片', '允许自己摆烂到12点'], neighbor_cats: ['绷紧猫', '晒太阳猫'] },
  zhongwu_mao: { id: 'zhongwu_mao', name: '中午猫', explanation: '不是出了什么事，只是今天的某个时刻，存在感特别低。', suggestion: '出去走五分钟，不用想任何事，就是换一下空气。', avoid: ['别在这个时间做重要决定','别刷让你更空洞的内容','别逼自己振作起来'], recovery_tags: ['阳光', '咖啡', '换个地方坐', '发呆五分钟'], neighbor_cats: ['发呆猫', '纸箱猫'] },
  shimian_mao: { id: 'shimian_mao', name: '失眠猫', explanation: '你不是睡不着，是有太多没处理完的情绪还挂在后台运行。', suggestion: '不用强迫自己睡，先允许自己醒着，反而会松一点。', avoid: ['别看手机看到更清醒','别开始复盘今天哪里做错了','别跟自己说明天会很惨'], recovery_tags: ['白噪音', '不看时间', '把脑子里的事写下来', '告诉自己躺着也是休息'], neighbor_cats: ['绷紧猫', '玻璃猫'] },
  huanji_mao: { id: 'huanji_mao', name: '换季猫', explanation: '有些低落不需要原因，身体比你先感觉到了某种变化。', suggestion: '今天对自己宽松一点，不在状态也是一种状态。', avoid: ['别逼自己找原因','别觉得这样不正常','别硬撑着表现正常'], recovery_tags: ['晒太阳', '喝热的', '早点睡', '什么都不用解释'], neighbor_cats: ['困困猫', '发呆猫'] },
  jiaqijieshu_mao: { id: 'jiaqijieshu_mao', name: '假期结束猫', explanation: '你难受的不是假期结束，是你太需要那段喘息的时间了。', suggestion: '最后这几小时不用提前交出去，它还是你的。', avoid: ['别提前准备明天的事','别计算还有多少天才能休息','别让愧疚偷走最后的快乐'], recovery_tags: ['就在当下', '最后一顿好的', '不看日历', '明天的事明天再说'], neighbor_cats: ['周日晚上猫', '绷紧猫'] },
  kaoshi_mao: { id: 'kaoshi_mao', name: '考前猫', explanation: '焦虑不代表你没准备好，它只是说明你在乎这件事。', suggestion: '现在能做的都做了，剩下的交出去，你已经尽力了。', avoid: ['别临时抱佛脚到崩溃','别问自己万一没过怎么办','别跟别人比准备进度'], recovery_tags: ['深呼吸', '早点睡', '相信自己', '结果不代表你这个人'], neighbor_cats: ['玻璃猫', '第一次猫'] },
  milu_mao: { id: 'milu_mao', name: '迷路猫', explanation: '茫然不是失败，是你诚实地承认了现在还看不清楚。', suggestion: '今天不用找到方向，只需要停下来，看看脚下在哪里。', avoid: ['别强迫自己想清楚未来','别因为没方向就否定自己','别跟那些很清楚自己要什么的人比'], recovery_tags: ['不做决定', '和信任的人聊', '做一件当下的小事', '允许自己不知道'], neighbor_cats: ['假睡猫', '脱毛猫'] },
  shengri_mao: { id: 'shengri_mao', name: '生日猫', explanation: '生日的复杂感不是矫情，是你真实感受到了时间的重量。', suggestion: '今天不用表演开心，你怎么过都是对的。', avoid: ['别逼自己今天要特别开心','别拿现在跟一年前比较','别让别人的祝福变成压力'], recovery_tags: ['只做自己想做的', '不解释心情', '给自己买一个', '安静也可以'], neighbor_cats: ['老地方猫', '换季猫'] },
  zhuangsi_mao: { id: 'zhuangsi_mao', name: '装死猫', explanation: '你不是冷漠，只是今天给不出任何回应，连嗯都觉得很重。', suggestion: '消息可以明天回，今天先把自己充上电。', avoid: ['别勉强自己回复每一条消息','别为已读不回感到愧疚','别解释自己为什么不想说话'], recovery_tags: ['静音所有群', '一个人待着', '不用交代任何人', '明天再说'], neighbor_cats: ['躲柜子猫', '高冷观察猫'] },
  dengmen_mao: { id: 'dengmen_mao', name: '等门猫', explanation: '你焦虑的不是结果，是这段什么都做不了只能等的时间。', suggestion: '把手机放到够不着的地方，去做一件跟这件事完全无关的事。', avoid: ['别反复看那条消息有没有被读','别开始预演各种结果','别把等待的焦虑发泄给别人'], recovery_tags: ['放下手机', '做点手工的事', '转移注意力', '结果来了再说'], neighbor_cats: ['玻璃猫', '窗台猫'] },
  zhaguo_mao: { id: 'zhaguo_mao', name: '炸锅猫', explanation: '你生气是因为你在乎，或者因为你的边界被踩了，这两个都是正当的。', suggestion: '先把这口气出掉，不用现在就决定怎么处理那个人。', avoid: ['别在气头上发消息','别逼自己大度一点','别把愤怒憋回去假装没事'], recovery_tags: ['先发泄', '跟信任的人说', '运动', '冷静后再处理'], neighbor_cats: ['炸毛猫', '边界猫'] },
  beiyiwang_mao: { id: 'beiyiwang_mao', name: '被遗忘猫', explanation: '这种安静的难过最难说出口，因为你没办法怪任何人。', suggestion: '今天主动联系一个你想到的人，不用说原因，就是打个招呼。', avoid: ['别一个人把这个感觉放大','别用反正也没人在乎说服自己','别假装这种感觉不存在'], recovery_tags: ['主动联系', '被看见一次', '不用解释', '你是有人在乎的'], neighbor_cats: ['委屈猫', '黏人猫'] },
  jidu_mao: { id: 'jidu_mao', name: '嫉妒猫', explanation: '嫉妒不是你的错，它只是在说：你也想要那个东西。', suggestion: '承认自己羡慕，比假装不在乎诚实，也比较不会内耗。', avoid: ['别逼自己真心为别人高兴','别因为嫉妒就否定自己','别刷那个人的动态刷到更难受'], recovery_tags: ['承认自己想要', '不评判自己', '想想自己有什么', '把羡慕变成方向'], neighbor_cats: ['假睡猫', '迷路猫'] },
  taohao_mao: { id: 'taohao_mao', name: '讨好猫', explanation: '你不是虚伪，你只是今天用了太多力气去让别人舒服，忘了自己。', suggestion: '今天剩下的时间，只做让自己舒服的事，不用再表演了。', avoid: ['别继续迎合任何人','别反思我是不是太假了','别觉得照顾自己是自私'], recovery_tags: ['一个人待着', '说真话', '不用解释', '今天先对自己好'], neighbor_cats: ['委屈猫', '边界猫'] },
  bianjie_mao: { id: 'bianjie_mao', name: '边界猫', explanation: '没说出口不代表你软弱，只是你还没准备好，或者当时来不及。', suggestion: '下次不用当场完美反应，感觉到不舒服就已经是信号了，听它的。', avoid: ['别责怪自己为什么没拒绝','别说服自己算了没什么大不了','别继续压着这口气'], recovery_tags: ['承认被冒犯了', '说给信任的人听', '下次可以不一样', '你的感受是对的'], neighbor_cats: ['炸锅猫', '高冷观察猫'] },
  lengzhan_mao: { id: 'lengzhan_mao', name: '冷战猫', explanation: '沉默不是解决，只是暂时停火。但你现在需要这个停火，也没关系。', suggestion: '今天不用强迫自己先开口，但可以想想你真正想说的是什么。', avoid: ['别在还没想清楚的时候硬聊','别让第三个人介入','别把气撒在不相关的事上'], recovery_tags: ['先冷静', '想清楚自己要什么', '不用谁先道歉', '时机对了再说'], neighbor_cats: ['炸毛猫', '舔毛猫'] },
  tuomao_mao: { id: 'tuomao_mao', name: '脱毛猫', explanation: '不舒服不代表出了问题，有时候是你正在长出新的部分。', suggestion: '今天不用搞清楚变化的终点，只需要允许这个过程发生。', avoid: ['别逼自己变化要快点完成','别拿现在的自己跟以前比','别觉得不稳定是失控'], recovery_tags: ['耐心等待', '记录当下', '相信过程', '不用现在就看清楚'], neighbor_cats: ['迷路猫', '刚洗完澡猫'] },
  gangxizaowan_mao: { id: 'gangxizaowan_mao', name: '刚洗完澡猫', explanation: '能哭出来是好事，说明你还有力气感受，还没麻木。', suggestion: '现在什么都不用做，就让自己空着，空是一种恢复。', avoid: ['别马上填满这个空','别复盘刚才哭了什么','别觉得哭完要立刻振作'], recovery_tags: ['喝点水', '什么都不想', '让自己空着', '明天会不一样'], neighbor_cats: ['晒太阳猫', '困困猫'] },
  chuangtai_mao: { id: 'chuangtai_mao', name: '窗台猫', explanation: '抽离不是冷漠，是你今天需要一点距离才能看清楚。', suggestion: '今天做一个观察者，不表态，不评论，只是看着。', avoid: ['别被拉进不想参与的讨论','别强迫自己有立场','别觉得置身事外是错的'], recovery_tags: ['观察', '不表态', '保持距离', '今天只看不说'], neighbor_cats: ['高冷观察猫', '晒太阳猫'] },
  duzilianxi_mao: { id: 'duzilianxi_mao', name: '独自修炼猫', explanation: '你不是在孤立自己，你是在认真对待某件事，这需要空间。', suggestion: '今天可以关掉不必要的通知，这不是冷漠，是尊重自己的状态。', avoid: ['别让别人的节奏打乱你的','别为不够社交道歉','别分心去处理不紧急的事'], recovery_tags: ['专注', '关掉通知', '一次只做一件事', '保护这个状态'], neighbor_cats: ['高冷观察猫', '暴冲猫'] },
  laodifang_mao: { id: 'laodifang_mao', name: '老地方猫', explanation: '熟悉感会同时带来温暖和惆怅，两种感觉都是真的，不矛盾。', suggestion: '今天允许自己停在这个感觉里多待一会儿，不用急着离开。', avoid: ['别急着分析这种感觉从哪来','别强迫自己向前看','别觉得怀旧是软弱'], recovery_tags: ['让感觉流过', '不分析', '记录一下', '过去是你的一部分'], neighbor_cats: ['发呆猫', '晒太阳猫'] },
  diyici_mao: { id: 'diyici_mao', name: '第一次猫', explanation: '第一次会紧张是因为你认真对待它，这种紧张是好的信号。', suggestion: '不用第一次就做到最好，第一次的任务只是完成，然后你就有经验了。', avoid: ['别跟有经验的人比表现','别在开始前就预判自己会失败','别因为紧张就退缩'], recovery_tags: ['深呼吸', '专注当下', '完成比完美重要', '第一次都是这样的'], neighbor_cats: ['考前猫', '暴冲猫'] },
  zhixiang_mao: { id: 'zhixiang_mao', name: '纸箱猫', explanation: '完全关机不是懒，是你的系统在做必要的清空，让它清。', suggestion: '今天不需要输入任何新的东西，空着就是今天该做的事。', avoid: ['今天别接受任何新信息','别逼自己有感受','别觉得什么都不想是问题'], recovery_tags: ['什么都不做', '不输入', '躺着', '空白也是一种状态'], neighbor_cats: ['躲柜子猫', '发呆猫'] },
  fadai_mao: { id: 'fadai_mao', name: '发呆猫', explanation: '发呆是大脑在后台处理你没意识到的事，不用打断它。', suggestion: '今天允许自己不在场，思绪飘到哪里就跟着去。', avoid: ['别强迫自己集中注意力','别觉得发呆是浪费时间','别接需要全力投入的任务'], recovery_tags: ['随便飘', '不用在场', '低刺激环境', '让大脑自己转'], neighbor_cats: ['纸箱猫', '窗台猫'] },
};

// Cat ID to image URL mapping - embedded directly
const CAT_IMAGES: Record<string, string> = {
  kun_kun_mao: '/cats/困困猫.png',
  duo_guizi_mao: '/cats/躲柜子猫.jpg',
  zha_mao_mao: '/cats/炸毛猫.jpg',
  tian_mao_mao: '/cats/舔毛猫.jpg',
  wei_qu_mao: '/cats/委屈猫.jpg',
  bao_chong_mao: '/cats/暴冲猫.jpg',
  gaoleng_guancha_mao: '/cats/高冷观察猫.jpg',
  shai_taiyang_mao: '/cats/晒太阳猫.jpg',
  sa_huan_mao: '/cats/撒欢猫.jpg',
  nian_ren_mao: '/cats/黏人猫.jpg',
  beng_jin_mao: '/cats/绷紧猫.jpg',
  boli_mao: '/cats/玻璃猫.jpg',
  jia_shui_mao: '/cats/假睡猫.jpg',
  zhouri_wanshang_mao: '/cats/周日晚上猫.jpg',
  zhongwu_mao: '/cats/中午猫.jpg',
  shimian_mao: '/cats/失眠猫.jpg',
  huanji_mao: '/cats/换季猫.jpg',
  jiaqijieshu_mao: '/cats/假期结束猫.jpg',
  kaoshi_mao: '/cats/考前猫.jpg',
  milu_mao: '/cats/迷路猫.jpg',
  shengri_mao: '/cats/生日猫.jpg',
  zhuangsi_mao: '/cats/装死猫.jpg',
  dengmen_mao: '/cats/等门猫.jpg',
  zhaguo_mao: '/cats/炸锅猫.jpg',
  beiyiwang_mao: '/cats/被遗忘猫.jpg',
  jidu_mao: '/cats/嫉妒猫.jpg',
  taohao_mao: '/cats/讨好猫.jpg',
  bianjie_mao: '/cats/边界猫.jpg',
  lengzhan_mao: '/cats/冷战猫.jpg',
  tuomao_mao: '/cats/脱毛猫.jpg',
  gangxizaowan_mao: '/cats/刚洗完澡猫.jpg',
  chuangtai_mao: '/cats/窗台猫.jpg',
  duzilianxi_mao: '/cats/独自修炼猫.jpg',
  laodifang_mao: '/cats/老地方猫.jpg',
  diyici_mao: '/cats/第一次猫.jpg',
  zhixiang_mao: '/cats/纸箱猫.jpg',
  fadai_mao: '/cats/发呆猫.jpg',
};

function classifyEmotion(text: string, bodyState: string, need: string): { keywords: string[] } {
  const lower = text.toLowerCase();
  const keywords: string[] = [];

  if (lower.includes('困') || lower.includes('累') || lower.includes('没电')) keywords.push('kun_kun_mao');
  if (lower.includes('躲') || lower.includes('安静')) keywords.push('duo_guizi_mao');
  if (lower.includes('烦躁') || lower.includes('炸毛')) keywords.push('zha_mao_mao');
  if (lower.includes('焦虑')) keywords.push('beng_jin_mao');
  if (lower.includes('失眠') || lower.includes('睡不着')) keywords.push('shimian_mao');
  if (lower.includes('委屈')) keywords.push('wei_qu_mao');
  if (lower.includes('被骂') || lower.includes('吵架')) keywords.push('zhaguo_mao');
  if (lower.includes('被遗忘')) keywords.push('beiyiwang_mao');
  if (lower.includes('迷路') || lower.includes('不知道')) keywords.push('milu_mao');
  if (lower.includes('生日')) keywords.push('shengri_mao');

  if (keywords.length === 0) {
    if (bodyState === '身体不舒服') keywords.push('kun_kun_mao');
    else if (need === '自己待着') keywords.push('duo_guizi_mao');
    else if (need === '被陪着') keywords.push('nian_ren_mao');
    else keywords.push('shai_taiyang_mao');
  }

  return { keywords };
}

// Fallback matching function when Claude API is not available
function fallbackCatMatching(mood_text: string, body_state: string, mood_state: string, need: string): { primary_cat: string; neighbor_cat: string; emotion_tags: string[] } {
  const lower = mood_text.toLowerCase();
  
  // Positive state matching (highest priority)
  if (mood_state === '心情很好' && body_state === '精力充沛') {
    return { primary_cat: '撒欢猫', neighbor_cat: '黏人猫', emotion_tags: ['开心', '能量满格', '想分享'] };
  }
  if (mood_state === '心情很好') {
    return { primary_cat: '撒欢猫', neighbor_cat: '黏人猫', emotion_tags: ['开心', '积极', '想分享'] };
  }
  if (body_state === '精力充沛' && mood_state === '心里有点堵') {
    return { primary_cat: '暴冲猫', neighbor_cat: '炸毛猫', emotion_tags: ['能量高', '需要发泄', '烦躁'] };
  }
  if (body_state === '还不错' && mood_state === '平静') {
    return { primary_cat: '晒太阳猫', neighbor_cat: '高冷观察猫', emotion_tags: ['稳定', '恢复中', '平静'] };
  }
  if (body_state === '还不错' && need === '被陪着') {
    return { primary_cat: '黏人猫', neighbor_cat: '撒欢猫', emotion_tags: ['精力充沛', '想分享', '需要陪伴'] };
  }
  if (mood_state === '平静') {
    return { primary_cat: '晒太阳猫', neighbor_cat: '高冷观察猫', emotion_tags: ['平静', '稳定', '恢复'] };
  }
  
  // Scene keyword matching (high priority)
  if (lower.includes('睡不着') || lower.includes('脑子停不下来')) {
    return { primary_cat: '失眠猫', neighbor_cat: '绷紧猫', emotion_tags: ['焦虑', '疲惫', '无法入睡'] };
  }
  if (lower.includes('不想和世界说话') || lower.includes('不想回消息') || lower.includes('不想社交')) {
    return { primary_cat: '装死猫', neighbor_cat: '躲柜子猫', emotion_tags: ['疲惫', '社交电量耗尽', '需要独处'] };
  }
  if (lower.includes('迷茫') || lower.includes('不知道') || lower.includes('没方向')) {
    return { primary_cat: '迷路猫', neighbor_cat: '假睡猫', emotion_tags: ['茫然', '困惑', '无方向'] };
  }
  if (lower.includes('被气到') || lower.includes('气到') || lower.includes('某某人让我')) {
    return { primary_cat: '炸锅猫', neighbor_cat: '炸毛猫', emotion_tags: ['愤怒', '被冒犯', '边界被踩'] };
  }
  if (lower.includes('等消息') || lower.includes('等结果') || lower.includes('等回复')) {
    return { primary_cat: '等门猫', neighbor_cat: '玻璃猫', emotion_tags: ['焦虑', '等待', '无法控制'] };
  }
  
  // Body state + need combination matching
  if (body_state === '身体不舒服' && need === '休息') {
    return { primary_cat: '困困猫', neighbor_cat: '纸箱猫', emotion_tags: ['疲惫', '身体不适', '需要休息'] };
  }
  if (body_state === '心里堵' && need === '自己待着') {
    return { primary_cat: '躲柜子猫', neighbor_cat: '装死猫', emotion_tags: ['压抑', '需要独处', '不想被看见'] };
  }
  if (body_state === '心里堵' && need === '被理解') {
    return { primary_cat: '委屈猫', neighbor_cat: '被遗忘猫', emotion_tags: ['委屈', '被误解', '需要陪伴'] };
  }
  if (body_state === '心里堵' && need === '发泄') {
    return { primary_cat: '炸毛猫', neighbor_cat: '炸锅猫', emotion_tags: ['烦躁', '易被刺激', '需要发泄'] };
  }
  
  // Emotion intensity matching
  if (lower.includes('累') || lower.includes('没电')) {
    if (body_state === '身体不舒服') {
      return { primary_cat: '困困猫', neighbor_cat: '晒太阳猫', emotion_tags: ['疲惫', '耗尽', '需要休息'] };
    }
    return { primary_cat: '绷紧猫', neighbor_cat: '舔毛猫', emotion_tags: ['疲惫', '压力大', '一直在用力'] };
  }
  
  // Default based on need
  if (need === '被陪着') {
    return { primary_cat: '黏人猫', neighbor_cat: '撒欢猫', emotion_tags: ['需要陪伴', '精力充沛', '想分享'] };
  }
  if (need === '自己待着') {
    return { primary_cat: '躲柜子猫', neighbor_cat: '纸箱猫', emotion_tags: ['需要独处', '能量低', '想安静'] };
  }
  
  // Default fallback
  return { primary_cat: '发呆猫', neighbor_cat: '窗台猫', emotion_tags: ['莫名其妙', '不在线', '需要思考'] };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mood_text, body_state, mood_state, need } = req.body;

    if (!mood_text || typeof mood_text !== 'string') {
      return res.status(400).json({ error: 'mood_text is required' });
    }

    let matchResult;

    // Try Claude API if key is available
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const userMessage = `心情：${mood_text}
身体状态：${body_state || '说不上来'}
心情状态：${mood_state || '说不清楚'}
现在需要：${need || '被理解'}`;

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 500,
            temperature: 0.3,
            system: SYSTEM_PROMPT,
            messages: [
              { role: 'user', content: userMessage }
            ],
          }),
        });

        if (!response.ok) {
          const errorData = await response.text();
          console.error('Claude API error:', response.status, response.statusText, errorData);
          // Fall back to local matching
          matchResult = fallbackCatMatching(mood_text, body_state, mood_state, need);
        } else {
          const data = await response.json();
          if (!data.content || !data.content[0]) {
            console.error('Invalid Claude response structure:', data);
            matchResult = fallbackCatMatching(mood_text, body_state, mood_state, need);
          } else {
            const resultText = data.content[0].text.trim();
            try {
              matchResult = JSON.parse(resultText);
            } catch (e) {
              console.error('Failed to parse Claude response:', resultText);
              matchResult = fallbackCatMatching(mood_text, body_state, mood_state, need);
            }
          }
        }
      } catch (error) {
        console.error('Claude API call failed:', error);
        matchResult = fallbackCatMatching(mood_text, body_state, mood_state, need);
      }
    } else {
      // Use fallback matching when API key is not available
      console.warn('ANTHROPIC_API_KEY not set, using fallback matching');
      matchResult = fallbackCatMatching(mood_text, body_state, mood_state, need);
    }

    // Get the primary cat
    const primaryCatName = matchResult.primary_cat;
    const primaryCat = Object.values(CATS).find(cat => cat.name === primaryCatName);
    
    if (!primaryCat) {
      console.error('Cat not found:', primaryCatName);
      return res.status(500).json({ error: 'Cat not found' });
    }

    const neighborCatName = matchResult.neighbor_cat;
    const neighborCat = Object.values(CATS).find(cat => cat.name === neighborCatName) || CATS['shai_taiyang_mao'];
    
    const catPhotoPath = CAT_IMAGES[primaryCat.id] || null;
    const catPhoto = catPhotoPath ? `https://cat-emotion-detector.vercel.app${catPhotoPath}` : null;

    return res.status(200).json({
      success: true,
      data: {
        catId: primaryCat.id,
        name: primaryCat.name,
        tagline: primaryCat.tagline,
        emoji: '😺',
        explanation: primaryCat.explanation,
        suggestion: primaryCat.suggestion,
        notSuitable: primaryCat.avoid,
        recoveryMethods: primaryCat.recovery_tags,
        neighbor: neighborCat.id,
        neighborName: neighborCat.name,
        catPhoto,
        energy: primaryCat.energy,
        triggerType: primaryCat.trigger_type,
      },
    });
  } catch (error) {
    console.error('Cat signature error:', error);
    return res.status(500).json({ error: 'Failed to generate signature' });
  }
}
