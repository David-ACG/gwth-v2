-- W26: restore the punctuation stripped out of the Month-1 lesson titles.
--
-- An earlier sweep removed the em dashes (banned in UI copy) but put nothing in
-- their place, so 22 of the 26 titles read as run-on sentences everywhere they
-- appear: the dashboard outline, the course page, the lesson H1 and the browser
-- tab. This restores a colon where the em dash was and the commas the source
-- syllabus carried in the list-like titles
-- (1_gwthpipeline520/docs/Syllabus Manager/gwth-month1-redesign-v2-feb2026.md),
-- keeps the existing capitalisation, and corrects one Americanism.
--
-- Titles only. Slugs are untouched, so no URL changes and no redirects needed.
-- Lessons 3, 4, 15 and 19 already read correctly and are absent by design.
--
-- Copy cleared the Codex tone gate on the punctuation delta (W26 packet).
--
-- Apply:
--   ssh hetzner 'docker exec -i zo0gkcwoo0o4gow0go4cwk0o psql -U gwth -d gwth_v2' \
--     < deploy/w26-lesson-title-punctuation.sql
-- Roll back with the CSV captured alongside it in completion/W26/.

BEGIN;

UPDATE lessons SET title = 'Welcome to GWTH: Six Ways AI Can Give You Superpowers' WHERE id = 'm1_l01';
UPDATE lessons SET title = 'Your AI Colleague: How to Get Brilliant Help Without Giving Up Your Judgement' WHERE id = 'm1_l02';
UPDATE lessons SET title = 'Frontier Labs Tooling: OpenAI, Anthropic, Google and What to Use When' WHERE id = 'm1_l05';
UPDATE lessons SET title = 'Research Superpower: Find, Compare and Verify Anything' WHERE id = 'm1_l06';
UPDATE lessons SET title = 'Content Superpower: Write, Design and Communicate in Your Voice' WHERE id = 'm1_l07';
UPDATE lessons SET title = 'Thinking Superpower: Plan, Decide and Learn Faster' WHERE id = 'm1_l08';
UPDATE lessons SET title = 'Building Superpower: Make Your First Useful Thing Without Coding' WHERE id = 'm1_l09';
UPDATE lessons SET title = 'Data Superpower: Turn Messy Information Into Answers' WHERE id = 'm1_l10';
UPDATE lessons SET title = 'Automation Superpower: Save Time by Connecting Repeatable Steps' WHERE id = 'm1_l11';
UPDATE lessons SET title = 'Agents Superpower: AI That Can Do Things for You' WHERE id = 'm1_l12';
UPDATE lessons SET title = 'Agent Safety: How to Stay in Control' WHERE id = 'm1_l13';
UPDATE lessons SET title = 'CV and LinkedIn Upgrade: Tell Your Story Better with AI' WHERE id = 'm1_l14';
UPDATE lessons SET title = 'AI Presentations and Websites: Make Ideas Visible' WHERE id = 'm1_l16';
UPDATE lessons SET title = 'AI Data Dashboards: Turn Numbers Into Decisions' WHERE id = 'm1_l17';
UPDATE lessons SET title = 'AI Power Tools: MCPs, CLIs, Skills, Plugins and Connectors' WHERE id = 'm1_l18';
UPDATE lessons SET title = 'AI Efficiency: Better Results for Less Cost' WHERE id = 'm1_l20';
UPDATE lessons SET title = 'FamilyBot Blueprint: Design a Helpful AI for Home Life' WHERE id = 'm1_l21';
UPDATE lessons SET title = 'FamilyBot Listens: Turn Voice Notes or Meetings Into Useful Text' WHERE id = 'm1_l22';
UPDATE lessons SET title = 'FamilyBot Organises: Extract Tasks, Meals, Events and Shopping' WHERE id = 'm1_l23';
UPDATE lessons SET title = 'FamilyBot Shares: Make the Outputs Useful for Real Life' WHERE id = 'm1_l24';
UPDATE lessons SET title = 'Month 1 Portfolio: Show What You Can Now Do with AI' WHERE id = 'm1_l25';
UPDATE lessons SET title = 'Month 1 Review: Your Next Step Towards Month 2' WHERE id = 'm1_l26';

COMMIT;
