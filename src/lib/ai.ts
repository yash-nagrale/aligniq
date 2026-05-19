const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`

async function callGemini(prompt: string): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  })

  if (!res.ok) {
    throw new Error(`Gemini API error: ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response generated.'
}

export async function enhanceGoalSMART(
  title: string,
  description: string,
  thrustArea: string
): Promise<string> {
  const prompt = `You are an expert HR consultant specializing in performance management. Convert the following goal into a SMART goal (Specific, Measurable, Achievable, Relevant, Time-bound).

Goal Title: ${title}
Description: ${description}
Thrust Area: ${thrustArea}

Provide output in this exact format:
**SMART Goal Statement:**
[One clear SMART goal sentence]

**Specific:** [What exactly will be accomplished]
**Measurable:** [How success will be measured with clear metrics]
**Achievable:** [Why this is realistic]
**Relevant:** [How it aligns with ${thrustArea}]
**Time-bound:** [Clear deadline and milestones]

**Suggested KPI:** [One primary KPI with formula]`

  return callGemini(prompt)
}

export async function suggestKPIs(
  title: string,
  description: string,
  uomType: string
): Promise<string> {
  const prompt = `You are a KPI design expert. Suggest 5 measurable KPIs for the following goal.

Goal: ${title}
Description: ${description}
Measurement Type: ${uomType}

For each KPI provide:
1. **KPI Name** — [name]
   - Formula: [how to calculate]
   - Target Range: [baseline → target]
   - Data Source: [where to get data]
   - Frequency: [how often to measure]

Be specific, quantitative, and actionable.`

  return callGemini(prompt)
}

export async function generatePerformanceSummary(
  employeeName: string,
  goals: Array<{
    title: string
    weightage: number
    progress: number
    status: string
    managerComment?: string | null
  }>
): Promise<string> {
  const goalsText = goals.map(g =>
    `- ${g.title} (${g.weightage}% weight): ${g.progress}% achieved, Status: ${g.status}${g.managerComment ? `, Manager note: ${g.managerComment}` : ''}`
  ).join('\n')

  const prompt = `You are an HR professional writing a performance appraisal summary. Generate a professional, balanced, and specific performance summary for the following employee.

Employee: ${employeeName}
Goals Performance:
${goalsText}

Write a 4-5 paragraph professional summary covering:
1. Overall performance assessment
2. Key achievements and impact
3. Areas of strength demonstrated
4. Areas for improvement or development
5. Recommended rating and future focus areas

Tone: Professional, specific, balanced, constructive. Avoid generic statements.`

  return callGemini(prompt)
}
