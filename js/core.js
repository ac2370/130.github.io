window.switchActiveContact = async function(nextRole, nextName) {
    if (typeof window.saveData === 'function') {
        try { await window.saveData(); } catch (e) { console.warn('[switchActiveContact] 保存旧角色失败:', e); }
    }
    // 【千万不要清 _pendingReplyTimer】让旧角色的异步回复继续跑

    SESSION_ID = nextRole;
    window.currentContactId = nextRole;
    localStorage.setItem('active_contact_role', nextRole);
    await localforage.setItem(`${APP_PREFIX}lastSessionId`, nextRole);

    if (typeof DOMElements !== 'undefined' && DOMElements.chatContainer) {
        DOMElements.chatContainer.innerHTML = '';
    }
    messages = [];
    window.messages = [];
    customReplies = [];
    window.customReplies = [];
    window._customReplies = [];
    window.customReplyGroups = [];
    customEmojis = [];
    stickerLibrary = [];
    myStickerLibrary = [];

    msgViewMode = 'latest';
    msgWinStart = 0;
    msgWinEnd = 0;
    newMsgCountWhileBrowsing = 0;

    const tiWrapper = document.getElementById('typing-indicator-wrapper');
    if (tiWrapper) tiWrapper.style.display = 'none';

    if (typeof window.loadData === 'function') {
        await window.loadData();
    }

    const nameEl = document.getElementById('partner-name');
    if (nameEl && window.settings) {
        if (!window.settings.partnerName || window.settings.partnerName === '梦角') {
            nameEl.textContent = nextName;
            window.settings.partnerName = nextName;
        }
    }

    if (typeof showNotification === 'function') {
        showNotification(`已切换至 ${nextName} ✦`, 'success', 1500);
    }
};

// ============================================================
// 【补回】initializeSession（如果原来有，直接粘贴覆盖也行）
// ============================================================
async function migrateData() {
    const isMigrated = await localforage.getItem(APP_PREFIX + 'MIGRATION_V2_DONE');
    if (isMigrated) return;

    try {
        const keys = Object.keys(localStorage);
        for (const key of keys) {
            if (key.startsWith(APP_PREFIX)) {
                try {
                    const val = localStorage.getItem(key);
                    if (val) {
                        let dataToStore = val;
                        try {
                            if (val.startsWith('{') || val.startsWith('[')) {
                                dataToStore = JSON.parse(val);
                            }
                        } catch (e) {
                            console.warn(`迁移期间解析数据失败: ${key}，将作为原始字符串存储。`, e);
                        }
                        await localforage.setItem(key, dataToStore);
                    }
                } catch (e) {
                    console.error(`迁移键值 ${key} 时发生错误，已跳过。`, e);
                }
            }
        }
        await localforage.setItem(APP_PREFIX + 'MIGRATION_V2_DONE', 'true');
    } catch (e) {
        console.error("数据迁移过程中发生严重错误:", e);
        showNotification('数据迁移失败，部分旧数据可能丢失', 'error');
    }
}

window.initializeSession = async function() {
    await migrateData();

    const sessionsData = await localforage.getItem(`${APP_PREFIX}sessionList`);
    sessionList = sessionsData || [];

    let savedRole = localStorage.getItem('active_contact_role');

    if (savedRole) {
        SESSION_ID = savedRole;
    } else {
        if (sessionList.length > 0) {
            const lastId = await localforage.getItem(`${APP_PREFIX}lastSessionId`);
            SESSION_ID = lastId && sessionList.some(s => s.id === lastId) ? lastId : sessionList[0].id;
        } else {
            SESSION_ID = await createNewSession(false);
        }
        localStorage.setItem('active_contact_role', 'role_A');
    }

    window.currentContactId = SESSION_ID;
    await localforage.setItem(`${APP_PREFIX}lastSessionId`, SESSION_ID);

    if (window.location.search.includes('role=')) {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }
};


