from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Browser error: {err}"))

    try:
        # 1. Go to Home
        print("Navigating to home...")
        page.goto("http://localhost:3000/")
        page.wait_for_timeout(3000) # Wait for initial load

        # Take a screenshot to debug
        page.screenshot(path="verification/debug_home.png")
        print("Home debug screenshot taken")

        # 2. Navigate to Events
        events_btn = page.get_by_role("button", name="Events")
        if events_btn.is_visible():
            events_btn.click()
            page.wait_for_timeout(1000)
            page.screenshot(path="verification/events_page.png")
            print("Events page screenshot taken")
        else:
            print("Events button not visible")

        # 3. Mock Login via localStorage
        print("Mocking login...")
        page.evaluate("localStorage.setItem('kilo_user', JSON.stringify({id: 'test_user_id', name: 'Test User', role: 'DONOR', email: 'test@example.com'}))")
        page.evaluate("localStorage.setItem('hasHandledNotifications', 'true')")
        page.reload()
        page.wait_for_timeout(3000)
        page.screenshot(path="verification/debug_loggedin.png")

        # 4. Go to Profile
        # Look for "Test User" button or "Profile" text
        profile_btn = page.get_by_role("button", name="Test User")
        if profile_btn.is_visible():
            print("Clicking Profile button...")
            profile_btn.click()
            page.wait_for_timeout(1000)

            # 5. Check History Tab
            print("Clicking History tab...")
            history_tab = page.get_by_text("History", exact=True)
            if history_tab.is_visible():
                history_tab.click()
                page.wait_for_timeout(2000)
                page.screenshot(path="verification/profile_history.png")
                print("Profile History screenshot taken")
            else:
                print("History tab not found")

            # 6. Check Surveys Tab
            print("Clicking Surveys tab...")
            surveys_tab = page.get_by_text("Surveys", exact=True)
            if surveys_tab.is_visible():
                surveys_tab.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="verification/profile_surveys.png")
                print("Profile Surveys screenshot taken")

                # 7. Open Survey (Coral Health)
                print("Opening Coral Health survey...")
                coral_btn = page.get_by_role("button", name="Coral Health")
                if coral_btn.is_visible():
                    coral_btn.click()
                    page.wait_for_timeout(2000)
                    page.screenshot(path="verification/survey_modal.png")
                    print("Survey Modal screenshot taken")
                else:
                    print("Coral Health button not found")
            else:
                print("Surveys tab not found")
        else:
            print("Profile button not found")

    except Exception as e:
        print(f"Script error: {e}")
    finally:
        browser.close()

if __name__ == "__main__":
    with sync_playwright() as playwright:
        run(playwright)
