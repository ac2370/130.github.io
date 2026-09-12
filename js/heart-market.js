// heart-market.js - 心意集市（独立版）
// 依赖：无（使用 localStorage + 原生 DOM）
// 暴露：window.openHeartMarket()
(function() {
    'use strict';

    // =============================================
    // 存储 key
    // =============================================
    var WALLET_KEY = 'heart_market_wallet';       // { balance: 分 }
    var INVENTORY_KEY = 'heart_market_inventory'; // { itemId: count }
    var HISTORY_KEY = 'heart_market_history';     // [ {itemId, ts, action} ]
    var SIGNIN_KEY = 'heart_market_signin';       // { lastDate, streak }

    // =============================================
    // 商品数据
    // =============================================
    var CATEGORIES = [
        { id: 'flower',  name: '花束', icon: '🌸' },
        { id: 'dessert', name: '甜品', icon: '🍰' },
        { id: 'drink',   name: '饮品', icon: '🧋' },
        { id: 'food',    name: '美食', icon: '🍜' },
        { id: 'jewel',   name: '饰品', icon: '💍' }
    ];

    var ITEMS = [
        // 花束
        { id: 'flower_rose',      cat: 'flower',  name: '玫瑰',       price: 5200,  emoji: '🌹' },
        { id: 'flower_sunflower', cat: 'flower',  name: '向日葵',     price: 1800,  emoji: '🌻' },
        { id: 'flower_star',      cat: 'flower',  name: '满天星',     price: 3600,  emoji: '💐' },
        { id: 'flower_tulip',     cat: 'flower',  name: '郁金香',     price: 2800,  emoji: '🌷' },
        { id: 'flower_lily',      cat: 'flower',  name: '百合',       price: 3200,  emoji: '🌺' },
        // 甜品
        { id: 'dessert_cake',     cat: 'dessert', name: '草莓蛋糕',   price: 3800,  emoji: '🍰' },
        { id: 'dessert_macaron',  cat: 'dessert', name: '马卡龙',     price: 2400,  emoji: '🧁' },
        { id: 'dessert_choco',    cat: 'dessert', name: '巧克力',     price: 2600,  emoji: '🍫' },
        { id: 'dessert_ice',      cat: 'dessert', name: '冰淇淋',     price: 1600,  emoji: '🍦' },
        // 饮品
        { id: 'drink_milk_tea',   cat: 'drink',   name: '奶茶',       price: 1800,  emoji: '🧋' },
        { id: 'drink_coffee',     cat: 'drink',   name: '拿铁',       price: 2200,  emoji: '☕' },
        { id: 'drink_juice',      cat: 'drink',   name: '橙汁',       price: 1200,  emoji: '🧃' },
        { id: 'drink_soda',       cat: 'drink',   name: '气泡水',     price: 1000,  emoji: '🥤' },
        // 美食
        { id: 'food_noodle',      cat: 'food',    name: '牛肉面',     price: 2800,  emoji: '🍜' },
        { id: 'food_sushi',       cat: 'food',    name: '寿司',       price: 3600,  emoji: '🍣' },
        { id: 'food_pizza',       cat: 'food',    name: '披萨',       price: 4200,  emoji: '🍕' },
        { id: 'food_dumpling',    cat: 'food',    name: '饺子',       price: 2000,  emoji: '🥟' },
        // 饰品
        { id: 'jewel_ring',       cat: 'jewel',   name: '戒指',       price: 12800, emoji: '💍' },
        { id: 'jewel_necklace',   cat: 'jewel',   name: '项链',       price: 8800,  emoji: '📿' },
        { id: 'jewel_bracelet',   cat: 'jewel',   name: '手链',       price: 6600,  emoji: '💎' },
        { id: 'jewel_crown',      cat: 'jewel',   name: '小皇冠',     price: 15800, emoji: '👑' }
    ];

    // =============================================
    // 工具函数
    // =============================================
    function _esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
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

    function _getWallet() {
        try {
            var raw = JSON.parse(localStorage.getItem(WALLET_KEY));
            if (raw && typeof raw.balance === 'number') return raw;
        } catch(e) {}
        // 首次进入默认赠送 520 心意币
        var init = { balance: 52000 };
        localStorage.setItem(WALLET_KEY, JSON.stringify(init));
        return init;
    }

    function _setWallet(w) {
        localStorage.setItem(WALLET_KEY, JSON.stringify(w));
    }

    function _getInventory() {
        try {
            return JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {};
        } catch(e) { return {}; }
    }

    function _setInventory(inv) {
        localStorage.setItem(INVENTORY_KEY, JSON.stringify(inv));
    }

    function _getHistory() {
        try {
            return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
        } catch(e) { return []; }
    }

    function _addHistory(entry) {
        var h = _getHistory();
        h.unshift(entry);
        if (h.length > 200) h = h.slice(0, 200);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
    }

    function _getSignin() {
        try {
            return JSON.parse(localStorage.getItem(SIGNIN_KEY)) || { lastDate: '', streak: 0 };
        } catch(e) { return { lastDate: '', streak: 0 }; }
    }

    function _setSignin(s) {
        localStorage.setItem(SIGNIN_KEY, JSON.stringify(s));
    }

    function _getPartnerName() {
        return (typeof settings !== 'undefined' && settings.partnerName) ? settings.partnerName : '梦角';
    }

    function _getMyName() {
        return (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
    }

    function _fmtMoney(fen) {
        return '¥' + (fen / 100).toFixed(2);
    }

    function _generateId() {
        return Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    }

    // =============================================
    // 送礼：调用聊天系统
    // =============================================
    function _sendGiftToPartner(item) {
        var pName = _getPartnerName();
        var text = '我送给你一份心意：' + item.emoji + ' ' + item.name + ' 🎁';
        if (typeof addMessage === 'function') {
            try {
                addMessage({
                    id: _generateId(),
                    sender: 'user',
                    text: text,
                    timestamp: new Date(),
                    type: 'normal',
                    status: 'sent',
                    quotable: false
                });
            } catch(e) { console.warn('addMessage 失败', e); }
        } else {
            console.warn('[心意集市] addMessage 未定义，仅记录礼物');
        }
        // 1~3 分钟后梦角回复
        var delay = 60000 + Math.random() * 120000;
        setTimeout(function() {
            var cards = [
                '谢谢你的礼物，我很喜欢。',
                '收到啦，你总是这么用心。',
                '这份心意，我收下了。',
                '你送的东西，我都喜欢。',
                '谢谢你，我很开心。',
                '有心了，我会好好收着。'
            ];
            var reply = cards[Math.floor(Math.random() * cards.length)];
            if (typeof addMessage === 'function') {
                try {
                    addMessage({
                        id: _generateId(),
                        sender: 'partner',
                        text: reply,
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
    // 主界面
    // =============================================
    window.openHeartMarket = function() {
        var old = document.getElementById('heart-market-modal');
        if (old) old.remove();

        var currentCat = 'all';
        var searchText = '';

        var wrap = document.createElement('div');
        wrap.id = 'heart-market-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10060;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;width:min(480px, 94vw);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-color);box-shadow:0 20px 60px rgba(0,0,0,0.3);';

        // ===== 顶部标题栏 =====
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-color);flex-shrink:0;';
        header.innerHTML = '<button id="hm-back" style="background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:4px 8px;">←</button>' +
            '<span style="font-size:16px;font-weight:700;color:var(--text-primary);flex:1;">🎁 心意集市</span>' +
            '<button id="hm-wallet-btn" style="background:none;border:none;font-size:13px;color:var(--accent-color);cursor:pointer;padding:4px 8px;font-weight:600;">💰 钱包</button>' +
            '<button id="hm-inv-btn" style="background:none;border:none;font-size:13px;color:var(--accent-color);cursor:pointer;padding:4px 8px;font-weight:600;">🎒 背包</button>';
        inner.appendChild(header);

        // ===== 心意币余额卡 =====
        var walletCard = document.createElement('div');
        walletCard.style.cssText = 'margin:12px 16px 0;padding:16px;border-radius:16px;background:linear-gradient(135deg,#1a1a2e,#16213e);color:#fff;flex-shrink:0;position:relative;overflow:hidden;';
        walletCard.innerHTML = '<div style="font-size:11px;opacity:0.7;letter-spacing:1px;">心意币余额</div>' +
            '<div id="hm-balance" style="font-size:26px;font-weight:700;margin-top:4px;letter-spacing:1px;">¥0.00</div>' +
            '<div style="font-size:11px;opacity:0.6;margin-top:6px;">每一份心意，都会跨越两个世界抵达</div>';
        inner.appendChild(walletCard);

        // ===== 分类 tab =====
        var catBar = document.createElement('div');
        catBar.style.cssText = 'display:flex;gap:8px;padding:12px 16px 0;overflow-x:auto;flex-shrink:0;';
        inner.appendChild(catBar);

        // ===== 搜索框 =====
        var searchWrap = document.createElement('div');
        searchWrap.style.cssText = 'padding:12px 16px 0;flex-shrink:0;';
        searchWrap.innerHTML = '<input id="hm-search" type="text" placeholder="🔍 搜索商品" style="width:100%;padding:10px 14px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;outline:none;font-family:var(--font-family);">';
        inner.appendChild(searchWrap);

        // ===== 商品列表 =====
        var content = document.createElement('div');
        content.id = 'hm-content';
        content.style.cssText = 'flex:1;overflow-y:auto;padding:12px 16px 20px;';
        inner.appendChild(content);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        // ===== 渲染分类 =====
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

        // ===== 渲染商品 =====
        function renderItems() {
            var inv = _getInventory();
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
                var owned = inv[it.id] || 0;
                html += '<div class="hm-item" data-id="' + it.id + '" style="background:var(--secondary-bg);border-radius:14px;padding:14px 12px;text-align:center;border:1px solid var(--border-color);cursor:pointer;position:relative;transition:transform 0.15s;">' +
                    (owned > 0 ? '<div style="position:absolute;top:6px;right:8px;background:var(--accent-color);color:#fff;font-size:10px;padding:2px 6px;border-radius:8px;">×' + owned + '</div>' : '') +
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
                    var itemId = this.dataset.id;
                    var item = null;
                    for (var k = 0; k < ITEMS.length; k++) {
                        if (ITEMS[k].id === itemId) { item = ITEMS[k]; break; }
                    }
                    if (item) showBuyDialog(item);
                };
            });
        }

        function refreshBalance() {
            var w = _getWallet();
            var el = document.getElementById('hm-balance');
            if (el) el.textContent = _fmtMoney(w.balance);
        }

        // ===== 购买弹窗 =====
        function showBuyDialog(item) {
            var oldDlg = document.getElementById('hm-buy-dialog');
            if (oldDlg) oldDlg.remove();

            var w = _getWallet();
            var canBuy = w.balance >= item.price;

            var dlg = document.createElement('div');
            dlg.id = 'hm-buy-dialog';
            dlg.style.cssText = 'position:fixed;inset:0;z-index:10070;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';
            dlg.innerHTML = '<div style="background:var(--primary-bg);border-radius:20px;padding:24px;width:min(340px,88vw);border:1px solid var(--border-color);text-align:center;">' +
                '<div style="font-size:56px;margin-bottom:8px;">' + item.emoji + '</div>' +
                '<div style="font-size:17px;font-weight:700;color:var(--text-primary);margin-bottom:4px;">' + _esc(item.name) + '</div>' +
                '<div style="font-size:14px;color:var(--accent-color);font-weight:600;margin-bottom:16px;">' + _fmtMoney(item.price) + '</div>' +
                '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:16px;">余额 ' + _fmtMoney(w.balance) + '</div>' +
                '<div style="display:flex;gap:10px;">' +
                '<button id="hm-buy-cancel" style="flex:1;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">取消</button>' +
                '<button id="hm-buy-confirm" style="flex:2;padding:10px;border:none;border-radius:12px;background:' + (canBuy ? 'var(--accent-color)' : '#999') + ';color:#fff;font-size:13px;font-weight:700;cursor:' + (canBuy ? 'pointer' : 'not-allowed') + ';" ' + (canBuy ? '' : 'disabled') + '>买下并送 TA</button>' +
                '</div>' +
                (canBuy ? '' : '<div style="font-size:11px;color:#ff6b6b;margin-top:8px;">心意币不足，去钱包申请吧</div>') +
                '</div>';
            document.body.appendChild(dlg);

            dlg.querySelector('#hm-buy-cancel').onclick = function() { dlg.remove(); };
            dlg.onclick = function(e) { if (e.target === dlg) dlg.remove(); };
            if (canBuy) {
                dlg.querySelector('#hm-buy-confirm').onclick = function() {
                    var ww = _getWallet();
                    if (ww.balance < item.price) {
                        _notify('心意币不足', 'warning');
                        return;
                    }
                    ww.balance -= item.price;
                    _setWallet(ww);
                    var inv = _getInventory();
                    inv[item.id] = (inv[item.id] || 0) + 1;
                    _setInventory(inv);
                    _addHistory({ id: _generateId(), itemId: item.id, name: item.name, emoji: item.emoji, price: item.price, ts: Date.now(), action: 'buy_and_send' });
                    _sendGiftToPartner(item);
                    dlg.remove();
                    refreshBalance();
                    renderItems();
                    _notify('已买下 ' + item.emoji + ' ' + item.name + ' 并送给 TA', 'success');
                };
            }
        }

        // ===== 钱包弹窗（申请心意币）=====
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
            dlg.innerHTML = '<div style="background:var(--primary-bg);border-radius:20px;padding:24px;width:min(360px,90vw);border:1px solid var(--border-color);">' +
                '<div style="font-size:17px;font-weight:700;color:var(--text-primary);margin-bottom:14px;">💰 钱包</div>' +
                '<div style="padding:14px;background:linear-gradient(135deg,#1a1a2e,#16213e);border-radius:14px;color:#fff;margin-bottom:14px;">' +
                    '<div style="font-size:11px;opacity:0.7;">当前余额</div>' +
                    '<div id="hm-wallet-bal" style="font-size:24px;font-weight:700;margin-top:4px;">' + _fmtMoney(w.balance) + '</div>' +
                '</div>' +
                '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">向 Mochi 申请心意币（打款到账）</div>' +
                '<input id="hm-apply-input" type="text" placeholder="输入金额（元），如 66.66" style="width:100%;padding:10px 14px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;outline:none;margin-bottom:12px;">' +
                '<button id="hm-apply-btn" style="width:100%;padding:11px;border:none;border-radius:12px;background:var(--accent-color);color:#fff;font-size:13px;font-weight:700;cursor:pointer;margin-bottom:10px;">✨ 申请</button>' +
                '<div style="border-top:1px solid var(--border-color);padding-top:12px;margin-bottom:12px;">' +
                    '<div style="font-size:12px;color:var(--text-secondary);margin-bottom:8px;">每日签到</div>' +
                    '<button id="hm-sign-btn" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:' + (canSign ? 'rgba(var(--accent-color-rgb),0.08)' : 'var(--secondary-bg)') + ';color:' + (canSign ? 'var(--accent-color)' : 'var(--text-secondary)') + ';font-size:13px;font-weight:600;cursor:' + (canSign ? 'pointer' : 'not-allowed') + ';">' + (canSign ? '🎁 领取今日 ' + (s.streak * 100 + 520) + ' 心意币' : '今日已签到') + '</button>' +
                '</div>' +
                '<button id="hm-wallet-close" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;">关闭</button>' +
                '</div>';
            document.body.appendChild(dlg);

            dlg.querySelector('#hm-wallet-close').onclick = function() { dlg.remove(); };
            dlg.onclick = function(e) { if (e.target === dlg) dlg.remove(); };

            dlg.querySelector('#hm-apply-btn').onclick = function() {
                var v = dlg.querySelector('#hm-apply-input').value.trim();
                if (!v) { _notify('请输入申请金额', 'warning'); return; }
                var num = parseFloat(v);
                if (isNaN(num) || num <= 0) { _notify('申请金额需大于 0', 'warning'); return; }
                var fen = Math.round(num * 100);
                var ww = _getWallet();
                ww.balance += fen;
                _setWallet(ww);
                _addHistory({ id: _generateId(), amount: fen, ts: Date.now(), action: 'apply' });
                dlg.querySelector('#hm-wallet-bal').textContent = _fmtMoney(ww.balance);
                dlg.querySelector('#hm-apply-input').value = '';
                refreshBalance();
                _notify('Mochi 已打款，+' + _fmtMoney(fen), 'success');
            };

            dlg.querySelector('#hm-sign-btn').onclick = function() {
                var s2 = _getSignin();
                var t2 = new Date().toDateString();
                if (s2.lastDate === t2) { _notify('今日已签到', 'info'); return; }
                var reward = s2.streak * 100 + 520;
                var ww = _getWallet();
                ww.balance += reward;
                _setWallet(ww);
                s2.lastDate = t2;
                s2.streak = (s2.streak || 0) + 1;
                _setSignin(s2);
                dlg.querySelector('#hm-wallet-bal').textContent = _fmtMoney(ww.balance);
                dlg.querySelector('#hm-sign-btn').textContent = '今日已签到';
                dlg.querySelector('#hm-sign-btn').style.color = 'var(--text-secondary)';
                dlg.querySelector('#hm-sign-btn').style.background = 'var(--secondary-bg)';
                refreshBalance();
                _notify('签到成功，+' + _fmtMoney(reward), 'success');
            };
        }

        // ===== 背包弹窗 =====
        function showInventoryDialog() {
            var oldDlg = document.getElementById('hm-inv-dialog');
            if (oldDlg) oldDlg.remove();

            var inv = _getInventory();
            var ownedItems = [];
            for (var i = 0; i < ITEMS.length; i++) {
                if (inv[ITEMS[i].id] > 0) {
                    ownedItems.push({ item: ITEMS[i], count: inv[ITEMS[i].id] });
                }
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
                    var itemId = this.dataset.id;
                    var item = null;
                    for (var m = 0; m < ITEMS.length; m++) {
                        if (ITEMS[m].id === itemId) { item = ITEMS[m]; break; }
                    }
                    if (!item) return;
                    if (!confirm('把 ' + item.emoji + ' ' + item.name + ' 送给 TA？')) return;
                    _sendGiftToPartner(item);
                    _addHistory({ id: _generateId(), itemId: item.id, name: item.name, emoji: item.emoji, ts: Date.now(), action: 'send_from_inv' });
                    _notify('已送出 ' + item.emoji + ' ' + item.name, 'success');
                    dlg.remove();
                };
            });
        }

        // ===== 事件绑定 =====
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

    console.log('[心意集市] 模块已加载');
})();
