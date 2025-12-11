import SalesModel from '@/models/sales/SalesModel'
import type { SalesQuotation } from '@/types/models/sales/quotation'

class SalesQuotationModel extends SalesModel<SalesQuotation> {
  resource() {
    return 'quotations'
  }
}
export default SalesQuotationModel
