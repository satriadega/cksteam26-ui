#!/bin/sh
# Exit on fail
set -e

# This script is designed to be the entrypoint for the Docker container.
# It takes the config.template.js file, replaces the placeholder
# with the actual environment variable, and saves it as config.js.

# Define the path to the template and the output file
TEMPLATE_FILE="/usr/share/nginx/html/config.template.js"
OUTPUT_FILE="/usr/share/nginx/html/config.js"

# Check if the VITE_API_URL environment variable is set.
# If not, use a default value.
: "${VITE_API_URL:=http://localhost:8084}"

# Use sed to replace the placeholder with the value of the environment variable.
# The 'g' flag ensures that all occurrences are replaced.
sed "s|__VITE_API_URL__|${VITE_API_URL}|g" "$TEMPLATE_FILE" > "$OUTPUT_FILE"

echo "Configuration file generated successfully."
echo "API URL is set to: ${VITE_API_URL}"

# Start Nginx in the foreground
exec nginx -g 'daemon off;'
