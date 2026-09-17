/* js/contact-switcher.js 角色切换器（最终版） */
(function() {
    const CURRENT_ROLE = new URLSearchParams(window.location.search).get('role') || 'role_A';

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

            const url = new URL(window.location.href);
            url.searchParams.set('role', nextRole);
            url.hash = ''; 

            setTimeout(() => {
                window.location.href = url.toString();
            }, 600); 
        });
    }

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