// ============================================================
// 【补回】_triggerDelayedReply
// ============================================================
window._triggerDelayedReply = function(isUserMessage) {
    if (isBatchMode) return false;
    if (isUserMessage) window._companionSilentTrigger = false;

    const originContactId = window.SESSION_ID;
    const originSettings = JSON.parse(JSON.stringify(settings));

    const delayRange = originSettings.replyDelayMax - originSettings.replyDelayMin;
    const randomDelay = originSettings.replyDelayMin + Math.random() * delayRange;
    const chance = Math.max(0, Math.min(1, Number(originSettings.readNoReplyChance) || 0));
    const shouldIgnore = originSettings.allowReadNoReply && (Math.random() < chance);

    if (isUserMessage) {
        const readDelay = 1500 + Math.random() * 2500;
        setTimeout(() => {
            if (window.SESSION_ID !== originContactId) return;
            let changed = false;
            messages.forEach(msg => {
                if (msg.sender === 'user' && msg.status !== 'read') { msg.status = 'read'; changed = true; }
            });
            if (changed) { _updateReadReceiptsDOM(); throttledSaveData(); }
        }, readDelay);
    }

    if (window._pendingReplyTimer) clearTimeout(window._pendingReplyTimer);
    window._pendingReplyTimer = null;
    if (shouldIgnore) return false;

    if (originContactId === window.SESSION_ID && originSettings.typingIndicatorEnabled) {
        const tiWrapper = document.getElementById('typing-indicator-wrapper');
        const tiLabel = document.getElementById('typing-indicator-label');
        const tiAvatar = document.getElementById('typing-indicator-avatar');
        if (tiLabel) tiLabel.textContent = (originSettings.partnerName || '对方') + ' 正在输入';
        if (tiWrapper) { positionTypingIndicator(); tiWrapper.style.display = 'block'; }
        if (tiAvatar) {
            const partnerImg = DOMElements.partner.avatar.querySelector('img');
            tiAvatar.innerHTML = partnerImg ? `<img src="${partnerImg.src}">` : '<i class="fas fa-user"></i>';
        }
        if (_isCaughtUpToLatest() && DOMElements.chatContainer) DOMElements.chatContainer.scrollTop = DOMElements.chatContainer.scrollHeight;
    }

    window._pendingReplyTimer = setTimeout(() => {
        window._pendingReplyTimer = null;
        simulateReply(originContactId, originSettings);
        setTimeout(() => { window._companionSilentTrigger = false; }, (originSettings.replyDelayMax || 3000) + 500);
    }, randomDelay);
    return true;
};


// ============================================================
// 【补回】simulateReply（核心，带角色锁）
// ============================================================
window.simulateReply = function(originContactId, originSettings) {
    if (!originContactId) originContactId = window.SESSION_ID;
    if (!originSettings) originSettings = JSON.parse(JSON.stringify(settings));

    const isSameContact = (originContactId === window.SESSION_ID);
    const originPrefix = `${APP_PREFIX}${originContactId}_`;

    if (isSameContact) {
        _runSimulateReplyWithPool(originContactId, originSettings, {
            customReplies: customReplies,
            customEmojis: customEmojis,
            stickerLibrary: stickerLibrary,
            customReplyGroups: window.customReplyGroups || []
        });
    } else {
        (async function () {
            try {
                const [cr, ce, sl, crg] = await Promise.all([
                    localforage.getItem(originPrefix + 'customReplies'),
                    localforage.getItem(originPrefix + 'customEmojis'),
                    localforage.getItem(originPrefix + 'stickerLibrary'),
                    localforage.getItem(originPrefix + 'customReplyGroups')
                ]);
                _runSimulateReplyWithPool(originContactId, originSettings, {
                    customReplies: cr || [],
                    customEmojis: ce || [],
                    stickerLibrary: sl || [],
                    customReplyGroups: crg || []
                });
            } catch (e) { console.warn('[simulateReply] 后台读取回复库失败:', e); }
        })();
    }
};

