"""
Playwright acceptance tests for GWTH-9 deployment on Hetzner (gwth.ai).
Verifies waitlist CTAs, contact form, privacy/terms pages, and messaging updates.
"""
import pytest
from playwright.sync_api import Page, expect

BASE_URL = "https://gwth.ai"


class TestHomePage:
    """Landing page CTA and messaging tests."""

    def test_hero_waitlist_cta(self, page: Page):
        page.goto(f"{BASE_URL}/")
        hero_cta = page.locator("a", has_text="Join the Earlybird Waitlist").first
        expect(hero_cta).to_be_visible()
        expect(hero_cta).to_have_attribute("href", "/signup")

    def test_hero_tech_radar_cta(self, page: Page):
        page.goto(f"{BASE_URL}/")
        radar_cta = page.locator("a", has_text="Explore the Tech Radar").first
        expect(radar_cta).to_be_visible()

    def test_pricing_section_waitlist_cta(self, page: Page):
        page.goto(f"{BASE_URL}/")
        pricing_cta = page.locator("a", has_text="Join the Waitlist").first
        expect(pricing_cta).to_be_visible()

    def test_final_cta_waitlist(self, page: Page):
        page.goto(f"{BASE_URL}/")
        waitlist_links = page.locator("a", has_text="Join the Earlybird Waitlist")
        expect(waitlist_links.first).to_be_visible()

    def test_no_create_free_account(self, page: Page):
        page.goto(f"{BASE_URL}/")
        assert page.locator("text=Create Free Account").count() == 0

    def test_no_start_learning(self, page: Page):
        page.goto(f"{BASE_URL}/")
        assert page.locator("a", has_text="Start Learning").count() == 0

    def test_why_you_should_care_messaging(self, page: Page):
        page.goto(f"{BASE_URL}/")
        expect(page.locator("text=why it matters to you").first).to_be_visible()

    def test_enjoyable_messaging(self, page: Page):
        page.goto(f"{BASE_URL}/")
        expect(page.locator("text=practical, enjoyable, and immediately useful").first).to_be_visible()


class TestNavigation:
    """Nav bar CTA tests."""

    def test_nav_waitlist_cta_desktop(self, page: Page):
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto(f"{BASE_URL}/")
        nav_cta = page.locator("nav a", has_text="Join the Waitlist").first
        expect(nav_cta).to_be_visible()

    def test_no_create_free_account_in_nav(self, page: Page):
        page.set_viewport_size({"width": 1280, "height": 800})
        page.goto(f"{BASE_URL}/")
        assert page.locator("nav >> text=Create Free Account").count() == 0


class TestPricingPage:
    """Pricing page CTA and contact updates."""

    def test_free_tier_waitlist(self, page: Page):
        page.goto(f"{BASE_URL}/pricing")
        expect(page.locator("a", has_text="Join the Waitlist").first).to_be_visible()

    def test_course_tier_earlybird(self, page: Page):
        page.goto(f"{BASE_URL}/pricing")
        expect(page.locator("a", has_text="Join the Earlybird Waitlist").first).to_be_visible()

    def test_no_start_free(self, page: Page):
        page.goto(f"{BASE_URL}/pricing")
        assert page.locator("a", has_text="Start Free").count() == 0

    def test_no_teams_email(self, page: Page):
        page.goto(f"{BASE_URL}/pricing")
        assert page.locator("text=teams@gwth.ai").count() == 0

    def test_get_in_touch_link(self, page: Page):
        page.goto(f"{BASE_URL}/pricing")
        get_in_touch = page.locator("a", has_text="Get in Touch").first
        expect(get_in_touch).to_be_visible()
        expect(get_in_touch).to_have_attribute("href", "/contact")

    def test_earlybird_note(self, page: Page):
        page.goto(f"{BASE_URL}/pricing")
        expect(page.locator("text=earlybird testers").first).to_be_visible()


class TestForTeamsPage:
    """For Teams page contact and messaging updates."""

    def test_no_teams_email(self, page: Page):
        page.goto(f"{BASE_URL}/for-teams")
        assert page.locator("text=teams@gwth.ai").count() == 0

    def test_get_in_touch_link(self, page: Page):
        page.goto(f"{BASE_URL}/for-teams")
        get_in_touch = page.locator("a", has_text="Get in Touch").first
        expect(get_in_touch).to_be_visible()
        expect(get_in_touch).to_have_attribute("href", "/contact")

    def test_why_you_should_care_teams(self, page: Page):
        page.goto(f"{BASE_URL}/for-teams")
        expect(page.locator("text=why it matters").first).to_be_visible()


class TestTechRadarPage:
    """Tech Radar CTA updates."""

    def test_earlybird_cta(self, page: Page):
        page.goto(f"{BASE_URL}/tech-radar")
        expect(page.locator("a", has_text="Join the Earlybird Waitlist").first).to_be_visible()

    def test_no_start_learning(self, page: Page):
        page.goto(f"{BASE_URL}/tech-radar")
        assert page.locator("a", has_text="Start Learning").count() == 0


