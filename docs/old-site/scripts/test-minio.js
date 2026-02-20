const Minio = require('minio');
require('dotenv').config();

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || '',
  secretKey: process.env.MINIO_SECRET_KEY || '',
});

const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'gwth-feedback';

async function testMinio() {
  try {
    console.log('Testing Minio connection...');
    console.log('Endpoint:', process.env.MINIO_ENDPOINT);
    console.log('Port:', process.env.MINIO_PORT);
    console.log('Bucket:', BUCKET_NAME);
    
    // Check if bucket exists
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    
    if (!exists) {
      console.log(`Bucket '${BUCKET_NAME}' does not exist. Creating...`);
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      
      // Set bucket policy to allow public read access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Sid: 'PublicRead',
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log(`Bucket '${BUCKET_NAME}' created successfully with public read policy!`);
    } else {
      console.log(`Bucket '${BUCKET_NAME}' already exists.`);
    }
    
    // List all buckets
    const buckets = await minioClient.listBuckets();
    console.log('\nAvailable buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (created: ${bucket.creationDate})`);
    });
    
    console.log('\n✅ Minio connection successful!');
    console.log(`You can access the Minio console at: http://localhost:9001`);
    console.log(`Login with: minioadmin / minioadmin`);
    
  } catch (error) {
    console.error('❌ Error connecting to Minio:', error);
    process.exit(1);
  }
}

testMinio();