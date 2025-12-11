# 📚 API Documentation

This directory contains comprehensive API documentation for the Sales Orders and Production Management System.

---

## 📄 Documentation Files

### 1. **API_SPEC_SALES_PRODUCTION.md** (Main Specification)
**Size:** 44.6 KB | **Lines:** 2,209

The complete, detailed API specification document containing:
- 54 API endpoints across 7 modules
- Complete request/response examples
- Comprehensive enum definitions
- Business logic and workflows
- Pagination and error handling

**Use this when:**
- Implementing backend endpoints
- Building frontend integrations
- Creating test cases
- Understanding complete business logic

---

### 2. **API_QUICK_REFERENCE.md** (Quick Reference)
**Size:** 6.7 KB

A condensed quick reference guide for developers containing:
- Common endpoint patterns
- Query parameter reference
- Response format examples
- Common workflows
- Status transition diagrams

**Use this when:**
- You need to quickly find an endpoint
- Looking up query parameters
- Checking response formats
- Understanding status flows

---

### 3. **API_SPEC_IMPLEMENTATION_SUMMARY.md** (Summary)
**Size:** 5.3 KB

A high-level summary of what's been implemented:
- Module breakdown
- Endpoint counts
- Feature checklist
- Implementation status
- Next steps

**Use this when:**
- Getting an overview of the API
- Planning implementation
- Tracking progress
- Presenting to stakeholders

---

### 4. **ENUM_REFERENCE_ID.md** (Referensi Enum Bahasa Indonesia)
**Size:** ~12 KB

Referensi lengkap semua enum dengan terjemahan Bahasa Indonesia:
- Tabel mapping kode ke label Indonesia
- Rekomendasi warna untuk UI
- Contoh kode implementasi (Frontend & Backend)
- Icon recommendations
- Best practices

**Use this when:**
- Implementing Indonesian UI labels
- Choosing colors for status badges
- Understanding enum values in Indonesian
- Creating dropdown/select options

---

### 5. **enums.json** (Enum Data File)
**Size:** ~10 KB | **Format:** JSON

File JSON berisi semua enum dengan metadata lengkap:
- Kode enum
- Label Indonesia & English
- Deskripsi
- Warna (hex codes)
- Icon emoji
- Sort order

**Use this when:**
- Importing enum data to frontend
- Building dynamic UI components
- Creating status badges
- Generating dropdown options

---


| Module | Endpoints | Description |
|--------|-----------|-------------|
| **Sales Orders** | 12 | Complete order management lifecycle |
| **Deliveries** | 5 | Delivery tracking and management |
| **Payments** | 4 | Payment recording and tracking |
| **Production Tasks** | 11 | Production task management |
| **Production BOMs** | 9 | Bill of Materials (recipes) |
| **Customers** | 7 | Customer relationship management |
| **Reports & Analytics** | 6 | Business intelligence and dashboards |
| **TOTAL** | **54** | **Complete API Coverage** |

---

## 🚀 Quick Start

### For Backend Developers
1. Read `API_SPEC_SALES_PRODUCTION.md` for complete specifications
2. Implement endpoints following the documented request/response formats
3. Use the enum definitions for consistent status values
4. Follow the pagination format for all list endpoints

### For Frontend Developers
1. Start with `API_QUICK_REFERENCE.md` for endpoint overview
2. Reference `API_SPEC_SALES_PRODUCTION.md` for detailed response structures
3. Use the example responses to build UI components
4. Implement pagination using the standardized meta format

### For QA Engineers
1. Use `API_SPEC_SALES_PRODUCTION.md` for test case creation
2. Reference the example requests for test data
3. Validate responses against documented formats
4. Test all status transitions and workflows

### For Project Managers
1. Review `API_SPEC_IMPLEMENTATION_SUMMARY.md` for project overview
2. Track implementation progress against the checklist
3. Use endpoint counts for sprint planning
4. Reference workflows for business logic validation

---

## 📊 Key Features

### ✅ Complete CRUD Operations
All entities support Create, Read, Update, and Delete operations where appropriate.

### ✅ Pagination Support
All list endpoints return paginated results with consistent meta information:
```json
{
  meta: {
    page: 1,
    perPage: 20,
    from: 1,
    to: 20,
    total: 150,
    lastPage: 8,
    hasMore: true,
  }
}
```

### ✅ Comprehensive Filtering
Query parameters for filtering by:
- Status
- Date ranges
- Entity relationships
- Search terms

### ✅ Consistent Response Format
Standardized success and error responses across all endpoints.

### ✅ Business Workflows
Complete workflows documented for:
- Sales order processing
- Production task lifecycle
- Delivery management
- Payment tracking

---

## 🔐 Authentication

All API endpoints require JWT Bearer token authentication:

```bash
Authorization: Bearer {your-jwt-token}
Content-Type: application/json
Accept: application/json
```

---

## 📝 Status Enums

### Sales Order Status
`DRAFT` → `CONFIRMED` → `IN_PRODUCTION` → `READY` → `DELIVERED` → `COMPLETED`

### Production Task Status
`PENDING` → `QUEUED` → `IN_PROGRESS` → `COMPLETED`

### Delivery Status
`PENDING` → `IN_TRANSIT` → `DELIVERED`

### Payment Status
`PENDING` → `CONFIRMED`

---

## 💡 Common Use Cases

### 1. Create a Sales Order
```
POST /sales-orders
→ Returns order with DRAFT status
→ Can be edited with PUT /sales-orders/{id}
→ Confirm with POST /sales-orders/{id}/confirm
```

### 2. Production from BOM
```
POST /production-boms (Create recipe)
→ POST /production-tasks (Use BOM template)
→ POST /production-tasks/{id}/start
→ POST /production-tasks/{id}/complete
```

### 3. Customer Order Flow
```
POST /customers (Create customer)
→ POST /sales-orders (Create order)
→ POST /production-tasks (Produce items)
→ POST /sales-orders/{id}/deliveries (Deliver)
→ POST /sales-orders/{id}/payments (Receive payment)
```

---

## 📈 Reports & Analytics

The API provides 6 comprehensive report endpoints:
- Sales Dashboard
- Production Dashboard
- Inventory Impact
- Customer Analytics
- Financial Summary
- BOM Cost Analysis

All reports support date range filtering and period grouping.

---

## 🛠️ Development Guidelines

1. **Follow the documented formats** - Request and response structures are standardized
2. **Use proper status codes** - 200 OK, 201 Created, 400 Bad Request, etc.
3. **Implement pagination** - All list endpoints must support pagination
4. **Validate inputs** - Use the documented validation rules
5. **Handle errors gracefully** - Return structured error responses
6. **Use UUIDs** - All entity IDs should be UUIDs
7. **ISO 8601 dates** - All dates must include timezone information

---

## 📞 Support

For questions or clarifications about the API specification:
1. Check the main specification document first
2. Review the quick reference guide
3. Consult the implementation summary
4. Contact the API development team

---

## 🔄 Version History

- **v1.0** (2025-11-27) - Initial comprehensive API specification
  - 54 endpoints across 7 modules
  - Complete CRUD operations
  - Comprehensive enum definitions
  - Reports & analytics
  - Customer management

---

## 📌 Next Steps

1. ✅ API Specification Complete
2. ⏳ Backend Implementation
3. ⏳ Frontend Integration
4. ⏳ Testing & QA
5. ⏳ Deployment

---

**Last Updated:** 2025-11-27  
**Status:** ✅ Specification Complete & Ready for Implementation
