/* ============================================
   Admin Panel JavaScript
   Shannon Banks Scouting
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    initLoginForm();
    initTabs();
    initProfileForm();
    initPasswordForm();
    initAnnouncementUI();
    initUserUI();
    initLogout();
});

const EMAIL_DOMAIN = '@shannonbanksscouts.ie';

/* ---- SESSION CHECK ---- */
async function checkSession() {
    const { data: { session } } = await sb.auth.getSession();
    if (session) {
        // Check if user is suspended
        const { data: profile } = await sb
            .from('profiles')
            .select('is_suspended, username, display_name, avatar_url')
            .eq('id', session.user.id)
            .single();

        if (profile && profile.is_suspended) {
            await sb.auth.signOut();
            showLoginError('Your account has been suspended. Contact an administrator.');
            return;
        }

        showDashboard(session, profile);
    } else {
        showLogin();
    }
}

function showLogin() {
    document.getElementById('login-section').style.display = '';
    document.getElementById('admin-dashboard').classList.remove('active');
}

function showDashboard(session, profile) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('admin-dashboard').classList.add('active');
    document.getElementById('admin-username').textContent = profile?.display_name || profile?.username || 'Leader';
    loadProfile();
    loadAnnouncements();
    loadUsers();
}

function showLoginError(msg) {
    const el = document.getElementById('login-error');
    el.textContent = msg;
    el.classList.add('visible');
}

/* ---- LOGIN ---- */
function initLoginForm() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        btn.disabled = true;

        const username = document.getElementById('login-username').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;

        document.getElementById('login-error').classList.remove('visible');

        const { data, error } = await sb.auth.signInWithPassword({
            email: username + EMAIL_DOMAIN,
            password: password
        });

        // Fallback: try old domain for accounts created before migration
        let loginData = data;
        let loginError = error;
        if (error) {
            const fallback = await sb.auth.signInWithPassword({
                email: username + '@shannonbanks.local',
                password: password
            });
            loginData = fallback.data;
            loginError = fallback.error;
        }

        if (loginError) {
            showLoginError('Invalid username or password.');
            btn.disabled = false;
            return;
        }

        // Check suspension
        const { data: profile } = await sb
            .from('profiles')
            .select('is_suspended, username, display_name, avatar_url')
            .eq('id', loginData.user.id)
            .single();

        if (profile && profile.is_suspended) {
            await sb.auth.signOut();
            showLoginError('Your account has been suspended. Contact an administrator.');
            btn.disabled = false;
            return;
        }

        btn.disabled = false;
        showDashboard(loginData.session, profile);
    });
}

/* ---- LOGOUT ---- */
function initLogout() {
    document.getElementById('btn-logout').addEventListener('click', async () => {
        await sb.auth.signOut();
        showLogin();
    });
}

/* ---- TABS ---- */
function initTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
        });
    });
}

/* ---- PROFILE ---- */
function initProfileForm() {
    document.getElementById('profile-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProfile();
    });

    document.getElementById('avatar-input').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        await uploadAvatar(file);
    });
}

async function loadProfile() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    const { data: profile } = await sb
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

    if (!profile) return;

    document.getElementById('profile-display-name').value = profile.display_name || '';
    document.getElementById('profile-title').value = profile.title || '';
    document.getElementById('profile-section').value = profile.section || '';
    document.getElementById('profile-meeting-day').value = profile.meeting_day || '';
    document.getElementById('profile-bio').value = profile.bio || '';
    document.getElementById('profile-show-leaders').checked = profile.show_on_leaders_page;

    const preview = document.getElementById('avatar-preview');
    if (profile.avatar_url) {
        preview.innerHTML = `<img src="${profile.avatar_url}" alt="Profile photo">`;
    } else {
        preview.innerHTML = '👤';
    }
}

async function saveProfile() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    const updates = {
        display_name: document.getElementById('profile-display-name').value.trim(),
        title: document.getElementById('profile-title').value.trim() || null,
        section: document.getElementById('profile-section').value || null,
        meeting_day: document.getElementById('profile-meeting-day').value || null,
        bio: document.getElementById('profile-bio').value.trim() || null,
        show_on_leaders_page: document.getElementById('profile-show-leaders').checked
    };

    const { error } = await sb
        .from('profiles')
        .update(updates)
        .eq('id', session.user.id);

    if (error) {
        showToast('Failed to save profile.', true);
    } else {
        showToast('Profile saved!');
    }
}