function _runSimulateReplyWithPool(originContactId, originSettings, pool) {
    const isSameContact = (originContactId === window.SESSION_ID);

    if (!pool.customReplies || pool.customReplies.length === 0) {
        if (isSameContact) showNotification('回复库为空，请先到「自定义回复」中添加内容', 'info', 3500);
        return;
    }

    const disabledItemsOnce = (() => {
        try { const raw = localStorage.getItem('disabledReplyItems'); return raw ? new Set(JSON.parse(raw)) : new Set(); }
        catch (e) { return new Set(); }
    })();
    const disabledGroupItemsOnce = new Set();
    (pool.customReplyGroups || []).forEach(g => {
        if (g.disabled && Array.isArray(g.items)) g.items.forEach(item => disabledGroupItemsOnce.add(item));
    });
    const replyPoolOnce = pool.customReplies
        .filter(r => !disabledItemsOnce.has(r) && !disabledGroupItemsOnce.has(r))
        .map(r => String(r || '').trim())
        .filter(Boolean);
    if (!replyPoolOnce.length) {
        if (isSameContact) showNotification('回复库可用内容为空（可能被分组禁用或屏蔽），请到「自定义回复」中调整', 'info', 4000);
        return;
    }

    if (isSameContact && originSettings.typingIndicatorEnabled) {
        const tiWrapper = document.getElementById('typing-indicator-wrapper');
        const tiLabel = document.getElementById('typing-indicator-label');
        const tiAvatar = document.getElementById('typing-indicator-avatar');
        if (tiLabel) tiLabel.textContent = (originSettings.partnerName || '对方') + ' 正在输入';
        if (tiWrapper) { positionTypingIndicator(); tiWrapper.style.display = 'block'; }
        if (tiAvatar) {
            const partnerImg = DOMElements.partner.avatar.querySelector('img');
            tiAvatar.innerHTML = partnerImg ? `<img src="${partnerImg.src}">` : '<i class="fas fa-user"></i>';
        }
        if (_isCaughtUpToLatest()) DOMElements.chatContainer.scrollTop = DOMElements.chatContainer.scrollHeight;
    }

    const replyCount = Math.random() < 0.75 ? 1 : (Math.random() < 0.95 ? 2 : 3);
    const capturedPartnerName = originSettings.partnerName || '对方';
    const recentUserMsgs = (isSameContact && originSettings.replyEnabled && !window._companionSilentTrigger)
        ? messages.filter(m => m.sender === 'user' && m.text).slice(-10)
        : [];

    let delay = 0;
    for (let i = 0; i < replyCount; i++) {
        const dMin = originSettings.replyDelayMin || 3000;
        const dMax = originSettings.replyDelayMax || 7000;
        delay += dMin + Math.random() * (dMax - dMin);

        setTimeout(() => {
            try {
                const replyPool = replyPoolOnce;
                let replyText = '';
                if (originSettings.combineReplyCards) {
                    const maxN = Math.max(1, Math.min(5, parseInt(originSettings.combineReplyMaxCards, 10) || 3));
                    const n = 1 + Math.floor(Math.random() * maxN);
                    for (let k = 0; k < n; k++) {
                        const picked = replyPool[Math.floor(Math.random() * replyPool.length)];
                        replyText += picked + (Math.random() < .2 ? '！' : Math.random() < .2 ? '……' : '。');
                    }
                } else {
                    for (let t = 0; t < 6; t++) {
                        const picked = replyPool[Math.floor(Math.random() * replyPool.length)];
                        if (picked && String(picked).trim()) { replyText = String(picked).trim(); break; }
                    }
                }
                if (!replyText && i === replyCount - 1) {
                    (function(){try{if(window._typingIndicatorAutoHideTimer){clearTimeout(window._typingIndicatorAutoHideTimer);window._typingIndicatorAutoHideTimer=null;}}catch(e){}var _tiW=document.getElementById('typing-indicator-wrapper');if(_tiW){var _tiInner=_tiW.querySelector('.typing-indicator');if(_tiInner){_tiInner.classList.add('hiding');setTimeout(function(){_tiW.style.display='none';if(_tiInner)_tiInner.classList.remove('hiding');},240);}else{_tiW.style.display='none';}}})();
                    return;
                }

                let disabledStickerItems = new Set();
                try { const raw = localStorage.getItem('disabledStickerItems'); if (raw) disabledStickerItems = new Set(JSON.parse(raw)); } catch (e) {}
                const enabledStickerPool = (pool.stickerLibrary || []).filter(s => !disabledStickerItems.has(s));
                const shouldSendSticker = enabledStickerPool.length > 0 && Math.random() < 0.2;

                let finalText = replyText;
                let separateEmoji = null;
                if (pool.customEmojis && pool.customEmojis.length > 0 && Math.random() < 0.2) {
                    const emoji = pool.customEmojis[Math.floor(Math.random() * pool.customEmojis.length)];
                    if (originSettings.emojiMixEnabled !== false) {
                        finalText = Math.random() < 0.5 ? emoji + ' ' + replyText : replyText + ' ' + emoji;
                    } else separateEmoji = emoji;
                }

                addMessage({
                    id: Date.now() + i,
                    sender: capturedPartnerName,
                    text: finalText,
                    timestamp: new Date(),
                    status: 'received',
                    favorited: false,
                    note: null,
                    replyTo: (i === 0 && recentUserMsgs.length > 0 && Math.random() < 0.3)
                        ? (function(){ const m = recentUserMsgs[Math.floor(Math.random() * recentUserMsgs.length)]; return { id: m.id, text: m.text, sender: m.sender }; })()
                        : null,
                    type: 'normal',
                    contactId: originContactId
                });

                if (isSameContact && typeof window._sendPartnerNotification === 'function') {
                    window._sendPartnerNotification(capturedPartnerName, finalText);
                }

                if (shouldSendSticker) {
                    const randomSticker = enabledStickerPool[Math.floor(Math.random() * enabledStickerPool.length)];
                    setTimeout(() => {
                        addMessage({
                            id: Date.now() + i + 2000,
                            sender: capturedPartnerName,
                            text: '',
                            timestamp: new Date(),
                            image: randomSticker,
                            status: 'received',
                            favorited: false,
                            note: null,
                            type: 'normal',
                            contactId: originContactId
                        });
                    }, 400 + Math.random() * 600);
                }

                if (separateEmoji) {
                    setTimeout(() => {
                        addMessage({
                            id: Date.now() + i + 1000,
                            sender: capturedPartnerName,
                            text: separateEmoji,
                            timestamp: new Date(),
                            status: 'received',
                            favorited: false,
                            note: null,
                            type: 'normal',
                            contactId: originContactId
                        });
                    }, 300 + Math.random() * 400);
                }

                if (i === replyCount - 1 && isSameContact) {
                    (function() {
                        try {
                            if (window._typingIndicatorAutoHideTimer) { clearTimeout(window._typingIndicatorAutoHideTimer); window._typingIndicatorAutoHideTimer = null; }
                        } catch (e) {}
                        var _tiW = document.getElementById('typing-indicator-wrapper');
                        if (_tiW) {
                            var _tiInner = _tiW.querySelector('.typing-indicator');
                            if (_tiInner) {
                                _tiInner.classList.add('hiding');
                                setTimeout(function() { _tiW.style.display = 'none'; if (_tiInner) _tiInner.classList.remove('hiding'); }, 240);
                            } else _tiW.style.display = 'none';
                        }
                    })();
                }
            } catch (e) {
                console.error('[simulateReply] 渲染/回填出错:', e);
                try {
                    (function(){
                        try { if (window._typingIndicatorAutoHideTimer) { clearTimeout(window._typingIndicatorAutoHideTimer); window._typingIndicatorAutoHideTimer = null; } } catch (e2) {}
                        var _tiW2 = document.getElementById('typing-indicator-wrapper');
                        if (_tiW2) _tiW2.style.display = 'none';
                    })();
                } catch (e2) {}
            }
        }, delay);
    }
}
