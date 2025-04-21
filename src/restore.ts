import { S3Client, S3ClientConfig, ListObjectsV2Command, GetObjectCommand, _Object, ListObjectsV2CommandOutput } from "@aws-sdk/client-s3";
import { createWriteStream, unlink } from "fs";
import { exec } from "child_process";
import path from "path";
import os from "os";
import { env } from "./env.js";

const downloadFromS3 = async (path: string) => {
  console.log("Downloading backup from S3...");
  const bucket = env.AWS_S3_BUCKET;

  const clientOptions: S3ClientConfig = {
    region: env.AWS_S3_REGION,
    forcePathStyle: env.AWS_S3_FORCE_PATH_STYLE,
  };

  if (env.AWS_S3_ENDPOINT) {
    console.log(`Using custom endpoint: ${env.AWS_S3_ENDPOINT}`);
    clientOptions.endpoint = env.AWS_S3_ENDPOINT;
  }

  const client = new S3Client(clientOptions);

  // List objects to find the most recent backup
  let prefix = env.BUCKET_SUBFOLDER ? `${env.BUCKET_SUBFOLDER}/` : '';
  prefix += env.BACKUP_FILE_PREFIX;

  console.log(`Listing objects with prefix: ${prefix}`);
  let allContents: _Object[] = [];
  let continuationToken: string | undefined = undefined;

  do {
    const listCommand = new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: prefix,
      ContinuationToken: continuationToken,
    });

    const listResponse: ListObjectsV2CommandOutput = await client.send(listCommand);
    
    if (listResponse.Contents) {
      allContents = allContents.concat(listResponse.Contents);
    }
    
    continuationToken = listResponse.NextContinuationToken;

  } while (continuationToken); // Continue if NextContinuationToken exists

  console.log(`Found ${allContents.length} backup files matching prefix.`);

  if (allContents.length === 0) {
    throw new Error(`No backup files found with prefix ${prefix}`);
  }

  // Sort by LastModified to get the most recent
  const sortedContents = allContents.sort((a, b) => {
    return (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0);
  });

  const mostRecentBackup = sortedContents[0];
  console.log(`Found most recent backup: ${mostRecentBackup.Key}`);

  // Download the file
  const getCommand = new GetObjectCommand({
    Bucket: bucket,
    Key: mostRecentBackup.Key,
  });

  const response = await client.send(getCommand);
  
  // Write the file to disk
  const fileStream = createWriteStream(path);
  
  // Use the AWS SDK's built-in functionality to handle the response body
  if (response.Body) {
    await new Promise((resolve, reject) => {
      fileStream.on('error', reject);
      fileStream.on('finish', resolve);
      
      // @ts-ignore - The AWS SDK types are not fully compatible with Node.js streams
      response.Body.pipe(fileStream);
    });
  } else {
    throw new Error("Failed to get backup file from S3");
  }

  console.log(`Backup downloaded to ${path}`);
};

const restoreFromFile = async (filePath: string) => {
  console.log("Restoring DB from file...");

  // Create a temporary file for the decompressed archive
  const decompressedPath = filePath.replace('.gz', '');
  
  // Decompress the file directly (gunzip will replace the .gz file with the decompressed version)
  await new Promise((resolve, reject) => {
    exec(`gunzip -f ${filePath}`, (error, stderr) => {
      if (error) {
        reject({ error: error, stderr: stderr.trimEnd() });
        return;
      }
      resolve(undefined);
    });
  });

  const restoreOptions = env.RESTORE_OPTIONS || '';

  // Restore the database
  await new Promise((resolve, reject) => {
    exec(`pg_restore -d ${env.DATABASE_URL} ${restoreOptions} ${decompressedPath}`, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error, stderr: stderr.trimEnd() });
        return;
      }
      resolve(undefined);
    });
  });

  // Clean up the temporary files
  await new Promise((resolve, reject) => {
    unlink(decompressedPath, (err) => {
      if (err) {
        console.error(`Error deleting ${decompressedPath}:`, err);
      }
      resolve(undefined);
    });
  });

  console.log("DB restored successfully");
};

export const restore = async () => {
  console.log("Initiating DB restore...");

  const filename = `restore-${Date.now()}.tar.gz`;
  const filepath = path.join(os.tmpdir(), filename);

  await downloadFromS3(filepath);
  await restoreFromFile(filepath);

  console.log("DB restore complete...");
};
