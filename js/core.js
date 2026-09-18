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
