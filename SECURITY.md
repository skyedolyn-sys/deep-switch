# Security Policy

## Supported Versions

Deep Switch is currently shipping **v0.1.x**. Security fixes will be backported to
the latest minor release in the `0.1.x` series. Earlier minors and the `0.0.x`
pre-releases are **not** maintained.

| Version | Status            | Security fixes |
|---------|-------------------|----------------|
| 0.1.x   | Supported (latest) | Yes            |
| 0.0.x   | End of life        | No             |

## Reporting a Vulnerability

**Please open a private security advisory at https://github.com/skyedolyn-sys/deep-switch/security/advisories/new before disclosing publicly.**

GitHub's private advisory channel is preferred — it keeps the report visible only to maintainers until disclosure. If you cannot use GitHub advisories, open a regular issue marked `@security` and we will convert it to a private advisory on receipt.

When reporting, please include:

- A clear description of the issue and its impact
- Steps to reproduce, or a proof-of-concept
- The commit hash or release tag where you observed it
- Any known workarounds

We aim to send an **initial response within 72 hours** of receiving a report.
After that we will coordinate timeline, scope, and disclosure format with you.

## Threat Model

Deep Switch is a small, single-purpose Electron application. The threat model
below describes exactly what it does, what it touches, and what stays untouched.

### What the app does

- **Reads and writes `~/.deepcode/settings.json`** under the current user's home
  directory. This is the file consumed by the Deep Code CLI. Access is mediated
  by Electron's main process — the renderer never touches the filesystem
  directly.
- **Stores provider records** (display name, base URL, model ID, API key,
  thinking/effort toggles) in `~/.deep-switch/config.json` as plain JSON on the
  current user's machine. See the security caveat in the next section.
- **Calls the provider's `/v1/models` endpoint** with the API key only when the
  user clicks "Fetch models" or activates a provider. This is the only outbound
  network call the app makes. The user can also trigger a one-shot connection
  test which sends a minimal `ping` chat request against the configured model.
- **Persists UI preferences** (`preferredLanguage`, last selected provider) in
  the same `~/.deep-switch/config.json` file.

### What the app does NOT do

- **No telemetry.** No analytics SDKs, no usage beacons, no crash reporters.
- **No automatic uploads.** The app never opens an outgoing connection on its
  own; it only responds to explicit user actions.
- **No remote logging.** Errors are written to the local stderr / `console`
  only and never forwarded.
- **No credentials sent to third parties.** The only endpoint an API key is
  ever sent to is the provider base URL the user has configured for the
  matching provider. There is no analytics CDN, no error-reporting endpoint,
  no auto-update check that includes credentials.
- **No remote dependency loading.** No runtime fetches of JavaScript or
  stylesheets from third-party origins.

## Security Caveat for v0.1 (Important)

In the v0.1.x line, **`~/.deep-switch/config.json` is stored as plain JSON,
NOT encrypted at rest.** API keys sit alongside your other user files with the
standard permissions of your home directory.

This means:

- Anyone with read access to your user account on the machine can read the
  file.
- Backups, sync tools, or filesystem snapshots (Time Machine, cloud drive
  sync, etc.) will capture the keys as part of any other file in `~`.

**What we are shipping to fix this in v0.2:** OS-level encryption of the API
key field via Electron's `safeStorage` API. The key material will be wrapped
under a platform-protected key (Keychain on macOS, DPAPI on Windows, Secret
Service / libsecret on Linux). Non-secret fields (name, base URL, model)
will continue to live in the JSON file as before. v0.2 also introduces a
configurable config-path override so the encrypted file does not have to live
under `~/.deep-switch/` if you prefer a different location.

Until v0.2:

- Restrict access to your home directory to the level you are comfortable with.
- If you stop using a provider, delete its record (the App's delete button
  removes the entire record, including the API key).
- Don't share machines or sync `~/.deep-switch/` to cloud storage you don't
  trust with your other credentials.

## What is Out of Scope

The following are **not** vulnerabilities in Deep Switch and should be reported
to the relevant maintainers instead:

- Vulnerabilities in the **Deep Code CLI** itself (it is a separate project;
  the `settings.json` schema, command-line behaviour, etc. are theirs to fix).
- Vulnerabilities in **upstream provider APIs** (DeepSeek, OpenAI, Anthropic,
  Moonshot, etc.) — contact each provider through their security disclosure
  process.
- Vulnerabilities in **Electron**, **Node.js**, or **Chromium** that Deep
  Switch benefits from automatically when those projects ship a fix.

## Disclosure Timeline

- **90 days** is our default coordinated-disclosure window. Critical
  issues may move faster; less impactful issues may move slower if a fix is
  in flight.
- We follow **coordinated disclosure**: we will not publicly disclose a
  report until a fix is available, or 90 days have elapsed, whichever comes
  first — unless you request otherwise in writing.
- We may credit reporters in release notes (and in the Credits section below)
  unless you ask to remain anonymous.

## Credits

Thank you to the security community. We will list reporters who consent to
attribution here as advisories are resolved.

- _None yet — be the first._

## Contact

- Email: `security@deepswitch.app` (placeholder; see "Reporting a Vulnerability"
  above)
- Repository issues: **do not** file vulnerability reports through public
  GitHub issues.
