# billwave

The primary tool for managing your Billwave billing configuration from the terminal. Use it to synchronize your local catalog, validate your configuration, and manage your billing infrastructure.

## Installation

Install the CLI globally:

```bash
npm install -g billwave
```

Or use it directly with npx:

```bash
npx @digvijay-x1/billwave-cli --help
```

## Commands

### `init`

Initialize a new Billwave project with a default configuration file (`billwave.config.ts` or `billwave.config.js`). JavaScript configs use ESM `import`/`export` syntax.

```bash
npx @digvijay-x1/billwave-cli init
```

### `sync`

Push your local catalog configuration to the Billwave cloud.

```bash
npx @digvijay-x1/billwave-cli sync
```

### `pull`

Pull existing plans and features from the cloud into your local configuration.

```bash
npx @digvijay-x1/billwave-cli pull
```

### `diff`

Preview changes by comparing your local configuration with the cloud.

```bash
npx @digvijay-x1/billwave-cli diff
```

### `validate`

Check your local configuration for errors without applying changes.

```bash
npx @digvijay-x1/billwave-cli validate
```

### `connect`

Authenticate and connect your local environment to an organization.

```bash
npx @digvijay-x1/billwave-cli connect
```

## Features

- **Declarative Catalog**: Manage your billing structure as code.
- **Idempotent Sync**: Safely push changes without duplicating resources.
- **Validation**: Catch configuration errors before they hit production.
- **Cloud Synchronization**: Keep your local and cloud environments in sync.

## Documentation

For full command references and guides, visit [docs.billwave.example/cli](https://docs.billwave.example/cli).

## License

Apache-2.0
