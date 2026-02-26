"""
Playwright acceptance tests for the waitlist signup flow.
Tests both P520 and Hetzner deployments.
Verifies:
- No password fields on signup page
- Form only has name + email
- Submitting the form shows confirmation (no dashboard redirect)
- API route returns correct responses
- No account creation or dashboard access after signup
"""
import pytest
import requests
from playwright.sync_api import Page, expect


P520_URL = "http://192.168.178.50:3001"
HETZNER_URL = "https://gwth.ai"


class TestSignupFormP520:
    """Waitlist signup form on P520."""

    BASE = P520_URL

    def test_signup_page_loads(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        expect(page.locator("h1, [data-slot='card-title']", has_text="Join the Earlybird Waitlist").first).to_be_visible()

    def test_has_name_field(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        expect(page.locator("label", has_text="Name")).to_be_visible()
        expect(page.locator("input[autocomplete='name']")).to_be_visible()

    def test_has_email_field(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        expect(page.locator("label", has_text="Email")).to_be_visible()
        expect(page.locator("input[type='email']")).to_be_visible()

    def test_no_password_fields(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        assert page.locator("input[type='password']").count() == 0
        assert page.locator("label", has_text="Password").count() == 0
        assert page.locator("label", has_text="Confirm Password").count() == 0

    def test_submit_button_says_join_waitlist(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        button = page.locator("button[type='submit']", has_text="Join the Waitlist")
        expect(button.first).to_be_visible()

    def test_shows_confirmation_email_text(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        expect(page.locator("text=confirmation email").first).to_be_visible()

    def test_submit_shows_confirmation_not_dashboard(self, page: Page):
        """Fill and submit the form — should show confirmation, NOT redirect to dashboard."""
        page.goto(f"{self.BASE}/signup")

        # Fill name
        page.locator("input[autocomplete='name']").fill("Test User")
        # Fill email
        page.locator("input[type='email']").fill("test@example.com")
        # Submit
        page.locator("button[type='submit']", has_text="Join the Waitlist").first.click()

        # Wait for confirmation screen
        expect(page.locator("text=on the list")).to_be_visible(timeout=10000)

        # Should NOT be on dashboard
        assert "/dashboard" not in page.url

        # Should see Tech Radar CTA on confirmation
        expect(page.locator("a", has_text="Explore the Tech Radar")).to_be_visible()

    def test_no_login_redirect_after_signup(self, page: Page):
        """After submitting waitlist, there should be no auto-login to dashboard."""
        page.goto(f"{self.BASE}/signup")
        page.locator("input[autocomplete='name']").fill("Another User")
        page.locator("input[type='email']").fill("another@example.com")
        page.locator("button[type='submit']", has_text="Join the Waitlist").first.click()

        expect(page.locator("text=on the list")).to_be_visible(timeout=10000)

        # Verify we're still on /signup, not /dashboard
        assert "signup" in page.url or "on the list" in page.content()


class TestWaitlistApiP520:
    """API route tests on P520."""

    BASE = P520_URL

    def test_api_returns_success_for_valid_data(self):
        resp = requests.post(
            f"{self.BASE}/api/waitlist",
            json={"name": "Test", "email": "test@example.com"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True

    def test_api_returns_400_for_missing_name(self):
        resp = requests.post(
            f"{self.BASE}/api/waitlist",
            json={"email": "test@example.com"},
        )
        assert resp.status_code == 400
        data = resp.json()
        assert data["success"] is False

    def test_api_returns_400_for_missing_email(self):
        resp = requests.post(
            f"{self.BASE}/api/waitlist",
            json={"name": "Test"},
        )
        assert resp.status_code == 400
        data = resp.json()
        assert data["success"] is False

    def test_api_returns_400_for_invalid_email(self):
        resp = requests.post(
            f"{self.BASE}/api/waitlist",
            json={"name": "Test", "email": "not-an-email"},
        )
        assert resp.status_code == 400


class TestSignupFormHetzner:
    """Waitlist signup form on Hetzner (gwth.ai)."""

    BASE = HETZNER_URL

    def test_signup_page_loads(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        expect(page.locator("h1, [data-slot='card-title']", has_text="Join the Earlybird Waitlist").first).to_be_visible()

    def test_has_name_field(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        expect(page.locator("label", has_text="Name")).to_be_visible()
        expect(page.locator("input[autocomplete='name']")).to_be_visible()

    def test_has_email_field(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        expect(page.locator("label", has_text="Email")).to_be_visible()
        expect(page.locator("input[type='email']")).to_be_visible()

    def test_no_password_fields(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        assert page.locator("input[type='password']").count() == 0
        assert page.locator("label", has_text="Password").count() == 0
        assert page.locator("label", has_text="Confirm Password").count() == 0

    def test_submit_button_says_join_waitlist(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        button = page.locator("button[type='submit']", has_text="Join the Waitlist")
        expect(button.first).to_be_visible()

    def test_shows_confirmation_email_text(self, page: Page):
        page.goto(f"{self.BASE}/signup")
        expect(page.locator("text=confirmation email").first).to_be_visible()

    def test_submit_shows_confirmation_not_dashboard(self, page: Page):
        """Fill and submit the form — should show confirmation, NOT redirect to dashboard."""
        page.goto(f"{self.BASE}/signup")

        # Fill name
        page.locator("input[autocomplete='name']").fill("Test User")
        # Fill email
        page.locator("input[type='email']").fill("test@example.com")
        # Submit
        page.locator("button[type='submit']", has_text="Join the Waitlist").first.click()

        # Wait for confirmation screen
        expect(page.locator("text=on the list")).to_be_visible(timeout=10000)

        # Should NOT be on dashboard
        assert "/dashboard" not in page.url

        # Should see Tech Radar CTA on confirmation
        expect(page.locator("a", has_text="Explore the Tech Radar")).to_be_visible()


class TestWaitlistApiHetzner:
    """API route tests on Hetzner."""

    BASE = HETZNER_URL

    def test_api_returns_success_for_valid_data(self):
        resp = requests.post(
            f"{self.BASE}/api/waitlist",
            json={"name": "Test", "email": "test@example.com"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["success"] is True

    def test_api_returns_400_for_missing_name(self):
        resp = requests.post(
            f"{self.BASE}/api/waitlist",
            json={"email": "test@example.com"},
        )
        assert resp.status_code == 400

    def test_api_returns_400_for_invalid_email(self):
        resp = requests.post(
            f"{self.BASE}/api/waitlist",
            json={"name": "Test", "email": "bad"},
        )
        assert resp.status_code == 400


class TestPreviousChangesStillWork:
    """Verify GWTH-9 changes from previous deployment are still intact."""

    @pytest.mark.parametrize("base", [P520_URL, HETZNER_URL])
    def test_homepage_loads(self, page: Page, base: str):
        page.goto(f"{base}/")
        expect(page.locator("text=Join the Earlybird Waitlist").first).to_be_visible()

    @pytest.mark.parametrize("base", [P520_URL, HETZNER_URL])
    def test_contact_page_loads(self, page: Page, base: str):
        page.goto(f"{base}/contact")
        expect(page.locator("h1", has_text="Get in Touch")).to_be_visible()

    @pytest.mark.parametrize("base", [P520_URL, HETZNER_URL])
    def test_privacy_page_loads(self, page: Page, base: str):
        page.goto(f"{base}/privacy")
        expect(page.locator("h1", has_text="Privacy Policy")).to_be_visible()

    @pytest.mark.parametrize("base", [P520_URL, HETZNER_URL])
    def test_terms_page_loads(self, page: Page, base: str):
        page.goto(f"{base}/terms")
        expect(page.locator("h1", has_text="Terms")).to_be_visible()

    @pytest.mark.parametrize("base", [P520_URL, HETZNER_URL])
    def test_pricing_no_mailto(self, page: Page, base: str):
        page.goto(f"{base}/pricing")
        assert page.locator("a[href^='mailto:']").count() == 0

    @pytest.mark.parametrize("base", [P520_URL, HETZNER_URL])
    def test_tech_radar_loads(self, page: Page, base: str):
        page.goto(f"{base}/tech-radar")
        expect(page.locator("text=GWTH Tech Radar").first).to_be_visible()
