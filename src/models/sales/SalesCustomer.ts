import SalesModel from '@/models/sales/SalesModel'
import type { Customer } from '@/stores/sales/customerStore'

class SalesCustomerModel extends SalesModel<Customer> {
  resource() {
    return 'customers'
  }
}
export default SalesCustomerModel
