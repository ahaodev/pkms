#!/bin/bash
set -e
cd "$(dirname "$0")/../frontend"
npm ci
npm run build