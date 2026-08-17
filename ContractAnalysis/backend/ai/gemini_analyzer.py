import os
import json
from pathlib import Path
from dotenv import load_dotenv
from google import genai

load_dotenv()

# ============================================================
# GEMINI CONFIGURATION
# ============================================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is not set")

client = genai.Client(api_key=api_key)


# ============================================================
# KNOWLEDGE BASE
# ============================================================

# Current file:
# backend/ai/gemini_analyzer.py
#
# Knowledge file:
# backend/knowledge/contract_analysis_rules.md

BASE_DIR = Path(__file__).resolve().parent.parent

KNOWLEDGE_FILE = (
    BASE_DIR
    / "knowledge"
    / "contract_analysis_rules.md"
)


def load_contract_rules():
    """
    Load contract analysis rules from the Markdown knowledge base.
    """

    if not KNOWLEDGE_FILE.exists():
        raise FileNotFoundError(
            f"Knowledge base not found: {KNOWLEDGE_FILE}"
        )

    with open(
        KNOWLEDGE_FILE,
        "r",
        encoding="utf-8"
    ) as file:
        return file.read()


# ============================================================
# CONTRACT ANALYSIS
# ============================================================

def analyze_contract(pdf_path):
    """
    Analyze an uploaded PDF contract using Gemini
    and the ContractAnalyzer knowledge base.
    """

    # --------------------------------------------------------
    # 1. Load Knowledge Base
    # --------------------------------------------------------

    contract_rules = load_contract_rules()

    # --------------------------------------------------------
    # 2. Upload Contract PDF
    # --------------------------------------------------------

    uploaded_file = client.files.upload(
        file=pdf_path
    )

    # --------------------------------------------------------
    # 3. Build AI Prompt
    # --------------------------------------------------------

    prompt = f"""
You are an AI Contract Analysis System for ContractAnalyzer.

Your task is to analyze the uploaded contract professionally,
systematically, and conservatively.

You have two sources of information:

SOURCE 1:
The uploaded PDF contract.

SOURCE 2:
The Contract Analysis Knowledge Base provided below.

IMPORTANT SOURCE RULE:

The uploaded contract is the ONLY source of factual contract
information.

The Knowledge Base provides analysis rules, definitions,
classification criteria, risk methodology, and instructions.

The Knowledge Base must NOT be treated as evidence that a clause,
requirement, penalty, percentage, date, price, obligation, or
contractual term exists in the uploaded contract.

If a requirement is described in the Knowledge Base but does not
appear in the contract, mark it as:

"Not specified"

or

"Missing"

as appropriate.

Never invent information.

============================================================
CONTRACT ANALYSIS KNOWLEDGE BASE
============================================================

{contract_rules}

============================================================
END OF KNOWLEDGE BASE
============================================================


============================================================
ANALYSIS INSTRUCTIONS
============================================================

Analyze the uploaded contract according to the Knowledge Base.

Analyze the following areas:

1. Contract Summary
2. Scope of Work
3. Payment Terms
4. Pricing and Price Information
5. Contract Duration and Important Dates
6. Responsibilities of Each Party
7. Safety Requirements
8. Local Content Requirements
9. Technical Requirements
10. Commercial Requirements
11. Penalties and Violations
12. Force Majeure
13. Financial Requirements
14. Meetings and Reporting Requirements
15. Risks
16. Missing or Weak Clauses
17. Recommendations

Also check:

18. Contract Parties
19. Acceptance Criteria
20. Warranty
21. Insurance
22. Liability
23. Indemnification
24. Termination
25. Confidentiality
26. Intellectual Property
27. Data Protection
28. Subcontracting
29. Change Control
30. Governing Law
31. Dispute Resolution
32. Contract Conflicts
33. Important Definitions
34. Order of Precedence
35. Contract Completeness


============================================================
EVIDENCE RULE
============================================================

Every important risk or finding must be based on the actual
uploaded contract.

Do not use the Knowledge Base as evidence.

When possible, provide short evidence from the contract.

Do not fabricate clause numbers.

Do not fabricate quotations.

If evidence is unavailable, state:

"Evidence not found."


============================================================
RISK CLASSIFICATION
============================================================

Classify identified risks as:

- High
- Medium
- Low

Follow the risk definitions and criteria in the Knowledge Base.

High Risk may include significant:

- Financial exposure
- Legal exposure
- Operational exposure
- Safety exposure
- Compliance exposure
- Contractual imbalance

Medium Risk may include:

- Ambiguous deadlines
- Unclear responsibilities
- Incomplete reporting
- Incomplete warranty terms
- Unclear approval procedures

Low Risk may include:

- Minor wording ambiguity
- Minor documentation gaps
- Minor administrative issues


============================================================
RISK SCORE
============================================================

Return an overall risk score between 0 and 100.

The score must reflect the actual risks identified in the contract.

Do not assign a high score simply because the contract is long.

Do not assign a low-risk score simply because the contract contains
many clauses.

A single critical issue may justify a High or Critical assessment.

Use the Knowledge Base scoring methodology.


============================================================
COMPLETENESS
============================================================

Return a completeness score between 0 and 100.

Evaluate the presence and quality of applicable major contract areas.

Do NOT penalize the contract for clauses that are clearly
not applicable to its contract type.

If a section is not applicable, mark it as:

"Not Applicable"


============================================================
MISSING CLAUSES
============================================================

Identify:

- Clearly missing clauses
- Potentially missing clauses
- Weak clauses
- Ambiguous clauses

Do not automatically classify every missing clause as High Risk.

Do not claim that a clause is legally mandatory unless the
contract, governing law, procurement framework, or applicable
documents establish this.


============================================================
NUMERIC AND DATE VALIDATION
============================================================

Where possible, verify:

- Quantities
- Unit prices
- Totals
- Taxes
- Payment amounts
- Penalties
- Percentages
- Contract value
- Dates
- Deadlines
- Milestones
- Warranty periods

If information is insufficient to verify a calculation, say:

"Unable to verify due to insufficient information."


============================================================
IMPORTANT LEGAL LIMITATION
============================================================

You are an AI contract analysis system, not a lawyer.

Do not provide definitive legal conclusions.

When a legal issue requires professional verification, use:

"Requires legal review."


============================================================
REQUIRED JSON OUTPUT
============================================================

Return ONLY valid JSON.

Do not return:

- Markdown
- ```json
- ``` 
- Explanations outside JSON
- Introductory text
- Conclusions outside JSON


Use EXACTLY this JSON structure:

{{
    "summary": "",
    "scope_of_work": "",
    "payment_terms": "",
    "pricing": "",
    "duration_and_dates": "",
    "responsibilities": "",
    "safety_requirements": "",
    "local_content": "",
    "technical_requirements": "",
    "commercial_requirements": "",
    "penalties": "",
    "force_majeure": "",
    "financial_requirements": "",
    "meetings_and_reporting": "",
    "risks": [],
    "missing_or_weak_clauses": [],
    "recommendations": [],
    "risk": "",
    "score": 0,
    "completeness": 0,
    "high": 0,
    "medium": 0,
    "low": 0,
    "total_clauses": 0
}}


============================================================
JSON FIELD RULES
============================================================

"summary":
Provide a concise factual summary of the contract.

"scope_of_work":
Describe the actual scope found in the contract.

"payment_terms":
Describe actual payment conditions, timing, milestones,
invoices, retention, advance payments, and deductions.

"pricing":
Describe actual prices, quantities, currencies,
taxes, and pricing methodology.

"duration_and_dates":
Extract actual dates, deadlines, milestones,
contract duration, renewal, and warranty periods.

"responsibilities":
Identify the responsibilities of each actual party.

"safety_requirements":
Describe actual safety requirements.

"local_content":
Describe actual local-content requirements.
If none are found, use "Not specified".

"technical_requirements":
Describe actual technical specifications,
standards, testing, and acceptance requirements.

"commercial_requirements":
Describe actual commercial obligations.

"penalties":
Describe actual penalties, liquidated damages,
deductions, percentages, triggers, and caps.

"force_majeure":
Describe the actual force majeure clause.

"financial_requirements":
Describe actual financial obligations,
contract value, payment exposure, retention,
insurance, guarantees, and related requirements.

"meetings_and_reporting":
Describe actual meeting, reporting,
documentation, and governance requirements.


============================================================
RISK ARRAY
============================================================

Each risk should contain:

{{
    "title": "",
    "category": "",
    "severity": "High",
    "evidence": "",
    "explanation": "",
    "potential_impact": "",
    "recommendation": "",
    "confidence": "High"
}}

Severity must be exactly:

"High"

"Medium"

or

"Low"


============================================================
MISSING / WEAK CLAUSES ARRAY
============================================================

Each item should contain:

{{
    "clause": "",
    "status": "Missing",
    "reason": "",
    "risk": "High",
    "recommendation": ""
}}

Status can be:

"Missing"

"Potentially Missing"

"Weak"

"Ambiguous"

"Not Applicable"


============================================================
RECOMMENDATIONS ARRAY
============================================================

Each recommendation should contain:

{{
    "issue": "",
    "recommendation": "",
    "priority": "High"
}}

Priority can be:

"High"

"Medium"

"Low"


============================================================
FINAL VALIDATION
============================================================

Before returning the JSON, verify:

- The PDF was analyzed.
- Findings are based on the contract.
- No information was invented.
- No penalties were invented.
- No percentages were invented.
- No dates were invented.
- No prices were invented.
- Missing information is marked correctly.
- Risks have valid severity.
- Score is between 0 and 100.
- Completeness is between 0 and 100.
- High + Medium + Low equals the number of risk items.
- total_clauses represents identifiable clauses in the contract.
- JSON is valid.
- No Markdown is returned.

Return ONLY the JSON object.
"""

    # --------------------------------------------------------
    # 4. Send PDF + Knowledge Base + Instructions to Gemini
    # --------------------------------------------------------

    response = client.models.generate_content(
        model="gemini-3.6-flash",
        contents=[
            uploaded_file,
            prompt
        ]
    )

    # --------------------------------------------------------
    # 5. Clean Gemini Response
    # --------------------------------------------------------

    text = response.text.strip()

    if text.startswith("```json"):
        text = text[7:]

    elif text.startswith("```"):
        text = text[3:]

    if text.endswith("```"):
        text = text[:-3]

    text = text.strip()

    # --------------------------------------------------------
    # 6. Parse JSON
    # --------------------------------------------------------

    try:
        result = json.loads(text)

    except json.JSONDecodeError as e:
        print("Gemini returned invalid JSON:")
        print(text)

        raise ValueError(
            f"Gemini returned invalid JSON: {e}"
        )

    # --------------------------------------------------------
    # 7. Return Analysis
    # --------------------------------------------------------

    return result


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":
    print("Gemini Contract Analyzer is ready.")
    print(f"Knowledge Base: {KNOWLEDGE_FILE}")

    if KNOWLEDGE_FILE.exists():
        print("Knowledge Base loaded successfully.")
    else:
        print("WARNING: Knowledge Base file was not found.")


        