/* js/contact-switcher.js 内存级切换器（最终修复版） */
(function() {
    function getCurrentRole() {
        return localStorage.getItem('active_contact_role') || 'role_A';
    }

    async function switchRole(nextRole, nextName) {
        if (typeof showNotification === 'function') {
            showNotification(`正在切换至：${nextName}`, 'info', 1000);
        }

        // 1. 保存当前角色的数据到存储（此时 SESSION_ID 还是旧的）
        if (typeof saveData === 'function') {
            await saveData();
        }

        // 2. 修改全局 SESSION_ID（这是关键，改完后 getStorageKey 就会用新前缀）
        window.SESSION_ID = nextRole;
        window.currentContactId = nextRole;
        localStorage.setItem('active_contact_role', nextRole);

        // 3. 清空界面和内存（防止旧消息显示在新角色里）
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) chatContainer.innerHTML = '';
        if (window.messages) window.messages = [];

        // 4. 重新加载新角色的数据（getStorageKey 此时已指向新角色）
        if (typeof loadData === 'function') {
            await loadData();
        } else {
            // 保底方案：如果 loadData 不存在，才刷新页面
            window.location.reload();
            return;
        }

        // 5. 更新界面名字
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
    }

    const switchBtn = document.getElementById('switch-contact-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', function() {
            const current = getCurrentRole();
            
            // 逻辑切换：A -> B，B -> A
            if (current === 'role_A') {
                switchRole('role_B', '梦角B');
            } else {
                switchRole('role_A', '梦角A');
            }
        });
    }

    // 页面初次打开时，检查 localStorage，如果是 B 就自动切换到 B
    window.addEventListener('DOMContentLoaded', function() {
        const activeRole = getCurrentRole();
        if (activeRole === 'role_B') {
            setTimeout(() => {
                if (window.SESSION_ID !== 'role_B') {
                    switchRole('role_B', '梦角B');
                }
            }, 800);
        }
    });
})();
