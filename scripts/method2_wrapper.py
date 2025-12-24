import sys
import json
import instaloader

def get_followers(target_username, session_id=None):
    L = instaloader.Instaloader()
    
    if session_id:
        # Manually set the sessionid cookie to simulate login
        L.context._session.cookies.set('sessionid', session_id, domain='.instagram.com')
        # We also need to set the user agent to something standard
        L.context.user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        # Force login state verification (optional, but good practice)
        # L.load_session_from_file(...) is usually used, but we are hacking it in memory.
    
    # Note: Accessing followers typically requires login. 
    try:
        profile = instaloader.Profile.from_username(L.context, target_username)
        
        followers_list = []
        # Limiting to 50 for speed
        count = 0
        limit = 50 
        
        # This iteration requires login for full lists usually
        for follower in profile.get_followers():
            followers_list.append({
                "username": follower.username,
                "full_name": follower.full_name,
                "id": str(follower.userid)
            })
            count += 1
            if count >= limit:
                break
                
        is_private = profile.is_private
        
        print(json.dumps({
            "success": True, 
            "followers": followers_list,
            "is_private": is_private
        }))
        
    except Exception as e:
        error_msg = str(e)
        if "Login required" in error_msg:
             print(json.dumps({
                 "success": False, 
                 "error": "Login required. Please provide a Session ID or use ScrapFly.",
                 "requires_login": True
             }))
        else:
             print(json.dumps({"success": False, "error": error_msg}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No username provided"}))
        sys.exit(1)
        
    username = sys.argv[1]
    # Optional 3rd arg: session_id
    session_id = sys.argv[2] if len(sys.argv) > 2 else None
    
    get_followers(username, session_id)
