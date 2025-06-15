#!/bin/bash

# Migration script to update imports from old to new SDK

echo "🚀 Starting migration to new Google GenAI SDK..."

# Update wizard-shell.tsx to use new actions
echo "Updating wizard-shell.tsx..."
sed -i.bak "s|import { runAiStage } from '@/app/actions/aiActions';|import { runAiStage } from '@/app/actions/aiActions-new';|g" src/components/wizard/wizard-shell.tsx

# Update any other files that import from aiActions
echo "Updating other imports..."
find src -name "*.tsx" -o -name "*.ts" | xargs grep -l "from '@/app/actions/aiActions'" | while read file; do
  echo "Updating $file..."
  sed -i.bak "s|from '@/app/actions/aiActions'|from '@/app/actions/aiActions-new'|g" "$file"
done

# Clean up backup files
find src -name "*.bak" -delete

echo "✅ Migration complete!"
echo "Next steps:"
echo "1. Test all workflows"
echo "2. Remove old Genkit files"
echo "3. Update package.json"