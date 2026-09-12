// heart-cabinet.js - 心意柜（收到 / 送出的礼物）
(function() {
    'use strict';

    var STORAGE_KEY = 'moments_data';   // 与朋友圈共用

    function _esc(s) {
        return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    function _notify(msg, type, duration) {
        type = type || 'info'; duration = duration || 2000;
        if (typeof showNotification === 'function') showNotification(msg, type, duration);
        else alert(msg);
    }

    function _getData() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { posts: [] }; }
        catch(e) { return { posts: [] }; }
    }

    function _getGroupMembers() {
        try {
            var stored = localStorage.getItem('moments_group_members');
            if (stored) {
                var parsed = JSON.parse(stored);
                if (Array.isArray(parsed)) return parsed.filter(function(m) { return m && m.name && m.name.trim(); });
            }
        } catch(e) {}
        return [];
    }

    function _getMemberAvatar(name) {
        var members = _getGroupMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i].name === name) return members[i].avatar || '';
        }
        return '';
    }

    function _getMyAvatar() {
        try { return localStorage.getItem('moments_my_avatar') || ''; } catch(e) { return ''; }
    }

    function _getMyName() {
        return (typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我';
    }

    function _formatTime(iso) {
        var date = new Date(iso);
        var now = new Date();
        var diff = (now - date) / 1000;
        if (diff < 60) return '刚刚';
        if (diff < 3600) return Math.floor(diff / 60) + '分钟前';
        if (diff < 86400) return Math.floor(diff / 3600) + '小时前';
        if (diff < 172800) return '昨天 ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        return date.toLocaleDateString([], {month:'short', day:'numeric'}) + ' ' + date.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
    }

    function _renderAvatarHtml(name, size) {
        size = size || 36;
        var avatar = (name === _getMyName()) ? _getMyAvatar() : _getMemberAvatar(name);
        if (avatar) {
            return '<img src="' + _esc(avatar) + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;border:1px solid rgba(var(--border-color-rgb),0.1);flex-shrink:0;">';
        }
        // 我 → 👤，群成员 → 🌸
        var isMe = (name === _getMyName() || name === '我');
        return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:rgba(var(--accent-color-rgb),0.12);font-size:' + Math.round(size * 0.55) + 'px;flex-shrink:0;">' + (isMe ? '👤' : '🌸') + '</span>';
    }

    // =============================================
    // 主界面
    // =============================================
    window.openHeartCabinet = function() {
        var old = document.getElementById('heart-cabinet-modal');
        if (old) old.remove();

        var currentTab = 'received';   // 'received' 收到的 / 'sent' 送出的

        var wrap = document.createElement('div');
        wrap.id = 'heart-cabinet-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10060;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;width:min(480px, 94vw);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-color);box-shadow:0 20px 60px rgba(0,0,0,0.3);';

        // 顶部
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border-color);flex-shrink:0;';
        header.innerHTML = '<button id="hc-back" style="background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:4px 8px;">←</button>' +
            '<span style="font-size:16px;font-weight:700;color:var(--text-primary);flex:1;">🎁 心意柜</span>';
        inner.appendChild(header);

        // tab 栏
        var tabBar = document.createElement('div');
        tabBar.style.cssText = 'display:flex;border-bottom:1px solid var(--border-color);flex-shrink:0;padding:0 16px;';
        tabBar.innerHTML =
            '<button class="hc-tab active" data-tab="received" style="flex:1;padding:12px 4px 10px;border:none;background:transparent;font-weight:600;color:var(--text-primary);cursor:pointer;font-family:var(--font-family);font-size:14px;position:relative;border-bottom:2px solid var(--accent-color);">📥 收到的</button>' +
            '<button class="hc-tab" data-tab="sent" style="flex:1;padding:12px 4px 10px;border:none;background:transparent;font-weight:400;color:var(--text-secondary);cursor:pointer;font-family:var(--font-family);font-size:14px;position:relative;border-bottom:2px solid transparent;">📤 送出的</button>';
        inner.appendChild(tabBar);

        // 内容
        var content = document.createElement('div');
        content.id = 'hc-content';
        content.style.cssText = 'flex:1;overflow-y:auto;padding:14px 16px 20px;background:var(--secondary-bg);';
        inner.appendChild(content);

        wrap.appendChild(inner);
        document.body.appendChild(wrap);

        function renderContent() {
            var data = _getData();
            var posts = (data.posts || []).filter(function(p) { return p.isGift === true; });

            // 收到 = 对方送的（giftFrom === 'partner'）
            // 送出 = 我送的（giftFrom === 'me'）
            var filtered = posts.filter(function(p) {
                if (currentTab === 'received') return p.giftFrom === 'partner';
                return p.giftFrom === 'me';
            });

            // 按时间倒序
            filtered.sort(function(a, b) {
                return new Date(b.timestamp) - new Date(a.timestamp);
            });

            if (filtered.length === 0) {
                var emptyTip = currentTab === 'received' ? '还没有收到过礼物~' : '还没有送出过礼物~';
                content.innerHTML = '<div style="text-align:center;padding:60px 20px;color:var(--text-secondary);">' +
                    '<div style="font-size:48px;margin-bottom:12px;opacity:0.5;">🎁</div>' +
                    '<div style="font-size:14px;">' + emptyTip + '</div>' +
                    '</div>';
                return;
            }

            var html = '';
            for (var i = 0; i < filtered.length; i++) {
                var p = filtered[i];
                var fromName = currentTab === 'received' ? (p.memberName || '群成员') : _getMyName();
                var toName = currentTab === 'received' ? _getMyName() : (p.memberName || '群成员');
                var avatarName = currentTab === 'received' ? fromName : _getMyName();

                // 备注（对方写的 / 我写的）
                var note = p.giftNote || '';
                var text = p.giftText || '';

                html += '<div style="background:var(--primary-bg);border-radius:16px;padding:14px 16px;margin-bottom:12px;border:1px solid var(--border-color);box-shadow:0 1px 4px rgba(0,0,0,0.03);">' +

                    // 顶部：头像 + 名字 + 时间
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                        _renderAvatarHtml(avatarName, 36) +
                        '<div style="flex:1;min-width:0;">' +
                            '<div style="font-size:14px;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + _esc(fromName) + '</div>' +
                            '<div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">' +
                                (currentTab === 'received' ? '送给你' : '送给 ' + _esc(toName)) +
                            '</div>' +
                        '</div>' +
                        '<div style="font-size:11px;color:var(--text-secondary);flex-shrink:0;">' + _formatTime(p.timestamp) + '</div>' +
                    '</div>' +

                    // 礼物图 + 名
                    '<div style="display:flex;flex-direction:column;align-items:center;padding:12px 0;background:var(--secondary-bg);border-radius:12px;margin-bottom:10px;">' +
                        '<div style="font-size:52px;line-height:1;margin-bottom:6px;">' + _esc(p.giftEmoji || '🎁') + '</div>' +
                        '<div style="font-size:14px;font-weight:600;color:var(--text-primary);">' + _esc(p.giftName || '礼物') + '</div>' +
                    '</div>' +

                    // 备注（如果有）
                    (note ?
                        '<div style="padding:8px 12px;background:rgba(var(--accent-color-rgb),0.06);border-left:3px solid var(--accent-color);border-radius:6px;margin-bottom:8px;">' +
                            '<div style="font-size:11px;color:var(--accent-color);margin-bottom:4px;font-weight:600;">📝 ' + (currentTab === 'received' ? 'TA 的备注' : '我的备注') + '</div>' +
                            '<div style="font-size:13px;color:var(--text-primary);line-height:1.5;font-style:italic;">「' + _esc(note) + '」</div>' +
                        '</div>' : '') +

                    // 想对你说的话（字卡）
                    (text ?
                        '<div style="font-size:12.5px;color:var(--text-secondary);line-height:1.7;padding:6px 4px;">' + _esc(text) + '</div>' : '') +

                    '</div>';
            }

            content.innerHTML = html;
        }

        // tab 切换
        tabBar.querySelectorAll('.hc-tab').forEach(function(btn) {
            btn.onclick = function() {
                tabBar.querySelectorAll('.hc-tab').forEach(function(b) {
                    b.classList.remove('active');
                    b.style.color = 'var(--text-secondary)';
                    b.style.borderBottom = '2px solid transparent';
                    b.style.fontWeight = '400';
                });
                this.classList.add('active');
                this.style.color = 'var(--text-primary)';
                this.style.borderBottom = '2px solid var(--accent-color)';
                this.style.fontWeight = '600';
                currentTab = this.dataset.tab;
                renderContent();
            };
        });

        document.getElementById('hc-back').onclick = function() { wrap.remove(); };
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };

        renderContent();
    };

    console.log('[心意柜] 模块已加载');
})();
