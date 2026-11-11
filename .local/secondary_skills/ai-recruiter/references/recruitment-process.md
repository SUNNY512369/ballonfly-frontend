# Interview Questions, Recruitment Process Design, and Hiring Benchmarks

Detailed playbook for workflow Steps 9-10. Read this when the user wants interview questions, a full recruitment process, aptitude or skills tests, a question bank, scorecards, a candidate communication plan, process metrics, or hiring benchmarks (time-to-fill, cost-per-hire, funnel rates).

## Step 9: Suggested Interview Questions

Include a short section of suggested interview questions at the bottom of the output. Use behavioral questions (STAR format) over hypothetical ones. Organize by the key criteria identified in Step 1.

Keep it lightweight — 2 questions per criterion, 3-4 criteria max. No scoring rubrics or evaluation matrices unless the user specifically asks for one.

## Step 10: Design a Full Recruitment Process

When the user asks to design a recruitment process, build a complete end-to-end hiring pipeline tailored to the specific role, company size, and seniority level. Use `webSearch` to research current best practices for the role type (e.g., "best interview process for senior backend engineer 2025").

### Always ask the user first

- How many stages do they want? (Lean startups may want 3; enterprises may need 5-6)
- Any existing process they want to improve or replace?
- Time constraint — how fast do they need to hire?
- Who is available to participate as interviewers?
- Any specific skills or traits they want to test heavily?

### Process design output — include all of the following

### 1. Process Overview & Timeline

A visual stage-by-stage pipeline with estimated duration for each stage and total time-to-hire target.

| Stage | Duration | Owner | Pass Rate |
|-------|----------|-------|-----------|
| Application / CV Screen | 1-2 days | Recruiter / AI | ~20-30% advance |
| Phone Screen | 30 min | Recruiter / Hiring Manager | ~50% advance |
| Aptitude / Skills Test | 2-3 days (take-home) or 1 hour (live) | Candidate | ~40-60% advance |
| Technical / Domain Interview | 60 min | Team members | ~50% advance |
| Culture / Values Interview | 45 min | Cross-functional | ~70% advance |
| Final / Hiring Manager Interview | 45 min | Hiring Manager | ~80% advance |
| Reference Checks | 2-3 days | Recruiter | ~90% advance |
| Offer | 1-2 days | Hiring Manager + HR | — |

Adjust the number and type of stages based on the role. Junior roles may skip the take-home; senior/leadership roles may add a presentation or case study stage.

### 2. Aptitude & Skills Tests

Design role-specific assessments. These should be practical, time-boxed, and relevant to actual job tasks — never trivia or gotcha questions.

#### By role type

| Role Type | Test Format | Duration | What It Measures |
|-----------|------------|----------|-----------------|
| **Engineering** | Take-home coding challenge OR live pair programming | 2-3 hrs (take-home) or 60 min (live) | Code quality, problem-solving, system design thinking |
| **Product Management** | Product case study (written or presented) | 2 hrs (take-home) or 45 min (live) | Prioritization, user empathy, analytical thinking, communication |
| **Design** | Design challenge with constraints | 3-4 hrs (take-home) or 60 min (live whiteboard) | Visual thinking, UX reasoning, craft quality |
| **Data Science / ML** | Data analysis challenge with real dataset | 2-3 hrs | Statistical reasoning, tool proficiency, communication of findings |
| **Sales / BD** | Mock sales pitch or objection-handling roleplay | 30-45 min (live) | Persuasion, product knowledge, listening skills |
| **Marketing** | Campaign brief or content strategy exercise | 2 hrs (take-home) | Strategic thinking, creativity, channel knowledge |
| **Operations** | Process improvement case study | 1-2 hrs | Systems thinking, prioritization, attention to detail |
| **Leadership / Management** | Leadership scenario or team-building exercise | 45 min (live) | Decision-making, conflict resolution, delegation |

#### Test design principles

- Mirror real work the candidate would do in the role — not abstract puzzles
- Time-box strictly — respect the candidate's time. Max 3 hours for take-homes
- Provide clear evaluation criteria to assessors before they review submissions
- Offer alternative formats when possible (e.g., "bring your own project" as an option alongside a take-home)
- For take-homes, always give at least 5 days to complete (candidates have jobs)

