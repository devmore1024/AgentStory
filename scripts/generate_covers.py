import os
import requests
from pathlib import Path
from openai import OpenAI
import time

# Load env manually or use python-dotenv if available
env_path = Path(__file__).parent.parent / '.env.local'
api_key = ''
base_url = ''

if env_path.exists():
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('OPENAI_API_KEY='):
                api_key = line.split('=')[1].strip()
            if line.startswith('OPENAI_BASE_URL='):
                base_url = line.split('=')[1].strip()

if not api_key:
    print("API Key not found")
    exit(1)

# Default base_url
if not base_url:
    base_url = "https://api.openai.com/v1"

# If coding endpoint, try compatible-mode
if 'coding.dashscope.aliyuncs.com' in base_url:
    base_url = "https://dashscope.aliyuncs.com/compatible-mode/v1"

print(f"Using Base URL: {base_url}")

client = OpenAI(
    api_key=api_key,
    base_url=base_url
)

books = [
    {
        "title": "小红帽",
        "slug": "fairy-little-red-riding-hood",
        "scene": "A vintage storybook illustration of Little Red Riding Hood walking through a dark, mysterious forest with ancient trees. A shadowy wolf figure watches from the background. Intricate line art, watercolor texture, muted burgundy and gold colors, adult fantasy style, no text."
    },
    {
        "title": "白雪公主",
        "slug": "fairy-snow-white",
        "scene": "A vintage storybook illustration of a glass coffin in a deep forest clearing, surrounded by nature and seven small figures. An apple lies on the ground. Intricate line art, watercolor texture, muted colors, adult fantasy style, no text."
    },
    {
        "title": "灰姑娘",
        "slug": "fairy-cinderella",
        "scene": "A vintage storybook illustration of a sparkling glass slipper on a stone staircase at midnight, with a pumpkin carriage fading in the distance. Intricate line art, watercolor texture, muted colors, adult fantasy style, no text."
    }
]

output_dir = Path(__file__).parent.parent / 'public' / 'covers'
output_dir.mkdir(parents=True, exist_ok=True)

def generate_with_wanx(prompt, output_path):
    print(f"Generating with wanx-v1 via raw API for {output_path.name}...")
    url = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "X-DashScope-Async": "enable"
    }
    data = {
        "model": "wanx-v1",
        "input": {
            "prompt": prompt
        },
        "parameters": {
            "style": "<auto>",
            "size": "1024*1024",
            "n": 1
        }
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        if response.status_code != 200:
            print(f"Wanx submission failed: {response.text}")
            return

        task_id = response.json().get('output', {}).get('task_id')
        if not task_id:
            print(f"No task_id in response: {response.text}")
            return
            
        print(f"Task submitted: {task_id}")
        
        # Poll
        status = "PENDING"
        while status in ["PENDING", "RUNNING"]:
            time.sleep(2)
            task_url = f"https://dashscope.aliyuncs.com/api/v1/tasks/{task_id}"
            task_resp = requests.get(task_url, headers={"Authorization": f"Bearer {api_key}"})
            
            if task_resp.status_code != 200:
                print(f"Polling failed: {task_resp.text}")
                return
                
            task_data = task_resp.json()
            status = task_data.get('output', {}).get('task_status')
            
            if status == "SUCCEEDED":
                image_url = task_data['output']['results'][0]['url']
                print(f"Downloading {image_url}...")
                img_data = requests.get(image_url).content
                with open(output_path, 'wb') as handler:
                    handler.write(img_data)
                print(f"Saved to {output_path}")
                return
            elif status == "FAILED":
                print(f"Task failed: {task_data}")
                return
            else:
                print(f"Task status: {status}...")
                
    except Exception as e:
        print(f"Wanx error: {e}")

for book in books:
    print(f"Generating cover for {book['title']}...")
    try:
        # Try DALL-E 3 first
        response = client.images.generate(
            model="dall-e-3",
            prompt=book['scene'],
            size="1024x1024",
            quality="standard",
            n=1,
        )
        
        image_url = response.data[0].url
        print(f"Downloading {image_url}...")
        
        img_data = requests.get(image_url).content
        with open(output_dir / f"{book['slug']}.png", 'wb') as handler:
            handler.write(img_data)
            
        print(f"Saved to {book['slug']}.png")
        
    except Exception as e:
        print(f"Error generating {book['title']} with DALL-E 3: {e}")
        # Try fallback to wanx-v1
        generate_with_wanx(book['scene'], output_dir / f"{book['slug']}.png")
