# SVGO Action Events

This file contains the documentation for all GitHub Actions events that the SVGO
Action supports.

- [`on: pull_request`](#on-pull_request)
- [`on: push`](#on-push)
- [`on: schedule`](#on-schedule)

Please [open an issue] if you found a mistake or if you have suggestions for how
to improve the documentation.

---

## `on: pull_request`

In the `pull_request` context, the SVGO Action will optimize all SVGs that have
been added or modified in a Pull Request. This means that an Action run covers
all commits that are part of the Pull Request, not individual commits in a Pull
Request.

The Action will not change SVGs that are not part of the Pull Request, SVGs that
are already optimized or [SVGs that are ignored].

### Configuration

The following [options] have an effect in the `pull_request` context.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `comment`              | :heavy_check_mark: |
| `commit`               | :heavy_check_mark: |
| `conventional-commits` | :heavy_check_mark: |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |

---

## `on: push`

In the `push` context, the SVGO Action will optimize all SVGs that have been
added or modified in the commit(s) being pushed. This means that if multiple
commits are pushed at once, the Action run will cover all the added and modified
SVGs in all the commits being pushed.

The Action will not change SVGs that are not part of any of the commits, SVGs
that are already optimized or [SVGs that are ignored].

### Configuration

The following [options] have an effect in the `push` context.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `comment`              | :heavy_check_mark: |
| `commit`               | :heavy_check_mark: |
| `conventional-commits` | :heavy_check_mark: |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |

---

## `on: schedule`

In the `schedule` context, the SVGO Action will optimize all SVGs in the
repositories default branch at the scheduled time.

The Action will not change SVGs that are already optimized or [SVGs that are
ignored].

### Configuration

The following [options] have an effect in the `schedule` context.

| Name                   | Supported          |
| ---------------------- | ------------------ |
| `comment`              | :x:                |
| `commit`               | :heavy_check_mark: |
| `conventional-commits` | :heavy_check_mark: |
| `dry-run`              | :heavy_check_mark: |
| `ignore`               | :heavy_check_mark: |
| `svgo-options`         | :heavy_check_mark: |

[open an issue]: https://github.com/ericcornelissen/svgo-action/issues/new?labels=docs&template=documentation.md
[options]: ./options.md
[SVGs that are ignored]: ./options.md#ignore