**Include a sample test for the specific role** with:

- The prompt / instructions candidates receive
- Evaluation rubric (what good, average, and poor looks like)
- Time limit
- Submission format

### 3. Interview Question Bank

For each interview stage, provide a structured question set. Organize by competency area.

#### Format per stage

##### [Stage Name] — [Interviewer Role]

| Competency | Question | What to Listen For | Red Flag |
|------------|----------|-------------------|----------|
| [e.g., Problem Solving] | "Tell me about a time you had to solve a problem with incomplete information." | Structured approach, comfort with ambiguity, outcome focus | Waited for perfect info, blamed others, no clear outcome |
| [e.g., Collaboration] | "Describe a project where you had to work with a difficult stakeholder." | Empathy, communication strategy, resolution | Avoided the person, escalated immediately, us-vs-them framing |

Provide 3-4 questions per stage, covering different competencies. Include the "What to Listen For" and "Red Flag" columns so interviewers know what good and bad answers look like without needing training.

### 4. Evaluation Scorecards

For each interview stage, provide a simple scorecard interviewers fill out immediately after the interview.

#### Scorecard format

```text
Candidate: _______________
Interviewer: _______________
Stage: _______________
Date: _______________

| Criteria | 1 (Below) | 2 (Meets) | 3 (Exceeds) | Score | Notes |
|----------|-----------|-----------|-------------|-------|-------|
| [Criterion 1] | [what "below" looks like] | [what "meets" looks like] | [what "exceeds" looks like] | ___ | ___ |
| [Criterion 2] | ... | ... | ... | ___ | ___ |
| [Criterion 3] | ... | ... | ... | ___ | ___ |

Overall recommendation: [ ] Strong Advance [ ] Advance [ ] Hold [ ] Reject

Key observations (2-3 sentences):
```

Keep it to 3-5 criteria per scorecard. Interviewers should complete it within 5 minutes of the interview ending — before discussing with other interviewers (prevents anchoring bias).

### 5. Candidate Communication Plan

Map out every touchpoint with the candidate throughout the process. For each, note the timing, channel, and purpose. Offer to draft and send each of these via Gmail (see Step 8).

| Touchpoint | Timing | Channel | Purpose |
|------------|--------|---------|---------|
| Application received | Within 24 hours | Email | Confirm receipt, set expectations for timeline |
| Phone screen invite | Within 3 days of application | Email | Schedule the call |
| Post-phone-screen update | Within 24 hours | Email | Advance or reject |
| Test/assignment sent | Same day as advancement | Email | Instructions, deadline, support contact |
| Interview invite | Within 2 days of test review | Email | Schedule, prep materials, interviewer names |
| Post-interview update | Within 48 hours | Email | Advance, hold, or reject |
| Offer | Within 24 hours of final decision | Phone call + email | Verbal first, written follow-up |
| Rejection (final round) | Within 48 hours | Email or phone | Respectful, brief, encouraging |

### 6. Process Metrics & Targets

Define what success looks like for the hiring process itself:

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Time-to-fill | [role-appropriate target] | Days from posting to accepted offer |
| Candidate experience score | 4+/5 | Post-process survey (send to all candidates, including rejected) |
| Offer acceptance rate | >80% | Offers accepted / offers extended |
| Stage drop-off | <20% per stage | Candidates who withdraw at each stage |
| Interviewer calibration | <1 point spread | Variance in scorecard ratings across interviewers for same candidate |
| Diversity of pipeline | [user-defined target] | Demographics at each funnel stage |

## Hiring Benchmarks

- **Time-to-fill**: 44 days US average (SHRM 2025); tech roles run longer
- **Cost-per-hire**: $6-7k standard tech roles; $12k+ for ML/security/staff+ (Deloitte 2024)
- **Funnel**: Tech roles see ~110 applicants/opening, ~5% get interviews
- **Speed matters**: Top candidates are off-market in 10 days. The interview-to-offer stage is where most teams lose — compressing it cuts time-to-hire by ~26%.
- **LinkedIn Recruiter cost**: $1.6k/yr (Lite) to $10.8k+/yr (Corporate, 150+ InMails/mo)
