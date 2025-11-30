#!/bin/bash

echo "Setting up PM2 log rotation..."
echo ""

# Install PM2 log rotate module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true
pm2 set pm2-logrotate:dateFormat YYYY-MM-DD_HH-mm-ss
pm2 set pm2-logrotate:rotateModule true

echo ""
echo "PM2 log rotation configured:"
echo "- Max file size: 10MB"
echo "- Retain: 7 files"
echo "- Compress: Yes"
echo "- Rotate interval: when size exceeds limit"
echo ""
echo "Done!"
