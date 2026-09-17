/* js/contact-switcher.js 最终稳定版 */
(function() {
    function getCurrentRole() {
        return localStorage.getItem('active_contact_role') || 'role_A';
    }

    // 页面加载时清理 URL 中的 role 参数
    if (window.location.search.includes('role=')) {
        const cleanUrl = window.location.pathname + window.location.hash;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    const switchBtn = document.getElementById('switch-contact-btn');
    if (switchBtn) {
        switchBtn.addEventListener('click', function() {
            const current = getCurrentRole();
            let nextRole, nextName;

            if (current === 'role_A') {
                nextRole = 'role_B';
                nextName = '梦角B';
            } else {
                nextRole = 'role_A';
                nextName = '梦角A';
            }

            // 直接调用挂载在 window 上的函数，不再做 typeof 判断
            if (typeof window.switchActiveContact === 'function') {
                window.switchActiveContact(nextRole, nextName);
            } else {
                console.error('[switch-contact] window.switchActiveContact 未定义，请检查 core.js 是否更新');
            }
        });
    }
})();
