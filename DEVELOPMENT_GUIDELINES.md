# Development Guidelines

## Tool Development Rules

### 1. Bidirectional Conversion Requirement

**Rule**: When adding a new converter tool, you MUST implement reverse conversion if technically possible using the SAME PAGE with different views controlled by URL parameters.

#### Single Page, Multiple Directions Pattern:

Instead of creating separate pages for each direction:
- ❌ **DON'T**: Create `/tools/csv-to-excel/` and `/tools/excel-to-csv/` as separate pages
- ✅ **DO**: Create `/tools/csv-to-excel/` with bidirectional support, accessible as:
  - `/tools/csv-to-excel?mode=csv-to-excel` (default)
  - `/tools/csv-to-excel?mode=excel-to-csv` (reverse mode via param)

**OR** use a cleaner bidirectional route name:
- `/tools/csv-excel-converter?mode=csv-to-excel`
- `/tools/csv-excel-converter?mode=excel-to-csv`

#### Examples:
- ✅ **CSV ↔ Excel**: Single page with mode toggle
  - Route: `/tools/csv-to-excel` (or `/tools/csv-excel-converter`)
  - View controlled by `mode` param or internal state toggle
  
- ✅ **Excel ↔ PDF**: 
  - Route: `/tools/excel-to-pdf`
  - Note: PDF to Excel is complex and may not be feasible
  
- ✅ **Word ↔ PDF**:
  - Route: `/tools/word-to-pdf`
  - Note: PDF to Word is complex and may not be feasible

- ✅ **CSV ↔ HTML**:
  - Route: `/tools/csv-to-html` (or `/tools/csv-html-converter`)
  - Both directions in one page

- ✅ **CSV ↔ Markdown**:
  - Route: `/tools/csv-to-markdown` (or `/tools/csv-markdown-converter`)
  - Both directions in one page

- ✅ **CSV ↔ SQL**:
  - Route: `/tools/csv-to-sql` (or `/tools/csv-sql-converter`)
  - Both directions in one page

#### Implementation Pattern:

```typescript
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CSVExcelConverter() {
  const searchParams = useSearchParams();
  const defaultMode = searchParams.get('mode') || 'csv-to-excel';
  const [conversionMode, setConversionMode] = useState<'csv-to-excel' | 'excel-to-csv'>(defaultMode);

  // Toggle between modes with UI button
  const toggleMode = () => {
    setConversionMode(prev => 
      prev === 'csv-to-excel' ? 'excel-to-csv' : 'csv-to-excel'
    );
  };

  // Conditional rendering based on mode
  return (
    <div>
      <button onClick={toggleMode}>
        Switch to {conversionMode === 'csv-to-excel' ? 'Excel → CSV' : 'CSV → Excel'}
      </button>
      
      {conversionMode === 'csv-to-excel' ? (
        <CSVToExcelConverter />
      ) : (
        <ExcelToCSVConverter />
      )}
    </div>
  );
}
```

#### When Reverse Conversion Is Not Required:
- When technically infeasible (e.g., PDF to Excel with complex layouts)
- When the reverse direction doesn't make practical sense
- When the reverse would require OCR or AI (document to text conversions)

#### Implementation Checklist:
- [ ] Implement primary converter in one page
- [ ] Assess feasibility of reverse converter
- [ ] If feasible, add reverse converter logic to SAME page
- [ ] Add mode toggle UI (button/switch) in the page
- [ ] Support URL param for direct access: `?mode=reverse-mode`
- [ ] Add both directions to the tools listing page
- [ ] Both tool cards link to same page with different `mode` params
- [ ] Test round-trip conversion (A → B → A should preserve data)
- [ ] Document any limitations in both directions

#### Benefits of Single Page Pattern:
- ✅ Code reuse - shared UI components, state management
- ✅ Easier maintenance - one place to fix bugs
- ✅ Better UX - easy switching between directions
- ✅ Smaller bundle size - no duplicate code
- ✅ Consistent behavior - shared options and settings

### 2. Converter Structure

Each converter should follow this structure:

```
src/app/tools/[format-a]-to-[format-b]/
├── page.tsx          # Main converter component with bidirectional support
└── README.md         # Converter-specific documentation (optional)
```

### 3. Naming Convention

#### For Bidirectional Converters:
- Route: `/tools/[format-a]-to-[format-b]` (primary direction)
- File: `src/app/tools/[format-a]-to-[format-b]/page.tsx`
- Component: Export default React component
- Access modes:
  - Default: `/tools/[format-a]-to-[format-b]` (primary direction)
  - Reverse: `/tools/[format-a]-to-[format-b]?mode=[format-b]-to-[format-a]`
  
#### Tool Listing Page Integration:
When adding tools to `/tools/page.tsx`, add BOTH directions as separate cards:

```typescript
// Example: CSV ↔ Excel converter
{
  title: "CSV to Excel",
  description: "Convert CSV files to Excel format",
  icon: <Table />,
  href: "/tools/csv-to-excel?mode=csv-to-excel",  // Links to same page
  category: "Spreadsheet"
},
{
  title: "Excel to CSV", 
  description: "Convert Excel files to CSV format",
  icon: <FileText />,
  href: "/tools/csv-to-excel?mode=excel-to-csv",  // Same page, different mode
  category: "Spreadsheet"
}
```

This approach ensures:
- Users see both tools in the tools listing
- Both link to the same underlying page
- Mode param determines the initial view
- Toggle button allows easy switching

### 4. Unicode and Encoding Support

**Rule**: All converters MUST properly handle Unicode characters including:
- Cyrillic (Russian, Ukrainian, Bulgarian, etc.)
- Chinese, Japanese, Korean (CJK)
- Arabic, Hebrew (RTL languages)
- Emoji and special characters

