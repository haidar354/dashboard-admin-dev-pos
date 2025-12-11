import SalesModel from '@/models/sales/SalesModel'
import type { Invoice } from '@/types/models/sales/invoice'

class InvoiceModel extends SalesModel<Invoice> {
  resource() {
    return 'invoices'
  }
}

export default InvoiceModel
