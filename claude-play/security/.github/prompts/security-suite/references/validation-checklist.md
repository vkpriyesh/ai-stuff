# Validation checklist

Before finishing:

- Check YAML structure and indentation.
- Check workflow names do not collide with existing names.
- Check triggers do not duplicate existing security jobs unnecessarily.
- Check `permissions` are present and minimal.
- Check action versions are pinned consistently with the repo style.
- Check SARIF upload targets the correct file.
- Check any required tokens or secrets are documented, not hardcoded.
- Check the workflows make sense for the repository language and build system.
- Check new files are mentioned in the final summary.
