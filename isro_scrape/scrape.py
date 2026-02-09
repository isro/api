import json
import os
import re
import time
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from webdriver_manager.chrome import ChromeDriverManager
from bs4 import BeautifulSoup

def normalize_key(key):
    # Remove extra underscores and whitespace, convert to lowercase
    key = key.lower().strip()
    key = re.sub(r'[^a-z0-9\s]', '', key)
    key = re.sub(r'\s+', '_', key)
    return re.sub(r'_+', '_', key)

def get_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    return driver

def scrape():
    base_url = "https://www.isro.gov.in"
    list_url = f"{base_url}/SpacecraftMissions.html"
    
    driver = get_driver()
    try:
        print(f"Navigating to {list_url}")
        driver.get(list_url)
        
        wait = WebDriverWait(driver, 20)
        
        # Wait for the entries dropdown to be present
        # ISRO uses DataTables, usually the dropdown name is 'example_length' or similar
        # Based on typical ISRO page, let's look for a select element
        try:
            dropdown_xpath = "//select[@name='datatable_length' or @name='example_length' or contains(@name, 'length')]"
            dropdown_element = wait.until(EC.presence_of_element_located((By.XPATH, dropdown_xpath)))
            
            select = Select(dropdown_element)
            # 'All' is often represented by '-1' in DataTables
            try:
                select.select_by_value("-1")
            except:
                # If -1 doesn't work, try selecting by visible text 'All'
                select.select_by_visible_text("All")
            
            print("Selected 'All' entries.")
            # Give it a moment to load all rows
            time.sleep(3)
        except Exception as e:
            print(f"Could not find or select 'All' from dropdown: {e}")

        # Now get the page source and parse with BeautifulSoup for faster processing of the list
        soup = BeautifulSoup(driver.page_source, 'html.parser')
        craft_links = soup.find_all("a", {"class": "out"})
        
        new_data = []
        seen_names = set()

        # Extract names and links first to avoid stale element issues if we stayed in Selenium
        missions_to_scrape = []
        for craft in craft_links:
            title = " ".join(craft.text.split()).strip()
            if not title or title in seen_names:
                continue
            
            link = craft["href"]
            if not link.startswith("http"):
                url = f"{base_url}/{link.lstrip('/')}"
            else:
                url = link
            
            missions_to_scrape.append((title, url))
            seen_names.add(title)

        print(f"Found {len(missions_to_scrape)} missions to scrape.")

        for title, url in missions_to_scrape:
            try:
                print(f"Scraping: {title}")
                driver.get(url)
                
                # Wait for detail table
                wait.until(EC.presence_of_element_located((By.TAG_NAME, "table")))
                
                c_soup = BeautifulSoup(driver.page_source, 'html.parser')
                tables = c_soup.find_all("table", {"class": "pContent table table-striped table-bordered"})
                
                dt = {"name": title}
                found_info = False
                
                for table in tables:
                    rows = table.find_all('tr')
                    for row in rows:
                        cols = row.find_all('td')
                        if len(cols) == 2:
                            key = normalize_key(cols[0].text)
                            val = " ".join(cols[1].text.split()).strip()
                            if key and val:
                                dt[key] = val
                                found_info = True
                
                if found_info:
                    new_data.append(dt)
            except Exception as e:
                print(f"Skipping {title} due to error: {e}")

        # Fix for the data.reverse() in-place method bug
        # Using [::-1] creates a new list, which is safer if the user expects a return value
        # or if they want to ensure it's not None.
        reversed_data = new_data[::-1]
        
        # Assign IDs
        for i, item in enumerate(reversed_data):
            item["id"] = i + 1

        # Save to file
        output_path = "data/spacecraft_missions.json"
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        with open(output_path, "w", encoding='utf-8') as f:
            json.dump(reversed_data, f, indent=2, ensure_ascii=False)
        
        print(f"Successfully updated {output_path} with {len(reversed_data)} missions.")

    finally:
        driver.quit()

if __name__ == "__main__":
    scrape()