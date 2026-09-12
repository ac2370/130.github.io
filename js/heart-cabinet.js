// heart-cabinet.js - 心意柜（收到 / 送出的礼物 + 群成员管理）
(function() {
    'use strict';

    var STORAGE_KEY = 'moments_data';

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
    function _setData(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
    function _saveGroupMembers(members) {
        localStorage.setItem('moments_group_members', JSON.stringify(members));
    }

    function _addGroupMember(name, avatar) {
        var members = _getGroupMembers();
        for (var i = 0; i < members.length; i++) {
            if (members[i].name === name) { _notify('成员已存在', 'warning'); return false; }
        }
        members.push({ name: name.trim(), avatar: avatar || '' });
        _saveGroupMembers(members);
        return true;
    }

    function _editGroupMember(oldName, newName, newAvatar) {
        var members = _getGroupMembers();
        var found = false;
        for (var i = 0; i < members.length; i++) {
            if (members[i].name === oldName) {
                members[i].name = newName;
                members[i].avatar = newAvatar || '';
                found = true;
                break;
            }
        }
        if (!found) return false;
        _saveGroupMembers(members);

        // 同步更新朋友圈里的旧数据
        if (oldName !== newName) {
            var data = _getData();
            var updated = false;
            (data.posts || []).forEach(function(p) {
                if (p.author === 'partner' && p.memberName === oldName) { p.memberName = newName; updated = true; }
                if (p.isGift && p.giftTo === oldName) { p.giftTo = newName; updated = true; }
                if (p.isGift && p.memberName === oldName) { p.memberName = newName; updated = true; }
                (p.comments || []).forEach(function(c) {
                    if (c.memberName === oldName) { c.memberName = newName; updated = true; }
                    (c.thread || []).forEach(function(t) {
                        if (t.memberName === oldName) { t.memberName = newName; updated = true; }
                    });
                });
            });
            if (updated) _setData(data);
        }
        return true;
    }

    function _removeGroupMember(name) {
        var members = _getGroupMembers();
        members = members.filter(function(m) { return m.name !== name; });
        _saveGroupMembers(members);
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
        try {
            return localStorage.getItem('moments_my_name') ||
                   ((typeof settings !== 'undefined' && settings.myName) ? settings.myName : '我');
        } catch(e) { return '我'; }
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

    // 渲染小头像：先找"我自己"的头像，再找群成员头像
    function _avatarHtml(name, size) {
        size = size || 36;
        var myName = _getMyName();
        var isMe = (name === myName || name === '我');
        var avatar = isMe ? _getMyAvatar() : _getMemberAvatar(name);
        if (avatar) {
            return '<img src="' + _esc(avatar) + '" style="width:' + size + 'px;height:' + size + 'px;border-radius:50%;object-fit:cover;border:1px solid rgba(var(--border-color-rgb),0.1);flex-shrink:0;">';
        }
        return '<span style="display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;border-radius:50%;background:rgba(var(--accent-color-rgb),0.12);font-size:' + Math.round(size * 0.55) + 'px;flex-shrink:0;">' + (isMe ? '👤' : '🌸') + '</span>';
    }

    // =============================================
    // 主界面
    // =============================================
    window.openHeartCabinet = function() {
        var old = document.getElementById('heart-cabinet-modal');
        if (old) old.remove();

        var currentTab = 'received';

        var wrap = document.createElement('div');
        wrap.id = 'heart-cabinet-modal';
        wrap.style.cssText = 'position:fixed;inset:0;z-index:10060;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);';

        var inner = document.createElement('div');
        inner.style.cssText = 'background:var(--primary-bg);border-radius:20px;width:min(480px, 94vw);max-height:88vh;display:flex;flex-direction:column;overflow:hidden;border:1px solid var(--border-color);box-shadow:0 20px 60px rgba(0,0,0,0.3);';

        // 顶部
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;gap:8px;padding:14px 16px;border-bottom:1px solid var(--border-color);flex-shrink:0;';
        header.innerHTML = '<button id="hc-back" style="background:none;border:none;font-size:16px;color:var(--text-secondary);cursor:pointer;padding:4px 8px;">←</button>' +
            '<span style="font-size:16px;font-weight:700;color:var(--text-primary);flex:1;">🎁 心意柜</span>' +
            '<button id="hc-add-member-btn" style="background:var(--accent-color);border:none;font-size:12px;color:#fff;cursor:pointer;padding:5px 10px;border-radius:10px;font-weight:600;">👥 群成员</button>';
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

        // =============================================
        // 渲染内容
        // =============================================
        function renderContent() {
            var data = _getData();
            var posts = (data.posts || []).filter(function(p) { return p.isGift === true; });

            // 收到的：对方送的（giftFrom === 'partner'）
            // 送出的：我送的（giftFrom === 'me'）
            var filtered = posts.filter(function(p) {
                if (currentTab === 'received') return p.giftFrom === 'partner';
                return p.giftFrom === 'me';
            });

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

            var myName = _getMyName();
            var html = '';

            for (var i = 0; i < filtered.length; i++) {
                var p = filtered[i];

                // 关键：显示"对方"的头像和昵称
                // 收到 tab：对方 = 送礼人（p.memberName，群成员）
                // 送出 tab：对方 = 收礼人（p.giftTo）
                var otherName, subtitle, avatarName;

                if (currentTab === 'received') {
                    otherName = p.memberName || '群成员';
                    subtitle = '送给你';
                    avatarName = otherName;    // 显示送礼人的头像
                } else {
                    otherName = p.giftTo || p.memberName || '群成员';
                    subtitle = '送给 ' + otherName;
                    avatarName = otherName;    // 显示收礼人的头像
                }

                var note = p.giftNote || '';
                var text = p.giftText || '';

                // 礼物图 or emoji
                var visualHtml = p.giftImage
                    ? '<img src="' + _esc(p.giftImage) + '" style="width:72px;height:72px;object-fit:cover;border-radius:14px;margin-bottom:6px;">'
                    : '<div style="font-size:52px;line-height:1;margin-bottom:6px;">' + _esc(p.giftEmoji || '🎁') + '</div>';

                html += '<div style="background:var(--primary-bg);border-radius:16px;padding:14px 16px;margin-bottom:12px;border:1px solid var(--border-color);box-shadow:0 1px 4px rgba(0,0,0,0.03);">' +

                    // 顶部：对方头像 + 对方昵称 + 时间
                    '<div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">' +
                        _avatarHtml(avatarName, 36) +
                        '<div style="flex:1;min-width:0;">' +
                            '<div style="font-size:14px;font-weight:600;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + _esc(otherName) + '</div>' +
                            '<div style="font-size:11px;color:var(--text-secondary);margin-top:2px;">' + _esc(subtitle) + '</div>' +
                        '</div>' +
                        '<div style="font-size:11px;color:var(--text-secondary);flex-shrink:0;">' + _formatTime(p.timestamp) + '</div>' +
                    '</div>' +

                    // 礼物图 + 名
                    '<div style="display:flex;flex-direction:column;align-items:center;padding:12px 0;background:var(--secondary-bg);border-radius:12px;margin-bottom:10px;">' +
                        visualHtml +
                        '<div style="font-size:14px;font-weight:600;color:var(--text-primary);">' + _esc(p.giftName || '礼物') + '</div>' +
                    '</div>' +

                    // 备注
                    (note ?
                        '<div style="padding:8px 12px;background:rgba(var(--accent-color-rgb),0.06);border-left:3px solid var(--accent-color);border-radius:6px;margin-bottom:8px;">' +
                            '<div style="font-size:11px;color:var(--accent-color);margin-bottom:4px;font-weight:600;">📝 ' + (currentTab === 'received' ? 'TA 的备注' : '我的备注') + '</div>' +
                            '<div style="font-size:13px;color:var(--text-primary);line-height:1.5;font-style:italic;">「' + _esc(note) + '」</div>' +
                        '</div>' : '') +

                    // 想说的话（字卡）
                    (text ?
                        '<div style="font-size:12.5px;color:var(--text-secondary);line-height:1.7;padding:6px 4px;">' + _esc(text) + '</div>' : '') +

                    '</div>';
            }

            content.innerHTML = html;
        }

        // =============================================
        // 群成员管理弹窗
        // =============================================
        function showMembersDialog() {
            var oldDlg = document.getElementById('hc-members-dialog');
            if (oldDlg) oldDlg.remove();

            var members = _getGroupMembers();

            var listHtml = '';
            if (members.length === 0) {
                listHtml = '<div style="text-align:center;padding:20px;color:var(--text-secondary);font-size:13px;">暂无群成员</div>';
            } else {
                listHtml = '<div style="max-height:300px;overflow-y:auto;">';
                for (var i = 0; i < members.length; i++) {
                    var m = members[i];
                    var av = m.avatar
                        ? '<img src="' + _esc(m.avatar) + '" style="width:36px;height:36px;border-radius:50%;object-fit:cover;flex-shrink:0;">'
                        : '<span style="display:inline-flex;align-items:center;justify-content:center;width:36px;height:36px;border-radius:50%;background:rgba(var(--accent-color-rgb),0.12);font-size:18px;flex-shrink:0;">🌸</span>';
                    listHtml += '<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid rgba(var(--border-color-rgb),0.06);">' +
                        av +
                        '<span style="flex:1;font-size:13px;font-weight:500;color:var(--text-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + _esc(m.name) + '</span>' +
                        '<button class="hc-member-edit" data-name="' + _esc(m.name) + '" style="padding:4px 10px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-secondary);font-size:11px;cursor:pointer;">编辑</button>' +
                        '<button class="hc-member-del" data-name="' + _esc(m.name) + '" style="padding:4px 8px;border:none;background:none;color:#ff6b6b;font-size:13px;cursor:pointer;">✕</button>' +
                        '</div>';
                }
                listHtml += '</div>';
            }

            var dlg = document.createElement('div');
            dlg.id = 'hc-members-dialog';
            dlg.style.cssText = 'position:fixed;inset:0;z-index:10070;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.5);';

            dlg.innerHTML = '<div style="background:var(--primary-bg);border-radius:20px;padding:22px;width:min(400px,92vw);max-height:85vh;overflow-y:auto;border:1px solid var(--border-color);">' +
                '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">' +
                    '<span style="font-size:17px;font-weight:700;color:var(--text-primary);">👥 群成员管理</span>' +
                    '<button id="hc-members-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:var(--text-secondary);">✕</button>' +
                '</div>' +
                listHtml +
                '<div style="margin-top:14px;padding-top:14px;border-top:1px solid var(--border-color);">' +
                    '<div style="font-size:13px;font-weight:600;color:var(--text-primary);margin-bottom:8px;">➕ 添加群成员</div>' +
                    '<input id="hc-new-member-avatar" type="text" placeholder="头像图片URL（可选）" style="width:100%;padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:12px;box-sizing:border-box;outline:none;margin-bottom:6px;">' +
                    '<div style="display:flex;gap:6px;">' +
                        '<input id="hc-new-member-name" type="text" maxlength="12" placeholder="成员昵称" style="flex:1;padding:8px 12px;border:1px solid var(--border-color);border-radius:8px;background:var(--secondary-bg);color:var(--text-primary);font-size:13px;box-sizing:border-box;outline:none;">' +
                        '<button id="hc-new-member-save" style="padding:8px 16px;border:none;border-radius:8px;background:var(--accent-color);color:#fff;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;">添加</button>' +
                    '</div>' +
                '</div>' +
                '<button id="hc-members-close-btn" style="width:100%;padding:10px;border:1px solid var(--border-color);border-radius:12px;background:var(--secondary-bg);color:var(--text-secondary);font-size:13px;cursor:pointer;margin-top:14px;">关闭</button>' +
                '</div>';
            document.body.appendChild(dlg);

            dlg.querySelector('#hc-members-close').onclick = function() { dlg.remove(); };
            dlg.querySelector('#hc-members-close-btn').onclick = function() { dlg.remove(); };
            dlg.onclick = function(e) { if (e.target === dlg) dlg.remove(); };

            // 添加
            dlg.querySelector('#hc-new-member-save').onclick = function() {
                var name = dlg.querySelector('#hc-new-member-name').value.trim();
                var avatar = dlg.querySelector('#hc-new-member-avatar').value.trim();
                if (!name) { _notify('请输入成员昵称', 'warning'); return; }
                if (_addGroupMember(name, avatar)) {
                    _notify('已添加群成员 ' + name, 'success');
                    dlg.remove();
                    showMembersDialog();
                    renderContent();
                }
            };

            // 编辑
            dlg.querySelectorAll('.hc-member-edit').forEach(function(btn) {
                btn.onclick = function() {
                    var oldName = this.dataset.name;
                    var members2 = _getGroupMembers();
                    var cur = null;
                    for (var k = 0; k < members2.length; k++) {
                        if (members2[k].name === oldName) { cur = members2[k]; break; }
                    }
                    if (!cur) return;
                    var newName = prompt('成员昵称：', cur.name);
                    if (!newName || !newName.trim()) return;
                    var newAvatar = prompt('头像图片URL（可留空）：', cur.avatar || '');
                    if (newAvatar === null) return;
                    _editGroupMember(oldName, newName.trim(), newAvatar.trim());
                    _notify('已更新成员信息', 'success');
                    dlg.remove();
                    showMembersDialog();
                    renderContent();
                };
            });

            // 删除
            dlg.querySelectorAll('.hc-member-del').forEach(function(btn) {
                btn.onclick = function() {
                    var name = this.dataset.name;
                    if (!confirm('删除群成员 "' + name + '"？\n（不会删掉已有的礼物记录）')) return;
                    _removeGroupMember(name);
                    _notify('已删除成员', 'info');
                    dlg.remove();
                    showMembersDialog();
                    renderContent();
                };
            });
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
        document.getElementById('hc-add-member-btn').onclick = showMembersDialog;
        wrap.onclick = function(e) { if (e.target === wrap) wrap.remove(); };

        renderContent();
    };

    console.log('[心意柜] 模块已加载（修正头像昵称 + 群成员管理）');
})();
