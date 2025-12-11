import SalesModel from '@/models/sales/SalesModel'
import type { OrderReturn } from '@/types/models/sales/order-return'

class OrderReturnModel extends SalesModel<OrderReturn> {
  resource() {
    return 'sales-returns'
  }
}

export default OrderReturnModel
