/* ============================================
   Supabase Public Data Fetching
   Shannon Banks Scouting
   
   Shared functions for rendering dynamic content
   on public-facing pages.
   ============================================ */

/* ---- ANNOUNCEMENTS ---- */

/**
 * Fetch announcements, optionally filtered by section and/or meeting night.
 * @param {string|null} section - Filter by section (e.g. 'beavers'), or null for all.
 * @param {number} limit - Max number of results.
 * @param {string|null} night - Filter by meeting_night (e.g. 'tuesday'), or null for all nights.
 * @returns {Array} announcements
 */
async function fetchAnnouncements(section = null, limit = 50, night = null) {
    let query = sb
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (section) {
        query = query.eq('section', section);
    }

    if (night) {
        // Exact match: show only announcements tagged to this specific night
        query = query.eq('meeting_night', night);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Error fetching announcements:', error);
        return [];
    }
    return data || [];
}

/**
 * Fetch announcements pinned to home page.
 */
async function fetchPinnedAnnouncements() {
    const { data, error } = await sb
        .from('announcements')
        .select('*')
        .eq('pinned_home', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching pinned announcements:', error);
        return [];
    }
    return data || [];
}

/**
 * Fetch the latest announcements (for home page "Latest News" section).
 * @param {number} limit
 */
async function fetchLatestAnnouncements(limit = 3) {
    const { data, error } = await sb
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) {
        console.error('Error fetching latest announcements:', error);
        return [];
    }
    return data || [];
}

/* ---- LEADERS ---- */

/**
 * Fetch leader profiles that are marked to show on the public leaders page.
 */
async function fetchLeaders() {
    const { data, error } = await sb
        .from('profiles')
        .select('display_name, section, meeting_day, title, bio, avatar_url')
        .eq('show_on_leaders_page', true)
        .order('section');

    if (error) {
        console.error('Error fetching leaders:', error);
        return [];
    }
    return data || [];
}

/* ---- RENDERING HELPERS ---- */

/**
 * Render an announcement card (matches existing card HTML structure).
 */
function renderAnnouncementCard(announcement) {
    const sectionClass = announcement.section === 'all' || announcement.section === 'general'
        ? '' : announcement.section;
    const sectionLabel = formatSectionLabel(announcement.section);
    const badgeStyle = announcement.section === 'all'
        ? 'style="background: var(--color-group-red-light); color: var(--color-group-red);"'
        : '';

    return `
        <article class="card announcement-card" id="${escapeAttr(announcement.slug)}" data-aos="fade-up">
            <span class="card-date">${escapeHtml(announcement.date_display)}</span>
            <span class="badge ${sectionClass ? 'badge--' + sectionClass : ''}" ${badgeStyle}>${escapeHtml(sectionLabel)}</span>
            <h3>${escapeHtml(announcement.title)}</h3>
            <div class="announcement-body">${announcement.body}</div>
            <div class="share-actions">
                <button class="share-btn share-btn--whatsapp" data-action="share-whatsapp" data-text="${escapeAttr(announcement.title)}" aria-label="Share on WhatsApp">
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 0 0 .612.613l4.458-1.495A11.952 11.952 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.337 0-4.542-.664-6.41-1.813l-.447-.268-2.648.888.888-2.648-.268-.447A9.96 9.96 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
                </button>
                <button class="share-btn" data-action="copy-link" data-url="${window.location.origin + window.location.pathname}#${escapeAttr(announcement.slug)}" aria-label="Copy link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                </button>
            </div>
        </article>
    `;
}

/**
 * Render a leader card (matches existing leader card HTML structure).
 */
function renderLeaderCard(leader) {
    const sectionClass = leader.section || '';
    const sectionLabel = formatSectionLabel(leader.section);
    const meetingInfo = [leader.meeting_day, sectionLabel].filter(Boolean).join(' ');

    return `
        <div class="card card--accent-top ${sectionClass ? 'card--' + sectionClass : ''} leader-card" data-aos="fade-up">
            <div class="leader-avatar ${sectionClass ? 'leader-avatar--' + sectionClass : ''}">
                ${leader.avatar_url
                    ? `<img src="${escapeAttr(leader.avatar_url)}" alt="${escapeAttr(leader.display_name)}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
                    : '👤'}
            </div>
            <h3>${escapeHtml(leader.display_name)}</h3>
            <p><strong>${escapeHtml(meetingInfo)}</strong>${leader.title ? '<br>' + escapeHtml(leader.title) : ''}</p>
            ${sectionClass ? `<span class="badge badge--${sectionClass}">${escapeHtml(sectionLabel)}</span>` : ''}
        </div>
    `;
}

function formatSectionLabel(section) {
    const map = {
        'beavers': 'Beavers',
        'cubs': 'Cubs',
        'scouts': 'Scouts',
        'ventures': 'Ventures',
        'rovers': 'Rovers',
        'all': 'All Sections',
        'general': 'General'
    };
    return map[section] || section || '';
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
