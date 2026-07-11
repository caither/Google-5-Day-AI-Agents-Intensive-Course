---
title: "Getting Started with Google Antigravity"
source: "https://codelabs.developers.google.com/getting-started-google-antigravity?authuser=0#8"
author:
published:
created: 2026-07-11
description: "This codelab guides you through the process of installing and experiencing the features of Google Antigravity, a platform to work with agents that can perform both coding and non-coding tasks."
tags:
  - "clippings"
---

## Skills

While Antigravity's underlying models are powerful generalists, they don't know your specific project context or team standards. Loading every single rule or tool into the agent's context window leads to tool bloat, higher costs, latency, and confusion.

Skills solve this through progressive disclosure. A **skill** is a specialized package of knowledge that sits dormant until needed. It is only loaded into the agent's context when your specific request matches the skill's description.

## Structure and Scope

Skills are directory-based packages. You can define them in two scopes depending on your needs:

- Global Scope (`~/.gemini/config/skills/`): Available across all Antigravity products (Antigravity, Antigravity IDE, Antigravity CLI) and projects.
- Project/Workspace Scope (`<project-root>/.agents/skills/`): This would make the skill available only within a specific project.

## The Anatomy of a Skill

A typical skill directory looks like this:

```
my-skill/
├── SKILL.md    #(Required) metadata & instructions.
├── scripts/    # (Optional) Python or Bash scripts for execution.
├── references/ # (Optional) text, documentation, or templates.
└── assets/     # (Optional) Images or logos.
```

Let's add some skills now.

## Code Review Skill

This is an instruction-only skill i.e. we only need to create the `SKILL.md` file, that will contain the metadata and the skills instructions. Let's create a skill that provides details to the agent to review code changes for bugs, style issues and best practices.

Assuming that you are in a specific project folder (e.g. `$HOME/agy2-projects/my-skills-project)` the first step is to create a directory in the project folder that will contain the skill.

```
mkdir -p .agents/skills/code-review
```

Create a `SKILL.md` file in the project folder e.g. `.agents/skills/code-review` that we just created, with the content shown below:

```
---
name: code-review
description: Reviews code changes for bugs, style issues, and best practices. Use when reviewing PRs or checking code quality.
---

# Code Review Skill

When reviewing code, follow these steps:

## Review checklist

1. **Correctness**: Does the code do what it's supposed to?
2. **Edge cases**: Are error conditions handled?
3. **Style**: Does it follow project conventions?
4. **Performance**: Are there obvious inefficiencies?

## How to provide feedback

- Be specific about what needs to change
- Explain why, not just what
- Suggest alternatives when possible
```

Notice that the `SKILL.md` file above contains the metadata (name and description) at the top and then the instructions. When the agent loads, it will only read the metadata of the skills and it will only load the full skills instructions, only when needed.

Let us validate the **Code Review skill**. Open up a conversation in Antigravity in a specific project of your choice and provide the following prompt.

![732820afe6db3ce0.png](https://codelabs.developers.google.com/static/getting-started-google-antigravity/img/732820afe6db3ce0_2880.png?authuser=0)

It should show the **code-review** skill.

### Try it out

Create a new file named `demo_bad_code.py` in the `$HOME/agy2-projects/my-skills-project` with the contents shown below:

```
import time

def get_user_data(users, id):
   # Find user by ID
   for u in users:
       if u['id'] == id:
            return u
   return None

def process_payments(items):
   total = 0
   for i in items:
       # Calculate tax
       tax = i['price'] * 0.1
       total = total + i['price'] + tax
       time.sleep(0.1) # Simulate slow network call

   return total

def run_batch():
   users = [{'id': 1, 'name': 'Alice'}, {'id': 2, 'name': 'Bob'}]
   items = [{'price': 10}, {'price': 20}, {'price': 100}]

   u = get_user_data(users, 3)
   print("User found: " + u['name']) # Will crash if None

   print("Total: " + str(process_payments(items)))

if __name__ == "__main__":
   run_batch()
```

Open a new conversation in a specific project in Antigravity and give the following prompt: `review the @demo_bad_code.py file`.

The Agent should identify the `code-review` skill, load the details and then perform the action as per the instructions given in the `code-review/SKILL.md` file.

A sample output is shown below:

![a6e2b1b775feda28.png](https://codelabs.developers.google.com/static/getting-started-google-antigravity/img/a6e2b1b775feda28_2880.png?authuser=0)

## 10\. Conclusion

Congratulations! You have now successfully installed Antigravity, configured your environment, and learned how to control your agents.

## Earn your Kaggle 5-Day AI Agents badge

Completed this lab as part of Kaggle's **5-Day AI Agents: Intensive Vibe Coding Course with Google**? Claim your completion badge: Get the [5-Day AI Agents badge](https://developers.google.com/profile/badges/events/cloud/five-day-ai-agents/award?authuser=0).

**What's Next?** To see Antigravity in action building real-world applications, you can look at the following codelab:

- [Build and Deploy to Google Cloud with Antigravity](https://codelabs.developers.google.com/build-and-deploy-gcp-with-antigravity?authuser=0): This codelab shows how to design, build, and deploy a serverless application to Google Cloud.

## Reference docs

- Official Site: [https://antigravity.google/](https://antigravity.google/?authuser=0)
- Documentation: [https://antigravity.google/docs/home](https://antigravity.google/docs/home?authuser=0)
- Use cases: [https://antigravity.google/use-cases](https://antigravity.google/use-cases?authuser=0)
- Download: [https://antigravity.google/download](https://antigravity.google/download?authuser=0)
- Youtube Channel for Google Antigravity: [https://www.youtube.com/@googleantigravity](https://www.youtube.com/@googleantigravity?authuser=0)