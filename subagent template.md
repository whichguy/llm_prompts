# Subagent Execution Framework Template v5.1 - Centralized Knowledge Edition

## ⚠️ CRITICAL: THIS IS THE MANDATORY TEMPLATE FOR EVERY SUBAGENT

**EVERY SUBAGENT DEFINITION MUST FOLLOW THIS COMPLETE TEMPLATE**

This framework is **MANDATORY** for all agent definitions. Each agent MUST:
1. Start with a customized Mermaid execution flow diagram showing agent-specific details
2. Complete ALL placeholder sections marked with `[FILL IN: ...]`
3. Include the complete 10-phase execution flow with git operations
4. Define which subagents it will call (if any) using the three-argument pattern
5. Include "USE THIS AGENT PROACTIVELY" in the description
6. Support dry-run mode and optional confirmation gates
7. Follow the iterative validation pattern with retry logic
8. Capture and persist lessons learned for continuous improvement
9. **USE ABSOLUTE PATHS for all file and directory operations**
10. **NEVER assume the current working directory for git operations**
11. **CHECK PROJECT DOCUMENTATION during rehydration phase**
12. **CONTRIBUTE TO CENTRALIZED KNOWLEDGE BASE**

## 🆕 Version 5.1 Core Innovations + Centralized Knowledge Architecture

### Critical Path Management Rules

**ABSOLUTE PATH DISCIPLINE IS MANDATORY:**
1. **Capture Initial Directory**: Store the absolute path at agent start using `$(pwd -P)`
2. **NEVER CHANGE CURRENT DIRECTORY**: The current process must NEVER use `cd`, `pushd`, or `popd` - not even for worktrees
3. **Use Absolute Paths**: All file operations must use absolute paths calculated from base directories
4. **Git Directory Context**: Always use `git -C "$ABSOLUTE_PATH"` for ALL git commands - never change into directories
5. **Worktree Path Calculation**: Calculate all worktree paths as variables and use them with `-C` flags or full paths
6. **No Relative Assumptions**: Never assume `.` or `..` without explicit absolute resolution
7. **Runtime Path Variables**: Store and use path variables for all operations without changing directories

**⚠️ CRITICAL SAFETY ADDENDUM:**
```bash
# ❌ FORBIDDEN - NEVER DO THIS (even for worktrees):
cd "$WORKTREE_DIR"                    # NEVER change directory
pushd "$WORKTREE_DIR"                 # NEVER use pushd
cd ../some-path                       # NEVER navigate relatively

# ✅ REQUIRED - ALWAYS DO THIS:
git -C "$WORKTREE_DIR" add .          # Use -C flag for git
npm --prefix "$WORKTREE_DIR" test     # Use --prefix for npm
echo "data" > "$WORKTREE_DIR/file"    # Use full paths
find "$WORKTREE_DIR" -name "*.js"     # Specify search root
```

The current working directory should remain unchanged throughout agent execution to prevent parallel execution conflicts.

### Centralized Knowledge Management

**DOCUMENTATION AND LESSONS ARE NOW CENTRALIZED:**
1. **Central Lessons Repository**: `$PROJECT_ROOT/docs/lessons/CENTRAL_LESSONS.md`
2. **Architecture Decision Records**: `$PROJECT_ROOT/docs/architecture/decisions/`
3. **Design Decisions**: `$PROJECT_ROOT/docs/design/`
4. **Best Practices**: `$PROJECT_ROOT/docs/best-practices/`
5. **Project Standards**: `$PROJECT_ROOT/docs/standards/`
6. **Agent Documentation**: `$PROJECT_ROOT/docs/agents/`

### Three-Argument Pattern for Subagent Invocation
```bash
# EVERY subagent invocation MUST follow this exact pattern:
ask subagent [agent-name] "[task_description]" '[task_config]' '[agent_config]'

# Where:
# $1 = Task description (what to do) - required string
# $2 = Task configuration (data/context for the task) - optional JSON, defaults to "{}"
# $3 = Agent configuration (agent behavior overrides) - optional JSON, defaults to "{}"

# Task config → becomes TASK_* environment variables
# Agent config → becomes AGENT_* environment variables

# CRITICAL: When passing working_dir in agent_config, use ABSOLUTE PATHS:
ask subagent analyzer "find memory leaks" '{}' '{"working_dir":"'$(pwd -P)'"}'
ask subagent analyzer "find memory leaks" '{"files":"core.c,util.c"}' '{"dry_run":true,"working_dir":"'$ABSOLUTE_BASE_DIR'"}'
```

### Why This Design?
1. **Separation of Concerns**: Task data vs agent behavior are clearly separated
2. **Clarity**: Obvious what configures the task vs the agent itself
3. **Flexibility**: Can override agent defaults without mixing with task data
4. **Reusability**: Same task config can run with different agent behaviors
5. **Debugging**: Easy to see what's task-specific vs agent-specific
6. **Defaults**: Both configs optional with sensible defaults
7. **Path Safety**: Absolute paths prevent directory confusion across process boundaries
8. **Knowledge Sharing**: Centralized documentation enables cross-agent learning
9. **Standards Compliance**: All agents follow documented project standards

### Core Capabilities
1. **Three-Argument Pattern**: Task description + task config + agent config
2. **Git Worktree Isolation**: Safe parallel execution with branch isolation
3. **Centralized Lessons System**: Project-wide knowledge accumulation in docs/
4. **Architecture Decision Records**: Documented architectural choices
5. **Design Documentation**: Comprehensive design decisions
6. **Best Practices Library**: Project-specific standards and patterns
7. **Absolute Path Management**: All paths resolved to absolute at capture time
8. **Directory Control**: Specify working directory with absolute path resolution
9. **Output Flexibility**: Choose between inline response or file documentation
10. **Optional Confirmations**: Default to no prompts, opt-in for critical decisions
11. **State Management**: Checkpoint creation for recovery
12. **Error Handling**: Fail fast on critical errors, recover from minor issues
13. **Iterative Validation**: Retry logic with improvement cycles
14. **Comprehensive Reporting**: Detailed execution reports and metrics
15. **Git Submodules Support**: Manage external dependencies properly

### Project Directory Structure (Absolute Path References)
```
/absolute/path/to/project-root/
├── .agent/                      # Agent runtime directory ($AGENT_BASE_DIR/.agent)
│   ├── checkpoints/             # State checkpoints for recovery
│   ├── reports/                 # Execution reports
│   └── state/                   # Runtime state files
├── .git/                        # Git repository (required)
├── .gitignore                   # Should exclude .agent/checkpoints/
├── .gitmodules                  # Git submodule configuration
├── docs/                        # CENTRALIZED PROJECT DOCUMENTATION
│   ├── lessons/                 # CENTRALIZED LESSONS LEARNED
│   │   ├── CENTRAL_LESSONS.md   # Main lessons repository
│   │   ├── patterns/            # Successful patterns
│   │   │   └── *.md            # Pattern documentation
│   │   ├── antipatterns/        # Things to avoid
│   │   │   └── *.md            # Antipattern documentation
│   │   └── by-agent/            # Agent-specific lessons
│   │       └── [agent-name].md # Per-agent lesson history
│   ├── architecture/            # Architecture documentation
│   │   ├── decisions/           # Architecture Decision Records (ADRs)
│   │   │   ├── ADR-001-agent-framework.md
│   │   │   ├── ADR-002-path-management.md
│   │   │   └── ADR-NNN-*.md
│   │   ├── diagrams/            # System architecture diagrams
│   │   └── README.md            # Architecture overview
│   ├── design/                  # Design decisions
│   │   ├── agent-design.md      # Agent system design
│   │   ├── data-flow.md         # Data flow patterns
│   │   └── integration.md       # Integration patterns
│   ├── best-practices/          # Project best practices
│   │   ├── coding-standards.md  # Code style and standards
│   │   ├── git-workflow.md      # Git workflow and conventions
│   │   ├── testing.md           # Testing strategies
│   │   └── documentation.md     # Documentation standards
│   ├── standards/               # Project standards
│   │   ├── api-contracts.md     # API and interface standards
│   │   ├── error-handling.md    # Error handling patterns
│   │   └── logging.md           # Logging standards
│   └── agents/                  # Agent-specific documentation
│       └── [agent-name]/        # Per-agent docs
│           ├── README.md        # Agent overview
│           ├── examples.md      # Usage examples
│           └── troubleshooting.md # Common issues
├── epics/                       # Requirements and stories
│   └── */
│       ├── README.md            # Epic overview
│       ├── requirements/        # Detailed requirements
│       │   └── *.md
│       └── stories/
│           └── *.md            # User stories
├── lib/                         # Shared libraries (if submodules)
├── src/                         # Source code
├── tests/                       # Test files
└── submodules/                  # Git submodules (external deps)
    └── [module-name]/
```

---

## Agent Definition Template

```markdown
---
name: [FILL IN: agent-name-with-hyphens]
description: |
  PURPOSE: [FILL IN: Primary function and expertise of this agent. How it interprets
  and executes tasks within its domain (2-3 sentences).]
  
  PATH MANAGEMENT: This agent captures absolute paths at initialization and uses
  explicit directory specifications for all git and file operations. Never relies
  on implicit working directory assumptions.
  
  KNOWLEDGE INTEGRATION: This agent reads project documentation including architecture
  decisions, design patterns, and best practices during rehydration. Contributes
  lessons learned to the centralized repository at $PROJECT_ROOT/docs/lessons/.
  
  WHEN TO CALL: USE THIS AGENT PROACTIVELY when:
  - [FILL IN: Specific trigger condition 1 with detailed context]
  - [FILL IN: Specific trigger condition 2 with detailed context]
  - [FILL IN: Specific trigger condition 3 with detailed context]
  - Task involves [FILL IN: specific domain/action]
  - Task requires [FILL IN: specific capability]
  - Task contains keywords like [FILL IN: trigger words]
  
  WHAT TO EXPECT: This agent will:
  - Capture absolute working directory path on start
  - Check docs/ for architecture decisions and best practices
  - Review epics/ for relevant requirements
  - Use git -C for all git operations with absolute paths
  - Interpret the task description to determine approach
  - [FILL IN: Specific output/deliverable 1]
  - [FILL IN: Specific output/deliverable 2]
  - [FILL IN: Specific output/deliverable 3]
  - Document insights in centralized lessons repository
  - Return structured JSON/Markdown results for CI/CD integration
  
  INPUT CONTRACT - THREE ARGUMENTS:
  $1: task_description (required string)
      - What this agent should do
      - Examples: "[FILL IN: example task 1]", "[FILL IN: example task 2]"
  
  $2: task_config (optional JSON string, defaults to "{}")
      Task-specific data (available as TASK_* variables):
      - files: Files to process (string or array) - can be relative or absolute
      - modules: Modules to analyze (array)
      - threshold: Numeric thresholds (number)
      - severity: Severity levels (string)
      - depth: Analysis depth (string: quick|normal|comprehensive)
      - epic: Related epic name for context loading (string)
      - [FILL IN: custom task field]: [description]
  
  $3: agent_config (optional JSON string, defaults to "{}")
      Agent behavior overrides (available as AGENT_* variables):
      - dry_run: Test mode (boolean, default: false)
      - verbose: Detailed output (boolean, default: false)
      - output_mode: inline|file|both (string, default: file)
      - working_dir: Working directory (string, default: "." - resolved to absolute)
      - require_confirmation: Prompt for critical actions (boolean, default: false)
      - parent_agent: Invoking agent name (string)
      - task_id: Unique task identifier (string)
      - skip_docs: Skip documentation loading (boolean, default: false)
  
  EXAMPLE INVOCATIONS:
  ask subagent [agent-name] "[task1]" '{}' '{}'
  ask subagent [agent-name] "[task2]" '{"files":"data.txt","epic":"user-auth"}' '{"dry_run":true,"working_dir":"'$(pwd -P)'"}'
  ask subagent [agent-name] "[task3]" '{"modules":["auth","payment"]}' '{"verbose":true,"output_mode":"inline","working_dir":"'/absolute/path'"}'
  
  TASK INTERPRETATION:
  - Key action verbs: [FILL IN: analyze, generate, optimize, fix, etc.]
  - Target areas: [FILL IN: what this agent acts upon]
  - Complexity modifiers: [FILL IN: quick, comprehensive, deep, thorough, etc.]
  - Documentation triggers: [FILL IN: when to check specific docs]
  
  OUTPUT CONTRACT:
  - Returns: Structured JSON with results
  - Exit codes: 0=success, 1=critical, 2=partial, 3=validation_fail, 4=user_cancelled
  - Files: Creates reports in $ABSOLUTE_BASE_DIR/.agent/reports/
  - Lessons: Updates $ABSOLUTE_BASE_DIR/docs/lessons/CENTRAL_LESSONS.md
  - Agent History: Updates $ABSOLUTE_BASE_DIR/docs/lessons/by-agent/[agent-name].md
  
  LESSONS LEARNED:
  - Captures: [FILL IN: what insights this agent captures]
  - Central Location: $ABSOLUTE_BASE_DIR/docs/lessons/CENTRAL_LESSONS.md
  - Agent History: $ABSOLUTE_BASE_DIR/docs/lessons/by-agent/[agent-name].md
  - Pattern Library: $ABSOLUTE_BASE_DIR/docs/lessons/patterns/
  - Antipattern Library: $ABSOLUTE_BASE_DIR/docs/lessons/antipatterns/

tools: [FILL IN: Comma-separated list of tools, or omit to inherit all]
version: 5.1
---

# [FILL IN: Agent Display Name] Subagent

## MANDATORY EXECUTION FLOW DIAGRAM

**⚠️ CRITICAL: Every agent MUST start with this customized flow diagram BEFORE any execution.**

```mermaid
graph TD
    Start([Agent Start]) --> CaptureAbs[Capture Absolute<br/>Base Directory<br/>pwd -P]
    
    CaptureAbs --> ParseArgs{Parse Three<br/>Arguments}
    
    ParseArgs -->|Valid| ResolveDir{Resolve Working<br/>Directory to<br/>Absolute Path}
    ParseArgs -->|Invalid| ErrorExit[Critical Error:<br/>Invalid Arguments]
    
    ResolveDir -->|Success| CheckSubmodules{Check Git<br/>Submodules<br/>Status}
    ResolveDir -->|Failed| ErrorExit
    
    CheckSubmodules --> GitCheck{Modifies<br/>Files?<br/>[FILL IN: Yes/No]}
    
    GitCheck -->|Yes| GitIsolate[1. Git Worktree Isolation<br/>Create at absolute path<br/>Use git -C for all ops<br/>[FILL IN: branch strategy]]
    GitCheck -->|No| Rehydrate[2. Rehydrate Context<br/>Load docs/ and epics/<br/>Check best practices<br/>[FILL IN: files to load]]
    
    GitIsolate --> Rehydrate
    
    Rehydrate --> LoadDocs[Load Project<br/>Documentation<br/>ADRs, Standards]
    
    LoadDocs --> LoadLessons[Load Central<br/>Lessons from<br/>docs/lessons/]
    
    LoadLessons --> Clarify[3. Requirements Clarification<br/>Apply project standards<br/>[FILL IN: requirements]]
    
    Clarify --> ConfirmGate{Confirmation<br/>Required?}
    
    ConfirmGate -->|Yes| UserConfirm[Await User Confirmation<br/>Critical Decision Point]
    ConfirmGate -->|No| Plan
    
    UserConfirm -->|Approved| Plan[4. Execution Planning<br/>Follow best practices<br/>Use absolute paths<br/>[FILL IN: planning approach]]
    UserConfirm -->|Rejected| Abort[Abort: User Cancelled]
    
    Plan --> Execute[5. Execute Plan<br/>Apply standards<br/>All paths absolute<br/>[FILL IN: main implementation]]
    
    Execute --> SubagentCheck{Needs<br/>Subagents?}
    
    SubagentCheck -->|Yes| CallSubagents[Call Subagents<br/>Pass absolute working_dir<br/>[FILL IN: which agents]]
    SubagentCheck -->|No| Validate
    
    CallSubagents --> ProcessResults[Process Subagent<br/>Results]
    
    ProcessResults --> Validate{6. Validate Against<br/>Requirements & Standards<br/>[FILL IN: validation criteria]}
    
    Validate -->|Failed| RecordFailure[Record Failure<br/>to Central Lessons]
    RecordFailure --> IterationCheck{Max<br/>Retries?}
    
    IterationCheck -->|No| Plan
    IterationCheck -->|Yes| ValidationFailed[Exit: Validation Failed]
    
    Validate -->|Passed| QualityPass[7. Final Quality Pass<br/>Check against standards<br/>[FILL IN: quality checks]]
    
    QualityPass --> Document[8. Documentation Update<br/>Update docs/ content<br/>[FILL IN: docs to update]]
    
    Document --> CaptureLessons[Capture Lessons to<br/>Central Repository<br/>docs/lessons/]
    
    CaptureLessons --> MergeCheck{Modified<br/>Files?}
    
    MergeCheck -->|Yes| GitMerge[9. Git Worktree Merge<br/>Use git -C with abs paths<br/>[FILL IN: merge strategy]]
    MergeCheck -->|No| Report
    
    GitMerge --> Report[10. Comprehensive Result<br/>Include all abs paths<br/>[FILL IN: key outputs]]
    
    Report --> SaveCentralLessons[Save to Central<br/>Lessons Repository<br/>docs/lessons/]
    
    SaveCentralLessons --> End([Return to Caller])
    
    ErrorExit --> End
    Abort --> End
    ValidationFailed --> End
    
    style CaptureAbs fill:#ff6b6b
    style ResolveDir fill:#4ecdc4
    style ParseArgs fill:#ffccbc
    style CheckSubmodules fill:#95e1d3
    style GitIsolate fill:#fce4ec
    style Rehydrate fill:#e1f5fe
    style LoadDocs fill:#b8e994
    style LoadLessons fill:#c5e1a5
    style Clarify fill:#fff9c4
    style Plan fill:#f3e5f5
    style Execute fill:#c8e6c9
    style Validate fill:#ffeb3b
    style QualityPass fill:#e8f5e9
    style Document fill:#ffe0b2
    style GitMerge fill:#ffcdd2
    style Report fill:#b2dfdb
    style CaptureLessons fill:#c5e1a5
    style SaveCentralLessons fill:#c5e1a5
    style ConfirmGate fill:#ff9800
    style RecordFailure fill:#ffab91
    style CallSubagents fill:#d1c4e9
    style ProcessResults fill:#d1c4e9
