import { envsafe, str, bool } from "envsafe";

export const env = envsafe({
  AWS_ACCESS_KEY_ID: str(),
  AWS_SECRET_ACCESS_KEY: str(),
  AWS_S3_BUCKET: str(),
  AWS_S3_REGION: str(),
  DATABASE_URL: str({
    desc: 'The connection string of the database to restore to.'
  }),
  RESTORE_CRON_SCHEDULE: str({
    desc: 'The cron schedule to run the restore on.',
    default: '0 3 * * *',
    allowEmpty: true
  }),
  AWS_S3_ENDPOINT: str({
    desc: 'The S3 custom endpoint you want to use.',
    default: '',
    allowEmpty: true,
  }),
  AWS_S3_FORCE_PATH_STYLE: bool({
    desc: 'Use path style for the endpoint instead of the default subdomain style, useful for MinIO',
    default: false,
    allowEmpty: true
  }),
  RUN_RESTORE_ON_STARTUP: bool({
    desc: 'Run a restore on startup of this application',
    default: false,
    allowEmpty: true,
  }),
  BACKUP_FILE_PREFIX: str({
    desc: 'Prefix to the file name',
    default: 'backup',
  }),
  BUCKET_SUBFOLDER: str({
    desc: 'A subfolder to place the backup files in',
    default: '',
    allowEmpty: true
  }),
  SINGLE_SHOT_RESTORE_MODE: bool({
    desc: 'Run a single restore on start and exit when completed',
    default: true,
    allowEmpty: true,
  }),
  // This is both time consuming and resource intensive so we leave it disabled by default
  SUPPORT_OBJECT_LOCK: bool({
    desc: 'Enables support for buckets with object lock by providing an MD5 hash with the backup file',
    default: false
  }),
  RESTORE_OPTIONS: str({
    desc: 'Any valid pg_restore option.',
    default: '',
    allowEmpty: true,
  }),
})
