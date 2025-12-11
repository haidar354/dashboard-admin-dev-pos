# API Specification - Sales Orders & Production

**Base URL:** `/sales`

**Authentication:** Bearer Token (JWT)

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
Accept: application/json
```

---

## 📦 SALES ORDERS API

### 1. Create Sales Order

**Endpoint:** `POST /sales-orders`

**Request Body:**
```json
{
  customerId: 'uuid',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+6281234567890',
  orderDate: '2025-11-27T10:00:00+07:00',
  deliveryDate: '2025-11-30T14:00:00+07:00',
  deliveryAddress: 'Jl. Sudirman No. 123, Jakarta',
  paymentMethod: 'TRANSFER',
  paymentTerm: 'NET_30',
  notes: 'Deliver before 2 PM',
  lines: [
    {
      itemSkuId: 'uuid-sku-1',
      quantity: 10,
      unitPrice: 50000,
      discount: 5000,
      taxRate: 11,
      notes: 'Extra packaging'
    },
    {
      itemSkuId: 'uuid-sku-2',
      quantity: 5,
      unitPrice: 100000,
      discount: 0,
      taxRate: 11,
    }
  ],
}
```

**Response:** `201 Created`
```json
{
  success: true,
  message: 'Sales order created successfully',
  data: {
    salesOrderId: 'uuid',
    orderNumber: 'SO-20251127-001',
    customerId: 'uuid',
    customerName: 'John Doe',
    orderDate: '2025-11-27T10:00:00+07:00',
    deliveryDate: '2025-11-30T14:00:00+07:00',
    status: 'DRAFT',
    subtotal: 1000000,
    discountTotal: 50000,
    taxTotal: 104500,
    grandTotal: 1054500,
    lines: [
      {
        orderLineId: 'uuid',
        itemSkuId: 'uuid-sku-1',
        itemSku: {
          itemSkuId: 'uuid-sku-1',
          skuCode: 'SKU-001',
          skuName: 'Product A'
        },
        quantity: 10,
        unitPrice: 50000,
        lineTotal: 500000,
      }
    ],
    createdAt: '2025-11-27T10:00:00+07:00'
  },
}
```

---

### 2. Get Sales Order Detail

**Endpoint:** `GET /sales-orders/{salesOrderId}`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "salesOrderId": "uuid",
    "orderNumber": "SO-20251127-001",
    "customer": {
      "customerId": "uuid",
      "customerName": "John Doe",
      "email": "john@example.com",
      "phone": "+6281234567890"
    },
    "orderDate": "2025-11-27T10:00:00+07:00",
    "deliveryDate": "2025-11-30T14:00:00+07:00",
    "deliveryAddress": "Jl. Sudirman No. 123",
    "status": "CONFIRMED",
    "productionStatus": "IN_PRODUCTION",
    "deliveryStatus": "PENDING",
    "paymentStatus": "UNPAID",
    "subtotal": 1000000,
    "discountTotal": 50000,
    "taxTotal": 104500,
    "grandTotal": 1054500,
    "lines": [...],
    "deliveries": [...],
    "payments": [...],
    "createdAt": "2025-11-27T10:00:00+07:00",
    "updatedAt": "2025-11-27T10:00:00+07:00"
  }
}
```

---

### 3. List Sales Orders (Paginated)

**Endpoint:** `GET /sales-orders?page=1&perPage=20`

**Query Parameters:**
- `page` (int, default: 1)
- `perPage` (int, default: 20, max: 100)
- `status` (string, optional): DRAFT, CONFIRMED, COMPLETED, CANCELLED
- `customerId` (uuid, optional)
- `dateFrom` (date, optional)
- `dateTo` (date, optional)
- `search` (string, optional): Search by order number or customer name

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Sales orders fetched successfully',
  data: [
    {
      salesOrderId: 'uuid',
      orderNumber: 'SO-20251127-001',
      customerName: 'John Doe',
      orderDate: '2025-11-27',
      deliveryDate: '2025-11-30',
      status: 'CONFIRMED',
      grandTotal: 1054500,
    }
  ],
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

---

### 4. Update Sales Order

**Endpoint:** `PUT /sales-orders/{salesOrderId}`

**Request Body:**
```json
{
  customerId: 'uuid',
  customerName: 'John Doe',
  customerEmail: 'john@example.com',
  customerPhone: '+6281234567890',
  orderDate: '2025-11-27T10:00:00+07:00',
  deliveryDate: '2025-11-30T14:00:00+07:00',
  deliveryAddress: 'Jl. Sudirman No. 123, Jakarta',
  paymentMethod: 'TRANSFER',
  paymentTerm: 'NET_30',
  notes: 'Updated notes',
  lines: [
    {
      orderLineId: 'uuid-line-1', // Existing line to update
      itemSkuId: 'uuid-sku-1',
      quantity: 15, // Updated quantity
      unitPrice: 50000,
      discount: 5000,
      taxRate: 11,
    },
    {
      // New line (no orderLineId)
      itemSkuId: 'uuid-sku-3',
      quantity: 3,
      unitPrice: 75000,
      discount: 0,
      taxRate: 11,
    }
  ],
  deletedLineIds: ['uuid-line-2'] // Lines to delete
}
```

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Sales order updated successfully',
  data: {
    salesOrderId: 'uuid',
    orderNumber: 'SO-20251127-001',
    status: 'DRAFT',
    updatedAt: '2025-11-27T11:00:00+07:00'
  },
}
```

**Note:** Only DRAFT orders can be fully updated. CONFIRMED orders have restrictions.

---

### 5. Cancel Sales Order

**Endpoint:** `POST /sales-orders/{salesOrderId}/cancel`

**Request Body:**
```json
{
  reason: 'Customer requested cancellation',
  notes: 'Refund processed'
}
```

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Sales order cancelled successfully',
  data: {
    salesOrderId: 'uuid',
    status: 'CANCELLED',
    cancelledAt: '2025-11-27T12:00:00+07:00',
    cancelledBy: {
      userId: 'uuid',
      name: 'Admin User'
    }
  },
}
```

---

### 6. Delete Sales Order

**Endpoint:** `DELETE /sales-orders/{salesOrderId}`

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Sales order deleted successfully',
}
```

**Note:** Only DRAFT and CANCELLED orders can be deleted. Orders with deliveries or payments cannot be deleted.

---

### 7. Confirm Sales Order

**Endpoint:** `POST /sales-orders/{salesOrderId}/confirm`

**Request Body:**
```json
{
  notes: 'Order confirmed by manager'
}
```

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Sales order confirmed successfully',
  data: {
    salesOrderId: 'uuid',
    status: 'CONFIRMED',
    confirmedAt: '2025-11-27T10:30:00+07:00'
  },
}
```

---

### 5. Role-Based Views

#### Today's Sales Orders
**Endpoint:** `GET /sales-orders/today?page=1`

#### Pending Production
**Endpoint:** `GET /sales-orders/pending-production?page=1`

