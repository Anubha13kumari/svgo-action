# SVGO Action

[![GitHub Marketplace][marketplace-image]][marketplace-url]
[![Build status][ci-image]][ci-url]
[![Coverage Report][coverage-image]][coverage-url]
[![Maintainability][maintainability-image]][maintainability-url]
[![LGTM Alerts][lgtm-image]][lgtm-url]
[![Snyk Status][snyk-image]][snyk-url]
[![FOSSA Status][fossa-image]][fossa-url]

Automatically run [SVGO] with GitHub Actions.

## Usage

### Install the Action

Create a Workflow file (e.g.: `.github/workflows/svgo.yml`, see [Creating a
Workflow file]) with the following content to utilize the SVGO Action. You can
check [what the Action does for each `on` event](/docs/events.md). The SVGO
Action also [outputs some values](/docs/outputs.md) for subsequent steps.

```yaml
name: SVGOptimizer
on:
# Disable the following line if you don't want the Action to run on PRs.
  pull_request:
# Enable the following line if you want the Action to run on regular pushes.
#  push:
# Enable the following lines if you want the Action to run on a schedule.
#  schedule:
#  - cron:  '0 * * * 1'  # See https://crontab.guru/
# Enable one of the following lines if you want to manually trigger the Action.
#  repository_dispatch:
#  workflow_dispatch:

jobs:
  triage:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    # Enable the following to select a branch for scheduled or triggered runs.
    # with:
    #   path: main
    - uses: ericcornelissen/svgo-action@next
```

_Note: This grants access to the `GITHUB_TOKEN` so the Action can make calls to
GitHub's rest API_

> :warning: This Action does not work for Pull Requests from forks. This is
> because GitHub Actions do not have permission to alter forked repositories.

### Configure the Action

There are a couple of ways for you to configure the Action. You can configure it
[in the Workflow file], [in `.github/svgo-action.yml`], or [in another
configuration file]. The table below shows the options that can be configured.

| Name                   | Description                             | Default            | Documentation                                 |
| ---------------------- | --------------------------------------- | ------------------ | --------------------------------------------- |
| `dry-run`              | Prevent the Action from writing changes | `false`            | [docs](/docs/options.md#dry-run)              |
| `ignore`               | A [glob] of SVGs that should be ignored | `""`               | [docs](/docs/options.md#ignore)               |
| `svgo-options`         | Specify the [SVGO] configuration file   | `"svgo.config.js"` | [docs](/docs/options.md#svgo-options)         |
| `svgo-version`         | The (major) version of [SVGO] to use    | `2`                | [docs](/docs/options.md#svgo-version)         |

#### In the Workflow file

The first way to configure the Action is inside the Workflow file. For example:

```yaml
with:
  dry-run: true
  ignore: do/not/optimize/**/*.svg
  svgo-options: path/to/svgo-options.js
  svgo-version: 2
```

#### In `.github/svgo-action.yml`

If you prefer to separate the Action configuration from the Workflow file you
can add a file called `svgo-action.yml` inside the `.github` directory. Then,
you can configure the Action inside this file. For example:

```yaml
dry-run: true
ignore: do/not/optimize/**/*.svg
svgo-options: path/to/svgo-options.js
svgo-version: 2
```

#### In Another Configuration File

Lastly, if you prefer to use a different file from `.github/svgo-action.yml`,
it is possible to specify a `configuration-path` in the Workflow file. This
value should point to the configuration file you want to use. For example:

> :warning: The configuration file must always be a valid YAML file.

```yaml
with:
  configuration-path: path/to/configuration/file.yml
```

### Advanced Usage

#### Limit Runs

Even though this Action won't do anything if a push or Pull Request does not
touch any SVG files, you may want the Action to run only when an SVG was
actually changed. To do this you can change the Workflow file that uses this
Action to be triggered only when SVG files change.

> :warning: This will cause **any** Action specified in the Workflow file to be
> run only when an SVG changes. If there are Actions that should run for every
> push or Pull Request they must be specified in a separate Workflow file.

To run this Action only when SVG files are changed, update the `on:`
configuration as follows:

```yaml
name: SVGOptimizer
on:
  pull_request:
    paths:
    - "**.svg"
  push:
    paths:
    - "**.svg"
```

[marketplace-url]: https://github.com/marketplace/actions/svgo-action?version=v1.2.2
[marketplace-image]: https://img.shields.io/badge/Marketplace-v1.2.2-undefined.svg?logo=github&logoColor=white&style=flat
[ci-url]: https://github.com/ericcornelissen/svgo-action/actions?query=workflow%3A%22Code+Validation%22+branch%3Adevelop
[ci-image]: https://img.shields.io/github/workflow/status/ericcornelissen/svgo-action/Code%20Validation/develop?logo=github
[coverage-url]: https://codecov.io/gh/ericcornelissen/svgo-action
[coverage-image]: https://codecov.io/gh/ericcornelissen/svgo-action/branch/develop/graph/badge.svg
[maintainability-url]: https://codeclimate.com/github/ericcornelissen/svgo-action/maintainability
[maintainability-image]: https://api.codeclimate.com/v1/badges/4b1085a28f00ec5f9225/maintainability
[lgtm-image]: https://img.shields.io/lgtm/alerts/g/ericcornelissen/svgo-action.svg?logo=lgtm&logoWidth=18
[lgtm-url]: https://lgtm.com/projects/g/ericcornelissen/svgo-action/alerts/
[snyk-image]: https://snyk.io/test/github/ericcornelissen/svgo-action/badge.svg?targetFile=package.json
[snyk-url]: https://snyk.io/test/github/ericcornelissen/svgo-action?targetFile=package.json
[fossa-image]: https://app.fossa.com/api/projects/git%2Bgithub.com%2Fericcornelissen%2Fsvgo-action.svg?type=shield
[fossa-url]: https://app.fossa.com/projects/git%2Bgithub.com%2Fericcornelissen%2Fsvgo-action?ref=badge_shield

[glob]: https://en.wikipedia.org/wiki/Glob_(programming)
[in the workflow file]: #in-the-workflow-file
[in `.github/svgo-action.yml`]: #in-githubsvgo-actionyml
[in another configuration file]: #in-another-configuration-file
[svgo]: https://github.com/svg/svgo
