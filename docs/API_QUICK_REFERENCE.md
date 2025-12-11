# API Quick Reference Guide

## 🚀 Base URLs

- **Sales & Orders:** `/sales`
- **Production:** `/production`
- **Customers:** `/customers`
- **Reports:** `/reports`

---

## 📦 Sales Orders - Quick Reference

```bash
# Create Order
POST /sales-orders

# Get Order
GET /sales-orders/{id}

# List Orders
GET /sales-orders?page=1&perPage=20&status=CONFIRMED

# Update Order (DRAFT only)
PUT /sales-orders/{id}

# Confirm Order
POST /sales-orders/{id}/confirm

# Cancel Order
POST /sales-orders/{id}/cancel

# Delete Order (DRAFT/CANCELLED only)
DELETE /sales-orders/{id}

# Special Views
GET /sales-orders/today
GET /sales-orders/pending-production
GET /sales-orders/in-production
GET /sales-orders/ready-for-delivery
GET /sales-orders/unpaid
```

---

## 🚚 Deliveries - Quick Reference

```bash
# Create Delivery
POST /sales-orders/{salesOrderId}/deliveries

# Get Delivery
GET /deliveries/{id}

# List Deliveries
GET /deliveries?page=1&perPage=20&status=DELIVERED

# Update Delivery
PUT /deliveries/{id}

# Cancel Delivery
POST /deliveries/{id}/cancel
```

---

## 💰 Payments - Quick Reference

```bash
# Record Payment
POST /sales-orders/{salesOrderId}/payments

# Get Payment
GET /payments/{id}

# List Payments
GET /payments?page=1&perPage=20&paymentMethod=TRANSFER

# Cancel Payment
POST /payments/{id}/cancel
```

---

## 🏭 Production Tasks - Quick Reference

```bash
# Create Task (with BOM)
POST /production-tasks
{
  "productionBomId": "uuid",
  "quantityPlanned": 50,
  "useBomTemplate": true
}

# Create Task (Manual)
POST /production-tasks
{
  "sourceType": "MANUAL",
  "inputs": [...],
  "outputs": [...]
}

# Get Task
GET /production-tasks/{id}

# List Tasks
GET /production-tasks?page=1&taskType=KITCHEN&status=PENDING

# Update Task (PENDING only)
PUT /production-tasks/{id}

# Start Task
POST /production-tasks/{id}/start

# Update Progress
PATCH /production-tasks/{id}/progress

# Complete Task
POST /production-tasks/{id}/complete

# Cancel Task
POST /production-tasks/{id}/cancel

# Special Views
GET /production-tasks/kitchen/display?station=KITCHEN
GET /production-tasks/my-tasks
GET /production-tasks/stock
```

---

## 📋 Production BOM - Quick Reference

```bash
# Create BOM
POST /production-boms

# Get BOM
GET /production-boms/{id}

# List BOMs
GET /production-boms?page=1&isActive=true&productionType=COOKING

# Update BOM
PUT /production-boms/{id}

# Activate/Deactivate
PATCH /production-boms/{id}/status

# Get Active BOM for Item
GET /production-boms/active/{itemSkuId}

# Calculate Cost
POST /production-boms/{id}/calculate-cost
{
  "quantity": 50
}

# Clone BOM
POST /production-boms/{id}/clone

# Usage History
GET /production-boms/{id}/usage?page=1
```

---

## 👥 Customers - Quick Reference

```bash
# Create Customer
POST /customers

# Get Customer
GET /customers/{id}

# List Customers
GET /customers?page=1&customerType=CORPORATE&isActive=true

# Update Customer
PUT /customers/{id}

# Activate/Deactivate
PATCH /customers/{id}/status

# Get Customer Orders
GET /customers/{id}/orders?page=1

# Get Customer Balance
GET /customers/{id}/balance
```

---

## 📊 Reports - Quick Reference

```bash
# Sales Dashboard
GET /reports/sales-dashboard?period=MONTH

# Production Dashboard
GET /reports/production-dashboard?period=WEEK

# Inventory Impact
GET /reports/inventory-impact?dateFrom=2025-11-01&dateTo=2025-11-30

# Customer Analytics
GET /reports/customer-analytics?customerId=uuid

# Financial Summary
GET /reports/financial-summary?period=YEAR

# BOM Cost Analysis
GET /reports/bom-cost-analysis?productionBomId=uuid
```

---

## 🔑 Common Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `perPage` - Items per page (default: 20, max: 100)

### Filtering
- `status` - Filter by status
- `dateFrom` - Start date (ISO 8601)
- `dateTo` - End date (ISO 8601)
- `search` - Search term

### Sales Orders
- `customerId` - Filter by customer
- `status` - DRAFT, CONFIRMED, COMPLETED, CANCELLED

### Production Tasks
- `sourceType` - STOCK, POS_ORDER, SALES_ORDER, MANUAL
- `taskType` - KITCHEN, BAR, COFFEE, ASSEMBLY, PREP, BULK, CUSTOM
- `status` - PENDING, QUEUED, IN_PROGRESS, COMPLETED, CANCELLED

### Deliveries
- `salesOrderId` - Filter by sales order
- `status` - PENDING, IN_TRANSIT, DELIVERED, FAILED, CANCELLED

### Payments
- `salesOrderId` - Filter by sales order
- `paymentMethod` - CASH, TRANSFER, CARD, QRIS, E_WALLET, COD, CREDIT
- `status` - PENDING, CONFIRMED, PARTIAL, REFUNDED, CANCELLED

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "perPage": 20,
    "from": 1,
    "to": 20,
    "total": 150,
    "lastPage": 8,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field": ["Validation error message"]
  }
}
```

---

## 🔐 Authentication

All requests require JWT Bearer token:

```bash
curl -X GET https://api.example.com/sales/sales-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

---

## 💡 Common Workflows

### 1. Create and Process Sales Order
```
1. POST /sales-orders (Create DRAFT)
2. PUT /sales-orders/{id} (Update if needed)
3. POST /sales-orders/{id}/confirm (Confirm order)
4. POST /production-tasks (Create production tasks)
5. POST /sales-orders/{id}/deliveries (Create delivery)
6. POST /sales-orders/{id}/payments (Record payment)
```

### 2. Production with BOM
```
1. POST /production-boms (Create recipe)
2. POST /production-tasks (Create task with BOM)
3. POST /production-tasks/{id}/start (Start production)
4. PATCH /production-tasks/{id}/progress (Update progress)
5. POST /production-tasks/{id}/complete (Complete task)
```

### 3. Customer Management
```
1. POST /customers (Create customer)
2. GET /customers/{id}/balance (Check credit)
3. POST /sales-orders (Create order for customer)
4. GET /customers/{id}/orders (View order history)
```

---

## 🎯 Status Transitions

### Sales Order
```
DRAFT → CONFIRMED → IN_PRODUCTION → READY → DELIVERED → COMPLETED
                ↓
            CANCELLED
```

### Production Task
```
PENDING → QUEUED → IN_PROGRESS → COMPLETED
            ↓
        CANCELLED
```

### Delivery
```
PENDING → IN_TRANSIT → DELIVERED
            ↓
        CANCELLED/FAILED
```

### Payment
```
PENDING → CONFIRMED → (COMPLETED)
            ↓
        CANCELLED/REFUNDED
```

---

**For complete API documentation, see:** `API_SPEC_SALES_PRODUCTION.md`