async function uploadAvatar(file) {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${session.user.id}.${fileExt}`;

    const { error: uploadError } = await sb.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

    if (uploadError) {
        showToast('Failed to upload photo.', true);
        return;
    }

    const { data: { publicUrl } } = sb.storage
        .from('avatars')
        .getPublicUrl(filePath);

    // Add cache-buster
    const avatarUrl = publicUrl + '?t=' + Date.now();

    await sb
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', session.user.id);

    document.getElementById('avatar-preview').innerHTML = `<img src="${avatarUrl}" alt="Profile photo">`;
    showToast('Photo uploaded!');
}

/* ---- PASSWORD ---- */
function initPasswordForm() {
    document.getElementById('password-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newPw = document.getElementById('new-password').value;
        const confirmPw = document.getElementById('confirm-password').value;

        if (newPw !== confirmPw) {
            showToast('Passwords do not match.', true);
            return;
        }

        if (newPw.length < 6) {
            showToast('Password must be at least 6 characters.', true);
            return;
        }

        const { error } = await sb.auth.updateUser({ password: newPw });

        if (error) {
            showToast('Failed to update password.', true);
        } else {
            showToast('Password updated!');
            document.getElementById('password-form').reset();
        }
    });
}

/* ---- ANNOUNCEMENTS ---- */
let quill = null;

function initAnnouncementUI() {
    // Initialize Quill editor
    quill = new Quill('#announcement-editor', {
        theme: 'snow',
        placeholder: 'Write your announcement...',
        modules: {
            toolbar: [
                [{ header: [2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ list: 'ordered' }, { list: 'bullet' }],
                ['link', 'image'],
                ['clean']
            ]
        }
    });

    // Handle image paste/drop — upload to Supabase Storage
    quill.root.addEventListener('paste', handleImagePaste);
    quill.root.addEventListener('drop', handleImageDrop);

    // Override the toolbar image button to also use upload
    const toolbar = quill.getModule('toolbar');
    toolbar.addHandler('image', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files[0];
            if (file) await uploadAndInsertImage(file);
        };
        input.click();
    });

    // Embed code button
    document.getElementById('btn-embed-code').addEventListener('click', () => {
        const code = prompt('Paste your embed code (YouTube iframe, Google Maps iframe, etc.):');
        if (code && code.trim()) {
            const range = quill.getSelection(true);
            // Insert the raw HTML as a video embed (Quill's video blot) or as raw HTML
            const sanitized = sanitizeEmbed(code.trim());
            if (sanitized) {
                quill.clipboard.dangerouslyPasteHTML(range.index, sanitized);
            } else {
                alert('Only iframe embeds from YouTube, Google Maps, and Vimeo are allowed.');
            }
        }
    });

    document.getElementById('btn-new-announcement').addEventListener('click', () => {
        openAnnouncementModal();
    });

    document.getElementById('btn-cancel-announcement').addEventListener('click', () => {
        closeAnnouncementModal();
    });

    document.getElementById('announcement-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeAnnouncementModal();
    });

    document.getElementById('announcement-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveAnnouncement();
    });

    // Show/hide meeting night field based on section
    document.getElementById('announcement-section').addEventListener('change', (e) => {
        toggleNightField(e.target.value);
    });
}

/* ---- Image Upload Helpers ---- */

async function handleImagePaste(e) {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
        if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            await uploadAndInsertImage(file);
            return;
        }
    }
}

async function handleImageDrop(e) {
    const files = e.dataTransfer?.files;
    if (!files) return;
    for (const file of files) {
        if (file.type.startsWith('image/')) {
            e.preventDefault();
            e.stopPropagation();
            await uploadAndInsertImage(file);
            return;
        }
    }
}

async function uploadAndInsertImage(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showToast('Image too large (max 5MB).', true);
        return;
    }

    const ext = file.name.split('.').pop() || 'png';
    const fileName = `announcements/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    showToast('Uploading image...');

    const { error: uploadError } = await sb.storage
        .from('images')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

    if (uploadError) {
        showToast('Image upload failed: ' + uploadError.message, true);
        return;
    }

    const { data: urlData } = sb.storage.from('images').getPublicUrl(fileName);
    const imageUrl = urlData.publicUrl;

    const range = quill.getSelection(true);
    quill.insertEmbed(range.index, 'image', imageUrl);
    quill.setSelection(range.index + 1);
    showToast('Image inserted!');
}

/* ---- Embed Sanitization ---- */

