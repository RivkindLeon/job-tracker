export type ApplicationStage = 'Wishlist' | 'Applied' | 'Interviewing' | 'Offer' | 'Closed'

export type FollowUpStatus = 'due-today' | 'this-week' | 'waiting' | 'completed'

export type Application = {
  id: number
  company: string
  role: string
  stage: ApplicationStage
  location: string
  salary: string
  appliedOn: string
  nextStep: string
  resume: string
  contact: string
  contactRole: string
  notes: string
}

export type FollowUp = {
  id: number
  applicationId: number
  title: string
  dueLabel: string
  status: FollowUpStatus
  context: string
}

export type ApplicationEditState = {
  company: string
  role: string
  stage: ApplicationStage
  location: string
  salary: string
  nextStep: string
  contact: string
  contactRole: string
  notes: string
}

export type ApplicationFormState = {
  company: string
  role: string
  stage: ApplicationStage
  location: string
  salary: string
  nextStep: string
  contact: string
  contactRole: string
  notes: string
  followUpTitle: string
  followUpDueLabel: string
}

export type FollowUpFilter = 'all' | 'open' | 'completed'

export type FollowUpEditState = {
  title: string
  dueLabel: string
  status: FollowUpStatus
  context: string
}

export type FollowUpFormState = {
  title: string
  dueLabel: string
  status: Exclude<FollowUpStatus, 'completed'>
  context: string
}
