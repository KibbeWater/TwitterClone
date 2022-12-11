# Twatter

## Required Setup

### Create .env.local file / add environment variables
```
S3_REGION=eu-central-1
S3_BUCKET=my-bucket

S3_ACCESS_KEY_ID=your-key-id
S3_SECRET_ACCESS_KEY=your-secret-key

MONGO_URI=mongo-uri

SALT_ROUNDS=10
```

### Create S3 bucket
* Enable public read access
* Create folder `images` in bucket
* Create folder `avatars` in bucket
* Create folder `banners` in bucket

## TODO
* Optimize and migrate to SSCs
* Fix search
* Possibly more emoji support (LOW PRIORITY)
* Fix issue where images/retwaats are not shown in /post routes