import time
import os
from playwright.sync_api import sync_playwright

def run_benchmark():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        try:
            # Navigate
            print("Navigating to Home...")
            page.goto("http://localhost:3000")

            # Click Login in Nav
            print("Navigating to Login...")
            page.get_by_role("button", name="Login").click()

            # Fill Login
            print("Logging in as Admin...")
            page.get_by_placeholder("Email Address").fill("admin@example.com")

            # Select Role ADMIN
            page.locator("select").select_option("ADMIN")

            # Click Sign In
            page.get_by_role("button", name="Sign In").click()

            # Wait for subscription modal (it appears after 1s)
            print("Waiting for subscription modal...")
            try:
                # Wait up to 3 seconds for the modal
                page.wait_for_selector("text=Welcome, admin", timeout=3000)
                print("Modal appeared. Closing...")
                page.get_by_text("Maybe Later").click()
                # Wait for modal to disappear
                page.wait_for_selector("text=Welcome, admin", state="hidden")
            except Exception:
                print("Modal did not appear or timed out waiting for it.")

            # Navigate to Gallery
            print("Navigating to Gallery...")
            # Ensure no overlay
            time.sleep(0.5)
            page.get_by_role("button", name="Kilo a Ko'a").first.click()

            # Wait for Gallery to load
            page.wait_for_selector("text=Nānā Kahaluʻu Monitoring", timeout=10000)

            # Click upload button
            print("Opening upload modal...")
            page.get_by_role("button", name="Community Observation").click()

            # Prepare file upload
            file_input = page.locator("input[type='file']")

            # Start timing
            print("Uploading image...")
            start_time = time.time()

            # Upload file
            file_input.set_input_files(os.path.abspath("benchmark_image.jpg"))

            # Wait for preview image to appear
            # The preview has alt="Preview"
            page.wait_for_selector("img[alt='Preview']", timeout=30000)

            end_time = time.time()

            duration = end_time - start_time
            print(f"BENCHMARK_RESULT: {duration:.4f}")

            # Take screenshot
            os.makedirs("verification", exist_ok=True)
            page.screenshot(path="verification/benchmark_result.png")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification/benchmark_error.png")
            raise e
        finally:
            browser.close()

if __name__ == "__main__":
    run_benchmark()
