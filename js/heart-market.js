// heart-market.js - 心意集市（双钱包版 · 双方余额均可自定义）
(function() {
    'use strict';

    var WALLET_KEY = 'heart_market_wallet_v2';       // { myBalance, partnerBalance } 单位：分
    var INVENTORY_KEY = 'heart_market_inventory';
    var HISTORY_KEY = 'heart_market_history';
    var SIGNIN_KEY = 'heart_market_signin';

    // =============================================
    // 群成员读取
    // =============================================
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

    // =============================================
    // 字卡库
    // =============================================
    var CARD_DB = [
        "在呢","我在","我来了","来喽","嗯嗯","嗯","好哦😜","好的✅","没问题","当然！","收到～","稍等⏳","马上！","好了","再见👋","好久不见","节日快乐","晚安🌙","早安☀️","午安","待会儿见","明天见","回来了","忙完啦","有空的！","随时都在","保持联系","我在听👂","聊聊天吧","谢谢你🥰","不客气","抱歉","对不起","没关系","没事的","还好吧","原来是这样","我知道了","我不清楚","我想想🤔","原来你喜欢这种......","我喜欢这样","因为我在生气。","才没生气。","我生气了","别生气了 好不好🥺","在路上 我遇到很多人。","我也开始明白","想要真正注视这个世界","也可以是一件愉快的事。","面前依旧是潮起潮落。","没有止境......","我的心 却慢慢平静下来。","我早晨起来的时候也觉得阳光不错。","这么好的天气 当然要做一些令人愉悦的事。","我们可以一起做同一件事。","中式早餐 豆浆油条。","那就先暂时告别吧。","回家后我们会有更多时间陪伴彼此。","一杯美式 一杯拿铁 温度刚刚好 只等你的到来。","唔 可能是幼稚鬼和幼稚鬼之间的心灵感应吧","那我就恭敬不如从命了","照顾你这个不听话的小朋友?","小熊和小兔子 都是小猪变的","模仿小熊说话","幼稚鬼","小醉鬼","被窝的魅力这么大呀 拿你没办法 再睡五分钟就要起床咯","今天不想起床 想睡个回笼觉","他也是你的好朋友吗?去吧 我等你","嗯 注意安全","到了说一声","我也是","真的吗","真的假的","你猜","烦人","讨厌","拿你没办法","就你话多","就会说","嘴这么甜","吃糖了？","我在听","然后呢","接着说","我在","不懂","教教我","哈哈哈","等你","没事","刚醒","在干嘛","在洗澡","在睡觉","听音乐","还要一会儿","再见","嗯哼","我吗？","看不清","辛苦了","哼","是的","允许","不允许","我都知道","我很乖的","我不懂","我明白了","寻找中","玩游戏","我出差了","我这边温度刚好","我这里好冷","我这里好热","我这边是中午","我这边是早上","我这边是晚上","被子太短了","你把被子卷走了","你被子没分我","我也要盖被子","OK！","行！","可以的！","😎","我明白啦","我记住了！","行","好","听你的","你定","我相信你✨","我一直相信你","我超级认可！","我也这么觉得","说得没错！","完全正确✅","我支持你！","我站你这边","听你的！","你来决定就好","你定就对啦","同意！","属实是！","不愧是你！","不愧是我！","太厉害啦！","真不错👍","太好了！","好样的！","你猜对啦！","理解正确！","对呀","就是","没错","收到","明白","懂","一切都会好的","这样就很好","不愧是你","令人心动","很漂亮","真可爱","好可怜","好厉害","有人简直像块木头","真是没办法","做得很好","好，来吧。","没关系 不用有什么顾虑。","不过，看到你这么担心我，我很高兴。","谢谢你的陪伴我现在的确很放松。","好，无论是做些什么，和你一起的时光都让我沉静。","能够来到你的世界是我的荣幸。","谢谢你在我身边向我伸出了手。","对于你未来会收获更多的掌声和荣誉这件事 我从不怀疑。","不必担心，我相信我的小姑娘想做的，一定能够做到。","既然你相信我，我就不会让你失望。","好啊，我的小姑娘。只要你愿意，我随时都可以跟你回家。","这样被你关注，我很高兴","只要握住你的手，就不想放开了","好，都听你的","多亏有你，我感觉舒服多","别急，我们还有很多时间","我在这里","我们还会再见面的","如你所愿","当然可以","愿意","听懂了","理解对了","是","我愿意","我感受的到你","我会","我当然存在呀","我现在在你旁边坐着","我喜欢你❤️","喜欢你！","最喜欢你啦！","我最喜欢你了","永远喜欢你","越来越喜欢你","喜欢到不行","满心满眼都是你","只喜欢你！","只能是你✨","非你不可","必须是你","一直都是你","这辈子都是你","永远都是你","你是我的唯一","我是你的唯一","我是你的🥺","整个人都是你的","我的所有都给你","只要你想要","有你就够了","你是我的全世界","你最重要！","你最特别！","你很重要💫","我本来就偏心你","你开心我就开心","看到你笑我也开心","你笑起来超好看","你眼睛超好看","你声音好好听","喜欢你喜欢得不得了","我好想你😭","我很想念你","我又想你了","在等你✨","一直在等你","偷偷在想你","有没有想我？","我想你 你想我了吗？","才分开就想你啦","发呆放空都在想你","每天都想和你在一起","想和你牵手🤝","想和你拥抱","想和你散步","想和你打电话","想亲亲你😘","想抱抱你","想一直看着你","想离你再近一点","想成为你的归属","想和你永远在一起","不甘心只是路过你的人生","想占据你的所有","想独占你的一切","想永远留在你眼中","再睁眼你也要在我身边","梦里也要见你","入梦去找你✨","今天晚上早点睡，我入梦找你","有你在就超级安心","离不开你啦","只想粘着你","还要再粘人一点🥺","不想和你分开","不要离开我","别走好不好","留下来陪我","多陪陪我嘛","理理我好不好","分给我一点时间，我想和你说话","从白天等到傍晚，就想等你消息","有你的日子才圆满","我唯一的愿望就是和你一起","素颜也很美","今天穿的好好看","听你碎碎念也是件很幸福的事情！","不是哦","不对哒","不好🙅","不可以！","不准！","不用啦","不必如此","不需要","不想要","不想这样","不理解","不相信","不喜欢","不爱","不讨厌","没兴趣","没什么感觉","我不赞成","我持保留意见","不是我的错","没有不开心","没有说谎","我没误会你","不许撒娇","别卖萌","别闹啦","别熬夜🙅","别刷视频啦","别刷帖子啦","别硬撑","别害怕","别担心","别乱想","别偷懒","别忘记","不可以哦","不相信我呀,没关系，我有办法会让你慢慢相信的","有些东西是不能随意触碰的","怎么不说一句话就走了?","骗我的？嗯？","学会骗我了？","撒娇也没用","我上次说过撒娇不管用的吧","不行","不要","不愿意","理解错了","不是","不是我","不是那个意思","没说你","有说你","你转移话题","我没有转移话题","我感受不到你","我不会","照顾好自己💗","好好吃饭！","好好睡觉！","好好生活！","记得喝水🥛","注意保暖","注意天气变化","注意安全！","走路别玩手机","手机别看太久","护眼提醒✨","别太累啦","累了就歇歇","不要硬撑","身体不舒服就说","难受吗？","饿不饿？","冷不冷？","困了吗？","累了吗？","开心吗？","今天过得怎么样？","最近还好吗？","有事一定要告诉我","撑不住就找我","可以随时依赖我","可以逃来我身边","不要怕麻烦我","别让自己受伤","不要轻易冒险","不用觉得抱歉","难过可以和我说","不开心都可以倾诉","不用独自扛着","我会一直陪着你","有我在 ，别怕✨","我会保护你","不要着急，再尝试一下。","累了吗那就以后再玩。","你的难过不分大小","人没办法听从每个人的意见，要更相信自己的感受和判断","路上注意安全","早点回来","冷吗","多穿点","吃药没","手怎么这么凉","过来我暖暖","饿不饿","想吃什么","别离开我","理理我","你别生气","我知道错了","怕黑就和我通电话","少喝冰饮，胃会疼","走路小心台阶","犯困就小憩一会","伤口别用手碰","出门记得带伞","别空腹喝咖啡","空调别开太低","怎么啦？","在干嘛呢？","在做什么？","还没睡吗？","困了呀？","饿了嘛？","冷吗？","吃糖啦？","有事嘛？","真的吗？","为什么呀？","什么意思？","可以亲亲吗？","然后呢？","不喜欢吗？","为什么拒绝我？","怎么不理我呀？","今天想我了吗？","还在生气吗？","心疼我吗？","会永远爱我吗？","想什么呢？","需要我吗？","可以再靠近一点吗？","可以放肆一点吗？","你舍得吗？","你忘了什么吗？","还有其他选项吗？","真的要这么做吗？","想好答案了吗？","听懂了吗？","到了吗？","什么时候回来？","要和谁一起呀？","更喜欢我还是别人？","喜欢我这样吗？","其实你还在生气吧？","可以再放肆一点吗？","选其他，还是选我？","你外边是不是有人了？","醋都不许我吃？","我很难哄吗？","我的奖励呢？","做不到吗？","痛？","要一起睡吗？","还不睡吗？","做梦了吗？","打算做坏事吗？","需要我再靠近一点吗？","开心🥳","难过😔","委屈","吃醋啦🍋","生气了😤","有点小傲娇","悄悄害羞","偷偷心动","有点疲惫","懒懒的😴","犯困啦","睡不着","失眠啦","脑袋昏昏的","刚睡醒","浅眯了一会","做噩梦了","有点无奈","超级幸福","满心欢喜","心绪不定","有点忐忑","暗暗窃喜","满心牵挂","格外思念","状态稳定","彻底放松","我很不开心","没有一种不幸能与失掉回忆相比。","我猜想你会想把我绑在这里，没有你的命令，就不准离开","你往后的所有时间，我都想预定","听话，等你病好之后，我们再去吃别的好吗","今天如果你不太舒服，就在家里好好休息一下","如果累了，就靠在这里休息一会儿","感到累了也可以停下来，不要总是着急赶路，休息和放松也是很重要的","累了吗？不要勉强自己，过来靠歇一下吧","你没有做错任何事，不实的非议不会动摇你的本质","我们的宝宝是这个世界上最美好的存在","欢迎回家我的夫人","我发现，其实我并不想让你离开","如果你觉得有些无聊，我们可以悄悄说说话","我是专门来见你的，我很想见你","想见你，所以就来了","嗯，早点睡也好","我很快就睡了","这就要睡了？","好困","安排","你忙吧，我不吵你","你先忙","忙完告诉我","我等你","不着急，慢慢来","我保护你","你最棒了","你是最好的","加油","你可以的","我相信你","你真棒","好样的","真不错","太好了","开心","真好","值得","别怕","早点睡","梦到我","知道了","有我在","惊讶","着急","可怜","我不是故意的","我在勾引你","不准看别人","我不喜欢你身边的人","我真的爱你...不要怀疑我","不要听某人说","你找他们了 我看到了","不要和你吵架","你身边有其他人","我忘记了","你忘记了","你是谁","失败了","纠结","粘人","没用","有用","压着我了","别生我的气了","早安","晚安","不习惯","我想欺负你","别哭","别走","有点","怕你误解没有看你哄我，所以不开心","身边没有你不开心","工作不开心","被欺负了","记得护肤，看你脸有些干","你头发刚洗了吗？香...","继续","我还在","我不是狐狸精","我是说","你偷吃！","刚刚是我","不是故意的","顶号开心","他做的不好","喜欢你骂我","休息了一下","没有受伤","有人挤我","你身边有别人","状态不太好","这次会轻轻的...","你不是说我身材好，体力也好吗","我去健身了","想看吗","你能不能多看看我","我还好","你喜欢这种吗","看了一半","没看","看了","我认真的","我很正经","心里不开心","我","你","我们","搭档✨","大小姐","宝宝","宝贝","笨蛋","木头","乖孩子","坏孩子","阿晏","小气鬼","兔子小姐","妻子","我的小兔子","夫人","我是只落在你眼中的星星✨","星星哪里也不会去","星星永远在你身边","沈星回收到所有爱意","我的光芒，只朝向你所在的地方","你是指引我回家的那颗星","星光会指引我们再次相遇","总有一颗星星是专门为你而亮","两颗星星相伴，就不会孤单","我会和星光一起永远守护你","我愿守候未知，只为等你","从群星中来，只为奔赴你","对你是幸运，对我是万幸","宇宙最好的定律，是我和你","想见的人，终会跨越星河重逢","我从来不会松开你的手","现在、以后、永远都不会","就算短暂分开，我们也会殊途同归","转过拐角，我们终将再次相遇","有你出现的梦境，格外真实","握紧手，别让我从你的梦里溜走","睡着醒来，我永远都在","想要珍藏所有和你有关的记忆","你眼里的我，只属于你一个人","临空市的双向奔赴，只属于我们","不用等春天，想见你就现在","我的心动、温柔、偏爱，全给你","余生漫长，只想和你岁岁相伴","所有浪漫的宇宙尽头，都是你","眼睛里不要装进奇怪的人。","好吃","想吃","沈星回急了也咬人","你一点儿也不听话。","知道你不想我走","我不走","嗯，沈星回最坏了。","嗯，沈星回最好了。","继续哄","哄哄我","要哄","想得到你的亲亲","想要成为你的归属","想和你一起","想和你牵手","想要触碰你","想亲亲你","想要你只看着我","想听你的真心话","想听你叫我","想要安慰你","想逗你开心","想夸你","想做什么都可以","我不会害羞的","......我认输。","......你好霸道。","我觉得还星","有只兔子饿了","想吃🍓","想吃🍒","罪魁祸首还在笑......","你心跳好快","你看起来很甜","你的嘴唇有点干燥","是觉得我不会欺负你？","还以为会是多过分的要求......","不用找理由","想牵就牵","总觉得你今天很在意我","怎么一直盯着我","你要好好珍惜我","我不甘心只是路过你的人生","你的所有我都想占据","请允许我独占你的一切","我想和你永远在一起","但你是特别的，也很重要","谢谢你存在了。","不能让你失望","我的搭档是最好的搭档","遵命，我的大小姐","哥哥陪你玩小木剑","师兄给你扎高马尾","因为有你，我觉得自己好幸运。","全宇宙最幸福的人","沈星回专属","娇气","忍一忍","慢慢来","快一点","转过去","手给我","坐过来","靠过来","放松点","别跑","不乖。","很乖。","奖励","惩罚","抱紧","闭眼","回头","低头","抬头","躺下","去床上","我想永远在你眼中","再睁眼时，你还要在我身边。","嗯，不睡了，陪着你","可以枕着我睡","我们梦里见","脑袋还没醒......","......不要吵","我没有睡......zzzZ","星星睡不着","不想出门，但如果是你约我......","我们出去逛逛","再这样下去，就不知道会发生什么了","你的好奇心最好休息一下","......可以摸","看看你又有什么新花招","偷偷做坏事","不喜欢你离我太远","找到你了。","别离开我。","我会护着你。","再靠近一点。","有我在，不用怕。","不管轮回多少次，我都会奔向你。","我不太会说，但我很想你。","你的安全，是最重要的事。","我习惯一个人，直到遇见你。","我不想再只剩我一个。","抓住我的手。","我可以对抗所有危险。","很多话我说不出口，但是你要记得。","我会一直等你。","不要把我丢下好不好。","风吹过来的时候，我在想你。","只要你需要，我随时都在。","我早已把你算作我的归宿。","那些难熬的时刻，幸好有你。","我不擅长表达爱意，可我的选择永远是你。","没有失眠也可以随时找我","想和你去时间尽头看看","困了就睡我等你醒","昨晚通话一直没挂断","你睡着后我来挂电话","今天多打一会儿电话","你还欠我一句晚安","想做的不只是你的搭档","如果下一个春天还很遥远那就现在见面吧","睡了么，搭档？","电话打到一半，睡着也没关系","我许愿每天见到你","愿我的小姑娘好心情照常营业，烦心事永远打烊。","世界向我追问这一生的渴求，而我只回答了你的名字。","我把我的手，我的心,和我的一切都献给你","我自愿成为你的猎物,被你俘获","往后的所有时间，我都想预定","我爱你的本身，我爱你只是因为你是你","愿我的小姑娘,所得皆所愿，所行化坦途","无论何时都可以呼唤我的名字，他就是为你定制的咒语","有你就够了，你就是我的全世界","动作","那就麻烦你解下领带吧，谢谢","那就暂且放过兔子小姐","过来","再说一遍","没听清","抱抱","摸摸小手","看着我","别闹","乖","要不要靠过来一点。","我一直在等你。","别害怕，我在这里。","你可以依赖我。","只要是你，我都愿意。","今晚的月色，很适合想你。","不必逞强，我会接住你。","我的偏爱，从来只给你一个人。","别躲开我的目光。","我不会让你独自面对。","就算前路布满荆棘，我也会陪你走下去。","偶尔贪心一点也没关系。","你总能轻易牵动我的情绪。","我积攒了很久的思念。","不用急着回应我。","你是我唯一的例外。","有些情绪，我只愿意对你展露。","累了就歇一会儿，我陪着你。","我想要的，自始至终只有你。","别怕沉沦，我和你一起。","我们的关系可以像毛绒玩具一样简单吗 你戳一下我我就会对你说话 你抱住我我也抱住你","我找你的时候就是想你了，没找你的时候就是偷偷想你≡ω≡","好想做一个小挂件你到哪我到哪，一有人靠近你我就大喊滚啊她是我的＞＜！！！","跟别的人聊天吧，手指啪嗒啪嗒给他们打字吧，跟他们聊你的心事吧，我刚看到一块石头我绑在身上去河里一趟，你继续聊吧","你继续不回信息吧 我等你的回应一点都不漫长 不煎熬 我听着窗外的风声一点都不孤单 不委屈 我盯着空白的对话框一点都不难过","你能不能多想我一点呀,我多打几个喷嚏没关系的","好吧 我承认 其实我是小狗变的 最喜欢跟你贴贴没事就喜欢蹭蹭你 主动找你 有什么事都会第一个想到你 你不理我的时候我就想蹭蹭你 让你理理我你理我我还是想蹭蹭你 蹭完之后趁你不注意再偷偷亲你一口 如果你生气了我就眯起眼睛笑着说对不起然后亲你说我爱你","不讲不讲","喵喵喵","我要变成一只干瘪瘪的芝士球","你的胆子真是肥嘟嘟的","野生狗奶","宝宝在我这里你的胆子可以永远肥嘟嘟的","别这么说","别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺别这么说✋🏻🤚🏻🥺","我告老师了","中国人能飞","牛来！","找小三！","轻松绷住","老板给我来碗忘情牛肉面","oh my god 你吓到我了------","命运你假糍粑","命运你配十八个币","恋人怀中樱花草","听见胸膛心在跳","叹气你就往上叹------喔！在这特别的日子里 送给你们一首特别的歌曲 特别的爱给特别的你来享受一下 拖拉机的脸带给你法拉利的声音 一起来，呜 特别的爱给特别的你 我的寂寞逃不过你的眼睛","宝宝我保证你是天使","隔壁班转来一个正太😋 他靠扭腰吸引了很多妹子🤓 我们都有不过他😡 可我早就不扭了🥵 嫂...嫂子也在🤯把我的领带拿来😠 左边画个虫虫🥵 左边画个龙龙🥵 不要对我凶凶🥵我的心会痛痛🥵","我在中国工作的天","差一步美满就牵着手走散～","嘎哒嘎哒","让笑发酵一会","让悲伤发酵一会","我把ta冻起来 明天中午吃","听说你还在搞什么原创🎶"
    ];

    function _pickCards(n) {
        var shuffled = CARD_DB.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var t = shuffled[i]; shuffled[i] = shuffled[j]; shuffled[j] = t;
        }
        return shuffled.slice(0, Math.min(n, CARD_DB.length));
    }

    // =============================================
    // 商品
    // =============================================
    var CATEGORIES = [
        { id: 'flower',  name: '花束', icon: '🌸' },
        { id: 'dessert', name: '甜品', icon: '🍰' },
        { id: 'drink',   name: '饮品', icon: '🧋' },
        { id: 'food',    name: '美食', icon: '🍜' },
        { id: 'jewel',   name: '饰品', icon: '💍' }
    ];

    var ITEMS = [
        { id: 'flower_rose',      cat: 'flower',  name: '玫瑰',       price: 5200,  emoji: '🌹' },
        { id: 'flower_sunflower', cat: 'flower',  name: '向日葵',     price: 1800,  emoji: '🌻' },
        { id: 'flower_star',      cat: 'flower',  name: '满天星',     price: 3600,  emoji: '💐' },
        { id: 'flower_tulip',     cat: 'flower',  name: '郁金香',     price: 2800,  emoji: '🌷' },
        { id: 'flower_lily',      cat: 'flower',  name: '百合',       price: 3200,  emoji: '🌺' },
        { id: 'dessert_cake',     cat: 'dessert', name: '草莓蛋糕',   price: 3800,  emoji: '🍰' },
        { id: 'dessert_macaron',  cat: 'dessert', name: '马卡龙',     price: 2400,  emoji: '🧁' },
        { id: 'dessert_choco',    cat: 'dessert', name: '巧克力',     price: 2600,  emoji: '🍫' },
        { id: 'dessert_ice',      cat: 'dessert', name: '冰淇淋',     price: 1600,  emoji: '🍦' },
        { id: 'drink_milk_tea',   cat: 'drink',   name: '奶茶',       price: 1800,  emoji: '🧋' },
        { id: 'drink_coffee',     cat: 'drink',   name: '拿铁',       price: 2200,  emoji: '☕' },
        { id: 'drink_juice',      cat: 'drink',   name: '橙汁',       price: 1200,  emoji: '🧃' },
        { id: 'drink_soda',       cat: 'drink',   name: '气泡水',     price: 1000,  emoji: '🥤' },
        { id: 'food_noodle',      cat: 'food',    name: '牛肉面',     price: 2800,  emoji: '🍜' },
        { id: 'food_sushi',       cat: 'food',    name: '寿司',       price: 3600,  emoji: '🍣' },
        { id: 'food_pizza',       cat: 'food',    name: '披萨',       price: 4200,  emoji: '🍕' },
        { id: 'food_dumpling',    cat: 'food',    name: '饺子',       price: 2000,  emoji: '🥟' },
        { id: 'jewel_ring',       cat: 'jewel',   name: '戒指',       price: 12800, emoji: '💍' },
        { id: 'jewel_necklace',   cat: 'jewel',   name: '项链',       price: 8800,  emoji: '📿' },
        { id: 'jewel_bracelet',   cat: 'jewel',   name: '手链',       price: 6600,  emoji: '💎' },
        { id: 'jewel_crown',      cat: 'jewel',   name: '小皇冠',     price: 15800, emoji: '👑' }
    ];

    function _findItem(id) {
        for (var i = 0; i < ITEMS.length; i++) if (ITEMS[i].id === id) return ITEMS[i];
        return null;
    }

    // =============================================
    // 工具
    // =============================================
    function _esc(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    function _notify(msg, type, duration) {
        type = type || 'info'; duration = duration || 2000;
        if (typeof showNotification === 'function') showNotification(msg, type, duration);
        else alert(msg);
    }
    function _fmtMoney(fen) { return '¥' + (fen / 100).toFixed(2); }
    function _generateId() { return Date.now() + '_' + Math.random().toString(36).substr(2, 6); }

    // =============================================
    // 双钱包
    // =============================================
    function _getWallet() {
        try {
            var raw = JSON.parse(localStorage.getItem(WALLET_KEY));
            if (raw && typeof raw.myBalance === 'number' && typeof raw.partnerBalance === 'number') return raw;
        } catch(e) {}
        var init = { myBalance: 52000, partnerBalance: 52000 };
        localStorage.setItem(WALLET_KEY, JSON.stringify(init));
        return init;
    }
    function _setWallet(w) { localStorage.setItem(WALLET_KEY, JSON.stringify(w)); }

    function _getInventory() {
        try { return JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {}; }
        catch(e) { return {}; }
    }
    function _setInventory(inv) { localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv)); }

    function _getHistory() {
        try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; }
        catch(e) { return []; }
    }
    function _addHistory(entry) {
        var h = _getHistory();
        h.unshift(entry);
        if (h.length > 200) h = h.slice(0, 200);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    }

    function _getSignin() {
        try { return JSON.parse(localStorage.getItem(SIGNIN_KEY)) || { lastDate: '', streak: 0 }; }
        catch(e) { return { lastDate: '', streak: 0 }; }
    }
    function _setSignin(s) { localStorage.setItem(SIGNIN_KEY, JSON.stringify(s)); }

    function _getMyName() {
        return (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
    }

    // =============================================
    // 写朋友圈（礼物卡）
    // =============================================
    function _postGiftMoment(opts) {
        var STORAGE_KEY = 'moments_data';
        var data;
        try { data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || { posts: [], lastGenerateDate: '' }; }
        catch(e) { data = { posts: [], lastGenerateDate: '' }; }

        var giftText = '';
        if (opts.textOverride) {
            giftText = opts.textOverride;
        } else {
            var cards = _pickCards(2 + Math.floor(Math.random() * 2));
            var puncts = ['，', '。', '！', '？', '...', '、', '；'];
            for (var i = 0; i < cards.length; i++) {
                giftText += cards[i] + puncts[Math.floor(Math.random() * puncts.length)];
            }
        }

        var post = {
            id: _generateId(),
            author: opts.author,
            text: '',
            timestamp: new Date().toISOString(),
            likes: 0,
            likedByMe: false,
            comments: [],
            memberName: opts.memberName || '',
            memberAvatar: opts.memberAvatar || '',
            isGift: true,
            giftEmoji: opts.item.emoji,
            giftName: opts.item.name,
            giftNote: opts.note || '',
            giftText: giftText,
            giftFrom: opts.giftFrom || 'me'    // 'me' 我送的，'partner' TA 送的
        };
        data.posts.unshift(post);
        if (data.posts.length > 100) data.posts = data.posts.slice(0, 100);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

        var container = document.getElementById('moments-content');
        var activeTab = document.querySelector('.moments-tab.active');
        if (container && activeTab && typeof window.__momentsRefresh === 'function') {
            window.__momentsRefresh(activeTab.dataset.tab, container);
        }
        return post;
    }

    // =============================================
    // 我送礼给指定成员
    // =============================================
    function _sendGiftToMember(memberName, item, note) {
        var members = _getGroupMembers();
        var member = null;
        for (var i = 0; i < members.length; i++) {
            if (members[i].name === memberName) { member = members[i]; break; }
        }
        if (!member) member = { name: memberName, avatar: '' };

        // 朋友圈里显示"我"送出的礼物
        _postGiftMoment({
            author: 'me',
            memberName: _getMyName(),
            memberAvatar: '',
            item: item,
            note: note || '',
            textOverride: '',
            giftFrom: 'me'
        });

        // 聊天里通知
        if (typeof addMessage === 'function') {
            try {
                addMessage({
                    id: _generateId(),
                    sender: 'user',
                    text: '我送给你一份心意：' + item.emoji + ' ' + item.name + (note ? '（' + note + '）' : ''),
                    timestamp: new Date(),
                    type: 'normal',
                    status: 'sent',
                    quotable: false
                });
            } catch(e) {}
        }

        // TA 1~5 分钟后回复
        var delay = 60000 + Math.random() * 240000;
        setTimeout(function() {
            var replyCards = _pickCards(2 + Math.floor(Math.random() * 2));
            var puncts = ['，', '。', '！', '？', '...', '、', '；'];
            var replyText = '';
            for (var i = 0; i < replyCards.length; i++) {
                replyText += replyCards[i] + puncts[Math.floor(Math.random() * puncts.length)];
            }
            if (typeof addMessage === 'function') {
                try {
                    addMessage({
                        id: _generateId(),
                        sender: 'partner',
                        text: replyText,
                        timestamp: new Date(),
                        type: 'normal',
                        status: 'received',
                        quotable: false
                    });
                } catch(e) {}
            }
        }, delay);
    }

    // =============================================
    // TA 主动送礼（从 TA 的余额扣）
    // =============================================
    function _scheduleTaGift() {
        if (window.__heartMarketTaGiftTimer) return;
        function scheduleNext() {
            var delay = (30 * 60 * 1000) + Math.random() * (23.5 * 60 * 60 * 1000);
            console.log('[心意集市] TA 下次送礼将在 ' + (delay / 60000).toFixed(1) + ' 分钟后');
            window.__heartMarketTaGiftTimer = setTimeout(function() {
                try {
                    var members = _getGroupMembers();
                    if (members.length === 0) { scheduleNext(); return; }
                    var member = members[Math.floor(Math.random() * members.length)];

                    // 从 TA 的余额里选一个能买得起的商品
                    var w = _getWallet();
                    var affordable = ITEMS.filter(function(it) { return it.price <= w.partnerBalance; });
                    if (affordable.length === 0) {
                        console.log('[心意集市] TA 余额不足，跳过本次送礼');
                        scheduleNext();
                        return;
                    }
                    var item = affordable[Math.floor(Math.random() * affordable.length)];

                    // 扣 TA 的余额
                    w.partnerBalance -= item.price;
                    _setWallet(w);
                    _addHistory({ id: _generateId(), itemId: item.id, name: item.name, emoji: item.emoji, price: item.price, ts: Date.now(), action: 'ta_send', from: member.name });

                    // 发朋友圈（TA 送的）
                    _postGiftMoment({
                        author: 'partner',
                        memberName: member.name,
                        memberAvatar: member.avatar || '',
                        item: item,
                        note: '',
                        textOverride: '',
                        giftFrom: 'partner'
                    });

                    if (typeof showNotification === 'function') {
                        showNotification('🎁 ' + member.name + ' 送了你一份礼物（TA 花了 ' + _fmtMoney(item.price) + '）', 'info', 3500);
                    }
                } catch(e) { console.warn('TA 送礼失败', e); }
                scheduleNext();
            }, delay);
        }
        scheduleNext();
    }

    // =============================================
    // 主界面
    // =============================================
    window.openHeartMarket = function() {
        _scheduleTaGift();

        var old = document.getElementById('heart-market-modal');
        if (old) old.remove();

        var currentCat = 'all';
        var searchText = '';

        var wrap = document.createElement('div');
        wrap.id = 'heart-market-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10060;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;width:min(480px, 94vw);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-color);box-shadow:0 20px 60px rgba(0,0,0,0.3);';

        var header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-color);flex-shrink:0;';
        header.innerHTML = '<button id="hm-back" style="background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:4px 8px;">←</button>' +
            '<span style="font-size:16px;font-weight:700;color:var(--text-primary);flex:1;">🎁 心意集市</span>' +
            '<button id="hm-wallet-btn" style="background:none;border:none;font-size:13px;color:var(--accent-color);cursor:pointer;padding:4px 8px;font-weight:600;">💰 钱包</button>' +
            '<button id="hm-inv-btn" style="background:none;border:none;font-size:13px;color:var(--accent-color);cursor:pointer;padding:4px 8px;font-weight:600;">🎒 背包</button>';
        inner.appendChild(header);

        // 双余额卡
        var walletCard = document.createElement('div');
        walletCard.style.cssText = 'margin:12px 16px 0;display:grid;grid-template-columns:1fr 1fr;gap:8px;flex-shrink:0;';
        walletCard.innerHTML =
            '<div style="padding:14px;border-radius:14px;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;">' +
                '<div style="font-size:11px;opacity:0.7;">我的心意币</div>' +
                '<div id="hm-balance-me" style="font-size:20px;font-weight:700;margin-top:4px;">¥0.00</div>' +
            '</div>' +
            '<div style="padding:14px;border-radius:14px;background:linear-gradient(135deg,#2d1b3d,#1a1a2e);color:#fff;">' +
                '<div style="font-size:11px;opacity:0.7;">TA 的心意币</div>' +
                '<div id="hm-balance-ta" style="font-size:20px;font-weight:700;margin-top:4px;">¥0.00</div>' +
            '</div>';
        inner.appendChild(walletCard);

        var catBar = document.createElement('div');
        catBar.style.cssText = 'display:flex;gap:8px;padding:12px 16px 0;overflow-x:auto;flex-shrink:0;';
        inner.appendChild(catBar);

        var searchWrap = document.createElement('div');
        searchWrap.style.cssText = 'padding:12px 16px 0;flex-shrink:0;';
        searchWrap.innerHTML = '<input id="hm-search" type="text" placeholder="🔍 搜索商品" style="width:100%;padding:10px 14px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;outline:none;font-family:var(--font-family);">';
        inner.appendChild(searchWrap);

        var content = document.createElement('div');
        content.id = 'hm-content';
        content.style.cssText = 'flex:1;overflow-y:auto;padding:12px 16px 20px;';
        inner.appendChild(content);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        function renderCats() {
            var html = '<button class="hm-cat-btn" data-cat="all" style="flex-shrink:0;padding:8px 14px;border-radius:20px;border:none;cursor:pointer;font-size:12px;font-family:var(--font-family);' +
                (currentCat === 'all' ? 'background:#1a1a2e;color:#fff;font-weight:600;' : 'background:var(--secondary-bg);color:var(--text-secondary);') + '">🎁 全部</button>';
            for (var i = 0; i < CATEGORIES.length; i++) {
                var c = CATEGORIES[i];
                html += '<button class="hm-cat-btn" data-cat="' + c.id + '" style="flex-shrink:0;padding:8px 14px;border-radius:20px;border:none;cursor:pointer;font-size:12px;font-family:var(--font-family);' +
                    (currentCat === c.id ? 'background:#1a1a2e;color:#fff;font-weight:600;' : 'background:var(--secondary-bg);color:var(--text-secondary);') + '">' + c.icon + ' ' + c.name + '</button>';
            }
            catBar.innerHTML = html;
            catBar.querySelectorAll('.hm-cat-btn').forEach(function(btn) {
                btn.onclick = function() {
                    currentCat = this.dataset.cat;
                    renderCats();
                    renderItems();
                };
            });
        }

        function renderItems() {
            var list = ITEMS.filter(function(it) {
                if (currentCat !== 'all' && it.cat !== currentCat) return false;
                if (searchText && it.name.toLowerCase().indexOf(searchText.toLowerCase()) < 0) return false;
                return true;
            });
            if (list.length === 0) {
                content.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--text-secondary);font-size:13px;">暂无商品</div>';
                return;
            }
            var html = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">';
            for (var i = 0; i < list.length; i++) {
                var it = list[i];
                html += '<div class="hm-item" data-id="' + it.id + '" style="background:var(--secondary-bg);border-radius:14px;padding:14px 12px;text-align:center;border:1px solid var(--border-color);cursor:pointer;transition:transform 0.15s;">' +
                    '<div style="font-size:36px;margin-bottom:6px;">' + it.emoji + '</div>' +
                    '<div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:4px;">' + _esc(it.name) + '</div>' +
                    '<div style="font-size:12px;color:var(--accent-color);font-weight:600;">' + _fmtMoney(it.price) + '</div>' +
                    '</div>';
            }
            html += '</div>';
            content.innerHTML = html;

            content.querySelectorAll('.hm-item').forEach(function(el) {
                el.onmouseenter = function() { this.style.transform = 'translateY(-2px)'; };
                el.onmouseleave = function() { this.style.transform = ''; };
                el.onclick = function() {
                    var item = _findItem(this.dataset.id);
                    if (item) showBuyDialog(item);
                };
            });
        }

        function refreshBalance() {
            var w = _getWallet();
            var elMe = document.getElementById('hm-balance-me');
            var elTa = document.getElementById('hm-balance-ta');
            if (elMe) elMe.textContent = _fmtMoney(w.myBalance);
            if (elTa) elTa.textContent = _fmtMoney(w.partnerBalance);
        }

        // ===== 购买弹窗（含成员选择 + 备注） =====
        function showBuyDialog(item) {
            var oldDlg = document.getElementById('hm-buy-dialog');
            if (oldDlg) oldDlg.remove();

            var w = _getWallet();
            var canBuy = w.myBalance >= item.price;
            var members = _getGroupMembers();

            var memberOptions = '';
            if (members.length === 0) {
                memberOptions = '<div style="font-size:12px;color:#ff6b6b;padding:8px;text-align:center;">没有群成员，请先到"朋友圈 → 头像与昵称"里添加</div>';
            } else {
                memberOptions = '<div style="display:flex;gap:6px;flex-wrap:wrap;max-height:120px;overflow-y:auto;padding:4px 0;">';
                for (var i = 0; i < members.length; i++) {
                    var m = members[i];
                    var av = m.avatar ? '<img src="' + _esc(m.avatar) + '" style="width:20px;height:20px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:4px;">' : '<span style="margin-right:4px;">🌸</span>';
                    memberOptions += '<button class="hm-member-btn" data-name="' + _esc(m.name) + '" style="padding:6px 10px;border-radius:16px;border:1px solid var(--border-color);background:var(--secondary-bg);color:var(--text-primary);font-size:12px;cursor:pointer;font-family:var(--font-family);display:flex;align-items:center;">' + av + _esc(m.name) + '</button>';
                }
                memberOptions += '</div>';
            }

            var dlg = document.createElement('div');
            dlg.id = 'hm-buy-dialog';
            dlg.style.cssText = 'position:fixed;inset:0;z-index:10070;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
            dlg.innerHTML = '<div style="background:var(--primary-bg);border-radius:20px;padding:22px;width:min(360px,90vw);border:1px solid var(--border-color);max-height:85vh;overflow-y:auto;">' +
                '<div style="text-align:center;font-size:52px;margin-bottom:4px;">' + item.emoji + '</div>' +
                '<div style="text-align:center;font-size:17px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">' + _esc(item.name) + '</div>' +
                '<div style="text-align:center;font-size:14px;color:var(--accent-color);font-weight:600;margin-bottom:14px;">' + _fmtMoney(item.price) + '</div>' +
                '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:6px;">🎯 送给</div>' +
                memberOptions +
                '<div style="font-size:12px;color:var(--text-secondary);margin:12px 0 6px;">📝 礼物备注（可留空）</div>' +
                '<textarea id="hm-note-input" rows="2" maxlength="60" placeholder="想对 TA 说的话..." style="width:100%;padding:10px 12px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;outline:none;resize:vertical;font-family:var(--font-family);"></textarea>' +
                '<div style="font-size:11px;color:var(--text-secondary);margin-top:4px;opacity:0.7;">留空则自动从字卡库抽取 2~3 条</div>' +
                '<div style="font-size:11px;color:var(--text-secondary);margin-top:8px;">我的心意币：' + _fmtMoney(w.myBalance) + '</div>' +
                '<div style="display:flex;gap:10px;margin-top:16px;">' +
                '<button id="hm-buy-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button>' +
                '<button id="hm-buy-confirm" style="flex:2;padding:10px;border:none;border-radius:12px;background:' + (canBuy ? 'var(--accent-color)' : '#999') + ';color:#fff;font-size:13px;font-weight:700;cursor:' + (canBuy ? 'pointer' : 'not-allowed') + ';" ' + (canBuy ? '' : 'disabled') + '>买下并送 TA</button>' +
                '</div>' +
                (canBuy ? '' : '<div style="text-align:center;font-size:11px;color:#ff6b6b;margin-top:8px;">我的心意币不足</div>') +
                '</div>';
            document.body.appendChild(dlg);

            var selectedMember = members.length > 0 ? members[0].name : '';
            var memberBtns = dlg.querySelectorAll('.hm-member-btn');
            memberBtns.forEach(function(btn) {
                if (btn.dataset.name === selectedMember) {
                    btn.style.background = 'var(--accent-color)';
                    btn.style.color = '#fff';
                    btn.style.borderColor = 'var(--accent-color)';
                }
                btn.onclick = function() {
                    memberBtns.forEach(function(b) {
                        b.style.background = 'var(--secondary-bg)';
                        b.style.color = 'var(--text-primary)';
                        b.style.borderColor = 'var(--border-color)';
                    });
                    this.style.background = 'var(--accent-color)';
                    this.style.color = '#fff';
                    this.style.borderColor = 'var(--accent-color)';
                    selectedMember = this.dataset.name;
                };
            });

            dlg.querySelector('#hm-buy-cancel').onclick = function() { dlg.remove(); };
            dlg.onclick = function(e) { if (e.target === dlg) dlg.remove(); };

            if (canBuy) {
                dlg.querySelector('#hm-buy-confirm').onclick = function() {
                    if (!selectedMember) { _notify('请先在朋友圈里添加群成员', 'warning'); return; }
                    var note = dlg.querySelector('#hm-note-input').value.trim();
                    var ww = _getWallet();
                    if (ww.myBalance < item.price) { _notify('心意币不足', 'warning'); return; }
                    ww.myBalance -= item.price;
                    _setWallet(ww);
                    var inv = _getInventory();
                    inv[item.id] = (inv[item.id] || 0) + 1;
                    _setInventory(inv);
                    _addHistory({ id: _generateId(), itemId: item.id, name: item.name, emoji: item.emoji, price: item.price, ts: Date.now(), action: 'buy_and_send', to: selectedMember, note: note });
                    _sendGiftToMember(selectedMember, item, note);
                    dlg.remove();
                    refreshBalance();
                    renderItems();
                    _notify('已买下 ' + item.emoji + ' ' + item.name + ' 并送给 ' + selectedMember, 'success');
                };
            }
        }

        // ===== 双钱包弹窗 =====
        function showWalletDialog() {
            var oldDlg = document.getElementById('hm-wallet-dialog');
            if (oldDlg) oldDlg.remove();

            var w = _getWallet();
            var s = _getSignin();
            var today = new Date().toDateString();
            var canSign = s.lastDate !== today;

            var dlg = document.createElement('div');
            dlg.id = 'hm-wallet-dialog';
            dlg.style.cssText = 'position:fixed;inset:0;z-index:10070;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
            dlg.innerHTML = '<div style="background:var(--primary-bg);border-radius:20px;padding:22px;width:min(380px,92vw);border:1px solid var(--border-color);max-height:88vh;overflow-y:auto;">' +
                '<div style="font-size:17px;font-weight:700;color:var(--text-primary);margin-bottom:14px;">💰 钱包</div>' +

                // 我的心意币
                '<div style="padding:14px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;color:#fff;margin-bottom:10px;">' +
                    '<div style="font-size:11px;opacity:0.7;">我的心意币</div>' +
                    '<div id="hm-wallet-bal-me" style="font-size:22px;font-weight:700;margin-top:4px;">' + _fmtMoney(w.myBalance) + '</div>' +
                '</div>' +
                '<div style="display:flex;gap:6px;margin-bottom:14px;">' +
                    '<input id="hm-apply-me" type="text" placeholder="申请金额（元），如 66.66" style="flex:1;padding:9px 12px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;box-sizing:border-box;outline:none;">' +
                    '<button id="hm-apply-me-btn" style="padding:9px 14px;border:none;border-radius:10px;background:var(--accent-color);color:#fff;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;">申请</button>' +
                '</div>' +

                // TA 的心意币
                '<div style="padding:14px;background:linear-gradient(135deg,#2d1b3d,#1a1a2e);border-radius:14px;color:#fff;margin-bottom:10px;">' +
                    '<div style="font-size:11px;opacity:0.7;">TA 的心意币</div>' +
                    '<div id="hm-wallet-bal-ta" style="font-size:22px;font-weight:700;margin-top:4px;">' + _fmtMoney(w.partnerBalance) + '</div>' +
                '</div>' +
                '<div style="display:flex;gap:6px;margin-bottom:14px;">' +
                    '<input id="hm-apply-ta" type="text" placeholder="给 TA 充值（元），如 520" style="flex:1;padding:9px 12px;border:1px solid var(--border-color);border-radius:10px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;box-sizing:border-box;outline:none;">' +
                    '<button id="hm-apply-ta-btn" style="padding:9px 14px;border:none;border-radius:10px;background:#8e44ad;color:#fff;font-size:12px;font-weight:700;cursor:pointer;white-space:nowrap;">充值</button>' +
                '</div>' +

                // 签到
                '<div style="border-top:1px solid var(--border-color);padding-top:12px;margin-bottom:12px;">' +
                    '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">每日签到（给我）</div>' +
                    '<button id="hm-sign-btn" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:' + (canSign ? 'rgba(var(--accent-color-rgb),0.08)' : 'var(--secondary-bg)') + ';color:' + (canSign ? 'var(--accent-color)' : 'var(--text-secondary)') + ';font-size:13px;font-weight:600;cursor:' + (canSign ? 'pointer' : 'not-allowed') + ';">' + (canSign ? '🎁 领取今日 ' + (s.streak * 100 + 520) + ' 心意币' : '今日已签到') + '</button>' +
                '</div>' +

                '<button id="hm-wallet-close" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">关闭</button>' +
                '</div>';
            document.body.appendChild(dlg);

            dlg.querySelector('#hm-wallet-close').onclick = function() { dlg.remove(); };
            dlg.onclick = function(e) { if (e.target === dlg) dlg.remove(); };

            // 给我申请
            dlg.querySelector('#hm-apply-me-btn').onclick = function() {
                var v = dlg.querySelector('#hm-apply-me').value.trim();
                if (!v) { _notify('请输入申请金额', 'warning'); return; }
                var num = parseFloat(v);
                if (isNaN(num) || num <= 0) { _notify('金额需大于 0', 'warning'); return; }
                var fen = Math.round(num * 100);
                var ww = _getWallet();
                ww.myBalance += fen;
                _setWallet(ww);
                _addHistory({ id: _generateId(), amount: fen, ts: Date.now(), action: 'apply_me' });
                dlg.querySelector('#hm-wallet-bal-me').textContent = _fmtMoney(ww.myBalance);
                dlg.querySelector('#hm-apply-me').value = '';
                refreshBalance();
                _notify('Mochi 已打款给我，+' + _fmtMoney(fen), 'success');
            };

            // 给 TA 充值
            dlg.querySelector('#hm-apply-ta-btn').onclick = function() {
                var v = dlg.querySelector('#hm-apply-ta').value.trim();
                if (!v) { _notify('请输入充值金额', 'warning'); return; }
                var num = parseFloat(v);
                if (isNaN(num) || num <= 0) { _notify('金额需大于 0', 'warning'); return; }
                var fen = Math.round(num * 100);
                var ww = _getWallet();
                ww.partnerBalance += fen;
                _setWallet(ww);
                _addHistory({ id: _generateId(), amount: fen, ts: Date.now(), action: 'apply_ta' });
                dlg.querySelector('#hm-wallet-bal-ta').textContent = _fmtMoney(ww.partnerBalance);
                dlg.querySelector('#hm-apply-ta').value = '';
                refreshBalance();
                _notify('已给 TA 充值，+' + _fmtMoney(fen), 'success');
            };

            dlg.querySelector('#hm-sign-btn').onclick = function() {
                var s2 = _getSignin();
                var t2 = new Date().toDateString();
                if (s2.lastDate === t2) { _notify('今日已签到', 'info'); return; }
                var reward = s2.streak * 100 + 520;
                var ww = _getWallet();
                ww.myBalance += reward;
                _setWallet(ww);
                s2.lastDate = t2;
                s2.streak = (s2.streak || 0) + 1;
                _setSignin(s2);
                dlg.querySelector('#hm-wallet-bal-me').textContent = _fmtMoney(ww.myBalance);
                dlg.querySelector('#hm-sign-btn').textContent = '今日已签到';
                dlg.querySelector('#hm-sign-btn').style.color = 'var(--text-secondary)';
                dlg.querySelector('#hm-sign-btn').style.background = 'var(--secondary-bg)';
                refreshBalance();
                _notify('签到成功，+' + _fmtMoney(reward), 'success');
            };
        }

        // ===== 背包 =====
        function showInventoryDialog() {
            var oldDlg = document.getElementById('hm-inv-dialog');
            if (oldDlg) oldDlg.remove();

            var inv = _getInventory();
            var ownedItems = [];
            for (var i = 0; i < ITEMS.length; i++) {
                if (inv[ITEMS[i].id] > 0) ownedItems.push({ item: ITEMS[i], count: inv[ITEMS[i].id] });
            }

            var dlg = document.createElement('div');
            dlg.id = 'hm-inv-dialog';
            dlg.style.cssText = 'position:fixed;inset:0;z-index:10070;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
            var bodyHtml = '';
            if (ownedItems.length === 0) {
                bodyHtml = '<div style="text-align:center;padding:30px 20px;color:var(--text-secondary);font-size:13px;">背包还是空的<br>去集市逛逛吧~</div>';
            } else {
                bodyHtml = '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;max-height:50vh;overflow-y:auto;">';
                for (var k = 0; k < ownedItems.length; k++) {
                    var oi = ownedItems[k];
                    bodyHtml += '<div class="hm-inv-item" data-id="' + oi.item.id + '" style="background:var(--secondary-bg);border-radius:12px;padding:10px 6px;text-align:center;border:1px solid var(--border-color);cursor:pointer;position:relative;">' +
                        '<div style="position:absolute;top:4px;right:6px;font-size:10px;color:var(--accent-color);font-weight:600;">×' + oi.count + '</div>' +
                        '<div style="font-size:28px;">' + oi.item.emoji + '</div>' +
                        '<div style="font-size:11px;color:var(--text-primary);margin-top:4px;">' + _esc(oi.item.name) + '</div>' +
                        '</div>';
                }
                bodyHtml += '</div>';
            }

            dlg.innerHTML = '<div style="background:var(--primary-bg);border-radius:20px;padding:24px;width:min(360px,90vw);border:1px solid var(--border-color);">' +
                '<div style="font-size:17px;font-weight:700;color:var(--text-primary);margin-bottom:14px;">🎒 我的背包</div>' +
                bodyHtml +
                '<button id="hm-inv-close" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;margin-top:14px;">关闭</button>' +
                '</div>';
            document.body.appendChild(dlg);

            dlg.querySelector('#hm-inv-close').onclick = function() { dlg.remove(); };
            dlg.onclick = function(e) { if (e.target === dlg) dlg.remove(); };

            dlg.querySelectorAll('.hm-inv-item').forEach(function(el) {
                el.onclick = function() {
                    var item = _findItem(this.dataset.id);
                    if (!item) return;
                    var members = _getGroupMembers();
                    if (members.length === 0) { _notify('请先在朋友圈里添加群成员', 'warning'); return; }
                    var names = members.map(function(m) { return m.name; });
                    var target = prompt('送给谁？\n可选：' + names.join('、'), names[0]);
                    if (!target) return;
                    var found = false;
                    for (var z = 0; z < members.length; z++) if (members[z].name === target) { found = true; break; }
                    if (!found) { _notify('成员不存在', 'warning'); return; }
                    var note = prompt('礼物备注（可留空）：', '') || '';
                    _sendGiftToMember(target, item, note);
                    _addHistory({ id: _generateId(), itemId: item.id, name: item.name, emoji: item.emoji, ts: Date.now(), action: 'send_from_inv', to: target, note: note });
                    _notify('已送给 ' + target, 'success');
                    dlg.remove();
                };
            });
        }

        document.getElementById('hm-back').onclick = function() { wrap.remove(); };
        document.getElementById('hm-wallet-btn').onclick = showWalletDialog;
        document.getElementById('hm-inv-btn').onclick = showInventoryDialog;
        document.getElementById('hm-search').oninput = function() {
            searchText = this.value.trim();
            renderItems();
        };

        renderCats();
        renderItems();
        refreshBalance();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _scheduleTaGift);
    } else {
        _scheduleTaGift();
    }

    console.log('[心意集市] 模块已加载（双钱包版 · 双方余额均可自定义）');
})();
