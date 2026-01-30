import requests
import time
import datetime

URL = "https://dsawithpv.onrender.com/"
INTERVAL = 300  # 5 minutes in seconds

def ping_server():
    while True:
        try:
            print(f"[{datetime.datetime.now()}] Pinging {URL}...")
            response = requests.get(URL)
            if response.status_code == 200:
                print(f"✅ Success! Status Code: {response.status_code}")
            else:
                print(f"⚠️ Warning! Status Code: {response.status_code}")
        except Exception as e:
            print(f"❌ Error pinging server: {e}")
        
        print(f"Serving sleeping for {INTERVAL/60} minutes...")
        time.sleep(INTERVAL)

if __name__ == "__main__":
    print("🚀 Keep-Alive Script Started")
    ping_server()