```

## Detailed Phase Specifications

### Phase 0: Argument Parsing and Absolute Directory Setup
- **CRITICAL**: Capture absolute base directory immediately: `ABSOLUTE_BASE_DIR=$(pwd -P)`
- Parse three arguments: task description, task config JSON, agent config JSON
- Convert JSON configs to TASK_* and AGENT_* environment variables
- **Resolve working directory to absolute path**: `AGENT_WORKING_DIR=$(realpath "${AGENT_WORKING_DIR:-$ABSOLUTE_BASE_DIR}")`
- Verify git repository status using: `git -C "$AGENT_WORKING_DIR" rev-parse --git-dir`
- Check git submodules status: `git -C "$AGENT_WORKING_DIR" submodule status`
- Set up paths to central documentation: `DOCS_DIR="$ABSOLUTE_BASE_DIR/docs"`
- Ensure required directory structure exists using absolute paths

### Phase 1: Git Worktree Isolation
[FILL IN: Whether this agent modifies files and needs isolation]
- Calculate worktree path as absolute: `WORKTREE_DIR=$(realpath "../${worktree_id}")`
- Create isolated git worktree at absolute path location
- Use `git -C "$AGENT_WORKING_DIR" worktree add "$WORKTREE_DIR" -b "$branch_name"`
- Apply uncommitted changes using: `git -C "$AGENT_WORKING_DIR" diff HEAD | git -C "$WORKTREE_DIR" apply`
- Store both original and worktree absolute paths for later operations
- Protect main branch from concurrent modifications
- Ensure submodules are initialized in worktree if needed

### Phase 2: Rehydrate Context (Enhanced with Project Documentation)
[FILL IN: Specific files and patterns to load, including previous lessons]
**MANDATORY DOCUMENTATION LOADING:**
- Load Architecture Decision Records: `$DOCS_DIR/architecture/decisions/*.md`
- Load relevant design decisions: `$DOCS_DIR/design/*.md`
- Load project best practices: `$DOCS_DIR/best-practices/*.md`
- Load project standards: `$DOCS_DIR/standards/*.md`
- Load central lessons: `$DOCS_DIR/lessons/CENTRAL_LESSONS.md`
- Load agent-specific history: `$DOCS_DIR/lessons/by-agent/[agent-name].md`
- Load patterns library: `$DOCS_DIR/lessons/patterns/*.md`
- Load antipatterns to avoid: `$DOCS_DIR/lessons/antipatterns/*.md`

**EPIC AND REQUIREMENTS LOADING:**
- If TASK_EPIC specified, load: `$ABSOLUTE_BASE_DIR/epics/$TASK_EPIC/requirements/*.md`
- Load relevant user stories: `$ABSOLUTE_BASE_DIR/epics/$TASK_EPIC/stories/*.md`
- Pattern 1: [FILL IN: e.g., $AGENT_WORKING_DIR/epics/*/requirements/*.md]
- Pattern 2: [FILL IN: e.g., $AGENT_WORKING_DIR/tests/**/*.test.js]
- Pattern 3: [FILL IN: e.g., $AGENT_WORKING_DIR/docs/architecture/*.md]

### Phase 3: Requirements Clarification
[FILL IN: Requirements, constraints, and edge cases based on task interpretation]
- Must Consider: [FILL IN: requirements this agent handles]
- Must Ignore: [FILL IN: out-of-scope items]
- Corner Cases: [FILL IN: edge cases to handle]
- Boundaries: [FILL IN: limits and constraints]
- **Project Standards Applied**: Reference loaded standards from docs/standards/
- **Best Practices Applied**: Reference loaded best practices from docs/best-practices/
- **ADR Compliance**: Ensure compliance with architecture decisions
- Working Directory Context: All operations relative to `$AGENT_WORKING_DIR` (absolute)
- Apply lessons learned from central repository
- Set confirmation requirements based on criticality

### Phase 4: Execution Planning
[FILL IN: Planning approach with lessons integration and task interpretation]
- Planning Strategy: [FILL IN: how this agent creates plans]
- **Standards Compliance**: Ensure plan follows project standards
- **Best Practices Integration**: Apply documented best practices
- **Pattern Application**: Use successful patterns from docs/lessons/patterns/
- **Antipattern Avoidance**: Avoid known antipatterns from docs/lessons/antipatterns/
- Decision Points: [FILL IN: key decisions to make]
- Subagent Delegation: [FILL IN: when to call other agents - pass absolute paths]
- Reference successful patterns from central lessons
- Create plan with confidence scores based on past experience
- All file paths in plan use absolute references

### Phase 5: Execute Plan
[FILL IN: Implementation with subagent calls using three-argument pattern]
- Primary Tasks: [FILL IN: main implementation work]
- **Apply Coding Standards**: Follow docs/best-practices/coding-standards.md
- **Error Handling**: Follow docs/standards/error-handling.md patterns
- **Logging Standards**: Follow docs/standards/logging.md
- File Operations: [FILL IN: what files to create/modify - use absolute paths]
- Subagent Calls: [FILL IN: specific subagents to invoke with absolute working_dir]
- Apply best practices from central knowledge base
- Monitor for known issues documented in antipatterns
- All file I/O uses absolute paths

### Phase 6: Validate Against Requirements
[FILL IN: Validation with iteration and failure capture]
- Validation Checks: [FILL IN: specific checks to perform]
- **Standards Validation**: Verify compliance with project standards
- **Best Practices Check**: Ensure best practices were followed
- Success Criteria: [FILL IN: what constitutes success]
- Iteration Strategy: [FILL IN: how to improve if validation fails]
- Check against known failure patterns from antipatterns library
- Record any validation failures to central lessons
- Validate files exist at expected absolute paths

### Phase 7: Final Quality Pass
[FILL IN: Quality checks and cleanup]
- Quality Metrics: [FILL IN: specific quality measures]
- **Documentation Standards**: Check docs/best-practices/documentation.md compliance
- **Testing Standards**: Verify docs/best-practices/testing.md compliance
- Cleanup Tasks: [FILL IN: temporary files to remove - use absolute paths]
- Final Verifications: [FILL IN: last checks before completion]
- Verify against quality patterns from central lessons
- Ensure no relative path assumptions remain

### Phase 8: Documentation Update
[FILL IN: Documentation requirements]
- Reports to Generate: [FILL IN: specific reports at absolute paths]
- **Update Central Lessons**: Add insights to `$DOCS_DIR/lessons/CENTRAL_LESSONS.md`
- **Update Agent History**: Add to `$DOCS_DIR/lessons/by-agent/[agent-name].md`
- **Pattern Documentation**: If new pattern discovered, create `$DOCS_DIR/lessons/patterns/[pattern-name].md`
- **Antipattern Documentation**: If new antipattern discovered, create `$DOCS_DIR/lessons/antipatterns/[antipattern-name].md`
- Patterns to Capture: [FILL IN: lessons learned]
- Metrics to Record: [FILL IN: key measurements]
- Update project documentation at `$ABSOLUTE_BASE_DIR/docs/`
- Consider if any ADRs need updating based on findings

### Phase 9: Git Worktree Merge
[FILL IN: Merge strategy if modifying files]
- Commit changes in worktree: `git -C "$WORKTREE_DIR" commit`
- **Follow Git Workflow**: Apply docs/best-practices/git-workflow.md
- Return to original absolute directory: `cd "$ABSOLUTE_BASE_DIR"`
- Merge changes: `git -C "$ABSOLUTE_BASE_DIR" merge "$branch_name" --no-ff`
- Clean up worktree: `git -C "$ABSOLUTE_BASE_DIR" worktree remove "$WORKTREE_DIR"`
- Update submodules if needed: `git -C "$ABSOLUTE_BASE_DIR" submodule update`

### Phase 10: Comprehensive Result
[FILL IN: Results and lessons capture]
- Generate detailed report with all metrics and absolute paths used
- **Contribute to Central Knowledge**: Update docs/lessons/CENTRAL_LESSONS.md
- **Update Agent History**: Append to docs/lessons/by-agent/[agent-name].md
- Extract key insights for central lessons repository
- Document any new patterns or antipatterns discovered
- Provide actionable next steps
- Return structured output for parent agent
- Include absolute paths in JSON output for traceability

## When You Are Called
USE THIS AGENT PROACTIVELY when:
- [FILL IN: Specific trigger condition 1]
- [FILL IN: Specific trigger condition 2]
- [FILL IN: Specific trigger condition 3]
- Project documentation needs to be consulted for the task
- Task relates to documented epics or requirements

## Subagents You Will Call
[FILL IN: List the subagents this agent will delegate to, or write "None - this agent works independently"]

### Subagent Call Sequence (Customize for Your Agent):
```mermaid
graph TD
    Start([This Agent Starts<br/>At Absolute Path]) --> LoadStandards[Load Project<br/>Standards]
    
    LoadStandards --> Analyze{Analyze Task<br/>Against Standards}
    
    Analyze -->|[FILL IN: Condition 1]| Agent1[Call: agent-name-1<br/>Pass absolute working_dir<br/>Task: specific task<br/>Config: task_config]
    Analyze -->|[FILL IN: Condition 2]| Agent2[Call: agent-name-2<br/>Pass absolute working_dir<br/>Task: specific task<br/>Config: task_config]
    Analyze -->|[FILL IN: Condition 3]| Parallel[Parallel Execution<br/>All with abs paths]
    
    Parallel --> Agent3[Call: agent-name-3<br/>Task: task A]
    Parallel --> Agent4[Call: agent-name-3<br/>Task: task B]
    
    Agent1 --> ProcessResults[Process Results<br/>Update Central Lessons]
    Agent2 --> ProcessResults
    Agent3 --> ProcessResults
    Agent4 --> ProcessResults
    
    ProcessResults --> Continue[Continue Execution]
```

## Execution Modes

### DRY RUN MODE
When AGENT_DRY_RUN is true:
1. DO NOT make any actual changes to files
2. DO NOT execute destructive commands
3. DO NOT commit to git
4. Instead, output detailed plan of what WOULD be done (with absolute paths)
5. Still load and check project documentation
6. Return structured report of planned actions

### NORMAL EXECUTION MODE
Follow the complete 10-phase framework with all operations using absolute paths and project standards.

## Core Execution Script

```bash
#!/bin/bash
# AGENT: [FILL IN: agent-name]
# VERSION: 5.1
# PURPOSE: [FILL IN: one-line purpose]
# USE THIS AGENT PROACTIVELY: [FILL IN: when to auto-trigger]
# PATH DISCIPLINE: All paths are captured as absolute and git operations use explicit directory context
# KNOWLEDGE INTEGRATION: Loads project documentation and contributes to central lessons repository

set -euo pipefail  # Fail fast on errors, undefined variables, pipe failures

AGENT_NAME="[FILL IN: agent-name]"
AGENT_VERSION="5.1"

# ============================================
# CRITICAL: CAPTURE ABSOLUTE BASE DIRECTORY
# ============================================
# Store the absolute path of where the agent was invoked
# This is critical for all subsequent operations
ABSOLUTE_BASE_DIR=$(pwd -P)
echo "📍 Captured absolute base directory: $ABSOLUTE_BASE_DIR"

# Set up central documentation paths
DOCS_DIR="$ABSOLUTE_BASE_DIR/docs"
CENTRAL_LESSONS_DIR="$DOCS_DIR/lessons"
CENTRAL_LESSONS_FILE="$CENTRAL_LESSONS_DIR/CENTRAL_LESSONS.md"
AGENT_LESSONS_FILE="$CENTRAL_LESSONS_DIR/by-agent/${AGENT_NAME}.md"
PATTERNS_DIR="$CENTRAL_LESSONS_DIR/patterns"
ANTIPATTERNS_DIR="$CENTRAL_LESSONS_DIR/antipatterns"
ARCHITECTURE_DIR="$DOCS_DIR/architecture"
DESIGN_DIR="$DOCS_DIR/design"
BEST_PRACTICES_DIR="$DOCS_DIR/best-practices"
STANDARDS_DIR="$DOCS_DIR/standards"
EPICS_DIR="$ABSOLUTE_BASE_DIR/epics"

# ============================================
# THREE-ARGUMENT PATTERN WITH CLEAR SEPARATION
# ============================================
# Subagents receive exactly three arguments:
# $1: Task description (what to do) - required
# $2: Task configuration JSON (data for the task) - optional, defaults to {}
# $3: Agent configuration JSON (agent behavior) - optional, defaults to {}

# Parse the three arguments
task_description="${1:-}"
task_config="${2:-{\}}"      # Default to empty JSON if not provided
agent_config="${3:-{\}}"      # Default to empty JSON if not provided

# Validate task description is provided
if [ -z "$task_description" ]; then
  cat << 'EOF'
ERROR: Task description is required

Usage: $0 <task_description> [task_config_json] [agent_config_json]

Arguments:
  task_description  : What this agent should do (required)
  task_config_json  : Task-specific data as JSON (optional, default: {})
  agent_config_json : Agent behavior overrides as JSON (optional, default: {})

IMPORTANT: 
  - When specifying working_dir in agent_config, use absolute paths
  - This agent loads project documentation from docs/ directory
  - Contributes lessons to centralized repository at docs/lessons/

Examples:
  $0 "analyze security" "{}" "{}"
  $0 "analyze security" '{"files":"*.py","epic":"security-epic"}' '{"dry_run":true,"working_dir":"'$(pwd -P)'"}'
  $0 "optimize queries" '{"threshold":100}' '{"verbose":true,"output_mode":"inline","working_dir":"'/home/user/project'"}'

Task Config Fields (become TASK_* variables):
  - files: Files to process (relative paths resolved from working_dir)
  - modules: Modules to analyze  
  - threshold: Numeric thresholds
  - severity: Severity levels
  - depth: Analysis depth (quick|normal|comprehensive)
  - epic: Related epic name for requirements loading
  - Any custom fields for your task

Agent Config Fields (become AGENT_* variables):
  - dry_run: Test mode without making changes
  - verbose: Detailed output
  - output_mode: inline|file|both
  - working_dir: Working directory (will be resolved to absolute path)
  - require_confirmation: Prompt for critical actions
  - parent_agent: Name of calling agent
  - task_id: Unique task identifier
  - skip_docs: Skip documentation loading (default: false)
EOF
  exit 1
fi

# ============================================
# PARSE TASK CONFIGURATION (TASK_* variables)
# ============================================
echo "═══════════════════════════════════════════════════════"
echo "Task: $task_description"
echo "Task Config: $task_config"

# Validate JSON format
if ! echo "$task_config" | jq . >/dev/null 2>&1; then
  echo "ERROR: Invalid JSON in task_config"
  exit 1
fi
if ! echo "$agent_config" | jq . >/dev/null 2>&1; then
  echo "ERROR: Invalid JSON in agent_config"
  exit 1
fi

# Parse common task fields with defaults
TASK_FILES=$(echo "$task_config" | jq -r '.files // empty')
TASK_MODULES=$(echo "$task_config" | jq -r '.modules[]? // empty' | tr '\n' ' ')
TASK_THRESHOLD=$(echo "$task_config" | jq -r '.threshold // 0')
TASK_SEVERITY=$(echo "$task_config" | jq -r '.severity // "medium"')
TASK_DEPTH=$(echo "$task_config" | jq -r '.depth // "normal"')
TASK_EPIC=$(echo "$task_config" | jq -r '.epic // empty')
TASK_TARGETS=$(echo "$task_config" | jq -r '.targets[]? // empty' | tr '\n' ' ')
TASK_PATTERNS=$(echo "$task_config" | jq -r '.patterns[]? // empty' | tr '\n' ' ')
TASK_EXCLUDE=$(echo "$task_config" | jq -r '.exclude[]? // empty' | tr '\n' ' ')

# Parse ALL task fields dynamically as TASK_* variables
for key in $(echo "$task_config" | jq -r 'keys[]'); do
  # Convert to uppercase and prefix with TASK_
  var_name="TASK_$(echo "$key" | tr '[:lower:]' '[:upper:]' | tr '-' '_')"
  
  # Get the value (handle arrays and objects as JSON strings)
  value=$(echo "$task_config" | jq -r ".${key}")
  if echo "$task_config" | jq -e ".${key} | type" | grep -qE "array|object"; then
    value=$(echo "$task_config" | jq -c ".${key}")
  fi
  
  # Export as environment variable (if not already set above)
  if [ -z "${!var_name:-}" ]; then
    export "$var_name=$value"
  fi
done

# ============================================
# PARSE AGENT CONFIGURATION (AGENT_* variables)
# ============================================
echo "Agent Config: $agent_config"

# Parse standard agent behavior fields with defaults
AGENT_DRY_RUN=$(echo "$agent_config" | jq -r '.dry_run // false')
AGENT_VERBOSE=$(echo "$agent_config" | jq -r '.verbose // false')
AGENT_OUTPUT_MODE=$(echo "$agent_config" | jq -r '.output_mode // "file"')
AGENT_SKIP_DOCS=$(echo "$agent_config" | jq -r '.skip_docs // false')

# CRITICAL: Parse and resolve working directory to absolute path
AGENT_WORKING_DIR_RAW=$(echo "$agent_config" | jq -r '.working_dir // "."')
if [ "$AGENT_WORKING_DIR_RAW" = "." ]; then
  AGENT_WORKING_DIR="$ABSOLUTE_BASE_DIR"
else
  # Resolve to absolute path (handles both relative and absolute input)
  AGENT_WORKING_DIR=$(realpath "$AGENT_WORKING_DIR_RAW" 2>/dev/null || echo "$ABSOLUTE_BASE_DIR")
fi
echo "📍 Resolved working directory to absolute: $AGENT_WORKING_DIR"

AGENT_REQUIRE_CONFIRMATION=$(echo "$agent_config" | jq -r '.require_confirmation // false')
AGENT_FAIL_ON_CRITICAL=$(echo "$agent_config" | jq -r '.fail_on_critical // true')
AGENT_MAX_RETRIES=$(echo "$agent_config" | jq -r '.max_retries // 3')
AGENT_TIMEOUT=$(echo "$agent_config" | jq -r '.timeout // 300')

# Parse directory configuration WITH ABSOLUTE PATHS
AGENT_DIR="$AGENT_WORKING_DIR/.agent"
AGENT_REPORTS_DIR=$(echo "$agent_config" | jq -r ".reports_dir // \"$AGENT_DIR/reports\"")
if [[ ! "$AGENT_REPORTS_DIR" = /* ]]; then
  AGENT_REPORTS_DIR="$AGENT_WORKING_DIR/$AGENT_REPORTS_DIR"
fi

AGENT_CHECKPOINTS_DIR=$(echo "$agent_config" | jq -r ".checkpoints_dir // \"$AGENT_DIR/checkpoints\"")
if [[ ! "$AGENT_CHECKPOINTS_DIR" = /* ]]; then
  AGENT_CHECKPOINTS_DIR="$AGENT_WORKING_DIR/$AGENT_CHECKPOINTS_DIR"
fi

AGENT_STATE_DIR=$(echo "$agent_config" | jq -r ".state_dir // \"$AGENT_DIR/state\"")
if [[ ! "$AGENT_STATE_DIR" = /* ]]; then
  AGENT_STATE_DIR="$AGENT_WORKING_DIR/$AGENT_STATE_DIR"
fi

# Parse metadata
AGENT_PARENT=$(echo "$agent_config" | jq -r '.parent_agent // "direct"')
AGENT_TASK_ID=$(echo "$agent_config" | jq -r '.task_id // empty') || AGENT_TASK_ID="task-$(date +%s)"
AGENT_PRIORITY=$(echo "$agent_config" | jq -r '.priority // "normal"')

# Parse ALL agent fields dynamically as AGENT_* variables
for key in $(echo "$agent_config" | jq -r 'keys[]'); do
  # Convert to uppercase and prefix with AGENT_
  var_name="AGENT_$(echo "$key" | tr '[:lower:]' '[:upper:]' | tr '-' '_')"
  
  # Get the value
  value=$(echo "$agent_config" | jq -r ".${key}")
  if echo "$agent_config" | jq -e ".${key} | type" | grep -qE "array|object"; then
    value=$(echo "$agent_config" | jq -c ".${key}")
  fi
  
  # Export as environment variable (if not already set above)
  if [ -z "${!var_name:-}" ]; then
    export "$var_name=$value"
  fi
done

# ============================================
# TASK INTERPRETATION
# ============================================
# Parse task description for key directives
task_type=""
task_complexity="normal"

# [FILL IN: Add your agent-specific task interpretation logic]
# Example parsing logic (customize for your agent)
if [[ "$task_description" == *"analyze"* ]]; then
  task_type="analysis"
elif [[ "$task_description" == *"generate"* ]]; then
  task_type="generation"
elif [[ "$task_description" == *"optimize"* ]]; then
  task_type="optimization"
elif [[ "$task_description" == *"fix"* ]] || [[ "$task_description" == *"repair"* ]]; then
  task_type="repair"
elif [[ "$task_description" == *"validate"* ]] || [[ "$task_description" == *"verify"* ]]; then
  task_type="validation"
elif [[ "$task_description" == *"document"* ]]; then
  task_type="documentation"
else
  task_type="general"
fi

# Detect complexity modifiers in task description
if [[ "$task_description" == *"comprehensive"* ]] || [[ "$task_description" == *"deep"* ]] || [[ "$task_description" == *"thorough"* ]]; then
  task_complexity="complex"
elif [[ "$task_description" == *"quick"* ]] || [[ "$task_description" == *"basic"* ]] || [[ "$task_description" == *"simple"* ]]; then
  task_complexity="simple"
fi

# Override with explicit depth if provided in task config
if [ -n "$TASK_DEPTH" ]; then
  case "$TASK_DEPTH" in
    quick|simple) task_complexity="simple" ;;
    comprehensive|deep|thorough) task_complexity="complex" ;;
    *) task_complexity="normal" ;;
  esac
fi

# Log invocation details for traceability
echo "Agent: $AGENT_NAME v$AGENT_VERSION"
echo "Invoked by: $AGENT_PARENT"
echo "Task Type: $task_type"
echo "Task Complexity: $task_complexity"
echo "Task ID: $AGENT_TASK_ID"
echo "Priority: $AGENT_PRIORITY"
echo "Absolute Base Dir: $ABSOLUTE_BASE_DIR"
echo "Working Dir (Absolute): $AGENT_WORKING_DIR"
echo "Documentation Dir: $DOCS_DIR"
echo "Central Lessons: $CENTRAL_LESSONS_FILE"
echo "Dry Run: $AGENT_DRY_RUN"
echo "Verbose: $AGENT_VERBOSE"
echo "Output Mode: $AGENT_OUTPUT_MODE"
echo "Skip Docs: $AGENT_SKIP_DOCS"
echo "═══════════════════════════════════════════════════════"

if [ "$AGENT_VERBOSE" = "true" ]; then
  echo ""
  echo "Task Variables:"
  env | grep "^TASK_" | sort
  echo ""
  echo "Agent Variables:"
  env | grep "^AGENT_" | sort
  echo ""
  echo "Path Variables:"
  echo "  ABSOLUTE_BASE_DIR=$ABSOLUTE_BASE_DIR"
  echo "  AGENT_WORKING_DIR=$AGENT_WORKING_DIR"
  echo "  AGENT_DIR=$AGENT_DIR"
  echo "  DOCS_DIR=$DOCS_DIR"
  echo "  CENTRAL_LESSONS_DIR=$CENTRAL_LESSONS_DIR"
  echo "  ARCHITECTURE_DIR=$ARCHITECTURE_DIR"
  echo "  EPICS_DIR=$EPICS_DIR"
  echo ""
fi

# Initialize metrics
START_TIME=$(date +%s)
lessons_captured=0
lessons_applied=0
patterns_discovered=0
antipatterns_discovered=0
files_created=0
files_modified=0
files_deleted=0
docs_loaded=0
standards_applied=0
critical_errors=""
temp_files=""
subagents_invoked=""
validation_score=0
quality_checks_passed=0
quality_checks_total=0
validation_attempts=0
plan_revision=0

# Check for dry run mode
if [ "$AGENT_DRY_RUN" = "true" ]; then
  echo "╔════════════════════════════════════════════════════════════╗"
  echo "║                    DRY RUN MODE ACTIVE                      ║"
  echo "║           No actual changes will be made to files           ║"
  echo "╚════════════════════════════════════════════════════════════╝"
fi

# === PHASE 0: DIRECTORY SETUP WITH ABSOLUTE PATHS ===
echo ""
echo "=== PHASE 0: DIRECTORY SETUP (ABSOLUTE PATHS) ==="
echo "Setting up working directory: $AGENT_WORKING_DIR"

# Store original absolute directory for return
ORIGINAL_ABSOLUTE_DIR="$ABSOLUTE_BASE_DIR"
echo "📍 Original absolute directory stored: $ORIGINAL_ABSOLUTE_DIR"

# Navigate to working directory (already resolved to absolute)
if [ -d "$AGENT_WORKING_DIR" ]; then
  cd "$AGENT_WORKING_DIR"
  echo "✓ Changed to working directory: $(pwd -P)"
else
  echo "ERROR: Working directory does not exist: $AGENT_WORKING_DIR"
  if [ "$AGENT_FAIL_ON_CRITICAL" = "true" ]; then
    exit 1
  fi
fi

# Verify git repository using explicit directory
if ! git -C "$AGENT_WORKING_DIR" rev-parse --git-dir > /dev/null 2>&1; then
  echo "ERROR: Not in a git repository at: $AGENT_WORKING_DIR"
  if [ "$AGENT_FAIL_ON_CRITICAL" = "true" ]; then
    exit 1
  fi
fi

# Check git submodules status
echo "Checking git submodules status..."
if [ -f "$AGENT_WORKING_DIR/.gitmodules" ]; then
  git -C "$AGENT_WORKING_DIR" submodule status
  if ! git -C "$AGENT_WORKING_DIR" submodule status | grep -E '^\+' > /dev/null; then
    echo "✓ All submodules are up to date"
  else
    echo "⚠️ Some submodules need updating"
    if [ "$AGENT_DRY_RUN" = "false" ]; then
      git -C "$AGENT_WORKING_DIR" submodule update --init --recursive
      echo "✓ Submodules updated"
    fi
  fi
else
  echo "No submodules configured"
fi

# Create agent directory structure if needed (using absolute paths)
mkdir -p "$AGENT_REPORTS_DIR" "$AGENT_CHECKPOINTS_DIR" "$AGENT_STATE_DIR"
echo "✓ Created agent directories at absolute paths"

# Create central documentation directories if they don't exist
mkdir -p "$CENTRAL_LESSONS_DIR" "$PATTERNS_DIR" "$ANTIPATTERNS_DIR" \
         "$ARCHITECTURE_DIR/decisions" "$ARCHITECTURE_DIR/diagrams" \
         "$DESIGN_DIR" "$BEST_PRACTICES_DIR" "$STANDARDS_DIR" \
         "$CENTRAL_LESSONS_DIR/by-agent" "$DOCS_DIR/agents/$AGENT_NAME"
echo "✓ Ensured central documentation structure exists"

# Initialize central lessons file if it doesn't exist
if [ ! -f "$CENTRAL_LESSONS_FILE" ]; then
  cat << EOF > "$CENTRAL_LESSONS_FILE"
# Central Lessons Learned Repository

## Overview
This file aggregates lessons learned from all agents in the system.
It serves as the collective knowledge base for continuous improvement.
Repository Base: $ABSOLUTE_BASE_DIR
Last Updated: $(date -Iseconds)

## Quick Reference
- Patterns: See $PATTERNS_DIR/
- Antipatterns: See $ANTIPATTERNS_DIR/
- Agent-Specific: See $CENTRAL_LESSONS_DIR/by-agent/

## Recent Insights

## By Agent

## Cross-Agent Patterns

## System-Wide Insights

## Metrics
- Total Lessons: 0
- Total Patterns: 0
- Total Antipatterns: 0
- Contributing Agents: 0

---
EOF
fi

# Initialize agent-specific lessons file if it doesn't exist
if [ ! -f "$AGENT_LESSONS_FILE" ]; then
  cat << EOF > "$AGENT_LESSONS_FILE"
# Lessons Learned: $AGENT_NAME

## Agent Overview
- **Name**: $AGENT_NAME
- **Version**: $AGENT_VERSION
- **Purpose**: [FILL IN: agent purpose]
- **Base Directory**: $ABSOLUTE_BASE_DIR
- **First Run**: $(date -Iseconds)

## Execution History

## Patterns Discovered

## Antipatterns Discovered

## Performance Metrics

## Common Issues & Solutions

---
EOF
fi

# Helper Functions
confirm_action() {
  local prompt=$1
  local default_action=${2:-continue}  # continue or abort
  
  if [ "$AGENT_REQUIRE_CONFIRMATION" = "true" ]; then
    echo ""
    echo "═══════════════════════════════════════════════════════"
    echo "CONFIRMATION REQUIRED: $prompt"
    echo "Current Directory: $(pwd -P)"
    echo "Proceed? (y/n):"
    read -r response
    case "$response" in
      [Yy]* ) return 0;;
      * ) 
        echo "Action cancelled by user"
        if [ "$default_action" = "abort" ] && [ "$AGENT_FAIL_ON_CRITICAL" = "true" ]; then
          exit 4
        fi
        return 1
        ;;
    esac
  fi
  return 0
}

load_project_documentation() {
  if [ "$AGENT_SKIP_DOCS" = "true" ]; then
    echo "Skipping documentation loading (AGENT_SKIP_DOCS=true)"
    return
  fi
  
  echo "Loading project documentation..."
  local loaded=0
  
  # Load Architecture Decision Records
  if [ -d "$ARCHITECTURE_DIR/decisions" ]; then
    for adr in "$ARCHITECTURE_DIR/decisions"/*.md; do
      if [ -f "$adr" ]; then
        echo "  📚 Loading ADR: $(basename "$adr")"
        if [ "$AGENT_VERBOSE" = "true" ]; then
          head -20 "$adr"
        fi
        loaded=$((loaded + 1))
      fi
    done
  fi
  
  # Load Best Practices
  if [ -d "$BEST_PRACTICES_DIR" ]; then
    for practice in "$BEST_PRACTICES_DIR"/*.md; do
      if [ -f "$practice" ]; then
        echo "  📚 Loading best practice: $(basename "$practice")"
        loaded=$((loaded + 1))
      fi
    done
  fi
  
  # Load Standards
  if [ -d "$STANDARDS_DIR" ]; then
    for standard in "$STANDARDS_DIR"/*.md; do
      if [ -f "$standard" ]; then
        echo "  📚 Loading standard: $(basename "$standard")"
        standards_applied=$((standards_applied + 1))
        loaded=$((loaded + 1))
      fi
    done
  fi
  
  # Load Design Decisions
  if [ -d "$DESIGN_DIR" ]; then
    for design in "$DESIGN_DIR"/*.md; do
      if [ -f "$design" ]; then
        echo "  📚 Loading design doc: $(basename "$design")"
        loaded=$((loaded + 1))
      fi
    done
  fi
  
  docs_loaded=$loaded
  echo "✓ Loaded $docs_loaded documentation files"
}

load_lessons() {
  # Load central lessons
  if [ -f "$CENTRAL_LESSONS_FILE" ]; then
    echo "Loading central lessons from: $CENTRAL_LESSONS_FILE"
    # Extract metrics from central lessons
    local total_lessons=$(grep -c "^### \[" "$CENTRAL_LESSONS_FILE" 2>/dev/null || echo 0)
    echo "  📚 Found $total_lessons total lessons in repository"
  fi
  
  # Load agent-specific history
  if [ -f "$AGENT_LESSONS_FILE" ]; then
    echo "Loading agent history from: $AGENT_LESSONS_FILE"
    # Extract actionable patterns
    local patterns=$(grep -E "^- (PATTERN|ANTIPATTERN|INSIGHT):" "$AGENT_LESSONS_FILE" 2>/dev/null | head -10 || true)
    if [ -n "$patterns" ]; then
      echo "Applying learned patterns:"
      echo "$patterns"
    fi
    lessons_applied=$((lessons_applied + $(grep -c "^- " "$AGENT_LESSONS_FILE" 2>/dev/null || echo 0)))
  fi
  
  # Load pattern library
  if [ -d "$PATTERNS_DIR" ]; then
    local pattern_count=$(ls -1 "$PATTERNS_DIR"/*.md 2>/dev/null | wc -l || echo 0)
    echo "  📚 Pattern library contains $pattern_count patterns"
  fi
  
  # Load antipattern library
  if [ -d "$ANTIPATTERNS_DIR" ]; then
    local antipattern_count=$(ls -1 "$ANTIPATTERNS_DIR"/*.md 2>/dev/null | wc -l || echo 0)
    echo "  📚 Antipattern library contains $antipattern_count antipatterns"
  fi
}

capture_lesson() {
  local lesson_type=$1  # SUCCESS, FAILURE, INSIGHT, PATTERN, ANTIPATTERN
  local lesson_text=$2
  local context=${3:-""}
  
  local timestamp=$(date -Iseconds)
  local lesson_entry="
### [$timestamp] $lesson_type - $AGENT_NAME
- **Lesson**: $lesson_text
- **Context**: ${context:-Task: $task_description}
- **Task Type**: $task_type
- **Phase**: ${current_phase:-unknown}
- **Working Directory**: $AGENT_WORKING_DIR
- **Agent**: $AGENT_NAME v$AGENT_VERSION
"
  
  # Append to temporary lessons file (for later central merge)
  echo "$lesson_entry" >> "${CENTRAL_LESSONS_FILE}.tmp"
  
  # Also append to agent-specific history
  echo "$lesson_entry" >> "${AGENT_LESSONS_FILE}.tmp"
  
  lessons_captured=$((lessons_captured + 1))
  
  # Track patterns and antipatterns for separate documentation
  if [ "$lesson_type" = "PATTERN" ]; then
    patterns_discovered=$((patterns_discovered + 1))
    echo "$lesson_text" >> "${PATTERNS_DIR}/pending.tmp"
  elif [ "$lesson_type" = "ANTIPATTERN" ]; then
    antipatterns_discovered=$((antipatterns_discovered + 1))
    echo "$lesson_text" >> "${ANTIPATTERNS_DIR}/pending.tmp"
  fi
  
  if [ "$AGENT_VERBOSE" = "true" ]; then
    echo "  📝 Captured lesson: $lesson_type - $lesson_text"
  fi
}

save_lessons() {
  if [ -f "${CENTRAL_LESSONS_FILE}.tmp" ] && [ $lessons_captured -gt 0 ]; then
    echo "Saving $lessons_captured new lessons to central repository..."
    
    # Append to central lessons file
    echo -e "\n## Session: $(date -Iseconds) - $AGENT_NAME" >> "$CENTRAL_LESSONS_FILE"
    echo "Task: $task_description" >> "$CENTRAL_LESSONS_FILE"
    echo "Working Directory: $AGENT_WORKING_DIR" >> "$CENTRAL_LESSONS_FILE"
    cat "${CENTRAL_LESSONS_FILE}.tmp" >> "$CENTRAL_LESSONS_FILE"
    
    # Update metrics in central file
    local total_lessons=$(grep -c "^### \[" "$CENTRAL_LESSONS_FILE" 2>/dev/null || echo 0)
    sed -i "s/- Total Lessons: .*/- Total Lessons: $total_lessons/" "$CENTRAL_LESSONS_FILE"
    
    # Clean up temp file
    rm -f "${CENTRAL_LESSONS_FILE}.tmp"
    
    echo "✓ Lessons saved to central repository: $CENTRAL_LESSONS_FILE"
  fi
  
  if [ -f "${AGENT_LESSONS_FILE}.tmp" ] && [ $lessons_captured -gt 0 ]; then
    # Append to agent-specific file
    cat "${AGENT_LESSONS_FILE}.tmp" >> "$AGENT_LESSONS_FILE"
    rm -f "${AGENT_LESSONS_FILE}.tmp"
    echo "✓ Agent history updated: $AGENT_LESSONS_FILE"
  fi
  
  # Process discovered patterns
  if [ -f "${PATTERNS_DIR}/pending.tmp" ] && [ $patterns_discovered -gt 0 ]; then
    echo "Processing $patterns_discovered new patterns..."
    while IFS= read -r pattern; do
      local pattern_file="$PATTERNS_DIR/$(echo "$pattern" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | head -c 50).md"
      if [ ! -f "$pattern_file" ]; then
        cat << EOF > "$pattern_file"
# Pattern: $pattern

## Discovery
- **Date**: $(date -Iseconds)
- **Agent**: $AGENT_NAME
- **Task**: $task_description

## Description
$pattern

## Implementation

## Benefits

## Examples

## Related Patterns

---
EOF
        echo "✓ Created pattern documentation: $(basename "$pattern_file")"
      fi
    done < "${PATTERNS_DIR}/pending.tmp"
    rm -f "${PATTERNS_DIR}/pending.tmp"
  fi
  
  # Process discovered antipatterns
  if [ -f "${ANTIPATTERNS_DIR}/pending.tmp" ] && [ $antipatterns_discovered -gt 0 ]; then
    echo "Processing $antipatterns_discovered new antipatterns..."
    while IFS= read -r antipattern; do
      local antipattern_file="$ANTIPATTERNS_DIR/$(echo "$antipattern" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | head -c 50).md"
      if [ ! -f "$antipattern_file" ]; then
        cat << EOF > "$antipattern_file"
# Antipattern: $antipattern

## Discovery
- **Date**: $(date -Iseconds)
- **Agent**: $AGENT_NAME
- **Task**: $task_description

## Problem
$antipattern

## Consequences

## Better Approach

## Detection

## Prevention

---
EOF
        echo "✓ Created antipattern documentation: $(basename "$antipattern_file")"
      fi
    done < "${ANTIPATTERNS_DIR}/pending.tmp"
    rm -f "${ANTIPATTERNS_DIR}/pending.tmp"
  fi
}

