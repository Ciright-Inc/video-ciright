#!/usr/bin/env bash
# Apply CORS rules from scripts/s3-cors.json to your S3 bucket.
# Requires AWS CLI configured with access to the bucket.
set -euo pipefail

BUCKET="${AWS_S3_BUCKET:-video-ciright}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

aws s3api put-bucket-cors \
  --bucket "$BUCKET" \
  --cors-configuration "file://${SCRIPT_DIR}/s3-cors.json"

echo "CORS applied to bucket: $BUCKET"
