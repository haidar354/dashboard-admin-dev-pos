import SalesModel from '@/models/sales/SalesModel'
import type { Customer } from '@/types/models/sales/customer'

class CustomerModel extends SalesModel<Customer> {
  resource() {
    return 'customers'
  }
}

export default CustomerModel
