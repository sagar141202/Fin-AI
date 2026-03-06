import anthropic
import os
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def generate_budget_advice(budget_data: dict) -> str:
    """
    Call Claude API to generate personalised natural language budget advice
    based on the user's spending analysis.
    """

    # Build a structured summary for Claude
    rule = budget_data.get("rule_5030_20", {})
    insights = budget_data.get("insights", [])
    progress = budget_data.get("budget_progress", [])

    over_budget_cats = [p["category"] for p in progress if p["over_budget"]]
    top_3_spend = progress[:3]

    prompt = f"""You are a friendly personal finance advisor at a bank. 
Analyse this user's monthly financial data and give them 3-4 specific, actionable pieces of advice.

Financial Summary:
- Monthly Income: ₹{budget_data.get('income', 0):,.0f}
- Total Spent: ₹{budget_data.get('total_spend', 0):,.0f}
- Savings: ₹{budget_data.get('savings', 0):,.0f}

50/30/20 Rule Status:
- Needs: {rule.get('needs', {}).get('actual', 0)}% (target: 50%) — {rule.get('needs', {}).get('status', 'unknown')}
- Wants: {rule.get('wants', {}).get('actual', 0)}% (target: 30%) — {rule.get('wants', {}).get('status', 'unknown')}
- Savings: {rule.get('savings', {}).get('actual', 0)}% (target: 20%) — {rule.get('savings', {}).get('status', 'unknown')}

Top 3 Spending Categories:
{chr(10).join([f"- {p['category']}: ₹{p['spent']:,.0f} (budget: ₹{p['budget']:,.0f})" for p in top_3_spend])}

Over-budget categories: {', '.join(over_budget_cats) if over_budget_cats else 'None'}

AI-detected issues:
{chr(10).join([f"- {i['title']}: {i['message']}" for i in insights[:3]])}

Give personalised, conversational advice in 3-4 short paragraphs. 
Use ₹ for currency. Be specific with numbers. Be encouraging but honest.
Do NOT use bullet points — write in natural paragraphs like a real advisor talking to a client.
Keep it under 200 words."""

    message = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=400,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return message.content[0].text
