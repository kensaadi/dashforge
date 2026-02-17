/**
 * Core exports for @dashforge/ui-core
 *
 * This module exports core infrastructure components including the
 * mandatory DependencyTracker and RuleEvaluator.
 */

export {
  DependencyTracker,
  type DependencyGraph,
  type DependencyTrackerConfig,
} from './DependencyTracker';

export {
  RuleEvaluator,
  type RuleEvaluatorConfig,
  type EvaluationStats,
} from './RuleEvaluator';
