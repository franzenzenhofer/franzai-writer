#!/bin/bash

echo "🧪 Testing Google Search Grounding with curl..."
echo "================================================"

# First, create a new document to get a document ID
echo "📋 Step 1: Creating a new document..."
RESPONSE=$(curl -s "http://localhost:9002/w/gemini-test/new")

# Extract document ID from the redirect response
DOCUMENT_ID=$(echo "$RESPONSE" | grep -o 'data-next-error-digest="NEXT_REDIRECT;replace;/w/gemini-test/[^;]*' | sed 's/.*\/w\/gemini-test\///' | sed 's/;.*//')

if [ -z "$DOCUMENT_ID" ]; then
    echo "❌ Failed to extract document ID from response"
    echo "Response preview:"
    echo "$RESPONSE" | head -10
    exit 1
fi

echo "✅ Document created with ID: $DOCUMENT_ID"
echo ""

# Now test the Google Search grounding
echo "📋 Step 2: Testing Google Search grounding..."
echo "Document ID: $DOCUMENT_ID"
echo "Endpoint: http://localhost:9002/w/gemini-test/$DOCUMENT_ID"
echo ""

# Create the test payload
PAYLOAD='{
  "stageId": "grounding-google-search",
  "input": {
    "promptTemplate": "What happened yesterday in Austria? Use Google Search to find current news and provide real citations.",
    "model": "googleai/gemini-2.0-flash",
    "temperature": 0.7,
    "forceGoogleSearchGrounding": true,
    "systemInstructions": "You have Google Search grounding enabled. Use it to find current, up-to-date information. Provide real search results with proper citations.",
    "fileInputs": [],
    "groundingSettings": {
      "googleSearch": {
        "enabled": true
      }
    }
  }
}'

echo "🚀 Sending request..."
echo "Payload:"
echo "$PAYLOAD" | jq '.' 2>/dev/null || echo "$PAYLOAD"
echo ""

# Make the API call
RESULT=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD" \
  "http://localhost:9002/w/gemini-test/$DOCUMENT_ID")

echo "✅ Response received!"
echo ""

# Check if we got a valid JSON response
if echo "$RESULT" | jq . >/dev/null 2>&1; then
    echo "📄 Response is valid JSON"
    
    # Extract key information
    CONTENT_LENGTH=$(echo "$RESULT" | jq -r '.content // empty' | wc -c)
    HAS_GROUNDING_METADATA=$(echo "$RESULT" | jq -r '.groundingMetadata != null')
    HAS_GROUNDING_SOURCES=$(echo "$RESULT" | jq -r '.groundingSources != null and (.groundingSources | length) > 0')
    
    echo "📊 Analysis:"
    echo "  - Content length: $CONTENT_LENGTH characters"
    echo "  - Has grounding metadata: $HAS_GROUNDING_METADATA"
    echo "  - Has grounding sources: $HAS_GROUNDING_SOURCES"
    echo ""
    
    # Show grounding metadata if present
    if [ "$HAS_GROUNDING_METADATA" = "true" ]; then
        echo "🎯 GROUNDING METADATA:"
        echo "$RESULT" | jq '.groundingMetadata'
        echo ""
    fi
    
    # Show grounding sources if present
    if [ "$HAS_GROUNDING_SOURCES" = "true" ]; then
        echo "📚 GROUNDING SOURCES:"
        echo "$RESULT" | jq '.groundingSources'
        echo ""
    fi
    
    # Show content preview
    echo "📝 CONTENT PREVIEW:"
    echo "-------------------"
    echo "$RESULT" | jq -r '.content // "No content"' | head -20
    echo "-------------------"
    echo ""
    
    # Final assessment
    if [ "$HAS_GROUNDING_METADATA" = "true" ] || [ "$HAS_GROUNDING_SOURCES" = "true" ]; then
        echo "🎉 SUCCESS: Google Search grounding is working!"
    else
        echo "⚠️  WARNING: No grounding detected in response"
        echo "💡 This might mean:"
        echo "   - Google Search grounding is not properly configured"
        echo "   - The model didn't need to search for this query"
        echo "   - There was an issue with the grounding service"
    fi
    
else
    echo "❌ Response is not valid JSON"
    echo "Raw response:"
    echo "$RESULT" | head -20
fi

echo ""
echo "�� Test completed!" 