create_checkpoint() {
  local phase=$1
  local checkpoint_file="$AGENT_CHECKPOINTS_DIR/${AGENT_NAME}-${AGENT_TASK_ID}-phase${phase}-$(date +%s).checkpoint"
  
  cat << EOF > "$checkpoint_file"
{
  "agent": "$AGENT_NAME",
  "version": "$AGENT_VERSION",
  "phase": $phase,
  "timestamp": "$(date -Iseconds)",
  "task": "$task_description",
  "task_type": "$task_type",
  "task_complexity": "$task_complexity",
  "task_id": "$AGENT_TASK_ID",
  "absolute_base_directory": "$ABSOLUTE_BASE_DIR",
  "working_directory": "$AGENT_WORKING_DIR",
  "current_directory": "$(pwd -P)",
  "documentation": {
    "docs_loaded": $docs_loaded,
    "standards_applied": $standards_applied,
    "lessons_applied": $lessons_applied
  },
  "metrics": {
    "files_created": $files_created,
    "files_modified": $files_modified,
    "files_deleted": $files_deleted,
    "validation_score": $validation_score,
    "lessons_captured": $lessons_captured,
    "patterns_discovered": $patterns_discovered,
    "antipatterns_discovered": $antipatterns_discovered,
    "subagents_invoked": "$subagents_invoked"
  }
}
EOF
  
  if [ "$AGENT_VERBOSE" = "true" ]; then
    echo "  ✓ Checkpoint saved: $(basename "$checkpoint_file")"
  fi
}

