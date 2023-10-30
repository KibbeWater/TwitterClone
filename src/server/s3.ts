import { S3 } from "@aws-sdk/client-s3";
import { env } from "~/env.mjs";

export const s3Client = new S3({
    credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    },
    region: env.AWS_S3_REGION,
});
