import sys
import json
import asyncio
import os
from urllib.parse import urlencode
from scrapfly import ScrapeConfig, ScrapflyClient, ScrapeApiResponse

# Default key can be set here or passed via env/args
SCRAPFLY_KEY = os.environ.get("SCRAPFLY_KEY", "")

# Constants from instagram.py example
INSTAGRAM_APP_ID = "936619743392459"
INSTAGRAM_ACCOUNT_DOCUMENT_ID = "9310670392322965"

async def scrape_profile_and_posts(username: str, key: str):
    if not key:
        print(json.dumps({"success": False, "error": "ScrapFly API Key is required for this method."}))
        return

    try:
        scrapfly = ScrapflyClient(key=key)
        
        # 1. Fetch Profile Info
        profile_url = f"https://i.instagram.com/api/v1/users/web_profile_info/?username={username}"
        
        profile_result: ScrapeApiResponse = await scrapfly.async_scrape(
            ScrapeConfig(
                url=profile_url,
                headers={"x-ig-app-id": INSTAGRAM_APP_ID},
                asp=True,
                country="US",
                proxy_pool="public_residential_pool",
            )
        )
        
        if profile_result.status_code != 200:
             print(json.dumps({"success": False, "error": f"ScrapFly Profile returned status {profile_result.status_code}"}))
             return

        profile_data_json = json.loads(profile_result.content)
        user_data = profile_data_json.get("data", {}).get("user", {})
        
        if not user_data:
            print(json.dumps({"success": False, "error": "No user data found"}))
            return

        results_list = []

        # Add Profile as the first "result"
        results_list.append({
            "username": user_data.get("username"),
            "full_name": f"[PROFILE] {user_data.get('full_name')}",
            "id": user_data.get("id"),
            "follower_count": user_data.get("edge_followed_by", {}).get("count"),
            "biography": user_data.get("biography")
        })

        # 2. Fetch Recent Posts (to get "as much as possible")
        # We use the GraphQL query for user timeline
        variables = {
            "after": None,
            "before": None,
            "data": {
                "count": 12, # Fetch last 12 posts
                "include_reel_media_seen_timestamp": True,
                "include_relationship_info": True,
                "latest_besties_reel_media": True,
                "latest_reel_media": True
            },
            "first": 12,
            "last": None,
            "username": username,
            "__relay_internal__pv__PolarisIsLoggedInrelayprovider": True,
            "__relay_internal__pv__PolarisShareSheetV3relayprovider": True
        }

        params = {
            "doc_id": INSTAGRAM_ACCOUNT_DOCUMENT_ID,
            "variables": json.dumps(variables, separators=(",", ":"))
        }
        
        posts_url = f"https://www.instagram.com/graphql/query/?{urlencode(params)}"
        
        posts_result: ScrapeApiResponse = await scrapfly.async_scrape(
            ScrapeConfig(
                url=posts_url,
                headers={"content-type": "application/x-www-form-urlencoded"},
                asp=True,
                country="US",
                proxy_pool="public_residential_pool",
            )
        )

        if posts_result.status_code == 200:
            posts_data = json.loads(posts_result.content)
            edges = posts_data.get("data", {}).get("xdt_api__v1__feed__user_timeline_graphql_connection", {}).get("edges", [])
            
            for edge in edges:
                node = edge.get("node", {})
                caption_text = ""
                try:
                    caption_text = node.get("caption", {}).get("text", "")
                except:
                    pass
                
                # We map posts to the "follower" structure so they show up in the list
                results_list.append({
                    "username": "Post", # Label as Post
                    "full_name": caption_text[:50] + "..." if caption_text else "Media Post",
                    "id": node.get("id"),
                    "biography": f"Likes: {node.get('like_count')} | Comments: {node.get('comment_count')}"
                })

        print(json.dumps({
            "success": True, 
            "followers": results_list, 
            "info": "Fetched Profile + Recent Posts. For the real Follower List, use Method 2 with a Session ID."
        }))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(json.dumps({"success": False, "error": "Usage: <username> <key>"}))
        sys.exit(1)
        
    username = sys.argv[1]
    key = sys.argv[2]
    loop = asyncio.new_event_loop()
    loop.run_until_complete(scrape_profile_and_posts(username, key))