#### In Production
**Endpoint:** `GET /sales-orders/in-production?page=1`

#### Ready for Delivery
**Endpoint:** `GET /sales-orders/ready-for-delivery?page=1`

#### Unpaid Orders
**Endpoint:** `GET /sales-orders/unpaid?page=1`

---

### 8. Create Delivery

**Endpoint:** `POST /sales-orders/{salesOrderId}/deliveries`

**Request Body:**
```json
{
  deliveryDate: '2025-11-30T14:00:00+07:00',
  deliveryAddress: 'Jl. Sudirman No. 123',
  driverName: 'Budi',
  vehicleNumber: 'B 1234 XYZ',
  lines: [
    {
      orderLineId: 'uuid',
      quantityDelivered: 10,
    }
  ],
  notes: 'Delivered on time'
}
```

**Response:** `201 Created`
```json
{
  success: true,
  message: 'Delivery created successfully',
  data: {
    deliveryId: 'uuid',
    deliveryNumber: 'DEL-20251130-001',
    salesOrderId: 'uuid',
    deliveryDate: '2025-11-30T14:00:00+07:00',
    status: 'DELIVERED',
    lines: [
      {
        deliveryLineId: 'uuid',
        orderLineId: 'uuid',
        itemSku: {
          skuCode: 'SKU-001',
          skuName: 'Product A'
        },
        quantityDelivered: 10,
      }
    ],
    createdAt: '2025-11-30T14:00:00+07:00'
  },
}
```

---

### 9. Get Delivery Detail

**Endpoint:** `GET /deliveries/{deliveryId}`

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    deliveryId: 'uuid',
    deliveryNumber: 'DEL-20251130-001',
    salesOrder: {
      salesOrderId: 'uuid',
      orderNumber: 'SO-20251127-001',
      customerName: 'John Doe'
    },
    deliveryDate: '2025-11-30T14:00:00+07:00',
    deliveryAddress: 'Jl. Sudirman No. 123',
    driverName: 'Budi',
    vehicleNumber: 'B 1234 XYZ',
    status: 'DELIVERED',
    lines: [...],
    notes: 'Delivered on time',
    createdAt: '2025-11-30T14:00:00+07:00'
  },
}
```

---

### 10. List Deliveries (Paginated)

**Endpoint:** `GET /deliveries?page=1&perPage=20`

**Query Parameters:**
- `page` (int, default: 1)
- `perPage` (int, default: 20, max: 100)
- `salesOrderId` (uuid, optional)
- `status` (string, optional): PENDING, IN_TRANSIT, DELIVERED, CANCELLED
- `dateFrom` (date, optional)
- `dateTo` (date, optional)
- `search` (string, optional): Search by delivery number or customer name

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Deliveries fetched successfully',
  data: [
    {
      deliveryId: 'uuid',
      deliveryNumber: 'DEL-20251130-001',
      salesOrderNumber: 'SO-20251127-001',
      customerName: 'John Doe',
      deliveryDate: '2025-11-30',
      status: 'DELIVERED',
    }
  ],
  meta: {
    page: 1,
    perPage: 20,
    from: 1,
    to: 20,
    total: 85,
    lastPage: 5,
    hasMore: true,
  }
}
```

---

### 11. Update Delivery

**Endpoint:** `PUT /deliveries/{deliveryId}`

**Request Body:**
```json
{
  deliveryDate: '2025-11-30T15:00:00+07:00',
  deliveryAddress: 'Updated address',
  driverName: 'Budi',
  vehicleNumber: 'B 1234 XYZ',
  notes: 'Updated delivery info'
}
```

**Response:** `200 OK`

---

### 12. Cancel Delivery

**Endpoint:** `POST /deliveries/{deliveryId}/cancel`

**Request Body:**
```json
{
  reason: 'Customer not available',
  notes: 'Will reschedule'
}
```

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Delivery cancelled successfully',
  data: {
    deliveryId: 'uuid',
    status: 'CANCELLED',
    cancelledAt: '2025-11-30T14:30:00+07:00'
  },
}
```

---

### 13. Record Payment

**Endpoint:** `POST /sales-orders/{salesOrderId}/payments`

**Request Body:**
```json
{
  paymentDate: '2025-11-27T15:00:00+07:00',
  paymentMethod: 'TRANSFER',
  amount: 1054500,
  referenceNumber: 'TRX-123456',
  notes: 'Full payment received'
}
```

**Response:** `201 Created`
```json
{
  success: true,
  message: 'Payment recorded successfully',
  data: {
    paymentId: 'uuid',
    paymentNumber: 'PAY-20251127-001',
    salesOrderId: 'uuid',
    paymentDate: '2025-11-27T15:00:00+07:00',
    paymentMethod: 'TRANSFER',
    amount: 1054500,
    referenceNumber: 'TRX-123456',
    status: 'CONFIRMED',
    createdAt: '2025-11-27T15:00:00+07:00'
  },
}
```

---

### 14. Get Payment Detail

**Endpoint:** `GET /payments/{paymentId}`

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    paymentId: 'uuid',
    paymentNumber: 'PAY-20251127-001',
    salesOrder: {
      salesOrderId: 'uuid',
      orderNumber: 'SO-20251127-001',
      customerName: 'John Doe',
      grandTotal: 1054500
    },
    paymentDate: '2025-11-27T15:00:00+07:00',
    paymentMethod: 'TRANSFER',
    amount: 1054500,
    referenceNumber: 'TRX-123456',
    status: 'CONFIRMED',
    notes: 'Full payment received',
    createdAt: '2025-11-27T15:00:00+07:00'
  },
}
```

---

### 15. List Payments (Paginated)

**Endpoint:** `GET /payments?page=1&perPage=20`

**Query Parameters:**
- `page` (int, default: 1)
- `perPage` (int, default: 20, max: 100)
- `salesOrderId` (uuid, optional)
- `paymentMethod` (string, optional): CASH, TRANSFER, CARD, QRIS, etc.
- `status` (string, optional): PENDING, CONFIRMED, CANCELLED
- `dateFrom` (date, optional)
- `dateTo` (date, optional)
- `search` (string, optional): Search by payment number or reference

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Payments fetched successfully',
  data: [
    {
      paymentId: 'uuid',
      paymentNumber: 'PAY-20251127-001',
      salesOrderNumber: 'SO-20251127-001',
      customerName: 'John Doe',
      paymentDate: '2025-11-27',
      paymentMethod: 'TRANSFER',
      amount: 1054500,
      status: 'CONFIRMED',
    }
  ],
  meta: {
    page: 1,
    perPage: 20,
    from: 1,
    to: 20,
    total: 120,
    lastPage: 6,
    hasMore: true,
  }
}
```

---

### 16. Cancel Payment

**Endpoint:** `POST /payments/{paymentId}/cancel`

**Request Body:**
```json
{
  reason: 'Payment reversed',
  notes: 'Bank transfer failed'
}
```

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Payment cancelled successfully',
  data: {
    paymentId: 'uuid',
    status: 'CANCELLED',
    cancelledAt: '2025-11-27T16:00:00+07:00'
  },
}
```

