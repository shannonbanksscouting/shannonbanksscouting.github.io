-- ============================================
-- Shannon Banks Scouting - Seed Announcements
-- Run AFTER schema.sql and AFTER creating users
-- ============================================

-- Seed all 18 existing announcements from the static HTML pages
-- Note: author_id is left NULL for seeded content (historical posts)

INSERT INTO public.announcements (title, body, section, meeting_night, date_display, pinned_home, slug, created_at) VALUES

-- ===== GROUP NEWS (from announcements.html) =====

('50th Anniversary Group Camp — Killaloe',
 '<p><strong>5th to 7th June 2026</strong> at Killaloe Scout Campsite (Clarisford).</p><p>To celebrate 50 years of Scouting in Shannon Banks, we''re holding a group camp with all sections together — Beavers, Cubs, Scouts, Venturers and Rovers. It will be similar to the group camp held last year in Shannon.</p><p>Members are welcome to come and go if they have other commitments. More information including cost and programme will follow closer to the date — <strong>please save the date!</strong></p>',
 'all', NULL, 'May 2026', true, 'group-camp-2026', '2026-05-20T10:00:00Z'),

('Scout County Shield — Visitors Welcome',
 '<p>The Scout County Shield takes place in <strong>Pallaskenry over the weekend of 15th to 17th May 2026</strong>. Shannon Banks is sending three patrols of 8 scouts — a huge turnout!</p><p>There''s an opportunity for anyone to visit on <strong>Saturday evening between 8pm and 9pm</strong> to view the fantastic sites that each of the 20+ teams have put together. A wonderful opportunity for younger members to see what lies in store for them in the years ahead.</p>',
 'scouts', 'friday', 'May 2026', false, 'scout-shield-2026', '2026-05-14T10:00:00Z'),

('Scouter Changes for 2026/2027',
 '<p>Shane Riordan will take over as Scout Leader from Mike Ryan. Caitlín Ní Chaoindealbháin becomes the new Cub Leader. Evelyn moves from Cubs to Scouts. Eibhlín and Martin remain with Cubs.</p>',
 'all', NULL, 'May 2026', false, 'leader-changes-2026', '2026-05-10T10:00:00Z'),

('Volunteers Wanted!',
 '<p>We''re always looking for parents and adults who might be interested in becoming Scouters. No prior experience is required — full training is provided by Scouting Ireland.</p><p>If you''re interested, please contact <a href="mailto:ryanml64@gmail.com">ryanml64@gmail.com</a>.</p>',
 'all', NULL, 'May 2026', false, 'volunteers', '2026-05-08T10:00:00Z'),

('Welcome to Our New Website!',
 '<p>We''re delighted to launch our new group website! This will be the go-to place for schedules, forms, news, and resources for all sections.</p>',
 'general', NULL, 'June 2025', false, 'welcome', '2025-06-01T10:00:00Z'),

-- ===== BEAVER NEWS (from announcements-beavers.html) =====

('No Meeting Tonight — Tuesday, May 26th',
 '<p>There is no Beaver meeting tonight (Tuesday, May 26th). This is a scheduled break following our Bunratty Castle county event last weekend.</p><p>Meetings resume on <strong>Tuesday, June 2nd</strong> for our End of Year Party!</p>',
 'beavers', 'tuesday', 'May 26, 2026', false, 'no-meeting-may-26', '2026-05-26T10:00:00Z'),

('End of Year Party — Tuesday, June 2nd',
 '<p><strong>Time:</strong> 6:30–8:00 PM at the Scout Hall, Shannon Banks.</p><p>A celebration of all our year''s adventures — hikes, our overnight camp, and the Bunratty county event. All Beavers welcome!</p>',
 'beavers', 'tuesday', 'June 2, 2026', false, 'end-of-year-party', '2026-05-25T10:00:00Z'),

('Group Camp — Killaloe — Saturday, June 6th',
 '<p>The 50th Anniversary Group Camp is an all-section event at Killaloe Scout Campsite (Clarisford). Details and forms to follow.</p>',
 'beavers', 'tuesday', 'June 6, 2026', false, 'group-camp-killaloe', '2026-05-24T12:00:00Z'),

('County Beaver Event — Bunratty Castle',
 '<p>On Sunday, May 24th our Beavers explored Bunratty Castle and the folk village as part of a county event. Thanks to all the parent helpers who made it possible!</p>',
 'beavers', 'tuesday', 'May 24, 2026', false, 'bunratty-recap', '2026-05-24T10:00:00Z'),

('Overnight Camp — A Huge Success!',
 '<p>On Friday, May 22nd, 12 Beavers attended our overnight camp. Activities included hot dogs, campfire s''mores, a movie under the stars, and breakfast the next morning. Thanks to our 5 leaders and parent volunteers!</p>',
 'beavers', 'tuesday', 'May 22, 2026', false, 'overnight-camp-recap', '2026-05-22T10:00:00Z'),

