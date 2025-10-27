from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch()
    page = browser.new_page()
    page.goto("http://localhost:5173")
    page.click('button:text("สร้างลูกค้าใหม่")')
    page.wait_for_selector('[data-testid="name-input"]')
    page.fill('[data-testid="name-input"]', "Jules")
    page.screenshot(path="jules-scratch/verification/verification.png")
    browser.close()

with sync_playwright() as playwright:
    run(playwright)