---

## 🏭 PRODUCTION API

### 1. Create Production Task

**Base URL:** `/production`

**Endpoint:** `POST /production-tasks`

**Request Body (with BOM Template):**
```json
{
  sourceType: 'STOCK',
  taskType: 'PREP',
  productionBomId: 'uuid-bom',
  quantityPlanned: 50,
  useBomTemplate: true,
  scheduledAt: '2025-11-27T06:00:00+07:00',
  assignedToUserId: 'uuid-user',
  notes: 'Morning prep for breakfast'
}
```

**Request Body (Manual - No BOM):**
```json
{
  sourceType: 'POS_ORDER',
  sourceId: 'uuid-order',
  orderLineId: 'uuid-line',
  taskType: 'KITCHEN',
  station: 'KITCHEN',
  inputs: [
    {
      itemSkuId: 'uuid-beras',
      quantityPlanned: 0.2,
      unit: 'kg'
    },
    {
      itemSkuId: 'uuid-telur',
      quantityPlanned: 2,
      unit: 'pcs'
    },
  ],
  outputs: [
    {
      itemSkuId: 'uuid-nasi-goreng',
      quantityPlanned: 1,
      unit: 'porsi'
    },
  ],
  priority: 10,
}
```

**Response:** `201 Created`
```json
{
  success: true,
  message: 'Production task created successfully',
  data: {
    productionTaskId: 'uuid',
    taskNumber: 'KT-20251127-001',
    sourceType: 'STOCK',
    taskType: 'PREP',
    status: 'PENDING',
    inputs: [
      {
        inputId: 'uuid',
        itemSku: {
          itemSkuId: 'uuid',
          skuCode: 'BERAS-001',
          skuName: 'Beras Premium'
        },
        quantityPlanned: 10,
        unit: 'kg'
      },
    ],
    outputs: [
      {
        outputId: 'uuid',
        itemSku: {
          itemSkuId: 'uuid',
          skuCode: 'NASIGORENG-001',
          skuName: 'Nasi Goreng'
        },
        quantityPlanned: 50,
        unit: 'porsi'
      },
    ],
    createdAt: '2025-11-27T05:00:00+07:00'
  },
}
```

---

### 2. Start Production Task

**Endpoint:** `POST /production-tasks/{productionTaskId}/start`

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Production task started successfully',
  data: {
    productionTaskId: 'uuid',
    status: 'IN_PROGRESS',
    startedAt: '2025-11-27T06:00:00+07:00'
  },
}
```

---

### 3. Update Production Progress

**Endpoint:** `PATCH /production-tasks/{productionTaskId}/progress`

**Request Body:**
```json
{
  quantityCompleted: 30,
  quantityRejected: 2,
  notes: '30 done, 2 rejected due to quality'
}
```

**Response:** `200 OK`

---

### 4. Update Production Task

**Endpoint:** `PUT /production-tasks/{productionTaskId}`

**Request Body:**
```json
{
  scheduledAt: '2025-11-27T07:00:00+07:00',
  assignedToUserId: 'uuid-user-2',
  priority: 5,
  notes: 'Updated production schedule'
}
```

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Production task updated successfully',
  data: {
    productionTaskId: 'uuid',
    status: 'PENDING',
    updatedAt: '2025-11-27T06:30:00+07:00'
  },
}
```

**Note:** Only PENDING tasks can be fully updated. Tasks IN_PROGRESS or COMPLETED have restrictions.

---

### 5. Complete Production Task

**Endpoint:** `POST /production-tasks/{productionTaskId}/complete`

**Request Body:**
```json
{
  notes: 'Production completed successfully'
}
```

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Production task completed successfully',
  data: {
    productionTaskId: 'uuid',
    status: 'COMPLETED',
    completedAt: '2025-11-27T08:00:00+07:00'
  },
}
```

---

### 6. Cancel Production Task

**Endpoint:** `POST /production-tasks/{productionTaskId}/cancel`

**Request Body:**
```json
{
  reason: 'Order cancelled',
  notes: 'Customer requested cancellation'
}
```

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Production task cancelled successfully',
  data: {
    productionTaskId: 'uuid',
    status: 'CANCELLED',
    cancelledAt: '2025-11-27T07:00:00+07:00',
    cancelledBy: {
      userId: 'uuid',
      name: 'Manager User'
    }
  },
}
```

---

### 7. List All Production Tasks (Paginated)

**Endpoint:** `GET /production-tasks?page=1&perPage=20`

**Query Parameters:**
- `page` (int, default: 1)
- `perPage` (int, default: 20)
- `sourceType` (string, optional): STOCK, POS_ORDER, SALES_ORDER, MANUAL
- `taskType` (string, optional): KITCHEN, BAR, COFFEE, ASSEMBLY, PREP, BULK, CUSTOM
- `status` (string, optional): PENDING, QUEUED, IN_PROGRESS, COMPLETED, CANCELLED
- `search` (string, optional): Search by task number or item name

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Production tasks fetched successfully',
  data: [
    {
      productionTaskId: 'uuid',
      taskNumber: 'KT-001',
      sourceType: 'STOCK',
      taskType: 'PREP',
      status: 'PENDING',
      outputs: [
        {
          itemSku: {
            skuName: 'Nasi Goreng'
          },
          quantityPlanned: 50,
        }
      ],
      createdAt: '2025-11-27T06:00:00+07:00'
    },
  ],
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

---

### 6. Kitchen Display (Paginated)

**Endpoint:** `GET /production-tasks/kitchen/display?page=1&perPage=50&station=KITCHEN`

**Query Parameters:**
- `page` (int, default: 1)
- `perPage` (int, default: 50)
- `station` (string, optional): KITCHEN, BAR, COFFEE

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Kitchen display tasks fetched successfully',
  data: [
    {
      productionTaskId: 'uuid',
      taskNumber: 'KT-001',
      taskType: 'KITCHEN',
      station: 'KITCHEN',
      status: 'QUEUED',
      priority: 10,
      outputs: [
        {
          itemSku: {
            skuName: 'Nasi Goreng Special'
          },
          quantityPlanned: 1,
        }
      ],
      sourceOrder: {
        orderNumber: 'POS-001',
        tableNumber: 'A-05'
      },
      queuedAt: '2025-11-27T12:30:00+07:00'
    },
  ],
  meta: {
    page: 1,
    perPage: 50,
    from: 1,
    to: 15,
    total: 15,
    lastPage: 1,
    hasMore: false,
  }
}
```

---

### 7. My Tasks (Paginated)

**Endpoint:** `GET /production-tasks/my-tasks?page=1&perPage=20`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "My tasks fetched successfully",
  "data": [...],
  "meta": {
    "page": 1,
    "perPage": 20,
    "from": 1,
    "to": 10,
    "total": 10,
    "lastPage": 1,
    "hasMore": false
  }
}
```