class TestAboutPage:
    """About page messaging updates."""

    def test_four_principles(self, page: Page):
        page.goto(f"{BASE_URL}/about")
        expect(page.locator("text=Four principles").first).to_be_visible()

    def test_why_you_should_care_principle(self, page: Page):
        page.goto(f"{BASE_URL}/about")
        expect(page.locator("text=Why you should care").first).to_be_visible()


class TestSignupPage:
    """Signup/waitlist page updates."""

    def test_waitlist_heading(self, page: Page):
        page.goto(f"{BASE_URL}/signup")
        expect(page.locator("text=Join the Earlybird Waitlist").first).to_be_visible()

    def test_waitlist_description(self, page: Page):
        page.goto(f"{BASE_URL}/signup")
        expect(page.locator("text=first to access the course").first).to_be_visible()

    def test_waitlist_submit_button(self, page: Page):
        page.goto(f"{BASE_URL}/signup")
        expect(page.locator("button", has_text="Join the Waitlist").first).to_be_visible()


class TestContactPage:
    """Contact form page tests."""

    def test_renders_heading(self, page: Page):
        page.goto(f"{BASE_URL}/contact")
        expect(page.locator("h1", has_text="Get in Touch")).to_be_visible()

    def test_renders_form_fields(self, page: Page):
        page.goto(f"{BASE_URL}/contact")
        expect(page.locator("label", has_text="Name")).to_be_visible()
        expect(page.locator("label", has_text="Email")).to_be_visible()
        expect(page.locator("label", has_text="Message")).to_be_visible()

    def test_renders_submit_button(self, page: Page):
        page.goto(f"{BASE_URL}/contact")
        expect(page.locator("button", has_text="Send Message")).to_be_visible()

    def test_no_email_addresses(self, page: Page):
        page.goto(f"{BASE_URL}/contact")
        assert page.locator("text=teams@gwth.ai").count() == 0
        assert page.locator("text=support@gwth.ai").count() == 0


class TestPrivacyPage:
    """Privacy policy page tests."""

    def test_renders_heading(self, page: Page):
        page.goto(f"{BASE_URL}/privacy")
        expect(page.locator("h1", has_text="Privacy Policy")).to_be_visible()

    def test_renders_date(self, page: Page):
        page.goto(f"{BASE_URL}/privacy")
        expect(page.locator("text=25 February 2026").first).to_be_visible()

    def test_no_email_addresses(self, page: Page):
        page.goto(f"{BASE_URL}/privacy")
        content = page.content()
        assert "support@gwth.ai" not in content
        assert "teams@gwth.ai" not in content

    def test_no_physical_addresses(self, page: Page):
        page.goto(f"{BASE_URL}/privacy")
        content = page.content()
        assert "London" not in content
        assert "United Kingdom" not in content

    def test_links_to_contact(self, page: Page):
        page.goto(f"{BASE_URL}/privacy")
        contact_link = page.locator("a[href='/contact']").first
        expect(contact_link).to_be_visible()


class TestTermsPage:
    """Terms and conditions page tests."""

    def test_renders_heading(self, page: Page):
        page.goto(f"{BASE_URL}/terms")
        expect(page.locator("h1", has_text="Terms")).to_be_visible()

    def test_renders_date(self, page: Page):
        page.goto(f"{BASE_URL}/terms")
        expect(page.locator("text=25 February 2026").first).to_be_visible()

    def test_has_table_of_contents(self, page: Page):
        page.goto(f"{BASE_URL}/terms")
        toc = page.locator("nav")
        expect(toc.first).to_be_visible()

    def test_no_email_addresses(self, page: Page):
        page.goto(f"{BASE_URL}/terms")
        content = page.content()
        assert "support@gwth.ai" not in content
        assert "teams@gwth.ai" not in content

    def test_no_physical_addresses(self, page: Page):
        page.goto(f"{BASE_URL}/terms")
        content = page.content()
        assert "London" not in content
        assert "United Kingdom" not in content

    def test_links_to_contact(self, page: Page):
        page.goto(f"{BASE_URL}/terms")
        contact_link = page.locator("a[href='/contact']").first
        expect(contact_link).to_be_visible()


class TestFooter:
    """Footer contact link test."""

    def test_contact_link_in_footer(self, page: Page):
        page.goto(f"{BASE_URL}/")
        footer = page.locator("footer")
        contact_link = footer.locator("a", has_text="Contact")
        expect(contact_link.first).to_be_visible()
        expect(contact_link.first).to_have_attribute("href", "/contact")


class TestNoMailtoLinks:
    """Verify no mailto: links remain on key pages."""

    @pytest.mark.parametrize("path", ["/", "/pricing", "/for-teams", "/tech-radar", "/about", "/contact", "/privacy", "/terms"])
    def test_no_mailto_links(self, page: Page, path: str):
        page.goto(f"{BASE_URL}{path}")
        mailto_links = page.locator("a[href^='mailto:']")
        assert mailto_links.count() == 0, f"Found mailto: links on {path}"
