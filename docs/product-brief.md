# Product Brief

## Product goal
Help job seekers run a more organized job search by keeping applications, resume variants, company context, interview progress, and follow-up actions in one lightweight workspace.

## Primary users
- active job seekers managing multiple applications at once
- software developers tailoring resumes and tracking technical interview loops
- career switchers who need a clearer pipeline and reminder system

## Core problems
- applications are scattered across spreadsheets, inboxes, and notes
- it is easy to lose track of the latest resume or cover letter sent
- interview processes span multiple stages, people, and dates
- follow-ups and next actions are often missed
- company and contact context gets separated from the application timeline

## v0 outcome
A user can create and review a small job search pipeline that answers:
- where did I apply?
- what stage is each application in?
- which resume version did I send?
- who did I speak with?
- what do I need to do next, and by when?

## Core entities

### Application
Tracks a single role the user is pursuing.
- role title
- company
- location / work mode
- source
- application date
- current stage
- status
- salary note
- linked resume version
- linked contacts
- linked interviews
- linked follow-up items

### Company
Stores reusable company context.
- name
- industry
- company size note
- website
- location
- notes

### Contact
Represents a recruiter, hiring manager, or referral.
- name
- role
- company
- email or profile link
- relationship type
- notes

### Resume Variant
Captures the version of the resume used for an application.
- name
- target focus
- version label
- last updated date
- notes

### Interview
Tracks scheduled or completed interview steps.
- application
- interview type
- stage label
- date and time
- interviewers
- preparation notes
- outcome note

### Follow-up
Represents a next action or reminder.
- application
- due date
- action type
- status
- note

## Main user flow
1. add a company and application
2. attach the resume variant that was submitted
3. move the application through simple stages such as saved, applied, recruiter screen, interview, offer, rejected, archived
4. add contacts and interviews as the process progresses
5. create follow-up reminders after submissions, interviews, or pending decisions
6. review a dashboard or list to decide the next action for the day

## v0 feature boundaries

### In scope
- application list or board with stage and status
- company and contact context attached to an application
- resume variant reference per application
- interview timeline entries
- follow-up reminders and overdue visibility
- lightweight local mock data for the first UI prototype

### Out of scope
- email integration
- calendar sync
- browser extension capture
- AI-generated resume rewriting
- team collaboration
- backend-heavy automation before the workflow is proven

## Success signals for an early prototype
- a user can review all active applications without opening multiple tools
- the next follow-up action is visible for each active opportunity
- stage changes and interview history are understandable at a glance
- resume and contact context stay attached to the related application