---

### 8. Stock Production Tasks (Paginated)

**Endpoint:** `GET /production-tasks/stock?page=1&perPage=20`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Stock production tasks fetched successfully",
  "data": [...],
  "meta": {
    "page": 1,
    "perPage": 20,
    "from": null,
    "to": null,
    "total": 0,
    "lastPage": 1,
    "hasMore": false
  }
}
```

---

### 9. Get Production Task Detail

**Endpoint:** `GET /production-tasks/{productionTaskId}`

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    productionTaskId: 'uuid',
    taskNumber: 'KT-20251127-001',
    sourceType: 'STOCK',
    taskType: 'PREP',
    station: null,
    status: 'COMPLETED',
    priority: 0,
    productionBom: {
      productionBomId: 'uuid',
      bomName: 'Nasi Goreng Recipe'
    },
    inputs: [
      {
        inputId: 'uuid',
        itemSku: {
          skuCode: 'BERAS-001',
          skuName: 'Beras Premium'
        },
        quantityPlanned: 10,
        quantityUsed: 10,
        unit: 'kg'
      },
    ],
    outputs: [
      {
        outputId: 'uuid',
        itemSku: {
          skuCode: 'NASIGORENG-001',
          skuName: 'Nasi Goreng'
        },
        quantityPlanned: 50,
        quantityProduced: 48,
        quantityRejected: 2,
        unit: 'porsi',
        yieldPercentage: 96,
      }
    ],
    scheduledAt: '2025-11-27T06:00:00+07:00',
    startedAt: '2025-11-27T06:05:00+07:00',
    completedAt: '2025-11-27T08:00:00+07:00',
    assignedTo: {
      userId: 'uuid',
      name: 'Chef John'
    },
    completedBy: {
      userId: 'uuid',
      name: 'Chef John'
    },
  }
}
```

---

