import {
  Component,
  ChangeDetectionStrategy,
  computed,
  effect,
  input,
  signal,
  untracked
} from '@angular/core';
import { ElectionProcess, ElectionStep } from '../../models/election.model';

interface QuizOption {
  readonly label: string;
  readonly value: string;
}

interface QuizQuestion {
  readonly id: string;
  readonly prompt: string;
  readonly options: readonly QuizOption[];
  readonly correctValue: string;
}

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = copy[i];
    copy[i] = copy[j]!;
    copy[j] = tmp!;
  }
  return copy;
}

function orderedSteps(process: ElectionProcess): readonly ElectionStep[] {
  return [...process.steps].sort((a, b) => a.order - b.order);
}

function pickWrongTitles(steps: readonly ElectionStep[], excludeTitle: string, count: number): string[] {
  const pool = steps.map((s) => s.title).filter((t) => t !== excludeTitle);
  return shuffle(pool).slice(0, count);
}

function buildQuizQuestions(process: ElectionProcess): readonly QuizQuestion[] {
  const steps = orderedSteps(process);
  if (steps.length === 0) {
    return [];
  }

  const target = Math.min(5, Math.max(3, Math.min(steps.length, 5)));
  const questions: QuizQuestion[] = [];
  const used = new Set<string>();

  const addQuestion = (q: QuizQuestion): void => {
    if (!used.has(q.id)) {
      used.add(q.id);
      questions.push(q);
    }
  };

  for (let i = 0; i < steps.length && questions.length < target; i++) {
    const step = steps[i]!;
    const wrong = pickWrongTitles(steps, step.title, 3);
    while (wrong.length < 3) {
      wrong.push(`Alternative phase ${wrong.length + 1}`);
    }
    const opts = shuffle([
      { label: step.title, value: step.title },
      ...wrong.slice(0, 3).map((t) => ({ label: t, value: t }))
    ]);
    addQuestion({
      id: `step-title-${step.order}`,
      prompt: `What is step ${step.order} of the election process called?`,
      options: opts,
      correctValue: step.title
    });
  }

  for (let i = 0; i < steps.length && questions.length < target; i++) {
    const step = steps[i]!;
    const wrong = shuffle(
      steps.map((s) => s.duration).filter((d) => d !== step.duration)
    ).slice(0, 3);
    while (wrong.length < 3) {
      wrong.push(`${14 + wrong.length * 7} days`);
    }
    const opts = shuffle([
      { label: step.duration, value: step.duration },
      ...wrong.slice(0, 3).map((d) => ({ label: d, value: d }))
    ]);
    addQuestion({
      id: `duration-${step.order}`,
      prompt: `How long does "${step.title}" last?`,
      options: opts,
      correctValue: step.duration
    });
  }

  for (let i = 0; i < steps.length && questions.length < target; i++) {
    const step = steps[i]!;
    const others = steps.filter((s) => s.title !== step.title);
    const wrongDesc = shuffle(others.map((s) => s.description)).slice(0, 3);
    const paddedWrong: string[] = [...wrongDesc];
    while (paddedWrong.length < 3) {
      paddedWrong.push(`A procedural phase focused on preparation ${paddedWrong.length}`);
    }
    const opts = shuffle([
      {
        label: step.description.slice(0, 140) + (step.description.length > 140 ? '…' : ''),
        value: step.description
      },
      ...paddedWrong.slice(0, 3).map((text) => ({
        label: text.slice(0, 140) + (text.length > 140 ? '…' : ''),
        value: text
      }))
    ]);
    addQuestion({
      id: `desc-${step.order}`,
      prompt: `Which description best matches the step "${step.title}"?`,
      options: opts,
      correctValue: step.description
    });
  }

  return shuffle(questions).slice(0, target);
}

