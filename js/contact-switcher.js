/* js/contact-switcher.js 角色切换器（完美兼容版） */
(function() {
    // 获取当前角色：优先从 URL 参数获取
    function getCurrentRole() {
        const urlParams = new URLSearchParams(window.location.search);
        const roleFromUrl = urlParams.get('role');
        
        // 如果 URL 有参数，使用它
        if (roleFromUrl) return roleFromUrl;

        // 如果没有参数，默认使用 role_A（对应你的 SESSION_ID 默认值）
        return 'role_A';
    }

    const CURRENT_ROLE = getCurrentRole();

    const switchBtn = document.getElementById('switch-contact-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', function() {
            let nextRole = 'role_A';
            let nextName = '梦角A'; 
            
            // 逻辑反转：如果当前是 A，切到 B；如果是 B，切回 A
            if (CURRENT_ROLE === 'role_A') {
                nextRole = 'role_B';
                nextName = '梦角B'; 
            }

            if (typeof showNotification === 'function') {
                showNotification(`正在切换至：${nextName}`, 'info', 1500);
            }

            // 构建新的 URL：清空 hash，设置 ?role= 
            const url = new URL(window.location.href);
            url.hash = ''; 
            url.searchParams.set('role', nextRole);

            setTimeout(() => {
                window.location.href = url.toString();
            }, 600); 
        });
    }

    // 同步更新界面上显示的角色名
    window.addEventListener('DOMContentLoaded', () => {
        // 给 core.js 一点时间加载数据
        setTimeout(() => {
            const nameEl = document.getElementById('partner-name');
            if (nameEl && window.settings) {
                if (CURRENT_ROLE === 'role_B') {
                    // 如果数据库中还没有自定义名字，则显示默认的 B 名字
                    if (!window.settings.partnerName || window.settings.partnerName === '梦角') {
                        nameEl.textContent = '梦角B';
                    }
                } else {
                    if (!window.settings.partnerName || window.settings.partnerName === '梦角') {
                        nameEl.textContent = '梦角A';
                    }
                }
            }
        }, 1500); 
    });
})();
