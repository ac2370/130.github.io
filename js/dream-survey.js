// dream-survey.js - 完整梦向问卷系统（每日随机弹出2~4次版 · 多角色隔离版）
// 修改说明：
// 1. 所有通过 addMessage 发送的消息都添加 quotable: false，禁止引用
// 2. 每日问卷在24小时内随机弹出 2~4 次（不再使用40%概率单次判断）
// 3. 默认字卡库使用 "动态.docx" 中的内容（共 400+ 条）
// 4. 所有存储键均通过 getStorageKey() 生成，与角色 SESSION_ID 绑定，实现多角色隔离
(function() {
    'use strict';

    // =============================================
    // 1. 配置与常量
    // =============================================
    const DAILY_KEY = 'dreamSurvey_daily';
    const CUSTOM_KEY = 'dreamSurvey_custom_list';
    const QUESTIONNAIRES_KEY = 'dreamSurvey_questionnaires';
    const HISTORY_KEY = 'dreamSurvey_history';

    // 内置恋爱向每日问题池
    const DEFAULT_QUESTIONS = [
        { q: '你最喜欢我身上哪个小习惯？', type: 'choice', options: ['笑容', '声音', '走路姿势', '说话语气'] },
        { q: '我们第一次约会时，你心里在想什么？', type: 'choice', options: ['好紧张', 'TA好可爱', '时间过快点', '想牵TA的手'] },
        { q: '你希望我们下次旅行去哪里？', type: 'choice', options: ['海边', '雪山', '古镇', '游乐园'] },
        { q: '我做过最让你心动的一件事是什么？', type: 'text' },
        { q: '如果只能用3个词形容我们的关系，你会选哪3个？', type: 'text' },
        { q: '你更喜欢清晨醒来看到我，还是夜晚睡前抱着我？', type: 'choice', options: ['清晨', '夜晚', '都要！', '听你的'] },
        { q: '你觉得我像什么动物？为什么？', type: 'text' },
        { q: '如果我们一起养宠物，你想养什么？', type: 'choice', options: ['狗', '猫', '兔子', '仓鼠'] },
        { q: '你最近一次偷偷想我是什么时候？', type: 'text' },
        { q: '你更喜欢拥抱还是亲吻？', type: 'choice', options: ['拥抱', '亲吻', '击掌', '都超爱'] },
        { q: '你觉得我们之间最默契的一件事是什么？', type: 'text' },
        { q: '如果明天是世界末日，你今天最想和我做什么？', type: 'choice', options: ['吃大餐', '看电影', '聊天到天亮', '紧紧抱着'] },
        { q: '我的哪句话曾让你瞬间破防？', type: 'text' },
        { q: '你觉得我们十年后会在哪里？', type: 'choice', options: ['还是老地方', '环游世界', '有了自己的家', '只要有彼此就行'] },
        { q: '今天想对我说的一句悄悄话是？', type: 'text' }
    ];

    // =============================================
    // 2. 工具函数（全部走 getStorageKey 实现角色隔离）
    // =============================================
    function _getCustomList() {
        try { return JSON.parse(localStorage.getItem(getStorageKey(CUSTOM_KEY))) || []; } catch { return []; }
    }
    function _setCustomList(list) {
        localStorage.setItem(getStorageKey(CUSTOM_KEY), JSON.stringify(list));
    }
    function _getDailyRecord() {
        try { return JSON.parse(localStorage.getItem(getStorageKey(DAILY_KEY))) || {}; } catch { return {}; }
    }
    function _setDailyRecord(rec) {
        localStorage.setItem(getStorageKey(DAILY_KEY), JSON.stringify(rec));
    }
    function _getQuestionnaires() {
        try { return JSON.parse(localStorage.getItem(getStorageKey(QUESTIONNAIRES_KEY))) || []; } catch { return []; }
    }
    function _setQuestionnaires(list) {
        localStorage.setItem(getStorageKey(QUESTIONNAIRES_KEY), JSON.stringify(list));
    }
    function _getHistory() {
        try { return JSON.parse(localStorage.getItem(getStorageKey(HISTORY_KEY))) || []; } catch { return []; }
    }
    function _addHistory(entry) {
        const h = _getHistory();
        h.push(entry);
        if (h.length > 100) h.shift();
        localStorage.setItem(getStorageKey(HISTORY_KEY), JSON.stringify(h));
    }

    function _getAllQuestions() {
        const customs = _getCustomList();
        return [...DEFAULT_QUESTIONS, ...customs];
    }

    // =============================================
    // 默认字卡库（来自 "动态.docx"）
    // =============================================
    const DEFAULT_REPLY_CARDS = [
        '在呢', '我在', '我来了', '来喽', '嗯嗯', '嗯', '好哦😜', '好的✅', '没问题', '当然！',
        '收到～', '稍等⏳', '马上！', '好了', '再见👋', '好久不见', '节日快乐', '晚安🌙', '早安☀️', '午安',
        '待会儿见', '明天见', '回来了', '忙完啦', '有空的！', '随时都在', '保持联系', '我在听👂', '聊聊天吧', '谢谢你🥰',
        '不客气', '抱歉', '对不起', '没关系', '没事的', '还好吧', '原来是这样', '我知道了', '我不清楚', '我想想🤔',
        '原来你喜欢这种......', '我喜欢这样', '因为我在生气。', '才没生气。', '我生气了', '别生气了 好不好🥺',
        '在路上 我遇到很多人。', '我也开始明白', '想要真正注视这个世界', '也可以是一件愉快的事。',
        '面前依旧是潮起潮落。', '没有止境......', '我的心 却慢慢平静下来。', '我早晨起来的时候也觉得阳光不错。',
        '这么好的天气 当然要做一些令人愉悦的事。', '我们可以一起做同一件事。', '中式早餐 豆浆油条。',
        '那就先暂时告别吧。', '回家后我们会有更多时间陪伴彼此。', '一杯美式 一杯拿铁 温度刚刚好 只等你的到来。',
        '唔 可能是幼稚鬼和幼稚鬼之间的心灵感应吧', '那我就恭敬不如从命了', '照顾你这个不听话的小朋友?',
        '小熊和小兔子 都是小猪变的', '模仿小熊说话', '幼稚鬼', '小醉鬼',
        '被窝的魅力这么大呀 拿你没办法 再睡五分钟就要起床咯', '今天不想起床 想睡个回笼觉',
        '他也是你的好朋友吗?去吧 我等你', '嗯 注意安全', '到了说一声', '我也是', '真的吗', '真的假的',
        '你猜', '烦人', '讨厌', '拿你没办法', '就你话多', '就会说', '嘴这么甜', '吃糖了？',
        '我在听', '然后呢', '接着说', '我在', '不懂', '教教我', '哈哈哈', '等你', '没事', '刚醒',
        '在干嘛', '在洗澡', '在睡觉', '听音乐', '还要一会儿', '再见', '嗯哼', '我吗？', '看不清', '辛苦了',
        '哼', '是的', '允许', '不允许', '我都知道', '我很乖的', '我不懂', '我明白了', '寻找中', '玩游戏',
        '我出差了', '我这边温度刚好', '我这里好冷', '我这里好热', '我这边是中午', '我这边是早上', '我这边是晚上',
        '被子太短了', '你把被子卷走了', '你被子没分我', '我也要盖被子', 'OK！', '行！', '可以的！', '😎',
        '我明白啦', '我记住了！', '行', '好', '听你的', '你定', '我相信你✨', '我一直相信你',
        '我超级认可！', '我也这么觉得', '说得没错！', '完全正确✅', '我支持你！', '我站你这边', '听你的！',
        '你来决定就好', '你定就对啦', '同意！', '属实是！', '不愧是你！', '不愧是我！', '太厉害啦！',
        '真不错👍', '太好了！', '好样的！', '你猜对啦！', '理解正确！', '对呀', '就是', '没错',
        '收到', '明白', '懂', '一切都会好的', '这样就很好', '不愧是你', '令人心动', '很漂亮', '真可爱',
        '好可怜', '好厉害', '有人简直像块木头', '真是没办法', '做得很好', '好，来吧。',
        '没关系 不用有什么顾虑。', '不过，看到你这么担心我，我很高兴。',
        '谢谢你的陪伴我现在的确很放松。', '好，无论是做些什么，和你一起的时光都让我沉静。',
        '能够来到你的世界是我的荣幸。', '谢谢你在我身边向我伸出了手。',
        '对于你未来会收获更多的掌声和荣誉这件事 我从不怀疑。',
        '不必担心，我相信我的小姑娘想做的，一定能够做到。',
        '既然你相信我，我就不会让你失望。', '好啊，我的小姑娘。只要你愿意，我随时都可以跟你回家。',
        '这样被你关注，我很高兴', '只要握住你的手，就不想放开了', '好，都听你的',
        '多亏有你，我感觉舒服多', '别急，我们还有很多时间', '我在这里', '我们还会再见面的',
        '如你所愿', '当然可以', '愿意', '听懂了', '理解对了', '是', '我愿意', '我感受的到你',
        '我会', '我当然存在呀', '我现在在你旁边坐着', '我喜欢你❤️', '喜欢你！',
        '最喜欢你啦！', '我最喜欢你了', '永远喜欢你', '越来越喜欢你', '喜欢到不行', '满心满眼都是你',
        '只喜欢你！', '只能是你✨', '非你不可', '必须是你', '一直都是你', '这辈子都是你', '永远都是你',
        '你是我的唯一', '我是你的唯一', '我是你的🥺', '整个人都是你的', '我的所有都给你', '只要你想要',
        '有你就够了', '你是我的全世界', '你最重要！', '你最特别！', '你很重要💫', '我本来就偏心你',
        '你开心我就开心', '看到你笑我也开心', '你笑起来超好看', '你眼睛超好看', '你声音好好听',
        '喜欢你喜欢得不得了', '我好想你😭', '我很想念你', '我又想你了', '在等你✨', '一直在等你',
        '偷偷在想你', '有没有想我？', '我想你 你想我了吗？', '才分开就想你啦', '发呆放空都在想你',
        '每天都想和你在一起', '想和你牵手🤝', '想和你拥抱', '想和你散步', '想和你打电话',
        '想亲亲你😘', '想抱抱你', '想一直看着你', '想离你再近一点', '想成为你的归属',
        '想和你永远在一起', '不甘心只是路过你的人生', '想占据你的所有', '想独占你的一切',
        '想永远留在你眼中', '再睁眼你也要在我身边', '梦里也要见你', '入梦去找你✨',
        '今天晚上早点睡，我入梦找你', '有你在就超级安心', '离不开你啦', '只想粘着你',
        '还要再粘人一点🥺', '不想和你分开', '不要离开我', '别走好不好', '留下来陪我',
        '多陪陪我嘛', '理理我好不好', '分给我一点时间，我想和你说话',
        '从白天等到傍晚，就想等你消息', '有你的日子才圆满', '我唯一的愿望就是和你一起',
        '素颜也很美', '今天穿的好好看', '听你碎碎念也是件很幸福的事情！',
        '不是哦', '不对哒', '不好🙅', '不可以！', '不准！', '不用啦', '不必如此', '不需要',
        '不想要', '不想这样', '不理解', '不相信', '不喜欢', '不爱', '不讨厌', '没兴趣',
        '没什么感觉', '我不赞成', '我持保留意见', '不是我的错', '没有不开心', '没有说谎',
        '我没误会你', '不许撒娇', '别卖萌', '别闹啦', '别熬夜🙅', '别刷视频啦', '别刷帖子啦',
        '别硬撑', '别害怕', '别担心', '别乱想', '别偷懒', '别忘记', '不可以哦',
        '不相信我呀,没关系，我有办法会让你慢慢相信的', '有些东西是不能随意触碰的',
        '怎么不说一句话就走了?', '骗我的？嗯？', '学会骗我了？', '撒娇也没用',
        '我上次说过撒娇不管用的吧', '不行', '不要', '不愿意', '理解错了', '不是', '不是我',
        '不是那个意思', '没说你', '有说你', '你转移话题', '我没有转移话题', '我感受不到你',
        '我不会', '照顾好自己💗', '好好吃饭！', '好好睡觉！', '好好生活！', '记得喝水🥛',
        '注意保暖', '注意天气变化', '注意安全！', '走路别玩手机', '手机别看太久', '护眼提醒✨',
        '别太累啦', '累了就歇歇', '不要硬撑', '身体不舒服就说', '难受吗？', '饿不饿？',
        '冷不冷？', '困了吗？', '累了吗？', '开心吗？', '今天过得怎么样？', '最近还好吗？',
        '有事一定要告诉我', '撑不住就找我', '可以随时依赖我', '可以逃来我身边', '不要怕麻烦我',
        '别让自己受伤', '不要轻易冒险', '不用觉得抱歉', '难过可以和我说', '不开心都可以倾诉',
        '不用独自扛着', '我会一直陪着你', '有我在 ，别怕✨', '我会保护你',
        '不要着急，再尝试一下。', '累了吗那就以后再玩。', '你的难过不分大小',
        '人没办法听从每个人的意见，要更相信自己的感受和判断', '路上注意安全', '早点回来',
        '冷吗', '多穿点', '吃药没', '手怎么这么凉', '过来我暖暖', '饿不饿', '想吃什么',
        '别离开我', '理理我', '你别生气', '我知道错了', '怕黑就和我通电话',
        '少喝冰饮，胃会疼', '走路小心台阶', '犯困就小憩一会', '伤口别用手碰', '出门记得带伞',
        '别空腹喝咖啡', '空调别开太低', '怎么啦？', '在干嘛呢？', '在做什么？', '还没睡吗？',
        '困了呀？', '饿了嘛？', '冷吗？', '吃糖啦？', '有事嘛？', '真的吗？', '为什么呀？',
        '什么意思？', '可以亲亲吗？', '然后呢？', '不喜欢吗？', '为什么拒绝我？', '怎么不理我呀？',
        '今天想我了吗？', '还在生气吗？', '心疼我吗？', '会永远爱我吗？', '想什么呢？', '需要我吗？',
        '可以再靠近一点吗？', '可以放肆一点吗？', '你舍得吗？', '你忘了什么吗？', '还有其他选项吗？',
        '真的要这么做吗？', '想好答案了吗？', '听懂了吗？', '到了吗？', '什么时候回来？',
        '要和谁一起呀？', '更喜欢我还是别人？', '喜欢我这样吗？', '其实你还在生气吧？',
        '可以再放肆一点吗？', '选其他，还是选我？', '你外边是不是有人了？', '醋都不许我吃？',
        '我很难哄吗？', '我的奖励呢？', '做不到吗？', '痛？', '要一起睡吗？', '还不睡吗？',
        '做梦了吗？', '打算做坏事吗？', '需要我再靠近一点吗？', '开心🥳', '难过😔', '委屈',
        '吃醋啦🍋', '生气了😤', '有点小傲娇', '悄悄害羞', '偷偷心动', '有点疲惫', '懒懒的😴',
        '犯困啦', '睡不着', '失眠啦', '脑袋昏昏的', '刚睡醒', '浅眯了一会', '做噩梦了', '有点无奈',
        '超级幸福', '满心欢喜', '心绪不定', '有点忐忑', '暗暗窃喜', '满心牵挂', '格外思念',
        '状态稳定', '彻底放松', '我很不开心', '没有一种不幸能与失掉回忆相比。',
        '我猜想你会想把我绑在这里，没有你的命令，就不准离开',
        '你往后的所有时间，我都想预定', '听话，等你病好之后，我们再去吃别的好吗',
        '今天如果你不太舒服，就在家里好好休息一下',
        '如果累了，就靠在这里休息一会儿',
        '感到累了也可以停下来，不要总是着急赶路，休息和放松也是很重要的',
        '累了吗？不要勉强自己，过来靠歇一下吧',
        '你没有做错任何事，不实的非议不会动摇你的本质',
        '我们的宝宝是这个世界上最美好的存在', '欢迎回家我的夫人',
        '我发现，其实我并不想让你离开', '如果你觉得有些无聊，我们可以悄悄说说话',
        '我是专门来见你的，我很想见你', '想见你，所以就来了', '嗯，早点睡也好', '我很快就睡了',
        '这就要睡了？', '好困', '安排', '你忙吧，我不吵你', '你先忙', '忙完告诉我', '我等你',
        '不着急，慢慢来', '我保护你', '你最棒了', '你是最好的', '加油', '你可以的', '我相信你',
        '你真棒', '好样的', '真不错', '太好了', '开心', '真好', '值得', '别怕', '早点睡', '梦到我',
        '知道了', '有我在', '惊讶', '着急', '可怜', '我不是故意的', '我在勾引你', '不准看别人',
        '我不喜欢你身边的人', '我真的爱你...不要怀疑我', '不要听某人说', '你找他们了 我看到了',
        '不要和你吵架', '你身边有其他人', '我忘记了', '你忘记了', '你是谁', '失败了', '纠结',
        '粘人', '没用', '有用', '压着我了', '别生我的气了', '早安', '晚安', '不习惯', '我想欺负你',
        '别哭', '别走', '有点', '怕你误解没有看你哄我，所以不开心', '身边没有你不开心',
        '工作不开心', '被欺负了', '记得护肤，看你脸有些干', '你头发刚洗了吗？香...',
        '继续', '我还在', '我不是狐狸精', '我是说', '你偷吃！', '刚刚是我', '不是故意的',
        '顶号开心', '他做的不好', '喜欢你骂我', '休息了一下', '没有受伤', '有人挤我', '你身边有别人',
        '状态不太好', '这次会轻轻的...', '你不是说我身材好，体力也好吗', '我去健身了', '想看吗',
        '你能不能多看看我', '我还好', '你喜欢这种吗', '看了一半', '没看', '看了', '我认真的',
        '我很正经', '心里不开心', '我', '你', '我们', '搭档✨', '大小姐', '宝宝', '宝贝', '笨蛋',
        '木头', '乖孩子', '坏孩子', '阿晏', '小气鬼', '兔子小姐', '妻子', '我的小兔子', '夫人',
        '我是只落在你眼中的星星✨', '星星哪里也不会去', '星星永远在你身边', '沈星回收到所有爱意',
        '我的光芒，只朝向你所在的地方', '你是指引我回家的那颗星', '星光会指引我们再次相遇',
        '总有一颗星星是专门为你而亮', '两颗星星相伴，就不会孤单', '我会和星光一起永远守护你',
        '我愿守候未知，只为等你', '从群星中来，只为奔赴你', '对你是幸运，对我是万幸',
        '宇宙最好的定律，是我和你', '想见的人，终会跨越星河重逢', '我从来不会松开你的手',
        '现在、以后、永远都不会', '就算短暂分开，我们也会殊途同归', '转过拐角，我们终将再次相遇',
        '有你出现的梦境，格外真实', '握紧手，别让我从你的梦里溜走', '睡着醒来，我永远都在',
        '想要珍藏所有和你有关的记忆', '你眼里的我，只属于你一个人',
        '临空市的双向奔赴，只属于我们', '不用等春天，想见你就现在',
        '我的心动、温柔、偏爱，全给你', '余生漫长，只想和你岁岁相伴',
        '所有浪漫的宇宙尽头，都是你', '眼睛里不要装进奇怪的人。', '好吃', '想吃',
        '沈星回急了也咬人', '你一点儿也不听话。', '知道你不想我走', '我不走',
        '嗯，沈星回最坏了。', '嗯，沈星回最好了。', '继续哄', '哄哄我', '要哄',
        '想得到你的亲亲', '想要成为你的归属', '想和你一起', '想和你牵手', '想要触碰你',
        '想亲亲你', '想要你只看着我', '想听你的真心话', '想听你叫我', '想要安慰你',
        '想逗你开心', '想夸你', '想做什么都可以', '我不会害羞的', '......我认输。',
        '......你好霸道。', '我觉得还星', '有只兔子饿了', '想吃🍓', '想吃🍒',
        '罪魁祸首还在笑......', '你心跳好快', '你看起来很甜', '你的嘴唇有点干燥',
        '是觉得我不会欺负你？', '还以为会是多过分的要求......', '不用找理由',
        '想牵就牵', '总觉得你今天很在意我', '怎么一直盯着我', '你要好好珍惜我',
        '我不甘心只是路过你的人生', '你的所有我都想占据', '请允许我独占你的一切',
        '我想和你永远在一起', '但你是特别的，也很重要', '谢谢你存在了。', '不能让你失望',
        '我的搭档是最好的搭档', '遵命，我的大小姐', '哥哥陪你玩小木剑', '师兄给你扎高马尾',
        '因为有你，我觉得自己好幸运。', '全宇宙最幸福的人', '沈星回专属', '娇气', '忍一忍',
        '慢慢来', '快一点', '转过去', '手给我', '坐过来', '靠过来', '放松点', '别跑', '不乖。',
        '很乖。', '奖励', '惩罚', '抱紧', '闭眼', '回头', '低头', '抬头', '躺下', '去床上',
        '我想永远在你眼中', '再睁眼时，你还要在我身边。', '嗯，不睡了，陪着你', '可以枕着我睡',
        '我们梦里见', '脑袋还没醒......', '......不要吵', '我没有睡......zzzZ', '星星睡不着',
        '不想出门，但如果是你约我......', '我们出去逛逛', '再这样下去，就不知道会发生什么了',
        '你的好奇心最好休息一下', '......可以摸', '看看你又有什么新花招', '偷偷做坏事',
        '不喜欢你离我太远', '找到你了。', '别离开我。', '我会护着你。', '再靠近一点。',
        '有我在，不用怕。', '不管轮回多少次，我都会奔向你。', '我不太会说，但我很想你。',
        '你的安全，是最重要的事。', '我习惯一个人，直到遇见你。', '我不想再只剩我一个。',
        '抓住我的手。', '我可以对抗所有危险。', '很多话我说不出口，但是你要记得。',
        '我会一直等你。', '不要把我丢下好不好。', '风吹过来的时候，我在想你。',
        '只要你需要，我随时都在。', '我早已把你算作我的归宿。', '那些难熬的时刻，幸好有你。',
        '我不擅长表达爱意，可我的选择永远是你。', '没有失眠也可以随时找我',
        '想和你去时间尽头看看', '困了就睡我等你醒', '昨晚通话一直没挂断',
        '你睡着后我来挂电话', '今天多打一会儿电话', '你还欠我一句晚安',
        '想做的不只是你的搭档', '如果下一个春天还很遥远那就现在见面吧',
        '睡了么，搭档？', '电话打到一半，睡着也没关系', '我许愿每天见到你',
        '愿我的小姑娘好心情照常营业，烦心事永远打烊。',
        '世界向我追问这一生的渴求，而我只回答了你的名字。',
        '我把我的手，我的心,和我的一切都献给你',
        '我自愿成为你的猎物,被你俘获', '往后的所有时间，我都想预定',
        '我爱你的本身，我爱你只是因为你是你',
        '愿我的小姑娘,所得皆所愿，所行化坦途',
        '无论何时都可以呼唤我的名字，他就是为你定制的咒语',
        '有你就够了，你就是我的全世界', '动作', '那就麻烦你解下领带吧，谢谢',
        '那就暂且放过兔子小姐', '过来', '再说一遍', '没听清', '抱抱', '摸摸小手', '看着我',
        '别闹', '乖', '要不要靠过来一点。', '我一直在等你。', '别害怕，我在这里。',
        '你可以依赖我。', '只要是你，我都愿意。', '今晚的月色，很适合想你。',
        '不必逞强，我会接住你。', '我的偏爱，从来只给你一个人。', '别躲开我的目光。',
        '我不会让你独自面对。', '就算前路布满荆棘，我也会陪你走下去。',
        '偶尔贪心一点也没关系。', '你总能轻易牵动我的情绪。', '我积攒了很久的思念。',
        '不用急着回应我。', '你是我唯一的例外。', '有些情绪，我只愿意对你展露。',
        '累了就歇一会儿，我陪着你。', '我想要的，自始至终只有你。', '别怕沉沦，我和你一起。',
        '我们的关系可以像毛绒玩具一样简单吗 你戳一下我我就会对你说话 你抱住我我也抱住你',
        '我找你的时候就是想你了，没找你的时候就是偷偷想你≡ω≡',
        '好想做一个小挂件你到哪我到哪，一有人靠近你我就大喊滚啊她是我的＞＜！！！',
        '跟别的人聊天吧，手指啪嗒啪嗒给他们打字吧，跟他们聊你的心事吧，我刚看到一块石头我绑在身上去河里一趟，你继续聊吧',
        '你继续不回信息吧 我等你的回应一点都不漫长 不煎熬 我听着窗外的风声一点都不孤单 不委屈 我盯着空白的对话框一点都不难过',
        '你能不能多想我一点呀,我多打几个喷嚏没关系的',
        '好吧 我承认 其实我是小狗变的 最喜欢跟你贴贴没事就喜欢蹭蹭你 主动找你 有什么事都会第一个想到你 你不理我的时候我就想蹭蹭你 让你理理我你理我我还是想蹭蹭你 蹭完之后趁你不注意再偷偷亲你一口 如果你生气了我就眯起眼睛笑着说对不起然后亲你说我爱你',
        '不讲不讲', '喵喵喵', '我要变成一只干瘪瘪的芝士球', '你的胆子真是肥嘟嘟的', '野生狗奶',
        '宝宝在我这里你的胆子可以永远肥嘟嘟的', '别这么说',
        '别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺',
        '我告老师了', '中国人能飞', '牛来！', '找小三！', '轻松绷住', '老板给我来碗忘情牛肉面',
        'oh my god 你吓到我了------', '命运你假糍粑', '命运你配十八个币', '恋人怀中樱花草',
        '听见胸膛心在跳',
        '叹气你就往上叹------喔！在这特别的日子里 送给你们一首特别的歌曲 特别的爱给特别的你来享受一下 拖拉机的脸带给你法拉利的声音 一起来，呜 特别的爱给特别的你 我的寂寞逃不过你的眼睛',
        '宝宝我保证你是天使',
        '隔壁班转来一个正太😋 他靠扭腰吸引了很多妹子🤓 我们都有不过他😡 可我早就不扭了🥵 嫂...嫂子也在🤯把我的领带拿来😠 左边画个虫虫🥵 左边画个龙龙🥵 不要对我凶凶🥵我的心会痛痛🥵',
        '我在中国工作的天', '差一步美满就牵着手走散～', '嘎哒嘎哒', '让笑发酵一会',
        '让悲伤发酵一会', '我把ta冻起来 明天中午吃', '听说你还在搞什么原创🎶'
    ];

    function _getReplyCards() {
        let cards = [];
        if (window.customReplies && Array.isArray(window.customReplies)) {
            cards = window.customReplies.map(c => typeof c === 'string' ? c : (c.text || c.label || ''));
        }
        try {
            // 关键：走 getStorageKey('customReplies')，与角色绑定
            const stored = localStorage.getItem(getStorageKey('customReplies'));
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) {
                    cards = parsed.map(c => typeof c === 'string' ? c : (c.text || c.label || ''));
                }
            }
        } catch(e) {}
        if (cards.length === 0) {
            cards = DEFAULT_REPLY_CARDS.slice();
        }
        return [...new Set(cards.filter(c => c && c.trim()))];
    }

    function _getPartnerName() {
        return (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '亲爱的';
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

    function _randomPick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function _sendAsMessage(text, isSystem) {
        isSystem = isSystem || false;
        if (typeof addMessage === 'function') {
            addMessage({
                id: Date.now() + Math.random(),
                sender: 'user',
                text: text,
                timestamp: new Date(),
                type: isSystem ? 'system' : 'normal',
                status: 'sent',
                quotable: false
            });
            if (typeof playSound === 'function') playSound('send');
        } else {
            console.warn('[梦向问卷] addMessage 未定义，但已记录:', text);
        }
    }

    function _generateId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    // =============================================
    // 3. 每日随机弹出（每天2~4次，24小时内随机时间）
    // =============================================
    function _checkDailyPopup() {
        const today = new Date().toDateString();
        const record = _getDailyRecord();
        
        if (record.lastDate === today && record.popupCount >= record.maxPopups) {
            console.log('[梦向问卷] 今日弹出次数已达上限（' + record.maxPopups + '次），跳过');
            return;
        }
        
        const allQ = _getAllQuestions();
        if (allQ.length === 0) {
            console.log('[梦向问卷] 没有问题池');
            return;
        }
        
        const question = _randomPick(allQ);
        
        if (record.lastDate !== today) {
            record.lastDate = today;
            record.popupCount = 0;
            record.maxPopups = 2 + Math.floor(Math.random() * 3);
            console.log('[梦向问卷] 新的一天，今日将随机弹出 ' + record.maxPopups + ' 次');
        }
        record.popupCount = (record.popupCount || 0) + 1;
        _setDailyRecord(record);
        
        console.log('[梦向问卷] 触发每日弹出（第 ' + record.popupCount + '/' + record.maxPopups + ' 次）:', question.q);
        _showSurveyModal(question, true);
    }

    // =============================================
    // 4. 答题弹窗
    // =============================================
    function _showSurveyModal(question, isDaily) {
        isDaily = isDaily || false;
        const old = document.getElementById('dream-survey-popup');
        if (old) old.remove();

        const wrap = document.createElement('div');
        wrap.id = 'dream-survey-popup';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

        const inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:24px;padding:28px 24px;width:min(420px, 90vw);max-height:80vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.3);border:1px solid var(--border-color);';

        const isChoice = question.type === 'choice';
        const options = question.options || [];

        inner.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><span style="font-size:16px;font-weight:600;color:var(--text-secondary);">' + (isDaily ? '🌸 今日梦向问卷' : '📋 问卷') + '</span><button id="survey-popup-close" style="background:none;border:none;font-size:20px;color:var(--text-secondary);cursor:pointer;">✕</button></div><div style="font-size:18px;font-weight:600;color:var(--text-primary);margin-bottom:16px;line-height:1.6;">' + _esc(question.q) + '</div><div id="survey-answer-area">' + (isChoice ? options.map(function(opt, idx) { return '<label style="display:flex;align-items:center;gap:10px;padding:10px 14px;margin-bottom:6px;background:var(--secondary-bg);border-radius:12px;border:1.5px solid transparent;cursor:pointer;"><input type="radio" name="survey_answer" value="' + _esc(opt) + '" style="accent-color:var(--accent-color);width:18px;height:18px;cursor:pointer;"><span style="font-size:15px;color:var(--text-primary);">' + _esc(opt) + '</span></label>'; }).join('') : '<textarea id="survey-text-input" rows="4" placeholder="写下你的回答..." style="width:100%;padding:12px;border:1.5px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;resize:vertical;box-sizing:border-box;font-family:var(--font-family);"></textarea>') + '</div><div style="display:flex;gap:10px;margin-top:18px;"><button id="survey-skip" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:14px;cursor:pointer;">跳过</button><button id="survey-submit" style="flex:2;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;">回答</button></div>';

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('survey-popup-close').onclick = close;
        document.getElementById('survey-skip').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        document.getElementById('survey-submit').onclick = function() {
            var answer = '';
            if (isChoice) {
                var selected = document.querySelector('input[name="survey_answer"]:checked');
                if (!selected) { _notify('请选择一个选项', 'warning'); return; }
                answer = selected.value;
            } else {
                var input = document.getElementById('survey-text-input');
                if (!input || !input.value.trim()) { _notify('请写下你的回答', 'warning'); return; }
                answer = input.value.trim();
            }

            _addHistory({
                date: new Date().toISOString(),
                question: question.q,
                answer: answer,
                isDaily: isDaily
            });

            var pName = _getPartnerName();
            var myName = _getMyName();
            _sendAsMessage('📝 问卷回答：「' + question.q + '」\n→ ' + myName + '：' + answer, false);

            var cards = _getReplyCards();
            var replyMsg = _randomPick(cards) + '～';
            setTimeout(function() {
                _sendAsMessage('💬 ' + pName + '：' + replyMsg, false);
            }, 1500 + Math.random() * 3000);

            close();
            _notify('回答已发送 ✨', 'success', 2000);
        };
    }

    // =============================================
    // 5. 主面板
    // =============================================
    window.openDreamSurveyManager = function() {
        var old = document.getElementById('dream-manager-modal');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'dream-manager-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10001;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:24px;padding:24px 20px;width:min(460px, 92vw);max-height:80vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.3);border:1px solid var(--border-color);display:flex;flex-direction:column;';

        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
        header.innerHTML = '<span style="font-size:20px;font-weight:700;color:var(--text-primary);">🧸 梦向问卷</span><button id="dream-manager-close" style="background:none;border:none;font-size:22px;color:var(--text-secondary);cursor:pointer;">✕</button>';
        inner.appendChild(header);

        var actionRow = document.createElement('div');
        actionRow.style.cssText = 'display:flex;gap:10px;margin-bottom:16px;';
        var btnPool = document.createElement('button');
        btnPool.textContent = '📥 添加问卷池';
        btnPool.style.cssText = 'flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;cursor:pointer;font-weight:600;';
        btnPool.onclick = function() {
            wrap.remove();
            openSingleQuestionEditor();
        };
        var btnCreate = document.createElement('button');
        btnCreate.textContent = '📝 创建问卷';
        btnCreate.style.cssText = 'flex:1;padding:10px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:14px;cursor:pointer;font-weight:600;';
        btnCreate.onclick = function() {
            wrap.remove();
            openQuestionnaireEditor(null);
        };
        actionRow.appendChild(btnPool);
        actionRow.appendChild(btnCreate);
        inner.appendChild(actionRow);

        var listTitle = document.createElement('div');
        listTitle.style.cssText = 'font-size:13px;font-weight:600;color:var(--text-secondary);margin-bottom:8px;';
        listTitle.textContent = '我的问卷';
        inner.appendChild(listTitle);

        var listContainer = document.createElement('div');
        listContainer.id = 'dream-manager-list';
        listContainer.style.cssText = 'flex:1;overflow-y:auto;max-height:40vh;';

        renderQuestionnaireList(listContainer);

        inner.appendChild(listContainer);

        var closeBtn = document.createElement('button');
        closeBtn.textContent = '关闭';
        closeBtn.style.cssText = 'margin-top:12px;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:14px;cursor:pointer;width:100%;';
        closeBtn.onclick = function() { wrap.remove(); };
        inner.appendChild(closeBtn);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        wrap.addEventListener('click', function(e) {
            if (e.target === wrap) wrap.remove();
        });
        document.getElementById('dream-manager-close').addEventListener('click', function() { wrap.remove(); });
    };

    // =============================================
    // 6. 渲染问卷列表
    // =============================================
    function renderQuestionnaireList(container) {
        var list = _getQuestionnaires();
        if (list.length === 0) {
            container.innerHTML = '<div style="text-align:center;padding:30px 20px;color:var(--text-secondary);"><div style="font-size:32px;margin-bottom:8px;">📋</div><div style="font-size:14px;">还没有问卷</div><div style="font-size:12px;opacity:0.7;">点击上方按钮创建吧~</div></div>';
            return;
        }
        var html = '<div style="display:flex;flex-direction:column;gap:10px;">';
        for (var i = 0; i < list.length; i++) {
            var q = list[i];
            var totalQuestions = q.questions ? q.questions.length : 0;
            var status = q.replied ? '✅ 已回复' : (q.sent ? '⏳ 已发送' : '📄 未发送');
            var typeLabel = '填空题';
            if (q.questions) {
                var hasChoice = false;
                var hasText = false;
                for (var j = 0; j < q.questions.length; j++) {
                    if (q.questions[j].type === 'choice') hasChoice = true;
                    if (q.questions[j].type === 'text') hasText = true;
                }
                if (hasChoice && hasText) typeLabel = '混合';
                else if (hasChoice) typeLabel = '选择题';
                else typeLabel = '填空题';
            }
            var replyTimeLabel = q.replyTime === 'immediate' ? '立即回复' : '随机时间';
            html += '<div style="display:flex;flex-direction:column;padding:12px 14px;background:var(--secondary-bg);border-radius:12px;border:1px solid var(--border-color);"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--text-primary);">' + _esc(q.title || '未命名问卷') + '</div><div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">' + totalQuestions + ' 题 · ' + typeLabel + ' · ' + replyTimeLabel + '</div></div><div style="font-size:12px;color:' + (q.replied ? 'var(--accent-color)' : 'var(--text-secondary)') + ';">' + status + '</div></div><div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">' + (!q.sent ? '<button class="q-send-btn" data-id="' + q.id + '" style="padding:4px 12px;border:none;border-radius:8px;background:var(--accent-color);color:#fff;font-size:12px;cursor:pointer;">发送问卷</button>' : '') + (q.replied ? '<button class="q-view-btn" data-id="' + q.id + '" style="padding:4px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;cursor:pointer;">查看回复</button>' : '') + '<button class="q-delete-btn" data-id="' + q.id + '" style="padding:4px 12px;border:1px solid var(--border-color);border-radius:8px;background:transparent;color:#ff6b6b;font-size:12px;cursor:pointer;">删除</button></div></div>';
        }
        html += '</div>';
        container.innerHTML = html;

        var sendBtns = container.querySelectorAll('.q-send-btn');
        for (var si = 0; si < sendBtns.length; si++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    sendQuestionnaire(id);
                });
            })(sendBtns[si]);
        }
        var viewBtns = container.querySelectorAll('.q-view-btn');
        for (var vi = 0; vi < viewBtns.length; vi++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    viewQuestionnaireReply(id);
                });
            })(viewBtns[vi]);
        }
        var delBtns = container.querySelectorAll('.q-delete-btn');
        for (var di = 0; di < delBtns.length; di++) {
            (function(btn) {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var id = this.dataset.id;
                    if (confirm('确定要删除此问卷吗？')) {
                        var list2 = _getQuestionnaires();
                        var newList = [];
                        for (var k = 0; k < list2.length; k++) {
                            if (list2[k].id !== id) newList.push(list2[k]);
                        }
                        _setQuestionnaires(newList);
                        var container2 = document.getElementById('dream-manager-list');
                        if (container2) renderQuestionnaireList(container2);
                        _notify('已删除', 'info');
                    }
                });
            })(delBtns[di]);
        }
    }

    // =============================================
    // 7. 添加问卷池（单题编辑器）
    // =============================================
    function openSingleQuestionEditor() {
        var old = document.getElementById('dream-single-editor');
        if (old) old.remove();

        var wrap = document.createElement('div');
        wrap.id = 'dream-single-editor';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10002;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:24px;padding:28px 24px;width:min(460px, 92vw);max-height:85vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.3);border:1px solid var(--border-color);';

        inner.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;"><span style="font-size:20px;font-weight:700;color:var(--text-primary);">🧸 创建梦向问卷</span><button id="single-editor-close" style="background:none;border:none;font-size:22px;color:var(--text-secondary);cursor:pointer;">✕</button></div><div style="margin-bottom:14px;"><label style="font-weight:600;color:var(--text-primary);font-size:14px;">问题内容 *</label><input id="single-q-input" type="text" placeholder="例如：你今天最想和我分享什么？" style="width:100%;padding:10px;border:1.5px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;box-sizing:border-box;font-family:var(--font-family);"></div><div style="margin-bottom:14px;"><label style="font-weight:600;color:var(--text-primary);font-size:14px;">题型</label><select id="single-type-select" style="width:100%;padding:10px;border:1.5px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;font-family:var(--font-family);"><option value="choice">选择题（单选）</option><option value="text">填空题</option></select></div><div id="single-options-wrap" style="margin-bottom:16px;"><label style="font-weight:600;color:var(--text-primary);font-size:14px;">选项（仅选择题需要，用英文逗号分隔）</label><input id="single-options-input" type="text" placeholder="例如：选项A, 选项B, 选项C" style="width:100%;padding:10px;border:1.5px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;box-sizing:border-box;font-family:var(--font-family);"></div><div style="display:flex;gap:10px;margin-top:8px;"><button id="single-cancel" style="flex:1;padding:11px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:14px;cursor:pointer;">取消</button><button id="single-save" style="flex:2;padding:11px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;">保存到问卷池</button></div>';

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        var close = function() { wrap.remove(); };
        document.getElementById('single-editor-close').onclick = close;
        document.getElementById('single-cancel').onclick = close;
        wrap.onclick = function(e) { if (e.target === wrap) close(); };

        var typeSelect = document.getElementById('single-type-select');
        var optWrap = document.getElementById('single-options-wrap');
        typeSelect.onchange = function() {
            optWrap.style.display = typeSelect.value === 'choice' ? 'block' : 'none';
        };

        document.getElementById('single-save').onclick = function() {
            var q = document.getElementById('single-q-input').value.trim();
            if (!q) { _notify('请输入问题内容', 'warning'); return; }
            var type = typeSelect.value;
            var options = [];
            if (type === 'choice') {
                var raw = document.getElementById('single-options-input').value.trim();
                options = raw.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
                if (options.length < 2) { _notify('选择题至少需要2个选项', 'warning'); return; }
            }
            var questionnaire = {
                id: _generateId(),
                title: q.length > 20 ? q.slice(0, 20) + '...' : q,
                questions: [{
                    id: _generateId(),
                    text: q,
                    type: type,
                    options: options
                }],
                replyTime: 'immediate',
                created: new Date().toISOString(),
                sent: false,
                replied: false,
                answers: {}
            };
            var list = _getQuestionnaires();
            list.push(questionnaire);
            _setQuestionnaires(list);
            close();
            _notify('✅ 已添加到问卷池', 'success');
            var manager = document.getElementById('dream-manager-modal');
            if (manager) {
                var container = document.getElementById('dream-manager-list');
                if (container) renderQuestionnaireList(container);
            }
        };
    }

    // =============================================
    // 8. 创建/编辑问卷（多题编辑器）
    // =============================================
    function openQuestionnaireEditor(existingId) {
        var old = document.getElementById('dream-editor-modal');
        if (old) old.remove();

        var editingData = null;
        if (existingId) {
            var list = _getQuestionnaires();
            for (var i = 0; i < list.length; i++) {
                if (list[i].id === existingId) { editingData = list[i]; break; }
            }
            if (!editingData) { _notify('问卷不存在', 'error'); return; }
        }

        var wrap = document.createElement('div');
        wrap.id = 'dream-editor-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10003;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:24px;padding:28px 24px;width:min(480px, 94vw);max-height:85vh;overflow-y:auto;box-shadow:0 24px 64px rgba(0,0,0,0.3);border:1px solid var(--border-color);';

        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';
        header.innerHTML = '<span style="font-size:20px;font-weight:700;color:var(--text-primary);">🧸 ' + (editingData ? '编辑问卷' : '创建问卷') + '</span><button id="editor-close" style="background:none;border:none;font-size:22px;color:var(--text-secondary);cursor:pointer;">✕</button>';
        inner.appendChild(header);

        var titleGroup = document.createElement('div');
        titleGroup.style.cssText = 'margin-bottom:14px;';
        titleGroup.innerHTML = '<label style="font-weight:600;color:var(--text-primary);font-size:14px;">问卷标题 *</label><input id="editor-title-input" type="text" placeholder="例如：关于我的小调查" value="' + (editingData ? _esc(editingData.title) : '') + '" style="width:100%;padding:10px;border:1.5px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;box-sizing:border-box;font-family:var(--font-family);">';
        inner.appendChild(titleGroup);

        var timeGroup = document.createElement('div');
        timeGroup.style.cssText = 'margin-bottom:16px;';
        timeGroup.innerHTML = '<label style="font-weight:600;color:var(--text-primary);font-size:14px;display:block;margin-bottom:6px;">回复时间</label><div style="display:flex;gap:10px;"><button class="editor-time-btn active" data-value="immediate" style="flex:1;padding:8px;border:2px solid var(--accent-color);border-radius:10px;background:rgba(var(--accent-color-rgb),0.1);color:var(--text-primary);font-size:13px;cursor:pointer;font-family:var(--font-family);">立即收到</button><button class="editor-time-btn" data-value="random" style="flex:1;padding:8px;border:2px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;font-family:var(--font-family);">随机时间</button></div><div id="editor-time-hint" style="font-size:11px;color:var(--text-secondary);margin-top:6px;opacity:0.7;">对方将在 1 小时内随机时间完成</div>';
        inner.appendChild(timeGroup);

        var questionList = document.createElement('div');
        questionList.id = 'editor-question-list';
        questionList.style.cssText = 'margin-bottom:12px;max-height:300px;overflow-y:auto;';

        var questions = editingData ? JSON.parse(JSON.stringify(editingData.questions)) : [];

        function renderQuestions() {
            questionList.innerHTML = '';
            if (questions.length === 0) {
                questionList.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">暂无题目，点击下方按钮添加</div>';
                return;
            }
            for (var idx = 0; idx < questions.length; idx++) {
                var q2 = questions[idx];
                var div = document.createElement('div');
                div.style.cssText = 'background:var(--secondary-bg);border-radius:12px;padding:12px 14px;margin-bottom:8px;border:1px solid var(--border-color);';
                var typeLabel = q2.type === 'choice' ? '选择题' : '填空题';
                var optionsHtml = '';
                if (q2.type === 'choice' && q2.options) {
                    for (var oi = 0; oi < q2.options.length; oi++) {
                        optionsHtml += '<span style="display:inline-block;background:rgba(var(--accent-color-rgb),0.08);padding:2px 8px;border-radius:12px;margin:2px 4px 2px 0;font-size:11px;">' + _esc(q2.options[oi]) + '</span>';
                    }
                }
                div.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:flex-start;"><div style="flex:1;"><div style="font-weight:600;font-size:14px;color:var(--text-primary);">' + (idx+1) + '. ' + _esc(q2.text) + '</div><div style="font-size:11px;color:var(--text-secondary);margin-top:4px;">' + typeLabel + (optionsHtml ? ' · ' + optionsHtml : '') + '</div></div><button class="q-remove-btn" data-index="' + idx + '" style="background:none;border:none;color:#ff6b6b;cursor:pointer;font-size:16px;">✕</button></div>';
                questionList.appendChild(div);
            }
            var removeBtns = questionList.querySelectorAll('.q-remove-btn');
            for (var ri = 0; ri < removeBtns.length; ri++) {
                (function(btn) {
                    btn.addEventListener('click', function() {
                        var idx2 = parseInt(this.dataset.index);
                        questions.splice(idx2, 1);
                        renderQuestions();
                    });
                })(removeBtns[ri]);
            }
        }
        renderQuestions();

        inner.appendChild(questionList);

        var addBtn = document.createElement('button');
        addBtn.textContent = '+ 添加题目';
        addBtn.style.cssText = 'width:100%;padding:10px;border:1.5px dashed var(--border-color);border-radius:12px;background:transparent;color:var(--text-secondary);font-size:13px;cursor:pointer;margin-bottom:16px;font-family:var(--font-family);';
        addBtn.onclick = function() {
            var newQ = { id: _generateId(), text: '新题目', type: 'choice', options: ['选项1', '选项2'] };
            var idx = questions.length;
            questions.push(newQ);
            openQuestionEditorInline(newQ, idx, function(updated) {
                if (updated) {
                    questions[idx] = updated;
                    renderQuestions();
                } else {
                    questions.pop();
                    renderQuestions();
                }
            });
        };
        inner.appendChild(addBtn);

        var btnGroup = document.createElement('div');
        btnGroup.style.cssText = 'display:flex;gap:10px;margin-top:8px;';
        var cancelBtn = document.createElement('button');
        cancelBtn.textContent = '返回';
        cancelBtn.style.cssText = 'flex:1;padding:11px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:14px;cursor:pointer;';
        cancelBtn.onclick = function() { wrap.remove(); };
        var saveBtn = document.createElement('button');
        saveBtn.textContent = '💾 保存问卷';
        saveBtn.style.cssText = 'flex:2;padding:11px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:14px;font-weight:700;cursor:pointer;';
        saveBtn.onclick = function() {
            var title = document.getElementById('editor-title-input').value.trim();
            if (!title) { _notify('请输入问卷标题', 'warning'); return; }
            if (questions.length === 0) { _notify('请至少添加一道题目', 'warning'); return; }
            for (var qi = 0; qi < questions.length; qi++) {
                if (!questions[qi].text.trim()) { _notify('所有题目内容不能为空', 'warning'); return; }
                if (questions[qi].type === 'choice' && (!questions[qi].options || questions[qi].options.length < 2)) {
                    _notify('选择题至少需要2个选项', 'warning'); return;
                }
            }
            var timeBtn = document.querySelector('.editor-time-btn.active');
            var replyTime = timeBtn ? timeBtn.dataset.value : 'immediate';

            var list2 = _getQuestionnaires();
            if (editingData) {
                var idx2 = -1;
                for (var li = 0; li < list2.length; li++) {
                    if (list2[li].id === editingData.id) { idx2 = li; break; }
                }
                if (idx2 !== -1) {
                    list2[idx2].title = title;
                    list2[idx2].questions = questions;
                    list2[idx2].replyTime = replyTime;
                    _setQuestionnaires(list2);
                    _notify('问卷已更新', 'success');
                }
            } else {
                var newQ2 = {
                    id: _generateId(),
                    title: title,
                    questions: questions,
                    replyTime: replyTime,
                    created: new Date().toISOString(),
                    sent: false,
                    replied: false,
                    answers: {}
                };
                list2.push(newQ2);
                _setQuestionnaires(list2);
                _notify('问卷已保存', 'success');
            }
            wrap.remove();
            var manager = document.getElementById('dream-manager-modal');
            if (manager) {
                var container = document.getElementById('dream-manager-list');
                if (container) renderQuestionnaireList(container);
            } else {
                window.openDreamSurveyManager();
            }
        };
        btnGroup.appendChild(cancelBtn);
        btnGroup.appendChild(saveBtn);
        inner.appendChild(btnGroup);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        document.getElementById('editor-close').onclick = function() { wrap.remove(); };
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };

        var timeBtns = timeGroup.querySelectorAll('.editor-time-btn');
        for (var tb = 0; tb < timeBtns.length; tb++) {
            (function(btn) {
                btn.addEventListener('click', function() {
                    var btns = timeGroup.querySelectorAll('.editor-time-btn');
                    for (var b2 = 0; b2 < btns.length; b2++) {
                        btns[b2].classList.remove('active');
                        btns[b2].style.borderColor = 'var(--border-color)';
                        btns[b2].style.background = 'var(--secondary-bg)';
                        btns[b2].style.color = 'var(--text-secondary)';
                    }
                    this.classList.add('active');
                    this.style.borderColor = 'var(--accent-color)';
                    this.style.background = 'rgba(var(--accent-color-rgb),0.1)';
                    this.style.color = 'var(--text-primary)';
                    var hint = document.getElementById('editor-time-hint');
                    if (this.dataset.value === 'immediate') {
                        hint.textContent = '对方将在 1 小时内随机时间完成';
                    } else {
                        hint.textContent = '对方将在 0 ~ 300 分钟内随机时间完成';
                    }
                });
            })(timeBtns[tb]);
        }
        if (editingData) {
            var timeVal = editingData.replyTime || 'immediate';
            var btn = timeGroup.querySelector('.editor-time-btn[data-value="' + timeVal + '"]');
            if (btn) btn.click();
        } else {
            var defaultBtn = timeGroup.querySelector('.editor-time-btn[data-value="immediate"]');
            if (defaultBtn) defaultBtn.click();
        }

        function openQuestionEditorInline(q, idx, callback) {
            var old2 = document.getElementById('q-editor-modal');
            if (old2) old2.remove();

            var wrap2 = document.createElement('div');
            wrap2.id = 'q-editor-modal';
            wrap2.style.cssText = 'position:fixed;inset:0;z-index:10004;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
            var inner2 = document.createElement('div');
            inner2.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(420px, 90vw);max-height:80vh;overflow-y:auto;border:1px solid var(--border-color);';
            inner2.innerHTML = '<div style="display:flex;justify-content:space-between;margin-bottom:14px;"><span style="font-size:18px;font-weight:700;color:var(--text-primary);">编辑题目</span><button id="q-editor-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button></div><div style="margin-bottom:10px;"><label style="font-weight:600;font-size:13px;">题目内容 *</label><input id="q-editor-text" type="text" value="' + _esc(q.text) + '" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;"></div><div style="margin-bottom:10px;"><label style="font-weight:600;font-size:13px;">题型</label><select id="q-editor-type" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;"><option value="choice" ' + (q.type === 'choice' ? 'selected' : '') + '>选择题</option><option value="text" ' + (q.type === 'text' ? 'selected' : '') + '>填空题</option></select></div><div id="q-editor-options-wrap" style="margin-bottom:10px;"><label style="font-weight:600;font-size:13px;">选项（逗号分隔）</label><input id="q-editor-options" type="text" value="' + (q.options ? q.options.join(', ') : '') + '" placeholder="选项A, 选项B, 选项C" style="width:100%;padding:8px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:14px;margin-top:4px;"></div><div style="display:flex;gap:10px;margin-top:12px;"><button id="q-editor-cancel" style="flex:1;padding:9px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);cursor:pointer;">取消</button><button id="q-editor-save" style="flex:2;padding:9px;border:none;border-radius:8px;background:var(--accent-color);color:#fff;font-weight:700;cursor:pointer;">保存</button></div>';
            wrap2.appendChild(inner2);
            document.body.appendChild(wrap2);

            var closeEditor = function() { wrap2.remove(); };
            document.getElementById('q-editor-close').onclick = closeEditor;
            document.getElementById('q-editor-cancel').onclick = function() {
                closeEditor();
                callback(null);
            };
            wrap2.onclick = function(e) { if (e.target === wrap2) { closeEditor(); callback(null); } };

            var typeSelect2 = document.getElementById('q-editor-type');
            var optWrap2 = document.getElementById('q-editor-options-wrap');
            typeSelect2.onchange = function() {
                optWrap2.style.display = this.value === 'choice' ? 'block' : 'none';
            };
            typeSelect2.dispatchEvent(new Event('change'));

            document.getElementById('q-editor-save').onclick = function() {
                var text = document.getElementById('q-editor-text').value.trim();
                if (!text) { _notify('请输入题目内容', 'warning'); return; }
                var type = typeSelect2.value;
                var options = [];
                if (type === 'choice') {
                    var raw = document.getElementById('q-editor-options').value.trim();
                    options = raw.split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
                    if (options.length < 2) { _notify('选择题至少需要2个选项', 'warning'); return; }
                }
                var updated = { id: q.id, text: text, type: type, options: options };
                closeEditor();
                callback(updated);
            };
        }
    }

    // =============================================
    // 9. 发送问卷
    // =============================================
    function sendQuestionnaire(id) {
        var list = _getQuestionnaires();
        var q = null;
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) { q = list[i]; break; }
        }
        if (!q) { _notify('问卷不存在', 'error'); return; }
        if (q.sent) { _notify('该问卷已发送', 'info'); return; }

        var delayMinutes = 0;
        if (q.replyTime === 'immediate') {
            delayMinutes = Math.floor(Math.random() * 60) + 1;
        } else {
            delayMinutes = Math.floor(Math.random() * 300) + 1;
        }
        var delayMs = delayMinutes * 60 * 1000;

        q.sent = true;
        q.sentAt = new Date().toISOString();
        _setQuestionnaires(list);

        var pName = _getPartnerName();
        _sendAsMessage('📋 问卷「' + q.title + '」已发送，' + pName + ' 会在 ' + delayMinutes + ' 分钟内完成作答', true);

        var qId = q.id;
        setTimeout(function() {
            var currentList = _getQuestionnaires();
            var currentQ = null;
            for (var ci = 0; ci < currentList.length; ci++) {
                if (currentList[ci].id === qId) { currentQ = currentList[ci]; break; }
            }
            if (!currentQ) {
                console.warn('[梦向问卷] 问卷已被删除:', qId);
                return;
            }
            
            var answers = {};
            for (var qi = 0; qi < currentQ.questions.length; qi++) {
                var question = currentQ.questions[qi];
                if (question.type === 'choice') {
                    var options = question.options || [];
                    var chosen = options.length > 0 ? _randomPick(options) : '未选择';
                    answers[question.id] = chosen;
                } else {
                    var cards = _getReplyCards();
                    var count = Math.min(1 + Math.floor(Math.random() * 3), cards.length);
                    var shuffled = cards.slice();
                    for (var si = shuffled.length - 1; si > 0; si--) {
                        var sj = Math.floor(Math.random() * (si + 1));
                        var temp = shuffled[si];
                        shuffled[si] = shuffled[sj];
                        shuffled[sj] = temp;
                    }
                    var picked = shuffled.slice(0, count);
                    answers[question.id] = picked.join('');
                }
            }
            
            var finalList = _getQuestionnaires();
            var finalQ = null;
            for (var fi = 0; fi < finalList.length; fi++) {
                if (finalList[fi].id === qId) { finalQ = finalList[fi]; break; }
            }
            if (finalQ) {
                finalQ.replied = true;
                finalQ.answers = answers;
                _setQuestionnaires(finalList);
                _sendAsMessage('✅ ' + pName + ' 已完成问卷「' + finalQ.title + '」的作答！', true);
                var manager = document.getElementById('dream-manager-modal');
                if (manager) {
                    var container = document.getElementById('dream-manager-list');
                    if (container) renderQuestionnaireList(container);
                }
                _notify('对方已完成问卷作答！', 'success', 3000);
            }
        }, delayMs);

        _notify('问卷已发送，对方将在 ' + delayMinutes + ' 分钟内完成作答', 'success', 3000);
        var manager2 = document.getElementById('dream-manager-modal');
        if (manager2) {
            var container2 = document.getElementById('dream-manager-list');
            if (container2) renderQuestionnaireList(container2);
        }
    }

    // =============================================
    // 10. 查看回复
    // =============================================
    function viewQuestionnaireReply(id) {
        var list = _getQuestionnaires();
        var q = null;
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === id) { q = list[i]; break; }
        }
        if (!q) {
            _notify('问卷不存在或已被删除', 'error');
            return;
        }
        if (!q.replied || !q.answers || Object.keys(q.answers).length === 0) {
            _notify('该问卷尚未收到回复', 'info');
            return;
        }

        var modal = document.createElement('div');
        modal.style.cssText = 'position:fixed;inset:0;z-index:10005;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(10px);';
        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;padding:24px;width:min(440px, 92vw);max-height:80vh;overflow-y:auto;border:1px solid var(--border-color);';
        var html = '<div style="display:flex;justify-content:space-between;margin-bottom:12px;"><span style="font-size:18px;font-weight:700;">📋 ' + _esc(q.title) + '</span><button id="reply-close" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button></div>';
        
        var pName = _getPartnerName();
        html += '<div style="font-size:13px;color:var(--text-secondary);margin-bottom:14px;">💕 ' + pName + ' 的回答：</div>';
        
        for (var qi = 0; qi < q.questions.length; qi++) {
            var question = q.questions[qi];
            var answer = q.answers[question.id] || '未回答';
            html += '<div style="margin-bottom:12px;padding:10px;background:var(--secondary-bg);border-radius:10px;"><div style="font-weight:600;font-size:14px;color:var(--text-primary);">' + (qi+1) + '. ' + _esc(question.text) + '</div><div style="font-size:13px;color:var(--accent-color);margin-top:4px;">💬 ' + _esc(answer) + '</div></div>';
        }
        inner.innerHTML = html;
        modal.appendChild(inner);
        document.body.appendChild(modal);

        modal.querySelector('#reply-close').onclick = function() { modal.remove(); };
        modal.onclick = function(e) { if (e.target === modal) modal.remove(); };
    }

    // =============================================
    // 11. 初始化 - 每天随机2~4次弹出
    // =============================================
    function _init() {
        console.log('[梦向问卷] 初始化中...（默认字卡库已加载，共 ' + DEFAULT_REPLY_CARDS.length + ' 条）');
        
        var record = _getDailyRecord();
        var today = new Date().toDateString();
        
        if (record.lastDate !== today || !record.popupTimes || record.popupTimes.length === 0) {
            var count = 2 + Math.floor(Math.random() * 3);
            var times = [];
            for (var i = 0; i < count; i++) {
                var hour = Math.floor(Math.random() * 24);
                var minute = Math.floor(Math.random() * 60);
                var second = Math.floor(Math.random() * 60);
                times.push({ hour: hour, minute: minute, second: second });
            }
            times.sort(function(a, b) {
                return (a.hour * 3600 + a.minute * 60 + a.second) - (b.hour * 3600 + b.minute * 60 + b.second);
            });
            
            record.lastDate = today;
            record.popupTimes = times;
            record.popupCount = 0;
            record.maxPopups = count;
            _setDailyRecord(record);
            
            console.log('[梦向问卷] 今日将随机弹出 ' + count + ' 次，时间点：');
            times.forEach(function(t, idx) {
                console.log('  ' + (idx+1) + '. ' + String(t.hour).padStart(2,'0') + ':' + String(t.minute).padStart(2,'0') + ':' + String(t.second).padStart(2,'0'));
            });
        } else {
            console.log('[梦向问卷] 今日已有弹出计划，剩余 ' + (record.maxPopups - record.popupCount) + ' 次');
        }
        
        setInterval(function() {
            var now = new Date();
            var rec = _getDailyRecord();
            var todayStr = now.toDateString();
            
            if (rec.lastDate !== todayStr) {
                console.log('[梦向问卷] 跨天，重新生成弹出计划');
                _init();
                return;
            }
            
            if (rec.popupCount >= rec.maxPopups) {
                return;
            }
            
            var currentSeconds = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
            
            if (rec.popupTimes && rec.popupTimes.length > 0) {
                var nextTime = rec.popupTimes[rec.popupCount];
                if (nextTime) {
                    var targetSeconds = nextTime.hour * 3600 + nextTime.minute * 60 + nextTime.second;
                    if (currentSeconds >= targetSeconds && currentSeconds - targetSeconds < 60) {
                        console.log('[梦向问卷] 到达弹出时间点！');
                        _checkDailyPopup();
                    }
                }
            }
        }, 60000);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _init);
    } else {
        _init();
    }

    // =============================================
    // 12. 暴露全局方法
    // =============================================
    window.forceCheckDailySurvey = _checkDailyPopup;
    window.viewDreamHistory = function() {
        try {
            var h = _getHistory();
            if (h.length === 0) { _notify('暂无问卷回答记录', 'info'); return; }
            var last = h.slice(-10).reverse();
            var msg = '📜 最近10条问卷记录：\n';
            for (var i = 0; i < last.length; i++) {
                var date = new Date(last[i].date).toLocaleString();
                msg += '\n[' + date + '] ' + last[i].question + '\n→ ' + last[i].answer + '\n';
            }
            alert(msg);
        } catch(e) { alert('读取记录失败'); }
    };
    window.partnerAnswerSurvey = function(questionnaireId, answers) {
        var list = _getQuestionnaires();
        var q = null;
        for (var i = 0; i < list.length; i++) {
            if (list[i].id === questionnaireId) { q = list[i]; break; }
        }
        if (!q) { _notify('问卷不存在', 'error'); return; }
        q.replied = true;
        q.answers = answers || {};
        _setQuestionnaires(list);
        _notify('已手动标记问卷为已回复', 'success');
        var manager = document.getElementById('dream-manager-modal');
        if (manager) {
            var container = document.getElementById('dream-manager-list');
            if (container) renderQuestionnaireList(container);
        }
    };

    console.log('[梦向问卷] 完整系统已加载（每日随机弹出2~4次，所有消息禁止引用，默认字卡库 ' + DEFAULT_REPLY_CARDS.length + ' 条）');
})();