function sanitizeEmbed(html) {
    // Only allow iframes from trusted sources
    const div = document.createElement('div');
    div.innerHTML = html;
    const iframe = div.querySelector('iframe');
    if (!iframe) return null;

    const src = iframe.getAttribute('src') || '';
    const allowedDomains = [
        'youtube.com', 'www.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com',
        'google.com/maps', 'www.google.com/maps',
        'player.vimeo.com',
        'maps.google.com'
    ];

    const isAllowed = allowedDomains.some(domain => src.includes(domain));
    if (!isAllowed) return null;

    // Return a clean iframe with safe attributes only
    const width = iframe.getAttribute('width') || '100%';
    const height = iframe.getAttribute('height') || '315';
    const title = iframe.getAttribute('title') || 'Embedded content';
    return `<iframe src="${src}" width="${width}" height="${height}" title="${title}" frameborder="0" allowfullscreen loading="lazy" referrerpolicy="no-referrer"></iframe>`;
}

function toggleNightField(section) {
    const nightGroup = document.getElementById('night-group');
    if (section === 'beavers' || section === 'cubs' || section === 'scouts') {
        nightGroup.style.display = '';
    } else {
        nightGroup.style.display = 'none';
        document.getElementById('announcement-night').value = '';
    }
}

function openAnnouncementModal(announcement = null) {
    const modal = document.getElementById('announcement-modal');
    const title = document.getElementById('announcement-modal-title');
    const form = document.getElementById('announcement-form');

    form.reset();
    document.getElementById('announcement-edit-id').value = '';
    quill.root.innerHTML = '';

    if (announcement) {
        title.textContent = 'Edit Announcement';
        document.getElementById('announcement-edit-id').value = announcement.id;
        document.getElementById('announcement-title').value = announcement.title;
        quill.root.innerHTML = announcement.body;
        document.getElementById('announcement-section').value = announcement.section;
        document.getElementById('announcement-night').value = announcement.meeting_night || '';
        document.getElementById('announcement-date').value = announcement.date_display;
        document.getElementById('announcement-pinned').checked = announcement.pinned_home;
        toggleNightField(announcement.section);
    } else {
        title.textContent = 'New Announcement';
        // Default date to today
        const today = new Date().toLocaleDateString('en-IE', { month: 'long', day: 'numeric', year: 'numeric' });
        document.getElementById('announcement-date').value = today;
        toggleNightField('general');
    }

    modal.classList.add('active');
}

function closeAnnouncementModal() {
    document.getElementById('announcement-modal').classList.remove('active');
}

async function loadAnnouncements() {
    const { data, error } = await sb
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        showToast('Failed to load announcements.', true);
        return;
    }

    const container = document.getElementById('announcement-list');
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color: var(--color-text-muted);">No announcements yet.</p>';
        return;
    }

    container.innerHTML = data.map(a => `
        <div class="announcement-item">
            <div class="announcement-item-content">
                <h4>${escapeHtml(a.title)}</h4>
                <div class="announcement-item-meta">
                    <span class="badge badge--${a.section === 'all' ? '' : a.section}">${formatSection(a.section)}</span>
                    <span>${escapeHtml(a.date_display)}</span>
                    ${a.pinned_home ? '<span>📌 Pinned</span>' : ''}
                </div>
            </div>
            <div class="announcement-item-actions">
                <button class="btn-secondary btn-sm" onclick="editAnnouncement('${a.id}')">Edit</button>
                <button class="btn-danger btn-sm" onclick="deleteAnnouncement('${a.id}', '${escapeHtml(a.title)}')">Delete</button>
            </div>
        </div>
    `).join('');

    // Store data for editing
    window._announcements = data;
}

async function saveAnnouncement() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;

    const editId = document.getElementById('announcement-edit-id').value;
    const title = document.getElementById('announcement-title').value.trim();
    const body = quill.root.innerHTML.trim();
    const section = document.getElementById('announcement-section').value;
    const meetingNight = document.getElementById('announcement-night').value || null;
    const dateDisplay = document.getElementById('announcement-date').value.trim();
    const pinned = document.getElementById('announcement-pinned').checked;

    if (!body || body === '<p><br></p>') {
        showToast('Content cannot be empty.', true);
        return;
    }

    // Generate slug from title
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editId) {
        const { error } = await sb
            .from('announcements')
            .update({
                title, body, section,
                meeting_night: meetingNight,
                date_display: dateDisplay,
                pinned_home: pinned,
                slug,
                updated_at: new Date().toISOString()
            })
            .eq('id', editId);

        if (error) {
            showToast('Failed to update announcement.', true);
            return;
        }
        showToast('Announcement updated!');
    } else {
        const { error } = await sb
            .from('announcements')
            .insert({
                title, body, section,
                meeting_night: meetingNight,
                date_display: dateDisplay,
                pinned_home: pinned,
                slug,
                author_id: session.user.id
            });

        if (error) {
            if (error.code === '23505') {
                showToast('An announcement with a similar title already exists (duplicate slug).', true);
            } else {
                showToast('Failed to create announcement.', true);
            }
            return;
        }
        showToast('Announcement created!');
    }

    closeAnnouncementModal();
    loadAnnouncements();
}

