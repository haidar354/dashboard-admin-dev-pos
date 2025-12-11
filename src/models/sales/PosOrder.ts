import SalesModel from '@/models/sales/SalesModel'
import type { Order } from '@/types/models/sales/order'

class PosOrderModel extends SalesModel<Order> {
  resource() {
    return 'pos-orders'
  }
}
export default PosOrderModel
