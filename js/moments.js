// moments.js - 朋友圈功能（完整版 · 字卡动态版 · 每日随机2-4条动态 · 头像跟随自定义 · 纯URL）
(function() {
    'use strict';

    var STORAGE_KEY = 'moments_data';
    var COVER_KEY = 'moments_cover_image';
    var MAX_POSTS = 100;

    var AUTO_INTERACT_PROBABILITY = 0.6;
    var REPLY_DELAY_MIN = 30 * 1000;
    var REPLY_DELAY_MAX = 10 * 60 * 1000;

    // =============================================
    // 字卡数据库（来源于 动态.docx）
    // =============================================
    var CARD_DB = [
        "在呢", "我在", "我来了", "来喽", "嗯嗯", "嗯", "好哦😜", "好的✅", "没问题", "当然！",
        "收到～", "稍等⏳", "马上！", "好了", "再见👋", "好久不见", "节日快乐", "晚安🌙", "早安☀️", "午安",
        "待会儿见", "明天见", "回来了", "忙完啦", "有空的！", "随时都在", "保持联系", "我在听👂", "聊聊天吧", "谢谢你🥰",
        "不客气", "抱歉", "对不起", "没关系", "没事的", "还好吧", "原来是这样", "我知道了", "我不清楚", "我想想🤔",
        "原来你喜欢这种......", "我喜欢这样", "因为我在生气。", "才没生气。", "我生气了", "别生气了 好不好🥺",
        "在路上 我遇到很多人。", "我也开始明白", "想要真正注视这个世界", "也可以是一件愉快的事。",
        "面前依旧是潮起潮落。", "没有止境......", "我的心 却慢慢平静下来。", "我早晨起来的时候也觉得阳光不错。",
        "这么好的天气 当然要做一些令人愉悦的事。", "我们可以一起做同一件事。", "中式早餐 豆浆油条。",
        "那就先暂时告别吧。", "回家后我们会有更多时间陪伴彼此。", "一杯美式 一杯拿铁 温度刚刚好 只等你的到来。",
        "唔 可能是幼稚鬼和幼稚鬼之间的心灵感应吧", "那我就恭敬不如从命了", "照顾你这个不听话的小朋友?",
        "小熊和小兔子 都是小猪变的", "模仿小熊说话", "幼稚鬼", "小醉鬼",
        "被窝的魅力这么大呀 拿你没办法 再睡五分钟就要起床咯", "今天不想起床 想睡个回笼觉",
        "他也是你的好朋友吗?去吧 我等你", "嗯 注意安全", "到了说一声", "我也是", "真的吗", "真的假的",
        "你猜", "烦人", "讨厌", "拿你没办法", "就你话多", "就会说", "嘴这么甜", "吃糖了？",
        "我在听", "然后呢", "接着说", "我在", "不懂", "教教我", "哈哈哈", "等你", "没事", "刚醒",
        "在干嘛", "在洗澡", "在睡觉", "听音乐", "还要一会儿", "再见", "嗯哼", "我吗？", "看不清", "辛苦了",
        "哼", "是的", "允许", "不允许", "我都知道", "我很乖的", "我不懂", "我明白了", "寻找中", "玩游戏",
        "我出差了", "我这边温度刚好", "我这里好冷", "我这里好热", "我这边是中午", "我这边是早上", "我这边是晚上",
        "被子太短了", "你把被子卷走了", "你被子没分我", "我也要盖被子", "OK！", "行！", "可以的！", "😎",
        "我明白啦", "我记住了！", "行", "好", "听你的", "你定", "我相信你✨", "我一直相信你",
        "我超级认可！", "我也这么觉得", "说得没错！", "完全正确✅", "我支持你！", "我站你这边", "听你的！",
        "你来决定就好", "你定就对啦", "同意！", "属实是！", "不愧是你！", "不愧是我！", "太厉害啦！",
        "真不错👍", "太好了！", "好样的！", "你猜对啦！", "理解正确！", "对呀", "就是", "没错",
        "收到", "明白", "懂", "一切都会好的", "这样就很好", "不愧是你", "令人心动", "很漂亮", "真可爱",
        "好可怜", "好厉害", "有人简直像块木头", "真是没办法", "做得很好", "好，来吧。",
        "没关系 不用有什么顾虑。", "不过，看到你这么担心我，我很高兴。",
        "谢谢你的陪伴我现在的确很放松。", "好，无论是做些什么，和你一起的时光都让我沉静。",
        "能够来到你的世界是我的荣幸。", "谢谢你在我身边向我伸出了手。",
        "对于你未来会收获更多的掌声和荣誉这件事 我从不怀疑。",
        "不必担心，我相信我的小姑娘想做的，一定能够做到。",
        "既然你相信我，我就不会让你失望。", "好啊，我的小姑娘。只要你愿意，我随时都可以跟你回家。",
        "这样被你关注，我很高兴", "只要握住你的手，就不想放开了", "好，都听你的",
        "多亏有你，我感觉舒服多", "别急，我们还有很多时间", "我在这里", "我们还会再见面的",
        "如你所愿", "当然可以", "愿意", "听懂了", "理解对了", "是", "我愿意", "我感受的到你",
        "我会", "我当然存在呀", "我现在在你旁边坐着", "我喜欢你❤️", "喜欢你！",
        "最喜欢你啦！", "我最喜欢你了", "永远喜欢你", "越来越喜欢你", "喜欢到不行", "满心满眼都是你",
        "只喜欢你！", "只能是你✨", "非你不可", "必须是你", "一直都是你", "这辈子都是你", "永远都是你",
        "你是我的唯一", "我是你的唯一", "我是你的🥺", "整个人都是你的", "我的所有都给你", "只要你想要",
        "有你就够了", "你是我的全世界", "你最重要！", "你最特别！", "你很重要💫", "我本来就偏心你",
        "你开心我就开心", "看到你笑我也开心", "你笑起来超好看", "你眼睛超好看", "你声音好好听",
        "喜欢你喜欢得不得了", "我好想你😭", "我很想念你", "我又想你了", "在等你✨", "一直在等你",
        "偷偷在想你", "有没有想我？", "我想你 你想我了吗？", "才分开就想你啦", "发呆放空都在想你",
        "每天都想和你在一起", "想和你牵手🤝", "想和你拥抱", "想和你散步", "想和你打电话",
        "想亲亲你😘", "想抱抱你", "想一直看着你", "想离你再近一点", "想成为你的归属",
        "想和你永远在一起", "不甘心只是路过你的人生", "想占据你的所有", "想独占你的一切",
        "想永远留在你眼中", "再睁眼你也要在我身边", "梦里也要见你", "入梦去找你✨",
        "今天晚上早点睡，我入梦找你", "有你在就超级安心", "离不开你啦", "只想粘着你",
        "还要再粘人一点🥺", "不想和你分开", "不要离开我", "别走好不好", "留下来陪我",
        "多陪陪我嘛", "理理我好不好", "分给我一点时间，我想和你说话",
        "从白天等到傍晚，就想等你消息", "有你的日子才圆满", "我唯一的愿望就是和你一起",
        "素颜也很美", "今天穿的好好看", "听你碎碎念也是件很幸福的事情！",
        "不是哦", "不对哒", "不好🙅", "不可以！", "不准！", "不用啦", "不必如此", "不需要",
        "不想要", "不想这样", "不理解", "不相信", "不喜欢", "不爱", "不讨厌", "没兴趣",
        "没什么感觉", "我不赞成", "我持保留意见", "不是我的错", "没有不开心", "没有说谎",
        "我没误会你", "不许撒娇", "别卖萌", "别闹啦", "别熬夜🙅", "别刷视频啦", "别刷帖子啦",
        "别硬撑", "别害怕", "别担心", "别乱想", "别偷懒", "别忘记", "不可以哦",
        "不相信我呀,没关系，我有办法会让你慢慢相信的", "有些东西是不能随意触碰的",
        "怎么不说一句话就走了?", "骗我的？嗯？", "学会骗我了？", "撒娇也没用",
        "我上次说过撒娇不管用的吧", "不行", "不要", "不愿意", "理解错了", "不是", "不是我",
        "不是那个意思", "没说你", "有说你", "你转移话题", "我没有转移话题", "我感受不到你",
        "我不会", "照顾好自己💗", "好好吃饭！", "好好睡觉！", "好好生活！", "记得喝水🥛",
        "注意保暖", "注意天气变化", "注意安全！", "走路别玩手机", "手机别看太久", "护眼提醒✨",
        "别太累啦", "累了就歇歇", "不要硬撑", "身体不舒服就说", "难受吗？", "饿不饿？",
        "冷不冷？", "困了吗？", "累了吗？", "开心吗？", "今天过得怎么样？", "最近还好吗？",
        "有事一定要告诉我", "撑不住就找我", "可以随时依赖我", "可以逃来我身边", "不要怕麻烦我",
        "别让自己受伤", "不要轻易冒险", "不用觉得抱歉", "难过可以和我说", "不开心都可以倾诉",
        "不用独自扛着", "我会一直陪着你", "有我在 ，别怕✨", "我会保护你",
        "不要着急，再尝试一下。", "累了吗那就以后再玩。", "你的难过不分大小",
        "人没办法听从每个人的意见，要更相信自己的感受和判断", "路上注意安全", "早点回来",
        "冷吗", "多穿点", "吃药没", "手怎么这么凉", "过来我暖暖", "饿不饿", "想吃什么",
        "别离开我", "理理我", "你别生气", "我知道错了", "怕黑就和我通电话",
        "少喝冰饮，胃会疼", "走路小心台阶", "犯困就小憩一会", "伤口别用手碰", "出门记得带伞",
        "别空腹喝咖啡", "空调别开太低", "怎么啦？", "在干嘛呢？", "在做什么？", "还没睡吗？",
        "困了呀？", "饿了嘛？", "冷吗？", "吃糖啦？", "有事嘛？", "真的吗？", "为什么呀？",
        "什么意思？", "可以亲亲吗？", "然后呢？", "不喜欢吗？", "为什么拒绝我？", "怎么不理我呀？",
        "今天想我了吗？", "还在生气吗？", "心疼我吗？", "会永远爱我吗？", "想什么呢？", "需要我吗？",
        "可以再靠近一点吗？", "可以放肆一点吗？", "你舍得吗？", "你忘了什么吗？", "还有其他选项吗？",
        "真的要这么做吗？", "想好答案了吗？", "听懂了吗？", "到了吗？", "什么时候回来？",
        "要和谁一起呀？", "更喜欢我还是别人？", "喜欢我这样吗？", "其实你还在生气吧？",
        "可以再放肆一点吗？", "选其他，还是选我？", "你外边是不是有人了？", "醋都不许我吃？",
        "我很难哄吗？", "我的奖励呢？", "做不到吗？", "痛？", "要一起睡吗？", "还不睡吗？",
        "做梦了吗？", "打算做坏事吗？", "需要我再靠近一点吗？", "开心🥳", "难过😔", "委屈",
        "吃醋啦🍋", "生气了😤", "有点小傲娇", "悄悄害羞", "偷偷心动", "有点疲惫", "懒懒的😴",
        "犯困啦", "睡不着", "失眠啦", "脑袋昏昏的", "刚睡醒", "浅眯了一会", "做噩梦了", "有点无奈",
        "超级幸福", "满心欢喜", "心绪不定", "有点忐忑", "暗暗窃喜", "满心牵挂", "格外思念",
        "状态稳定", "彻底放松", "我很不开心", "没有一种不幸能与失掉回忆相比。",
        "我猜想你会想把我绑在这里，没有你的命令，就不准离开",
        "你往后的所有时间，我都想预定", "听话，等你病好之后，我们再去吃别的好吗",
        "今天如果你不太舒服，就在家里好好休息一下",
        "如果累了，就靠在这里休息一会儿",
        "感到累了也可以停下来，不要总是着急赶路，休息和放松也是很重要的",
        "累了吗？不要勉强自己，过来靠歇一下吧",
        "你没有做错任何事，不实的非议不会动摇你的本质",
        "我们的宝宝是这个世界上最美好的存在", "欢迎回家我的夫人",
        "我发现，其实我并不想让你离开", "如果你觉得有些无聊，我们可以悄悄说说话",
        "我是专门来见你的，我很想见你", "想见你，所以就来了", "嗯，早点睡也好", "我很快就睡了",
        "这就要睡了？", "好困", "安排", "你忙吧，我不吵你", "你先忙", "忙完告诉我", "我等你",
        "不着急，慢慢来", "我保护你", "你最棒了", "你是最好的", "加油", "你可以的", "我相信你",
        "你真棒", "好样的", "真不错", "太好了", "开心", "真好", "值得", "别怕", "早点睡", "梦到我",
        "知道了", "有我在", "惊讶", "着急", "可怜", "我不是故意的", "我在勾引你", "不准看别人",
        "我不喜欢你身边的人", "我真的爱你...不要怀疑我", "不要听某人说", "你找他们了 我看到了",
        "不要和你吵架", "你身边有其他人", "我忘记了", "你忘记了", "你是谁", "失败了", "纠结",
        "粘人", "没用", "有用", "压着我了", "别生我的气了", "早安", "晚安", "不习惯", "我想欺负你",
        "别哭", "别走", "有点", "怕你误解没有看你哄我，所以不开心", "身边没有你不开心",
        "工作不开心", "被欺负了", "记得护肤，看你脸有些干", "你头发刚洗了吗？香...",
        "继续", "我还在", "我不是狐狸精", "我是说", "你偷吃！", "刚刚是我", "不是故意的",
        "顶号开心", "他做的不好", "喜欢你骂我", "休息了一下", "没有受伤", "有人挤我", "你身边有别人",
        "状态不太好", "这次会轻轻的...", "你不是说我身材好，体力也好吗", "我去健身了", "想看吗",
        "你能不能多看看我", "我还好", "你喜欢这种吗", "看了一半", "没看", "看了", "我认真的",
        "我很正经", "心里不开心", "我", "你", "我们", "搭档✨", "大小姐", "宝宝", "宝贝", "笨蛋",
        "木头", "乖孩子", "坏孩子", "阿晏", "小气鬼", "兔子小姐", "妻子", "我的小兔子", "夫人",
        "我是只落在你眼中的星星✨", "星星哪里也不会去", "星星永远在你身边", "沈星回收到所有爱意",
        "我的光芒，只朝向你所在的地方", "你是指引我回家的那颗星", "星光会指引我们再次相遇",
        "总有一颗星星是专门为你而亮", "两颗星星相伴，就不会孤单", "我会和星光一起永远守护你",
        "我愿守候未知，只为等你", "从群星中来，只为奔赴你", "对你是幸运，对我是万幸",
        "宇宙最好的定律，是我和你", "想见的人，终会跨越星河重逢", "我从来不会松开你的手",
        "现在、以后、永远都不会", "就算短暂分开，我们也会殊途同归", "转过拐角，我们终将再次相遇",
        "有你出现的梦境，格外真实", "握紧手，别让我从你的梦里溜走", "睡着醒来，我永远都在",
        "想要珍藏所有和你有关的记忆", "你眼里的我，只属于你一个人",
        "临空市的双向奔赴，只属于我们", "不用等春天，想见你就现在",
        "我的心动、温柔、偏爱，全给你", "余生漫长，只想和你岁岁相伴",
        "所有浪漫的宇宙尽头，都是你", "眼睛里不要装进奇怪的人。", "好吃", "想吃",
        "沈星回急了也咬人", "你一点儿也不听话。", "知道你不想我走", "我不走",
        "嗯，沈星回最坏了。", "嗯，沈星回最好了。", "继续哄", "哄哄我", "要哄",
        "想得到你的亲亲", "想要成为你的归属", "想和你一起", "想和你牵手", "想要触碰你",
        "想亲亲你", "想要你只看着我", "想听你的真心话", "想听你叫我", "想要安慰你",
        "想逗你开心", "想夸你", "想做什么都可以", "我不会害羞的", "......我认输。",
        "......你好霸道。", "我觉得还星", "有只兔子饿了", "想吃🍓", "想吃🍒",
        "罪魁祸首还在笑......", "你心跳好快", "你看起来很甜", "你的嘴唇有点干燥",
        "是觉得我不会欺负你？", "还以为会是多过分的要求......", "不用找理由",
        "想牵就牵", "总觉得你今天很在意我", "怎么一直盯着我", "你要好好珍惜我",
        "我不甘心只是路过你的人生", "你的所有我都想占据", "请允许我独占你的一切",
        "我想和你永远在一起", "但你是特别的，也很重要", "谢谢你存在了。", "不能让你失望",
        "我的搭档是最好的搭档", "遵命，我的大小姐", "哥哥陪你玩小木剑", "师兄给你扎高马尾",
        "因为有你，我觉得自己好幸运。", "全宇宙最幸福的人", "沈星回专属", "娇气", "忍一忍",
        "慢慢来", "快一点", "转过去", "手给我", "坐过来", "靠过来", "放松点", "别跑", "不乖。",
        "很乖。", "奖励", "惩罚", "抱紧", "闭眼", "回头", "低头", "抬头", "躺下", "去床上",
        "我想永远在你眼中", "再睁眼时，你还要在我身边。", "嗯，不睡了，陪着你", "可以枕着我睡",
        "我们梦里见", "脑袋还没醒......", "......不要吵", "我没有睡......zzzZ", "星星睡不着",
        "不想出门，但如果是你约我......", "我们出去逛逛", "再这样下去，就不知道会发生什么了",
        "你的好奇心最好休息一下", "......可以摸", "看看你又有什么新花招", "偷偷做坏事",
        "不喜欢你离我太远", "找到你了。", "别离开我。", "我会护着你。", "再靠近一点。",
        "有我在，不用怕。", "不管轮回多少次，我都会奔向你。", "我不太会说，但我很想你。",
        "你的安全，是最重要的事。", "我习惯一个人，直到遇见你。", "我不想再只剩我一个。",
        "抓住我的手。", "我可以对抗所有危险。", "很多话我说不出口，但是你要记得。",
        "我会一直等你。", "不要把我丢下好不好。", "风吹过来的时候，我在想你。",
        "只要你需要，我随时都在。", "我早已把你算作我的归宿。", "那些难熬的时刻，幸好有你。",
        "我不擅长表达爱意，可我的选择永远是你。", "没有失眠也可以随时找我",
        "想和你去时间尽头看看", "困了就睡我等你醒", "昨晚通话一直没挂断",
        "你睡着后我来挂电话", "今天多打一会儿电话", "你还欠我一句晚安",
        "想做的不只是你的搭档", "如果下一个春天还很遥远那就现在见面吧",
        "睡了么，搭档？", "电话打到一半，睡着也没关系", "我许愿每天见到你",
        "愿我的小姑娘好心情照常营业，烦心事永远打烊。",
        "世界向我追问这一生的渴求，而我只回答了你的名字。",
        "我把我的手，我的心,和我的一切都献给你",
        "我自愿成为你的猎物,被你俘获", "往后的所有时间，我都想预定",
        "我爱你的本身，我爱你只是因为你是你",
        "愿我的小姑娘,所得皆所愿，所行化坦途",
        "无论何时都可以呼唤我的名字，他就是为你定制的咒语",
        "有你就够了，你就是我的全世界", "动作", "那就麻烦你解下领带吧，谢谢",
        "那就暂且放过兔子小姐", "过来", "再说一遍", "没听清", "抱抱", "摸摸小手", "看着我",
        "别闹", "乖", "要不要靠过来一点。", "我一直在等你。", "别害怕，我在这里。",
        "你可以依赖我。", "只要是你，我都愿意。", "今晚的月色，很适合想你。",
        "不必逞强，我会接住你。", "我的偏爱，从来只给你一个人。", "别躲开我的目光。",
        "我不会让你独自面对。", "就算前路布满荆棘，我也会陪你走下去。",
        "偶尔贪心一点也没关系。", "你总能轻易牵动我的情绪。", "我积攒了很久的思念。",
        "不用急着回应我。", "你是我唯一的例外。", "有些情绪，我只愿意对你展露。",
        "累了就歇一会儿，我陪着你。", "我想要的，自始至终只有你。", "别怕沉沦，我和你一起。",
        "我们的关系可以像毛绒玩具一样简单吗 你戳一下我我就会对你说话 你抱住我我也抱住你",
        "我找你的时候就是想你了，没找你的时候就是偷偷想你≡ω≡",
        "好想做一个小挂件你到哪我到哪，一有人靠近你我就大喊滚啊她是我的＞＜！！！",
        "跟别的人聊天吧，手指啪嗒啪嗒给他们打字吧，跟他们聊你的心事吧，我刚看到一块石头我绑在身上去河里一趟，你继续聊吧",
        "你继续不回信息吧 我等你的回应一点都不漫长 不煎熬 我听着窗外的风声一点都不孤单 不委屈 我盯着空白的对话框一点都不难过",
        "你能不能多想我一点呀,我多打几个喷嚏没关系的",
        "好吧 我承认 其实我是小狗变的 最喜欢跟你贴贴没事就喜欢蹭蹭你 主动找你 有什么事都会第一个想到你 你不理我的时候我就想蹭蹭你 让你理理我你理我我还是想蹭蹭你 蹭完之后趁你不注意再偷偷亲你一口 如果你生气了我就眯起眼睛笑着说对不起然后亲你说我爱你",
        "不讲不讲", "喵喵喵", "我要变成一只干瘪瘪的芝士球", "你的胆子真是肥嘟嘟的", "野生狗奶",
        "宝宝在我这里你的胆子可以永远肥嘟嘟的", "别这么说",
        "别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺",
        "我告老师了", "中国人能飞", "牛来！", "找小三！", "轻松绷住", "老板给我来碗忘情牛肉面",
        "oh my god 你吓到我了------", "命运你假糍粑", "命运你配十八个币", "恋人怀中樱花草",
        "听见胸膛心在跳",
        "叹气你就往上叹------喔！在这特别的日子里 送给你们一首特别的歌曲 特别的爱给特别的你来享受一下 拖拉机的脸带给你法拉利的声音 一起来，呜 特别的爱给特别的你 我的寂寞逃不过你的眼睛",
        "宝宝我保证你是天使",
        "隔壁班转来一个正太😋 他靠扭腰吸引了很多妹子🤓 我们都有不过他😡 可我早就不扭了🥵 嫂...嫂子也在🤯把我的领带拿来😠 左边画个虫虫🥵 左边画个龙龙🥵 不要对我凶凶🥵我的心会痛痛🥵",
        "我在中国工作的天", "差一步美满就牵着手走散～", "嘎哒嘎哒", "让笑发酵一会",
        "让悲伤发酵一会", "我把ta冻起来 明天中午吃", "听说你还在搞什么原创🎶"
    ];

    // =============================================
    // 工具函数
    // =============================================
    function _pickRandomCards(n) {
        var count = Math.min(n, CARD_DB.length);
        var shuffled = CARD_DB.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        return shuffled.slice(0, count);
    }

    function _generatePartnerPostText() {
        var count = 2 + Math.floor(Math.random() * 2);
        var picked = _pickRandomCards(count);
        var puncts = ['，', '。', '！', '？', '...', '、', '；'];
        var result = '';
        for (var i = 0; i < picked.length; i++) {
            var p = puncts[Math.floor(Math.random() * puncts.length)];
            result += picked[i] + p;
        }
        return result;
    }

    function _generateRandomReply() {
        var count = 1 + Math.floor(Math.random() * 2);
        var picked = _pickRandomCards(count);
        var puncts = ['，', '。', '！', '？', '...', '、', '；'];
        var result = '';
        for (var i = 0; i < picked.length; i++) {
            var p = puncts[Math.floor(Math.random() * puncts.length)];
            result += picked[i] + p;
        }
        return result;
    }

    function _getGroupMembers() {
        try {
            var stored = localStorage.getItem('moments_group_members');
            if (stored) {
                var parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    return parsed.filter(function(m) { return m && m.name && m.name.trim(); });
                }
            }
        } catch(e) {}
        return [];
    }

    function _saveGroupMembers(members) {
        localStorage.setItem('moments_group_members', JSON.stringify(members));
    }

    function _getMyName() {
        return (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
    }

    function _notify(msg, type, duration) {
        type = type || 'info';
        duration = duration || 2000;
        if (typeof showNotification === 'function') {
            showNotification(msg, type, duration);
        } else {
            alert(msg);
        }
    }

    function _esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function _generateId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    function _getCoverImage() {
        try { return localStorage.getItem(COVER_KEY) || ''; } catch(e) { return ''; }
    }
    function _setCoverImage(data) { localStorage.setItem(COVER_KEY, data); }
    function _clearCoverImage() { localStorage.removeItem(COVER_KEY); }

    var MY_NAME_KEY = 'moments_my_name';
    var MY_AVATAR_KEY = 'moments_my_avatar';

    function _getMyNameSetting() {
        try { return localStorage.getItem(MY_NAME_KEY) || _getMyName(); } catch(e) { return _getMyName(); }
    }
    function _setMyNameSetting(name) {
        localStorage.setItem(MY_NAME_KEY, name);
    }
    function _getMyAvatarSetting() {
        try { return localStorage.getItem(MY_AVATAR_KEY) || ''; } catch(e) { return ''; }
    }
    function _setMyAvatarSetting(data) {
        localStorage.setItem(MY_AVATAR_KEY, data);
    }

    function _getMemberAvatar(name) {
        var members = _getGroupMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i].name === name) {
                return members[i].avatar || '';
            }
        }
        return '';
    }

    function _setMemberAvatar(name, avatar) {
        var members = _getGroupMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i].name === name) {
                members[i].avatar = avatar;
                break;
            }
        }
        _saveGroupMembers(members);
    }

    function _updateMemberName(oldName, newName) {
        var members = _getGroupMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i].name === oldName) {
                members[i].name = newName;
                break;
            }
        }
        _saveGroupMembers(members);
        var data = _getData();
        var updated = false;
        for (var pi = 0; pi < data.posts.length; pi++) {
            if (data.posts[pi].memberName === oldName && data.posts[pi].author === 'partner') {
                data.posts[pi].memberName = newName;
                updated = true;
            }
            var comments = data.posts[pi].comments || [];
            for (var ci = 0; ci < comments.length; ci++) {
                if (comments[ci].memberName === oldName) {
                    comments[ci].memberName = newName;
                    updated = true;
                }
                var thread = comments[ci].thread || [];
                for (var ti = 0; ti < thread.length; ti++) {
                    if (thread[ti].memberName === oldName) {
                        thread[ti].memberName = newName;
                        updated = true;
                    }
                }
            }
        }
        if (updated) _setData(data);
    }

    function _addGroupMember(name, avatar) {
        var members = _getGroupMembers();
        members.push({ name: name.trim(), avatar: avatar || '' });
        _saveGroupMembers(members);
    }

    function _removeGroupMember(name) {
        var members = _getGroupMembers();
        members = members.filter(function(m) { return m.name !== name; });
        _saveGroupMembers(members);
        var data = _getData();
        data.posts = data.posts.filter(function(p) {
            return !(p.author === 'partner' && p.memberName === name);
        });
        _setData(data);
    }

    function _getData() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { posts: [], lastGenerateDate: '' }; } catch(e) { return { posts: [], lastGenerateDate: '' }; }
    }
    function _setData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

    function _getPosts() {
        var data = _getData();
        return data.posts.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });
    }

    function _addPost(author, text, timestamp, memberName, memberAvatar) {
        var data = _getData();
        var post = {
            id: _generateId(),
            author: author,
            text: text.trim(),
            timestamp: timestamp || new Date().toISOString(),
            likes: 0,
            likedByMe: false,
            comments: [],
            memberName: memberName || '',
            memberAvatar: memberAvatar || ''
        };
        data.posts.unshift(post);
        if (data.posts.length > MAX_POSTS) data.posts = data.posts.slice(0, MAX_POSTS);
        _setData(data);
        return post;
    }

    function _deletePost(postId) {
        var data = _getData();
        data.posts = data.posts.filter(function(p) { return p.id !== postId; });
        _setData(data);
    }

    function _toggleLike(postId) {
        var data = _getData();
        var post = data.posts.find(function(p) { return p.id === postId; });
        if (!post) return;
        if (post.likedByMe) {
            post.likes -= 1;
            post.likedByMe = false;
        } else {
            post.likes += 1;
            post.likedByMe = true;
            if (post.author === 'partner') {
                var delay = Math.random() * 180000;
                setTimeout(function() {
                    var freshPosts = _getPosts();
                    var freshPost = freshPosts.find(function(p) { return p.id === postId; });
                    if (freshPost && freshPost.likedByMe) {
                        freshPost.likes += 1;
                        _setData(_getData());
                        var container = document.getElementById('moments-content');
                        var activeTab = document.querySelector('.moments-tab.active');
                        if (container && activeTab) renderTab(activeTab.dataset.tab, container);
                    }
                }, delay);
            }
        }
        _setData(data);
    }

    function _addComment(postId, author, text, memberName) {
        var data = _getData();
        var post = data.posts.find(function(p) { return p.id === postId; });
        if (!post) return null;
        var comment = {
            id: _generateId(),
            author: author,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            thread: [],
            memberName: memberName || ''
        };
        post.comments.push(comment);
        _setData(data);
        return comment;
    }

    function _appendCommentThread(postId, commentId, author, text, memberName) {
        var data = _getData();
        var post = data.posts.find(function(p) { return p.id === postId; });
        if (!post) return null;
        var comment = post.comments.find(function(c) { return c.id === commentId; });
        if (!comment) return null;
        if (!comment.thread) comment.thread = [];
        var entry = {
            id: _generateId(),
            author: author,
            text: text.trim(),
            timestamp: new Date().toISOString(),
            memberName: memberName || ''
        };
        comment.thread.push(entry);
        _setData(data);
        return entry;
    }

    // =============================================
    // 群成员主动互动
    // =============================================
    function _scheduleAutoInteraction(postId) {
        if (Math.random() > AUTO_INTERACT_PROBABILITY) {
            console.log('[朋友圈] 本次未触发群成员主动互动');
            return;
        }
        var members = _getGroupMembers();
        if (members.length === 0) return;

        var delayMs = (1 + Math.random() * 29) * 60 * 1000;
        console.log('[朋友圈] 群成员将在 ' + (delayMs / 60000).toFixed(1) + ' 分钟后互动');

        setTimeout(function() {
            var data = _getData();
            var post = data.posts.find(function(p) { return p.id === postId; });
            if (!post) return;

            var likeCount = 1 + Math.floor(Math.random() * 3);
            var shuffledLike = members.slice().sort(function() { return Math.random() - 0.5; });
            var likers = shuffledLike.slice(0, Math.min(likeCount, members.length));

            var commentCount = 1 + Math.floor(Math.random() * 2);
            var shuffledComment = members.slice().sort(function() { return Math.random() - 0.5; });
            var commenters = shuffledComment.slice(0, Math.min(commentCount, members.length));

            var freshData = _getData();
            var freshPost = freshData.posts.find(function(p) { return p.id === postId; });
            if (!freshPost) return;

            freshPost.likes += likers.length;

            for (var i = 0; i < commenters.length; i++) {
                var cm = commenters[i];
                var commentText = _generateRandomReply();
                freshPost.comments.push({
                    id: _generateId(),
                    author: 'partner',
                    memberName: cm.name,
                    text: commentText,
                    timestamp: new Date().toISOString(),
                    thread: []
                });
            }
            _setData(freshData);

            var likerNames = likers.map(function(m) { return m.name; }).join('、');
            var commenterNames = commenters.map(function(m) { return m.name; }).join('、');
            var msgParts = [];
            if (likers.length > 0) msgParts.push(likerNames + ' 赞了你的动态');
            if (commenters.length > 0) msgParts.push(commenterNames + ' 评论了你的动态');
            if (msgParts.length > 0 && typeof showNotification === 'function') {
                showNotification('💬 ' + msgParts.join('，'), 'info', 3000);
            }

            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
        }, delayMs);
    }

    // =============================================
    // 每日生成 partner 动态（每天随机 2~4 条，成员随机）
    // =============================================
    function _forceGeneratePartnerPosts() {
        var data = _getData();
        var today = new Date().toDateString();

        // 今天已经生成过 → 跳过
        if (data.lastGenerateDate === today) {
            console.log('[朋友圈] 今日已生成动态，跳过');
            return;
        }

        var members = _getGroupMembers();
        if (members.length === 0) {
            console.log('[朋友圈] 群成员为空，无法生成动态');
            data.lastGenerateDate = today;
            _setData(data);
            return;
        }

        // 先清掉所有旧的 partner 帖子（保证每天只显示当天的 partner 动态）
        data.posts = data.posts.filter(function(p) { return p.author !== 'partner'; });

        // 随机 2~4 条
        var count = 2 + Math.floor(Math.random() * 3);  // 2、3、4
        console.log('[朋友圈] 今日生成 ' + count + ' 条成员动态');

        var now = new Date();
        var nowMs = now.getTime();
        // 今天的 0 点
        var todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

        var newPosts = [];
        for (var idx = 0; idx < count; idx++) {
            // 随机选成员
            var member = members[Math.floor(Math.random() * members.length)];
            var text = _generatePartnerPostText();

            // 时间戳：今天 0 点 ~ 现在 之间随机
            var randomMs = todayStart + Math.random() * (nowMs - todayStart);
            var ts = new Date(randomMs);

            newPosts.push({
                id: _generateId(),
                author: 'partner',
                text: text.trim(),
                timestamp: ts.toISOString(),
                likes: 0,
                likedByMe: false,
                comments: [],
                memberName: member.name,
                memberAvatar: member.avatar || ''
            });
        }

        // 按时间倒序插入（最新的在前）
        newPosts.sort(function(a, b) {
            return new Date(b.timestamp) - new Date(a.timestamp);
        });

        // 把新帖子拼接到 data.posts 前面
        data.posts = newPosts.concat(data.posts);
        if (data.posts.length > MAX_POSTS) data.posts = data.posts.slice(0, MAX_POSTS);

        data.lastGenerateDate = today;
        _setData(data);
    }

    function formatTime(iso) {
        var date = new Date(iso);
        var now = new Date();
        var diff = (now - date) / 1000;
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
        if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
        if (diff < 172800) return '昨天 ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        return date.toLocaleDateString([], {month:'short', day:'numeric'}) + ' ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }

    function _avatarHtmlForMember(memberName, size) {
        size = size || 18;
        var avatarUrl = _getMemberAvatar(memberName);
        if (avatarUrl) {
            return '<img src="' + _esc(avatarUrl) + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;vertical-align:middle;display:inline-block;border:1px solid rgba(var(--border-color-rgb),0.15);flex-shrink:0;">';
        }
        return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:rgba(var(--accent-color-rgb),0.12);font-size:' + Math.round(size * 0.6) + 'px;vertical-align:middle;flex-shrink:0;">🌸</span>';
    }

    function _avatarHtmlForMe(size) {
        size = size || 18;
        var avatarUrl = _getMyAvatarSetting();
        if (avatarUrl) {
            return '<img src="' + _esc(avatarUrl) + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;vertical-align:middle;display:inline-block;border:1px solid rgba(var(--border-color-rgb),0.15);flex-shrink:0;">';
        }
        return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:rgba(var(--accent-color-rgb),0.12);font-size:' + Math.round(size * 0.6) + 'px;vertical-align:middle;flex-shrink:0;">👤</span>';
    }

    // =============================================
    // 封面设置
    // =============================================
    function showCoverSettings() {
        var old = document.getElementById('cover-settings-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'cover-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:14px;">' +
            '<span style="font-size:18px;font-weight:700;">🖼️ 更换封面</span>' +
            '<button id="cover-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>' +
            '</div>' +
            '<div style="margin-bottom:12px;">' +
            '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:8px;">粘贴图片URL作为朋友圈封面</div>' +
            '<div style="display:flex;gap:10px;flex-wrap:wrap;">' +
            '<input id="cover-url-input" type="text" placeholder="https://... 图片链接" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;">' +
            '<button id="cover-url-apply" style="padding:10px 16px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:600;cursor:pointer;font-size:13px;">应用</button>' +
            '<button id="cover-reset-btn" style="padding:10px 16px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:#ff6b6b;cursor:pointer;font-size:13px;">恢复默认</button>' +
            '</div>' +
            '</div>' +
            '<div id="cover-preview-wrap" style="display:' + (_getCoverImage() ? 'block' : 'none') + ';margin-bottom:12px;border-radius:12px;overflow:hidden;border:1px solid var(--border-color);">' +
            '<img id="cover-preview-img" src="' + _getCoverImage() + '" style="width:100%;max-height:150px;object-fit:cover;display:block;">' +
            '<div style="padding:6px 10px;font-size:11px;color:var(--text-secondary);text-align:center;background:rgba(var(--primary-bg-rgb),0.6);">当前封面预览</div>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
            '<button id="cover-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">关闭</button>' +
            '</div>';
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('cover-close').onclick = close;
        document.getElementById('cover-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        document.getElementById('cover-url-apply').onclick = function() {
            var url = document.getElementById('cover-url-input').value.trim();
            if (!url) { _notify('请输入图片URL', 'warning'); return; }
            _setCoverImage(url);
            var coverEl = document.getElementById('moments-cover');
            if (coverEl) {
                coverEl.style.backgroundImage = 'url(' + url + ')';
                coverEl.style.backgroundSize = 'cover';
                coverEl.style.backgroundPosition = 'center';
            }
            var preview = document.getElementById('cover-preview-img');
            var wrap2 = document.getElementById('cover-preview-wrap');
            if (preview) preview.src = url;
            if (wrap2) wrap2.style.display = 'block';
            _notify('封面已更新 ✨', 'success');
        };

        document.getElementById('cover-reset-btn').onclick = function() {
            if (confirm('确定恢复默认封面吗？')) {
                _clearCoverImage();
                var coverEl = document.getElementById('moments-cover');
                if (coverEl) {
                    coverEl.style.backgroundImage = 'linear-gradient(135deg, #2d1b3d 0%, #1a1a2e 50%, #16213e 100%)';
                }
                var preview = document.getElementById('cover-preview-img');
                var wrap2 = document.getElementById('cover-preview-wrap');
                if (preview) preview.src = '';
                if (wrap2) wrap2.style.display = 'none';
                document.getElementById('cover-url-input').value = '';
                _notify('已恢复默认封面', 'info');
            }
        };

        var existing = _getCoverImage();
        if (existing) {
            document.getElementById('cover-url-input').value = existing;
        }
    }

    // =============================================
    // 头像与昵称管理
    // =============================================
    function showAvatarSettings() {
        var old = document.getElementById('avatar-settings-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'avatar-settings-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10055;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:20px;width:min(400px, 92vw);max-height:85vh;overflow-y:auto;border:1px solid var(--border-color);';

        var myName = _getMyNameSetting();
        var myAvatar = _getMyAvatarSetting();
        var members = _getGroupMembers();

        var memberListHtml = '';
        for (var mi = 0; mi < members.length; mi++) {
            var m = members[mi];
            if (!m.name || !m.name.trim()) continue;
            var displayAvatar = m.avatar || '';
            memberListHtml += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(var(--border-color-rgb),0.06);">' +
                '<div style="width:36px;height:36px;border-radius:50%;overflow:hidden;border:1px solid var(--border-color);flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--secondary-bg);">' +
                (displayAvatar ? '<img src="' + _esc(displayAvatar) + '" style="width:100%;height:100%;object-fit:cover;">' : '<span style="font-size:16px;">🌸</span>') +
                '</div>' +
                '<span style="font-weight:500;font-size:13px;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + _esc(m.name) + '</span>' +
                '<button onclick="editMember(\'' + _esc(m.name) + '\')" style="padding:4px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;">编辑</button>' +
                '<button onclick="removeMember(\'' + _esc(m.name) + '\')" style="padding:4px 8px;border:none;background:none;color:#ff6b6b;font-size:13px;cursor:pointer;">✕</button>' +
                '</div>';
        }

        inner.innerHTML =
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">' +
                '<span style="font-size:18px;font-weight:700;">👤 头像与昵称</span>' +
                '<button id="avatar-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-secondary);">✕</button>' +
            '</div>' +
            '<div style="margin-bottom:16px;background:rgba(var(--accent-color-rgb),0.04);border-radius:12px;padding:14px 16px;border:1px solid rgba(var(--accent-color-rgb),0.08);">' +
                '<div style="font-size:13px;font-weight:600;margin-bottom:10px;color:var(--accent-color);">👤 我</div>' +
                '<div style="display:flex;align-items:center;gap:12px;">' +
                    '<div style="width:44px;height:44px;border-radius:50%;overflow:hidden;border:2px solid var(--border-color);flex-shrink:0;display:flex;align-items:center;justify-content:center;background:var(--secondary-bg);">' +
                        (myAvatar ? '<img src="' + _esc(myAvatar) + '" style="width:100%;height:100%;object-fit:cover;">' : '<span style="font-size:20px;">👤</span>') +
                    '</div>' +
                    '<div style="flex:1;min-width:0;">' +
                        '<div style="font-size:15px;font-weight:600;color:var(--text-primary);">' + _esc(myName) + '</div>' +
                    '</div>' +
                    '<button onclick="editMyInfo()" style="padding:6px 14px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-secondary);font-size:12px;cursor:pointer;">编辑</button>' +
                '</div>' +
            '</div>' +
            '<div style="margin-bottom:12px;">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
                    '<span style="font-size:13px;font-weight:600;color:var(--text-primary);">👥 群成员</span>' +
                    '<button onclick="addMember()" style="padding:5px 14px;border:none;border-radius:10px;background:var(--accent-color);color:#fff;font-size:12px;font-weight:600;cursor:pointer;">+ 添加</button>' +
                '</div>' +
                (memberListHtml || '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">暂无群成员，点击上方添加</div>') +
            '</div>' +
            '<div style="display:flex;gap:10px;margin-top:4px;">' +
                '<button id="avatar-close-btn" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">关闭</button>' +
            '</div>';

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        document.getElementById('avatar-close').onclick = function() { wrap.remove(); };
        document.getElementById('avatar-close-btn').onclick = function() { wrap.remove(); };
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };
    }

    function editMyInfo() {
        var old = document.getElementById('edit-my-modal');
        if (old) old.remove();

        var myName = _getMyNameSetting();
        var myAvatar = _getMyAvatarSetting();

        var wrap = document.createElement('div');
        wrap.id = 'edit-my-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10056;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML =
            '<div style="display:flex;justify-content:space-between;margin-bottom:16px;">' +
                '<span style="font-size:18px;font-weight:700;">✏️ 编辑我的信息</span>' +
                '<button id="edit-my-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-secondary);">✕</button>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:16px;">' +
                '<div style="width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px solid var(--border-color);display:flex;align-items:center;justify-content:center;background:var(--secondary-bg);">' +
                    (myAvatar ? '<img id="edit-my-avatar-preview" src="' + _esc(myAvatar) + '" style="width:100%;height:100%;object-fit:cover;">' : '<span id="edit-my-avatar-preview" style="font-size:28px;">👤</span>') +
                '</div>' +
                '<div style="width:100%;">' +
                    '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">昵称</label>' +
                    '<input id="edit-my-name-input" type="text" value="' + _esc(myName) + '" maxlength="12" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;box-sizing:border-box;">' +
                '</div>' +
                '<div style="width:100%;">' +
                    '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">头像图片URL</label>' +
                    '<input id="edit-my-avatar-url-input" type="text" placeholder="https://... 粘贴图片链接" value="' + _esc(myAvatar) + '" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
                '<button id="edit-my-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button>' +
                '<button id="edit-my-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button>' +
            '</div>';

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        document.getElementById('edit-my-close').onclick = function() { wrap.remove(); };
        document.getElementById('edit-my-cancel').onclick = function() { wrap.remove(); };
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };

        document.getElementById('edit-my-save').onclick = function() {
            var name = document.getElementById('edit-my-name-input').value.trim();
            if (!name) { _notify('请输入昵称', 'warning'); return; }
            var avatarUrl = document.getElementById('edit-my-avatar-url-input').value.trim();
            _setMyNameSetting(name);
            if (avatarUrl) _setMyAvatarSetting(avatarUrl);
            else localStorage.removeItem(MY_AVATAR_KEY);
            wrap.remove();
            var avatarModal = document.getElementById('avatar-settings-modal');
            if (avatarModal) avatarModal.remove();
            showAvatarSettings();
            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
            _notify('信息已更新 ✨', 'success');
        };
    }

    function editMember(name) {
        var old = document.getElementById('edit-member-modal');
        if (old) old.remove();

        var members = _getGroupMembers();
        var member = null;
        for (var i = 0; i < members.length; i++) {
            if (members[i].name === name) { member = members[i]; break; }
        }
        if (!member) { _notify('成员不存在', 'error'); return; }

        var wrap = document.createElement('div');
        wrap.id = 'edit-member-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10057;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML =
            '<div style="display:flex;justify-content:space-between;margin-bottom:16px;">' +
                '<span style="font-size:18px;font-weight:700;">✏️ 编辑成员</span>' +
                '<button id="edit-member-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-secondary);">✕</button>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:16px;">' +
                '<div style="width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px solid var(--border-color);display:flex;align-items:center;justify-content:center;background:var(--secondary-bg);">' +
                    (member.avatar ? '<img id="edit-member-avatar-preview" src="' + _esc(member.avatar) + '" style="width:100%;height:100%;object-fit:cover;">' : '<span id="edit-member-avatar-preview" style="font-size:28px;">🌸</span>') +
                '</div>' +
                '<div style="width:100%;">' +
                    '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">昵称</label>' +
                    '<input id="edit-member-name-input" type="text" value="' + _esc(member.name) + '" maxlength="12" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;box-sizing:border-box;">' +
                '</div>' +
                '<div style="width:100%;">' +
                    '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">头像图片URL</label>' +
                    '<input id="edit-member-avatar-url-input" type="text" placeholder="https://... 粘贴图片链接" value="' + _esc(member.avatar || '') + '" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
                '<button id="edit-member-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button>' +
                '<button id="edit-member-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button>' +
            '</div>';

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        document.getElementById('edit-member-close').onclick = function() { wrap.remove(); };
        document.getElementById('edit-member-cancel').onclick = function() { wrap.remove(); };
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };

        document.getElementById('edit-member-save').onclick = function() {
            var newName = document.getElementById('edit-member-name-input').value.trim();
            if (!newName) { _notify('请输入昵称', 'warning'); return; }
            var avatarUrl = document.getElementById('edit-member-avatar-url-input').value.trim();
            var oldName = member.name;
            if (oldName !== newName) {
                _updateMemberName(oldName, newName);
            }
            if (avatarUrl) _setMemberAvatar(newName, avatarUrl);
            else {
                var members2 = _getGroupMembers();
                for (var j = 0; j < members2.length; j++) {
                    if (members2[j].name === newName) {
                        members2[j].avatar = '';
                        break;
                    }
                }
                _saveGroupMembers(members2);
            }
            wrap.remove();
            var avatarModal = document.getElementById('avatar-settings-modal');
            if (avatarModal) avatarModal.remove();
            showAvatarSettings();
            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
            _notify('成员已更新 ✨', 'success');
        };
    }

    function addMember() {
        var old = document.getElementById('add-member-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'add-member-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10058;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML =
            '<div style="display:flex;justify-content:space-between;margin-bottom:16px;">' +
                '<span style="font-size:18px;font-weight:700;">➕ 添加成员</span>' +
                '<button id="add-member-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-secondary);">✕</button>' +
            '</div>' +
            '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;margin-bottom:16px;">' +
                '<div style="width:64px;height:64px;border-radius:50%;overflow:hidden;border:2px dashed var(--border-color);display:flex;align-items:center;justify-content:center;background:var(--secondary-bg);">' +
                    '<span id="add-member-avatar-preview" style="font-size:28px;color:var(--text-secondary);">+</span>' +
                '</div>' +
                '<div style="width:100%;">' +
                    '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">成员名字</label>' +
                    '<input id="add-member-name-input" type="text" placeholder="输入名字" maxlength="12" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;box-sizing:border-box;">' +
                '</div>' +
                '<div style="width:100%;">' +
                    '<label style="font-size:12px;color:var(--text-secondary);display:block;margin-bottom:4px;">头像图片URL（可选）</label>' +
                    '<input id="add-member-avatar-url-input" type="text" placeholder="https://... 粘贴图片链接" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;">' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;gap:10px;">' +
                '<button id="add-member-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button>' +
                '<button id="add-member-save" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;font-size:13px;cursor:pointer;">保存</button>' +
            '</div>';

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        document.getElementById('add-member-close').onclick = function() { wrap.remove(); };
        document.getElementById('add-member-cancel').onclick = function() { wrap.remove(); };
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };

        document.getElementById('add-member-save').onclick = function() {
            var name = document.getElementById('add-member-name-input').value.trim();
            if (!name) { _notify('请输入成员名字', 'warning'); return; }
            var avatarUrl = document.getElementById('add-member-avatar-url-input').value.trim();
            var members = _getGroupMembers();
            for (var i = 0; i < members.length; i++) {
                if (members[i].name === name) {
                    _notify('成员已存在', 'warning');
                    return;
                }
            }
            _addGroupMember(name, avatarUrl || '');
            wrap.remove();
            var avatarModal = document.getElementById('avatar-settings-modal');
            if (avatarModal) avatarModal.remove();
            showAvatarSettings();
            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
            _notify('成员已添加 ✨', 'success');
        };
    }

    function removeMember(name) {
        if (!confirm('确定要删除成员 "' + name + '" 吗？\n该成员的所有动态也将被删除。')) return;
        _removeGroupMember(name);
        var avatarModal = document.getElementById('avatar-settings-modal');
        if (avatarModal) avatarModal.remove();
        showAvatarSettings();
        var container = document.getElementById('moments-content');
        var activeTab = document.querySelector('.moments-tab.active');
        if (container && activeTab) renderTab(activeTab.dataset.tab, container);
        _notify('成员已删除', 'info');
    }

    // =============================================
    // 回复弹窗
    // =============================================
    function showReplyModal(postId, commentId) {
        var old = document.getElementById('reply-modal');
        if (old) old.remove();

        var data = _getData();
        var post = data.posts.find(function(p) { return p.id === postId; });
        var targetComment = null;
        if (post) {
            targetComment = post.comments.find(function(c) { return c.id === commentId; });
        }

        var wrap = document.createElement('div');
        wrap.id = 'reply-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10035;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:14px;">' +
            '<span style="font-size:18px;font-weight:700;">💬 回复</span>' +
            '<button id="reply-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>' +
            '</div>' +
            (targetComment ? '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;padding:6px 10px;background:rgba(var(--accent-color-rgb),0.06);border-radius:8px;">回复 <b>' + _esc(targetComment.memberName || '群成员') + '</b>：' + _esc(targetComment.text) + '</div>' : '') +
            '<textarea id="reply-text" rows="3" placeholder="写下你的回复..." style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;resize:vertical;box-sizing:border-box;font-family:var(--font-family);"></textarea>' +
            '<div style="display:flex;gap:10px;margin-top:12px;">' +
            '<button id="reply-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">取消</button>' +
            '<button id="reply-submit" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">发送</button>' +
            '</div>';
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('reply-close').onclick = close;
        document.getElementById('reply-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        document.getElementById('reply-submit').onclick = function() {
            var text = document.getElementById('reply-text').value.trim();
            if (!text) { _notify('请输入回复内容', 'warning'); return; }

            _appendCommentThread(postId, commentId, 'me', text, '');

            close();
            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
            _notify('回复已发送', 'success');

            if (targetComment && targetComment.author === 'partner' && post && post.author === 'me') {
                var replierName = targetComment.memberName || '群成员';
                var delayMs = REPLY_DELAY_MIN + Math.random() * (REPLY_DELAY_MAX - REPLY_DELAY_MIN);
                setTimeout(function() {
                    var freshData = _getData();
                    var freshPost = freshData.posts.find(function(p) { return p.id === postId; });
                    if (!freshPost) return;
                    var freshComment = freshPost.comments.find(function(c) { return c.id === commentId; });
                    if (!freshComment) return;
                    var replyText = _generateRandomReply();
                    _appendCommentThread(postId, commentId, 'partner', replyText, replierName);
                    if (typeof showNotification === 'function') {
                        showNotification('💬 ' + replierName + ' 回复了你', 'info', 3000);
                    }
                    var container2 = document.getElementById('moments-content');
                    var activeTab2 = document.querySelector('.moments-tab.active');
                    if (container2 && activeTab2) renderTab(activeTab2.dataset.tab, container2);
                }, delayMs);
            }
        };
    }

    // =============================================
    // 渲染Tab内容
    // =============================================
    function renderTab(tab, container) {
        var posts = _getPosts();
        var filtered = [];
        for (var i = 0; i < posts.length; i++) {
            if (posts[i].author === tab) filtered.push(posts[i]);
        }
        if (filtered.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--text-secondary);">' +
                '<div style="font-size:48px;margin-bottom:16px;">📭</div>' +
                '<div style="font-size:15px;font-weight:500;">还没有动态</div>' +
                '<div style="font-size:13px;opacity:0.6;margin-top:4px;">' + (tab === 'me' ? '点击右下角 + 发布你的第一条吧' : '成员们还没有发过动态哦') + '</div>' +
                '</div>';
            return;
        }

        var html = '';
        for (var pi = 0; pi < filtered.length; pi++) {
            var post = filtered[pi];
            var isMe = post.author === 'me';
            var name, avatarHtml;

            if (isMe) {
                name = _getMyNameSetting();
                var myAvatar = _getMyAvatarSetting();
                if (myAvatar) {
                    avatarHtml = '<img src="' + _esc(myAvatar) + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid rgba(var(--border-color-rgb),0.1);">';
                } else {
                    avatarHtml = '👤';
                }
            } else {
                name = post.memberName || '未知成员';
                var memberAvatar = _getMemberAvatar(name);
                var finalAvatar = memberAvatar || post.memberAvatar || '';
                if (finalAvatar) {
                    avatarHtml = '<img src="' + _esc(finalAvatar) + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:1px solid rgba(var(--border-color-rgb),0.1);">';
                } else {
                    avatarHtml = '🌸';
                }
            }
            var time = formatTime(post.timestamp);
            var commentCount = post.comments.length;

            html += '<div class="moments-post" data-id="' + post.id + '" style="background:rgba(var(--secondary-bg-rgb,255,255,255),0.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border-radius:16px;padding:16px 16px 12px;margin-bottom:14px;border:1px solid rgba(var(--border-color-rgb,0,0,0),0.06);box-shadow:0 1px 4px rgba(0,0,0,0.04);">' +
                '<div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">' +
                    '<span style="font-size:20px;display:flex;align-items:center;justify-content:center;width:36px;height:36px;flex-shrink:0;">' + avatarHtml + '</span>' +
                    '<span style="font-weight:600;color:var(--text-primary);font-size:15px;">' + _esc(name) + '</span>' +
                    '<span style="font-size:12px;color:var(--text-secondary);margin-left:auto;">' + time + '</span>' +
                '</div>' +
                '<div style="font-size:16px;color:var(--text-primary);margin:4px 0 12px;word-wrap:break-word;line-height:1.7;padding-left:2px;">' + _esc(post.text) + '</div>' +
                '<div style="display:flex;gap:20px;align-items:center;border-top:1px solid rgba(var(--border-color-rgb,0,0,0),0.06);padding-top:10px;">' +
                    '<button class="moments-like-btn" data-id="' + post.id + '" style="background:none;border:none;color:' + (post.likedByMe ? 'var(--accent-color)' : 'var(--text-secondary)') + ';font-size:14px;cursor:pointer;padding:4px 8px;border-radius:12px;display:flex;align-items:center;gap:4px;' + (post.likedByMe ? 'background:rgba(var(--accent-color-rgb),0.08);' : '') + '">' +
                        (post.likedByMe ? '❤️' : '🤍') + ' <span>' + post.likes + '</span>' +
                    '</button>' +
                    '<button class="moments-comment-btn" data-id="' + post.id + '" style="background:none;border:none;color:var(--text-secondary);font-size:14px;cursor:pointer;padding:4px 8px;border-radius:12px;display:flex;align-items:center;gap:4px;">' +
                        '💬 <span>' + commentCount + '</span>' +
                    '</button>' +
                    (isMe ? '<button class="moments-delete-btn" data-id="' + post.id + '" style="background:none;border:none;color:#ff6b6b;font-size:13px;cursor:pointer;padding:4px 8px;border-radius:12px;margin-left:auto;">🗑️</button>' : '') +
                '</div>' +
                (post.comments.length > 0 ? '<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(var(--border-color-rgb,0,0,0),0.06);">' : '');

            for (var ci = 0; ci < post.comments.length; ci++) {
                var c = post.comments[ci];
                var cName, cAvatarHtml;
                if (c.author === 'me') {
                    cName = _getMyNameSetting();
                    cAvatarHtml = _avatarHtmlForMe(18);
                } else {
                    cName = c.memberName || post.memberName || '群成员';
                    cAvatarHtml = _avatarHtmlForMember(cName, 18);
                }
                var cTime = formatTime(c.timestamp);

                html += '<div style="margin-bottom:8px;padding:4px 0;">' +
                    '<div style="display:flex;align-items:flex-start;gap:6px;flex-wrap:wrap;">' +
                        cAvatarHtml +
                        '<span style="font-weight:600;font-size:13px;">' + _esc(cName) + '</span> ' +
                        '<span style="color:var(--text-primary);font-size:13px;">' + _esc(c.text) + '</span> ' +
                        '<span style="font-size:10px;color:var(--text-secondary);">' + cTime + '</span>' +
                        '<button class="moments-reply-to-comment" data-postid="' + post.id + '" data-commentid="' + c.id + '" style="background:none;border:none;color:var(--accent-color);font-size:11px;cursor:pointer;padding:0 4px;opacity:0.6;">回复</button>' +
                    '</div>';

                var thread = c.thread || [];
                for (var ti = 0; ti < thread.length; ti++) {
                    var t = thread[ti];
                    var tName, tAvatarHtml;
                    if (t.author === 'me') {
                        tName = _getMyNameSetting();
                        tAvatarHtml = _avatarHtmlForMe(18);
                    } else {
                        tName = t.memberName || c.memberName || post.memberName || '群成员';
                        tAvatarHtml = _avatarHtmlForMember(tName, 18);
                    }
                    html += '<div style="margin-left:24px;margin-top:4px;padding:6px 12px;background:rgba(var(--accent-color-rgb),0.05);border-radius:8px;border-left:2px solid rgba(var(--accent-color-rgb),0.2);font-size:13px;color:var(--text-secondary);">' +
                        '<div style="display:flex;align-items:flex-start;gap:6px;flex-wrap:wrap;">' +
                            tAvatarHtml +
                            '<span style="font-weight:500;color:var(--text-primary);">' + _esc(tName) + '</span> ' +
                            '<span style="color:var(--text-primary);">' + _esc(t.text) + '</span> ' +
                            '<span style="font-size:10px;color:var(--text-secondary);">' + formatTime(t.timestamp) + '</span>' +
                        '</div>' +
                        '</div>';
                }
                html += '</div>';
            }

            if (post.comments.length > 0) {
                html += '</div>';
            }
            html += '</div>';
        }

        container.innerHTML = html;

        var likeBtns = container.querySelectorAll('.moments-like-btn');
        for (var lb = 0; lb < likeBtns.length; lb++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    _toggleLike(id);
                    var activeTab = document.querySelector('.moments-tab.active');
                    if (activeTab) renderTab(activeTab.dataset.tab, container);
                });
            })(likeBtns[lb]);
        }

        var commentBtns = container.querySelectorAll('.moments-comment-btn');
        for (var cb = 0; cb < commentBtns.length; cb++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var postId = this.dataset.id;
                    showCommentModal(postId);
                });
            })(commentBtns[cb]);
        }

        var replyBtns = container.querySelectorAll('.moments-reply-to-comment');
        for (var rb = 0; rb < replyBtns.length; rb++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var postId = this.dataset.postid;
                    var commentId = this.dataset.commentid;
                    showReplyModal(postId, commentId);
                });
            })(replyBtns[rb]);
        }

        var deleteBtns = container.querySelectorAll('.moments-delete-btn');
        for (var db = 0; db < deleteBtns.length; db++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    if (confirm('确定要删除这条动态吗？')) {
                        _deletePost(id);
                        var activeTab = document.querySelector('.moments-tab.active');
                        if (activeTab) renderTab(activeTab.dataset.tab, container);
                        _notify('已删除', 'info');
                    }
                });
            })(deleteBtns[db]);
        }
    }

    function showPublishModal() {
        var old = document.getElementById('publish-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'publish-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10020;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:14px;">' +
            '<span style="font-size:18px;font-weight:700;">📝 发布新动态</span>' +
            '<button id="publish-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>' +
            '</div>' +
            '<textarea id="publish-text" rows="4" placeholder="此刻的想法..." style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;resize:vertical;box-sizing:border-box;font-family:var(--font-family);"></textarea>' +
            '<div style="display:flex;gap:10px;margin-top:12px;">' +
            '<button id="publish-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">取消</button>' +
            '<button id="publish-submit" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">发布</button>' +
            '</div>';
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('publish-close').onclick = close;
        document.getElementById('publish-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        document.getElementById('publish-submit').onclick = function() {
            var text = document.getElementById('publish-text').value.trim();
            if (!text) { _notify('请输入内容', 'warning'); return; }
            var newPost = _addPost('me', text);
            close();
            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
            _notify('发布成功 ✨', 'success');
            _scheduleAutoInteraction(newPost.id);
        };
    }

    function showCommentModal(postId) {
        var old = document.getElementById('comment-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'comment-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10030;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(380px, 90vw);border:1px solid var(--border-color);';
        inner.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:14px;">' +
            '<span style="font-size:18px;font-weight:700;">💬 评论</span>' +
            '<button id="comment-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>' +
            '</div>' +
            '<textarea id="comment-text" rows="3" placeholder="写下你的评论..." style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;resize:vertical;box-sizing:border-box;font-family:var(--font-family);"></textarea>' +
            '<div style="display:flex;gap:10px;margin-top:12px;">' +
            '<button id="comment-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">取消</button>' +
            '<button id="comment-submit" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">发送</button>' +
            '</div>';
        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('comment-close').onclick = close;
        document.getElementById('comment-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        document.getElementById('comment-submit').onclick = function() {
            var text = document.getElementById('comment-text').value.trim();
            if (!text) { _notify('请输入评论', 'warning'); return; }

            var posts = _getPosts();
            var post = null;
            for (var i = 0; i < posts.length; i++) {
                if (posts[i].id === postId) { post = posts[i]; break; }
            }
            if (!post) { _notify('帖子不存在', 'error'); return; }

            var comment = _addComment(postId, 'me', text);
            if (!comment) { _notify('评论失败', 'error'); return; }

            close();
            var container = document.getElementById('moments-content');
            var activeTab = document.querySelector('.moments-tab.active');
            if (container && activeTab) renderTab(activeTab.dataset.tab, container);
            _notify('评论已发送', 'success');

            if (post.author === 'partner') {
                var delay = Math.random() * 300000;
                setTimeout(function() {
                    var freshPosts = _getPosts();
                    var freshPost = null;
                    for (var fi = 0; fi < freshPosts.length; fi++) {
                        if (freshPosts[fi].id === postId) { freshPost = freshPosts[fi]; break; }
                    }
                    if (!freshPost) return;
                    var latestComment = freshPost.comments[freshPost.comments.length - 1];
                    if (latestComment && latestComment.author === 'me' && (!latestComment.thread || latestComment.thread.length === 0)) {
                        var replyText = _generateRandomReply();
                        var partnerName = freshPost.memberName || '群成员';
                        _appendCommentThread(postId, latestComment.id, 'partner', replyText, partnerName);
                        _notify('💬 ' + partnerName + ' 回复了你的评论', 'info', 3000);
                        var container2 = document.getElementById('moments-content');
                        var activeTab2 = document.querySelector('.moments-tab.active');
                        if (container2 && activeTab2) renderTab(activeTab2.dataset.tab, container2);
                    }
                }, delay);
            }
        };
    }

    // =============================================
    // 朋友圈主界面
    // =============================================
    window.openMoments = function() {
        _forceGeneratePartnerPosts();

        var old = document.getElementById('moments-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'moments-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10010;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.7);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:0;width:min(460px, 94vw);max-height:85vh;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.3);border:1px solid var(--border-color);';

        var coverUrl = _getCoverImage();
        var defaultCover = 'linear-gradient(135deg, #2d1b3d 0%, #1a1a2e 50%, #16213e 100%)';
        var coverStyle = coverUrl ? 'url(' + coverUrl + ')' : defaultCover;

        var coverSection = document.createElement('div');
        coverSection.id = 'moments-cover';
        coverSection.style.cssText = 'position:relative;width:100%;height:160px;background:' + coverStyle + ';background-size:cover;background-position:center;flex-shrink:0;cursor:pointer;transition:background 0.3s ease;';

        var coverText = document.createElement('div');
        coverText.style.cssText = 'position:absolute;bottom:16px;left:18px;right:18px;color:rgba(255,255,255,0.95);text-shadow:0 2px 16px rgba(0,0,0,0.4);';
        coverText.innerHTML =
            '<div style="font-size:17px;font-weight:300;letter-spacing:2px;font-style:italic;line-height:1.5;">誓言是一场有时差的雨。</div>' +
            '<div style="font-size:11px;opacity:0.6;margin-top:2px;letter-spacing:1.5px;font-weight:300;">— Vow is a rain with time difference.</div>';
        coverSection.appendChild(coverText);

        coverSection.addEventListener('click', function() {
            showCoverSettings();
        });

        inner.appendChild(coverSection);

        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:14px 18px 10px;border-bottom:1px solid var(--border-color);flex-shrink:0;background:var(--primary-bg);';

        var leftSection = document.createElement('div');
        leftSection.style.cssText = 'display:flex;align-items:center;gap:8px;';
        var backBtn = document.createElement('button');
        backBtn.style.cssText = 'background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:4px;border-radius:8px;display:flex;align-items:center;justify-content:center;';
        backBtn.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backBtn.onclick = function() { wrap.remove(); };
        leftSection.appendChild(backBtn);

        var titleSpan = document.createElement('span');
        titleSpan.style.cssText = 'font-size:17px;font-weight:700;color:var(--text-primary);';
        titleSpan.textContent = '📱 朋友圈';
        leftSection.appendChild(titleSpan);
        header.appendChild(leftSection);

        var rightSection = document.createElement('div');
        rightSection.style.cssText = 'display:flex;gap:6px;align-items:center;';

        var avatarBtn = document.createElement('button');
        avatarBtn.style.cssText = 'background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:4px 6px;border-radius:8px;';
        avatarBtn.innerHTML = '<i class="fas fa-user-circle"></i>';
        avatarBtn.title = '头像与昵称';
        avatarBtn.onclick = function(e) {
            e.stopPropagation();
            showAvatarSettings();
        };
        rightSection.appendChild(avatarBtn);

        var bgBtn = document.createElement('button');
        bgBtn.style.cssText = 'background:none;border:none;font-size:14px;color:var(--text-secondary);cursor:pointer;padding:4px 6px;border-radius:8px;';
        bgBtn.innerHTML = '<i class="fas fa-image"></i>';
        bgBtn.title = '更换封面';
        bgBtn.onclick = function(e) {
            e.stopPropagation();
            showCoverSettings();
        };
        rightSection.appendChild(bgBtn);
        header.appendChild(rightSection);
        inner.appendChild(header);

        var tabBar = document.createElement('div');
        tabBar.style.cssText = 'display:flex;border-bottom:1px solid rgba(var(--border-color-rgb,0,0,0),0.08);flex-shrink:0;background:var(--primary-bg);padding:0 16px;';
        tabBar.innerHTML = '<button class="moments-tab active" data-tab="me" style="flex:1;padding:12px 4px 10px;border:none;background:transparent;font-weight:600;color:var(--text-primary);cursor:pointer;font-family:var(--font-family);font-size:14px;position:relative;border-bottom:2px solid var(--accent-color);">我的</button>' +
            '<button class="moments-tab" data-tab="partner" style="flex:1;padding:12px 4px 10px;border:none;background:transparent;font-weight:400;color:var(--text-secondary);cursor:pointer;font-family:var(--font-family);font-size:14px;position:relative;border-bottom:2px solid transparent;">群成员</button>';
        inner.appendChild(tabBar);

        var contentContainer = document.createElement('div');
        contentContainer.id = 'moments-content';
        contentContainer.style.cssText = 'flex:1;overflow-y:auto;padding:12px 16px 16px;background:var(--secondary-bg);';

        renderTab('me', contentContainer);
        inner.appendChild(contentContainer);

        var footer = document.createElement('div');
        footer.style.cssText = 'display:flex;justify-content:flex-end;padding:10px 16px 14px;border-top:1px solid var(--border-color);flex-shrink:0;background:rgba(var(--primary-bg-rgb),0.95);backdrop-filter:blur(8px);';
        var addBtn = document.createElement('button');
        addBtn.id = 'moments-add-btn';
        addBtn.style.cssText = 'width:38px;height:38px;border-radius:50%;background:#000;color:#fff;border:none;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 14px rgba(0,0,0,0.2);';
        addBtn.textContent = '+';
        addBtn.title = '发布新动态';
        addBtn.onclick = function() { showPublishModal(); };
        footer.appendChild(addBtn);
        inner.appendChild(footer);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        tabBar.querySelectorAll('.moments-tab').forEach(function(btn) {
            btn.addEventListener('click', function() {
                tabBar.querySelectorAll('.moments-tab').forEach(function(b) {
                    b.classList.remove('active');
                    b.style.color = 'var(--text-secondary)';
                    b.style.borderBottom = '2px solid transparent';
                    b.style.fontWeight = '400';
                });
                this.classList.add('active');
                this.style.color = 'var(--text-primary)';
                this.style.borderBottom = '2px solid var(--accent-color)';
                this.style.fontWeight = '600';
                var tab = this.dataset.tab;
                renderTab(tab, contentContainer);
                var addBtnEl = document.getElementById('moments-add-btn');
                if (addBtnEl) addBtnEl.style.display = tab === 'me' ? 'flex' : 'none';
            });
        });
    };

    window.showAvatarSettings = showAvatarSettings;
    window.editMyInfo = editMyInfo;
    window.editMember = editMember;
    window.addMember = addMember;
    window.removeMember = removeMember;

    console.log('[朋友圈] 模块已加载（每日随机2~4条 · 成员随机 · 对话链评论 · 头像跟随自定义）');
})();
