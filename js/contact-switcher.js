/* js/contact-switcher.js 角色切换器（兼容哈希路由版） */
(function() {
    // 获取当前角色，从 URL 的 hash 中找，例如 #role_B
    // 如果你是在 #/ 这种路由后面，我们单独加个参数
    function getCurrentRole() {
        // 尝试从 URL 的 search 参数中获取
        const urlParams = new URLSearchParams(window.location.search);
        let role = urlParams.get('role');
        if (role) return role;

        // 尝试从 URL 的 hash 中获取，比如 #role_B
        const hash = window.location.hash;
        if (hash.includes('role_B')) return 'role_B';
        if (hash.includes('role_A')) return 'role_A';

        // 默认角色 A
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

            // 针对你的 Hash 路由修改跳转逻辑
            const url = new URL(window.location.href);
            
            // 重要：把 hash 清掉（例如 #/），然后再拼接 role 参数
            // 这样加载后，你的 SESSION_ID 读取逻辑能直接读到 ?role=role_B
            url.hash = ''; 
            url.searchParams.set('role', nextRole);

            setTimeout(() => {
                window.location.href = url.toString();
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
