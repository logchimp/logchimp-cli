# Contributing

Hi! Thanks for your interest in contributing to the LogChimp CLI!

We accept pull requests for bug fixes and features. We'd also love to hear about ideas for new features as issues.

Please do:

* Check existing issues to verify that the bug or feature request has not already been submitted.
* Open an issue if things aren't working as expected.
* Open an issue to propose a significant change.
* Open a pull request to fix a bug.
* Open a pull request to fix documentation about a command.

## Building the project

Prerequisites:

* Node.js v10.x
* Yarn _(latest version)_

Steps:

1. Fork this repository
2. `git clone https://github.com/<username>/logchimp-cli`
3. `cd logchimp-cli`
4. `yarn install`

Run CLI for testing:

5. `yarn link`
6. `logchimp <command> [flags]` _(can run anywhere on the system)_
