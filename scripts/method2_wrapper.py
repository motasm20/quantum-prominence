import sys
import json
import instaloader

def get_followers(target_username):
    L = instaloader.Instaloader()
    
    # Note: Accessing followers typically requires login. 
    # We will try without login first, but it will likely fail for private/most accounts.
    # To improve this, we would need to L.login(user, password)
    
    try:
        profile = instaloader.Profile.from_username(L.context, target_username)
        
        followers_list = []
        # Limiting to 50 for speed as requested ("snel is met het ophalen")
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
                
        print(json.dumps({"success": True, "followers": followers_list}))
        
    except Exception as e:
        error_msg = str(e)
        if "Login required" in error_msg:
             # Fallback or specific error code
             print(json.dumps({"success": False, "error": "Login required by Instagram to fetch followers.", "requires_login": True}))
        else:
             print(json.dumps({"success": False, "error": error_msg}))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "No username provided"}))
        sys.exit(1)
        
    username = sys.argv[1]
    get_followers(username)