window.editAnnouncement = function(id) {
    const announcement = window._announcements?.find(a => a.id === id);
    if (announcement) openAnnouncementModal(announcement);
};

window.deleteAnnouncement = async function(id, title) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;

    const { error } = await sb
        .from('announcements')
        .delete()
        .eq('id', id);

    if (error) {
        showToast('Failed to delete announcement.', true);
    } else {
        showToast('Announcement deleted.');
        loadAnnouncements();
    }
};

/* ---- USER MANAGEMENT ---- */
function initUserUI() {
    document.getElementById('btn-new-user').addEventListener('click', () => {
        document.getElementById('user-modal').classList.add('active');
    });

    document.getElementById('btn-cancel-user').addEventListener('click', () => {
        document.getElementById('user-modal').classList.remove('active');
    });

    document.getElementById('user-modal').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            document.getElementById('user-modal').classList.remove('active');
        }
    });

    document.getElementById('new-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        await createNewUser();
    });
}

async function loadUsers() {
    const { data, error } = await sb
        .from('profiles')
        .select('*')
        .order('username');

    if (error) return;

    const { data: { session } } = await sb.auth.getSession();
    const currentUserId = session?.user?.id;

    const container = document.getElementById('user-list');
    container.innerHTML = data.map(u => `
        <div class="user-item ${u.is_suspended ? 'suspended' : ''}">
            <div class="user-item-info">
                <div class="user-avatar">
                    ${u.avatar_url ? `<img src="${u.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : '👤'}
                </div>
                <div class="user-item-details">
                    <strong>${escapeHtml(u.display_name || u.username)}${u.is_suspended ? '<span class="badge-suspended">SUSPENDED</span>' : ''}</strong>
                    <span>@${escapeHtml(u.username)}${u.section ? ' · ' + formatSection(u.section) : ''}</span>
                </div>
            </div>
            ${u.id !== currentUserId ? `
                <button class="btn-sm ${u.is_suspended ? 'btn-primary' : 'btn-danger'}" 
                        onclick="toggleSuspend('${u.id}', ${!u.is_suspended})">
                    ${u.is_suspended ? 'Unsuspend' : 'Suspend'}
                </button>
            ` : '<span style="font-size:0.8rem;color:var(--color-text-muted);">You</span>'}
        </div>
    `).join('');
}

window.toggleSuspend = async function(userId, suspend) {
    const action = suspend ? 'suspend' : 'unsuspend';
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    const { error } = await sb
        .from('profiles')
        .update({ is_suspended: suspend })
        .eq('id', userId);

    if (error) {
        showToast(`Failed to ${action} user.`, true);
    } else {
        showToast(`User ${action}ed.`);
        loadUsers();
    }
};

async function createNewUser() {
    const username = document.getElementById('new-user-username').value.trim().toLowerCase();
    const displayName = document.getElementById('new-user-display-name').value.trim();

    if (!username || !displayName) {
        showToast('Please fill in all fields.', true);
        return;
    }

    // Use Supabase Auth signup (this works because we allow signups via the API)
    // Note: This uses the anon key. For production, you'd use an Edge Function with service_role.
    // For this small group, we enable signup in Supabase dashboard settings.
    const { data, error } = await sb.auth.signUp({
        email: username + EMAIL_DOMAIN,
        password: '5c0ut543v3r!'
    });

    if (error) {
        if (error.message.includes('already registered')) {
            showToast('Username already exists.', true);
        } else {
            showToast('Failed to create user: ' + error.message, true);
        }
        return;
    }

    // Update the auto-created profile with the display name
    if (data.user) {
        await sb
            .from('profiles')
            .update({ display_name: displayName })
            .eq('id', data.user.id);
    }

    showToast(`Account created for ${displayName}!`);
    document.getElementById('user-modal').classList.remove('active');
    document.getElementById('new-user-form').reset();
    loadUsers();
}

/* ---- HELPERS ---- */
function formatSection(section) {
    const map = {
        'beavers': 'Beavers',
        'cubs': 'Cubs',
        'scouts': 'Scouts',
        'ventures': 'Ventures',
        'rovers': 'Rovers',
        'all': 'All Sections',
        'general': 'General'
    };
    return map[section] || section;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function showToast(message, isError = false) {
    const toast = document.getElementById('admin-toast');
    toast.textContent = message;
    toast.className = 'admin-toast visible' + (isError ? ' error' : '');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}
