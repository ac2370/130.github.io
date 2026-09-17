/* js/contact-switcher.js 角色切换器（Hash 兼容最终版） */
(function() {
    // 从 URL 的 hash 中解析角色，例如 #role_B/
    function getCurrentRole() {
        const hash = window.location.hash; // 例如 #role_B/
        if (hash.includes('role_B')) return 'role_B';
        if (hash.includes('role_A')) return 'role_A';
        // 默认角色
        return 'role_A';
    }

    const CURRENT_ROLE = getCurrentRole();

    const switchBtn = document.getElementById('switch-contact-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', function() {
            let nextRole = 'role_A';
            let nextName = '梦角A'; 
            
            if (CURRENT_ROLE === 'role_A') {
                nextRole = 'role_B';
                nextName = '梦角B'; 
            }

            if (typeof showNotification === 'function') {
                showNotification(`正在切换至：${nextName}`, 'info', 1500);
            }

            // --- 核心修改：使用 Hash 路由代替 Search 参数 ---
            // 获取当前 hash 后面原本的路径部分（比如 / 或 /session1）
            let currentHashPath = window.location.hash.replace(/^#/, '');
            // 如果原本的 hash 是 role_A/，去掉 role_A 保留后面的部分
            currentHashPath = currentHashPath.replace(/^role_[AB]\//, '');
            if (!currentHashPath) currentHashPath = '/';

            // 重新拼接 URL
            const newUrl = new URL(window.location.href);
            newUrl.hash = `${nextRole}${currentHashPath}`; // 结果是 #role_B/ 或 #role_B/session1
            
            setTimeout(() => {
                // 使用 replace 防止刷新时的历史记录堆栈混乱
                window.location.replace(newUrl.toString());
                // 如果是单页应用，我们还可以手动触发一下数据重载
                // 但考虑到原有逻辑是刷新页面，这里直接用 replace 最安全
            }, 600); 
        });
    }

    // 同步更新界面上显示的角色名
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const nameEl = document.getElementById('partner-name');
            if (nameEl && window.settings) {
                if (CURRENT_ROLE === 'role_B') {
                    if (!window.settings.partnerName || window.settings.partnerName === '梦角') {
                        nameEl.textContent = '梦角B';
                    }
                } else {
                    if (!window.settings.partnerName || window.settings.partnerName === '梦角') {
                        nameEl.textContent = '梦角A';
                    }
                }
            }
        }, 1000); 
    });
})();