## 🎯 Common Response Formats

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {...}
}
```

### Error Response
```json
{
  success: false,
  message: 'Error message',
  errors: {
    field: ['Validation error message']
  },
}
```

### Pagination Meta
```json
{
  current_page: 1,
  per_page: 20,
  total: 150,
  last_page: 8,
  from: 1,
  to: 20,
}
```

---

## 📊 Status Enums

### Sales Order Status
- `DRAFT` - Initial state, can be edited
- `CONFIRMED` - Order confirmed, ready for production
- `IN_PRODUCTION` - Being produced
- `READY` - Ready for delivery
- `PARTIALLY_DELIVERED` - Some items delivered
- `DELIVERED` - All items delivered
- `COMPLETED` - Fully paid and delivered
- `CANCELLED` - Order cancelled

### Production Task Status
- `PENDING` - Scheduled, not started
- `QUEUED` - In queue (kitchen display)
- `IN_PROGRESS` - Currently being worked on
- `COMPLETED` - Finished successfully
- `CANCELLED` - Cancelled

### Delivery Status
- `PENDING` - Scheduled but not yet dispatched
- `IN_TRANSIT` - On the way to customer
- `DELIVERED` - Successfully delivered
- `FAILED` - Delivery failed
- `CANCELLED` - Delivery cancelled

### Payment Status
- `PENDING` - Payment expected but not received
- `CONFIRMED` - Payment received and confirmed
- `PARTIAL` - Partial payment received
- `REFUNDED` - Payment refunded
- `CANCELLED` - Payment cancelled

### Payment Methods
- `CASH` - Cash payment
- `TRANSFER` - Bank transfer
- `CARD` - Credit/Debit card
- `QRIS` - QRIS payment
- `E_WALLET` - E-wallet (GoPay, OVO, etc.)
- `COD` - Cash on delivery
- `CREDIT` - Credit terms

### Payment Terms
- `IMMEDIATE` - Pay immediately
- `NET_7` - Payment due in 7 days
- `NET_14` - Payment due in 14 days
- `NET_30` - Payment due in 30 days
- `NET_45` - Payment due in 45 days
- `NET_60` - Payment due in 60 days
- `COD` - Cash on delivery
- `CUSTOM` - Custom payment terms

### Source Types (Production)
- `STOCK` - Stock replenishment
- `POS_ORDER` - POS customer order
- `SALES_ORDER` - Sales order
- `MANUAL` - Manual production

### Task Types (Production)
- `KITCHEN` - F&B cooking
- `BAR` - Beverages
- `COFFEE` - Coffee station
- `ASSEMBLY` - Assembly/manufacturing
- `PREP` - Ingredient preparation
- `BULK` - Bulk production
- `CUSTOM` - Custom orders

### Production Types (BOM)
- `COOKING` - F&B cooking/preparation
- `ASSEMBLY` - Assembly/manufacturing
- `PROCESSING` - Food processing
- `PACKAGING` - Packaging operations
- `DISASSEMBLY` - Breaking down (e.g., whole chicken → parts)

### Station Types
- `KITCHEN` - Main kitchen
- `BAR` - Bar station
- `COFFEE` - Coffee station
- `GRILL` - Grill station
- `PASTRY` - Pastry/bakery station
- `PREP` - Prep station
- `ASSEMBLY` - Assembly line

---

## 📊 Status Enums (Bahasa Indonesia)

### Status Sales Order / Pesanan Penjualan
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `DRAFT` | **Draft** | Pesanan masih draft, dapat diedit |
| `CONFIRMED` | **Dikonfirmasi** | Pesanan dikonfirmasi, siap produksi |
| `IN_PRODUCTION` | **Dalam Produksi** | Sedang diproduksi |
| `READY` | **Siap Kirim** | Siap untuk dikirim |
| `PARTIALLY_DELIVERED` | **Terkirim Sebagian** | Sebagian item sudah dikirim |
| `DELIVERED` | **Terkirim** | Semua item sudah dikirim |
| `COMPLETED` | **Selesai** | Lunas dan terkirim semua |
| `CANCELLED` | **Dibatalkan** | Pesanan dibatalkan |

### Status Tugas Produksi
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `PENDING` | **Menunggu** | Terjadwal, belum dimulai |
| `QUEUED` | **Antrian** | Dalam antrian (tampilan dapur) |
| `IN_PROGRESS` | **Sedang Dikerjakan** | Sedang dalam pengerjaan |
| `COMPLETED` | **Selesai** | Selesai dengan sukses |
| `CANCELLED` | **Dibatalkan** | Dibatalkan |

### Status Pengiriman
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `PENDING` | **Menunggu** | Terjadwal tapi belum dikirim |
| `IN_TRANSIT` | **Dalam Perjalanan** | Sedang dalam perjalanan ke pelanggan |
| `DELIVERED` | **Terkirim** | Berhasil dikirim |
| `FAILED` | **Gagal** | Pengiriman gagal |
| `CANCELLED` | **Dibatalkan** | Pengiriman dibatalkan |

### Status Pembayaran
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `PENDING` | **Menunggu** | Pembayaran diharapkan tapi belum diterima |
| `CONFIRMED` | **Terkonfirmasi** | Pembayaran diterima dan dikonfirmasi |
| `PARTIAL` | **Sebagian** | Pembayaran sebagian diterima |
| `REFUNDED` | **Dikembalikan** | Pembayaran dikembalikan |
| `CANCELLED` | **Dibatalkan** | Pembayaran dibatalkan |

### Metode Pembayaran
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `CASH` | **Tunai** | Pembayaran tunai |
| `TRANSFER` | **Transfer Bank** | Transfer bank |
| `CARD` | **Kartu Kredit/Debit** | Kartu kredit/debit |
| `QRIS` | **QRIS** | Pembayaran QRIS |
| `E_WALLET` | **Dompet Digital** | E-wallet (GoPay, OVO, dll) |
| `COD` | **Bayar di Tempat** | Cash on delivery |
| `CREDIT` | **Kredit** | Termin kredit |

### Termin Pembayaran
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `IMMEDIATE` | **Segera** | Bayar segera |
| `NET_7` | **Net 7 Hari** | Jatuh tempo 7 hari |
| `NET_14` | **Net 14 Hari** | Jatuh tempo 14 hari |
| `NET_30` | **Net 30 Hari** | Jatuh tempo 30 hari |
| `NET_45` | **Net 45 Hari** | Jatuh tempo 45 hari |
| `NET_60` | **Net 60 Hari** | Jatuh tempo 60 hari |
| `COD` | **Bayar di Tempat** | Cash on delivery |
| `CUSTOM` | **Kustom** | Termin pembayaran kustom |

### Tipe Sumber Produksi
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `STOCK` | **Stok** | Pengisian ulang stok |
| `POS_ORDER` | **Pesanan POS** | Pesanan pelanggan POS |
| `SALES_ORDER` | **Pesanan Penjualan** | Pesanan penjualan |
| `MANUAL` | **Manual** | Produksi manual |

### Tipe Tugas Produksi
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `KITCHEN` | **Dapur** | Memasak F&B |
| `BAR` | **Bar** | Minuman |
| `COFFEE` | **Kopi** | Stasiun kopi |
| `ASSEMBLY` | **Perakitan** | Perakitan/manufaktur |
| `PREP` | **Persiapan** | Persiapan bahan |
| `BULK` | **Produksi Massal** | Produksi massal |
| `CUSTOM` | **Kustom** | Pesanan kustom |

### Tipe Produksi (BOM)
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `COOKING` | **Memasak** | Memasak/persiapan F&B |
| `ASSEMBLY` | **Perakitan** | Perakitan/manufaktur |
| `PROCESSING` | **Pengolahan** | Pengolahan makanan |
| `PACKAGING` | **Pengemasan** | Operasi pengemasan |
| `DISASSEMBLY` | **Pembongkaran** | Memecah (mis. ayam utuh → bagian) |

### Tipe Stasiun
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `KITCHEN` | **Dapur Utama** | Dapur utama |
| `BAR` | **Stasiun Bar** | Stasiun bar |
| `COFFEE` | **Stasiun Kopi** | Stasiun kopi |
| `GRILL` | **Stasiun Grill** | Stasiun grill |
| `PASTRY` | **Stasiun Pastry** | Stasiun pastry/bakery |
| `PREP` | **Stasiun Persiapan** | Stasiun persiapan |
| `ASSEMBLY` | **Lini Perakitan** | Lini perakitan |

### Tipe Pelanggan
| Kode | Label Indonesia | Keterangan |
|------|----------------|------------|
| `INDIVIDUAL` | **Perorangan** | Pelanggan perorangan |
| `CORPORATE` | **Perusahaan** | Pelanggan perusahaan |
| `RESELLER` | **Reseller** | Reseller/distributor |

---

## 👥 CUSTOMERS API

**Base URL:** `/customers`

### 1. Create Customer

**Endpoint:** `POST /customers`

**Request Body:**
```json
{
  customerName: 'PT. ABC Indonesia',
  customerType: 'CORPORATE',
  email: 'contact@abc.co.id',
  phone: '+6281234567890',
  address: 'Jl. Sudirman No. 123, Jakarta',
  city: 'Jakarta',
  province: 'DKI Jakarta',
  postalCode: '12345',
  taxId: '01.234.567.8-901.000',
  contactPerson: 'John Doe',
  contactPhone: '+6281234567891',
  paymentTerm: 'NET_30',
  creditLimit: 50000000,
  notes: 'VIP customer'
}
```

**Response:** `201 Created`
```json
{
  success: true,
  message: 'Customer created successfully',
  data: {
    customerId: 'uuid',
    customerCode: 'CUST-001',
    customerName: 'PT. ABC Indonesia',
    customerType: 'CORPORATE',
    email: 'contact@abc.co.id',
    phone: '+6281234567890',
    isActive: true,
    createdAt: '2025-11-27T10:00:00+07:00'
  },
}
```

---

### 2. Get Customer Detail

**Endpoint:** `GET /customers/{customerId}`

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    customerId: 'uuid',
    customerCode: 'CUST-001',
    customerName: 'PT. ABC Indonesia',
    customerType: 'CORPORATE',
    email: 'contact@abc.co.id',
    phone: '+6281234567890',
    address: 'Jl. Sudirman No. 123, Jakarta',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postalCode: '12345',
    taxId: '01.234.567.8-901.000',
    contactPerson: 'John Doe',
    contactPhone: '+6281234567891',
    paymentTerm: 'NET_30',
    creditLimit: 50000000,
    currentBalance: 15000000,
    isActive: true,
    totalOrders: 45,
    totalRevenue: 250000000,
    lastOrderDate: '2025-11-25T10:00:00+07:00',
    createdAt: '2025-11-01T10:00:00+07:00',
    updatedAt: '2025-11-27T10:00:00+07:00'
  },
}
```

---

### 3. List Customers (Paginated)

**Endpoint:** `GET /customers?page=1&perPage=20`

