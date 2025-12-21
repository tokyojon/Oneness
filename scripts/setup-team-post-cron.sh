#!/bin/bash

# Team Post Generator Cron Setup Script
# This script sets up a cron job to run the team post generator every 6 hours

PROJECT_DIR="/var/www/oneness"
SCRIPT_PATH="$PROJECT_DIR/scripts/generate-team-post.js"
LOG_FILE="$PROJECT_DIR/logs/team-post-generator.log"

# Create logs directory if it doesn't exist
mkdir -p "$PROJECT_DIR/logs"

# Create a temporary cron file
TEMP_CRON=$(mktemp)

# Export existing crontab
crontab -l > "$TEMP_CRON" 2>/dev/null || echo "" > "$TEMP_CRON"

# Check if our cron job already exists
if grep -q "generate-team-post.js" "$TEMP_CRON"; then
    echo "⚠️  Team post generator cron job already exists!"
    echo "Current cron jobs:"
    grep "generate-team-post.js" "$TEMP_CRON"
    exit 0
fi

# Add the new cron job (runs every 6 hours)
echo "# Oneness Kingdom Team Post Generator - Runs every 6 hours" >> "$TEMP_CRON"
echo "0 */6 * * * cd $PROJECT_DIR && /usr/bin/node $SCRIPT_PATH >> $LOG_FILE 2>&1" >> "$TEMP_CRON"

# Install the new crontab
crontab "$TEMP_CRON"

# Clean up
rm "$TEMP_CRON"

echo "✅ Team post generator cron job installed!"
echo "📅 Schedule: Every 6 hours (at minute 0 of every 6th hour)"
echo "📝 Log file: $LOG_FILE"
echo ""
echo "To view current cron jobs: crontab -l"
echo "To remove this cron job: crontab -e (and delete the line)"
echo ""
echo "Next run will be at: $(date -d 'next 6 hours' '+%Y-%m-%d %H:%M:%S')"
