import SalesModel from '@/models/sales/SalesModel'
import type { SalesChannel } from '@/types/models/sales/salesChannel'

class SalesChannelModel extends SalesModel<SalesChannel> {
  resource() {
    return 'sales-channels'
  }
}

export default SalesChannelModel