**Query Parameters:**
- `page` (int, default: 1)
- `perPage` (int, default: 20, max: 100)
- `customerType` (string, optional): INDIVIDUAL, CORPORATE, RESELLER
- `isActive` (boolean, optional)
- `search` (string, optional): Search by name, email, or phone

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Customers fetched successfully',
  data: [
    {
      customerId: 'uuid',
      customerCode: 'CUST-001',
      customerName: 'PT. ABC Indonesia',
      customerType: 'CORPORATE',
      email: 'contact@abc.co.id',
      phone: '+6281234567890',
      isActive: true,
      totalOrders: 45,
      currentBalance: 15000000,
    }
  ],
  meta: {
    page: 1,
    perPage: 20,
    from: 1,
    to: 20,
    total: 250,
    lastPage: 13,
    hasMore: true,
  }
}
```

---

### 4. Update Customer

**Endpoint:** `PUT /customers/{customerId}`

**Request Body:** (Same as Create)

**Response:** `200 OK`

---

### 5. Activate/Deactivate Customer

**Endpoint:** `PATCH /customers/{customerId}/status`

**Request Body:**
```json
{
  isActive: false,
  notes: 'Customer requested account suspension'
}
```

**Response:** `200 OK`

---

### 6. Get Customer Orders

**Endpoint:** `GET /customers/{customerId}/orders?page=1`

**Response:** `200 OK` (Same format as List Sales Orders)

---

### 7. Get Customer Balance

**Endpoint:** `GET /customers/{customerId}/balance`

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    customerId: 'uuid',
    customerName: 'PT. ABC Indonesia',
    creditLimit: 50000000,
    currentBalance: 15000000,
    availableCredit: 35000000,
    overdueAmount: 5000000,
    totalOrders: 45,
    paidOrders: 40,
    unpaidOrders: 5,
  },
}
```

---

## 📊 Production BOM Enums

**Base URL:** `/production`

Production BOM (Bill of Materials) defines recipes/formulas for production tasks.

### 1. Create Production BOM

**Endpoint:** `POST /production-boms`

**Request Body:**
```json
{
  bomCode: 'BOM-NASIGORENG-001',
  bomName: 'Nasi Goreng Special Recipe',
  description: 'Recipe for premium nasi goreng',
  baseQuantity: 1,
  baseUnit: 'porsi',
  productionType: 'COOKING',
  expectedYield: 100,
  expectedWaste: 5,
  prepTimeMinutes: 10,
  cookTimeMinutes: 15,
  isActive: true,
  effectiveFrom: '2025-11-27T00:00:00+07:00',
  inputs: [
    {
      itemSkuId: 'uuid-beras',
      quantity: 0.2,
      unit: 'kg',
      unitCost: 15000,
      wasteFactor: 2,
      isOptional: false,
      sortOrder: 1,
      notes: 'Use premium jasmine rice'
    },
    {
      itemSkuId: 'uuid-telur',
      quantity: 2,
      unit: 'pcs',
      unitCost: 3000,
      wasteFactor: 0,
      isOptional: false,
      sortOrder: 2,
    },
    {
      itemSkuId: 'uuid-bumbu',
      quantity: 0.05,
      unit: 'kg',
      unitCost: 50000,
      wasteFactor: 0,
      isOptional: false,
      sortOrder: 3,
    }
  ],
  outputs: [
    {
      itemSkuId: 'uuid-nasi-goreng',
      quantity: 1,
      unit: 'porsi',
      yieldPercentage: 100,
      sortOrder: 1,
      notes: 'Standard portion size'
    },
  ],
  notes: 'Standard recipe, can be scaled'
}
```

**Response:** `201 Created`
```json
{
  success: true,
  message: 'Production BOM created successfully',
  data: {
    productionBomId: 'uuid',
    bomCode: 'BOM-NASIGORENG-001',
    bomName: 'Nasi Goreng Special Recipe',
    baseQuantity: 1,
    baseUnit: 'porsi',
    productionType: 'COOKING',
    expectedYield: 100,
    expectedWaste: 5,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    totalInputCost: 21000,
    isActive: true,
    version: 1,
    inputs: [
      {
        bomInputId: 'uuid',
        itemSku: {
          itemSkuId: 'uuid-beras',
          skuCode: 'BERAS-001',
          skuName: 'Beras Premium'
        },
        quantity: 0.2,
        unit: 'kg',
        unitCost: 15000,
        totalCost: 3000,
        wasteFactor: 2,
        sortOrder: 1,
      }
    ],
    outputs: [
      {
        bomOutputId: 'uuid',
        itemSku: {
          itemSkuId: 'uuid-nasi-goreng',
          skuCode: 'NASIGORENG-001',
          skuName: 'Nasi Goreng Special'
        },
        quantity: 1,
        unit: 'porsi',
        yieldPercentage: 100,
        sortOrder: 1,
      }
    ],
    createdAt: '2025-11-27T10:00:00+07:00'
  },
}
```

---

### 2. Get Production BOM Detail

**Endpoint:** `GET /production-boms/{productionBomId}`

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    productionBomId: 'uuid',
    bomCode: 'BOM-NASIGORENG-001',
    bomName: 'Nasi Goreng Special Recipe',
    description: 'Recipe for premium nasi goreng',
    baseQuantity: 1,
    baseUnit: 'porsi',
    productionType: 'COOKING',
    expectedYield: 100,
    expectedWaste: 5,
    prepTimeMinutes: 10,
    cookTimeMinutes: 15,
    totalTimeMinutes: 25,
    totalInputCost: 21000,
    totalOutputCost: 21000,
    isActive: true,
    version: 1,
    effectiveFrom: '2025-11-27T00:00:00+07:00',
    effectiveTo: null,
    inputs: [
      {
        bomInputId: 'uuid',
        itemSku: {
          itemSkuId: 'uuid-beras',
          skuCode: 'BERAS-001',
          skuName: 'Beras Premium',
          currentStock: 100,
        },
        quantity: 0.2,
        unit: 'kg',
        unitCost: 15000,
        totalCost: 3000,
        wasteFactor: 2,
        isOptional: false,
        sortOrder: 1,
        notes: 'Use premium jasmine rice'
      },
    ],
    outputs: [
      {
        bomOutputId: 'uuid',
        itemSku: {
          itemSkuId: 'uuid-nasi-goreng',
          skuCode: 'NASIGORENG-001',
          skuName: 'Nasi Goreng Special'
        },
        quantity: 1,
        unit: 'porsi',
        yieldPercentage: 100,
        unitCost: 21000,
        totalCost: 21000,
        sortOrder: 1,
      }
    ],
    createdBy: {
      userId: 'uuid',
      name: 'Chef Manager'
    },
    createdAt: '2025-11-27T10:00:00+07:00',
    updatedAt: '2025-11-27T10:00:00+07:00'
  },
}
```

---

### 3. List Production BOMs (Paginated)

**Endpoint:** `GET /production-boms?page=1&perPage=20`

**Query Parameters:**
- `page` (int, default: 1)
- `perPage` (int, default: 20, max: 100)
- `isActive` (boolean, optional): Filter by active status
- `productionType` (string, optional): COOKING, ASSEMBLY, PROCESSING, PACKAGING, DISASSEMBLY
- `search` (string, optional): Search by BOM code or name
- `outputSkuId` (uuid, optional): Filter by output SKU

**Response:** `200 OK`
```json
{
  success: true,
  message: 'Production BOMs fetched successfully',
  data: [
    {
      productionBomId: 'uuid',
      bomCode: 'BOM-NASIGORENG-001',
      bomName: 'Nasi Goreng Special Recipe',
      baseQuantity: 1,
      baseUnit: 'porsi',
      productionType: 'COOKING',
      totalInputCost: 21000,
      isActive: true,
      version: 1,
      inputsCount: 3,
      outputsCount: 1,
    }
  ],
  meta: {
    page: 1,
    perPage: 20,
    from: 1,
    to: 20,
    total: 45,
    lastPage: 3,
    hasMore: true,
  }
}
```

---

### 4. Update Production BOM

**Endpoint:** `PUT /production-boms/{productionBomId}`

**Request Body:** (Same as Create)

**Response:** `200 OK`

**Note:** Updating a BOM will increment the version number and can optionally set effectiveTo for the old version.

---

### 5. Activate/Deactivate BOM

**Endpoint:** `PATCH /production-boms/{productionBomId}/status`

**Request Body:**
```json
{
  isActive: false,
  notes: 'Replaced by new recipe version'
}
```

**Response:** `200 OK`

---

### 6. Get Active BOM for Item

**Endpoint:** `GET /production-boms/active/{itemSkuId}`

**Description:** Get currently active BOM for a specific output SKU

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "productionBomId": "uuid",
    "bomName": "Nasi Goreng Special Recipe",
    "inputs": [...],
    "outputs": [...]
  }
}
```

