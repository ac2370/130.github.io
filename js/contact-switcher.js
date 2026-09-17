/* js/contact-switcher.js 角色切换器 */
(function() {
    // 当前使用的角色ID，默认为 'contact_A'
    window.currentContactId = window.currentContactId || 'contact_A';
    
    // 定义你的多个联系人（名字和头像，你可以自己改）
    const contacts = {
        'contact_A': { name: '梦角A', avatar: 'https://file.youtochat.com/images/20260216/1771224856844_qdqqd.jpeg' },
        'contact_B': { name: '梦角B', avatar: 'https://file.youtochat.com/images/20260216/1771224856844_qdqqd.jpeg' }
    };

    // 获取新旧按钮
    const switchBtn = document.getElementById('switch-contact-btn');
    const hiddenSessionBtn = document.getElementById('session-manager-btn');
    
    // 绑定切换点击事件
    switchBtn.addEventListener('click', async function() {
        // 1. 确定下一个角色
        const nextContactId = window.currentContactId === 'contact_A' ? 'contact_B' : 'contact_A';
        const nextContact = contacts[nextContactId];
        
        // 2. 切换全局 ID
        window.currentContactId = nextContactId;
        
        // 3. 清空聊天界面（防止旧记录显示出来）
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) chatContainer.innerHTML = '';
        
        // 4. 修改顶部名称和头像
        const partnerNameEl = document.getElementById('partner-name');
        const partnerAvatarEl = document.getElementById('partner-avatar');
        if (partnerNameEl) partnerNameEl.textContent = nextContact.name;
        if (partnerAvatarEl && partnerAvatarEl.querySelector('img')) {
            partnerAvatarEl.querySelector('img').src = nextContact.avatar;
        }
        
        // 5. 重新加载这个角色的聊天记录
        // 【重要】：你需要用你代码里实际读取数据的函数。
        // 如果没有现成的函数，我们通过重载页面的方式来实现（最简单有效）
        if (typeof loadData === 'function') {
            await loadData(); // 尝试调用原代码的加载函数
        } else {
            // 如果你不知道函数名，直接刷新页面（因为我们已经改变了 currentContactId，刷新会加载新数据）
            location.reload(); 
        }
        
        // 6. 给个提示
        if (typeof showNotification === 'function') {
            showNotification(`已切换至：${nextContact.name}`, 'success');
        }
    });

    // 如果你想让原来的会话管理按钮还能用（隐藏状态下），可以通过控制台或者长按触发
    if (hiddenSessionBtn) {
        hiddenSessionBtn.addEventListener('longclick', function() {
            if (typeof showModal === 'function') {
                showModal(document.getElementById('session-modal'));
            }
        });
    }
})();
