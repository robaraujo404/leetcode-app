import type { ComponentType } from 'react'
import type { Problem } from '../content'
import type { ModeId } from '../lib/storage'
import { ParsonsMode } from './Parsons'
import { InterviewerMode } from './Interviewer'
import { EdgeSwipeMode } from './EdgeSwipe'
import { PatternFlashMode } from './PatternFlash'
import { ComplexityBucketsMode } from './ComplexityBuckets'
import { BugHuntMode } from './BugHunt'
import { WhereChangesMode } from './WhereChanges'
import { LogWhereMode } from './LogWhere'

export interface ModeProps {
  problem: Problem
  onFinish: (correct: boolean) => void
}

export const MODE_COMPONENTS: Record<ModeId, ComponentType<ModeProps>> = {
  parsons: ParsonsMode,
  interviewer: InterviewerMode,
  edge: EdgeSwipeMode,
  pattern: PatternFlashMode,
  complexity: ComplexityBucketsMode,
  bug: BugHuntMode,
  changes: WhereChangesMode,
  log: LogWhereMode,
}
