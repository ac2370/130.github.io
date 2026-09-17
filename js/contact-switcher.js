/* js/contact-switcher.js 内存级切换器（无需刷新页面，绝对隔离） */
(function() {
    // 从 localStorage 读取当前角色的 ID（默认是 role_A）
    function getCurrentRole() {
        return localStorage.getItem('active_contact_role') || 'role_A';
    }

    // 切换角色核心逻辑
    async function switchRole(nextRole, nextName) {
        if (typeof showNotification === 'function') {
            showNotification(`正在切换至：${nextName}`, 'info', 1000);
        }

        // 1. 保存当前角色的数据到本地
        if (typeof saveData === 'function') {
            await saveData();
        }

        // 2. 修改全局的 SESSION_ID，这是关键！
        // 你的 core.js 里所有 getStorageKey() 都是基于 SESSION_ID 生成的
        window.SESSION_ID = nextRole;
        window.currentContactId = nextRole;
        localStorage.setItem('active_contact_role', nextRole);

        // 3. 清空当前界面上的聊天记录，防止串台
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) chatContainer.innerHTML = '';
        if (window.messages) window.messages = []; // 清空全局消息缓存

        // 4. 重新加载新角色的数据（这一步会从 localforage 拉取 role_B 的数据并重新渲染）
        if (typeof loadData === 'function') {
            await loadData();
        } else {
            // 如果没有 loadData 函数，用备选方案
            window.location.reload();
            return;
        }

        // 5. 更新界面名字
        const nameEl = document.getElementById('partner-name');
        if (nameEl && window.settings) {
            // 如果新角色还没设置过名字（还是默认的“梦角”），则显示默认名
            if (!window.settings.partnerName || window.settings.partnerName === '梦角') {
                nameEl.textContent = nextName;
                window.settings.partnerName = nextName; // 顺便存一下
            }
        }

        if (typeof showNotification === 'function') {
            showNotification(`已切换至 ${nextName} ✦`, 'success', 1500);
        }
    }

    // 绑定按钮点击事件
    const switchBtn = document.getElementById('switch-contact-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', function() {
            const current = getCurrentRole();
            
            if (current === 'role_A') {
                // 切换到 B
                switchRole('role_B', '梦角B');
            } else {
                // 切换回 A
                switchRole('role_A', '梦角A');
            }
        });
    }

    // 页面初次加载时，如果 localStorage 里有角色记录，同步一下
    window.addEventListener('DOMContentLoaded', function() {
        const activeRole = getCurrentRole();
        if (activeRole === 'role_B') {
            // 如果上次离开时是梦角B，这次打开默认就用B
            setTimeout(() => {
                if (window.SESSION_ID !== 'role_B') {
                    switchRole('role_B', '梦角B');
                }
            }, 500);
        }
    });
})();
