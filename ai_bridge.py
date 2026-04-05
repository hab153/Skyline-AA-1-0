# file: ai_bridge.py
import sys
import json
from llama_cpp import Llama

MODEL_PATH = "./models/qwen1_5-1_8b-chat-q4_k_m.gguf"

# Load model once
print("Loading Offline AI...", file=sys.stderr)
llm = Llama(model_path=MODEL_PATH, n_ctx=2048, verbose=False)

def parse_text(text):
    prompt = f"""You are a logic engine. Convert to JSON array ONLY. No markdown.
Format: [{{"subject":"var","operator":"OP","value":val,"dataType":"TYPE"}}]
Operators: EQUALS, GREATER_THAN, LESS_THAN, GTE, LTE.
Example: "Age over 18" -> [{{"subject":"age","operator":"GREATER_THAN","value":18,"dataType":"NUMBER"}}]
Input: {text}
Output:"""
    
    output = llm(prompt, max_tokens=150, stop=["\n"], echo=False)
    response = output['choices'][0]['text'].strip()
    
    # Clean JSON
    try:
        if "[" in response:
            start = response.index("[")
            end = response.rindex("]") + 1
            json_str = response[start:end]
            return json.loads(json_str)
        else:
            return {"error": "No JSON found"}
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    if len(sys.argv) > 1:
        user_input = " ".join(sys.argv[1:])
        result = parse_text(user_input)
        print(json.dumps(result))
    else:
        print(json.dumps({"error": "No input provided"}))
