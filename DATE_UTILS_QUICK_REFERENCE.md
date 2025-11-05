# Day.js Date Utilities - Quick Reference

## Import
```typescript
import { 
  formatDate, 
  formatDateShort, 
  getCurrentDate,
  fromDateObject,
  toDateObject,
  compareDates 
} from "@/lib/date-utils";
```

## Common Use Cases

### Display a Date
```typescript
// Full format: "January 15, 2024"
const formatted = formatDate(memory.date_of_event);

// Short format: "Jan 15, 2024"
const formatted = formatDateShort(timeline.created_at);

// Custom format
const formatted = formatDate(date, "YYYY-MM-DD HH:mm");
```

### Get Current Date for Forms
```typescript
const [formData, setFormData] = useState({
  date_of_event: getCurrentDate(), // Returns YYYY-MM-DD
});
```

### Handle Date Picker Values
```typescript
// Convert string to Date object (for date picker)
<DatePicker
  value={toDateObject(formData.date_of_event)}
  onChange={(date) => {
    if (date) {
      // Convert Date object back to YYYY-MM-DD
      setFormData({ ...formData, date_of_event: fromDateObject(date) });
    }
  }}
/>
```

### Sort by Date
```typescript
const sorted = memories.sort((a, b) => 
  compareDates(a.date_of_event, b.date_of_event)
);
```

## Function Reference

| Function | Input | Output | Use Case |
|----------|-------|--------|----------|
| `formatDate(date, format?)` | Date/string/dayjs | Formatted string | Display dates to users |
| `formatDateShort(date)` | Date/string/dayjs | "MMM D, YYYY" | Compact date display |
| `getCurrentDate()` | - | "YYYY-MM-DD" | Default value for date inputs |
| `fromDateObject(date)` | Date object | "YYYY-MM-DD" | Convert Date picker value to string |
| `toDateObject(date)` | string/dayjs/Date | Date object | Convert string to Date picker value |
| `compareDates(a, b)` | Date/string/dayjs | number | Sort arrays by date |
| `toDateInputValue(date)` | Date/string/dayjs | "YYYY-MM-DD" | Convert any date to input format |
| `parseDate(date)` | Date/string/dayjs | dayjs object | Advanced date manipulation |

## Important Notes

### Date Fields (`date_of_event`)
- Stored as YYYY-MM-DD in database
- No timezone conversion needed
- Same date for all users worldwide
- Use `fromDateObject()` when saving from date picker
- Use `formatDate()` when displaying

### Timestamp Fields (`created_at`, `updated_at`)
- Stored with timezone in database
- Automatically formatted by Day.js
- Display in user's local timezone
- Use `formatDate()` or `formatDateShort()` for display

### Date Picker Integration
```typescript
// ✅ Correct
<DatePicker
  value={toDateObject(dateString)}
  onChange={(date) => date && setDate(fromDateObject(date))}
/>

// ❌ Avoid
<DatePicker
  value={new Date(dateString)} // Use toDateObject instead
  onChange={(date) => date && setDate(date.toISOString())} // Use fromDateObject instead
/>
```

## Examples from Codebase

### Display Memory Date
```typescript
// memory-card-view.tsx
const formattedDate = formatDate(memory.date_of_event);
```

### Create Memory Form
```typescript
// create-memory-form.tsx
const [formData, setFormData] = useState({
  date_of_event: getCurrentDate(),
});

// In DatePicker onChange
onChange={(date) => {
  if (date) {
    setFormData((prev) => ({
      ...prev,
      date_of_event: fromDateObject(date),
    }));
  }
}}
```

### Sort Memories
```typescript
// timeline/[slug].tsx
const sortedMemories = memories.sort(
  (a, b) => compareDates(a.date_of_event, b.date_of_event)
);
```

### Display Timeline Created Date
```typescript
// pages/index.tsx
<span>{formatDateShort(timeline.created_at)}</span>
```

## Timezone Behavior

- **User's timezone is auto-detected** using `dayjs.tz.guess()`
- **Display dates** are formatted in user's local timezone
- **Date fields** (date_of_event) are universal - same for everyone
- **Timestamp fields** (created_at, updated_at) respect timezone

## Migration Checklist

When adding new date features:
- [ ] Use `formatDate()` or `formatDateShort()` for display
- [ ] Use `getCurrentDate()` for default date values
- [ ] Use `fromDateObject()` when saving date picker values
- [ ] Use `toDateObject()` when loading date picker values
- [ ] Use `compareDates()` for sorting
- [ ] Never use native Date methods like `.toLocaleDateString()` or `.toISOString().split("T")[0]`
- [ ] Never use `new Date()` for current date (use `getCurrentDate()`)

## Testing Checklist

- [ ] Dates display correctly in your timezone
- [ ] Date picker shows the correct date when editing
- [ ] Dates save correctly to database
- [ ] Dates sort correctly
- [ ] Created/updated timestamps show correctly

## Common Mistakes to Avoid

```typescript
// ❌ Don't use native Date methods
new Date().toISOString().split("T")[0]
date.toLocaleDateString()
date.toDateString()

// ✅ Use Day.js utilities instead
getCurrentDate()
formatDate(date)
formatDateShort(date)

// ❌ Don't create Date objects directly
new Date(2024, 0, 15)

// ✅ Use Day.js
dayjs("2024-01-15").toDate()

// ❌ Don't format dates manually
`${date.getMonth()}/${date.getDate()}/${date.getFullYear()}`

// ✅ Use formatDate
formatDate(date, "M/D/YYYY")
```

