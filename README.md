# Postgres S3 Restore

A simple NodeJS application to restore your PostgreSQL database from S3 backups via a cron.

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/I4zGrH)

## Configuration

- `AWS_ACCESS_KEY_ID` - AWS access key ID.

- `AWS_SECRET_ACCESS_KEY` - AWS secret access key, sometimes also called an application key.

- `AWS_S3_BUCKET` - The name of the bucket that the access key ID and secret access key are authorized to access.

- `AWS_S3_REGION` - The name of the region your bucket is located in, set to `auto` if unknown.

- `DATABASE_URL` - The connection string of the database to restore to.

- `RESTORE_CRON_SCHEDULE` - The cron schedule to run the restore on. Example: `0 3 * * *`

- `AWS_S3_ENDPOINT` - The S3 custom endpoint you want to use. Applicable for 3-rd party S3 services such as Cloudflare R2 or Backblaze R2.

- `AWS_S3_FORCE_PATH_STYLE` - Use path style for the endpoint instead of the default subdomain style, useful for MinIO. Default `false`

- `RUN_RESTORE_ON_STARTUP` - Run a restore on startup of this application then proceed with making restores on the set schedule.

- `BACKUP_FILE_PREFIX` - The prefix of the backup files to look for in S3.

- `BUCKET_SUBFOLDER` - The subfolder where backup files are stored in the S3 bucket.

- `SINGLE_SHOT_RESTORE_MODE` - Run a single restore on start and exit when completed. Useful with the platform's native CRON scheduler.

- `SUPPORT_OBJECT_LOCK` - Enables support for buckets with object lock by providing an MD5 hash with the backup file.

- `RESTORE_OPTIONS` - Add any valid pg_restore option, supported pg_restore options can be found [here](https://www.postgresql.org/docs/current/app-pgrestore.html). Example: `--clean --if-exists`