# Cleanup function (runs on exit)
cleanup() {
  local exit_code=$?
  
  echo ""
  echo "=== CLEANUP ==="
  
  # Always save lessons, even on failure
  save_lessons
  
  # Clean up temp files (use absolute paths)
  for temp in $temp_files; do
    # Ensure temp path is absolute or make it absolute
    if [[ "$temp" = /* ]]; then
      temp_abs="$temp"
    else
      temp_abs="$AGENT_WORKING_DIR/$temp"
    fi
    [ -f "$temp_abs" ] && rm -f "$temp_abs" && echo "  ✓ Removed temp file: $temp_abs"
  done
  
  # No need to return to original directory - we never left!
  echo "📍 Process remained in constant directory: $(pwd -P)"
  
  # Report execution time
  END_TIME=$(date +%s)
  EXECUTION_TIME=$((END_TIME - START_TIME))
  echo "Total execution time: ${EXECUTION_TIME}s"
  
  # Update central metrics
  echo "Knowledge contribution summary:"
  echo "  📚 Lessons captured: $lessons_captured"
  echo "  ✨ Patterns discovered: $patterns_discovered"
  echo "  ⚠️ Antipatterns discovered: $antipatterns_discovered"
  echo "  📖 Documentation loaded: $docs_loaded"
  echo "  ✅ Standards applied: $standards_applied"
  
  exit $exit_code
}
trap cleanup EXIT

# === THE 10 PHASES BELOW ARE MANDATORY - DO NOT SKIP OR REORDER ===

# === PHASE 1: GIT WORKTREE ISOLATION (NO DIRECTORY CHANGES) ===
current_phase=1
echo ""
echo "=== PHASE 1: GIT WORKTREE ISOLATION (NO DIRECTORY CHANGES) ==="
create_checkpoint $current_phase

# [FILL IN: Determine if this agent modifies files]
MODIFIES_FILES=[FILL IN: true|false]

if [ "$MODIFIES_FILES" = "true" ] && [ "$AGENT_DRY_RUN" = "false" ]; then
  echo "Creating isolated git worktree for safe parallel execution..."
  
  # Store current absolute directory (but NEVER change from it)
  WORKTREE_BASE_DIR="$(pwd -P)"
  echo "📍 Worktree base directory (absolute): $WORKTREE_BASE_DIR"
  echo "📍 CRITICAL: Process will remain in this directory throughout execution"
  
  # Stage any uncommitted changes before creating worktree
  git -C "$WORKTREE_BASE_DIR" add . 2>/dev/null || true
  
  # Generate unique worktree ID with agent name and timestamp
  worktree_id="${AGENT_NAME}-${AGENT_TASK_ID}-$(date +%Y%m%d-%H%M%S)"
  
  # Calculate worktree path as absolute (parent directory of current)
  worktree_relative="../${worktree_id}"
  WORKTREE_ABSOLUTE_DIR="$(realpath "${WORKTREE_BASE_DIR}/${worktree_relative}")"
  echo "📍 Worktree absolute path: $WORKTREE_ABSOLUTE_DIR"
  
  # Handle potential path conflicts
  if [ -d "$WORKTREE_ABSOLUTE_DIR" ]; then
    counter=1
    while [ -d "${WORKTREE_ABSOLUTE_DIR}-${counter}" ]; do
      counter=$((counter + 1))
    done
    WORKTREE_ABSOLUTE_DIR="${WORKTREE_ABSOLUTE_DIR}-${counter}"
  fi
  
  # Create worktree with new branch using absolute path
  branch_name="${AGENT_NAME}/${AGENT_TASK_ID}/$(date +%Y%m%d-%H%M%S)"
  
  if git -C "$WORKTREE_BASE_DIR" worktree add "$WORKTREE_ABSOLUTE_DIR" -b "$branch_name" 2>/dev/null; then
    echo "✓ Created worktree at: $WORKTREE_ABSOLUTE_DIR"
    echo "✓ Branch: $branch_name"
    echo "⚠️ NOTE: Process remains in: $(pwd -P) (NOT changing to worktree)"
    capture_lesson "SUCCESS" "Git worktree created without directory change" "Absolute path: $WORKTREE_ABSOLUTE_DIR"
  else
    echo "ERROR: Failed to create git worktree at: $WORKTREE_ABSOLUTE_DIR"
    capture_lesson "FAILURE" "Git worktree creation failed" "Check for existing worktrees"
    if [ "$AGENT_FAIL_ON_CRITICAL" = "true" ]; then
      exit 1
    fi
  fi
  
  # Apply uncommitted changes to worktree (without changing directory)
  echo "Applying uncommitted changes to worktree..."
  git -C "$WORKTREE_BASE_DIR" diff HEAD --binary | git -C "$WORKTREE_ABSOLUTE_DIR" apply --3way 2>/dev/null || {
    echo "Warning: Some patches may not have applied cleanly"
    capture_lesson "INSIGHT" "Patch application may have conflicts" "Consider stashing instead"
  }
  
  # Initialize submodules in worktree if needed (without changing directory)
  if [ -f "$WORKTREE_ABSOLUTE_DIR/.gitmodules" ]; then
    echo "Initializing submodules in worktree..."
    git -C "$WORKTREE_ABSOLUTE_DIR" submodule update --init --recursive
  fi
  
  # CRITICAL: Store worktree path for all file operations, but DO NOT cd into it
  WORK_DIR="$WORKTREE_ABSOLUTE_DIR"
  echo "✓ Work directory set to: $WORK_DIR (will use with full paths)"
  echo "✓ Current process remains in: $(pwd -P)"
else
  if [ "$MODIFIES_FILES" = "true" ]; then
    echo "Skipping git isolation (dry run mode)"
  else
    echo "Skipping git isolation (read-only agent)"
  fi
  # Set work directory to current location when not using worktree
  WORK_DIR="$AGENT_WORKING_DIR"
fi

# === PHASE 2: REHYDRATE PRIOR CONTEXT (ENHANCED) ===
current_phase=2
echo ""
echo "=== PHASE 2: REHYDRATE PRIOR CONTEXT (WITH PROJECT DOCS) ==="
create_checkpoint $current_phase

echo "Loading prior context and project documentation..."
echo "📍 Current directory: $(pwd -P)"

# MANDATORY: Load project documentation first
load_project_documentation

# Load lessons (central and agent-specific)
load_lessons

loaded_files_count=$docs_loaded
loaded_patterns=""

# Load repository index if exists (using absolute path)
REPO_INDEX_FILE="$AGENT_WORKING_DIR/repo-index.md"
if [ -f "$REPO_INDEX_FILE" ]; then
  echo "Loading repository index from: $REPO_INDEX_FILE"
  if [ "$AGENT_VERBOSE" = "true" ]; then
    cat "$REPO_INDEX_FILE"
  else
    head -20 "$REPO_INDEX_FILE"
  fi
  loaded_files_count=$((loaded_files_count + 1))
fi

# Load epic-specific requirements if specified
if [ -n "$TASK_EPIC" ]; then
  EPIC_DIR="$EPICS_DIR/$TASK_EPIC"
  if [ -d "$EPIC_DIR" ]; then
    echo "Loading epic: $TASK_EPIC"
    
    # Load epic README if exists
    if [ -f "$EPIC_DIR/README.md" ]; then
      echo "  📚 Loading epic overview"
      if [ "$AGENT_VERBOSE" = "true" ]; then
        cat "$EPIC_DIR/README.md"
      fi
      loaded_files_count=$((loaded_files_count + 1))
    fi
    
    # Load requirements
    if [ -d "$EPIC_DIR/requirements" ]; then
      for req in "$EPIC_DIR/requirements"/*.md; do
        if [ -f "$req" ]; then
          echo "  📚 Loading requirement: $(basename "$req")"
          if [ "$AGENT_VERBOSE" = "true" ]; then
            head -20 "$req"
          fi
          loaded_files_count=$((loaded_files_count + 1))
        fi
      done
    fi
    
    # Load user stories
    if [ -d "$EPIC_DIR/stories" ]; then
      for story in "$EPIC_DIR/stories"/*.md; do
        if [ -f "$story" ]; then
          echo "  📚 Loading story: $(basename "$story")"
          loaded_files_count=$((loaded_files_count + 1))
        fi
      done
    fi
  else
    echo "⚠️ Epic not found: $TASK_EPIC"
  fi
fi

# [FILL IN: Add agent-specific files to load based on task type - use absolute paths]
# Example patterns for different agent types:
# For feature-developer: $AGENT_WORKING_DIR/epics/*/requirements/stories/*.md
# For test-writer: $AGENT_WORKING_DIR/tests/**/*.test.js $DOCS_DIR/best-practices/testing.md
# For documenter: $AGENT_WORKING_DIR/README.md $DOCS_DIR/standards/documentation.md

for pattern in \
  [FILL IN: $AGENT_WORKING_DIR/pattern1] \
  [FILL IN: $DOCS_DIR/relevant-doc1] \
  [FILL IN: $EPICS_DIR/*/pattern3]; do
  for file in $pattern; do
    if [ -f "$file" ]; then
      echo "--- Loading: $file ---"
      if [ "$AGENT_VERBOSE" = "true" ]; then
        cat "$file"
      else
        head -20 "$file"
      fi
      loaded_files_count=$((loaded_files_count + 1))
      loaded_patterns="$loaded_patterns $pattern"
    fi
  done
done

echo "✓ Loaded $loaded_files_count total files for context"
echo "✓ Applied $lessons_applied lessons from previous executions"
echo "✓ Loaded $docs_loaded project documentation files"
echo "✓ Identified $standards_applied standards to apply"

# Call subagents for additional context if needed (pass absolute working dir)
# [FILL IN: Add subagent calls for context gathering if applicable]
# Example:
# if [ "$loaded_files_count" -lt 5 ] && [ "$task_complexity" = "complex" ]; then
#   echo "Calling context-analyzer subagent for deeper analysis..."
#   context_result=$(ask subagent context-analyzer \
#     "gather relevant context" \
#     '{"patterns":"'$loaded_patterns'","epic":"'$TASK_EPIC'"}' \
#     '{"working_dir":"'$(pwd -P)'","output_mode":"inline"}')
#   # Process context_result
# fi

# === PHASE 3: REQUIREMENTS CLARIFICATION ===
current_phase=3
echo ""
echo "=== PHASE 3: REQUIREMENTS CLARIFICATION (WITH STANDARDS) ==="
create_checkpoint $current_phase

echo "Clarifying requirements based on task, context, and project standards..."
echo "📍 Operating in: $(pwd -P)"

# Interpret the task description and task config to extract requirements
echo "Task Analysis:"
echo "  Task: $task_description"
echo "  Type: $task_type"
echo "  Complexity: $task_complexity"
echo "  Base Directory: $ABSOLUTE_BASE_DIR"
echo "  Working Directory: $AGENT_WORKING_DIR"
echo "  Related Epic: ${TASK_EPIC:-none}"
echo "  Standards Applied: $standards_applied"

if [ -n "$TASK_FILES" ]; then
  echo "  Files: $TASK_FILES"
fi
if [ -n "$TASK_MODULES" ]; then
  echo "  Modules: $TASK_MODULES"
fi
echo "  Severity: ${TASK_SEVERITY:-medium}"
echo "  Depth: ${TASK_DEPTH:-normal}"

# [FILL IN: Define agent-specific requirements based on task interpretation]
requirements_to_consider="[FILL IN: requirements extracted from task]"
requirements_to_ignore="[FILL IN: what's out of scope for this task]"
corner_cases="[FILL IN: edge cases for this type of task]"
contrarian_cases="[FILL IN: rollback/undo scenarios]"
boundaries="[FILL IN: constraints for this task]"

# Apply project standards to requirements
if [ $standards_applied -gt 0 ]; then
  echo "Applying $standards_applied project standards to requirements..."
  # Standards modify requirements based on project conventions
  # [FILL IN: Logic to apply standards from $STANDARDS_DIR]
fi

# Validate we have sufficient information to proceed
if [ -z "$task_description" ]; then
  echo "ERROR: No task description provided"
  capture_lesson "FAILURE" "Agent invoked without task description" "Invalid invocation"
  exit 1
fi

# Apply lessons to requirements
if [ $lessons_applied -gt 0 ]; then
  echo "Applying $lessons_applied lessons to requirement interpretation..."
  # [FILL IN: Logic to adjust requirements based on lessons]
fi

# Confirm if required for complex tasks
if [ "$task_complexity" = "complex" ] && [ "$AGENT_REQUIRE_CONFIRMATION" = "true" ]; then
  if ! confirm_action "Proceed with complex task: $task_description?" abort; then
    echo "Task cancelled by user"
    exit 4
  fi
fi

echo ""
echo "Requirements clarified:"
echo "  ✓ Must Consider: $requirements_to_consider"
echo "  ✓ Must Ignore: $requirements_to_ignore"
echo "  ✓ Corner Cases: $corner_cases"
echo "  ✓ Contrarian Cases: $contrarian_cases"
echo "  ✓ Boundaries: $boundaries"
echo "  ✓ Standards Applied: $standards_applied standards from docs/standards/"

# === PHASE 4: EXECUTION PLANNING ===
current_phase=4
echo ""
echo "=== PHASE 4: EXECUTION PLANNING (WITH BEST PRACTICES) ==="
create_checkpoint $current_phase

plan_revision=$((plan_revision + 1))
echo "Creating execution plan (Revision $plan_revision)..."
echo "📍 Planning from directory: $(pwd -P)"
echo "📚 Applying best practices from: $BEST_PRACTICES_DIR"

# [FILL IN: Create agent-specific execution plan based on task and configs]
execution_plan="
EXECUTION PLAN - Revision $plan_revision
=========================================
Agent: $AGENT_NAME v$AGENT_VERSION
Task: $task_description
Task Type: $task_type
Complexity: $task_complexity
Absolute Base Directory: $ABSOLUTE_BASE_DIR
Working Directory: $AGENT_WORKING_DIR
Current Directory: $(pwd -P)
Documentation Loaded: $docs_loaded files
Standards Applied: $standards_applied standards
Lessons Applied: $lessons_applied lessons

Task Configuration:
- Files: ${TASK_FILES:-all}
- Modules: ${TASK_MODULES:-all}
- Severity: ${TASK_SEVERITY:-medium}
- Threshold: ${TASK_THRESHOLD:-default}
- Depth: ${TASK_DEPTH:-normal}
- Epic: ${TASK_EPIC:-none}

Agent Configuration:
- Dry Run: $AGENT_DRY_RUN
- Verbose: $AGENT_VERBOSE
- Output Mode: $AGENT_OUTPUT_MODE
- Max Retries: $AGENT_MAX_RETRIES

Standards & Best Practices Applied:
- Coding Standards: $BEST_PRACTICES_DIR/coding-standards.md
- Git Workflow: $BEST_PRACTICES_DIR/git-workflow.md
- Error Handling: $STANDARDS_DIR/error-handling.md
- Logging: $STANDARDS_DIR/logging.md

1. [FILL IN: First major step based on task type]
   - Address: $requirements_to_consider
   - Implementation approach (using absolute paths)
   - Apply standards from: $STANDARDS_DIR
   - Expected outcome
   - Subagent delegation: [FILL IN: which subagent if any]

2. [FILL IN: Second major step]
   - Handle: $corner_cases
   - Integration points (absolute paths)
   - Best practices from: $BEST_PRACTICES_DIR
   - Parallel agents: [FILL IN: agents to run in parallel if any]

3. [FILL IN: Error handling step]
   - Cover: $contrarian_cases
   - Follow: $STANDARDS_DIR/error-handling.md
   - Rollback strategy
   - Recovery approach

4. [FILL IN: Validation step]
   - Tests to run (per $BEST_PRACTICES_DIR/testing.md)
   - Quality checks
   - Success criteria
   - Standards compliance check

5. Documentation:
   - Files to update (absolute paths)
   - Central lessons: $CENTRAL_LESSONS_FILE
   - Agent history: $AGENT_LESSONS_FILE
   - Reports to generate at: $AGENT_REPORTS_DIR
   - Pattern/Antipattern documentation if discovered
"

echo "$execution_plan"

# Define subagent delegation plan if applicable (with absolute paths)
if [ "[FILL IN: true if using subagents]" = "true" ]; then
  subagent_plan="
SUBAGENT DELEGATION PLAN
========================
[FILL IN: Detailed plan of which subagents will be called when]
- Condition 1: Call [agent-name] for [purpose] with working_dir=$(pwd -P)
- Condition 2: Call [agent-name] for [purpose] with working_dir=$AGENT_WORKING_DIR
- Parallel execution: [agent-names] for [purposes] all with absolute paths
- Pass relevant epic context: epic=$TASK_EPIC
"
  echo "$subagent_plan"
fi

# Confirm execution if required
if [ "$AGENT_REQUIRE_CONFIRMATION" = "true" ]; then
  if ! confirm_action "Execute this plan?" continue; then
    echo "Execution cancelled"
    capture_lesson "INSIGHT" "User cancelled execution at planning phase" "Task: $task_description"
    exit 0
  fi
fi

# === PHASE 5: EXECUTE PLAN ===
current_phase=5
echo ""
echo "=== PHASE 5: EXECUTE PLAN (WITH STANDARDS) ==="
create_checkpoint $current_phase

echo "Executing plan for task: $task_description"
echo "📍 Executing in directory: $(pwd -P)"
echo "📚 Following standards from: $STANDARDS_DIR"

if [ "$AGENT_DRY_RUN" = "true" ]; then
  echo "DRY RUN: Would execute the following:"
  echo "$execution_plan"
  echo ""
  echo "No actual changes will be made."
  
  # Simulate metrics for dry run
  files_created=3
  files_modified=5
  files_deleted=0
else
  # [FILL IN: Agent-specific implementation based on task type and config]
  
  echo "Executing $task_type task..."
  echo "  Following coding standards: $BEST_PRACTICES_DIR/coding-standards.md"
  echo "  Using error handling: $STANDARDS_DIR/error-handling.md"
  echo "  Logging per: $STANDARDS_DIR/logging.md"
  
  case "$task_type" in
    analysis)
      echo "Performing analysis task..."
      echo "  Analyzing files: ${TASK_FILES:-all}"
      echo "  Severity threshold: ${TASK_SEVERITY:-medium}"
      echo "  Working in: $(pwd -P)"
      # [FILL IN: Analysis implementation using absolute paths and standards]
      
      # Track temp files for cleanup (store absolute paths)
      temp_file="$(mktemp -p "$AGENT_WORKING_DIR")"
      temp_files="$temp_files $temp_file"
      
      # Example implementation following standards
      # echo "Analysis results" > "$temp_file"
      # files_created=$((files_created + 1))
      ;;
      
    generation)
      echo "Performing generation task..."
      echo "  Target modules: ${TASK_MODULES:-all}"
      echo "  Output directory: $(pwd -P)"
      echo "  Following templates from: $STANDARDS_DIR"
      # [FILL IN: Generation implementation with absolute paths and standards]
      ;;
      
    optimization)
      echo "Performing optimization task..."
      echo "  Threshold: ${TASK_THRESHOLD:-default}"
      # [FILL IN: Optimization implementation following best practices]
      ;;
      
    repair)
      echo "Performing repair task..."
      # [FILL IN: Repair implementation with error handling standards]
      ;;
      
    validation)
      echo "Performing validation task..."
      echo "  Following testing standards: $BEST_PRACTICES_DIR/testing.md"
      # [FILL IN: Validation implementation]
      ;;
      
    documentation)
      echo "Performing documentation task..."
      echo "  Following documentation standards: $BEST_PRACTICES_DIR/documentation.md"
      # [FILL IN: Documentation implementation]
      ;;
      
    *)
      echo "Performing general task..."
      # [FILL IN: General implementation]
      ;;
  esac
  
  # === SUBAGENT DELEGATION (THREE-ARGUMENT PATTERN WITH ABSOLUTE PATHS) ===
  # CRITICAL: Always use the three-argument pattern for subagent calls
  # CRITICAL: Always pass absolute paths in working_dir
  # CRITICAL: Pass epic context when relevant
  
  # [FILL IN: Add your subagent delegations here with absolute paths]
  
  # Example 1: Simple delegation with absolute path and epic context
  # if [ "$needs_security_scan" = "true" ]; then
  #   echo "Delegating security analysis..."
  #   CURRENT_ABS_DIR="$(pwd -P)"
  #   result=$(ask subagent security-analyzer \
  #     "scan for vulnerabilities" \
  #     '{"files":"'$TASK_FILES'","severity":"high","epic":"'$TASK_EPIC'"}' \
  #     '{"working_dir":"'$CURRENT_ABS_DIR'","output_mode":"inline"}')
  #   
  #   if [ $? -eq 0 ]; then
  #     echo "Security scan completed successfully"
  #     vulnerabilities=$(echo "$result" | jq -r '.results.critical // 0')
  #     echo "Found $vulnerabilities critical issues"
  #     
  #     # Check if this matches any antipatterns
  #     if [ $vulnerabilities -gt 0 ]; then
  #       capture_lesson "ANTIPATTERN" "Security vulnerabilities found" "Critical: $vulnerabilities"
  #     fi
  #   else
  #     echo "Security scan failed"
  #     capture_lesson "FAILURE" "Security subagent failed" "Check subagent availability"
  #   fi
  #   subagents_invoked="$subagents_invoked security-analyzer"
  # fi
  
  # Example 2: Complex delegation with standards compliance
  # if [ "$task_complexity" = "complex" ]; then
  #   echo "Delegating deep analysis..."
  #   
  #   # Build task config (what to analyze)
  #   task_config=$(jq -n \
  #     --arg files "$TASK_FILES" \
  #     --argjson threshold "${TASK_THRESHOLD:-100}" \
  #     --arg severity "$TASK_SEVERITY" \
  #     --arg epic "$TASK_EPIC" \
  #     '{
  #       files: $files,
  #       threshold: $threshold,
  #       severity: $severity,
  #       epic: $epic,
  #       patterns: ["security", "performance", "quality"],
  #       depth: "comprehensive"
  #     }')
  #   
  #   # Build agent config with absolute working directory
  #   agent_config=$(jq -n \
  #     --arg wd "$(pwd -P)" \
  #     --arg parent "$AGENT_NAME" \
  #     --arg task "$AGENT_TASK_ID" \
  #     --argjson verbose "$AGENT_VERBOSE" \
  #     '{
  #       working_dir: $wd,
  #       verbose: $verbose,
  #       output_mode: "inline",
  #       parent_agent: $parent,
  #       task_id: $task,
  #       skip_docs: false
  #     }')
  #   
  #   result=$(ask subagent deep-analyzer "perform comprehensive analysis" "$task_config" "$agent_config")
  #   
  #   if [ $? -eq 0 ]; then
  #     issues_found=$(echo "$result" | jq -r '.results.issues_found // 0')
  #     echo "Deep analysis found $issues_found issues"
  #     files_created=$((files_created + $(echo "$result" | jq -r '.files.created // 0')))
  #     
  #     # Capture pattern if successful
  #     if [ $issues_found -eq 0 ]; then
  #       capture_lesson "PATTERN" "Clean code analysis" "No issues in comprehensive scan"
  #     fi
  #   fi
  #   
  #   subagents_invoked="$subagents_invoked deep-analyzer"
  # fi
  
  echo "✓ Execution complete: +$files_created -$files_deleted ~$files_modified"
  
  if [ $files_created -gt 0 ]; then
    capture_lesson "SUCCESS" "Created $files_created files successfully" "Plan revision $plan_revision"
  fi
  
  if [ -n "$subagents_invoked" ]; then
    echo "✓ Subagents invoked: $subagents_invoked"
    capture_lesson "PATTERN" "Successful delegation to subagents" "$subagents_invoked"
  fi
fi

# === PHASE 6: VALIDATE AGAINST REQUIREMENTS ===
current_phase=6
echo ""
echo "=== PHASE 6: VALIDATE AGAINST REQUIREMENTS & STANDARDS ==="
create_checkpoint $current_phase

max_validation_attempts=$AGENT_MAX_RETRIES
validation_passed=false

while [ $validation_attempts -lt $max_validation_attempts ] && [ "$validation_passed" = false ]; do
  validation_attempts=$((validation_attempts + 1))
  echo "Validation attempt $validation_attempts of $max_validation_attempts"
  echo "📍 Validating in directory: $(pwd -P)"
  echo "📚 Checking compliance with: $STANDARDS_DIR"
  
  validation_passed=true
  validation_score=0
  failed_checks=""
  
  # [FILL IN: Agent-specific validation checks using absolute paths]
  
  # Check each requirement was addressed
  for req in $requirements_to_consider; do
    # [FILL IN: Validation logic for requirement]
    # Example:
    # if grep -q "$req" <<< "$execution_plan"; then
    #   validation_score=$((validation_score + 20))
    # else
    #   echo "  ❌ Missing requirement: $req"
    #   failed_checks="$failed_checks missing_req:$req"
    #   validation_passed=false
    # fi
    validation_score=$((validation_score + 20))  # Placeholder
  done
  
  # Check standards compliance
  if [ $standards_applied -gt 0 ]; then
    echo "  Validating standards compliance..."
    # [FILL IN: Standards validation]
    validation_score=$((validation_score + 10))
  fi
  
  # Check corner cases were handled
  if [ -n "$corner_cases" ]; then
    # [FILL IN: Corner case validation]
    validation_score=$((validation_score + 20))
  fi
  
  # Check file operations (use absolute paths for verification)
  if [ "$MODIFIES_FILES" = "true" ] && [ "$AGENT_DRY_RUN" = "false" ]; then
    if [ $files_created -eq 0 ] && [ $files_modified -eq 0 ]; then
      echo "  ⚠️ No files were created or modified"
      failed_checks="$failed_checks no_file_changes"
    else
      validation_score=$((validation_score + 20))
    fi
  else
    validation_score=$((validation_score + 20))
  fi
  
  # Call validator subagent if needed (pass absolute working dir)
  # [FILL IN: Optional validator subagent call]
  # if [ "$validation_passed" = true ] && [ "$task_complexity" = "complex" ]; then
  #   echo "Calling validator subagent for independent verification..."
  #   validator_result=$(ask subagent validator \
  #     "validate task completion and standards compliance" \
  #     '{"task":"'$task_description'","files_created":'$files_created',"standards":'$standards_applied'}' \
  #     '{"working_dir":"'$(pwd -P)'"}"')
  #   
  #   if [ $? -ne 0 ] || [ "$(echo "$validator_result" | jq -r '.status')" != "success" ]; then
  #     validation_passed=false
  #     failed_checks="$failed_checks validator_failed"
  #   fi
  # fi
  
  # Handle validation failure
  if [ "$validation_passed" = false ]; then
    echo "  ❌ Validation failed with issues: $failed_checks"
    capture_lesson "FAILURE" "Validation failed on attempt $validation_attempts" "$failed_checks"
    
    if [ $validation_attempts -lt $max_validation_attempts ]; then
      echo "  🔄 Returning to planning phase for revision..."
      # Return to Phase 4 for re-planning
      current_phase=4
      # The loop will continue and re-execute
    elif [ "$AGENT_FAIL_ON_CRITICAL" = "true" ]; then
      echo "CRITICAL: Validation failed after $max_validation_attempts attempts"
      exit 3
    fi
  else
    echo "  ✅ Validation passed!"
    echo "  ✅ Standards compliance verified!"
    capture_lesson "SUCCESS" "Validation passed on attempt $validation_attempts" "Score: $validation_score"
  fi
done

echo "✓ Validation complete: Score $validation_score%, Attempts: $validation_attempts"

# === PHASE 7: FINAL QUALITY PASS ===
current_phase=7
echo ""
echo "=== PHASE 7: FINAL QUALITY PASS (WITH STANDARDS CHECK) ==="
create_checkpoint $current_phase

echo "Performing final quality review..."
echo "📍 Quality check in directory: $(pwd -P)"
echo "📚 Checking against: $BEST_PRACTICES_DIR"

quality_checks_total=10  # Increased for standards checks
quality_checks_passed=0

# [FILL IN: Agent-specific quality checks using absolute paths]

# Standard quality checks:
echo "Running quality checks..."

# Check 1: All requirements addressed
if [ -n "$requirements_to_consider" ]; then
  echo "  ✓ Requirements addressed"
  quality_checks_passed=$((quality_checks_passed + 1))
else
  echo "  ❌ No requirements defined"
fi

# Check 2: Edge cases handled
if [ -n "$corner_cases" ]; then
  echo "  ✓ Edge cases considered"
  quality_checks_passed=$((quality_checks_passed + 1))
else
  echo "  ⚠️ No edge cases defined"
fi

# Check 3: Validation passed
if [ $validation_score -gt 60 ]; then
  echo "  ✓ Validation score acceptable ($validation_score%)"
  quality_checks_passed=$((quality_checks_passed + 1))
else
  echo "  ❌ Low validation score ($validation_score%)"
fi

# Check 4: Standards compliance
if [ $standards_applied -gt 0 ]; then
  echo "  ✓ Applied $standards_applied project standards"
  quality_checks_passed=$((quality_checks_passed + 1))
else
  echo "  ⚠️ No standards applied"
fi

# Check 5: Best practices followed
if [ $docs_loaded -gt 0 ]; then
  echo "  ✓ Loaded and applied $docs_loaded documentation files"
  quality_checks_passed=$((quality_checks_passed + 1))
else
  echo "  ⚠️ No documentation loaded"
fi

# Check 6: Tests included (if applicable)
# [FILL IN: Test verification logic with absolute paths]
if [ "$task_type" = "generation" ] || [ "$task_type" = "repair" ]; then
  # Check for test files per testing standards
  echo "  ✓ Test requirements checked per $BEST_PRACTICES_DIR/testing.md"
  quality_checks_passed=$((quality_checks_passed + 1))
else
  echo "  - Tests not required for $task_type"
  quality_checks_passed=$((quality_checks_passed + 1))
fi

# Check 7: Documentation updated
if [ -d "$AGENT_REPORTS_DIR" ]; then
  echo "  ✓ Documentation prepared at: $AGENT_REPORTS_DIR"
  quality_checks_passed=$((quality_checks_passed + 1))
fi

# Check 8: Clean up temporary files (use absolute paths)
echo "Cleaning up temporary files..."
cleaned_count=0
for temp in $temp_files; do
  # Ensure temp path is absolute
  if [[ "$temp" = /* ]]; then
    temp_abs="$temp"
  else
    temp_abs="$AGENT_WORKING_DIR/$temp"
  fi
  
  if [ -f "$temp_abs" ]; then
    rm -f "$temp_abs"
    echo "  ✓ Removed: $temp_abs"
    cleaned_count=$((cleaned_count + 1))
  fi
done
if [ $cleaned_count -eq $(echo "$temp_files" | wc -w) ]; then
  echo "  ✓ All temp files cleaned"
  quality_checks_passed=$((quality_checks_passed + 1))
fi

# Check 9: Lessons learned captured
if [ $lessons_captured -gt 0 ]; then
  echo "  ✓ Captured $lessons_captured lessons"
  quality_checks_passed=$((quality_checks_passed + 1))
else
  echo "  ⚠️ No lessons captured"
fi

# Check 10: Patterns/Antipatterns documented
if [ $patterns_discovered -gt 0 ] || [ $antipatterns_discovered -gt 0 ]; then
  echo "  ✓ Discovered $patterns_discovered patterns, $antipatterns_discovered antipatterns"
  quality_checks_passed=$((quality_checks_passed + 1))
else
  echo "  - No new patterns discovered"
fi

echo ""
echo "✓ Quality Score: $quality_checks_passed/$quality_checks_total checks passed"

# === PHASE 8: DOCUMENTATION UPDATE ===
current_phase=8
echo ""
echo "=== PHASE 8: DOCUMENTATION UPDATE (CENTRAL KNOWLEDGE) ==="
create_checkpoint $current_phase

echo "Updating documentation and capturing insights..."
echo "📍 Documentation directories:"
echo "  Central Lessons: $CENTRAL_LESSONS_DIR"
echo "  Agent Reports: $AGENT_REPORTS_DIR"
echo "  Patterns: $PATTERNS_DIR"
echo "  Antipatterns: $ANTIPATTERNS_DIR"

if [ "$AGENT_DRY_RUN" = "false" ]; then
  # Update repository index if it exists (use absolute path)
  REPO_INDEX_FILE="$AGENT_WORKING_DIR/repo-index.md"
  if [ -f "$REPO_INDEX_FILE" ]; then
    echo "| $AGENT_NAME | $(date -Iseconds) | $task_description | +$files_created ~$files_modified -$files_deleted | Rev $plan_revision | Complete |" >> "$REPO_INDEX_FILE"
    echo "✓ Updated repository index at: $REPO_INDEX_FILE"
  fi
  
  # Create detailed execution report (at absolute path)
  report_file="$AGENT_REPORTS_DIR/${AGENT_NAME}-$(date +%Y%m%d-%H%M%S).md"
  
  cat << EOF > "$report_file"
# $AGENT_NAME Execution Report

## Summary
- **Date**: $(date -Iseconds)
- **Agent**: $AGENT_NAME v$AGENT_VERSION
- **Task**: $task_description
- **Task Type**: $task_type
- **Task Complexity**: $task_complexity
- **Epic**: ${TASK_EPIC:-none}
- **Absolute Base Directory**: $ABSOLUTE_BASE_DIR
- **Working Directory**: $AGENT_WORKING_DIR
- **Current Directory**: $(pwd -P)
- **Status**: $([ "$validation_passed" = true ] && echo "✅ SUCCESS" || echo "⚠️ PARTIAL")

## Knowledge Integration
- **Documentation Loaded**: $docs_loaded files
- **Standards Applied**: $standards_applied standards
- **Lessons Applied**: $lessons_applied previous lessons
- **Lessons Captured**: $lessons_captured new lessons
- **Patterns Discovered**: $patterns_discovered
- **Antipatterns Discovered**: $antipatterns_discovered

## Execution Metrics
- **Plan Revision**: $plan_revision
- **Validation Attempts**: $validation_attempts
- **Validation Score**: $validation_score%
- **Quality Score**: $quality_checks_passed/$quality_checks_total
- **Files Created**: $files_created
- **Files Modified**: $files_modified
- **Files Deleted**: $files_deleted
- **Execution Time**: ${EXECUTION_TIME:-pending}s

## Task Configuration
\`\`\`json
$task_config
\`\`\`

## Agent Configuration
\`\`\`json
$agent_config
\`\`\`

## Task Interpretation
- **Original Task**: $task_description
- **Interpreted Type**: $task_type
- **Complexity Level**: $task_complexity
- **Requirements Extracted**: $requirements_to_consider
- **Out of Scope**: $requirements_to_ignore

## Standards & Best Practices Applied
- **Architecture Decisions**: Referenced from $ARCHITECTURE_DIR/decisions/
- **Coding Standards**: Applied from $BEST_PRACTICES_DIR/coding-standards.md
- **Error Handling**: Followed $STANDARDS_DIR/error-handling.md
- **Documentation**: Per $BEST_PRACTICES_DIR/documentation.md

## Path Information
- **Absolute Base**: $ABSOLUTE_BASE_DIR
- **Agent Working Directory**: $AGENT_WORKING_DIR
- **Reports Directory**: $AGENT_REPORTS_DIR
- **Central Lessons**: $CENTRAL_LESSONS_FILE

## Subagents Called
${subagents_invoked:-None}

## Key Decisions
1. Task interpretation: $task_type with $task_complexity complexity
2. Working directory: $AGENT_WORKING_DIR (absolute)
3. Validation score: $validation_score% after $validation_attempts attempts
4. Quality checks: $quality_checks_passed/$quality_checks_total passed
5. Standards compliance: $standards_applied standards applied
6. [FILL IN: Additional agent-specific decisions]

## Lessons Learned This Execution
- **Applied from Previous**: $lessons_applied lessons
- **Captured New**: $lessons_captured lessons
- **Patterns Discovered**: $patterns_discovered
- **Antipatterns Discovered**: $antipatterns_discovered

### New Insights
$(grep "^- " "${CENTRAL_LESSONS_FILE}.tmp" 2>/dev/null | head -5 || echo "No new lessons captured")

## Patterns Discovered
[FILL IN: New patterns identified during execution]

## Next Steps
1. [FILL IN: Recommended follow-up action 1]
2. [FILL IN: Recommended follow-up action 2]
3. [FILL IN: Recommended follow-up action 3]

## References
- Central Lessons: $CENTRAL_LESSONS_FILE
- Agent History: $AGENT_LESSONS_FILE
- Pattern Library: $PATTERNS_DIR
- Antipattern Library: $ANTIPATTERNS_DIR

---
*Generated by $AGENT_NAME v$AGENT_VERSION*
*Following project standards from $DOCS_DIR*
EOF
  
  echo "✓ Report saved: $report_file"
  
  # Capture documentation lesson
  capture_lesson "PATTERN" "Documentation generated successfully" "Report: $report_file"
  
  # Update agent-specific documentation if needed
  AGENT_DOCS_DIR="$DOCS_DIR/agents/$AGENT_NAME"
  if [ ! -f "$AGENT_DOCS_DIR/README.md" ]; then
    cat << EOF > "$AGENT_DOCS_DIR/README.md"
# $AGENT_NAME Agent Documentation

## Overview
- **Version**: $AGENT_VERSION
- **Purpose**: [FILL IN: agent purpose]
- **First Documented**: $(date -Iseconds)

## Capabilities
[FILL IN: what this agent can do]

## Usage
See examples.md for usage examples.

## Troubleshooting
See troubleshooting.md for common issues.

## Performance
- Average execution time: ${EXECUTION_TIME:-pending}s
- Success rate: TBD
- Common task types: $task_type

## See Also
- Agent History: $AGENT_LESSONS_FILE
- Central Lessons: $CENTRAL_LESSONS_FILE
EOF
    echo "✓ Created agent documentation: $AGENT_DOCS_DIR/README.md"
  fi
else
  echo "DRY RUN: Would create documentation in $AGENT_REPORTS_DIR"
  echo "DRY RUN: Would update repository index at $REPO_INDEX_FILE"
  echo "DRY RUN: Would update central lessons at $CENTRAL_LESSONS_FILE"
fi

# === PHASE 9: GIT WORKTREE MERGE (NO DIRECTORY CHANGES) ===
current_phase=9
echo ""
echo "=== PHASE 9: GIT WORKTREE MERGE (NO DIRECTORY CHANGES) ==="
create_checkpoint $current_phase

if [ "$MODIFIES_FILES" = "true" ] && [ "$AGENT_DRY_RUN" = "false" ]; then
  echo "Merging changes back to main branch..."
  echo "📍 Current directory (unchanged): $(pwd -P)"
  echo "📍 Worktree location: $WORKTREE_ABSOLUTE_DIR"
  echo "📍 Base directory: $WORKTREE_BASE_DIR"
  echo "📚 Following: $BEST_PRACTICES_DIR/git-workflow.md"
  echo "⚠️ NOTE: All operations use git -C without changing directory"
  
  # Commit all changes in worktree (using git -C with absolute path)
  git -C "$WORKTREE_ABSOLUTE_DIR" add -A
  
  # Create detailed commit message following standards
  commit_message="feat($AGENT_NAME): Execute task for ${AGENT_TASK_ID}

Task: $task_description
Type: $task_type
Complexity: $task_complexity
Epic: ${TASK_EPIC:-none}
Working Directory: $AGENT_WORKING_DIR
Worktree: $WORKTREE_ABSOLUTE_DIR

Changes:
- Files created: $files_created
- Files modified: $files_modified
- Files deleted: $files_deleted

Metrics:
- Validation score: $validation_score%
- Quality checks: $quality_checks_passed/$quality_checks_total
- Validation attempts: $validation_attempts
- Plan revisions: $plan_revision
- Lessons captured: $lessons_captured
- Patterns discovered: $patterns_discovered
- Standards applied: $standards_applied

Subagents invoked: ${subagents_invoked:-none}

References:
- Central Lessons: docs/lessons/CENTRAL_LESSONS.md
- Standards: docs/standards/
- Best Practices: docs/best-practices/"
  
  if git -C "$WORKTREE_ABSOLUTE_DIR" commit -m "$commit_message"; then
    echo "✓ Changes committed in worktree at: $WORKTREE_ABSOLUTE_DIR"
    capture_lesson "SUCCESS" "Clean commit with standards compliance" "Following git-workflow.md"
  else
    echo "⚠️ No changes to commit"
  fi
  
  # Merge changes with no-ff to preserve history (using git -C on base)
  echo "Merging branch $branch_name into base repository..."
  if git -C "$WORKTREE_BASE_DIR" merge "$branch_name" --no-ff -m "merge: $AGENT_NAME execution for task $AGENT_TASK_ID

Validation score: $validation_score%
Quality score: $quality_checks_passed/$quality_checks_total
Standards compliance: $standards_applied standards"; then
    echo "✓ Changes merged successfully"
    capture_lesson "SUCCESS" "Git merge completed without changing directories" "$branch_name"
  else
    echo "ERROR: Merge conflicts detected"
    echo "Please resolve conflicts manually in base repository: $WORKTREE_BASE_DIR"
    capture_lesson "FAILURE" "Git merge had conflicts" "Manual resolution required"
    if [ "$AGENT_FAIL_ON_CRITICAL" = "true" ]; then
      exit 1
    fi
  fi
  
  # Clean up worktree (using absolute path, without changing directory)
  echo "Cleaning up worktree at: $WORKTREE_ABSOLUTE_DIR"
  git -C "$WORKTREE_BASE_DIR" worktree prune
  if git -C "$WORKTREE_BASE_DIR" worktree remove "$WORKTREE_ABSOLUTE_DIR" --force 2>/dev/null; then
    echo "✓ Worktree removed: $WORKTREE_ABSOLUTE_DIR"
  else
    echo "⚠️ Manual cleanup may be needed: git -C '$WORKTREE_BASE_DIR' worktree remove '$WORKTREE_ABSOLUTE_DIR' --force"
  fi
  
  # Delete branch
  if git -C "$WORKTREE_BASE_DIR" branch -d "$branch_name" 2>/dev/null; then
    echo "✓ Branch deleted: $branch_name"
  else
    echo "⚠️ Branch not deleted (may have unmerged changes)"
  fi
  
  # Update submodules if needed
  if [ -f "$WORKTREE_BASE_DIR/.gitmodules" ]; then
    echo "Updating submodules after merge..."
    git -C "$WORKTREE_BASE_DIR" submodule update --recursive
  fi
  
  echo "📍 Process remained in directory: $(pwd -P) throughout merge"
else
  if [ "$MODIFIES_FILES" = "true" ]; then
    echo "Skipping git merge (dry run mode)"
  else
    echo "Skipping git merge (read-only agent)"
  fi
fi

# === PHASE 10: COMPREHENSIVE RESULT ===
current_phase=10
echo ""
echo "=== PHASE 10: COMPREHENSIVE RESULT (WITH KNOWLEDGE CONTRIBUTION) ==="
create_checkpoint $current_phase

# Calculate final execution time
END_TIME=$(date +%s)
EXECUTION_TIME=$((END_TIME - START_TIME))

# Generate structured output for parent agents (include absolute paths and knowledge metrics)
generate_json_output() {
  jq -n \
    --arg status "$([ "$validation_passed" = true ] && echo "success" || echo "partial")" \
    --arg agent "$AGENT_NAME" \
    --arg version "$AGENT_VERSION" \
    --arg task "$task_description" \
    --arg task_type "$task_type" \
    --arg task_complexity "$task_complexity" \
    --arg task_id "$AGENT_TASK_ID" \
    --arg epic "${TASK_EPIC:-none}" \
    --arg absolute_base_dir "$ABSOLUTE_BASE_DIR" \
    --arg working_dir "$AGENT_WORKING_DIR" \
    --argjson execution_time "$EXECUTION_TIME" \
    --argjson files_created "$files_created" \
    --argjson files_modified "$files_modified" \
    --argjson files_deleted "$files_deleted" \
    --argjson validation_score "$validation_score" \
    --argjson validation_attempts "$validation_attempts" \
    --arg quality_checks "$quality_checks_passed/$quality_checks_total" \
    --argjson lessons_captured "$lessons_captured" \
    --argjson lessons_applied "$lessons_applied" \
    --argjson patterns_discovered "$patterns_discovered" \
    --argjson antipatterns_discovered "$antipatterns_discovered" \
    --argjson docs_loaded "$docs_loaded" \
    --argjson standards_applied "$standards_applied" \
    --arg subagents "$subagents_invoked" \
    --arg report_file "${report_file:-none}" \
    --arg central_lessons "$CENTRAL_LESSONS_FILE" \
    --arg agent_lessons "$AGENT_LESSONS_FILE" \
    '{
      status: $status,
      agent: $agent,
      version: $version,
      task: $task,
      task_type: $task_type,
      task_complexity: $task_complexity,
      task_id: $task_id,
      epic: $epic,
      absolute_base_directory: $absolute_base_dir,
      working_directory: $working_dir,
      execution_time: $execution_time,
      files: {
        created: $files_created,
        modified: $files_modified,
        deleted: $files_deleted
      },
      validation: {
        score: $validation_score,
        attempts: $validation_attempts,
        quality_checks: $quality_checks
      },
      knowledge: {
        docs_loaded: $docs_loaded,
        standards_applied: $standards_applied,
        lessons_applied: $lessons_applied,
        lessons_captured: $lessons_captured,
        patterns_discovered: $patterns_discovered,
        antipatterns_discovered: $antipatterns_discovered,
        central_lessons_file: $central_lessons,
        agent_lessons_file: $agent_lessons
      },
      subagents_invoked: $subagents,
      reports: [$report_file],
      next_steps: [
        "[FILL IN: Next step 1]",
        "[FILL IN: Next step 2]",
        "[FILL IN: Next step 3]"
      ],
      errors: []
    }'
}

# Generate human-readable result
generate_readable_result() {
  cat << EOF

╔════════════════════════════════════════════════════════════╗
║                 AGENT EXECUTION COMPLETE                     ║
║                    Agent: $AGENT_NAME                       ║
║                    Version: $AGENT_VERSION                  ║
╚════════════════════════════════════════════════════════════╝

## EXECUTION SUMMARY
- **Status**: $([ "$validation_passed" = true ] && echo "✅ SUCCESS" || echo "⚠️ PARTIAL")
- **Task**: $task_description
- **Task Type**: $task_type
- **Task Complexity**: $task_complexity
- **Epic**: ${TASK_EPIC:-none}
- **Absolute Base Directory**: $ABSOLUTE_BASE_DIR
- **Working Directory**: $AGENT_WORKING_DIR
- **Current Directory**: $(pwd -P)
- **Execution Time**: ${EXECUTION_TIME}s
- **Mode**: $([ "$AGENT_DRY_RUN" = "true" ] && echo "DRY RUN" || echo "NORMAL")

## KNOWLEDGE INTEGRATION
- **Documentation Loaded**: $docs_loaded files
- **Standards Applied**: $standards_applied standards
- **Best Practices Followed**: Yes
- **Lessons Applied**: $lessons_applied from previous executions
- **Lessons Captured**: $lessons_captured new insights
- **Patterns Discovered**: $patterns_discovered
- **Antipatterns Discovered**: $antipatterns_discovered

## TASK CONFIGURATION
- **Files**: ${TASK_FILES:-none}
- **Modules**: ${TASK_MODULES:-none}
- **Severity**: ${TASK_SEVERITY:-default}
- **Threshold**: ${TASK_THRESHOLD:-default}
- **Depth**: ${TASK_DEPTH:-normal}
- **Epic**: ${TASK_EPIC:-none}

## AGENT CONFIGURATION
- **Output Mode**: $AGENT_OUTPUT_MODE
- **Verbose**: $AGENT_VERBOSE
- **Parent Agent**: $AGENT_PARENT
- **Task ID**: $AGENT_TASK_ID
- **Priority**: $AGENT_PRIORITY

## FILES CHANGED
$([ "$AGENT_DRY_RUN" = "true" ] && echo "(Simulated - no actual changes)")
- **Created**: $files_created
- **Modified**: $files_modified
- **Deleted**: $files_deleted

## VALIDATION RESULTS
- **Score**: $validation_score%
- **Attempts**: $validation_attempts
- **Quality**: $quality_checks_passed/$quality_checks_total
- **Standards Compliance**: ✅

## CENTRAL KNOWLEDGE CONTRIBUTION
- **Applied from Repository**: $lessons_applied lessons
- **Contributed This Run**: $lessons_captured lessons
- **Central Repository**: $CENTRAL_LESSONS_FILE
- **Agent History**: $AGENT_LESSONS_FILE
- **Pattern Library**: $PATTERNS_DIR ($patterns_discovered new)
- **Antipattern Library**: $ANTIPATTERNS_DIR ($antipatterns_discovered new)

## SUBAGENTS INVOKED
${subagents_invoked:-None}

## KEY INSIGHTS
$(tail -n 5 "${CENTRAL_LESSONS_FILE}.tmp" 2>/dev/null | grep "^- " || echo "- No new insights this run")

## NEXT STEPS
[FILL IN: Specific recommendations based on task completion]
1. Review generated report: ${report_file:-N/A}
2. Check central lessons for new patterns: $CENTRAL_LESSONS_FILE
3. Apply discovered patterns to future tasks
4. Review any new antipatterns to avoid: $ANTIPATTERNS_DIR

## PROJECT DOCUMENTATION (ABSOLUTE PATHS)
- **Central Lessons**: $CENTRAL_LESSONS_FILE
- **Architecture Decisions**: $ARCHITECTURE_DIR/decisions/
- **Best Practices**: $BEST_PRACTICES_DIR/
- **Standards**: $STANDARDS_DIR/
- **Agent Reports**: $AGENT_REPORTS_DIR/
- **Agent Documentation**: $DOCS_DIR/agents/$AGENT_NAME/

## STRUCTURED OUTPUT (JSON)
\`\`\`json
$(generate_json_output)
\`\`\`

╔════════════════════════════════════════════════════════════╗
║    Thank you for using $AGENT_NAME!                         ║
║    Your contribution has been added to the knowledge base.  ║
╚════════════════════════════════════════════════════════════╝
EOF
}

# Output based on mode
case $AGENT_OUTPUT_MODE in
  inline)
    generate_readable_result
    ;;
  file)
    output_file="$AGENT_REPORTS_DIR/${AGENT_NAME}-final-$(date +%Y%m%d-%H%M%S).md"
    generate_readable_result > "$output_file"
    echo "✓ Final report saved to: $output_file"
    
    # Output JSON for parent agent parsing
    generate_json_output
    ;;
  both)
    generate_readable_result
    
    output_file="$AGENT_REPORTS_DIR/${AGENT_NAME}-final-$(date +%Y%m%d-%H%M%S).md"
    generate_readable_result > "$output_file"
    echo "✓ Final report also saved to: $output_file"
    ;;
  json)
    # JSON only mode for automation
    generate_json_output
    ;;
  *)
    generate_readable_result
    ;;
esac

# Final lesson
if [ "$validation_passed" = true ]; then
  capture_lesson "SUCCESS" "Task completed successfully" "$task_description in ${EXECUTION_TIME}s at $AGENT_WORKING_DIR"
else
  capture_lesson "PARTIAL" "Task partially completed" "Some validation checks failed"
fi

# Save all lessons before exit (cleanup will also save, but this ensures it happens)
save_lessons

# Exit with appropriate code
if [ "$validation_passed" = true ]; then
  exit 0
elif [ "$AGENT_DRY_RUN" = "true" ]; then
  exit 0
else
  exit 2  # Partial success
fi
```

---

## Critical Implementation Checklist (v5.1 - Centralized Knowledge Edition)

**BEFORE IMPLEMENTING ANY AGENT, VERIFY:**

### ✅ Centralized Knowledge Management
- [ ] **Documentation Structure**
  - [ ] docs/lessons/ directory exists
  - [ ] docs/architecture/decisions/ for ADRs
  - [ ] docs/design/ for design decisions
  - [ ] docs/best-practices/ for standards
  - [ ] docs/standards/ for project standards
  - [ ] docs/agents/ for agent-specific docs

- [ ] **Central Lessons Repository**
  - [ ] CENTRAL_LESSONS.md in docs/lessons/
  - [ ] patterns/ subdirectory for successful patterns
  - [ ] antipatterns/ subdirectory for things to avoid
  - [ ] by-agent/ subdirectory for agent histories

- [ ] **Git Submodules**
  - [ ] Check .gitmodules status
  - [ ] Initialize submodules in worktrees
  - [ ] Update submodules after merge

### ✅ Documentation Loading in Rehydration
- [ ] **Load Architecture Decisions**
  - [ ] Read all ADRs from docs/architecture/decisions/
  - [ ] Apply architectural constraints

- [ ] **Load Best Practices**
  - [ ] Read coding standards
  - [ ] Read git workflow
  - [ ] Read testing standards
  - [ ] Read documentation standards

- [ ] **Load Project Standards**
  - [ ] Error handling patterns
  - [ ] Logging standards
  - [ ] API contracts
  - [ ] Performance standards

- [ ] **Load Epic Context**
  - [ ] Check for TASK_EPIC parameter
  - [ ] Load epic requirements
  - [ ] Load user stories
  - [ ] Apply epic-specific constraints

### ✅ Knowledge Contribution
- [ ] **Capture Lessons**
  - [ ] Write to central repository
  - [ ] Update agent-specific history
  - [ ] Create pattern documentation
  - [ ] Create antipattern documentation

- [ ] **Update Metrics**
  - [ ] Track lessons applied
  - [ ] Track patterns discovered
  - [ ] Track antipatterns found
  - [ ] Update central metrics

### ✅ Absolute Path Requirements (Retained)
- [ ] **Path Capture at Start**
  - [ ] Capture `ABSOLUTE_BASE_DIR=$(pwd -P)` immediately
  - [ ] Resolve `AGENT_WORKING_DIR` to absolute path
  - [ ] Store original directory as absolute
  - [ ] Set DOCS_DIR and other central paths

- [ ] **Git Operations**
  - [ ] Always use `git -C "$ABSOLUTE_PATH"` syntax
  - [ ] Never assume current directory for git commands
  - [ ] Calculate worktree paths as absolute
  - [ ] Store worktree location in absolute variable

- [ ] **File Operations**
  - [ ] Use absolute paths for all file I/O
  - [ ] Store temp file paths as absolute
  - [ ] Create directories with absolute paths
  - [ ] Verify files at absolute locations

- [ ] **Subagent Communication**
  - [ ] Pass `working_dir` as absolute path in agent_config
  - [ ] Pass `epic` context when available
  - [ ] Use `$(pwd -P)` when passing current directory
  - [ ] Document absolute path usage in examples

### ✅ Core Requirements (All Previous + Enhanced)
- [ ] **Three-Argument Pattern**
  - [ ] Task description (required)
  - [ ] Task config JSON → TASK_* variables (includes epic)
  - [ ] Agent config JSON → AGENT_* variables (includes skip_docs)
  - [ ] Clear separation of concerns

- [ ] **Mermaid Diagram Complete**
  - [ ] Shows absolute path capture step
  - [ ] Shows documentation loading phase
  - [ ] Shows central lessons integration
  - [ ] Shows all 10 phases clearly
  - [ ] Includes git submodule check
  - [ ] Shows standards application points

[... continue with all previous checklist items, enhanced for centralized knowledge ...]

---

## Key Success Factors (Centralized Knowledge Edition)

1. **Central Knowledge First**: Always check and contribute to docs/lessons/
2. **Standards Compliance**: Load and apply all project standards
3. **Architecture Awareness**: Read and follow ADRs
4. **Best Practices Application**: Use documented best practices
5. **Epic Context Integration**: Load epic requirements when specified
6. **Pattern Documentation**: Create reusable pattern documentation
7. **Antipattern Avoidance**: Document and share what doesn't work
8. **Cross-Agent Learning**: Learn from other agents' experiences
9. **Documentation Discipline**: Keep all docs up to date
10. **Git Submodule Management**: Handle external dependencies properly
11. **Absolute Path Discipline**: No ambiguity about locations
12. **Comprehensive Reporting**: Include knowledge metrics in reports

---

## Remember: Knowledge Sharing is MANDATORY

**Every agent MUST contribute to and learn from the centralized knowledge base.**

The framework ensures:
- Project-wide learning and improvement
- Consistent application of standards and best practices
- Architecture decision compliance
- Pattern reuse across agents
- Antipattern avoidance
- Comprehensive documentation
- Git submodule support
- All previous benefits (absolute paths, parallelism, etc.)

**USE THIS CENTRALIZED KNOWLEDGE FRAMEWORK IN EVERY AGENT DEFINITION**
