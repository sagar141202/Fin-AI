from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

def get_llm_advice(budget_data: dict) -> str:
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return "AI advice unavailable — GROQ_API_KEY not configured."

        client = Groq(api_key=api_key)

        # Extract insights messages from dict objects
        raw_insights = budget_data.get("insights", [])
        insight_messages = []
        for i in raw_insights:
            if isinstance(i, dict):
                insight_messages.append(i.get("message", ""))
            elif isinstance(i, str):
                insight_messages.append(i)

        monthly_income = budget_data.get("income", 0)
        monthly_expense = budget_data.get("total_spend", 0)
        savings_pct = budget_data.get("savings_percent", 0)
        needs_pct = budget_data.get("needs_percent", 0)
        wants_pct = budget_data.get("wants_percent", 0)

        budget_progress = budget_data.get("budget_progress", [])
        over_budget = [b["category"] for b in budget_progress if b.get("over_budget")]
        top_cats_text = ", ".join(over_budget) if over_budget else "None"

        prompt = f"""You are a personal finance advisor for an Indian user.
Analyze their financial data and provide concise, actionable advice in 3-4 sentences.
Be specific, encouraging, and practical. Use Indian financial context (₹, SIP, PPF, etc).

Financial Summary:
- Monthly Income: ₹{monthly_income:,.0f}
- Monthly Expenses: ₹{monthly_expense:,.0f}
- Needs spending: {needs_pct:.1f}% (target: 50%)
- Wants spending: {wants_pct:.1f}% (target: 30%)
- Savings rate: {savings_pct:.1f}% (target: 20%)
- Over budget categories: {top_cats_text}
- Key insights: {'; '.join(insight_messages[:3])}

Provide specific, actionable advice to improve their financial health."""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7
        )
        return response.choices[0].message.content

    except Exception as e:
        return f"AI advice temporarily unavailable. Please try again later. ({str(e)[:100]})"