---

### 7. Calculate BOM Cost

**Endpoint:** `POST /production-boms/{productionBomId}/calculate-cost`

**Request Body:**
```json
{
  quantity: 50,
}
```

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    quantity: 50,
    baseQuantity: 1,
    multiplier: 50,
    totalInputCost: 1050000,
    costPerUnit: 21000,
    inputs: [
      {
        itemSku: {
          skuName: 'Beras Premium'
        },
        quantityNeeded: 10,
        unit: 'kg',
        totalCost: 150000,
      }
    ],
  }
}
```

---

### 8. Clone BOM (Create New Version)

**Endpoint:** `POST /production-boms/{productionBomId}/clone`

**Request Body:**
```json
{
  bomName: 'Nasi Goreng Special Recipe v2',
  notes: 'Updated recipe with new ingredients'
}
```

**Response:** `201 Created`

---

### 9. BOM Usage History

**Endpoint:** `GET /production-boms/{productionBomId}/usage?page=1`

**Description:** Get production tasks that used this BOM

**Response:** `200 OK`
```json
{
  success: true,
  message: 'BOM usage history fetched successfully',
  data: [
    {
      productionTaskId: 'uuid',
      taskNumber: 'KT-001',
      quantityPlanned: 50,
      status: 'COMPLETED',
      createdAt: '2025-11-27T06:00:00+07:00'
    },
  ],
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

---

## 📊 Production BOM Enums

### Production Types
- `COOKING` - F&B cooking/preparation
- `ASSEMBLY` - Assembly/manufacturing
- `PROCESSING` - Food processing
- `PACKAGING` - Packaging operations
- `DISASSEMBLY` - Breaking down (e.g., whole chicken → parts)

---

## 💡 BOM Usage Examples

### Example 1: Simple Recipe (1 Output)
```json
{
  bomName: 'Nasi Goreng Recipe',
  baseQuantity: 1,
  inputs: [
    { "itemSkuId": 'beras', quantity: 0.2, unit: 'kg'},
    { "itemSkuId": 'telur', quantity: 2, unit: 'pcs'}
  ],
  outputs: [
    { "itemSkuId": 'nasi-goreng', quantity: 1, unit: 'porsi'}
  ],
}
```

### Example 2: Disassembly (Multiple Outputs)
```json
{
  bomName: 'Ayam Utuh Breakdown',
  baseQuantity: 1,
  productionType: 'DISASSEMBLY',
  inputs: [
    { "itemSkuId": 'ayam-utuh', quantity: 1, unit: 'ekor'}
  ],
  outputs: [
    { "itemSkuId": 'ayam-dada', quantity: 2, unit: 'pcs'},
    { "itemSkuId": 'ayam-paha', quantity: 2, unit: 'pcs'},
    { "itemSkuId": 'ayam-sayap', quantity: 2, unit: 'pcs'}
  ],
}
```

### Example 3: Batch Production (Scaled Recipe)
```json
{
  bomName: 'Nasi Kotak Batch 100pcs',
  baseQuantity: 100,
  productionType: 'ASSEMBLY',
  inputs: [
    { "itemSkuId": 'beras', quantity: 20, unit: 'kg'},
    { "itemSkuId": 'ayam', quantity: 100, unit: 'pcs'}
  ],
  outputs: [
    { "itemSkuId": 'nasi-kotak-a', quantity: 50, unit: 'box'},
    { "itemSkuId": 'nasi-kotak-b', quantity: 30, unit: 'box'},
    { "itemSkuId": 'nasi-kotak-c', quantity: 20, unit: 'box'}
  ],
}
```

---


## 📊 REPORTS & ANALYTICS API

**Base URL:** `/reports`

### 1. Sales Dashboard

**Endpoint:** `GET /reports/sales-dashboard`

**Query Parameters:**
- `dateFrom` (date, optional): Start date
- `dateTo` (date, optional): End date
- `period` (string, optional): TODAY, WEEK, MONTH, YEAR

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    period: {
      from: '2025-11-01',
      to: '2025-11-27'
    },
    summary: {
      totalOrders: 145,
      totalRevenue: 125000000,
      totalProfit: 45000000,
      averageOrderValue: 862068,
      completedOrders: 120,
      pendingOrders: 15,
      cancelledOrders: 10,
    },
    topProducts: [
      {
        itemSkuId: 'uuid',
        skuName: 'Nasi Goreng Special',
        quantitySold: 450,
        revenue: 22500000,
      }
    ],
    topCustomers: [
      {
        customerId: 'uuid',
        customerName: 'PT. ABC Indonesia',
        totalOrders: 25,
        totalRevenue: 35000000,
      }
    ],
    revenueByDay: [
      {
        date: '2025-11-01',
        revenue: 4500000,
        orders: 12,
      }
    ],
  },
}
```

---

### 2. Production Dashboard

**Endpoint:** `GET /reports/production-dashboard`

**Query Parameters:**
- `dateFrom` (date, optional)
- `dateTo` (date, optional)
- `period` (string, optional): TODAY, WEEK, MONTH, YEAR

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    summary: {
      totalTasks: 250,
      completedTasks: 200,
      inProgressTasks: 30,
      pendingTasks: 20,
      averageCompletionTime: 45, // minutes
      totalYield: 95.5, // percentage
    },
    tasksByType: [
      {
        taskType: 'KITCHEN',
        count: 120,
        completionRate: 96,
      }
    ],
    tasksByStation: [
      {
        station: 'KITCHEN',
        count: 85,
        avgTime: 35,
      }
    ],
    productionByDay: [
      {
        date: '2025-11-01',
        tasksCompleted: 25,
        itemsProduced: 450,
      }
    ],
  },
}
```

---

### 3. Inventory Impact Report