('Volunteers Needed for September!',
 '<p>Andy is stepping down at the end of the year. We need at least one new adult for the Tuesday Beaver team. Joe, Alina, and Amy are continuing.</p><p>Garda vetting and training can be completed over the summer. Contact Andy or speak to any of the leaders if interested.</p>',
 'beavers', 'tuesday', 'May 2026', false, 'volunteers-needed', '2026-05-15T10:00:00Z'),

-- ===== CUB NEWS (from announcements-cubs.html) =====

('No Cub Meeting — Thursday 14th May',
 '<p>There is no Cub meeting this Thursday (14th May) as the Scouts are using the hall for Shield preparation. Normal meetings resume the following Thursday.</p>',
 'cubs', 'thursday', 'May 7, 2026', false, 'no-meeting-14-may', '2026-05-07T10:00:00Z'),

('Group Camp — Killaloe, 5th–7th June',
 '<p>Killaloe Scout Campsite (Clarisford), 5–7 June 2026. 50th Anniversary multi-section event (similar to last year''s Shannon camp). Cubs can attend flexibly. Details and cost to follow.</p>',
 'cubs', 'thursday', 'May 7, 2026', false, 'group-camp', '2026-05-07T09:00:00Z'),

('National Cub Challenge — Dublin',
 '<p>Our "Icebreaker Six" won Gold and First Place at the County Challenge. They have been selected for the <strong>National Challenge on 20–21 June in Dublin</strong> (Larch Hill Scout Campsite). The team camps Friday 19th overnight. Training sessions are ongoing. Parent volunteers needed for transport.</p>',
 'cubs', 'thursday', 'May 2026', false, 'national-cub-challenge', '2026-05-07T08:00:00Z'),

('Moving Up to Scouts',
 '<p>7 cubs born in 2014 will finish Cubs in June 2026 and move to Scouts in September 2026. 3 cubs with Jan–Apr 2015 births are overage for the 2027 Challenge — they have the option to stay in Cubs but are ineligible for competition. Parents should speak to Shane.</p>',
 'cubs', 'thursday', 'May 7, 2026', false, 'moving-up', '2026-05-07T07:00:00Z'),

('Scouter Changes from September 2026',
 '<p><strong>Evelyn</strong> is retiring from Cubs (6 years) and moving to Scouts. <strong>Shane</strong> is finishing as Cub Leader and moving to the Scout Troop. <strong>Caitlín Ní Chaoindealbháin</strong> takes over as Cub Leader (experienced, led last 2 County Challenges). <strong>Eibhlín &amp; Martin</strong> remain.</p>',
 'cubs', 'thursday', 'May 7, 2026', false, 'leader-changes', '2026-05-07T06:00:00Z'),

('End of Year — Final Meeting',
 '<p>The final 2025/2026 Cub meeting is <strong>Thursday 25th June 2026</strong>.</p>',
 'cubs', 'thursday', 'May 7, 2026', false, 'end-of-year', '2026-05-07T05:00:00Z'),

-- ===== SCOUT NEWS (from announcements-scouts.html) =====

('Lillyflots Boats & Group Camp in Clarisfort',
 '<p><strong>This Friday:</strong> Lillyflots boats 7:00–9:00 PM (bring change of clothes, apply sun cream).</p><p><strong>Following weekend:</strong> Group camp in Clarisfort, Killaloe (Fri–Sun).</p><p><strong>Cost:</strong> €30 (includes Ballina outdoor pool swim). RSVP needed.</p>',
 'scouts', 'friday', 'May 2026', false, 'lillyflots-and-group-camp', '2026-05-28T10:00:00Z'),

('Gold Standard at the Scout County Shield!',
 '<p>Our Scouts achieved <strong>Gold Standard in Campcraft</strong> at the County Shield in Pallaskenry. Three patrols of 8 scouts — a huge turnout! Leaders are very proud.</p>',
 'scouts', 'friday', 'May 2026', false, 'shield-gold-standard', '2026-05-18T10:00:00Z'),

('No Scout Meeting This Friday',
 '<p>There is no Scout meeting this Friday — Beavers have their overnight camp in the field. Meetings resume the following Friday.</p>',
 'scouts', 'friday', 'May 2026', false, 'no-meeting-friday', '2026-05-16T10:00:00Z'),

('Help Needed — Wednesday 7:30pm',
 '<p>Volunteers needed <strong>Wednesday at 7:30 PM</strong> to unload the trailer and fold tents from the Shield. All parents welcome!</p>',
 'scouts', 'friday', 'May 2026', false, 'help-wednesday', '2026-05-19T10:00:00Z'),

('Lost Scout Shirt — Pallaskenry',
 '<p>A Scout shirt was left behind at Pallaskenry after the Shield. A leader has it — check with your Scout to see if it''s theirs.</p>',
 'scouts', 'friday', 'May 2026', false, 'lost-shirt', '2026-05-18T08:00:00Z');
