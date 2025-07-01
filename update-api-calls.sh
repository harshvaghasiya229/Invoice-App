#!/bin/bash

# Script to update API calls in React components
# This script will replace direct axios imports with the new API utility

echo "🔄 Updating API calls in React components..."

# List of files to update
FILES=(
  "client/src/components/Dashboard.js"
  "client/src/components/InvoiceList.js"
  "client/src/components/InvoiceForm.js"
  "client/src/components/InvoiceView.js"
  "client/src/components/CustomerList.js"
  "client/src/components/CustomerForm.js"
  "client/src/components/CustomerExcelImport.js"
  "client/src/components/ProductList.js"
  "client/src/components/ProductForm.js"
  "client/src/components/ExcelImport.js"
)

# Update each file
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Updating $file..."
    
    # Replace axios import with api import
    sed -i '' 's/import axios from '\''axios'\'';/import api from '\''..\/utils\/api'\'';/g' "$file"
    
    # Replace axios.get with api.get
    sed -i '' 's/axios\.get/api.get/g' "$file"
    
    # Replace axios.post with api.post
    sed -i '' 's/axios\.post/api.post/g' "$file"
    
    # Replace axios.put with api.put
    sed -i '' 's/axios\.put/api.put/g' "$file"
    
    # Replace axios.delete with api.delete
    sed -i '' 's/axios\.delete/api.delete/g' "$file"
    
    echo "✅ Updated $file"
  else
    echo "⚠️  File not found: $file"
  fi
done

echo "🎉 API calls update completed!"
echo ""
echo "📋 Next steps:"
echo "1. Review the changes in each file"
echo "2. Test the application locally"
echo "3. Commit and push your changes"
echo "4. Deploy to Render and Vercel" 