**Endpoint:** `GET /reports/inventory-impact`

**Query Parameters:**
- `dateFrom` (date, optional)
- `dateTo` (date, optional)

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    topConsumedItems: [
      {
        itemSkuId: 'uuid',
        skuName: 'Beras Premium',
        quantityUsed: 150,
        unit: 'kg',
        totalCost: 2250000,
      }
    ],
    lowStockAlerts: [
      {
        itemSkuId: 'uuid',
        skuName: 'Telur',
        currentStock: 50,
        minStock: 100,
        unit: 'pcs',
      }
    ],
  },
}
```

---

### 4. Customer Analytics

**Endpoint:** `GET /reports/customer-analytics`

**Query Parameters:**
- `customerId` (uuid, optional): Specific customer
- `dateFrom` (date, optional)
- `dateTo` (date, optional)

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    totalCustomers: 250,
    activeCustomers: 180,
    newCustomers: 25,
    customerRetentionRate: 85.5,
    topCustomers: [...],
    customersByType: [
      {
        customerType: 'CORPORATE',
        count: 120,
        revenue: 85000000,
      }
    ],
  },
}
```

---

### 5. Financial Summary

**Endpoint:** `GET /reports/financial-summary`

**Query Parameters:**
- `dateFrom` (date, optional)
- `dateTo` (date, optional)
- `period` (string, optional): TODAY, WEEK, MONTH, YEAR

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    revenue: {
      total: 125000000,
      paid: 100000000,
      unpaid: 25000000,
    },
    costs: {
      materials: 60000000,
      labor: 15000000,
      overhead: 5000000,
    },
    profit: {
      gross: 65000000,
      net: 45000000,
      margin: 36,
    },
    paymentsByMethod: [
      {
        paymentMethod: 'TRANSFER',
        count: 85,
        amount: 75000000,
      }
    ],
  },
}
```

---

### 6. BOM Cost Analysis

**Endpoint:** `GET /reports/bom-cost-analysis`

**Query Parameters:**
- `productionBomId` (uuid, optional)
- `dateFrom` (date, optional)
- `dateTo` (date, optional)

**Response:** `200 OK`
```json
{
  success: true,
  data: {
    bomAnalysis: [
      {
        productionBomId: 'uuid',
        bomName: 'Nasi Goreng Recipe',
        timesUsed: 50,
        totalCost: 1050000,
        averageYield: 96.5,
        costPerUnit: 21000,
      }
    ],
    costTrends: [
      {
        date: '2025-11-01',
        averageCost: 21500,
      }
    ],
  },
}
```

---

## 🔐 Authentication

All endpoints require JWT authentication:

```bash
curl -X GET https://api.example.com/sales/sales-orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 📋 API Summary

### Sales Orders Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sales-orders` | Create new sales order |
| GET | `/sales-orders/{id}` | Get order detail |
| GET | `/sales-orders` | List orders (paginated) |
| PUT | `/sales-orders/{id}` | Update order |
| DELETE | `/sales-orders/{id}` | Delete order |
| POST | `/sales-orders/{id}/confirm` | Confirm order |
| POST | `/sales-orders/{id}/cancel` | Cancel order |
| GET | `/sales-orders/today` | Today's orders |
| GET | `/sales-orders/pending-production` | Orders pending production |
| GET | `/sales-orders/in-production` | Orders in production |
| GET | `/sales-orders/ready-for-delivery` | Orders ready for delivery |
| GET | `/sales-orders/unpaid` | Unpaid orders |

### Deliveries Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sales-orders/{id}/deliveries` | Create delivery |
| GET | `/deliveries/{id}` | Get delivery detail |
| GET | `/deliveries` | List deliveries (paginated) |
| PUT | `/deliveries/{id}` | Update delivery |
| POST | `/deliveries/{id}/cancel` | Cancel delivery |

### Payments Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sales-orders/{id}/payments` | Record payment |
| GET | `/payments/{id}` | Get payment detail |
| GET | `/payments` | List payments (paginated) |
| POST | `/payments/{id}/cancel` | Cancel payment |

### Production Tasks Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/production-tasks` | Create production task |
| GET | `/production-tasks/{id}` | Get task detail |
| GET | `/production-tasks` | List tasks (paginated) |
| PUT | `/production-tasks/{id}` | Update task |
| POST | `/production-tasks/{id}/start` | Start task |
| PATCH | `/production-tasks/{id}/progress` | Update progress |
| POST | `/production-tasks/{id}/complete` | Complete task |
| POST | `/production-tasks/{id}/cancel` | Cancel task |
| GET | `/production-tasks/kitchen/display` | Kitchen display |
| GET | `/production-tasks/my-tasks` | My assigned tasks |
| GET | `/production-tasks/stock` | Stock production tasks |

### Production BOM Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/production-boms` | Create BOM |
| GET | `/production-boms/{id}` | Get BOM detail |
| GET | `/production-boms` | List BOMs (paginated) |
| PUT | `/production-boms/{id}` | Update BOM |
| PATCH | `/production-boms/{id}/status` | Activate/Deactivate BOM |
| GET | `/production-boms/active/{skuId}` | Get active BOM for item |
| POST | `/production-boms/{id}/calculate-cost` | Calculate BOM cost |
| POST | `/production-boms/{id}/clone` | Clone BOM |
| GET | `/production-boms/{id}/usage` | BOM usage history |

### Customers Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create customer |
| GET | `/customers/{id}` | Get customer detail |
| GET | `/customers` | List customers (paginated) |
| PUT | `/customers/{id}` | Update customer |
| PATCH | `/customers/{id}/status` | Activate/Deactivate customer |
| GET | `/customers/{id}/orders` | Get customer orders |
| GET | `/customers/{id}/balance` | Get customer balance |

### Reports & Analytics Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/sales-dashboard` | Sales dashboard data |
| GET | `/reports/production-dashboard` | Production dashboard data |
| GET | `/reports/inventory-impact` | Inventory impact report |
| GET | `/reports/customer-analytics` | Customer analytics |
| GET | `/reports/financial-summary` | Financial summary |
| GET | `/reports/bom-cost-analysis` | BOM cost analysis |

---

## 📝 Notes

1. All dates are in ISO 8601 format with timezone
2. All monetary values are in smallest currency unit (e.g., cents for USD, rupiah for IDR)
3. UUIDs are used for all IDs
4. Pagination is available on all list endpoints
5. Filtering and sorting can be added via query parameters

### Pagination Format

All paginated endpoints return data in this format:

```json
{
  "success": true,
  "message": "Data fetched successfully",
  "data": [...],
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

**Meta Fields:**
- `page`: Current page number
- `perPage`: Items per page
- `from`: First item number on current page (null if no data)
- `to`: Last item number on current page (null if no data)
- `total`: Total number of items
- `lastPage`: Total number of pages
- `hasMore`: Boolean indicating if there are more pages

---

**Last Updated:** 2025-11-27
