# Contributing to jobhunt

Thank you for your interest in contributing to `jobhunt`! This project aims to provide a powerful, multi-platform job-hunting skill for AI agents.

## Cross-Agent Testing Initiative
Currently, `jobhunt` is battle-tested on **Claude Code**. However, as AI coding agents proliferate, we want to ensure this skill works flawlessly across various platforms!

**We desperately need testers and maintainers for:**
- Cursor
- Gemini CLI
- Antigravity
- Windsurf
- Any other agent supporting standard Markdown/YAML skills!

If you successfully run this skill on a different agent, please open a PR updating the documentation or open an issue detailing what needs to be fixed.

## How to Contribute
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Upstream Changes
`jobhunt` vendors a fork of `career-ops`. If you are fixing a bug in the core scraping or PDF generation logic, please consider whether the change should be upstreamed to the original [career-ops](https://github.com/santifer/career-ops) project. Personalization features, locale defaults, and AI integration stay here.

We appreciate all forms of contributions—whether it's code, documentation, bug reports, or simply verifying functionality on a new AI agent platform. Let's make `jobhunt` the ultimate open-source application engine!
