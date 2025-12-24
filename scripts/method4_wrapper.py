import instaloader
import sys
import json
import re

# Logic adapted from 'superryeti/Instagram-Follower-Scraper/instabot.py'
# Main difference: Outputs JSON to stdout instead of CSV to file, and uses Session ID.

def scrape_method4(username, session_id):
    L = instaloader.Instaloader()
    
    # Login via Session ID
    try:
        if session_id:
             # Manually construct a session compatible with Instaloader if needed, 
             # or just simple header injection if we were raw requests.
             # But Instaloader supports loading session from file.
             # We can mock a session file or just set the cookie.
             # L.context._session.cookies.set('sessionid', session_id)
             # The correct way to inject sessionid without file is tricky in Instaloader public API,
             # but we can try setting the cookie in the requests session.
             L.context._session.cookies.set('sessionid', session_id, domain='.instagram.com')
             L.context._session.cookies.set('sessionid', session_id) # Set for root just in case
        
        # Test connection/login
        # L.get_username_from_id(L.check_profile_id('instagram').userid)
    except Exception as e:
        print(json.dumps({"success": False, "error": f"Session Setup Failed: {str(e)}"}))
        return

    try:
        profile = instaloader.Profile.from_username(L.context, username)
        
        # Method 4 specifically extracted emails using regex
        followers_data = []
        count = 0
        max_followers = 50 # Limit for speed in this demo
        
        for person in profile.get_followers():
             if count >= max_followers:
                 break
                 
             bio = person.biography or ""
             emails = re.findall(r"[a-z0-9\.\-+_]+@[a-z0-9\.\-+_]+\.[a-z]+", bio)
             
             followers_data.append({
                 "username": person.username,
                 "full_name": person.full_name,
                 "id": str(person.userid),
                 "biography": bio,
                 "follower_count": person.followers,
                 "email": emails[0] if emails else None,  # M4 special feature
                 "is_verified": person.is_verified,
                 "is_private": person.is_private
             })
             count += 1
             
        print(json.dumps({
            "success": True,
            "method": "Method 4 (Instabot)",
            "followers": followers_data
        }))
        
    except Exception as e:
        # If we fail (e.g. login required), return error
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: <username> [session_id]"}))
        sys.exit(1)
        
    target_username = sys.argv[1]
    session_id = sys.argv[2] if len(sys.argv) > 2 else ""
    
    scrape_method4(target_username, session_id)
