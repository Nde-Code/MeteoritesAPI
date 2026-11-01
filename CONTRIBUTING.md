# Contributing

Thank you for your interest in contributing to MeteoritesAPI. Contributions are welcome, whether they involve improving existing functionality, fixing bugs, or introducing new features.

Before submitting a contribution, please take the time to read the following guidelines.

## Understanding the project

MeteoritesAPI is a relatively small personal project built around NASA's Meteorite Landings dataset. Its codebase is intentionally kept simple, without unnecessary architectural complexity or excessive documentation.

The technical documentation is available in [`docs/documentation.md`](docs/documentation.md). It covers the development environment, configuration, and deployment process.

However, documentation alone is not enough to understand the project. Before making any changes, you are expected to explore the repository and familiarize yourself with its implementation.

In particular:

- Read the existing source code and understand its structure.
- Familiarize yourself with how the different modules and utilities interact.
- Pay attention to existing naming conventions, formatting, coding patterns, and architectural choices.
- Understand how existing functionality works before attempting to modify or extend it.
- Take the time to understand the dataset structure and how it is processed.

The existing codebase should be your main reference when working on the project.

The goal is not to introduce new conventions or restructure the project unnecessarily, but to produce code that fits naturally into the existing implementation.

## Code contributions

All submitted code must follow the conventions and patterns already used throughout the project.

Please make sure that:

- Your code follows the existing naming and formatting conventions.
- New functionality is implemented consistently with the existing architecture.
- Changes remain focused and avoid unnecessary complexity.
- Existing functionality is not broken by unrelated modifications.
- TypeScript types are properly defined and used.

Avoid introducing additional dependencies, abstractions, or architectural changes unless they are genuinely necessary.

The project uses TypeScript for type checking and Prettier for code formatting. There is no need to introduce additional tools or configuration without a clear reason.

### Comments

Please avoid adding unnecessary comments.

Code should be understandable through its structure, naming, and implementation rather than relying on comments to explain what it does.

Comments should only be added when a particular implementation detail or decision genuinely requires clarification.

## Available commands

The project uses npm scripts to provide the following commands:

| Command                  | Description                                         |
| ------------------------ | --------------------------------------------------- |
| `npm run dev`            | Start the local development server using Wrangler.  |
| `npm run deploy`         | Deploy the Worker.                                  |
| `npm run types`          | Generate Cloudflare Workers TypeScript definitions. |
| `npm run login`          | Authenticate with Cloudflare through Wrangler.      |
| `npm run check-types`    | Check TypeScript types without generating output.   |
| `npm run format`         | Format project files using Prettier.                |
| `npm run prettier-check` | Check formatting without modifying files.           |

## Commit messages

This project follows the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) specification.

Please use this convention for all commit messages to keep the project history consistent and readable.

## Continuous integration

Every submitted pull request is automatically checked through the project's GitHub Actions workflows.

The pipeline includes the following checks:

- **type-check:** Uses TypeScript (`tsc --noEmit`) to verify that the code is correctly typed and does not contain TypeScript errors.
- **format-check:** Uses Prettier to verify that the submitted code follows the project's formatting rules.
- **Integration tests:** Runs the dedicated integration test suite against the proposed changes.
- **Dataset validation:** The `dataset-diff-check` job compares the repository's meteorite CSV dataset with the corresponding dataset currently available from NASA.

These checks are automatically triggered on every pull request. There is no separate `dev` branch requirement.

Automated checks are an important part of the review process. Contributions must not introduce unexplained failures or bypass existing validation mechanisms.

## Integration testing

In addition to the automated checks, MeteoritesAPI uses a dedicated integration test suite: [https://gist.github.com/Nde-Code/70a3f7744207177b0f2e065dfbcbfe0f](https://gist.github.com/Nde-Code/70a3f7744207177b0f2e065dfbcbfe0f).

The script tests the actual behavior of a deployed Worker, including its endpoints, response payloads, parameter validation, boundary conditions, and rate limiting.

Contributors are expected to read and understand this script and run it against their own revision before submitting a pull request.

Use your own deployed instance for testing rather than relying on the public API instance.

The integration test suite is also automatically executed by GitHub Actions on every pull request. This means that the proposed changes are tested without requiring a separate development branch.

If your changes only affect existing functionality already covered by the test suite, simply indicate in your pull request that the integration tests have been executed successfully.

If you introduce new functionality or modify behavior that is not covered by the existing tests, you must also provide precise instructions for updating the integration test script.

These instructions must include:

- The exact code to add or modify.
- The exact location where the changes should be made.
- The necessary test cases and expected results.
- Code formatted consistently with the existing script.

The instructions must be detailed enough to allow the test suite to be updated without requiring additional explanations or guesswork.

The script is maintained separately from the repository to keep the project lightweight. Its external location does not make it any less important to the testing process.

## Dataset contributions

MeteoritesAPI aims to keep its meteorite dataset up to date with the data published by NASA.

However, the update frequency and publication schedule of the original NASA dataset are not something I can reliably determine. The project therefore does not assume a fixed update schedule.

The source CSV file is located in the [`data/`](data/) directory and is used to generate the JSON datasets consumed by the API.

**If you notice missing records, incorrect information, or have suggestions for additions to the dataset, please open a GitHub Issue rather than submitting a pull request directly.**

This is particularly important because the project includes a dedicated `dataset-diff-check` job that runs automatically on every pull request.

The check compares the repository's local CSV dataset against the version currently available from NASA. Any differences can cause the job to fail.

Consequently, directly modifying the CSV file or adding records without coordinating the update beforehand can break the existing validation pipeline.

Opening an issue first gives me time to investigate the proposed changes, verify the source data, and determine how to update the dataset and its validation process without breaking the existing CI pipeline.

Please provide as much information as possible when suggesting a dataset change, including the affected records, relevant sources, and reasons for the proposed modification.

Dataset changes will be reviewed and coordinated separately before being integrated into the repository.

## Pull requests

Every pull request must include a clear and sufficiently detailed description of the proposed changes.

Please explain:

- **What:** What has been implemented or modified.
- **Why:** Why the change is necessary and what problem it addresses.
- **How:** How the implementation works and what approach was chosen.
- **Constraints:** Any relevant limitations, technical constraints, or design decisions.

The description should demonstrate that you understand the implementation and the reasons behind your choices.

Before submitting your pull request, please make sure that:

- You have taken the time to understand the existing codebase.
- Your changes follow the project's existing conventions.
- TypeScript checks pass successfully.
- Prettier formatting checks pass successfully.
- The integration test suite has been executed against your revision.
- Any new functionality not covered by the integration tests is properly documented with precise instructions for updating the test script.
- You have not modified the meteorite CSV dataset without prior coordination.
- Your pull request clearly explains the purpose and implementation of your changes.

Pull requests containing unexplained changes, unnecessary complexity, or code that does not follow the project's conventions may be rejected.

## AI-assisted contributions

The use of AI tools is absolutely welcome.

However, **you must fully understand every line of code you submit, from beginning to end.**

Using AI to generate, modify, or review code does not remove your responsibility for understanding its behavior, implementation, and potential consequences.

You must be able to explain your changes, justify your technical decisions, and take responsibility for the submitted code.

Code that you cannot properly explain or maintain is not an acceptable contribution, regardless of how it was produced.

## Final notes

MeteoritesAPI is intentionally kept relatively lightweight. Maintaining its simplicity, consistency, reliability, and dataset integrity is more important than introducing unnecessary features or complexity.

Take the time to understand the project before contributing, and make sure your changes fit naturally into the existing codebase.

Thank you for taking the time to help improve MeteoritesAPI.
