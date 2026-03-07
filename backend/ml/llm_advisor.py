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

        insights = budget_data.get("insights", [])
        needs_pct = budget_data.get("needs_pct", 0)
        wants_pct = budget_data.get("wants_pct", 0)
        savings_pct = budget_data.get("savings_pct", 0)
        monthly_income = budget_data.get("monthly_income", 0)
        monthly_expense = budget_data.get("monthly_expense", 0)
        top_categories = budget_data.get("top_categories", [])

        top_cats_text = ", ".join(
            [f"{c['category']} (₹{c['total']:.0f})" for c in top_categories[:5]]
        ) if top_categories else "N/A"

        prompt = f"""You are a personal finance advisor for an Indian user.
Analyze their financial data and provide concise, actionable advice in 3-4 sentences.
Be specific, encouraging, and practical. Use Indian financial context (₹, SIP, PPF, etc).

Financial Summary:
- Monthly Income: ₹{monthly_income:,.0f}
- Monthly Expenses: ₹{monthly_expense:,.0f}
- Needs spending: {needs_pct:.1f}% (target: 50%)
- Wants spending: {wants_pct:.1f}% (target: 30%)
- Savings rate: {savings_pct:.1f}% (target: 20%)
- Top spending categories: {top_cats_text}
- Key insights: {'; '.join(insights[:3]) if insights else 'None'}

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