@Component({
  selector: 'app-election-quiz',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="quiz-card">
      <div class="quiz-header">
        <div class="quiz-title-row">
          <span class="material-icons-outlined quiz-icon">quiz</span>
          <div>
            <h2 class="quiz-title">Election Process Quiz</h2>
            <p class="quiz-subtitle">Check what you remember from the timeline.</p>
          </div>
        </div>
        @if (!showResults() && quizQuestions().length > 0) {
          <div class="progress-wrap" aria-label="Quiz progress">
            <div class="progress-meta">
              <span>Question {{ currentQuestion() + 1 }} of {{ quizQuestions().length }}</span>
              <span class="progress-score">Score: {{ score() }}</span>
            </div>
            <div class="progress-track">
              <div
                class="progress-fill"
                [style.width.%]="((currentQuestion() + 1) / quizQuestions().length) * 100"
              ></div>
            </div>
          </div>
        }
      </div>

      @if (quizQuestions().length === 0) {
        <p class="empty-quiz">Not enough steps to build a quiz for this election.</p>
      } @else if (showResults()) {
        <div class="results-panel">
          <div class="results-icon material-icons-outlined">emoji_events</div>
          <h3 class="results-title">Quiz complete</h3>
          <p class="results-score">
            You scored <strong>{{ score() }}</strong> out of <strong>{{ quizQuestions().length }}</strong>
          </p>
          <p class="results-hint">
            {{ score() === quizQuestions().length ? 'Perfect! You have mastered this timeline.' : 'Review the timeline and try again anytime.' }}
          </p>
          <button type="button" class="btn-primary" (click)="restartQuiz()">Try again</button>
        </div>
      } @else {
        @if (currentQuizQuestion()) {
          <div class="question-card">
            <p class="question-prompt">{{ currentQuizQuestion()!.prompt }}</p>
            <ul class="options-list" role="list">
              @for (opt of currentQuizQuestion()!.options; track opt.value) {
                <li>
                  <button
                    type="button"
                    class="option-btn"
                    [class.selected]="selectedAnswer() === opt.value"
                    [class.reveal-correct]=" answeredCurrent() && opt.value === currentQuizQuestion()!.correctValue"
                    [class.reveal-wrong]=" answeredCurrent() && selectedAnswer() === opt.value && opt.value !== currentQuizQuestion()!.correctValue"
                    [disabled]="answeredCurrent()"
                    (click)="selectAnswer(opt.value)"
                  >
                    <span class="option-letter">{{ optionLetter($index) }}</span>
                    <span class="option-label">{{ opt.label }}</span>
                  </button>
                </li>
              }
            </ul>
            <div class="quiz-actions">
              @if (!answeredCurrent()) {
                <button
                  type="button"
                  class="btn-primary"
                  [disabled]="selectedAnswer() === null"
                  (click)="submitAnswer()"
                >
                  Check answer
                </button>
              } @else {
                <button type="button" class="btn-primary" (click)="nextOrFinish()">
                  {{ isLastQuestion() ? 'See results' : 'Next question' }}
                </button>
              }
            </div>
          </div>
        }
      }
    </section>
  `,
  styles: [`
    .quiz-card {
      margin-top: var(--spacing-2xl);
      padding: var(--spacing-xl);
      background: var(--color-bg-card);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-md);
      animation: fadeInUp 0.45s ease both;
    }

    .quiz-header {
      margin-bottom: var(--spacing-lg);
    }

    .quiz-title-row {
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      margin-bottom: var(--spacing-lg);
    }

    .quiz-icon {
      font-size: 36px;
      color: var(--color-primary);
      background: rgba(59, 130, 246, 0.12);
      padding: 10px;
      border-radius: var(--radius-md);
    }

    .quiz-title {
      margin: 0 0 var(--spacing-xs);
      font-size: var(--font-size-xl);
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .quiz-subtitle {
      margin: 0;
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .progress-wrap {
      margin-top: var(--spacing-md);
    }

    .progress-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: var(--font-size-xs);
      font-weight: 600;
      color: var(--color-text-secondary);
      margin-bottom: var(--spacing-sm);
    }

    .progress-score {
      color: var(--color-primary);
    }

    .progress-track {
      height: 8px;
      border-radius: var(--radius-full);
      background: var(--color-bg-sidebar);
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
      background: linear-gradient(90deg, var(--color-primary), var(--color-secondary));
      transition: width 0.35s ease;
    }

    .question-card {
      padding: var(--spacing-lg);
      border-radius: var(--radius-lg);
      background: linear-gradient(145deg, var(--color-bg-elevated), var(--color-bg-card));
      border: 1px solid var(--color-border-light);
    }

    .question-prompt {
      font-size: var(--font-size-lg);
      font-weight: 600;
      color: var(--color-text-primary);
      margin: 0 0 var(--spacing-lg);
      line-height: 1.5;
    }

    .options-list {
      list-style: none;
      margin: 0 0 var(--spacing-lg);
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }

    .option-btn {
      width: 100%;
      display: flex;
      align-items: flex-start;
      gap: var(--spacing-md);
      text-align: left;
      padding: var(--spacing-md) var(--spacing-lg);
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border);
      background: var(--color-bg-card);
      color: var(--color-text-primary);
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.15s ease;
      font: inherit;
    }

    .option-btn:hover:not(:disabled) {
      border-color: var(--color-primary-light);
      box-shadow: var(--shadow-sm);
      transform: translateY(-1px);
    }

    .option-btn.selected:not(:disabled) {
      border-color: var(--color-primary);
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .option-btn.reveal-correct {
      border-color: var(--color-success);
      background: rgba(16, 185, 129, 0.08);
    }

    .option-btn.reveal-wrong {
      border-color: var(--color-error);
      background: var(--color-error-bg);
    }

    .option-letter {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: var(--font-size-xs);
      font-weight: 700;
      background: var(--color-bg-sidebar);
      color: var(--color-primary);
    }

    .option-label {
      flex: 1;
      font-size: var(--font-size-sm);
      line-height: 1.5;
      color: var(--color-text-secondary);
    }

    .quiz-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn-primary {
      padding: 10px 22px;
      border-radius: var(--radius-full);
      border: none;
      font-weight: 600;
      font-size: var(--font-size-sm);
      cursor: pointer;
      background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
      color: var(--color-text-inverse);
      transition: opacity 0.2s ease, transform 0.15s ease;
    }

    .btn-primary:hover:not(:disabled) {
      opacity: 0.95;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .results-panel {
      text-align: center;
      padding: var(--spacing-xl);
    }

    .results-icon {
      font-size: 48px;
      color: #f59e0b;
      margin-bottom: var(--spacing-md);
    }

    .results-title {
      margin: 0 0 var(--spacing-sm);
      font-size: var(--font-size-xl);
      font-weight: 800;
      color: var(--color-text-primary);
    }

    .results-score {
      margin: 0 0 var(--spacing-sm);
      font-size: var(--font-size-lg);
      color: var(--color-text-secondary);
    }

    .results-hint {
      margin: 0 0 var(--spacing-lg);
      font-size: var(--font-size-sm);
      color: var(--color-text-muted);
    }

    .empty-quiz {
      margin: 0;
      color: var(--color-text-muted);
      font-size: var(--font-size-sm);
    }
  `]
})
export class ElectionQuizComponent {
  readonly electionProcess = input.required<ElectionProcess>();

  readonly quizQuestions = signal<readonly QuizQuestion[]>([]);
  readonly currentQuestion = signal(0);
  readonly selectedAnswer = signal<string | null>(null);
  readonly score = signal(0);
  readonly showResults = signal(false);
  readonly answeredCurrent = signal(false);

  readonly currentQuizQuestion = computed(() => {
    const qs = this.quizQuestions();
    const i = this.currentQuestion();
    return qs[i] ?? null;
  });

  readonly isLastQuestion = computed(() => {
    const qs = this.quizQuestions();
    return this.currentQuestion() >= qs.length - 1;
  });

  constructor() {
    effect(() => {
      const process = this.electionProcess();
      untracked(() => {
        this.quizQuestions.set(buildQuizQuestions(process));
        this.currentQuestion.set(0);
        this.selectedAnswer.set(null);
        this.score.set(0);
        this.showResults.set(false);
        this.answeredCurrent.set(false);
      });
    });
  }

  optionLetter(index: number): string {
    return String.fromCharCode(65 + index);
  }

  selectAnswer(value: string): void {
    if (this.answeredCurrent()) {
      return;
    }
    this.selectedAnswer.set(value);
  }

  submitAnswer(): void {
    const q = this.currentQuizQuestion();
    const selected = this.selectedAnswer();
    if (!q || selected === null || this.answeredCurrent()) {
      return;
    }
    if (selected === q.correctValue) {
      this.score.update((s) => s + 1);
    }
    this.answeredCurrent.set(true);
  }

  nextOrFinish(): void {
    if (this.isLastQuestion()) {
      this.showResults.set(true);
      return;
    }
    this.currentQuestion.update((i) => i + 1);
    this.selectedAnswer.set(null);
    this.answeredCurrent.set(false);
  }

  restartQuiz(): void {
    const process = this.electionProcess();
    this.quizQuestions.set(buildQuizQuestions(process));
    this.currentQuestion.set(0);
    this.selectedAnswer.set(null);
    this.score.set(0);
    this.showResults.set(false);
    this.answeredCurrent.set(false);
  }
}
