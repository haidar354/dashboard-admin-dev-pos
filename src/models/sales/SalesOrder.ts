import SalesModel from '@/models/sales/SalesModel'
import type { SalesOrder } from '@/types/models/sales/sales-order'

class SalesOrderModel extends SalesModel<SalesOrder> {
  resource() {
    return 'sales-orders'
  }
}
export default SalesOrderModel
