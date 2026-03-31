# Team Communication

Named agents with message-passing in Claude Code's swarm system.

---

## How Teams Work

Teams are groups of named agents that can communicate via `SendMessage`:

```
Agent({ name: "frontend", team_name: "feature-team", prompt: "..." })
Agent({ name: "backend", team_name: "feature-team", prompt: "..." })
Agent({ name: "tester", team_name: "feature-team", prompt: "..." })
```

### Communication
```
// Direct message
SendMessage({ to: "backend", message: "The API endpoint should return { users: [] }" })

// Broadcast to all
SendMessage({ to: "*", message: "I've completed the frontend changes" })
```

### Key Properties
- Teammates are **flat** (cannot spawn sub-teammates)
- Each teammate has an **independent AbortController** (survives parent interruption)
- Context isolation via **AsyncLocalStorage** (no state leaks)
- Team roster is shared (every teammate knows who else is on the team)

---

## Teammate System Prompt Addendum

Every teammate receives this additional instruction:
```
# Agent Teammate Communication

IMPORTANT: You are running as an agent in a team. To communicate:
- Use SendMessage with to: "<name>" for specific teammates
- Use SendMessage with to: "*" for team-wide broadcasts

Just writing text is NOT visible to others - you MUST use SendMessage.

The user interacts primarily with the team lead. Your work is coordinated
through the task system and teammate messaging.
```

---

## Example: Full-Stack Feature Team

```
Lead Agent (coordinator):
  "We need to add a user profile page. I'm assembling a team."
  
  Agent({
    name: "backend-dev",
    team_name: "profile-feature",
    prompt: "Create a GET /api/users/:id endpoint that returns user profile data.
             When done, message @frontend-dev with the response schema."
  })
  
  Agent({
    name: "frontend-dev",
    team_name: "profile-feature",
    prompt: "Wait for @backend-dev to provide the API schema.
             Then build a React component at src/pages/Profile.tsx.
             When done, message @tester."
  })
  
  Agent({
    name: "tester",
    team_name: "profile-feature",
    prompt: "Wait for @frontend-dev to finish.
             Write integration tests for the profile page.
             Test both API and UI."
  })
```

### Message Flow
```
backend-dev: SendMessage(to: "frontend-dev", message: "API returns { id, name, email, avatar }")
frontend-dev: SendMessage(to: "tester", message: "Profile component is done at src/pages/Profile.tsx")
tester: SendMessage(to: "*", message: "All 5 tests passing. Feature complete.")
```

---

## When to Use Teams vs Coordinator

| Aspect | Teams | Coordinator |
|--------|-------|-------------|
| Communication | Peer-to-peer messaging | Hub-and-spoke (all through coordinator) |
| Autonomy | High (teammates make own decisions) | Low (coordinator directs everything) |
| Overhead | Lower (no synthesis step) | Higher (coordinator must process all results) |
| Best for | Well-defined, independent roles | Complex tasks requiring synthesis |
| Failure handling | Teammates can self-recover | Coordinator redirects on failure |
