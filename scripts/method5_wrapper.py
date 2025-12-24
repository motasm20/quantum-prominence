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

        # -- RICH CONTACT / BIO INFO --
        # Extract everything possible from the user object
        
        # 1. Main Profile Card
        results_list.append({
            "username": user_data.get("username"),
            "full_name": f"[PROFILE] {user_data.get('full_name')}",
            "id": user_data.get("id"),
            "follower_count": user_data.get("edge_followed_by", {}).get("count"),
            "biography": user_data.get("biography")
        })

        # 2. Detailed Stats & Info
        info_fields = [
            ("Business Category", user_data.get("business_category_name")),
            ("Category", user_data.get("category_name")),
            ("Email", user_data.get("business_email")),
            ("Phone", user_data.get("business_phone_number")),
            ("Website", user_data.get("external_url")),
            ("Following", str(user_data.get("edge_follow", {}).get("count"))),
            ("Is Private", str(user_data.get("is_private"))),
            ("Is Verified", str(user_data.get("is_verified"))),
        ]

        for label, value in info_fields:
            if value:
                results_list.append({
                    "username": "Info", 
                    "full_name": label, 
                    "biography": value,
                    "id": f"info_{label}"
                })

        # 3. Related Profiles
        related = user_data.get("edge_related_profiles", {}).get("edges", [])
        for rel in related:
            node = rel.get("node", {})
            results_list.append({
                "username": "Related",
                "full_name": node.get("full_name"),
                "username": f"@{node.get('username')}", # Show username as main text
                "biography": "Related Account",
                "id": node.get("id")
            })

        # 4. Fetch Recent Posts (Loop for more)
        # We try to fetch up to 3 batches (approx 36 posts) directly if possible
        
        variables = {
            "after": None,
            "before": None,
            "data": {
                "count": 12, 
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

        # Initial Page
        has_next_page = True
        pages_fetched = 0
        max_pages = 3
        
        while has_next_page and pages_fetched < max_pages:
            params = {
                "doc_id": INSTAGRAM_ACCOUNT_DOCUMENT_ID,
                "variables": json.dumps(variables, separators=(",", ":"))
            }
            
            posts_url = f"https://www.instagram.com/graphql/query/?{urlencode(params)}"
            
            # Add small delay or just go sequentially
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
                timeline = posts_data.get("data", {}).get("xdt_api__v1__feed__user_timeline_graphql_connection", {})
                edges = timeline.get("edges", [])
                
                for edge in edges:
                    node = edge.get("node", {})
                    caption_text = ""
                    try:
                        caption_text = node.get("caption", {}).get("text", "")
                    except:
                        pass
                    
                    typename = node.get("__typename", "Post")
                    is_video = node.get("is_video", False)
                    type_label = "Video" if is_video else "Image"
                    
                    results_list.append({
                        "username": f"Post ({type_label})",
                        "full_name": caption_text[:60] + "..." if caption_text else "Media Post",
                        "id": node.get("id"),
                        "biography": f"Likes: {node.get('like_count')} | Comments: {node.get('comment_count')} | Loc: {node.get('location', {}).get('name', 'N/A')}",
                        "follower_count": node.get('like_count') # Hack to show likes in the 'count' column if UI supports it
                    })

                page_info = timeline.get("page_info", {})
                has_next_page = page_info.get("has_next_page")
                end_cursor = page_info.get("end_cursor")
                
                if end_cursor:
                    variables["after"] = end_cursor
                else:
                    break
                    
                pages_fetched += 1
            else:
                break

        print(json.dumps({
            "success": True, 
            "followers": results_list, 
            "info": f"Fetched Profile + Info + Related + {len(results_list)-10} Posts.",
            "is_private": user_data.get("is_private")
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