#### Best Practices:
- Use UTF-8 encoding by default
- Test with multilingual sample data
- Use libraries with native Unicode support (e.g., pdfMake over jsPDF)
- Preserve character encoding during conversions

### 5. Error Handling

All converters must include:
- File validation (size, format, content)
- Graceful error messages
- Progress indicators for long operations
- Fallback behavior when possible

### 6. UI/UX Consistency

**Rule**: ALL converter tools MUST use the same standardized component styles and layout patterns for consistency.

#### Standard Layout Components:
All converters should follow the standard layout:
- Use `ConverterLayout` component
- **Standardized input section** (follow CSV-to-Excel pattern as reference)
- Drag-and-drop file upload with consistent styling
- Options panel for converter-specific settings
- Preview when applicable
- Download button with file info
- Clear error messages with consistent styling
- Progress indicators with same design

#### Reference Implementation:
Use `/tools/csv-to-excel` as the **reference implementation** for:
- ✅ File upload UI (drag & drop zone)
- ✅ Input mode toggle (text/file)
- ✅ Options panel styling
- ✅ Status indicators (idle/processing/success/error)
- ✅ Progress bars
- ✅ Error message display
- ✅ Success state with download button
- ✅ File info display (size, rows, columns)
- ✅ Button styles and hover states
- ✅ Color scheme and spacing

#### Standardized Design System:

**Colors:**
- Primary Action: `bg-gradient-to-r from-blue-600 to-indigo-600`
- Success: `bg-green-50 border-green-200 text-green-800`
- Error: `bg-red-50 border-red-200 text-red-800`
- Warning: `bg-yellow-50 border-yellow-200 text-yellow-800`
- Info: `bg-blue-50 border-blue-200 text-blue-800`
- Processing: `bg-blue-600` with animated progress

**Buttons:**
- Primary: `px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold`
- Secondary: `px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:border-gray-400 transition-all font-semibold`
- Danger: `px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors`

**Input Fields:**
- Text Input: `w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500`
- Select: `px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500`
- Checkbox: Consistent styling with labels

**Status Cards:**
- Border radius: `rounded-xl` or `rounded-2xl`
- Border width: `border-2`
- Padding: `p-6` for cards, `p-4` for smaller elements
- Shadow: `shadow-sm hover:shadow-md transition-all`

**File Upload Zone:**
- Default: `border-2 border-dashed border-gray-300 rounded-2xl`
- Hover: `border-indigo-500 bg-indigo-50/50`
- Dragging: `border-indigo-600 bg-indigo-100`
- Minimum height: `min-h-[300px]`

#### Why Consistency Matters:
- ✅ Professional appearance
- ✅ Better user experience (familiar patterns)
- ✅ Easier maintenance (one style to update)
- ✅ Faster development (copy-paste patterns)
- ✅ Brand consistency across all tools

#### Implementation Checklist:
When creating or updating a converter:
- [ ] Copy input section from CSV-to-Excel reference
- [ ] Use standardized color classes
- [ ] Match button styles exactly
- [ ] Use same icon sizes and positioning
- [ ] Follow same spacing (padding/margins)
- [ ] Use same animation/transition timings
- [ ] Match error/success message styling
- [ ] Keep consistent border radius and shadows

### 7. Testing Requirements

Before merging a new converter:
- [ ] Test with various file sizes (small, medium, large)
- [ ] Test with Unicode/multilingual content
- [ ] Test edge cases (empty files, malformed data)
- [ ] Test all configurable options
- [ ] Verify round-trip conversion (if bidirectional)

---

## Adding a New Converter Tool

### Step-by-Step Process:

1. **Create the converter directory**:
   ```bash
   mkdir -p src/app/tools/[format-a]-to-[format-b]
   ```

2. **Implement the converter** (`page.tsx`):
   - Use existing converters as templates
   - Follow the structure and patterns
   - Implement proper encoding handling

3. **Add reverse converter** (if feasible):
   ```bash
   mkdir -p src/app/tools/[format-b]-to-[format-a]
   ```

4. **Update the tools page** (`src/app/tools/page.tsx`):
   - Add both tools to the tools grid
   - Use appropriate icons
   - Write clear descriptions

5. **Update navigation** (`src/components/Header.tsx`):
   - Add links to both converters
   - Group related converters together

6. **Test thoroughly**:
   - Follow the testing checklist above
   - Test both directions
   - Verify data integrity

7. **Document**:
   - Update README.md if needed
   - Add any special notes or limitations
   - Document required dependencies

---

## Current Converters Status

### Implemented (Single Page, Bidirectional):
- ✅ CSV ↔ Excel (`/tools/csv-to-excel`)
  - Has built-in mode toggle
  - Both directions fully functional

### Implemented (Single Direction):
- ✅ CSV → HTML (`/tools/csv-to-html`)
- ✅ CSV → Markdown (`/tools/csv-to-markdown`)
- ✅ CSV → SQL (`/tools/csv-to-sql`)
- ✅ Excel → PDF (`/tools/excel-to-pdf`)
- ✅ Word → PDF (`/tools/word-to-pdf`)

### To Be Enhanced (Add Reverse to Existing Pages):
- ⏳ CSV ↔ HTML (add HTML → CSV to existing page)
- ⏳ CSV ↔ Markdown (add Markdown → CSV to existing page)
- ⏳ CSV ↔ SQL (add SQL → CSV if feasible)

### Future Considerations:
- JSON ↔ CSV
- XML ↔ CSV
- YAML ↔ CSV
- Excel ↔ JSON
- Markdown ↔ HTML

---

## Summary

**Key Principle**: One page per conversion pair, with bidirectional support via URL params or toggle buttons. This keeps the codebase clean, reduces duplication, and provides better UX.

---

Last Updated: 2025-10-24

