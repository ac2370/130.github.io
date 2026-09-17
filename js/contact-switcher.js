/* js/contact-switcher.js 最终修复版 */
(function() {
    function getCurrentRole() {
        return localStorage.getItem('active_contact_role') || 'role_A';
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

            // 直接调用 core.js 里的切换函数，不要刷新页面
            if (typeof window.switchActiveContact === 'function') {
                window.switchActiveContact(nextRole, nextName);
            } else {
                console.error('[switch-contact] window.switchActiveContact 未定义，请检查 core.js 是否更新');
                if (typeof showNotification === 'function') {
                    showNotification('切换失败：核心函数未加载', 'error');
                }
            }
        });
    }

    // 页面加载时同步一次角色状态（避免异常）
    window.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            const activeRole = getCurrentRole();
            if (activeRole === 'role_B' && window.SESSION_ID !== 'role_B') {
                if (typeof window.switchActiveContact === 'function') {
                    window.switchActiveContact('role_B', '梦角B');
                }
            }
        }, 1000);
    });
})();
