/* js/contact-switcher.js 纯内存切换器（修复版） */
(function() {
    function getCurrentRole() {
        return localStorage.getItem('active_contact_role') || 'role_A';
    }

    async function switchRole(nextRole, nextName) {
        if (typeof showNotification === 'function') {
            showNotification(`正在切换至：${nextName}`, 'info', 1000);
        }

        // 1. 保存当前角色的数据
        if (typeof saveData === 'function') {
            await saveData();
        }

        // 2. 强制修改全局 SESSION_ID 和 localStorage
        window.SESSION_ID = nextRole;
        window.currentContactId = nextRole;
        localStorage.setItem('active_contact_role', nextRole);

        // 3. 清空界面和内存
        const chatContainer = document.getElementById('chat-container');
        if (chatContainer) chatContainer.innerHTML = '';
        if (window.messages) window.messages = [];

        // 4. 重新加载新角色的数据（会触发 getStorageKey 读取 role_B 的数据）
        if (typeof loadData === 'function') {
            await loadData();
        } else {
            // 保底：如果找不到 loadData，只能刷新页面
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
    }

    const switchBtn = document.getElementById('switch-contact-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', function() {
            const current = getCurrentRole();
            
            // 如果当前是 role_A，则切到 B；否则切回 A
            if (current === 'role_A') {
                switchRole('role_B', '梦角B');
            } else {
                switchRole('role_A', '梦角A');
            }
        });
    }

    // 页面打开时，如果 localStorage 记录的是 B，就自动切到 B
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
