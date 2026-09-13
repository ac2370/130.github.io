(function migrateOldGiftToHistory() {
    var data = JSON.parse(localStorage.getItem('moments_data') || '{}');
    var posts = (data.posts || []).filter(function(p) { return p.isGift === true; });
    if (posts.length === 0) { alert('没有旧礼物记录'); return; }
    var history = JSON.parse(localStorage.getItem('heart_market_history') || '[]');
    var myName = localStorage.getItem('moments_my_name') || '我';
    var migrated = 0;
    posts.forEach(function(p) {
        var isReceive = (p.giftFrom === 'partner');
        history.push({
            id: 'migrated_' + Date.now() + '_' + Math.random(),
            itemId: 'old_' + p.id,
            name: p.giftName || '礼物',
            emoji: p.giftEmoji || '',
            image: p.giftImage || '',
            price: 0,
            note: p.giftNote || p.giftText || '',
            from: isReceive ? (p.memberName || '群成员') : myName,
            to: isReceive ? myName : (p.giftTo || p.memberName || '群成员'),
            ts: new Date(p.timestamp).getTime(),
            action: isReceive ? 'receive' : 'send'
        });
        migrated++;
    });
    localStorage.setItem('heart_market_history', JSON.stringify(history));
    alert('已迁移 ' + migrated + ' 条旧记录到心意记录，刷新看看');
})();
